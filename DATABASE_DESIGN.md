# Novara Database Design

## 📊 Database Schema Overview

The database uses **PostgreSQL** (or SQLite for local testing) with three main tables:

```
USERS (1) ──────→ (Many) CHAT_SESSIONS ──────→ (Many) CHAT_MESSAGES
```

---

## 🗄️ Table Definitions

### 1. **USERS** Table
Stores user profiles and preferences collected during onboarding.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `uid` | VARCHAR(255) | PRIMARY KEY | Firebase UID (unique identifier) |
| `email` | VARCHAR(255) | UNIQUE, INDEX | User's email address |
| `name` | VARCHAR(255) | NOT NULL | User's full name |
| `nickname` | VARCHAR(255) | NULLABLE | User's preferred nickname |
| `gender` | VARCHAR(50) | NULLABLE | Gender preference (he/she/they) |
| `preferred_tone` | VARCHAR(100) | NULLABLE | Chat tone (formal/casual/warm/professional) |
| `support_style` | VARCHAR(100) | NULLABLE | Support style (listening/advice/coaching) |
| `lifestyle_patterns` | VARCHAR(500) | NULLABLE | Lifestyle info (sleep, exercise, diet) |
| `support_network` | VARCHAR(500) | NULLABLE | Support network description |
| `education` | VARCHAR(100) | NULLABLE | Education level |
| `created_at` | DATETIME | DEFAULT NOW() | Account creation timestamp |

**Relationships:**
- One user → Many chat sessions

---

### 2. **CHAT_SESSIONS** Table
Stores individual chat sessions for each user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(36) | PRIMARY KEY | UUID (e.g., `550e8400-e29b-41d4-a716-446655440000`) |
| `user_uid` | VARCHAR(255) | FOREIGN KEY → users.uid | Links to the user |
| `title` | VARCHAR(255) | DEFAULT "New Chat" | Session name/title |
| `created_at` | DATETIME | DEFAULT NOW() | When session started |
| `updated_at` | DATETIME | DEFAULT NOW() | Last message timestamp |

**Relationships:**
- One session → One user
- One session → Many messages (cascade delete)

---

### 3. **CHAT_MESSAGES** Table
Stores individual messages within each chat session.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Auto-incrementing message ID |
| `session_id` | VARCHAR(36) | FOREIGN KEY → chat_sessions.id | Links to chat session |
| `role` | VARCHAR(20) | NOT NULL | "user" or "bot" |
| `content` | TEXT | NOT NULL | Message text content |
| `created_at` | DATETIME | DEFAULT NOW() | Message timestamp |

**Relationships:**
- Many messages → One session

---

## 🔗 Relationships & Constraints

### 1. User → Sessions
- **Type:** One-to-Many
- **Foreign Key:** `chat_sessions.user_uid` → `users.uid`
- **Cascade:** No cascade (soft delete pattern)

### 2. Session → Messages
- **Type:** One-to-Many
- **Foreign Key:** `chat_messages.session_id` → `chat_sessions.id`
- **Cascade:** **DELETE CASCADE** (deleting a session deletes all its messages)

---

## 📈 SQL Queries Examples

### Get all chat sessions for a user
```sql
SELECT * FROM chat_sessions 
WHERE user_uid = 'user_firebase_uid'
ORDER BY updated_at DESC;
```

### Get all messages in a session
```sql
SELECT * FROM chat_messages 
WHERE session_id = 'session_uuid'
ORDER BY created_at ASC;
```

### Get user profile with last 5 sessions
```sql
SELECT u.*, cs.* FROM users u
LEFT JOIN chat_sessions cs ON u.uid = cs.user_uid
WHERE u.uid = 'user_firebase_uid'
ORDER BY cs.updated_at DESC
LIMIT 5;
```

### Delete entire chat session and messages
```sql
DELETE FROM chat_sessions 
WHERE id = 'session_uuid';
-- Messages cascade delete automatically
```

---

## 🛠️ Database Configuration

### PostgreSQL (Production)
```env
POSTGRES_URL="postgresql://username:password@host:5432/novara_db"
```

### SQLite (Local Development)
```env
POSTGRES_URL="sqlite:///./novara.db"
```

The app auto-creates all tables on startup via SQLAlchemy `Base.metadata.create_all()`.

---

## 📝 Notes

- **Soft Deletes:** User accounts are not deleted; instead, they can be deactivated
- **Cascade Delete:** When a session is deleted, all its messages are automatically deleted
- **Timestamps:** All tables have `created_at` for audit trail
- **Indexing:** Firebase UID and email are indexed for fast lookups
- **Firebase Integration:** User authentication is handled by Firebase; `uid` is the Firebase user ID

---

## 🔐 Data Privacy

- User conversations are stored in PostgreSQL (can be encrypted)
- No user data is sent to external AI services except the current message
- Users can request data deletion (GDPR compliance)
- All timestamps are in UTC
