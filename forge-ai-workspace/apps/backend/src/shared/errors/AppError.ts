// File: apps/backend/src/shared/errors/AppError.ts
// Purpose: Typed error hierarchy — all domain errors extend AppError.
//          The global error handler maps these to HTTP responses.

export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly errors?: { field: string; message: string }[],
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(errors: { field: string; message: string }[]) {
    super('Validation failed', 400, errors)
  }
}

export class AuthError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403)
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409)
  }
}

export class InternalError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500)
  }
}
