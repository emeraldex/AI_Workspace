// File: apps/frontend/src/features/dashboard/hooks/useDashboard.ts
// Purpose: Dashboard data query

import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboard.api'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.get,
    staleTime: 30_000,
  })
}
