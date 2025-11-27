'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser-client'
import { Sidebar } from './sidebar'
import { ClientSidebar } from '@/components/client/sidebar'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import type { User, Company } from '@/types/user'
import { Bell, Search, Command, Sparkles, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { theme, toggleTheme } = useTheme()

  const isDark = theme === 'dark'

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        router.push('/sign-in')
        return
      }

      // Fetch user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        setLoading(false)
        return
      }

      // Check if onboarding is completed
      if (!userProfile.onboarding_completed) {
        router.push('/onboarding')
        return
      }

      setUser(userProfile)

      // Fetch company separately if user has one
      if (userProfile.company_id) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('id', userProfile.company_id)
          .single()

        if (companyData) {
          setCompany(companyData)
        }
      }

      setLoading(false)
    }

    getUser()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/')
  }

  // Determine if user is a client
  const isClient = company?.type === 'client'

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'}`}>
        <div className="text-center">
          <motion.div
            className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/25"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <span className="text-white font-bold text-2xl">F</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-700'}`}>Loading your workspace</p>
            <div className="flex items-center justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-emerald-500"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Client Portal UI
  if (isClient) {
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

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'}`}>
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-0 right-0 w-[800px] h-[800px] rounded-full blur-3xl ${isDark ? 'bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent' : 'bg-gradient-to-br from-emerald-200/40 via-teal-200/30 to-transparent'}`} />
        <div className={`absolute bottom-0 left-1/3 w-[600px] h-[600px] rounded-full blur-3xl ${isDark ? 'bg-gradient-to-tr from-violet-500/5 via-purple-500/5 to-transparent' : 'bg-gradient-to-tr from-violet-200/40 via-purple-200/30 to-transparent'}`} />
        <div className={`absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full blur-3xl ${isDark ? 'bg-gradient-to-r from-blue-500/5 to-transparent' : 'bg-gradient-to-r from-blue-200/40 to-transparent'}`} />
      </div>

      {/* Sidebar */}
      <Sidebar company={company} onSignOut={handleSignOut} />

      {/* Main Content */}
      <div className="pl-[280px] transition-all duration-300 relative">
        {/* Top Header */}
        <header className={`sticky top-0 z-30 backdrop-blur-xl border-b ${isDark ? 'bg-slate-900/50 border-white/5' : 'bg-white/70 border-slate-200/50'}`}>
          <div className="flex items-center justify-between h-16 px-6">
            {/* Search */}
            <div className="flex-1 max-w-xl">
              <div className="relative group">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${isDark ? 'text-slate-500 group-focus-within:text-emerald-400' : 'text-slate-400 group-focus-within:text-emerald-500'}`} />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className={`w-full pl-12 pr-20 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                    isDark
                      ? 'bg-white/5 border border-white/5 text-white placeholder:text-slate-500 focus:ring-emerald-500/20 focus:border-emerald-500/30 focus:bg-white/10'
                      : 'bg-slate-100/80 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-emerald-500/20 focus:border-emerald-500/50 focus:bg-white'
                  }`}
                />
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-200'}`}>
                  <Command className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>K</span>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl transition-all ${
                  isDark
                    ? 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-slate-400'
                    : 'bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 shadow-sm'
                }`}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>

              {/* AI Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  isDark
                    ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/20 text-violet-300 hover:border-violet-500/30'
                    : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Ask AI</span>
              </motion.button>

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative p-2.5 rounded-xl transition-all ${
                  isDark
                    ? 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10'
                    : 'bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                }`}
              >
                <Bell className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                <span className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse ${isDark ? 'border-2 border-slate-900' : 'border-2 border-white'}`}></span>
              </motion.button>

              {/* User Menu */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                className={`flex items-center gap-3 p-1.5 pr-4 rounded-xl transition-all ${
                  isDark
                    ? 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10'
                    : 'bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name || ''} className="w-9 h-9 rounded-lg object-cover" />
                  ) : (
                    <span className="text-white font-semibold text-sm">
                      {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.full_name || 'User'}</p>
                  <p className={`text-xs capitalize ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user?.role || 'Member'}</p>
                </div>
              </motion.button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 relative">
          {children}
        </main>
      </div>
    </div>
  )
}
