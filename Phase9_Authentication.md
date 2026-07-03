# Forge AI Workspace — Phase 9: Authentication

---

## 1. Objectives

Implement the complete authentication system — JWT access tokens, refresh token rotation, bcrypt password hashing, AES-256-GCM API key encryption, all auth endpoints, middleware, and full test coverage — as the security foundation every other domain builds on.

---

## 2. Files Produced

### Monorepo Root
| File | Purpose |
|---|---|
| `package.json` | Workspace root with npm workspaces |
| `.gitignore` | Ignores node_modules, dist, .env, coverage |
| `.env.example` | All required environment variables documented |
| `docker-compose.yml` | PostgreSQL (pgvector) + Redis for local development |

### Shared Package (`packages/shared/`)
| File | Purpose |
|---|---|
| `src/types/api.types.ts` | `ApiResponse<T>`, `PaginatedResponse<T>`, `FieldError` |
| `src/types/auth.types.ts` | `RegisterRequest`, `LoginRequest`, `AuthResponse`, `AuthUser` |
| `src/types/user.types.ts` | `UserProfile`, `UserSettings`, `UpdateProfileRequest` |
| `src/schemas/auth.schemas.ts` | Zod schemas shared with frontend forms |
| `src/index.ts` | Barrel export |

### Backend Infrastructure (`apps/backend/src/`)
| File | Purpose |
|---|---|
| `shared/config/index.ts` | Zod-validated env config — app exits on invalid config |
| `shared/logger/index.ts` | Pino structured logger singleton |
| `shared/errors/AppError.ts` | Typed error hierarchy (Validation, Auth, Forbidden, NotFound, Conflict, Internal) |
| `shared/crypto/encryption.ts` | AES-256-GCM encrypt/decrypt for sensitive fields |
| `shared/types/express.d.ts` | Express Request augmented with `user` and `requestId` |
| `shared/middleware/requestId.ts` | UUID attached to every request |
| `shared/middleware/requestLogger.ts` | Structured request/response logging |
| `shared/middleware/authenticate.ts` | JWT verification — attaches `req.user` |
| `shared/middleware/rateLimiter.ts` | Auth (10/15min), register (5/15min), general (100/min) |
| `shared/middleware/validate.ts` | Zod middleware factory for body/query/params |
| `shared/middleware/errorHandler.ts` | Global error handler — maps AppError to HTTP responses |
| `infrastructure/database/prisma.client.ts` | Prisma singleton with dev hot-reload guard |
| `infrastructure/cache/redis.client.ts` | ioredis singleton |
| `prisma/schema.prisma` | Complete database schema (all domains) |

### Auth Domain (`apps/backend/src/domains/auth/`)
| File | Purpose |
|---|---|
| `auth.repository.ts` | All DB operations — find user, create user, refresh token CRUD |
| `auth.service.ts` | Business logic — register, login, refresh, logout, changePassword |
| `auth.validator.ts` | Zod schemas for request validation |
| `auth.controller.ts` | HTTP layer — reads request, calls service, sets cookies |
| `auth.router.ts` | Express router wiring middleware + controller |

### App Entry Points
| File | Purpose |
|---|---|
| `src/app.ts` | Express app factory (importable by tests without binding port) |
| `src/server.ts` | HTTP server with graceful shutdown |

### Tests
| File | Purpose |
|---|---|
| `tests/helpers/testApp.ts` | Express app instance for supertest |
| `tests/helpers/testDb.ts` | `cleanDatabase()` and `createTestUser()` helpers |
| `tests/unit/auth/auth.service.test.ts` | 7 unit tests covering register, login, changePassword |
| `tests/integration/auth.test.ts` | 13 integration tests covering all 5 auth endpoints |

---

## 3. Design Decisions

| Decision | Rationale |
|---|---|
| Refresh token stored as SHA-256 hash | Raw token never persisted; hash comparison is sufficient and safe |
| Refresh token in httpOnly cookie, access token in memory | XSS cannot steal the long-lived token; CSRF cannot use the short-lived token |
| Cookie path scoped to `/api/v1/auth` | Refresh token cookie not sent on every API request — only auth routes |
| `generateAccessToken` uses `sub` claim for userId | JWT standard; `sub` is the canonical subject identifier |
| Refresh token rotation on every use | Prevents token reuse after theft; old token immediately invalidated |
| All sessions invalidated on password change | Security best practice — compromised sessions cannot persist after credential change |
| `createApp()` factory pattern | Allows supertest to import the app without binding a port |
| Config validated at startup with Zod | App refuses to start with missing/invalid environment — no silent misconfiguration |

---

## 4. Security Controls Applied

| Control | Implementation |
|---|---|
| Password hashing | bcrypt, cost factor 12 |
| Refresh token storage | SHA-256 hash only — raw token never in database |
| Access token signing | HS256, minimum 32-char secret from environment |
| Sensitive field encryption | AES-256-GCM with authenticated encryption |
| Rate limiting | 5 req/15min register, 10 req/15min login, 100 req/min general |
| Security headers | Helmet.js applied globally |
| CORS | Allowlist from environment variable |
| Input validation | Zod on all request bodies |
| Error messages | Generic auth errors (no user enumeration via "email not found") |
| Stack traces | Never exposed in production responses |

---

## 5. Token Flow

```
Register / Login
  → bcrypt.compare (login) or bcrypt.hash (register)
  → generateAccessToken()  → JWT signed HS256, 15min
  → generateRefreshToken() → 64 random bytes, SHA-256 hashed for storage
  → refreshToken stored in DB (hash only)
  → accessToken returned in JSON body
  → refreshToken set as httpOnly cookie (path: /api/v1/auth)

On 401 (expired access token):
  → Client sends POST /api/v1/auth/refresh with cookie
  → Server: hash cookie value → lookup in DB → validate expiry
  → Delete old token → create new token (rotation)
  → Return new accessToken + set new refreshToken cookie

On logout:
  → Delete refresh token from DB
  → Clear cookie

On password change:
  → Verify current password
  → Hash new password
  → deleteAllUserRefreshTokens (all sessions invalidated)
  → Clear cookie
```

---

## 6. Alternatives Considered

| Alternative | Reason Rejected |
|---|---|
| RS256 asymmetric JWT | Adds key management complexity; HS256 with a strong secret is sufficient for single-server v1.0 |
| Storing refresh token plaintext | Security risk — database breach would expose long-lived tokens |
| Session-based auth | Stateful; complicates horizontal scaling |
| Separate refresh token endpoint path | `/api/v1/auth/refresh` is cleaner and consistent with the auth domain |

---

## 7. Risks

| Risk | Mitigation |
|---|---|
| JWT secret rotation in production | Requires re-login for all users; acceptable — document in ops runbook |
| bcrypt timing on high-load login | bcrypt is intentionally slow; rate limiting prevents abuse |
| Cookie theft via network | `secure: true` in production enforces HTTPS-only transmission |

---

## 8. Deliverables

- [x] Monorepo scaffolded (root, shared, backend, docker)
- [x] Prisma schema (all domains)
- [x] Config validation (Zod, startup exit on failure)
- [x] Logger (Pino structured JSON)
- [x] Error hierarchy (6 typed error classes)
- [x] AES-256-GCM encryption utility
- [x] All 5 middleware (requestId, requestLogger, authenticate, rateLimiter, validate, errorHandler)
- [x] Auth repository (7 methods)
- [x] Auth service (5 methods, full token lifecycle)
- [x] Auth controller (5 handlers)
- [x] Auth router (5 routes with correct middleware chains)
- [x] Express app factory + server entry point with graceful shutdown
- [x] 7 unit tests (auth service)
- [x] 13 integration tests (all auth endpoints, happy + error paths)
- [x] docker-compose.yml (PostgreSQL + Redis)

---

## 9. Updated Project Backlog

| Status | Item |
|---|---|
| ✅ Complete | Phase 1 — PRD |
| ✅ Complete | Phase 2 — Functional Requirements |
| ✅ Complete | Phase 3 — Non-functional Requirements |
| ✅ Complete | Phase 4 — System Architecture |
| ✅ Complete | Phase 5 — Database Design |
| ✅ Complete | Phase 6 — Folder Structure |
| ✅ Complete | Phase 7 — UI Design System |
| ✅ Complete | Phase 8 — API Design |
| ✅ Complete | Phase 9 — Authentication |
| ⏳ Pending | Phase 10 — Backend Development |
| ⏳ Pending | Phase 11 — Frontend Development |
| ⏳ Pending | Phase 12 — AI Integration |
| ⏳ Pending | Phase 13 — Testing |
| ⏳ Pending | Phase 14 — DevOps |
| ⏳ Pending | Phase 15 — Deployment |
| ⏳ Pending | Phase 16 — Optimization |
| ⏳ Pending | Phase 17 — Documentation |
