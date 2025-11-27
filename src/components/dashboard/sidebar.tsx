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
  GraduationCap,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  ChevronDown,
  ClipboardList,
  Truck,
  Receipt,
  CreditCard,
  AlertCircle,
  BookOpen,
  Award,
  FileCheck,
  TrendingUp,
  PieChart,
  Bell,
  HelpCircle,
  LogOut,
  Sparkles,
  Car,
  Wrench,
  Fuel,
  Package,
  Warehouse,
  MapPinned,
  ShoppingCart,
  Box,
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
      { name: 'Work Orders', href: '/dashboard/work-orders', icon: ClipboardList },
      { name: 'Map View', href: '/dashboard/map', icon: MapPin },
    ],
  },
  {
    section: 'OPERATIONS',
    items: [
      {
        name: 'Scheduling',
        href: '/dashboard/scheduling',
        icon: Calendar,
        children: [
          { name: 'Calendar', href: '/dashboard/scheduling/calendar', icon: Calendar },
          { name: 'Routing', href: '/dashboard/scheduling/routing', icon: Truck },
        ],
      },
      {
        name: 'Team',
        href: '/dashboard/team',
        icon: Users,
        children: [
          { name: 'Technicians', href: '/dashboard/team/technicians', icon: Users },
          { name: 'Performance', href: '/dashboard/team/performance', icon: TrendingUp },
        ],
      },
      {
        name: 'Fleet',
        href: '/dashboard/fleet',
        icon: Car,
        children: [
          { name: 'Vehicles', href: '/dashboard/fleet/vehicles', icon: Truck },
          { name: 'Maintenance', href: '/dashboard/fleet/maintenance', icon: Wrench },
          { name: 'Fuel Log', href: '/dashboard/fleet/fuel', icon: Fuel },
        ],
      },
      {
        name: 'Inventory',
        href: '/dashboard/inventory',
        icon: Package,
        children: [
          { name: 'Parts & Spares', href: '/dashboard/inventory/parts', icon: Box },
          { name: 'Locations', href: '/dashboard/inventory/locations', icon: MapPinned },
          { name: 'Orders', href: '/dashboard/inventory/orders', icon: ShoppingCart },
        ],
      },
    ],
  },
  {
    section: 'FINANCE',
    items: [
      {
        name: 'Invoicing',
        href: '/dashboard/invoicing',
        icon: Receipt,
        children: [
          { name: 'Invoices', href: '/dashboard/invoicing/list', icon: FileText },
          { name: 'Rate Cards', href: '/dashboard/invoicing/rate-cards', icon: CreditCard },
          { name: 'Disputes', href: '/dashboard/invoicing/disputes', icon: AlertCircle },
        ],
      },
    ],
  },
  {
    section: 'LEARNING',
    items: [
      {
        name: 'Training',
        href: '/dashboard/training',
        icon: GraduationCap,
        children: [
          { name: 'Courses', href: '/dashboard/training/courses', icon: BookOpen },
          { name: 'Certifications', href: '/dashboard/training/certifications', icon: Award },
          { name: 'Documents', href: '/dashboard/training/documents', icon: FileCheck },
        ],
      },
    ],
  },
  {
    section: 'INSIGHTS',
    items: [
      {
        name: 'Analytics',
        href: '/dashboard/analytics',
        icon: BarChart3,
        children: [
          { name: 'Overview', href: '/dashboard/analytics/overview', icon: PieChart },
          { name: 'Reports', href: '/dashboard/analytics/reports', icon: FileText },
        ],
      },
    ],
  },
]

const bottomNavigation: NavItem[] = [
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, badge: 3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Help', href: '/dashboard/help', icon: HelpCircle },
]

export function Sidebar({ company, onSignOut }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const toggleExpanded = (name: string) => {
    setExpandedItems(prev =>
      prev.includes(name)
        ? prev.filter(item => item !== name)
        : [...prev, name]
    )
  }

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
      {/* Decorative gradient orb */}
      <div className={`absolute top-0 left-0 w-full h-64 bg-gradient-to-br pointer-events-none ${
        isDark ? 'from-violet-600/20 via-transparent to-transparent' : 'from-violet-200/50 via-transparent to-transparent'
      }`} />
      <div className={`absolute bottom-0 left-0 w-full h-64 bg-gradient-to-tr pointer-events-none ${
        isDark ? 'from-emerald-600/10 via-transparent to-transparent' : 'from-emerald-200/40 via-transparent to-transparent'
      }`} />

      {/* Logo & Company */}
      <div className={`relative p-4 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <motion.div
              className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/25"
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
                  <span className="text-emerald-500 text-xl font-light">.io</span>
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
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="w-7 h-7 rounded object-contain" />
                ) : (
                  <Building2 className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{company.name}</p>
                <p className={`text-xs capitalize flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${company.type === 'partner' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                  {company.type}
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
                const expanded = expandedItems.includes(item.name)
                const hasChildren = item.children && item.children.length > 0

                return (
                  <li key={item.name}>
                    {hasChildren ? (
                      <>
                        <motion.button
                          onClick={() => toggleExpanded(item.name)}
                          whileHover={{ x: 2 }}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative
                            ${active
                              ? isDark ? 'text-white' : 'text-slate-900'
                              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                            }
                          `}
                        >
                          {active && (
                            <motion.div
                              layoutId="activeNav"
                              className={`absolute inset-0 rounded-xl ${isDark ? 'bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent' : 'bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent'}`}
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <div className={`relative p-2 rounded-lg ${active ? 'bg-emerald-500/20' : isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                            <item.icon className={`w-4 h-4 ${active ? 'text-emerald-500' : ''}`} />
                          </div>
                          {!collapsed && (
                            <>
                              <span className="relative flex-1 text-left font-medium text-sm">{item.name}</span>
                              <ChevronDown
                                className={`relative w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                              />
                            </>
                          )}
                        </motion.button>
                        <AnimatePresence>
                          {expanded && !collapsed && (
                            <motion.ul
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className={`mt-1 ml-5 pl-4 border-l space-y-1 overflow-hidden ${isDark ? 'border-white/10' : 'border-slate-200'}`}
                            >
                              {item.children?.map((child) => {
                                const childActive = pathname === child.href
                                return (
                                  <motion.li
                                    key={child.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                  >
                                    <Link
                                      href={child.href}
                                      className={`
                                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
                                        ${childActive
                                          ? isDark ? 'bg-white/10 text-white font-medium' : 'bg-emerald-50 text-emerald-700 font-medium'
                                          : isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }
                                      `}
                                    >
                                      <child.icon className="w-3.5 h-3.5" />
                                      <span>{child.name}</span>
                                    </Link>
                                  </motion.li>
                                )
                              })}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
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
                              layoutId="activeNavSingle"
                              className={`absolute inset-0 rounded-xl ${isDark ? 'bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent' : 'bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent'}`}
                              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                          )}
                          <div className={`relative p-2 rounded-lg ${active ? 'bg-emerald-500/20' : isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                            <item.icon className={`w-4 h-4 ${active ? 'text-emerald-500' : ''}`} />
                          </div>
                          {!collapsed && (
                            <>
                              <span className="relative font-medium text-sm">{item.name}</span>
                              {item.badge && (
                                <span className="relative ml-auto px-2 py-0.5 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full">
                                  {item.badge}
                                </span>
                              )}
                            </>
                          )}
                        </motion.div>
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className={`relative border-t p-3 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
        {/* AI Assistant Card */}
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-3 p-3 rounded-xl border ${
              isDark
                ? 'bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-fuchsia-500/20 border-white/10'
                : 'bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 border-violet-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>AI Assistant</span>
              <span className={`ml-auto px-1.5 py-0.5 text-[10px] font-medium rounded ${isDark ? 'bg-violet-500/30 text-violet-300' : 'bg-violet-100 text-violet-600'}`}>BETA</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Get smart suggestions for routing, scheduling & more.</p>
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
