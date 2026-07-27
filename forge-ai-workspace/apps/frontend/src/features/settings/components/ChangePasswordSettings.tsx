// File: apps/frontend/src/features/settings/components/ChangePasswordSettings.tsx
// Purpose: Password change — backend revokes all sessions, so we log out and
//          send the user back to login on success.

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { changePasswordSchema, type ChangePasswordInput } from '@forge/shared'
import { Button } from '@shared/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { Label } from '@shared/components/ui/Label'
import { Spinner } from '@shared/components/ui/Spinner'
import { getApiErrorMessage } from '@shared/lib/apiError'
import { useAuthStore } from '@shared/stores/auth.store'
import { useChangePassword } from '../hooks/useSettings'

export function ChangePasswordSettings() {
  const changePassword = useChangePassword()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) })

  function onSubmit(values: ChangePasswordInput) {
    changePassword.mutate(values, {
      onSuccess: () => {
        // All sessions are invalidated server-side; start fresh
        useAuthStore.getState().clearAuth()
        navigate('/login', { replace: true })
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>Changing your password signs you out everywhere</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-md flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              {...register('currentPassword')}
            />
            {errors.currentPassword && (
              <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              {...register('newPassword')}
            />
            {errors.newPassword && (
              <p className="text-xs text-destructive">{errors.newPassword.message}</p>
            )}
          </div>

          {changePassword.isError && (
            <p role="alert" className="text-xs text-destructive">
              {getApiErrorMessage(changePassword.error, 'Could not change password')}
            </p>
          )}

          <Button type="submit" disabled={changePassword.isPending} className="self-start">
            {changePassword.isPending && <Spinner />}
            Change password
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
