// File: apps/frontend/src/features/dashboard/pages/DashboardPage.tsx
// Purpose: Dashboard — widget grid handling loading / error / success states

import { FileText, MessagesSquare, RefreshCw } from 'lucide-react'
import { PageContainer } from '@shared/components/layout/PageContainer'
import { Button } from '@shared/components/ui/Button'
import { Card, CardContent } from '@shared/components/ui/Card'
import { Skeleton } from '@shared/components/ui/Skeleton'
import { getApiErrorMessage } from '@shared/lib/apiError'
import { useAuthStore } from '@shared/stores/auth.store'
import { useDashboard } from '../hooks/useDashboard'
import { TaskSummaryWidget } from '../components/TaskSummaryWidget'
import { OverdueTasksWidget } from '../components/OverdueTasksWidget'
import { RecentItemsWidget } from '../components/RecentItemsWidget'
import { StreakWidget } from '../components/StreakWidget'

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
      <Skeleton className="h-64 md:col-span-2" />
      <Skeleton className="h-48" />
      <Skeleton className="h-48" />
    </div>
  )
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data, isPending, isError, error, refetch } = useDashboard()

  return (
    <PageContainer
      title={`Welcome back${user ? `, ${user.name.split(' ')[0]}` : ''}`}
      description="Here's what's on your plate"
    >
      {isPending ? (
        <DashboardSkeleton />
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {getApiErrorMessage(error, 'Failed to load your dashboard')}
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw />
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <TaskSummaryWidget summary={data.taskSummary} />
          <StreakWidget streak={data.streak} />
          <div className="md:col-span-2">
            <OverdueTasksWidget todayTasks={data.todayTasks} overdueTasks={data.overdueTasks} />
          </div>
          <RecentItemsWidget
            title="Recent documents"
            icon={FileText}
            items={data.recentDocuments}
            hrefBase="/documents"
            emptyText="No documents yet."
          />
          <RecentItemsWidget
            title="Recent conversations"
            icon={MessagesSquare}
            items={data.recentConversations}
            hrefBase="/ai"
            emptyText="No conversations yet."
          />
        </div>
      )}
    </PageContainer>
  )
}
