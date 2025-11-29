'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  PieChart,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Target,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  MapPin,
  Zap,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

const timeRanges = ['7 days', '30 days', '90 days', 'Year']

const overviewMetrics = [
  { label: 'Total Revenue', value: '$127,450', change: 12.5, trend: 'up', icon: DollarSign, color: 'emerald' },
  { label: 'Active Work Orders', value: 48, change: -5.2, trend: 'down', icon: BarChart3, color: 'violet' },
  { label: 'Avg Completion Time', value: '2.4h', change: -18.3, trend: 'up', icon: Clock, color: 'blue' },
  { label: 'Customer Rating', value: '4.8', change: 3.1, trend: 'up', icon: Target, color: 'amber' },
  { label: 'Team Utilization', value: '87%', change: 5.4, trend: 'up', icon: Users, color: 'rose' },
  { label: 'First-Time Fix Rate', value: '94%', change: 2.8, trend: 'up', icon: Zap, color: 'cyan' },
]

const serviceBreakdown = [
  { service: 'Network Installation', percentage: 35, revenue: 44608, color: 'bg-violet-500' },
  { service: 'Security Systems', percentage: 28, revenue: 35686, color: 'bg-emerald-500' },
  { service: 'Maintenance', percentage: 22, revenue: 28039, color: 'bg-blue-500' },
  { service: 'Consulting', percentage: 15, revenue: 19117, color: 'bg-amber-500' },
]

const regionPerformance = [
  { region: 'San Francisco', orders: 145, revenue: '$52,300', growth: 18 },
  { region: 'Oakland', orders: 98, revenue: '$35,200', growth: 12 },
  { region: 'San Jose', orders: 67, revenue: '$24,100', growth: 8 },
  { region: 'Berkeley', orders: 32, revenue: '$15,850', growth: 22 },
]

const weeklyData = [
  { day: 'Mon', completed: 12, revenue: 4500 },
  { day: 'Tue', completed: 15, revenue: 5200 },
  { day: 'Wed', completed: 10, revenue: 3800 },
  { day: 'Thu', completed: 18, revenue: 6100 },
  { day: 'Fri', completed: 14, revenue: 4900 },
  { day: 'Sat', completed: 8, revenue: 2800 },
  { day: 'Sun', completed: 3, revenue: 1200 },
]

export default function OverviewPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [timeRange, setTimeRange] = useState('30 days')

  const maxRevenue = Math.max(...weeklyData.map(d => d.revenue))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Analytics Overview</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Comprehensive performance metrics and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center p-1 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border rounded-xl`}>
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timeRange === range ? 'bg-emerald-500 text-white' : `${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-6 gap-4">
        {overviewMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg bg-${metric.color}-500/20`}>
                <metric.icon className={`w-4 h-4 text-${metric.color}-400`} />
              </div>
              <div className={`flex items-center gap-0.5 text-xs font-medium ${metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                {metric.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(metric.change)}%
              </div>
            </div>
            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{metric.value}</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{metric.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Weekly Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`col-span-2 p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border`}
        >
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-6`}>Weekly Performance</h3>

          <div className="flex items-end justify-between h-48 gap-6">
            {weeklyData.map((data, index) => (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                  transition={{ delay: index * 0.05 + 0.4, duration: 0.5 }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-emerald-500 to-teal-400 relative group cursor-pointer"
                >
                  <div className={`absolute -top-12 left-1/2 -translate-x-1/2 p-2 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm'} text-xs ${isDark ? 'text-white' : 'text-slate-900'} opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10`}>
                    <p className="font-medium">${data.revenue}</p>
                    <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>{data.completed} jobs</p>
                  </div>
                </motion.div>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{data.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Service Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border`}
        >
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-6`}>Service Breakdown</h3>

          {/* Simple Donut Representation */}
          <div className="relative w-40 h-40 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90">
              {serviceBreakdown.reduce((acc, item, index) => {
                const prevPercentage = serviceBreakdown.slice(0, index).reduce((sum, s) => sum + s.percentage, 0)
                const circumference = 2 * Math.PI * 60
                const offset = (prevPercentage / 100) * circumference
                const length = (item.percentage / 100) * circumference

                acc.push(
                  <circle
                    key={item.service}
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    strokeWidth="20"
                    className={item.color.replace('bg-', 'stroke-')}
                    strokeDasharray={`${length} ${circumference - length}`}
                    strokeDashoffset={-offset}
                  />
                )
                return acc
              }, [] as React.ReactElement[])}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>$127k</p>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {serviceBreakdown.map((item) => (
              <div key={item.service} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.service}</span>
                </div>
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.percentage}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Regional Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border`}
      >
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-6 flex items-center gap-2`}>
          <MapPin className="w-5 h-5 text-violet-400" />
          Regional Performance
        </h3>

        <div className="grid grid-cols-4 gap-4">
          {regionPerformance.map((region, index) => (
            <motion.div
              key={region.region}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.6 }}
              className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'} border`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{region.region}</h4>
                <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                  +{region.growth}%
                </span>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-1`}>{region.revenue}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{region.orders} orders</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
