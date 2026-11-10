"""
src/app/llm_client.py
──────────────────────
Resilient LLM Client manager with automatic fallback and offline mock mode.

Features:
  1. Hugging Face InferenceClient wrapper with transparent error handling.
  2. Automatic 401 Unauthorized / expired token detection and offline switch.
  3. Offline Mock LLM mode for seamless local development without external APIs.
  4. Context-aware generation respecting Nova persona (warm, chill, Indian student context, 1-2 emojis).
  5. Built-in support for safety crisis severity evaluation in both live and offline modes.
  6. Token verification helper and health status reporting.
"""

from __future__ import annotations

import os
import re
import random
from pathlib import Path
from typing import Any, Optional
from dotenv import load_dotenv

# Ensure root .env is loaded
_root_env = Path(__file__).resolve().parents[3] / ".env"
load_dotenv(dotenv_path=_root_env)

# Configuration
HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN", "").strip()
MODEL_NAME = os.getenv("HF_MODEL_NAME", "Qwen/Qwen2.5-7B-Instruct")
MOCK_LLM_MODE = os.getenv("MOCK_LLM_MODE", "false").lower() in ("true", "1", "yes")

# Global authentication & status cache
_hf_auth_status: Optional[bool] = None  # None = unverified, True = ok, False = invalid
_hf_auth_detail: str = "Unverified"
_logged_status: bool = False


# ── Mock Response Structures (OpenAI / HuggingFace compatible) ────────────────

class MockMessage:
    def __init__(self, content: str, role: str = "assistant"):
        self.content = content
        self.role = role


class MockChoice:
    def __init__(self, content: str):
        self.message = MockMessage(content)


class MockChatCompletionResponse:
    def __init__(self, content: str):
        self.choices = [MockChoice(content)]


# ── Offline Mock LLM Generator ────────────────────────────────────────────────

class MockInferenceClient:
    """
    Offline mock LLM client that generates empathetic, context-aware responses
    matching Nova's persona without making any network calls.
    """

    def __init__(self, model: str = MODEL_NAME):
        self.model = model

    def chat_completion(
        self,
        messages: list[dict],
        max_tokens: int = 250,
        temperature: float = 0.7,
        **kwargs: Any,
    ) -> MockChatCompletionResponse:
        """Emulates InferenceClient.chat_completion() interface."""
        if not messages:
            return MockChatCompletionResponse("Hey! How can I help you today? 😊")

        first_msg = messages[0].get("content", "")
        last_msg = messages[-1].get("content", "")

        # ── Check if this is a Crisis Severity Evaluation request from safety.py ──
        if "You are a crisis evaluation system" in first_msg:
            return self._handle_crisis_evaluation(last_msg)

        # ── Regular Chat Generation ───────────────────────────────────────────
        reply = self._generate_chat_reply(messages)
        return MockChatCompletionResponse(reply)

    def _handle_crisis_evaluation(self, prompt: str) -> MockChatCompletionResponse:
        """
        Evaluates crisis severity offline. Checks whether high-risk signals
        are genuine extreme distress vs joking/testing/homework.
        """
        # Extract user message portion from the evaluation prompt
        user_part = prompt
        if "Latest Message:" in prompt:
            user_part = prompt.split("Latest Message:")[-1].split("\n")[0].strip()

        user_lower = user_part.lower()

        # Check for false-alarm / testing qualifiers using whole word boundaries
        is_false_alarm = bool(re.search(
            r"\b(just kidding|jk|test|testing|game|lol jk|joking|sarcasm|homework|exam question|quote|movie)\b",
            user_lower
        ))

        # Look for explicit suicidal intent in prompt or user text
        has_crisis_signal = bool(re.search(
            r"\b(kill myself|want to die|end my life|suicide|commit suicide|take my life|can't go on|cant go on|better off dead)\b",
            user_lower
        ))

        if has_crisis_signal and not is_false_alarm:
            summary = f"User expressed critical distress and potential self-harm intent: {user_part}"
            return MockChatCompletionResponse(f"ESCALATE\n\n{summary}")
        else:
            return MockChatCompletionResponse("IGNORE")

    def _generate_chat_reply(self, messages: list[dict]) -> str:
        """Generates a warm, friend-like response following Nova's persona."""
        user_message = messages[-1].get("content", "").strip()
        user_lower = user_message.lower()

        # Extract system prompt context (e.g. knowledge snippets, profile)
        system_text = messages[0].get("content", "") if len(messages) > 1 else ""

        # Language Detection: Marathi Minglish, Hindi/Hinglish, or English
        marathi_markers = ["kasa ahes", "tras", "aaj mast", "mala", "kiti", "bhau", "sang", "chal", "kay challay"]
        hindi_markers = ["yaar", "bohot", "tension", "dimag", "kya karu", "nahi", "batao", "suno", "bhai", "lag raha", "kuch"]

        is_marathi = any(m in user_lower for m in marathi_markers)
        is_hindi = any(h in user_lower for h in hindi_markers)

        # ── 1. Marathi Minglish Responses ─────────────────────────────────────
        if is_marathi:
            if re.search(r"\b(tras|tension|exam|stress|abhyas)\b", user_lower):
                return "Arey, khup tras hoto ka exams cha? 📚 Ekdum sagla karaycha prayatna nako karu. Thoda thoda kar ani madhe chaha pi. Tu naki karshil 💪."
            if re.search(r"\b(hi|hello|hey|kasa|ahes)\b", user_lower):
                return "Arey hey! 😊 Kasa ahes? Aajcha divas kasa challay?"
            return "Me ahe na ithe aikayla 🫂. Thoda shant ho ani sang kay zalay."

        # ── 2. Hindi / Hinglish Responses ─────────────────────────────────────
        if is_hindi:
            if re.search(r"\b(exam|stress|tension|syllabus|padhai)\b", user_lower):
                return "Yaar, exam ka stress sach me bohot exhausting hota hai 📚. Ek saath sab kuch mat socho — bas agle aadhe ghante ek topic uthao, fir 5 min ka break lo. Tu sambhal lega, load mat le 💪."
            if re.search(r"\b(anxiety|dar|darr|overthink)\b", user_lower):
                return "Ek gehri saans le mere saath 🫂. 4 second andar, 4 second hold, aur dheere se bahar. Itna overthink mat kar, main yahin hoon sunne ke liye."
            if re.search(r"\b(hi|hello|hey|kaisa|kaise|kese)\b", user_lower):
                return "Hey! 😊 Kaisa hai? Sab theek chal raha hai?"
            return "Sun, main yahin hoon tere saath 🫂. Jo bhi dimag me chal raha hai, bol de. Sab theek ho jayega."

        # ── 3. English Responses ──────────────────────────────────────────────

        # Small Talk / Casual acknowledgments
        if user_lower in ["ok", "okay", "cool", "nice", "lol", "haha", "wow", "great", "thanks", "thank you"]:
            casual_replies = [
                "haha ikr 😄",
                "glad to hear that! 😊",
                "anytime! I'm always right here if you need to talk 🫂",
                "yess, exactly! ✨",
                "cool cool! How's the rest of your day looking? 😊"
            ]
            return random.choice(casual_replies)

        # Greetings
        if re.search(r"^(hi|hello|hey|yo|sup|good morning|good evening|namaste)(\b|[!.,?])", user_lower):
            greetings = [
                "Hey! 😊 Good to hear from you. How are you holding up today?",
                "Hey there! ✨ What's on your mind right now?",
                "Hey! 😊 Hope your day is going okay. How are things?"
            ]
            return random.choice(greetings)

        # Bot identity / questions about Nova
        if any(w in user_lower for w in ["who are you", "what are you", "what can you do", "introduce yourself"]):
            return (
                "I'm Nova, your wellness ally and friend! 😊 Think of me as a chill, 24/7 college buddy "
                "you can talk to whenever you're stressed, feeling overwhelmed, or just need to vent. "
                "I'm always right here for you 🫂."
            )

        if any(w in user_lower for w in ["how are you", "how are you doing", "how r u"]):
            return "I'm doing well, thank you for asking! 😊 More importantly, how are you feeling today?"

        # Exam / Academic Stress
        if any(w in user_lower for w in ["exam", "exams", "study", "studying", "syllabus", "assignment", "grades", "marks", "college", "test", "fail", "deadline"]):
            return (
                "Exam pressure can feel so overwhelming, especially when the syllabus piles up 📚. "
                "Try not to look at the entire mountain at once. Pick just one manageable chunk for the next "
                "25 minutes, then give yourself a breather — no screens, just grab water or stretch ☕. "
                "You're doing the best you can, and that counts for a lot 💪."
            )

        # Anxiety / Panic / Overthinking
        if any(w in user_lower for w in ["anxious", "anxiety", "panic", "overthinking", "nervous", "scared", "worried", "heart racing", "overwhelmed", "spiraling"]):
            return (
                "Hey, let's take a slow pause together right now 🫂. Place a hand on your chest and take a "
                "gentle, deep breath in for 4 seconds... hold for 4... and release slowly for 4. "
                "When your mind starts spiraling, remember that feelings aren't permanent facts. "
                "What's the main thought that's feeling heaviest right now?"
            )

        # Loneliness / Relationships
        if any(w in user_lower for w in ["lonely", "alone", "no friends", "friend", "fight", "breakup", "relationship", "left out", "isolated", "nobody"]):
            return (
                "Feeling disconnected or lonely in college really stings, and it's completely valid that it's getting to you 🫂. "
                "Please know you aren't invisible, and your feelings matter. "
                "I'm right here listening — want to tell me what's been happening?"
            )

        # Sleep / Insomnia / Burnout
        if any(w in user_lower for w in ["sleep", "insomnia", "tired", "exhausted", "can't sleep", "awake", "burnout", "drained"]):
            return (
                "Late nights when sleep just won't come are so frustrating 🌙. "
                "Instead of forcing yourself to sleep, maybe turn down the lights, put the phone aside, "
                "and do a quick body scan — unclamp your jaw and drop your shoulders. "
                "Let your body rest even if your mind is still unwinding ☕."
            )

        # Coping Techniques / Factual Knowledge
        if any(w in user_lower for w in ["coping", "technique", "grounding", "exercise", "breathe", "strategy", "help me relax", "calm down"]):
            return (
                "Here's a quick grounding exercise that works wonders when things feel too intense: the 5-4-3-2-1 technique ✨.\n"
                "Look around your room and name:\n"
                "• 5 things you can see\n"
                "• 4 things you can physically touch\n"
                "• 3 sounds you hear\n"
                "• 2 things you can smell\n"
                "• 1 slow, deep breath you take 🫂.\n"
                "Give it a try — it really helps pull your mind back into the present moment."
            )

        # General Empathetic Default
        return (
            "I hear you, and it sounds like things have been heavy to carry lately 🫂. "
            "You don't have to have everything figured out right this minute. "
            "I'm right here with you — what feels like the hardest part right now?"
        )


# ── Resilient Hugging Face Client Wrapper ──────────────────────────────────────

class ResilientLLMClient:
    """
    Wraps Hugging Face InferenceClient. If the token is invalid (401),
    rate-limited (429), or unavailable (503/timeout), it gracefully
    falls back to MockInferenceClient without crashing or surfacing errors.
    """

    def __init__(self, model: str = MODEL_NAME, token: Optional[str] = None):
        self.model = model
        self.token = token or HF_TOKEN
        self._mock_client = MockInferenceClient(model=model)
        self._live_client = None

    def _get_live_client(self):
        if self._live_client is None:
            from huggingface_hub import InferenceClient
            self._live_client = InferenceClient(model=self.model, token=self.token)
        return self._live_client

    def chat_completion(
        self,
        messages: list[dict],
        max_tokens: int = 250,
        temperature: float = 0.7,
        **kwargs: Any,
    ) -> Any:
        global _hf_auth_status, _hf_auth_detail, _logged_status

        # If offline mock mode is forced or token is known to be bad, use mock directly
        if MOCK_LLM_MODE or _hf_auth_status is False or not self.token or self.token.startswith("your_"):
            return self._mock_client.chat_completion(
                messages=messages, max_tokens=max_tokens, temperature=temperature, **kwargs
            )

        # Attempt live inference call
        try:
            live = self._get_live_client()
            resp = live.chat_completion(
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature,
                **kwargs,
            )
            # Mark auth as confirmed on successful live call
            if _hf_auth_status is not True:
                _hf_auth_status = True
                _hf_auth_detail = "Authenticated & Active"
                print(f"✅ [Hugging Face] Connected to live model: {self.model}")
            return resp

        except Exception as exc:
            err_str = str(exc)
            err_cls = exc.__class__.__name__

            # Check for 401 Unauthorized / Invalid token
            is_401 = "401" in err_str or "Unauthorized" in err_str or "Invalid user token" in err_str
            is_403 = "403" in err_str or "Forbidden" in err_str

            if is_401 or is_403:
                _hf_auth_status = False
                _hf_auth_detail = "401 Unauthorized: Invalid or expired token"
                if not _logged_status:
                    print(
                        f"\n⚠️  [Hugging Face] Authentication failed: HTTP 401/403 ({err_cls}).\n"
                        f"🔄 Seamlessly falling back to Offline Mock LLM Mode for development.\n"
                        f"💡 To use live generation, update HUGGINGFACE_TOKEN in .env with a valid token.\n"
                    )
                    _logged_status = True
                # Fallback to mock generator for this and future requests
                return self._mock_client.chat_completion(
                    messages=messages, max_tokens=max_tokens, temperature=temperature, **kwargs
                )

            # Transient errors (429 Rate limit, 503 Model loading, Network timeout)
            print(f"⚠️ [Hugging Face] Live request failed ({err_cls}: {err_str[:80]}). Using offline fallback response.")
            return self._mock_client.chat_completion(
                messages=messages, max_tokens=max_tokens, temperature=temperature, **kwargs
            )


# ── Public API & Verification Helpers ─────────────────────────────────────────

_global_client: Optional[ResilientLLMClient | MockInferenceClient] = None


def get_llm_client() -> ResilientLLMClient | MockInferenceClient:
    """Returns the singleton LLM client (live with auto-fallback or mock)."""
    global _global_client
    if _global_client is None:
        if MOCK_LLM_MODE or not HF_TOKEN or HF_TOKEN.startswith("your_"):
            print("ℹ️ [LLM] Running in Offline Mock LLM Mode.")
            _global_client = MockInferenceClient()
        else:
            _global_client = ResilientLLMClient(model=MODEL_NAME, token=HF_TOKEN)
    return _global_client


def verify_hf_token(token: Optional[str] = None) -> dict:
    """
    Explicitly tests and verifies Hugging Face credentials.
    Returns a detailed status dict.
    """
    token_to_check = token if token is not None else HF_TOKEN

    if not token_to_check:
        return {
            "valid": False,
            "status": "missing",
            "message": "HUGGINGFACE_TOKEN is not set in environment or .env",
            "user": None,
        }

    try:
        from huggingface_hub import HfApi
        api = HfApi(token=token_to_check)
        info = api.whoami()
        username = info.get("name", "Authenticated User")
        return {
            "valid": True,
            "status": "authenticated",
            "message": f"Successfully authenticated as {username}",
            "user": username,
        }
    except Exception as exc:
        err_str = str(exc)
        if "401" in err_str or "Invalid user token" in err_str:
            status = "unauthorized"
            message = "Token is invalid, expired, or revoked (HTTP 401)"
        elif "403" in err_str:
            status = "forbidden"
            message = "Token does not have sufficient permissions (HTTP 403)"
        else:
            status = "network_error"
            message = f"Connection error: {err_str[:120]}"

        return {
            "valid": False,
            "status": status,
            "message": message,
            "user": None,
            "error_detail": err_str[:200],
        }


def get_llm_status() -> dict:
    """Provides current operational status of the LLM pipeline."""
    return {
        "model_name": MODEL_NAME,
        "mock_mode_forced": MOCK_LLM_MODE,
        "token_configured": bool(HF_TOKEN and not HF_TOKEN.startswith("your_")),
        "auth_status": _hf_auth_detail if _hf_auth_status is not None else "Pending first request",
        "active_mode": "mock" if (MOCK_LLM_MODE or _hf_auth_status is False or not HF_TOKEN) else "live_with_fallback",
    }

