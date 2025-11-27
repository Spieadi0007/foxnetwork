'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser-client'
import { ClientSidebar } from '@/components/client/sidebar'
import { useTheme } from '@/contexts/theme-context'
import type { User, Company } from '@/types/user'
import { Sun, Moon } from 'lucide-react'
import { motion } from 'framer-motion'

export function ClientLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    const supabase = createClient()

    const checkAuth = async () => {
      // Use getUser instead of getSession for better security
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      console.log('Client Layout Auth Check:', {
        authUser: authUser?.email,
        authError: authError?.message
      })

      if (authError || !authUser) {
        console.log('No auth user, redirecting to sign-in')
        router.push('/sign-in')
        return
      }

      // Fetch user profile with company data
      // Use explicit foreign key reference to avoid ambiguity
      const { data: userData, error } = await supabase
        .from('users')
        .select(`
          *,
          company:companies!users_company_id_fkey(*)
        `)
        .eq('id', authUser.id)
        .single()

      console.log('User Profile Fetch:', {
        userData,
        error: error?.message,
        companyType: userData?.company?.type
      })

      if (error || !userData) {
        console.log('No user data found, redirecting to sign-in')
        router.push('/sign-in')
        return
      }

      // Check if user's company is a client
      if (userData.company?.type !== 'client') {
        console.log('Not a client company, redirecting to dashboard')
        // Redirect partners to partner dashboard
        router.push('/dashboard')
        return
      }

      console.log('All checks passed, setting user data')
      setUser(userData)
      setCompany(userData.company)
      setLoading(false)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/sign-in')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/sign-in')
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          </div>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading client portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <ClientSidebar company={company} onSignOut={handleSignOut} />

      {/* Main Content */}
      <main className="pl-[280px] min-h-screen">
        {/* Top Bar */}
        <header className={`sticky top-0 z-30 backdrop-blur-xl border-b ${
          isDark ? 'bg-slate-950/80 border-white/5' : 'bg-white/80 border-slate-200'
        }`}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              {/* Breadcrumb or page title can go here */}
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2.5 rounded-xl transition-colors ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700'
                }`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>

              {/* User Avatar */}
              <div className="flex items-center gap-3">
                <div className={`text-right ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <p className="text-sm font-medium">{user?.full_name || 'User'}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{user?.email}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-bold">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
