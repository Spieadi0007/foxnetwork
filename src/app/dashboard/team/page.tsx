'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTheme } from '@/contexts/theme-context'
import {
  Users,
  TrendingUp,
  UserPlus,
  Award,
  MapPin,
  Phone,
  Mail,
  Star,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  ArrowRight,
  Zap,
  Target,
  Calendar,
} from 'lucide-react'

const teamStats = [
  { label: 'Total Technicians', value: 12, icon: Users, color: 'from-violet-500 to-purple-600', trend: '+2' },
  { label: 'Active Now', value: 8, icon: Zap, color: 'from-emerald-500 to-teal-600', trend: null },
  { label: 'Avg Rating', value: '4.8', icon: Star, color: 'from-amber-500 to-orange-600', trend: '+0.2' },
  { label: 'Jobs This Week', value: 47, icon: CheckCircle2, color: 'from-blue-500 to-cyan-600', trend: '+12' },
]

const topPerformers = [
  { name: 'Mike Johnson', role: 'Senior Technician', rating: 4.9, jobs: 156, avatar: 'M', status: 'active' },
  { name: 'Emily Williams', role: 'Lead Installer', rating: 4.8, jobs: 142, avatar: 'E', status: 'active' },
  { name: 'David Brown', role: 'Technician', rating: 4.7, jobs: 128, avatar: 'D', status: 'break' },
]

const recentActivity = [
  { technician: 'Mike Johnson', action: 'Completed work order', details: 'WO-001 - Network Installation', time: '5 min ago' },
  { technician: 'Emily Williams', action: 'Started work order', details: 'WO-003 - Security Camera Setup', time: '15 min ago' },
  { technician: 'Sarah Lee', action: 'Checked in', details: 'Location: Oakland Office', time: '30 min ago' },
  { technician: 'David Brown', action: 'On break', details: 'Expected return: 11:30 AM', time: '45 min ago' },
]

const modules = [
  {
    title: 'Technicians',
    description: 'Manage technician profiles, skills, and assignments',
    href: '/dashboard/team/technicians',
    icon: Users,
    count: 12,
  },
  {
    title: 'Performance',
    description: 'Track metrics, KPIs, and team performance',
    href: '/dashboard/team/performance',
    icon: TrendingUp,
    count: null,
  },
]

export default function TeamPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Team Management</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage your field service team and track performance</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add Technician</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {teamStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                  {stat.trend && (
                    <span className="text-xs font-medium text-emerald-400">{stat.trend}</span>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modules */}
      <div className="grid grid-cols-2 gap-6">
        {modules.map((module, index) => (
          <Link key={module.title} href={module.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'} backdrop-blur-sm cursor-pointer group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                  <module.icon className="w-6 h-6 text-white" />
                </div>
                {module.count && (
                  <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{module.count}</span>
                )}
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{module.title}</h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{module.description}</p>
              <div className="flex items-center text-emerald-400 text-sm font-medium group-hover:gap-2 transition-all">
                <span>View {module.title}</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Award className="w-5 h-5 text-amber-400" />
              Top Performers
            </h3>
            <Link href="/dashboard/team/performance" className="text-sm text-emerald-400 hover:text-emerald-300">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {topPerformers.map((performer, index) => (
              <motion.div
                key={performer.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-50'} transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                      <span className="text-white font-bold">{performer.avatar}</span>
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${isDark ? 'border-slate-900' : 'border-white'} ${
                      performer.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'
                    }`} />
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{performer.name}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{performer.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="font-medium">{performer.rating}</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{performer.jobs} jobs</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Clock className="w-5 h-5 text-violet-400" />
              Recent Activity
            </h3>
            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Live updates</span>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.6 }}
                className="flex items-start gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2" />
                <div className="flex-1">
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <span className="font-medium">{activity.technician}</span>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}> {activity.action}</span>
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{activity.details}</p>
                </div>
                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
