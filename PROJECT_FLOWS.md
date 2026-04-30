# MyAlly Project - Complete Flow Documentation

## 📊 Overview of All Flows

This document covers all the major workflows in the MyAlly system:
1. **Authentication & Onboarding Flow**
2. **Chat Message Processing Flow**
3. **RAG Retrieval Flow**
4. **Safety & Crisis Detection Flow**
5. **Complete End-to-End Flow**

---

## 🔐 Flow 1: Authentication & Onboarding

### Sequence:
```
1. User visits app (http://localhost:5173)
   ↓
2. Frontend checks: Is user logged in?
   ├─ NO → Redirect to Firebase Google Sign-In
   └─ YES → Load user profile from DB
   ↓
3. If new user:
   ├─ Create user record in USERS table (with Firebase UID)
   ├─ Show onboarding form
   ├─ Collect preferences:
   │  - Nickname
   │  - Gender preference
   │  - Preferred tone (warm, professional, casual, etc.)
   │  - Support style (listening, advice, coaching)
   │  - Lifestyle patterns
   │  - Support network
   │  - Education level
   └─ Save all to USERS table
   ↓
4. Load chat dashboard:
   ├─ Show sidebar with all past chat sessions
   └─ Show "New Chat" button
   ↓
5. User is ready to chat!
```

### Database Impact:
- ✅ New row created in `USERS` table
- ✅ User preferences stored for personalization
- ✅ User `uid` = Firebase UID for authentication

---

## 💬 Flow 2: Chat Message Processing (The Core Loop)

### 12-Step Process:

```
USER SENDS MESSAGE
        ↓
[STEP 1] Message received by frontend (React)
        ↓
[STEP 2] Frontend sends to Backend API
        Request: POST /chat
        Body: {
            "session_id": "uuid",
            "user_id": "firebase_uid",
            "message": "I'm feeling anxious..."
        }
        ↓
[STEP 3] Backend receives in chat_api.py
        ↓
[STEP 4] SAFETY CHECK - Crisis Detection
        Pipeline analyzes:
        - Suicidal language?
        - Self-harm indicators?
        - Severe distress?
        - Abuse/harmful content?
        
        If HIGH RISK:
        └─ Skip to CRISIS ROUTE (see Flow 4)
        
        If SAFE:
        └─ Continue to next step
        ↓
[STEP 5] INTENT CLASSIFICATION
        What is user asking for?
        - General support?
        - Medical advice?
        - Emotional support?
        - Information request?
        ↓
[STEP 6] RAG RETRIEVAL (See Flow 3)
        - Convert message to vector embedding
        - Search ChromaDB
        - Get relevant context from:
          * Empathy Collection (similar emotional conversations)
          * Knowledge Collection (mental health facts)
        ↓
[STEP 7] LOAD CHAT CONTEXT
        - Get previous messages from CHAT_MESSAGES table
        - Build conversation history
        - Include user preferences from USERS table
        ↓
[STEP 8] PROMPT BUILDING
        Combine all information:
        ```
        System: You are MyAlly, an empathetic mental health chatbot.
        User tone preference: [warm/casual/professional]
        User context: [their background from onboarding]
        
        Previous conversation:
        [Last 5 messages from DB]
        
        Retrieved context from mental health sources:
        [Top 3-5 similar cases + advice]
        
        Current user message:
        "I'm feeling anxious..."
        ```
        ↓
[STEP 9] CALL LLM (Language Model)
        - Send complete prompt to Qwen 2.5 7B on HuggingFace
        - LLM generates response based on:
          * Training on mental health dialogues
          * Retrieved context (grounded in real data)
          * User preferences (personalization)
        ↓
[STEP 10] LLM GENERATES RESPONSE
        MyAlly: "I hear you about exam anxiety. That's really common 
        among students. Here are some grounding techniques..."
        ↓
[STEP 11] SAVE TO DATABASE
        - Save USER MESSAGE:
          INSERT INTO CHAT_MESSAGES (session_id, role, content, created_at)
          VALUES ('session-uuid', 'user', 'I'm feeling anxious...', NOW())
        
        - Save BOT RESPONSE:
          INSERT INTO CHAT_MESSAGES (session_id, role, content, created_at)
          VALUES ('session-uuid', 'bot', 'I hear you about...', NOW())
        
        - Update session timestamp:
          UPDATE CHAT_SESSIONS
          SET updated_at = NOW()
          WHERE id = 'session-uuid'
        ↓
[STEP 12] RETURN TO FRONTEND
        Response sent back as JSON:
        {
            "status": "success",
            "response": "I hear you about exam anxiety...",
            "session_id": "session-uuid",
            "message_id": 42
        }
        ↓
DISPLAY IN UI
        Message bubble appears in chat window
        ↓
User sees response and can continue chatting!
```

### Database Operations:
```sql
-- Insert user message
INSERT INTO chat_messages (session_id, role, content, created_at)
VALUES ('abc-123', 'user', 'I feel anxious', NOW());

-- Insert bot response
INSERT INTO chat_messages (session_id, role, content, created_at)
VALUES ('abc-123', 'bot', 'I hear you...', NOW());

-- Update session
UPDATE chat_sessions SET updated_at = NOW() WHERE id = 'abc-123';
```

---

## 🧠 Flow 3: RAG Retrieval (Grounding AI in Real Data)

### Purpose:
Make AI responses based on **real mental health conversations and data**, not pure hallucination.

### Process:

```
[A] INPUT
    User question: "How do I deal with anxiety?"
    ↓
[B] EMBEDDING CONVERSION
    - Sentence-Transformers converts text to vector
    - Creates 384-dimensional vector representation
    - Vector captures semantic meaning
    
    Example (conceptual):
    "anxiety" → [0.23, -0.15, 0.89, ..., 0.45] (384 dimensions)
    ↓
[C] VECTOR SEARCH IN CHROMADB
    Search in TWO collections:
    
    1️⃣ EMPATHY COLLECTION
       - Contains emotional dialogues
       - Source: Reddit threads, empathetic dialogue datasets
       - Find messages SIMILAR to user's message
       - Example match: "I get really nervous before exams"
       
    2️⃣ KNOWLEDGE COLLECTION
       - Contains mental health facts
       - Source: MHQA dataset, clinical info
       - Find relevant mental health knowledge
       - Example match: "Anxiety techniques include breathing exercises"
    ↓
[D] RETRIEVE TOP RESULTS
    Similarity scoring:
    - Empathy Collection returns Top 3-5 similar conversations
    - Knowledge Collection returns Top 3-5 relevant facts
    
    Results returned:
    {
        "empathy_results": [
            {"doc_id": 1, "text": "Similar person's experience", "score": 0.92},
            {"doc_id": 2, "text": "Another relevant conversation", "score": 0.87}
        ],
        "knowledge_results": [
            {"doc_id": 101, "text": "Anxiety is characterized by...", "score": 0.89},
            {"doc_id": 102, "text": "CBT techniques for anxiety include...", "score": 0.85}
        ]
    }
    ↓
[E] CONTEXT ASSEMBLY
    All retrieved chunks are assembled into prompt:
    
    "Based on these real examples and knowledge:
    
    Similar person's experience:
    > [empathy result 1]
    > [empathy result 2]
    
    Relevant mental health knowledge:
    > [knowledge result 1]
    > [knowledge result 2]
    
    Now answer the user's question..."
    ↓
[F] LLM USES CONTEXT
    Qwen model generates response using:
    - Retrieved context (grounded in real data)
    - User's personal history
    - User preferences
    ↓
[OUTPUT]
    Response that is:
    ✅ Empathetic (based on real conversations)
    ✅ Factually accurate (based on knowledge docs)
    ✅ Personalized (based on user profile)
    ✅ NOT hallucinated (grounded in retrieved data)
```

### Data Sources:
```
CSV Datasets (database/dataset reddit/ & empatheticdialogues/)
        ↓
    Processed into JSON
        ↓
Build RAG Index (python build_rag_index.py)
        ↓
Embeddings created (Sentence-Transformers)
        ↓
ChromaDB Vector Store
        ├─ empathy_documents.jsonl
        └─ knowledge_documents.jsonl
        ↓
At query time: Fast similarity search
```

---

## 🚨 Flow 4: Safety & Crisis Detection

### Trigger Point:
Every user message goes through the **Safety Pipeline** FIRST.

### Safety Check Process:

```
MESSAGE ARRIVES
        ↓
RISK ANALYSIS:
├─ Keyword scanning (suicidal terms, self-harm language)
├─ Pattern detection (depression, hopelessness indicators)
├─ Sentiment analysis (extreme distress)
└─ Intent classification (harmful behavior signals)
        ↓
RISK LEVEL DETERMINED:
        
[LOW RISK] ✅
├─ Safe topics
├─ General support questions
├─ Educational content
└─ Action: Continue to RAG → LLM response
        
[MEDIUM RISK] ⚠️
├─ Sensitive but not critical
├─ Mentions of stress/worry/frustration
└─ Action: Add extra coping resources, provide helplines
        
[HIGH RISK] 🚨
├─ Suicidal ideation ("I want to die")
├─ Self-harm plans ("I'm going to cut")
├─ Severe crisis ("I can't go on")
└─ Action: CRISIS ESCALATION PROTOCOL
```

### Crisis Escalation Protocol:

```
🚨 HIGH RISK MESSAGE DETECTED

[IMMEDIATE ACTIONS]
1. SKIP RAG SYSTEM
   └─ Don't process normally
   
2. IMMEDIATE RESPONSE TO USER
   Show crisis resources:
   ├─ 988 Suicide & Crisis Lifeline
   ├─ Crisis Text Line: Text "HELLO" to 741741
   ├─ National Suicide Prevention Lifeline: 1-800-273-8255
   └─ International Association for Suicide Prevention
   
3. LOG EVENT
   Create crisis alert with:
   ├─ User ID
   ├─ Exact message text
   ├─ Timestamp
   ├─ Risk assessment score
   ├─ Full chat history (context)
   └─ User profile (onboarding info)
   
4. ALERT GUARDIAN PANEL
   Send notification to admin dashboard (/admin):
   ├─ New crisis alert!
   ├─ User: [Name]
   ├─ Risk level: [HIGH]
   ├─ Quick access to:
   │  ├─ Full chat history
   │  ├─ User profile
   │  ├─ One-click call
   │  ├─ Escalate to emergency services
   │  ├─ Send emergency resources
   │  └─ Follow-up scheduler
   
5. ADMIN CAN:
   ├─ Call user directly
   ├─ Contact local emergency services
   ├─ Send additional resources
   ├─ Schedule follow-up check-in
   └─ Document intervention

```

### Safety Pipeline Code Location:
- File: `backend/src/rag/safety.py`
- Called from: `backend/src/app/chat_api.py`
- Response goes to Guardian Panel: `/admin` endpoint

---

## 🔄 Flow 5: Complete End-to-End Journey

### User's Complete Experience:

```
DAY 1: FIRST TIME USING MYALLY
┌────────────────────────────────┐
│ 1. User visits localhost:5173   │
│ 2. Clicks "Sign in with Google" │
│ 3. Authenticates with Firebase  │
│ 4. Completes onboarding form    │
│ 5. Preferences saved in DB      │
│ 6. Sees empty chat interface    │
│ 7. Clicks "New Chat"            │
│ 8. Session created in DB        │
│ 9. Ready to chat!               │
└────────────────────────────────┘

CHATTING
┌────────────────────────────────┐
│ 1. Types: "I'm anxious"         │
│ 2. Message sent to backend      │
│ 3. Safety check: ✅ SAFE        │
│ 4. RAG retrieves context        │
│ 5. Prompt assembled with:       │
│    - User preferences           │
│    - Chat history               │
│    - Retrieved context          │
│ 6. Qwen generates response      │
│ 7. Both messages saved to DB    │
│ 8. Response displayed in UI     │
│ 9. User sees MyAlly's reply     │
│ 10. User types next message     │
│ 11. Repeat steps 2-10           │
└────────────────────────────────┘

DAY 2: RETURNING USER
┌────────────────────────────────┐
│ 1. Visits app                   │
│ 2. Already logged in (Firebase) │
│ 3. Sees sidebar with:           │
│    - "Yesterday's Chat"         │
│    - "Earlier Conversation"     │
│    - "New Chat"                 │
│ 4. Clicks "Yesterday's Chat"    │
│ 5. All old messages loaded      │
│ 6. MyAlly remembers context     │
│ 7. User continues conversation  │
│ 8. Messages saved to same DB    │
└────────────────────────────────┘

CRISIS SCENARIO
┌────────────────────────────────┐
│ 1. User types: "I want to die"  │
│ 2. Backend receives message     │
│ 3. Safety check: 🚨 HIGH RISK   │
│ 4. Crisis protocol triggered    │
│ 5. User shown:                  │
│    - 988 number                 │
│    - Crisis resources           │
│ 6. Admin alert sent             │
│ 7. Chat logged with full history│
│ 8. Admin sees notification      │
│ 9. Admin calls user             │
│ 10. Follow-up scheduled         │
└────────────────────────────────┘
```

---

## 📊 Summary Table: Flow Overview

| Flow | Trigger | Key Steps | Database | Output |
|------|---------|-----------|----------|--------|
| **Auth** | App load | Firebase → Onboarding → Save prefs | USERS | Ready to chat |
| **Chat** | User message | Safety → RAG → LLM → Save → Display | CHAT_MESSAGES | Response in UI |
| **RAG** | Inside chat | Embedding → Search → Retrieve context | ChromaDB | Context for LLM |
| **Safety** | Every message | Risk analysis → Route or escalate | USERS, CHAT_MESSAGES | Response/Escalation |
| **End-to-End** | App start | All flows combined | All tables | Complete experience |

---

## 🎯 Key Takeaways

1. **Every message** goes through Safety first
2. **RAG ensures** responses are grounded in real data
3. **Database** tracks everything for context & memory
4. **Crisis detection** is automatic and immediate
5. **Admin panel** allows human intervention
6. **Personalization** comes from user profile + preferences

This multi-layered approach makes MyAlly:
- ✅ **Safe** (crisis detection)
- ✅ **Smart** (RAG retrieval)
- ✅ **Personal** (user memory)
- ✅ **Responsible** (admin oversight)
