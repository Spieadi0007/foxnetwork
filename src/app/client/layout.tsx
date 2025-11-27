'use client'

import { ThemeProvider } from '@/contexts/theme-context'
import { ClientLayoutContent } from '@/components/client/client-layout'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </ThemeProvider>
  )
}
