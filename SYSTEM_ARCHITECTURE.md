# MyAlly Mental Health Chatbot - System Architecture

```mermaid
graph TB
    subgraph Frontend["🎨 Frontend (React/Vite)"]
        UI["Chat UI<br/>Components"]
        Auth["Firebase Auth<br/>Google Sign-In"]
        Sidebar["Chat Sidebar<br/>Session Manager"]
    end

    subgraph Backend["⚙️ Backend (FastAPI)"]
        API["Chat API<br/>/chat endpoint"]
        Service["Chat Service<br/>Core Logic"]
        Safety["Safety Pipeline<br/>Crisis Detection"]
        Router["Intent Router<br/>Route to RAG/Memory"]
    end

    subgraph RAG["🧠 RAG System (Retrieval-Augmented Generation)"]
        Embeddings["Sentence Transformers<br/>Embedding Model"]
        ChromaDB["ChromaDB Vector DB<br/>In-Memory"]
        EmpathyDocs["Empathy Collection<br/>High-emotion dialogues"]
        KnowledgeDocs["Knowledge Collection<br/>Mental health facts"]
        Retriever["Retriever<br/>Similarity Search"]
        PromptBuilder["Prompt Builder<br/>Context Assembly"]
    end

    subgraph LLM["🤖 Language Model"]
        HF["HuggingFace Inference API<br/>Qwen 2.5 7B Instruct"]
    end

    subgraph Database["💾 Data Layer"]
        PostgreSQL["PostgreSQL<br/>User profiles, chat history"]
        CSVData["CSV Datasets<br/>Training data"]
    end

    subgraph Admin["👮 Admin & Safety"]
        Guardian["Guardian Panel<br/>Crisis Dashboard"]
        Escalation["Crisis Escalation<br/>Automatic alerts"]
    end

    UI -->|User Message| Auth
    Auth -->|Authenticated Request| API
    API --> Service
    Service --> Router
    
    Router -->|Route Decision| Safety
    Safety -->|Check Risk Level| Escalation
    
    Router -->|Query| Retriever
    Retriever -->|Search Vectors| ChromaDB
    ChromaDB -->|Data from| EmpathyDocs
    ChromaDB -->|Data from| KnowledgeDocs
    EmpathyDocs -->|Indexed from| CSVData
    KnowledgeDocs -->|Indexed from| CSVData
    
    Retriever -->|Retrieved Context| PromptBuilder
    PromptBuilder -->|Build Prompt| HF
    HF -->|Generate Response| Service
    
    Service -->|Response| API
    API -->|Chat Message| UI
    
    Service -->|Save Chat| PostgreSQL
    PostgreSQL -->|Load Profile| Service
    
    Escalation -->|High Risk| Guardian
    Guardian -->|Alert| Admin["Admin User"]
    
    Embeddings -.->|Use for| ChromaDB
```

## How to Export as Image

### Option 1: **Using VS Code Extension** (Easiest)
1. Install **"Markdown Preview Mermaid Support"** extension in VS Code
2. Open this file and preview it (Ctrl+Shift+V)
3. Right-click on the diagram → **Export as PNG/SVG**

### Option 2: **Using Mermaid CLI**
```bash
npm install -g @mermaid-js/mermaid-cli
mmdc -i SYSTEM_ARCHITECTURE.md -o architecture.png
```

### Option 3: **Using Online Editor**
1. Go to https://mermaid.live
2. Copy the diagram code (between the backticks)
3. Paste it in the editor
4. Click "Export" → Download as PNG/SVG

---

## System Flow

1. **User sends message** → Frontend UI
2. **Firebase authenticates** the user
3. **Backend API receives** the message
4. **Service layer routes** to RAG + Safety check
5. **Safety pipeline detects** if crisis/high-risk
6. **If safe**: RAG system retrieves relevant context
   - Embeddings convert text to vectors
   - Searches ChromaDB (Empathy & Knowledge collections)
   - Returns relevant mental health dialogue patterns + facts
7. **Prompt builder** assembles context + user message
8. **HuggingFace LLM** generates empathetic response
9. **Response sent back** to UI
10. **Chat saved** to PostgreSQL for user memory
11. **If crisis detected**: Auto-escalates to Guardian Panel (admin dashboard)

---

## Key Data Collections

- **Empathy Docs**: Emotional dialogue patterns (Reddit, Empathetic Dialogues dataset)
- **Knowledge Docs**: Mental health facts (MHQA dataset)
- **User Data**: Profiles, preferences, chat history (PostgreSQL)
