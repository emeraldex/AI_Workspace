# Forge AI Workspace — Phase 6: Folder Structure

---

## 1. Objectives

Define the complete, annotated directory tree for the entire monorepo — every folder and file with its purpose — forming the scaffold the entire codebase is built on. No file is created without a reason.

---

## 2. Design Decisions

| Decision | Rationale |
|---|---|
| Monorepo with `apps/` and `packages/` | Frontend and backend share types and validation schemas without duplication |
| Feature-based frontend organization | Each domain is self-contained; scales without cross-feature coupling |
| Domain-based backend organization | Mirrors DDD; each domain owns its router, controller, service, repository |
| `shared/` package for cross-cutting types | Single source of truth for API contracts shared between frontend and backend |
| `infrastructure/` isolated from domains | External integrations (DB, Redis, AI) never imported directly by domain code |

---

## 3. Monorepo Root

```
forge-ai-workspace/
├── apps/
│   ├── frontend/                  # React 19 + Vite application
│   └── backend/                   # Node.js + Express API server
├── packages/
│   └── shared/                    # Shared TypeScript types and Zod schemas
├── docker/
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── default.conf
│   └── postgres/
│       └── init.sql               # pgvector extension + FTS indexes
├── docker-compose.yml
├── docker-compose.prod.yml
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── .gitignore
├── .env.example
└── README.md
```

---

## 4. Shared Package

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── auth.types.ts          # LoginRequest, RegisterRequest, TokenResponse
│   │   ├── user.types.ts          # User, UserSettings, UpdateProfileRequest
│   │   ├── task.types.ts          # Task, CreateTaskRequest, TaskFilters
│   │   ├── project.types.ts       # Project, CreateProjectRequest
│   │   ├── document.types.ts      # Document, CreateDocumentRequest
│   │   ├── conversation.types.ts  # Conversation, Message, SendMessageRequest
│   │   ├── snippet.types.ts       # Snippet, CreateSnippetRequest
│   │   ├── notification.types.ts  # Notification
│   │   ├── search.types.ts        # SearchQuery, SearchResults
│   │   └── api.types.ts           # ApiResponse<T>, PaginatedResponse<T>, ApiError
│   ├── schemas/
│   │   ├── auth.schemas.ts        # Zod schemas mirroring auth types
│   │   ├── task.schemas.ts
│   │   ├── project.schemas.ts
│   │   ├── document.schemas.ts
│   │   ├── conversation.schemas.ts
│   │   └── snippet.schemas.ts
│   └── index.ts                   # Barrel export
├── package.json
└── tsconfig.json
```

---

## 5. Backend

```
apps/backend/
├── prisma/
│   ├── schema.prisma              # Complete Prisma schema (Phase 5)
│   ├── migrations/                # Auto-generated migration files
│   └── seed.ts                    # Development seed data
├── src/
│   ├── domains/
│   │   ├── auth/
│   │   │   ├── auth.router.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repository.ts
│   │   │   └── auth.validator.ts
│   │   ├── users/
│   │   │   ├── users.router.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.repository.ts
│   │   │   └── users.validator.ts
│   │   ├── tasks/
│   │   │   ├── tasks.router.ts
│   │   │   ├── tasks.controller.ts
│   │   │   ├── tasks.service.ts
│   │   │   ├── tasks.repository.ts
│   │   │   └── tasks.validator.ts
│   │   ├── projects/
│   │   │   ├── projects.router.ts
│   │   │   ├── projects.controller.ts
│   │   │   ├── projects.service.ts
│   │   │   ├── projects.repository.ts
│   │   │   └── projects.validator.ts
│   │   ├── documents/
│   │   │   ├── documents.router.ts
│   │   │   ├── documents.controller.ts
│   │   │   ├── documents.service.ts
│   │   │   ├── documents.repository.ts
│   │   │   └── documents.validator.ts
│   │   ├── conversations/
│   │   │   ├── conversations.router.ts
│   │   │   ├── conversations.controller.ts
│   │   │   ├── conversations.service.ts
│   │   │   ├── conversations.repository.ts
│   │   │   └── conversations.validator.ts
│   │   ├── snippets/
│   │   │   ├── snippets.router.ts
│   │   │   ├── snippets.controller.ts
│   │   │   ├── snippets.service.ts
│   │   │   ├── snippets.repository.ts
│   │   │   └── snippets.validator.ts
│   │   ├── notifications/
│   │   │   ├── notifications.router.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── notifications.repository.ts
│   │   │   └── notifications.validator.ts
│   │   ├── search/
│   │   │   ├── search.router.ts
│   │   │   ├── search.controller.ts
│   │   │   ├── search.service.ts
│   │   │   └── search.validator.ts
│   │   └── dashboard/
│   │       ├── dashboard.router.ts
│   │       ├── dashboard.controller.ts
│   │       └── dashboard.service.ts
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── prisma.client.ts   # Prisma singleton
│   │   ├── cache/
│   │   │   └── redis.client.ts    # Redis singleton (ioredis)
│   │   ├── queue/
│   │   │   ├── queue.client.ts    # Bull queue factory
│   │   │   ├── workers/
│   │   │   │   └── rag.worker.ts  # RAG indexing job processor
│   │   │   └── jobs/
│   │   │       └── rag.job.ts     # Job type definitions
│   │   ├── ai/
│   │   │   ├── ai.provider.interface.ts   # IAIProvider interface
│   │   │   ├── openai.provider.ts         # OpenAI implementation
│   │   │   └── ai.provider.factory.ts     # Returns correct provider
│   │   └── vector/
│   │       └── vector.service.ts  # pgvector similarity search
│   │
│   ├── shared/
│   │   ├── middleware/
│   │   │   ├── authenticate.ts    # JWT verification middleware
│   │   │   ├── rateLimiter.ts     # express-rate-limit configs
│   │   │   ├── requestId.ts       # UUID request ID injection
│   │   │   ├── requestLogger.ts   # Pino request/response logging
│   │   │   └── errorHandler.ts    # Global error handler
│   │   ├── errors/
│   │   │   └── AppError.ts        # Typed error hierarchy
│   │   ├── config/
│   │   │   └── index.ts           # Zod-validated env config
│   │   ├── logger/
│   │   │   └── index.ts           # Pino logger instance
│   │   ├── crypto/
│   │   │   └── encryption.ts      # AES-256-GCM encrypt/decrypt
│   │   └── types/
│   │       └── express.d.ts       # Express Request augmentation (req.user)
│   │
│   ├── sockets/
│   │   ├── socket.server.ts       # Socket.IO server setup
│   │   ├── handlers/
│   │   │   ├── ai.handler.ts      # ai:stream events
│   │   │   └── notification.handler.ts
│   │   └── socket.auth.ts         # Socket JWT authentication
│   │
│   ├── app.ts                     # Express app factory
│   └── server.ts                  # HTTP server entry point
│
├── tests/
│   ├── unit/
│   │   ├── auth/
│   │   ├── tasks/
│   │   ├── documents/
│   │   └── ai/
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── tasks.test.ts
│   │   ├── documents.test.ts
│   │   └── conversations.test.ts
│   └── helpers/
│       ├── testDb.ts              # Test database setup/teardown
│       └── testApp.ts             # Express app for supertest
│
├── .env.example
├── .eslintrc.json
├── jest.config.ts
├── package.json
└── tsconfig.json
```

---

## 6. Frontend

```
apps/frontend/
├── public/
│   └── favicon.svg
├── src/
│   ├── app/
│   │   ├── App.tsx                # Root component, providers
│   │   ├── router.tsx             # React Router route definitions
│   │   ├── providers.tsx          # QueryClient, Theme, Socket providers
│   │   └── queryClient.ts         # TanStack Query client config
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── api/
│   │   │   │   └── auth.api.ts
│   │   │   └── pages/
│   │   │       ├── LoginPage.tsx
│   │   │       └── RegisterPage.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── TaskSummaryWidget.tsx
│   │   │   │   ├── RecentDocumentsWidget.tsx
│   │   │   │   ├── RecentConversationsWidget.tsx
│   │   │   │   ├── OverdueTasksWidget.tsx
│   │   │   │   └── StreakWidget.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useDashboard.ts
│   │   │   └── pages/
│   │   │       └── DashboardPage.tsx
│   │   │
│   │   ├── tasks/
│   │   │   ├── components/
│   │   │   │   ├── TaskList.tsx
│   │   │   │   ├── TaskBoard.tsx
│   │   │   │   ├── TaskCard.tsx
│   │   │   │   ├── TaskForm.tsx
│   │   │   │   ├── TaskDetail.tsx
│   │   │   │   ├── TaskFilters.tsx
│   │   │   │   └── SubtaskList.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useTasks.ts
│   │   │   │   └── useTaskMutations.ts
│   │   │   ├── api/
│   │   │   │   └── tasks.api.ts
│   │   │   └── pages/
│   │   │       └── TasksPage.tsx
│   │   │
│   │   ├── projects/
│   │   │   ├── components/
│   │   │   │   ├── ProjectList.tsx
│   │   │   │   ├── ProjectCard.tsx
│   │   │   │   └── ProjectForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useProjects.ts
│   │   │   ├── api/
│   │   │   │   └── projects.api.ts
│   │   │   └── pages/
│   │   │       └── ProjectsPage.tsx
│   │   │
│   │   ├── ai/
│   │   │   ├── components/
│   │   │   │   ├── ConversationList.tsx
│   │   │   │   ├── ConversationView.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   ├── MessageInput.tsx
│   │   │   │   └── DocumentAttacher.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useConversations.ts
│   │   │   │   └── useAiStream.ts
│   │   │   ├── api/
│   │   │   │   └── conversations.api.ts
│   │   │   └── pages/
│   │   │       └── AiPage.tsx
│   │   │
│   │   ├── documents/
│   │   │   ├── components/
│   │   │   │   ├── DocumentEditor.tsx
│   │   │   │   ├── DocumentList.tsx
│   │   │   │   ├── CollectionTree.tsx
│   │   │   │   └── IndexingStatus.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useDocuments.ts
│   │   │   │   └── useAutoSave.ts
│   │   │   ├── api/
│   │   │   │   └── documents.api.ts
│   │   │   └── pages/
│   │   │       └── DocumentsPage.tsx
│   │   │
│   │   ├── snippets/
│   │   │   ├── components/
│   │   │   │   ├── SnippetList.tsx
│   │   │   │   ├── SnippetCard.tsx
│   │   │   │   └── SnippetForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useSnippets.ts
│   │   │   ├── api/
│   │   │   │   └── snippets.api.ts
│   │   │   └── pages/
│   │   │       └── SnippetsPage.tsx
│   │   │
│   │   ├── devtools/
│   │   │   ├── components/
│   │   │   │   ├── JsonFormatter.tsx
│   │   │   │   ├── JwtDecoder.tsx
│   │   │   │   ├── Base64Tool.tsx
│   │   │   │   ├── MarkdownPreviewer.tsx
│   │   │   │   └── YamlViewer.tsx
│   │   │   └── pages/
│   │   │       └── DevToolsPage.tsx
│   │   │
│   │   ├── notifications/
│   │   │   ├── components/
│   │   │   │   ├── NotificationBell.tsx
│   │   │   │   └── NotificationList.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useNotifications.ts
│   │   │   └── api/
│   │   │       └── notifications.api.ts
│   │   │
│   │   └── settings/
│   │       ├── components/
│   │       │   ├── ProfileSettings.tsx
│   │       │   ├── AppearanceSettings.tsx
│   │       │   ├── AiSettings.tsx
│   │       │   └── NotificationSettings.tsx
│   │       ├── hooks/
│   │       │   └── useSettings.ts
│   │       ├── api/
│   │       │   └── settings.api.ts
│   │       └── pages/
│   │           └── SettingsPage.tsx
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx       # Root layout: sidebar + header + content
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── PageContainer.tsx
│   │   │   ├── ui/                    # shadcn/ui re-exports + custom primitives
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── Skeleton.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Tooltip.tsx
│   │   │   │   └── ConfirmDialog.tsx
│   │   │   ├── CommandPalette.tsx
│   │   │   ├── GlobalSearch.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── hooks/
│   │   │   ├── useDebounce.ts
│   │   │   ├── useKeyboardShortcut.ts
│   │   │   ├── useSocket.ts
│   │   │   └── useClipboard.ts
│   │   ├── stores/
│   │   │   ├── auth.store.ts          # User session, access token
│   │   │   ├── ui.store.ts            # Sidebar state, theme, modals
│   │   │   └── socket.store.ts        # Socket.IO connection state
│   │   ├── api/
│   │   │   └── client.ts              # Axios instance + interceptors
│   │   ├── lib/
│   │   │   ├── utils.ts               # cn(), formatDate(), truncate()
│   │   │   └── constants.ts           # App-wide constants
│   │   └── types/
│   │       └── index.ts               # Re-export from @forge/shared
│   │
│   ├── assets/
│   │   └── logo.svg
│   ├── index.css                      # Tailwind base + CSS variables
│   └── main.tsx                       # Vite entry point
│
├── tests/
│   ├── unit/
│   │   └── components/
│   ├── e2e/
│   │   ├── auth.spec.ts
│   │   ├── tasks.spec.ts
│   │   ├── documents.spec.ts
│   │   └── ai.spec.ts
│   └── playwright.config.ts
│
├── .env.example
├── .eslintrc.json
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## 7. File Naming Conventions

| Pattern | Convention | Example |
|---|---|---|
| React components | PascalCase `.tsx` | `TaskCard.tsx` |
| Hooks | camelCase `use` prefix `.ts` | `useTasks.ts` |
| Services / repositories | camelCase `.ts` | `tasks.service.ts` |
| Routers / controllers | camelCase `.ts` | `tasks.router.ts` |
| Validators | camelCase `.ts` | `tasks.validator.ts` |
| Types | camelCase `.types.ts` | `task.types.ts` |
| Schemas | camelCase `.schemas.ts` | `task.schemas.ts` |
| Tests | same name `.test.ts` / `.spec.ts` | `tasks.service.test.ts` |
| Pages | PascalCase `Page` suffix | `TasksPage.tsx` |

---

## 8. Import Path Strategy

TypeScript path aliases configured in all `tsconfig.json` files:

```json
{
  "paths": {
    "@/*":           ["./src/*"],
    "@features/*":   ["./src/features/*"],
    "@shared/*":     ["./src/shared/*"],
    "@forge/shared": ["../../packages/shared/src"]
  }
}
```

No relative imports crossing feature boundaries. Features only import from `@shared/` or `@forge/shared`.

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| Feature folders growing too large | Each feature capped at components, hooks, api, pages — no sub-features |
| Shared package becoming a dumping ground | Only API contract types and Zod schemas allowed in shared package |
| Circular imports between features | ESLint `import/no-cycle` rule enforced in CI |

---

## 10. Deliverables

- [x] Monorepo root structure
- [x] Shared package structure
- [x] Complete backend folder tree with file purposes
- [x] Complete frontend folder tree with file purposes
- [x] File naming conventions
- [x] Import path strategy
- [x] Risk register updated

---

## 11. Updated Project Backlog

| Status | Item |
|---|---|
| ✅ Complete | Phase 1 — PRD |
| ✅ Complete | Phase 2 — Functional Requirements |
| ✅ Complete | Phase 3 — Non-functional Requirements |
| ✅ Complete | Phase 4 — System Architecture |
| ✅ Complete | Phase 5 — Database Design |
| ✅ Complete | Phase 6 — Folder Structure |
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
