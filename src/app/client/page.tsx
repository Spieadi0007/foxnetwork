'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTheme } from '@/contexts/theme-context'
import {
  MapPin,
  Package,
  ClipboardList,
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Calendar,
  Truck,
  Users,
  MessageSquare,
  Activity,
  Bell,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

const dashboardStats = [
  { label: 'Active Locations', value: 24, icon: MapPin, color: 'from-blue-500 to-cyan-600', trend: '+3 this month' },
  { label: 'Deployed Equipment', value: 156, icon: Package, color: 'from-violet-500 to-purple-600', trend: '98% operational' },
  { label: 'Open Requests', value: 8, icon: ClipboardList, color: 'from-amber-500 to-orange-600', trend: '3 urgent' },
  { label: 'Active Projects', value: 5, icon: FolderKanban, color: 'from-emerald-500 to-teal-600', trend: '2 completing soon' },
]

const recentRequests = [
  { id: 'REQ-001', title: 'New Locker Deployment', location: 'Downtown Office', type: 'deployment', status: 'in_progress', priority: 'high', date: '2024-11-25' },
  { id: 'REQ-002', title: 'Maintenance - Unit #45', location: 'Central Mall', type: 'maintenance', status: 'pending', priority: 'medium', date: '2024-11-24' },
  { id: 'REQ-003', title: 'Locker Removal Request', location: 'Old Branch', type: 'removal', status: 'scheduled', priority: 'low', date: '2024-11-23' },
  { id: 'REQ-004', title: 'Technical Issue - Scanner', location: 'Airport Terminal', type: 'repair', status: 'in_progress', priority: 'urgent', date: '2024-11-22' },
]

const upcomingVisits = [
  { date: 'Today, 2:00 PM', location: 'Downtown Office', technician: 'Mike Johnson', purpose: 'Deployment Setup', status: 'confirmed' },
  { date: 'Tomorrow, 10:00 AM', location: 'Central Mall', technician: 'Emily Williams', purpose: 'Maintenance Check', status: 'confirmed' },
  { date: 'Nov 28, 9:00 AM', location: 'Airport Terminal', technician: 'David Brown', purpose: 'Scanner Repair', status: 'pending' },
]

const recentActivity = [
  { action: 'Request approved', details: 'REQ-001 has been approved and assigned', time: '2 hours ago', type: 'success' },
  { action: 'Technician dispatched', details: 'Mike Johnson en route to Downtown Office', time: '3 hours ago', type: 'info' },
  { action: 'Project completed', details: 'Locker installation at Westside Branch', time: '1 day ago', type: 'success' },
  { action: 'Maintenance scheduled', details: 'Routine check for Central Mall units', time: '2 days ago', type: 'info' },
]

const quickActions = [
  { title: 'New Request', description: 'Submit a service request', href: '/client/requests', icon: ClipboardList, color: 'from-blue-500 to-cyan-600' },
  { title: 'View Locations', description: 'Manage your sites', href: '/client/locations', icon: MapPin, color: 'from-violet-500 to-purple-600' },
  { title: 'Live Chat', description: 'Talk to support', href: '/client/support', icon: MessageSquare, color: 'from-emerald-500 to-teal-600' },
  { title: 'Activity Log', description: 'Track all actions', href: '/client/activity', icon: Activity, color: 'from-amber-500 to-orange-600' },
]

export default function ClientDashboard() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

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
            <Link href="/client/requests">
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
            <Link href="/client/support">
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
        {dashboardStats.map((stat, index) => (
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
        {quickActions.map((action, index) => (
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
            <Link href="/client/requests" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentRequests.map((request, index) => (
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
            <Link href="/client/schedule" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Full Schedule <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingVisits.map((visit, index) => (
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
          <Link href="/client/activity" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {recentActivity.map((activity, index) => (
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
