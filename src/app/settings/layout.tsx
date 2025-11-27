'use client'

import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { ThemeProvider } from '@/contexts/theme-context'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </ThemeProvider>
  )
}
