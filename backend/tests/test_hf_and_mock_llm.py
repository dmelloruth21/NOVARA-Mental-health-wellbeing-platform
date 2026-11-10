"""
tests/test_hf_and_mock_llm.py
──────────────────────────────
Test suite verifying:
  1. Hugging Face token verification & error detection (401 Unauthorized handling).
  2. Offline Mock LLM generation across diverse conversational intents & languages.
  3. Offline Crisis Severity Evaluation (ESCALATE on real crisis, IGNORE on false alarms).
  4. Resilient fallback mechanism when Hugging Face API is unauthenticated or offline.
  5. End-to-end chat_logic execution without Model error / 401 crashes.
  6. Post-generation safety validation of mock replies.
"""

import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_dir))

from src.app.llm_client import (
    MockInferenceClient,
    ResilientLLMClient,
    verify_hf_token,
    get_llm_status,
)
from src.rag.safety import check_post_generation, evaluate_crisis_severity
from src.app.service import chat_logic


def test_verify_hf_token_missing():
    """Empty or missing token should report 'missing'."""
    res = verify_hf_token("")
    assert res["valid"] is False
    assert res["status"] == "missing"


def test_verify_hf_token_invalid():
    """An invalid token should report 'unauthorized' (HTTP 401)."""
    res = verify_hf_token("hf_InvalidTokenXYZ123456789")
    assert res["valid"] is False
    assert res["status"] == "unauthorized"
    assert "401" in res["message"] or "invalid" in res["message"].lower()


def test_mock_client_greetings():
    """Mock client returns a warm, friendly greeting with an emoji."""
    client = MockInferenceClient()
    resp = client.chat_completion(messages=[{"role": "user", "content": "Hello!"}])
    reply = resp.choices[0].message.content
    assert len(reply) > 5
    safe, issues = check_post_generation(reply)
    assert safe is True, f"Safety issues in greeting: {issues}"


def test_mock_client_exam_stress():
    """Mock client provides empathetic study pacing / break advice."""
    client = MockInferenceClient()
    resp = client.chat_completion(messages=[
        {"role": "user", "content": "I am so overwhelmed with my exams and syllabus"}
    ])
    reply = resp.choices[0].message.content
    assert any(w in reply.lower() for w in ["exam", "syllabus", "chunk", "break", "best"])
    safe, issues = check_post_generation(reply)
    assert safe is True, f"Safety issues in exam reply: {issues}"


def test_mock_client_anxiety_grounding():
    """Mock client provides calm breathing / grounding reassurance."""
    client = MockInferenceClient()
    resp = client.chat_completion(messages=[
        {"role": "user", "content": "I feel so anxious and my heart is racing"}
    ])
    reply = resp.choices[0].message.content
    assert any(w in reply.lower() for w in ["breath", "pause", "spiraling", "feelings"])
    safe, issues = check_post_generation(reply)
    assert safe is True, f"Safety issues in anxiety reply: {issues}"


def test_mock_client_language_hindi():
    """Mock client responds in Hinglish when addressed in Hindi/Hinglish."""
    client = MockInferenceClient()
    resp = client.chat_completion(messages=[
        {"role": "user", "content": "Yaar bohot tension ho rahi hai exam ki"}
    ])
    reply = resp.choices[0].message.content
    assert any(w in reply.lower() for w in ["yaar", "stress", "sambhal", "load", "saans"])
    safe, issues = check_post_generation(reply)
    assert safe is True, f"Safety issues in Hindi reply: {issues}"


def test_mock_client_language_marathi():
    """Mock client responds in Marathi Minglish when addressed in Marathi."""
    client = MockInferenceClient()
    resp = client.chat_completion(messages=[
        {"role": "user", "content": "Kasa ahes? Mala khup tras hoto ahe"}
    ])
    reply = resp.choices[0].message.content
    assert any(w in reply.lower() for w in ["arey", "tras", "shant", "ahe", "chaha"])
    safe, issues = check_post_generation(reply)
    assert safe is True, f"Safety issues in Marathi reply: {issues}"


def test_mock_crisis_evaluation_genuine():
    """Mock client flags genuine suicidal expression for escalation."""
    client = MockInferenceClient()
    is_crisis, summary = evaluate_crisis_severity(client, "I want to kill myself, I cannot take this anymore", [])
    assert is_crisis is True
    assert len(summary) > 5


def test_mock_crisis_evaluation_false_alarm():
    """Mock client ignores false alarms / testing expressions."""
    client = MockInferenceClient()
    is_crisis, _ = evaluate_crisis_severity(client, "I want to kill myself lol just kidding testing the bot", [])
    assert is_crisis is False


def test_resilient_client_fallback_on_401():
    """
    ResilientLLMClient with an invalid token catches 401 and falls back to
    MockInferenceClient without raising an unhandled exception or returning raw error.
    """
    client = ResilientLLMClient(token="hf_InvalidBadToken401Test")
    resp = client.chat_completion(messages=[{"role": "user", "content": "Hey Elora"}])
    reply = resp.choices[0].message.content
    assert "Model error" not in reply
    assert "401" not in reply
    assert len(reply) > 5


def test_chat_logic_end_to_end_no_401_crash():
    """
    chat_logic executes full pipeline (router -> retriever -> prompt -> generation -> safety)
    and returns a clean, empathetic response even when HF token is invalid (401).
    """
    reply = chat_logic("Hey Elora, I've had a really exhausting day at college.", [])
    assert isinstance(reply, str)
    assert "Model error: Client error '401 Unauthorized'" not in reply
    assert len(reply) > 20
    safe, issues = check_post_generation(reply)
    assert safe is True, f"Safety issues in end-to-end reply: {issues}"


def test_get_llm_status_structure():
    """Verifies that get_llm_status returns expected telemetry keys."""
    status = get_llm_status()
    assert "model_name" in status
    assert "mock_mode_forced" in status
    assert "token_configured" in status
    assert "active_mode" in status


if __name__ == "__main__":
    print("Running Hugging Face & Mock LLM test suite...")
    test_verify_hf_token_missing()
    print("  ✓ test_verify_hf_token_missing passed")

    test_verify_hf_token_invalid()
    print("  ✓ test_verify_hf_token_invalid passed")

    test_mock_client_greetings()
    print("  ✓ test_mock_client_greetings passed")

    test_mock_client_exam_stress()
    print("  ✓ test_mock_client_exam_stress passed")

    test_mock_client_anxiety_grounding()
    print("  ✓ test_mock_client_anxiety_grounding passed")

    test_mock_client_language_hindi()
    print("  ✓ test_mock_client_language_hindi passed")

    test_mock_client_language_marathi()
    print("  ✓ test_mock_client_language_marathi passed")

    test_mock_crisis_evaluation_genuine()
    print("  ✓ test_mock_crisis_evaluation_genuine passed")

    test_mock_crisis_evaluation_false_alarm()
    print("  ✓ test_mock_crisis_evaluation_false_alarm passed")

    test_resilient_client_fallback_on_401()
    print("  ✓ test_resilient_client_fallback_on_401 passed")

    test_chat_logic_end_to_end_no_401_crash()
    print("  ✓ test_chat_logic_end_to_end_no_401_crash passed")

    test_get_llm_status_structure()
    print("  ✓ test_get_llm_status_structure passed")

    print("\n🎉 ALL 12 Hugging Face & Mock LLM unit tests PASSED successfully!")

