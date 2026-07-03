// File: apps/backend/tests/helpers/testApp.ts
// Purpose: Creates an Express app instance for supertest integration tests

import { createApp } from '../../src/app'

export const testApp = createApp()
