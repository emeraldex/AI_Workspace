// File: apps/frontend/src/features/auth/components/RegisterForm.tsx
// Purpose: Registration form — validated with the shared Zod schema

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { registerSchema, type RegisterInput } from '@forge/shared'
import { Button } from '@shared/components/ui/Button'
import { Input } from '@shared/components/ui/Input'
import { Label } from '@shared/components/ui/Label'
import { Spinner } from '@shared/components/ui/Spinner'
import { getApiErrorMessage } from '@shared/lib/apiError'
import { useRegister } from '../hooks/useAuth'

export function RegisterForm() {
  const navigate = useNavigate()
  const registerMutation = useRegister()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) })

  function onSubmit(values: RegisterInput) {
    registerMutation.mutate(values, { onSuccess: () => navigate('/', { replace: true }) })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          aria-describedby={errors.name ? 'name-error' : undefined}
          {...register('name')}
        />
        {errors.name && (
          <p id="name-error" className="text-xs text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

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
          autoComplete="new-password"
          aria-describedby={errors.password ? 'password-error' : undefined}
          {...register('password')}
        />
        {errors.password && (
          <p id="password-error" className="text-xs text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      {registerMutation.isError && (
        <p role="alert" className="text-xs text-destructive">
          {getApiErrorMessage(registerMutation.error, 'Registration failed')}
        </p>
      )}

      <Button type="submit" disabled={registerMutation.isPending} className="mt-2">
        {registerMutation.isPending && <Spinner />}
        Create account
      </Button>
    </form>
  )
}
