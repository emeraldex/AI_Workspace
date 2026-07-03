// File: apps/backend/tests/integration/auth.test.ts
// Purpose: Integration tests for all auth endpoints using supertest
// Dependencies: supertest, testApp, testDb helpers

import request from 'supertest'
import { testApp } from '../helpers/testApp'
import { cleanDatabase, createTestUser } from '../helpers/testDb'
import { prisma } from '../../src/infrastructure/database/prisma.client'

beforeEach(async () => {
  await cleanDatabase()
})

afterAll(async () => {
  await prisma.$disconnect()
})

// ── POST /api/v1/auth/register ───────────────────────────────────────────────

describe('POST /api/v1/auth/register', () => {
  const validPayload = { name: 'Alice', email: 'alice@example.com', password: 'password123' }

  it('201 — creates user and returns accessToken', async () => {
    const res = await request(testApp).post('/api/v1/auth/register').send(validPayload)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.accessToken).toBeDefined()
    expect(res.body.data.user.email).toBe('alice@example.com')
    expect(res.headers['set-cookie']).toBeDefined()
  })

  it('409 — rejects duplicate email', async () => {
    await request(testApp).post('/api/v1/auth/register').send(validPayload)
    const res = await request(testApp).post('/api/v1/auth/register').send(validPayload)

    expect(res.status).toBe(409)
    expect(res.body.success).toBe(false)
  })

  it('400 — rejects invalid email', async () => {
    const res = await request(testApp)
      .post('/api/v1/auth/register')
      .send({ ...validPayload, email: 'not-an-email' })

    expect(res.status).toBe(400)
    expect(res.body.errors).toBeDefined()
  })

  it('400 — rejects short password', async () => {
    const res = await request(testApp)
      .post('/api/v1/auth/register')
      .send({ ...validPayload, password: 'short' })

    expect(res.status).toBe(400)
  })
})

// ── POST /api/v1/auth/login ──────────────────────────────────────────────────

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await createTestUser({ email: 'bob@example.com' })
  })

  it('200 — returns accessToken on valid credentials', async () => {
    const res = await request(testApp)
      .post('/api/v1/auth/login')
      .send({ email: 'bob@example.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.data.accessToken).toBeDefined()
    expect(res.headers['set-cookie']).toBeDefined()
  })

  it('401 — rejects wrong password', async () => {
    const res = await request(testApp)
      .post('/api/v1/auth/login')
      .send({ email: 'bob@example.com', password: 'wrongpassword' })

    expect(res.status).toBe(401)
  })

  it('401 — rejects unknown email', async () => {
    const res = await request(testApp)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' })

    expect(res.status).toBe(401)
  })
})

// ── POST /api/v1/auth/refresh ────────────────────────────────────────────────

describe('POST /api/v1/auth/refresh', () => {
  it('200 — issues new accessToken with valid refresh cookie', async () => {
    const loginRes = await request(testApp)
      .post('/api/v1/auth/register')
      .send({ name: 'Carol', email: 'carol@example.com', password: 'password123' })

    const cookie = loginRes.headers['set-cookie']

    const res = await request(testApp)
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookie)

    expect(res.status).toBe(200)
    expect(res.body.data.accessToken).toBeDefined()
  })

  it('401 — rejects request with no cookie', async () => {
    const res = await request(testApp).post('/api/v1/auth/refresh')
    expect(res.status).toBe(401)
  })
})

// ── POST /api/v1/auth/logout ─────────────────────────────────────────────────

describe('POST /api/v1/auth/logout', () => {
  it('204 — clears cookie and invalidates token', async () => {
    const loginRes = await request(testApp)
      .post('/api/v1/auth/register')
      .send({ name: 'Dave', email: 'dave@example.com', password: 'password123' })

    const { accessToken } = loginRes.body.data
    const cookie = loginRes.headers['set-cookie']

    const res = await request(testApp)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .set('Cookie', cookie)

    expect(res.status).toBe(204)

    // Refresh should now fail
    const refreshRes = await request(testApp)
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookie)

    expect(refreshRes.status).toBe(401)
  })
})

// ── POST /api/v1/auth/change-password ────────────────────────────────────────

describe('POST /api/v1/auth/change-password', () => {
  it('200 — updates password and invalidates sessions', async () => {
    const regRes = await request(testApp)
      .post('/api/v1/auth/register')
      .send({ name: 'Eve', email: 'eve@example.com', password: 'password123' })

    const { accessToken } = regRes.body.data

    const res = await request(testApp)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: 'password123', newPassword: 'newpassword456' })

    expect(res.status).toBe(200)
  })

  it('401 — rejects wrong current password', async () => {
    const regRes = await request(testApp)
      .post('/api/v1/auth/register')
      .send({ name: 'Frank', email: 'frank@example.com', password: 'password123' })

    const { accessToken } = regRes.body.data

    const res = await request(testApp)
      .post('/api/v1/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: 'wrongpassword', newPassword: 'newpassword456' })

    expect(res.status).toBe(401)
  })

  it('401 — rejects unauthenticated request', async () => {
    const res = await request(testApp)
      .post('/api/v1/auth/change-password')
      .send({ currentPassword: 'password123', newPassword: 'newpassword456' })

    expect(res.status).toBe(401)
  })
})
