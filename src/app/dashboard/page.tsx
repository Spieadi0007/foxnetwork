'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/browser-client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  ArrowRight,
  MapPin,
  Target,
  Clock,
  ArrowUpRight,
  Sparkles,
  Play,
  Package,
  FolderKanban,
  MessageSquare,
  Activity,
  Bell,
  ChevronRight,
} from 'lucide-react'
import type { User, Company } from '@/types/user'
import { useTheme } from '@/contexts/theme-context'

// Client Dashboard Data
const clientDashboardStats = [
  { label: 'Active Locations', value: 24, icon: MapPin, color: 'from-blue-500 to-cyan-600', trend: '+3 this month' },
  { label: 'Deployed Equipment', value: 156, icon: Package, color: 'from-violet-500 to-purple-600', trend: '98% operational' },
  { label: 'Open Requests', value: 8, icon: ClipboardList, color: 'from-amber-500 to-orange-600', trend: '3 urgent' },
  { label: 'Active Projects', value: 5, icon: FolderKanban, color: 'from-emerald-500 to-teal-600', trend: '2 completing soon' },
]

const clientRecentRequests = [
  { id: 'REQ-001', title: 'New Locker Deployment', location: 'Downtown Office', type: 'deployment', status: 'in_progress', priority: 'high', date: '2024-11-25' },
  { id: 'REQ-002', title: 'Maintenance - Unit #45', location: 'Central Mall', type: 'maintenance', status: 'pending', priority: 'medium', date: '2024-11-24' },
  { id: 'REQ-003', title: 'Locker Removal Request', location: 'Old Branch', type: 'removal', status: 'scheduled', priority: 'low', date: '2024-11-23' },
  { id: 'REQ-004', title: 'Technical Issue - Scanner', location: 'Airport Terminal', type: 'repair', status: 'in_progress', priority: 'urgent', date: '2024-11-22' },
]

const clientUpcomingVisits = [
  { date: 'Today, 2:00 PM', location: 'Downtown Office', technician: 'Mike Johnson', purpose: 'Deployment Setup', status: 'confirmed' },
  { date: 'Tomorrow, 10:00 AM', location: 'Central Mall', technician: 'Emily Williams', purpose: 'Maintenance Check', status: 'confirmed' },
  { date: 'Nov 28, 9:00 AM', location: 'Airport Terminal', technician: 'David Brown', purpose: 'Scanner Repair', status: 'pending' },
]

const clientRecentActivity = [
  { action: 'Request approved', details: 'REQ-001 has been approved and assigned', time: '2 hours ago', type: 'success' },
  { action: 'Technician dispatched', details: 'Mike Johnson en route to Downtown Office', time: '3 hours ago', type: 'info' },
  { action: 'Project completed', details: 'Locker installation at Westside Branch', time: '1 day ago', type: 'success' },
  { action: 'Maintenance scheduled', details: 'Routine check for Central Mall units', time: '2 days ago', type: 'info' },
]

const clientQuickActions = [
  { title: 'New Request', description: 'Submit a service request', href: '/requests', icon: ClipboardList, color: 'from-blue-500 to-cyan-600' },
  { title: 'View Locations', description: 'Manage your sites', href: '/locations', icon: MapPin, color: 'from-violet-500 to-purple-600' },
  { title: 'Live Chat', description: 'Talk to support', href: '/support', icon: MessageSquare, color: 'from-emerald-500 to-teal-600' },
  { title: 'Activity Log', description: 'Track all actions', href: '/activity', icon: Activity, color: 'from-amber-500 to-orange-600' },
]

// Mini Sparkline Chart Component
function MiniSparkline({ data, color, isDark }: { data: number[], color: string, isDark: boolean }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((value, index) => {
        const height = ((value - min) / range) * 100
        return (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max(height, 15)}%` }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className={`w-1 rounded-full ${color}`}
            style={{ opacity: 0.4 + (index / data.length) * 0.6 }}
          />
        )
      })}
    </div>
  )
}

// Enhanced Stat Card with Sparkline
function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  gradient,
  sparklineData,
  sparklineColor,
  delay = 0,
  isDark,
}: {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ElementType
  gradient: string
  sparklineData?: number[]
  sparklineColor?: string
  delay?: number
  isDark: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative group"
    >
      <div className={`relative rounded-2xl p-5 transition-all overflow-hidden ${
        isDark
          ? 'bg-white/5 border border-white/10 hover:border-white/20 backdrop-blur-xl'
          : 'bg-white border border-slate-200/60 hover:border-slate-300 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/50'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{title}</p>
            <p className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
            {change && (
              <div className={`inline-flex items-center gap-1 text-xs font-medium ${
                changeType === 'positive' ? 'text-emerald-500' :
                changeType === 'negative' ? 'text-red-500' : isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {changeType === 'positive' ? <TrendingUp className="w-3 h-3" /> :
                 changeType === 'negative' ? <TrendingDown className="w-3 h-3" /> : null}
                <span>{change}</span>
                <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>last 7 days</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {sparklineData && sparklineColor && (
              <MiniSparkline data={sparklineData} color={sparklineColor} isDark={isDark} />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Welcome Banner Component
function WelcomeBanner({ userName, companyName, isDark }: { userName: string, companyName: string, isDark: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl p-6 ${
        isDark
          ? 'bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700'
          : 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600'
      }`}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/2" />

      {/* Floating shapes */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-8 top-1/2 -translate-y-1/2"
      >
        <div className="relative">
          <div className="w-32 h-24 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30 shadow-xl">
            <div className="p-3">
              <div className="flex gap-1 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <div className="w-2 h-2 rounded-full bg-green-400" />
              </div>
              <div className="space-y-1.5">
                <div className="h-1.5 bg-white/40 rounded w-full" />
                <div className="h-1.5 bg-white/30 rounded w-3/4" />
                <div className="h-1.5 bg-white/20 rounded w-1/2" />
              </div>
            </div>
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-400 rounded-lg flex items-center justify-center shadow-lg"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
          </motion.div>
        </div>
      </motion.div>

      <div className="relative z-10">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold text-white mb-1"
        >
          Welcome back 👋
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-white mb-3"
        >
          {userName}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white/80 text-sm mb-4 max-w-sm"
        >
          Here's what's happening with {companyName} today. You have 3 tasks requiring attention.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-2.5 bg-white text-emerald-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          Go now
        </motion.button>
      </div>
    </motion.div>
  )
}

// Quick Action Card
function QuickAction({
  title,
  description,
  icon: Icon,
  href,
  gradient,
  delay = 0,
  isDark,
}: {
  title: string
  description: string
  icon: React.ElementType
  href: string
  gradient: string
  delay?: number
  isDark: boolean
}) {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ x: 4, scale: 1.01 }}
      className={`flex items-center gap-4 p-4 rounded-xl transition-all group ${
        isDark
          ? 'bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10'
          : 'bg-white border border-slate-200/60 hover:border-slate-300 shadow-md shadow-slate-100 hover:shadow-lg'
      }`}
    >
      <div className={`p-3 rounded-xl ${gradient} shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</p>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
      </div>
      <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-all ${isDark ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
    </motion.a>
  )
}

// Work Order Row
function WorkOrderRow({
  type,
  location,
  status,
  sla,
  priority,
  delay = 0,
  isDark,
}: {
  type: string
  location: string
  status: 'pending' | 'in_progress' | 'completed' | 'at_risk'
  sla: string
  priority?: 'high' | 'medium' | 'low'
  delay?: number
  isDark: boolean
}) {
  const statusConfig = {
    pending: { label: 'Pending', color: isDark ? 'bg-slate-500/20 text-slate-300' : 'bg-slate-100 text-slate-600' },
    in_progress: { label: 'In Progress', color: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600' },
    completed: { label: 'Completed', color: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600' },
    at_risk: { label: 'At Risk', color: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600' },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ x: 4 }}
      className={`flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer group ${
        isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
      }`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
        isDark
          ? 'bg-gradient-to-br from-slate-700 to-slate-800'
          : 'bg-gradient-to-br from-slate-100 to-slate-200'
      }`}>
        <ClipboardList className={`w-5 h-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{type}</p>
          {priority === 'high' && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded">HIGH</span>
          )}
        </div>
        <p className={`text-sm flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <MapPin className="w-3 h-3" />
          {location}
        </p>
      </div>
      <div className="text-right">
        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig[status].color}`}>
          {statusConfig[status].label}
        </span>
        <p className={`text-xs mt-1 flex items-center justify-end gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          <Clock className="w-3 h-3" />
          {sla}
        </p>
      </div>
      <ArrowUpRight className={`w-4 h-4 transition-colors ${isDark ? 'text-slate-600 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-700'}`} />
    </motion.div>
  )
}

// Performance Metric with circular progress
function PerformanceMetric({
  label,
  value,
  percentage,
  color,
  bgColor,
  delay = 0,
  isDark,
}: {
  label: string
  value: string
  percentage?: number
  color: string
  bgColor: string
  delay?: number
  isDark: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`text-center p-5 rounded-2xl transition-all ${
        isDark
          ? 'bg-white/5 border border-white/10 hover:border-white/20'
          : 'bg-white border border-slate-200/60 shadow-lg shadow-slate-100 hover:shadow-xl'
      }`}
    >
      {percentage !== undefined ? (
        <div className="relative w-16 h-16 mx-auto mb-3">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke={isDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}
              strokeWidth="6"
            />
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              className={color}
              strokeDasharray={`${2 * Math.PI * 28}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - percentage / 100) }}
              transition={{ delay: delay + 0.3, duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</span>
          </div>
        </div>
      ) : (
        <p className={`text-3xl font-bold mb-2 ${color}`}>{value}</p>
      )}
      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
    </motion.div>
  )
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [company, setCompany] = useState<Company | null>(null)
  const supabase = createClient()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userProfile) {
        setUser(userProfile)

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
      }
    }
    getUser()
  }, [supabase])

  const stats = [
    {
      title: 'Active Work Orders',
      value: 24,
      change: '+12%',
      changeType: 'positive' as const,
      icon: ClipboardList,
      gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      sparklineData: [4, 6, 8, 5, 9, 12, 15, 18, 14, 20, 22, 24],
      sparklineColor: 'bg-emerald-500'
    },
    {
      title: 'Completed This Month',
      value: 156,
      change: '+8%',
      changeType: 'positive' as const,
      icon: CheckCircle2,
      gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      sparklineData: [80, 95, 88, 100, 120, 115, 130, 125, 140, 145, 150, 156],
      sparklineColor: 'bg-blue-500'
    },
    {
      title: 'SLA At Risk',
      value: 3,
      change: '-40%',
      changeType: 'positive' as const,
      icon: AlertTriangle,
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
      sparklineData: [8, 7, 9, 6, 5, 7, 4, 5, 4, 3, 4, 3],
      sparklineColor: 'bg-amber-500'
    },
    {
      title: 'Revenue This Month',
      value: '$12,450',
      change: '+15%',
      changeType: 'positive' as const,
      icon: DollarSign,
      gradient: 'bg-gradient-to-br from-violet-500 to-purple-600',
      sparklineData: [5000, 6200, 7100, 6800, 8200, 9100, 8500, 10200, 11000, 10800, 11500, 12450],
      sparklineColor: 'bg-violet-500'
    },
  ]

  const recentWorkOrders = [
    { type: 'Outdoor Locker Deployment', location: 'Paris, 75001', status: 'in_progress' as const, sla: '2h left', priority: 'high' as const },
    { type: 'Maintenance - Battery Swap', location: 'Lyon, 69001', status: 'at_risk' as const, sla: '30m left', priority: 'high' as const },
    { type: 'Indoor Locker Survey', location: 'Marseille, 13001', status: 'pending' as const, sla: '1d left' },
    { type: 'Network Module Replacement', location: 'Nice, 06000', status: 'completed' as const, sla: 'On time' },
    { type: 'Printer Installation', location: 'Toulouse, 31000', status: 'pending' as const, sla: '4h left' },
  ]

  const quickActions = [
    { title: 'View All Work Orders', description: 'See your complete workload', icon: ClipboardList, href: '/dashboard/work-orders', gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
    { title: 'Open Map View', description: 'Helicopter view of operations', icon: MapPin, href: '/dashboard/map', gradient: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
    { title: 'Schedule Tasks', description: "Plan your team's day", icon: Calendar, href: '/dashboard/scheduling', gradient: 'bg-gradient-to-br from-violet-500 to-purple-600' },
    { title: 'Manage Team', description: 'View technician performance', icon: Users, href: '/dashboard/team', gradient: 'bg-gradient-to-br from-amber-500 to-orange-600' },
  ]

  // Check if user is a client
  const isClient = company?.type === 'client'

  // Helper functions for client dashboard
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
      case 'in_progress': return isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
      case 'scheduled': return isDark ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-100 text-violet-700'
      case 'completed': return isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
      case 'confirmed': return isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
      default: return isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
      case 'high': return isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-700'
      case 'medium': return isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
      case 'low': return isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600'
      default: return isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600'
    }
  }

  // Render Client Dashboard
  if (isClient) {
    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-2xl p-6 ${
            isDark
              ? 'bg-gradient-to-br from-blue-600/20 via-cyan-600/10 to-teal-600/20 border border-white/10'
              : 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500'
          }`}
        >
          <div className="relative z-10">
            <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-white'}`}>
              Welcome to Your Client Portal
            </h1>
            <p className={`max-w-xl ${isDark ? 'text-slate-300' : 'text-white/80'}`}>
              Manage your locations, track service requests, and monitor your equipment deployments all in one place.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <Link href="/requests">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium ${
                    isDark
                      ? 'bg-white/10 hover:bg-white/20 text-white'
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                >
                  <ClipboardList className="w-4 h-4" />
                  New Request
                </motion.button>
              </Link>
              <Link href="/support">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium ${
                    isDark
                      ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'
                      : 'bg-white text-blue-600 hover:bg-white/90'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Live Support
                </motion.button>
              </Link>
            </div>
          </div>
          {/* Decorative elements */}
          {!isDark && (
            <>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/10 rounded-full blur-3xl transform translate-y-1/2" />
            </>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {clientDashboardStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-5 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                  <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{stat.trend}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4">
          {clientQuickActions.map((action, index) => (
            <Link key={action.title} href={action.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.2 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'} border cursor-pointer group transition-all`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br ${action.color}`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{action.title}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{action.description}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Recent Requests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <ClipboardList className="w-5 h-5 text-blue-400" />
                Recent Requests
              </h3>
              <Link href="/requests" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {clientRecentRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  className={`p-4 rounded-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'} transition-colors cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{request.title}</p>
                      <p className={`text-xs flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <MapPin className="w-3 h-3" />
                        {request.location}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getPriorityBadge(request.priority)}`}>
                        {request.priority}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getStatusBadge(request.status)}`}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className={`flex items-center justify-between text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <span className="capitalize">{request.type}</span>
                    <span>{request.date}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Visits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Calendar className="w-5 h-5 text-violet-400" />
                Upcoming Visits
              </h3>
              <Link href="/schedule" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                Full Schedule <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-3">
              {clientUpcomingVisits.map((visit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                  className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{visit.purpose}</p>
                      <p className={`text-xs flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <MapPin className="w-3 h-3" />
                        {visit.location}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getStatusBadge(visit.status)}`}>
                      {visit.status}
                    </span>
                  </div>
                  <div className={`flex items-center justify-between text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {visit.technician}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {visit.date}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Activity className="w-5 h-5 text-emerald-400" />
              Recent Activity
            </h3>
            <Link href="/activity" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-4">
            {clientRecentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.6 }}
                className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-1.5 rounded-full ${
                    activity.type === 'success'
                      ? isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                      : isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                  }`}>
                    {activity.type === 'success' ? (
                      <CheckCircle2 className={`w-3 h-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    ) : (
                      <Bell className={`w-3 h-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{activity.action}</p>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{activity.details}</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{activity.time}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // Render Partner Dashboard (default)
  return (
    <div className="space-y-6">
      {/* Welcome Banner - Only in Light Mode or Full Banner in Dark Mode */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WelcomeBanner
            userName={user?.full_name || 'there'}
            companyName={company?.name || 'your company'}
            isDark={isDark}
          />
        </div>

        {/* AI Insights Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`relative overflow-hidden rounded-2xl p-5 ${
            isDark
              ? 'bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-700'
              : 'bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-600'
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/80 text-sm font-medium">AI INSIGHTS</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">3 Optimization Tips</h3>
              <p className="text-white/70 text-sm">Route optimization could save 2.5 hours today</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 w-full py-2.5 bg-white/20 hover:bg-white/30 text-white font-medium rounded-xl backdrop-blur-sm transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              View Insights
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} delay={0.1 + index * 0.05} isDark={isDark} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Work Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`lg:col-span-2 rounded-2xl overflow-hidden ${
            isDark
              ? 'bg-white/5 border border-white/10'
              : 'bg-white border border-slate-200/60 shadow-lg shadow-slate-100'
          }`}
        >
          <div className={`p-5 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Recent Work Orders</h2>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Your latest assigned tasks</p>
              </div>
              <a
                href="/dashboard/work-orders"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isDark
                    ? 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                View all
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="p-2">
            {recentWorkOrders.map((order, index) => (
              <WorkOrderRow key={index} {...order} delay={0.4 + index * 0.05} isDark={isDark} />
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Quick Actions</h2>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Jump to common tasks</p>
          </div>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <QuickAction key={action.title} {...action} delay={0.5 + index * 0.1} isDark={isDark} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`rounded-2xl p-6 ${
          isDark
            ? 'bg-white/5 border border-white/10'
            : 'bg-white border border-slate-200/60 shadow-lg shadow-slate-100'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Performance Overview</h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Your team's metrics this month</p>
            </div>
          </div>
          <select className={`px-4 py-2 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
            isDark
              ? 'bg-white/5 border border-white/10 text-slate-300'
              : 'bg-slate-100 border border-slate-200 text-slate-700'
          }`}>
            <option>This Month</option>
            <option>Last Month</option>
            <option>Last 3 Months</option>
          </select>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <PerformanceMetric
            label="SLA Compliance"
            value="94%"
            percentage={94}
            color="text-emerald-500"
            bgColor="bg-emerald-100"
            delay={0.6}
            isDark={isDark}
          />
          <PerformanceMetric
            label="First-Time Fix"
            value="87%"
            percentage={87}
            color="text-blue-500"
            bgColor="bg-blue-100"
            delay={0.65}
            isDark={isDark}
          />
          <PerformanceMetric
            label="Quality Score"
            value="4.8"
            percentage={96}
            color="text-violet-500"
            bgColor="bg-violet-100"
            delay={0.7}
            isDark={isDark}
          />
          <PerformanceMetric
            label="Tasks Done"
            value="156"
            percentage={78}
            color="text-amber-500"
            bgColor="bg-amber-100"
            delay={0.75}
            isDark={isDark}
          />
        </div>
      </motion.div>
    </div>
  )
}
