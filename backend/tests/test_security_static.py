"""
tests/test_security_static.py
──────────────────────────────
Automated security test suite verifying that path traversal / directory traversal
attacks against the static file serving endpoint are strictly blocked with 403 Forbidden.
"""

from fastapi.testclient import TestClient
from src.app.chat_api import app

client = TestClient(app)

def test_static_serves_index_html():
    """Verify normal requests can fetch index.html."""
    response = client.get("/")
    assert response.status_code == 200
    assert "<!doctype html>" in response.text.lower() or "<html" in response.text.lower()


def test_static_spa_fallback():
    """Verify SPA client-side routes fall back to index.html with 200 OK."""
    response = client.get("/dashboard")
    assert response.status_code == 200
    assert "<!doctype html>" in response.text.lower() or "<html" in response.text.lower()


def test_path_traversal_encoded_env_blocked():
    """Verify URL-encoded path traversal attacks to root .env are rejected with 403."""
    response = client.get("/..%2f..%2f.env")
    assert response.status_code == 403
    assert response.json() == {"detail": "Access denied"}


def test_path_traversal_encoded_firebase_key_blocked():
    """Verify URL-encoded attempts to fetch firebase-key.json are rejected with 403."""
    response = client.get("/..%2f..%2fbackend%2ffirebase-key.json")
    assert response.status_code == 403
    assert response.json() == {"detail": "Access denied"}


def test_path_traversal_encoded_git_config_blocked():
    """Verify URL-encoded attempts to fetch .git/config are rejected with 403."""
    response = client.get("/..%2f..%2f.git%2fconfig")
    assert response.status_code == 403
    assert response.json() == {"detail": "Access denied"}


def test_unencoded_dot_dot_never_serves_secret_file():
    """
    HTTP clients normalize /../../.env to /.env.
    Verify that even if requested without encoding, it returns SPA index.html, NEVER the secret .env.
    """
    response = client.get("/../../.env")
    assert response.status_code == 200
    # Must be index.html, not .env contents
    assert "HUGGINGFACE_API_TOKEN" not in response.text
    assert "FIREBASE_PROJECT_ID" not in response.text
    assert "<!doctype html>" in response.text.lower() or "<html" in response.text.lower()
