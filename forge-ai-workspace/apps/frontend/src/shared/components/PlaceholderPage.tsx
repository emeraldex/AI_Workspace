// File: apps/frontend/src/shared/components/PlaceholderPage.tsx
// Purpose: Temporary stand-in for feature pages not yet implemented

import type { LucideIcon } from 'lucide-react'
import { PageContainer } from '@shared/components/layout/PageContainer'
import { Card, CardContent } from '@shared/components/ui/Card'

interface PlaceholderPageProps {
  title: string
  description: string
  icon: LucideIcon
}

export function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <PageContainer title={title}>
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <Icon className="h-10 w-10 text-muted-foreground" />
          <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
