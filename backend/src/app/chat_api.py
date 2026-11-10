"""
src/app/chat_api.py
────────────────────
FastAPI backend for Elora chat.
Serves the static HTML/CSS/JS frontend and exposes a /chat POST endpoint.
"""
from __future__ import annotations

from pathlib import Path

from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uuid
from typing import Optional

from src.app.service import chat_logic
from src.app.auth import get_current_user, get_authenticated_user
from src.app import wellness_service
from src.app.wellness_service import SyncPushRequest, LegacyImportRequest
from . import vector_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # No SQL DB to initialize anymore
    yield

app = FastAPI(title="Elora Mental-Health Support", lifespan=lifespan)

# Serve everything inside frontend/dist
_STATIC_DIR = Path(__file__).resolve().parents[3] / "frontend" / "dist"

class OnboardingRequest(BaseModel):
    nickname: str = None
    gender: str = None
    preferred_tone: str = None
    support_style: str = None
    lifestyle_patterns: str = None
    support_network: str = None
    education: str = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None # If None, creates a new session

# ── LLM Pipeline & Health API ───────────────────────────────────────────
@app.get("/api/llm/status")
async def get_llm_status_endpoint():
    """Returns the operational status of the LLM pipeline (mock vs live)."""
    from src.app.llm_client import get_llm_status
    return get_llm_status()

@app.get("/api/llm/verify")
async def verify_llm_auth_endpoint():
    """Verifies Hugging Face credentials and returns detailed diagnostics."""
    from src.app.llm_client import verify_hf_token
    return verify_hf_token()

# ── User API ──────────────────────────────────────────────────────────────
@app.get("/api/user/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    return user

@app.post("/api/user/onboarding")
async def save_onboarding(req: OnboardingRequest, user: dict = Depends(get_current_user)):
    profile_data = req.dict(exclude_unset=True)
    updated_user = vector_db.save_user_profile(user["uid"], profile_data)
    return {"status": "success", "user": updated_user}

# ── Chat API ──────────────────────────────────────────────────────────────

@app.get("/api/chats")
async def get_chat_sessions(user: dict = Depends(get_current_user)):
    sessions = vector_db.get_user_sessions(user["uid"])
    return {"sessions": sessions}

@app.get("/api/chats/{session_id}")
async def get_chat_history(session_id: str, user: dict = Depends(get_current_user)):
    session = vector_db.get_session(session_id, user["uid"])
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    messages = vector_db.get_chat_history(session_id)
    return {"session_id": session_id, "title": session["title"], "messages": messages}

@app.post("/chat")
async def chat(req: ChatRequest, user: dict = Depends(get_current_user)):
    print(f"📥 Received chat request: {req}")
    try:
        if not req.session_id:
            # Create new session
            title = "Chat: " + req.message[:20] + "..." if len(req.message) > 20 else "Chat: " + req.message
            session = vector_db.create_chat_session(user["uid"], title)
            session_id = session["id"]
        else:
            session_id = req.session_id
            session = vector_db.get_session(session_id, user["uid"])
            if not session:
                raise HTTPException(status_code=404, detail="Session not found")

        # Save user message to DB
        vector_db.add_chat_message(session_id, role="user", content=req.message)

        # Build history format expected by logic: list of [user_msg, bot_msg] pairs
        full_history = vector_db.get_chat_history(session_id)
        
        history_pairs = []
        current_pair = [None, None]
        # Exclude the message we just added for the 'history' argument to chat_logic
        for m in full_history[:-1]: 
            if m["role"] == "user":
                if current_pair[0] is not None:
                    history_pairs.append(current_pair)
                    current_pair = [None, None]
                current_pair[0] = m["content"]
            elif m["role"] == "bot":
                current_pair[1] = m["content"]
                history_pairs.append(current_pair)
                current_pair = [None, None]
        if current_pair[0] is not None or current_pair[1] is not None:
            history_pairs.append(current_pair)

        # Call logic
        reply = chat_logic(req.message, history_pairs, user_profile=user, today=datetime.utcnow())
        
        # Save bot message to DB
        vector_db.add_chat_message(session_id, role="bot", content=reply)
        
        return {"reply": reply, "session_id": session_id}
    except Exception as exc:
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(exc)})


# ── Wellness Cross-Device Synchronization Endpoints ────────────────────────

@app.get("/api/wellness/sync")
async def get_wellness_sync(
    since_rev: int = 0,
    cursor_id: Optional[str] = None,
    limit: int = 500,
    user: dict = Depends(get_authenticated_user),
):
    """
    Pulls user wellness items (planner, quotes, gratitudes, tracks)
    using composite cursor pagination (rev + doc_id).
    """
    return wellness_service.pull_sync(
        uid=user["uid"],
        since_rev=since_rev,
        cursor_id=cursor_id,
        limit=limit,
    )


@app.post("/api/wellness/sync")
async def post_wellness_sync(
    req: SyncPushRequest,
    user: dict = Depends(get_authenticated_user),
):
    """
    Applies incoming wellness mutations with Last-Write-Wins and request idempotency.
    """
    return wellness_service.push_sync(uid=user["uid"], req=req)


@app.post("/api/wellness/legacy-import")
async def post_legacy_import(
    req: LegacyImportRequest,
    user: dict = Depends(get_authenticated_user),
):
    """
    One-time migration of unauthenticated browser localStorage items.
    """
    return wellness_service.legacy_import(uid=user["uid"], req=req)


@app.delete("/api/wellness")
async def delete_wellness(
    user: dict = Depends(get_authenticated_user),
):
    """
    Deletes all user wellness data and tombstones for privacy compliance.
    """
    return wellness_service.delete_all_wellness(uid=user["uid"])


# ── Admin/Counselor Endpoints ──────────────────────────────────────────────

@app.get("/api/admin/alerts")
async def get_alerts():
    """Fetches all crisis alerts for the counselor."""
    from src.app import counselor_service
    alerts = counselor_service.get_all_alerts()
    return {"alerts": alerts}


@app.post("/api/admin/resolve/{alert_id}")
async def resolve_alert(alert_id: str):
    """Marks a crisis alert as resolved."""
    from src.app import counselor_service
    success = counselor_service.resolve_alert(alert_id)
    if success:
        return {"status": "success"}
    return JSONResponse(status_code=404, content={"error": "Alert not found"})


# Serve frontend/dist files
@app.get("/{file_path:path}")
async def serve_static(file_path: str):
    # Try to serve specific file (like login-mockup.png)
    full_path = _STATIC_DIR / file_path
    if full_path.exists() and full_path.is_file():
        return FileResponse(str(full_path))
    
    # Otherwise fallback to index.html (SPA support)
    return FileResponse(str(_STATIC_DIR / "index.html"))


if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
