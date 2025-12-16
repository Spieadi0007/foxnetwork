'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  MapPin,
  Calendar,
  Users,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  ChevronDown,
  Bell,
  HelpCircle,
  LogOut,
  Sparkles,
  MessageSquare,
  ClipboardList,
  FolderKanban,
  Activity,
  Package,
  Box,
  Truck,
  UserCircle,
  Headphones,
  LifeBuoy,
  Map,
  Briefcase,
  Library,
} from 'lucide-react'
import type { Company } from '@/types/user'
import { useTheme } from '@/contexts/theme-context'

interface SidebarProps {
  company: Company | null
  onSignOut: () => void
}

interface NavItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: string | number
  children?: { name: string; href: string; icon: React.ElementType }[]
}

const navigation: { section: string; items: NavItem[] }[] = [
  {
    section: 'OVERVIEW',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Map View', href: '/map', icon: Map },
    ],
  },
  {
    section: 'SERVICE',
    items: [
      { name: 'Requests', href: '/requests', icon: ClipboardList, badge: 3 },
      { name: 'Projects', href: '/projects', icon: FolderKanban },
      { name: 'Services', href: '/services', icon: Briefcase },
      { name: 'Actions', href: '/activity', icon: Activity },
    ],
  },
  {
    section: 'ASSETS',
    items: [
      { name: 'Locations', href: '/locations', icon: MapPin },
      { name: 'Assets', href: '/equipment', icon: Package },
      { name: 'Inventory', href: '/inventory', icon: Box },
      { name: 'Library', href: '/library', icon: Library },
    ],
  },
  {
    section: 'OPERATIONS',
    items: [
      { name: 'Schedule', href: '/schedule', icon: Calendar },
      { name: 'My Team', href: '/team', icon: Users },
      { name: 'Assigned Resources', href: '/resources', icon: Truck },
    ],
  },
  {
    section: 'SUPPORT',
    items: [
      { name: 'Live Chat', href: '/support', icon: MessageSquare, badge: 'Live' },
      { name: 'Help Center', href: '/help', icon: LifeBuoy },
    ],
  },
]

const bottomNavigation: NavItem[] = [
  { name: 'Notifications', href: '/notifications', icon: Bell, badge: 5 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function ClientSidebar({ company, onSignOut }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed left-0 top-0 h-screen flex flex-col z-40 border-r ${
        isDark
          ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-white/5'
          : 'bg-gradient-to-b from-white via-slate-50 to-slate-100 border-slate-200'
      }`}
    >
      {/* Decorative gradient orb - Blue theme for clients */}
      <div className={`absolute top-0 left-0 w-full h-64 bg-gradient-to-br pointer-events-none ${
        isDark ? 'from-blue-600/20 via-transparent to-transparent' : 'from-blue-200/50 via-transparent to-transparent'
      }`} />
      <div className={`absolute bottom-0 left-0 w-full h-64 bg-gradient-to-tr pointer-events-none ${
        isDark ? 'from-cyan-600/10 via-transparent to-transparent' : 'from-cyan-200/40 via-transparent to-transparent'
      }`} />

      {/* Logo & Company */}
      <div className={`relative p-4 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <motion.div
              className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-white font-bold text-xl">F</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
            </motion.div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden"
                >
                  <span className={`font-bold text-xl whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>Fox</span>
                  <span className="text-blue-500 text-xl font-light">.io</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>
          <motion.button
            onClick={() => setCollapsed(!collapsed)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700'
            }`}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </motion.button>
        </div>

        {/* Company Selector */}
        {!collapsed && company && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4"
          >
            <button className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${
              isDark
                ? 'bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10'
                : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-sm'
            }`}>
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="w-7 h-7 rounded object-contain" />
                ) : (
                  <Building2 className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{company.name}</p>
                <p className={`text-xs capitalize flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Client Portal
                </p>
              </div>
              <ChevronDown className={`w-4 h-4 transition-colors ${isDark ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400 group-hover:text-slate-600'}`} />
            </button>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`relative flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-track-transparent ${isDark ? 'scrollbar-thumb-white/10' : 'scrollbar-thumb-slate-300'}`}>
        {navigation.map((group, groupIndex) => (
          <div key={group.section} className="mb-6">
            {!collapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: groupIndex * 0.05 }}
                className={`px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
              >
                {group.section}
              </motion.p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href)

                return (
                  <li key={item.name}>
                    <Link href={item.href}>
                      <motion.div
                        whileHover={{ x: 2 }}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative
                          ${active
                            ? isDark ? 'text-white' : 'text-slate-900'
                            : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                          }
                        `}
                      >
                        {active && (
                          <motion.div
                            layoutId="activeClientNav"
                            className={`absolute inset-0 rounded-xl ${isDark ? 'bg-gradient-to-r from-blue-500/20 via-blue-500/10 to-transparent' : 'bg-gradient-to-r from-blue-500/15 via-blue-500/5 to-transparent'}`}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        <div className={`relative p-2 rounded-lg ${active ? 'bg-blue-500/20' : isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                          <item.icon className={`w-4 h-4 ${active ? 'text-blue-500' : ''}`} />
                        </div>
                        {!collapsed && (
                          <>
                            <span className="relative font-medium text-sm">{item.name}</span>
                            {item.badge && (
                              <span className={`relative ml-auto px-2 py-0.5 text-xs font-medium rounded-full ${
                                item.badge === 'Live'
                                  ? 'bg-emerald-500/20 text-emerald-400 animate-pulse'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </motion.div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className={`relative border-t p-3 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        {/* Support Card */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-3 p-3 rounded-xl border ${
              isDark
                ? 'bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-teal-500/20 border-white/10'
                : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600">
                <Headphones className="w-3.5 h-3.5 text-white" />
              </div>
              <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Need Help?</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Our support team is available 24/7 to assist you.</p>
          </motion.div>
        )}

        <ul className="space-y-1">
          {bottomNavigation.map((item) => {
            const active = isActive(item.href)
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <motion.div
                    whileHover={{ x: 2 }}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                      ${active
                        ? isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900'
                        : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    {!collapsed && (
                      <>
                        <span className="font-medium text-sm">{item.name}</span>
                        {item.badge && (
                          <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-red-500/20 text-red-400 rounded-full animate-pulse">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </motion.div>
                </Link>
              </li>
            )
          })}
          <li>
            <motion.button
              onClick={onSignOut}
              whileHover={{ x: 2 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-600 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <LogOut className="w-5 h-5" />
              {!collapsed && <span className="font-medium text-sm">Sign Out</span>}
            </motion.button>
          </li>
        </ul>
      </div>
    </motion.aside>
  )
}
