// File: apps/frontend/src/features/auth/components/LoginForm.tsx
// Purpose: Login form — validated with the same Zod schema the backend enforces

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { loginSchema, type LoginInput } from '@forge/shared'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Label } from '@shared/components/ui/Label'
import { Spinner } from '@shared/components/ui/Spinner'
import { getApiErrorMessage } from '@shared/lib/apiError'
import { useLogin } from '../hooks/useAuth'

export function LoginForm() {
  const navigate = useNavigate()
  const login = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  function onSubmit(values: LoginInput) {
    login.mutate(values, { onSuccess: () => navigate('/', { replace: true }) })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" className="text-xs text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-describedby={errors.password ? 'password-error' : undefined}
          {...register('password')}
        />
        {errors.password && (
          <p id="password-error" className="text-xs text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      {login.isError && (
        <p role="alert" className="text-xs text-destructive">
          {getApiErrorMessage(login.error, 'Login failed')}
        </p>
      )}

      <Button type="submit" disabled={login.isPending} className="mt-2">
        {login.isPending && <Spinner />}
        Sign in
      </Button>
    </form>
  )
}
