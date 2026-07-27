// File: apps/backend/tests/helpers/setupEnv.ts
// Purpose: Provides required environment variables before any module under test
//          imports shared/config (which exits the process on missing config).
//          Real values from the environment (e.g. CI) take precedence.

process.env.NODE_ENV = 'test'
process.env.DATABASE_URL ??= 'postgresql://forge:forge@localhost:5432/forge_ai_test'
process.env.REDIS_URL ??= 'redis://localhost:6379'
process.env.JWT_SECRET ??= 'test-jwt-secret-at-least-32-chars-long'
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-min-32-chars-long'
// Must be exactly 32 characters (AES-256-GCM key)
process.env.ENCRYPTION_KEY ??= 'test-encryption-key-32-chars-ok!'
