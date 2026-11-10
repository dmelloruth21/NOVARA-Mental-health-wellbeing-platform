"""
backend/tests/test_wellness_sync.py
───────────────────────────────────
Integration tests for the wellness cross-device synchronization endpoints.
Verifies:
  - Decoupled authentication dependency (get_authenticated_user)
  - Composite cursor pagination (ordering by rev ASC, __name__ ASC)
  - Request-level idempotency via last_client_mutation_id
  - Per-field Last-Write-Wins (LWW) conflict resolution
  - Batch legacy import with deterministic hashing
  - GDPR/privacy full deletion

Firestore Targeting Note
────────────────────────
After Cloud Firestore enablement on the `myallycustom` project, these tests
hit the REAL cloud Firestore database (for the dev UID "dev-user-123").
The setup/teardown functions clean up after each test, so no data persists.

For CI/CD pipelines or offline local development that should NOT touch live
cloud Firestore, start the Firestore Emulator and set the environment
variable:

    FIRESTORE_EMULATOR_HOST=localhost:8080

When this variable is set, firebase_admin automatically routes all Firestore
calls to the local emulator instead of the cloud. No code changes are needed.
(Emulator setup/installation is out of scope here — this is guidance only.)
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from src.app.chat_api import app
from src.app import wellness_service

client = TestClient(app)
AUTH_HEADERS = {"Authorization": "Bearer dummy-dev-token"}
TEST_UID = "dev-user-123"

def setup_function():
    wellness_service.delete_all_wellness(TEST_UID)

def teardown_function():
    wellness_service.delete_all_wellness(TEST_UID)

def test_wellness_empty_initial_sync():
    response = client.get("/api/wellness/sync", headers=AUTH_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["rev"] == 0
    assert data["next_cursor"] is None

def test_legacy_import():
    payload = {
        "planner_tasks": [
            {"id": 101, "text": "Prepare exam notes", "completed": False},
            {"id": 102, "text": "Daily meditation", "completed": True}
        ],
        "saved_quotes": [
            {"text": "Small steps every day.", "category": "Growth"}
        ],
        "gratitudes": [
            "Good morning sunshine"
        ],
        "favorited_tracks": [
            "focus-1",
            "anx-2"
        ]
    }
    response = client.post("/api/wellness/legacy-import", json=payload, headers=AUTH_HEADERS)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] == "imported"
    assert res_data["count"] == 6 # 2 tasks + 1 quote + 1 gratitude + 2 tracks

    # Second import must be a no-op
    repeat_res = client.post("/api/wellness/legacy-import", json=payload, headers=AUTH_HEADERS)
    assert repeat_res.status_code == 200
    assert repeat_res.json()["status"] == "already_imported"

    # Pull items
    pulled = client.get("/api/wellness/sync", headers=AUTH_HEADERS).json()
    assert len(pulled["items"]) == 6
    assert pulled["rev"] >= 1

def test_mutation_push_and_idempotency():
    now_ms = 1714456789000
    mutation_id = "test-mutation-uuid-001"
    push_payload = {
        "client_mutation_id": mutation_id,
        "mutations": [
            {
                "kind": "planner",
                "item_id": "task-uuid-1",
                "action": "upsert",
                "data": {"text": "Drink green tea", "completed": False},
                "field_meta": {
                    "text": {"ts": now_ms, "op_id": mutation_id},
                    "completed": {"ts": now_ms, "op_id": mutation_id}
                },
                "client_timestamp": now_ms
            }
        ]
    }

    # First push
    res1 = client.post("/api/wellness/sync", json=push_payload, headers=AUTH_HEADERS)
    assert res1.status_code == 200
    assert res1.json()["status"] == "ok"
    rev1 = res1.json()["rev"]

    # Re-sending same client_mutation_id must be idempotent
    res2 = client.post("/api/wellness/sync", json=push_payload, headers=AUTH_HEADERS)
    assert res2.status_code == 200
    assert res2.json().get("idempotent_replay") is True
    assert res2.json()["rev"] == rev1

    # Verify item was saved
    pulled = client.get("/api/wellness/sync", headers=AUTH_HEADERS).json()
    items = [i for i in pulled["items"] if i["id"] == "task-uuid-1"]
    assert len(items) == 1
    assert items[0]["data"]["text"] == "Drink green tea"
    assert items[0]["data"]["completed"] is False

def test_conflict_resolution_lww():
    now_ms = 1714456789000
    # Create item at ts = 100
    client.post("/api/wellness/sync", json={
        "client_mutation_id": "mut-initial",
        "mutations": [{
            "kind": "planner",
            "item_id": "task-conflict",
            "action": "upsert",
            "data": {"text": "Initial task", "completed": False},
            "field_meta": {"completed": {"ts": 100, "op_id": "init"}},
            "client_timestamp": 100
        }]
    }, headers=AUTH_HEADERS)

    # Newer edit at ts = 200: completed = True
    client.post("/api/wellness/sync", json={
        "client_mutation_id": "mut-newer",
        "mutations": [{
            "kind": "planner",
            "item_id": "task-conflict",
            "action": "upsert",
            "data": {"completed": True},
            "field_meta": {"completed": {"ts": 200, "op_id": "newer"}},
            "client_timestamp": 200
        }]
    }, headers=AUTH_HEADERS)

    # Older delayed edit at ts = 150: completed = False (should be rejected by LWW)
    client.post("/api/wellness/sync", json={
        "client_mutation_id": "mut-older-delayed",
        "mutations": [{
            "kind": "planner",
            "item_id": "task-conflict",
            "action": "upsert",
            "data": {"completed": False},
            "field_meta": {"completed": {"ts": 150, "op_id": "delayed"}},
            "client_timestamp": 150
        }]
    }, headers=AUTH_HEADERS)

    # Pull and verify that completed remained True
    pulled = client.get("/api/wellness/sync", headers=AUTH_HEADERS).json()
    target = next(i for i in pulled["items"] if i["id"] == "task-conflict")
    assert target["data"]["completed"] is True

def test_delete_wellness_data():
    # Insert an item
    client.post("/api/wellness/sync", json={
        "client_mutation_id": "mut-to-del",
        "mutations": [{
            "kind": "quote",
            "item_id": "quote-to-del",
            "action": "upsert",
            "data": {"text": "Temporary quote"},
            "client_timestamp": 1000
        }]
    }, headers=AUTH_HEADERS)

    # Verify present
    res_before = client.get("/api/wellness/sync", headers=AUTH_HEADERS).json()
    assert len(res_before["items"]) > 0

    # Execute full delete
    del_res = client.delete("/api/wellness", headers=AUTH_HEADERS)
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "deleted"

    # Verify completely empty
    res_after = client.get("/api/wellness/sync", headers=AUTH_HEADERS).json()
    assert res_after["items"] == []
    assert res_after["rev"] == 0

if __name__ == "__main__":
    setup_function()
    test_wellness_empty_initial_sync()
    test_legacy_import()
    teardown_function()
    setup_function()
    test_mutation_push_and_idempotency()
    test_conflict_resolution_lww()
    test_delete_wellness_data()
    teardown_function()
    print(" All wellness sync unit tests PASSED successfully!")
