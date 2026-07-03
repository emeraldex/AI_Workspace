# Forge AI Workspace — Phase 2: Functional Requirements

---

## Clarifications Applied

| Question | Decision |
|---|---|
| Team/sharing | Strictly single-user for v1.0. Schema remains migration-safe for future multi-user. |
| RAG support | Included in v1.0. Documents and knowledge base will be RAG-indexed. |
| Ollama support | Deferred to v1.1. OpenAI only for v1.0. |
| Scope changes | None. MVP scope confirmed as defined in Phase 1. |

---

## 1. Objectives

Define every user-facing behavior as structured functional requirements with acceptance criteria, organized by domain. This document is the contract between product intent and engineering implementation.

---

## 2. Functional Requirements

---

### FR-01 — Authentication

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| FR-01-01 | User can register with email and password | Account created, verification email sent, duplicate email rejected with clear error |
| FR-01-02 | User can log in with email and password | JWT access token + refresh token issued on success; invalid credentials return 401 |
| FR-01-03 | Access tokens expire after 15 minutes | Expired token returns 401; client silently refreshes using refresh token |
| FR-01-04 | Refresh tokens expire after 7 days | Expired refresh token forces re-login |
| FR-01-05 | User can log out | Refresh token invalidated server-side; client tokens cleared |
| FR-01-06 | User can change their password | Old password verified before update; all refresh tokens invalidated on change |
| FR-01-07 | All protected routes require valid JWT | Unauthenticated requests return 401 with consistent error shape |
| FR-01-08 | Rate limiting on auth endpoints | Max 10 attempts per 15 minutes per IP; returns 429 on breach |

---

### FR-02 — User Profile & Settings

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| FR-02-01 | User can view and update their profile | Name, avatar URL, timezone, bio updatable; changes persisted immediately |
| FR-02-02 | User can set theme preference | Light, dark, system options; preference persisted to backend and applied on load |
| FR-02-03 | User can configure AI provider settings | OpenAI API key stored encrypted; model selection (gpt-4o, gpt-4o-mini) |
| FR-02-04 | User can set notification preferences | Per-category toggles; preferences persisted |
| FR-02-05 | User can delete their account | Soft delete with 30-day recovery window; all data anonymized after window |

---

### FR-03 — Dashboard

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| FR-03-01 | Dashboard displays task summary | Count of tasks by status (todo, in-progress, done) visible on load |
| FR-03-02 | Dashboard displays tasks due today and overdue | Sorted by priority; overdue tasks visually distinguished |
| FR-03-03 | Dashboard displays recent documents | Last 5 modified documents shown with title and timestamp |
| FR-03-04 | Dashboard displays recent AI conversations | Last 3 conversations shown with preview |
| FR-03-05 | Dashboard displays a productivity streak | Consecutive days with at least one completed task |
| FR-03-06 | Dashboard widgets are individually dismissible | Dismissed state persisted per user |

---

### FR-04 — Task Management

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| FR-04-01 | User can create a task | Title required; description, due date, priority, project, tags optional |
| FR-04-02 | User can view all tasks | Paginated list; default sort by due date ascending |
| FR-04-03 | User can update any task field | Changes persisted immediately; updated_at timestamp refreshed |
| FR-04-04 | User can delete a task | Soft delete; task removed from all views |
| FR-04-05 | User can create subtasks under a task | Subtasks have their own title and completion state |
| FR-04-06 | User can assign priority | Four levels: low, medium, high, urgent |
| FR-04-07 | User can assign a status | Statuses: todo, in_progress, in_review, done, cancelled |
| FR-04-08 | User can assign due dates | Date and optional time; overdue state computed automatically |
| FR-04-09 | User can filter tasks | By status, priority, project, tag, due date range |
| FR-04-10 | User can search tasks | Full-text search on title and description |
| FR-04-11 | User can add tags to tasks | Free-form tags; autocomplete from existing tags |
| FR-04-12 | User can view tasks in list and board (kanban) view | View preference persisted |
| FR-04-13 | User can reorder tasks via drag-and-drop in board view | Order persisted |
| FR-04-14 | User can create a task from natural language via AI | Input parsed by AI; fields pre-populated for confirmation before save |

---

### FR-05 — Projects & Categories

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| FR-05-01 | User can create a project | Name, description, color, icon optional |
| FR-05-02 | User can assign tasks to a project | Task list filterable by project |
| FR-05-03 | User can archive a project | Archived projects hidden by default; tasks retained |
| FR-05-04 | User can create categories | Used for organizing documents and snippets |
| FR-05-05 | User can view project-level task summary | Progress bar showing completion percentage |

---

### FR-06 — AI Assistant

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| FR-06-01 | User can start a new AI conversation | New conversation created with a generated title |
| FR-06-02 | User can send messages and receive AI responses | Streaming responses rendered token-by-token |
| FR-06-03 | Conversation history is persisted | All messages stored; conversation resumable across sessions |
| FR-06-04 | User can view all past conversations | Listed by recency with title and preview |
| FR-06-05 | User can delete a conversation | Conversation and all messages removed |
| FR-06-06 | User can rename a conversation | Title updated immediately |
| FR-06-07 | AI can create tasks from conversation | User confirms before task is saved |
| FR-06-08 | AI responses support markdown rendering | Code blocks, tables, lists rendered correctly |
| FR-06-09 | User can attach documents as context | Selected documents injected into conversation context via RAG |
| FR-06-10 | AI has awareness of user's tasks when asked | Task data summarized and injected as system context |
| FR-06-11 | User can copy any AI message | One-click copy to clipboard |
| FR-06-12 | User can regenerate the last AI response | Previous response replaced; original retained in history |

---

### FR-07 — Knowledge Base & RAG

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| FR-07-01 | User can create a document | Title and markdown body; auto-saved every 30 seconds |
| FR-07-02 | User can organize documents in collections | Nested collections supported (max 3 levels) |
| FR-07-03 | User can search documents by full-text | Results ranked by relevance; highlights matched terms |
| FR-07-04 | User can search documents semantically | Natural language query returns semantically relevant results |
| FR-07-05 | Documents are automatically indexed for RAG | Indexing triggered on create and update; status visible to user |
| FR-07-06 | User can attach documents to AI conversations | Attached documents used as retrieval context |
| FR-07-07 | User can delete a document | Soft delete; removed from RAG index |
| FR-07-08 | User can export a document | Export as Markdown or plain text |
| FR-07-09 | User can tag documents | Same tag system as tasks |
| FR-07-10 | Document editor supports markdown shortcuts | Bold, italic, headings, code blocks via keyboard shortcuts |

---

### FR-08 — Developer Workspace

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| FR-08-01 | User can create and save code snippets | Title, language, code body required; syntax highlighting applied |
| FR-08-02 | User can search snippets | By title, language, tag |
| FR-08-03 | User can copy a snippet to clipboard | One-click copy |
| FR-08-04 | User can use the JSON formatter | Paste raw JSON; formatted and validated output shown |
| FR-08-05 | User can use the JWT decoder | Paste JWT; header, payload, signature decoded and displayed |
| FR-08-06 | User can use the Base64 tool | Encode and decode in both directions |
| FR-08-07 | User can use the Markdown previewer | Split-pane editor with live preview |
| FR-08-08 | User can use the YAML viewer | Paste YAML; validated and formatted output shown |
| FR-08-09 | All tools work entirely client-side | No data sent to server for these utility tools |

---

### FR-09 — Notifications

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| FR-09-01 | User receives in-app notifications | Bell icon with unread count badge |
| FR-09-02 | Notifications generated for task due dates | 24 hours and 1 hour before due time |
| FR-09-03 | Notifications generated for AI task creation | Confirmation notification when AI creates a task |
| FR-09-04 | User can mark notifications as read | Individual and mark-all-read supported |
| FR-09-05 | User can dismiss notifications | Dismissed notifications removed from list |

---

### FR-10 — Search

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| FR-10-01 | Global search accessible from header and command palette | Keyboard shortcut: Cmd/Ctrl+K |
| FR-10-02 | Search covers tasks, documents, snippets, conversations | Results grouped by type |
| FR-10-03 | Results appear within 300ms for cached queries | Debounced input; loading state shown |
| FR-10-04 | User can navigate to any result directly | Click or keyboard navigation to result |

---

### FR-11 — Command Palette

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| FR-11-01 | Command palette opens with Cmd/Ctrl+K | Overlay rendered above all content |
| FR-11-02 | Supports navigation commands | Go to any page by typing its name |
| FR-11-03 | Supports action commands | Create task, new document, new conversation, open settings |
| FR-11-04 | Supports search | Delegates to global search when query matches no commands |
| FR-11-05 | Keyboard navigable | Arrow keys to navigate, Enter to execute, Escape to close |

---

## 3. Design Decisions

| Decision | Rationale |
|---|---|
| RAG indexing on save | Keeps index fresh without manual user action |
| Soft deletes throughout | Enables recovery window and audit trail without data loss |
| Client-side dev tools | No sensitive data leaves the browser for utility operations |
| Streaming AI responses | Significantly better perceived performance for LLM interactions |
| Task confirmation before AI save | Prevents AI from silently mutating user data |

---

## 4. Risks

| Risk | Mitigation |
|---|---|
| RAG indexing latency on large documents | Async background job with visible status indicator |
| OpenAI API key stored per user | Encrypted at rest using AES-256; never returned in API responses |
| Full-text search performance at scale | PostgreSQL tsvector indexes from day one |
| Streaming responses and connection drops | Client-side retry with partial response recovery |

---

## 5. Deliverables

- [x] 11 functional requirement domains
- [x] 89 individual requirements with acceptance criteria
- [x] Design decisions documented
- [x] Risk register updated

---

## 6. Updated Project Backlog

| Status | Item |
|---|---|
| ✅ Complete | Phase 1 — PRD |
| ✅ Complete | Phase 2 — Functional Requirements |
| ⏳ Pending | Phase 3 — Non-functional Requirements |
| ⏳ Pending | Phase 4 — System Architecture |
| ⏳ Pending | Phase 5 — Database Design |
| ⏳ Pending | Phase 6 — Folder Structure |
| ⏳ Pending | Phase 7 — UI Design System |
| ⏳ Pending | Phase 8 — API Design |
| ⏳ Pending | Phase 9 — Authentication |
| ⏳ Pending | Phase 10 — Backend Development |
| ⏳ Pending | Phase 11 — Frontend Development |
| ⏳ Pending | Phase 12 — AI Integration |
| ⏳ Pending | Phase 13 — Testing |
| ⏳ Pending | Phase 14 — DevOps |
| ⏳ Pending | Phase 15 — Deployment |
| ⏳ Pending | Phase 16 — Optimization |
| ⏳ Pending | Phase 17 — Documentation |
