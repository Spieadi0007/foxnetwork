'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Calendar,
  Truck,
  Clock,
  Users,
  MapPin,
  ArrowRight,
  Sparkles,
  BarChart3,
  AlertCircle,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

const schedulingModules = [
  {
    title: 'Calendar View',
    description: 'Manage schedules, appointments, and technician availability',
    href: '/dashboard/scheduling/calendar',
    icon: Calendar,
    color: 'from-violet-500 to-purple-600',
    stats: { label: 'Scheduled Today', value: 12 },
  },
  {
    title: 'Route Optimization',
    description: 'AI-powered route planning to minimize travel time',
    href: '/dashboard/scheduling/routing',
    icon: Truck,
    color: 'from-emerald-500 to-teal-600',
    stats: { label: 'Routes Active', value: 4 },
  },
]

const quickStats = [
  { label: 'Today\'s Jobs', value: 12, icon: Clock, trend: '+3' },
  { label: 'Technicians Active', value: 8, icon: Users, trend: '0' },
  { label: 'Locations', value: 15, icon: MapPin, trend: '+2' },
  { label: 'Avg. Jobs/Tech', value: 1.5, icon: BarChart3, trend: '+0.2' },
]

const upcomingJobs = [
  { id: 'WO-001', title: 'Network Installation', time: '09:00 AM', technician: 'Mike J.', status: 'confirmed' },
  { id: 'WO-003', title: 'Security Camera Setup', time: '08:00 AM', technician: 'Emily W.', status: 'en_route' },
  { id: 'WO-006', title: 'Cable Repair', time: '11:00 AM', technician: 'David B.', status: 'pending' },
  { id: 'WO-007', title: 'WiFi Assessment', time: '02:00 PM', technician: 'Sarah L.', status: 'confirmed' },
]

const statusColors = {
  confirmed: 'bg-emerald-500/20 text-emerald-400',
  en_route: 'bg-blue-500/20 text-blue-400',
  pending: 'bg-amber-500/20 text-amber-400',
}

export default function SchedulingPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Scheduling</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage appointments, routes, and technician schedules</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium shadow-lg shadow-violet-500/25"
        >
          <Sparkles className="w-5 h-5" />
          <span>Auto Schedule</span>
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-2xl border backdrop-blur-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                  {stat.trend !== '0' && (
                    <span className={`text-xs font-medium ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                      {stat.trend}
                    </span>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                <stat.icon className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Modules */}
      <div className="grid grid-cols-2 gap-6">
        {schedulingModules.map((module, index) => (
          <Link key={module.title} href={module.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`p-6 rounded-2xl border backdrop-blur-sm cursor-pointer group ${isDark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${module.color}`}>
                  <module.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{module.stats.label}</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{module.stats.value}</p>
                </div>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{module.title}</h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{module.description}</p>
              <div className="flex items-center text-emerald-400 text-sm font-medium group-hover:gap-2 transition-all">
                <span>Open {module.title}</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Today's Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`p-6 rounded-2xl border backdrop-blur-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Clock className="w-5 h-5 text-violet-400" />
            Today&apos;s Schedule
          </h3>
          <Link href="/dashboard/scheduling/calendar" className="text-sm text-emerald-400 hover:text-emerald-300">
            View Full Calendar
          </Link>
        </div>

        <div className="space-y-3">
          {upcomingJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 + 0.5 }}
              className={`flex items-center justify-between p-4 rounded-xl transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{job.time.split(' ')[0]}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{job.time.split(' ')[1]}</p>
                </div>
                <div className={`w-px h-10 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{job.title}</p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{job.id} • {job.technician}</p>
                </div>
              </div>
              <span className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${statusColors[job.status as keyof typeof statusColors]}`}>
                {job.status.replace('_', ' ')}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-4"
      >
        <div className="p-2 rounded-xl bg-amber-500/20">
          <AlertCircle className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="text-amber-200 font-medium">2 unassigned work orders</p>
          <p className="text-amber-400/70 text-sm">WO-002 and WO-005 need technician assignment before tomorrow</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 text-sm font-medium hover:bg-amber-500/30 transition-colors">
          Assign Now
        </button>
      </motion.div>
    </div>
  )
}
