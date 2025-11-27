'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  BarChart3,
  PieChart,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Target,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

const kpiStats = [
  { label: 'Revenue', value: '$127,450', change: 12.5, trend: 'up', icon: DollarSign, color: 'from-emerald-500 to-teal-600' },
  { label: 'Work Orders', value: 342, change: 8.3, trend: 'up', icon: FileText, color: 'from-violet-500 to-purple-600' },
  { label: 'Avg Resolution', value: '2.4h', change: -15.2, trend: 'up', icon: Clock, color: 'from-blue-500 to-cyan-600' },
  { label: 'Customer Satisfaction', value: '94%', change: 2.1, trend: 'up', icon: Target, color: 'from-amber-500 to-orange-600' },
]

const modules = [
  {
    title: 'Overview',
    description: 'Key metrics and performance dashboards',
    href: '/dashboard/analytics/overview',
    icon: PieChart,
    color: 'from-violet-500 to-purple-600',
  },
  {
    title: 'Reports',
    description: 'Generate and download detailed reports',
    href: '/dashboard/analytics/reports',
    icon: FileText,
    color: 'from-emerald-500 to-teal-600',
  },
]

const monthlyData = [
  { month: 'Jun', revenue: 85000, orders: 245 },
  { month: 'Jul', revenue: 92000, orders: 268 },
  { month: 'Aug', revenue: 88000, orders: 254 },
  { month: 'Sep', revenue: 105000, orders: 298 },
  { month: 'Oct', revenue: 118000, orders: 325 },
  { month: 'Nov', revenue: 127450, orders: 342 },
]

const topClients = [
  { name: 'TechCorp Inc.', revenue: '$32,500', orders: 45, growth: 15 },
  { name: 'SecureBank', revenue: '$28,200', orders: 38, growth: 22 },
  { name: 'Bay Medical', revenue: '$21,800', orders: 32, growth: 8 },
  { name: 'DataFlow LLC', revenue: '$18,500', orders: 28, growth: -5 },
]

export default function AnalyticsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Analytics</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Track performance and generate insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Last 30 days</span>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-4 gap-4">
        {kpiStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-5 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {Math.abs(stat.change)}%
              </div>
            </div>
            <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>{stat.value}</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
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
              className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'} border backdrop-blur-sm cursor-pointer group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${module.color}`}>
                  <module.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>{module.title}</h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{module.description}</p>
              <div className="flex items-center text-emerald-400 text-sm font-medium group-hover:gap-2 transition-all">
                <span>View {module.title}</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`col-span-2 p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} flex items-center gap-2`}>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Revenue Trend
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violet-500" />
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Orders</span>
              </div>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="flex items-end justify-between h-48 gap-4">
            {monthlyData.map((data, index) => (
              <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex gap-1 items-end h-40">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-emerald-500 to-teal-400 relative group cursor-pointer"
                  >
                    <div className={`absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm'} text-xs ${isDark ? 'text-white' : 'text-slate-900'} opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10`}>
                      ${(data.revenue / 1000).toFixed(0)}k
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.orders / 350) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.1, duration: 0.5 }}
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-violet-500 to-purple-400"
                  />
                </div>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{data.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Clients */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}
        >
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-6 flex items-center gap-2`}>
            <Users className="w-5 h-5 text-violet-400" />
            Top Clients
          </h3>

          <div className="space-y-4">
            {topClients.map((client, index) => (
              <motion.div
                key={client.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.6 }}
                className="flex items-center justify-between"
              >
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{client.name}</p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{client.orders} orders</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{client.revenue}</p>
                  <p className={`text-xs ${client.growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {client.growth >= 0 ? '+' : ''}{client.growth}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
