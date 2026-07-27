// File: apps/frontend/src/features/settings/components/ProfileSettings.tsx
// Purpose: Name/bio/timezone profile editor

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@shared/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shared/components/ui/Card'
import { Input } from '@shared/components/ui/Input'
import { Label } from '@shared/components/ui/Label'
import { Spinner } from '@shared/components/ui/Spinner'
import { Textarea } from '@shared/components/ui/Textarea'
import { getApiErrorMessage } from '@shared/lib/apiError'
import { useProfile, useUpdateProfile } from '../hooks/useSettings'

interface ProfileFormValues {
  name: string
  bio: string
  timezone: string
}

export function ProfileSettings() {
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({ defaultValues: { name: '', bio: '', timezone: 'UTC' } })

  useEffect(() => {
    if (profile) {
      reset({ name: profile.name, bio: profile.bio ?? '', timezone: profile.timezone })
    }
  }, [profile, reset])

  function onSubmit(values: ProfileFormValues) {
    updateProfile.mutate({
      name: values.name,
      bio: values.bio || undefined,
      timezone: values.timezone,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>How you appear across the workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-md flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-name">Name</Label>
            <Input id="profile-name" {...register('name', { required: 'Name is required', maxLength: 100 })} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-bio">Bio</Label>
            <Textarea id="profile-bio" placeholder="A line about you" {...register('bio', { maxLength: 500 })} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="profile-timezone">Timezone</Label>
            <Input id="profile-timezone" placeholder="UTC" {...register('timezone', { required: true })} />
          </div>

          {updateProfile.isError && (
            <p role="alert" className="text-xs text-destructive">
              {getApiErrorMessage(updateProfile.error, 'Could not save your profile')}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={updateProfile.isPending || !isDirty}>
              {updateProfile.isPending && <Spinner />}
              Save profile
            </Button>
            {updateProfile.isSuccess && !isDirty && (
              <span className="text-xs text-success">Saved</span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
