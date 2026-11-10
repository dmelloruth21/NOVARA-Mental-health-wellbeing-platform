"""
backend/src/app/wellness_service.py
───────────────────────────────────
Wellness cross-device synchronization engine for Elora.
Supports Google Cloud Firestore as the primary production database with an
automatic zero-dependency local JSON fallback for offline / local testing
(e.g., when the Cloud Firestore API is disabled or credentials are not yet linked).

Features:
  - Subcollection architecture: wellness/{uid}/items/{kind}:{item_id}
  - Composite cursor pagination (rev + document ID) to prevent skipped records
  - Request-level idempotency via last_client_mutation_id
  - Per-field Last-Write-Wins (LWW) conflict resolution with clock skew protection
  - Safe legacy import with deterministic hashing and batching (<=400 per chunk)
  - Full GDPR/privacy recursive batch deletion
"""

from __future__ import annotations

import hashlib
import json
import os
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

# ── Pydantic Request & Response Schemas ────────────────────────────────────────

class FieldMeta(BaseModel):
    ts: int
    op_id: Optional[str] = ""

class WellnessMutation(BaseModel):
    kind: str # 'planner', 'quote', 'gratitude', 'track'
    item_id: str
    action: str # 'upsert' or 'delete'
    data: Optional[Dict[str, Any]] = None
    field_meta: Optional[Dict[str, Dict[str, Any]]] = None
    client_timestamp: int

class SyncPushRequest(BaseModel):
    client_mutation_id: str
    mutations: List[WellnessMutation]

class LegacyImportRequest(BaseModel):
    planner_tasks: Optional[List[Dict[str, Any]]] = None
    saved_quotes: Optional[List[Dict[str, Any]]] = None
    gratitudes: Optional[List[str]] = None
    favorited_tracks: Optional[List[str]] = None

class WellnessItem(BaseModel):
    id: str
    kind: str
    data: Dict[str, Any]
    field_meta: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    rev: int = 0
    deleted: bool = False
    updated_at: int = 0


# ── Local File-Based Storage Engine (Zero-Dependency Fallback) ──────────────────

LOCAL_DB_DIR = Path(__file__).resolve().parents[3] / "database" / "wellness_local"

class LocalWellnessStore:
    """
    Robust local document store implementing the exact same schema and semantics
    as Firestore: wellness/{uid} metadata doc and wellness/{uid}/items subcollection.
    Used for local dev and testing when Firestore API is disabled or credentials are offline.
    """
    def __init__(self, base_dir: Path = LOCAL_DB_DIR):
        self.base_dir = base_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _user_dir(self, uid: str) -> Path:
        p = self.base_dir / uid
        p.mkdir(parents=True, exist_ok=True)
        return p

    def _meta_path(self, uid: str) -> Path:
        return self._user_dir(uid) / "metadata.json"

    def _items_dir(self, uid: str) -> Path:
        p = self._user_dir(uid) / "items"
        p.mkdir(parents=True, exist_ok=True)
        return p

    def get_metadata(self, uid: str) -> dict:
        p = self._meta_path(uid)
        if p.exists():
            try:
                with open(p, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {
            "rev": 0,
            "last_synced_at": None,
            "last_client_mutation_id": None,
            "legacy_imported": False,
        }

    def save_metadata(self, uid: str, meta: dict):
        p = self._meta_path(uid)
        with open(p, "w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)

    def get_item(self, uid: str, full_id: str) -> Optional[dict]:
        safe_name = full_id.replace(":", "__") + ".json"
        p = self._items_dir(uid) / safe_name
        if p.exists():
            try:
                with open(p, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return None

    def save_item(self, uid: str, full_id: str, item_doc: dict):
        safe_name = full_id.replace(":", "__") + ".json"
        p = self._items_dir(uid) / safe_name
        with open(p, "w", encoding="utf-8") as f:
            json.dump(item_doc, f, indent=2)

    def list_all_items(self, uid: str) -> List[dict]:
        d = self._items_dir(uid)
        items = []
        for p in d.glob("*.json"):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    items.append(json.load(f))
            except Exception:
                continue
        return items

    def delete_all(self, uid: str):
        d = self._user_dir(uid)
        if d.exists():
            import shutil
            shutil.rmtree(d, ignore_errors=True)


# ── Cloud Firestore Engine ─────────────────────────────────────────────────────

# Free Tier Limits (Spark plan): 50,000 reads/day, 20,000 writes/day,
# 20,000 deletes/day, 1 GiB stored data. Monitor usage in the Firebase Console
# (Usage tab) if operating at scale; the local JSON fallback has no such limits.
#
# Rollback / Disablement: If Cloud Firestore becomes unreachable or needs to
# be disabled, the backend automatically falls back to local JSON storage
# (database/wellness_local/{uid}/) via LocalWellnessStore with zero downtime
# and no code changes. The probe in get_firestore_client() below detects this
# on the first wellness request and caches the result for the process lifetime.

_firestore_client = None
_firestore_checked = False
_firestore_available = False

def get_firestore_client():
    """
    Attempts to acquire the Firestore client via firebase_admin.
    Checks connectivity once; if the Cloud Firestore API is disabled or
    unavailable, gracefully falls back to the LocalWellnessStore.
    """
    global _firestore_client, _firestore_checked, _firestore_available
    if _firestore_checked:
        return _firestore_client if _firestore_available else None

    try:
        import firebase_admin
        from firebase_admin import firestore
        if not firebase_admin._apps:
            from src.app import auth
        if firebase_admin._apps:
            client = firestore.client()
            # Quick probe to test if Firestore API is enabled on project
            test_doc = client.collection("_health_probe").document("ping")
            test_doc.get()
            _firestore_client = client
            _firestore_available = True
            print(" Connected to Cloud Firestore for wellness sync.")
    except Exception as exc:
        _firestore_available = False
        print(f"⚠️ Cloud Firestore unavailable ({exc}). Using local wellness fallback for dev.")
    finally:
        _firestore_checked = True

    return _firestore_client if _firestore_available else None


# ── Unified Service Operations ─────────────────────────────────────────────────

_local_store = LocalWellnessStore()

def pull_sync(uid: str, since_rev: int = 0, cursor_id: Optional[str] = None, limit: int = 500) -> dict:
    """
    Fetches items with rev > since_rev using composite cursor pagination
    (ordering by rev ASC, document ID ASC).
    """
    now_ms = int(time.time() * 1000)
    fs_db = get_firestore_client()

    if fs_db:
        try:
            meta_ref = fs_db.collection("wellness").document(uid)
            meta_snap = meta_ref.get()
            current_rev = meta_snap.get("rev") if meta_snap.exists else 0

            items_ref = meta_ref.collection("items")
            query = items_ref.order_by("rev").order_by("__name__")

            if since_rev > 0:
                if cursor_id:
                    cursor_doc = items_ref.document(cursor_id).get()
                    if cursor_doc.exists:
                        query = query.start_after(cursor_doc)
                    else:
                        query = query.where("rev", ">=", since_rev)
                else:
                    query = query.where("rev", ">", since_rev)

            query = query.limit(limit)
            docs = list(query.stream())

            items = []
            for d in docs:
                item_data = d.to_dict()
                item_data["full_id"] = d.id
                items.append(item_data)

            next_cursor = None
            if len(items) == limit:
                last_item = items[-1]
                next_cursor = {"rev": last_item.get("rev", 0), "id": last_item.get("full_id", "")}

            return {
                "items": items,
                "next_cursor": next_cursor,
                "server_time": now_ms,
                "rev": current_rev,
            }
        except Exception as e:
            print(f"Firestore pull error: {e}. Falling back to local store.")

    # Local fallback
    meta = _local_store.get_metadata(uid)
    all_items = _local_store.list_all_items(uid)

    # Filter items rev > since_rev, sorted by rev ASC, full_id ASC
    qualifying = [item for item in all_items if item.get("rev", 0) >= since_rev]
    qualifying.sort(key=lambda x: (x.get("rev", 0), x.get("full_id", "")))

    if cursor_id:
        idx = -1
        for i, item in enumerate(qualifying):
            if item.get("full_id") == cursor_id:
                idx = i
                break
        if idx >= 0:
            qualifying = qualifying[idx + 1:]
    elif since_rev > 0:
        qualifying = [item for item in qualifying if item.get("rev", 0) > since_rev]

    paged = qualifying[:limit]
    next_cursor = None
    if len(paged) == limit and len(qualifying) > limit:
        last = paged[-1]
        next_cursor = {"rev": last.get("rev", 0), "id": last.get("full_id", "")}

    return {
        "items": paged,
        "next_cursor": next_cursor,
        "server_time": now_ms,
        "rev": meta.get("rev", 0),
    }


def push_sync(uid: str, req: SyncPushRequest) -> dict:
    """
    Applies incoming mutations with:
      - Request-level idempotency via client_mutation_id
      - Last-Write-Wins (LWW) conflict resolution per field
      - Clock skew protection (clamping drift > 60s)
      - Atomic revision increment
    """
    now_ms = int(time.time() * 1000)
    now_iso = datetime.utcnow().isoformat()
    fs_db = get_firestore_client()

    # 1. Clock skew protection
    for mut in req.mutations:
        if abs(mut.client_timestamp - now_ms) > 60000:
            mut.client_timestamp = now_ms

    if fs_db:
        try:
            meta_ref = fs_db.collection("wellness").document(uid)
            meta_snap = meta_ref.get()
            meta = meta_snap.to_dict() if meta_snap.exists else {"rev": 0, "last_client_mutation_id": None}

            # Idempotency check
            if meta.get("last_client_mutation_id") == req.client_mutation_id:
                return {
                    "status": "ok",
                    "rev": meta.get("rev", 0),
                    "server_time": now_ms,
                    "idempotent_replay": True,
                }

            new_rev = meta.get("rev", 0) + 1
            batch = fs_db.batch()
            items_ref = meta_ref.collection("items")

            for mut in req.mutations:
                full_id = f"{mut.kind}:{mut.item_id}"
                doc_ref = items_ref.document(full_id)
                doc_snap = doc_ref.get()
                existing = doc_snap.to_dict() if doc_snap.exists else None

                existing_data = existing.get("data", {}) if existing else {}
                existing_meta = existing.get("field_meta", {}) if existing else {}

                if mut.action == "upsert":
                    incoming_data = mut.data or {}
                    incoming_meta = mut.field_meta or {}

                    # LWW per field
                    for k, val in incoming_data.items():
                        in_ts = incoming_meta.get(k, {}).get("ts", mut.client_timestamp)
                        ex_ts = existing_meta.get(k, {}).get("ts", 0)
                        if in_ts >= ex_ts:
                            existing_data[k] = val
                            existing_meta[k] = {
                                "ts": in_ts,
                                "op_id": incoming_meta.get(k, {}).get("op_id", req.client_mutation_id)
                            }

                    item_payload = {
                        "id": mut.item_id,
                        "kind": mut.kind,
                        "full_id": full_id,
                        "data": existing_data,
                        "field_meta": existing_meta,
                        "rev": new_rev,
                        "deleted": False,
                        "updated_at": now_ms,
                    }
                    batch.set(doc_ref, item_payload)

                elif mut.action == "delete":
                    del_ts = mut.client_timestamp
                    ex_del_ts = existing_meta.get("deleted", {}).get("ts", 0)
                    if del_ts >= ex_del_ts:
                        existing_meta["deleted"] = {
                            "ts": del_ts,
                            "op_id": req.client_mutation_id
                        }
                        item_payload = {
                            "id": mut.item_id,
                            "kind": mut.kind,
                            "full_id": full_id,
                            "data": existing_data,
                            "field_meta": existing_meta,
                            "rev": new_rev,
                            "deleted": True,
                            "updated_at": now_ms,
                        }
                        batch.set(doc_ref, item_payload)

            # Update metadata
            meta_update = {
                "rev": new_rev,
                "last_synced_at": now_iso,
                "last_client_mutation_id": req.client_mutation_id,
            }
            batch.set(meta_ref, meta_update, merge=True)
            batch.commit()

            return {
                "status": "ok",
                "rev": new_rev,
                "server_time": now_ms,
            }
        except Exception as e:
            print(f"Firestore push error: {e}. Falling back to local store.")

    # Local Fallback
    meta = _local_store.get_metadata(uid)
    if meta.get("last_client_mutation_id") == req.client_mutation_id:
        return {
            "status": "ok",
            "rev": meta.get("rev", 0),
            "server_time": now_ms,
            "idempotent_replay": True,
        }

    new_rev = meta.get("rev", 0) + 1

    for mut in req.mutations:
        full_id = f"{mut.kind}:{mut.item_id}"
        existing = _local_store.get_item(uid, full_id)
        existing_data = existing.get("data", {}) if existing else {}
        existing_meta = existing.get("field_meta", {}) if existing else {}

        if mut.action == "upsert":
            incoming_data = mut.data or {}
            incoming_meta = mut.field_meta or {}
            for k, val in incoming_data.items():
                in_ts = incoming_meta.get(k, {}).get("ts", mut.client_timestamp)
                ex_ts = existing_meta.get(k, {}).get("ts", 0)
                if in_ts >= ex_ts:
                    existing_data[k] = val
                    existing_meta[k] = {
                        "ts": in_ts,
                        "op_id": incoming_meta.get(k, {}).get("op_id", req.client_mutation_id)
                    }

            item_payload = {
                "id": mut.item_id,
                "kind": mut.kind,
                "full_id": full_id,
                "data": existing_data,
                "field_meta": existing_meta,
                "rev": new_rev,
                "deleted": False,
                "updated_at": now_ms,
            }
            _local_store.save_item(uid, full_id, item_payload)

        elif mut.action == "delete":
            del_ts = mut.client_timestamp
            ex_del_ts = existing_meta.get("deleted", {}).get("ts", 0)
            if del_ts >= ex_del_ts:
                existing_meta["deleted"] = {
                    "ts": del_ts,
                    "op_id": req.client_mutation_id
                }
                item_payload = {
                    "id": mut.item_id,
                    "kind": mut.kind,
                    "full_id": full_id,
                    "data": existing_data,
                    "field_meta": existing_meta,
                    "rev": new_rev,
                    "deleted": True,
                    "updated_at": now_ms,
                }
                _local_store.save_item(uid, full_id, item_payload)

    meta["rev"] = new_rev
    meta["last_synced_at"] = now_iso
    meta["last_client_mutation_id"] = req.client_mutation_id
    _local_store.save_metadata(uid, meta)

    return {
        "status": "ok",
        "rev": new_rev,
        "server_time": now_ms,
    }


def legacy_import(uid: str, req: LegacyImportRequest) -> dict:
    """
    Migrates unauthenticated browser localStorage items with deterministic IDs.
    Batching <= 400 writes to respect Firestore transaction bounds.
    """
    now_ms = int(time.time() * 1000)
    fs_db = get_firestore_client()

    meta = None
    if fs_db:
        meta_ref = fs_db.collection("wellness").document(uid)
        meta_snap = meta_ref.get()
        if meta_snap.exists and meta_snap.get("legacy_imported"):
            return {"status": "already_imported", "count": 0}
    else:
        meta = _local_store.get_metadata(uid)
        if meta.get("legacy_imported"):
            return {"status": "already_imported", "count": 0}

    items_to_import: List[dict] = []

    # 1. Planner tasks
    if req.planner_tasks:
        for t in req.planner_tasks:
            t_id = str(t.get("id", ""))
            if not t_id:
                continue
            full_id = f"planner:{t_id}"
            items_to_import.append({
                "id": t_id,
                "kind": "planner",
                "full_id": full_id,
                "data": {
                    "text": t.get("text", ""),
                    "completed": bool(t.get("completed", False)),
                },
                "field_meta": {
                    "text": {"ts": now_ms, "op_id": "legacy_import"},
                    "completed": {"ts": now_ms, "op_id": "legacy_import"},
                },
                "rev": 1,
                "deleted": False,
                "updated_at": now_ms,
            })

    # 2. Saved quotes
    if req.saved_quotes:
        for q in req.saved_quotes:
            text = q.get("text", "").strip()
            if not text:
                continue
            q_id = hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]
            full_id = f"quote:{q_id}"
            items_to_import.append({
                "id": q_id,
                "kind": "quote",
                "full_id": full_id,
                "data": {
                    "text": text,
                    "category": q.get("category", "General"),
                },
                "field_meta": {
                    "text": {"ts": now_ms, "op_id": "legacy_import"},
                    "category": {"ts": now_ms, "op_id": "legacy_import"},
                },
                "rev": 1,
                "deleted": False,
                "updated_at": now_ms,
            })

    # 3. Gratitudes
    if req.gratitudes:
        for g in req.gratitudes:
            text = str(g).strip()
            if not text:
                continue
            g_id = hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]
            full_id = f"gratitude:{g_id}"
            items_to_import.append({
                "id": g_id,
                "kind": "gratitude",
                "full_id": full_id,
                "data": {"text": text},
                "field_meta": {"text": {"ts": now_ms, "op_id": "legacy_import"}},
                "rev": 1,
                "deleted": False,
                "updated_at": now_ms,
            })

    # 4. Favorited tracks
    if req.favorited_tracks:
        for tid in req.favorited_tracks:
            tid_clean = str(tid).strip()
            if not tid_clean:
                continue
            full_id = f"track:{tid_clean}"
            items_to_import.append({
                "id": tid_clean,
                "kind": "track",
                "full_id": full_id,
                "data": {"track_id": tid_clean, "favorited": True},
                "field_meta": {"favorited": {"ts": now_ms, "op_id": "legacy_import"}},
                "rev": 1,
                "deleted": False,
                "updated_at": now_ms,
            })

    total_count = len(items_to_import)

    if fs_db:
        try:
            # Batch writes in chunks of 400
            chunk_size = 400
            for i in range(0, total_count, chunk_size):
                chunk = items_to_import[i:i + chunk_size]
                batch = fs_db.batch()
                for item in chunk:
                    doc_ref = meta_ref.collection("items").document(item["full_id"])
                    batch.set(doc_ref, item)
                batch.commit()

            meta_ref.set({
                "rev": 1,
                "last_synced_at": datetime.utcnow().isoformat(),
                "legacy_imported": True,
            }, merge=True)

            return {"status": "imported", "count": total_count, "rev": 1}
        except Exception as e:
            print(f"Firestore legacy import error: {e}. Falling back to local store.")

    # Local fallback
    for item in items_to_import:
        _local_store.save_item(uid, item["full_id"], item)

    local_meta = _local_store.get_metadata(uid)
    local_meta["rev"] = max(local_meta.get("rev", 0), 1)
    local_meta["last_synced_at"] = datetime.utcnow().isoformat()
    local_meta["legacy_imported"] = True
    _local_store.save_metadata(uid, local_meta)

    return {"status": "imported", "count": total_count, "rev": local_meta["rev"]}


def delete_all_wellness(uid: str) -> dict:
    """
    Recursively deletes all wellness items and metadata for GDPR/privacy compliance.
    """
    fs_db = get_firestore_client()
    if fs_db:
        try:
            meta_ref = fs_db.collection("wellness").document(uid)
            items_ref = meta_ref.collection("items")
            # Chunk delete in batches of 400
            while True:
                docs = list(items_ref.limit(400).stream())
                if not docs:
                    break
                batch = fs_db.batch()
                for d in docs:
                    batch.delete(d.reference)
                batch.commit()

            meta_ref.delete()
        except Exception as e:
            print(f"Firestore delete error: {e}")

    _local_store.delete_all(uid)
    return {"status": "deleted"}

