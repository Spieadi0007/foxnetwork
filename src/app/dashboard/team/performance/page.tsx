'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/theme-context'
import {
  TrendingUp,
  TrendingDown,
  Star,
  Clock,
  CheckCircle2,
  Target,
  Award,
  Users,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Timer,
  ThumbsUp,
} from 'lucide-react'

interface PerformanceMetric {
  label: string
  value: string | number
  change: number
  trend: 'up' | 'down' | 'neutral'
  icon: React.ElementType
}

interface TechnicianPerformance {
  id: string
  name: string
  avatar: string
  rating: number
  jobsCompleted: number
  avgResponseTime: string
  firstTimeFixRate: string
  customerSatisfaction: number
  efficiency: number
  trend: 'up' | 'down' | 'neutral'
}

const overallMetrics: PerformanceMetric[] = [
  { label: 'Team Rating', value: '4.7', change: 0.3, trend: 'up', icon: Star },
  { label: 'Jobs Completed', value: 156, change: 12, trend: 'up', icon: CheckCircle2 },
  { label: 'Avg Response Time', value: '28 min', change: -5, trend: 'up', icon: Clock },
  { label: 'First-Time Fix Rate', value: '94%', change: 2, trend: 'up', icon: Target },
]

const technicianPerformance: TechnicianPerformance[] = [
  { id: 'T1', name: 'Mike Johnson', avatar: 'M', rating: 4.9, jobsCompleted: 42, avgResponseTime: '22 min', firstTimeFixRate: '96%', customerSatisfaction: 98, efficiency: 95, trend: 'up' },
  { id: 'T2', name: 'Emily Williams', avatar: 'E', rating: 4.8, jobsCompleted: 38, avgResponseTime: '25 min', firstTimeFixRate: '95%', customerSatisfaction: 97, efficiency: 92, trend: 'up' },
  { id: 'T3', name: 'David Brown', avatar: 'D', rating: 4.7, jobsCompleted: 35, avgResponseTime: '30 min', firstTimeFixRate: '93%', customerSatisfaction: 95, efficiency: 88, trend: 'neutral' },
  { id: 'T4', name: 'Sarah Lee', avatar: 'S', rating: 4.6, jobsCompleted: 28, avgResponseTime: '32 min', firstTimeFixRate: '91%', customerSatisfaction: 94, efficiency: 85, trend: 'up' },
  { id: 'T5', name: 'James Wilson', avatar: 'J', rating: 4.4, jobsCompleted: 13, avgResponseTime: '38 min', firstTimeFixRate: '87%', customerSatisfaction: 90, efficiency: 78, trend: 'down' },
]

const weeklyData = [
  { day: 'Mon', jobs: 28, rating: 4.8 },
  { day: 'Tue', jobs: 32, rating: 4.7 },
  { day: 'Wed', jobs: 25, rating: 4.9 },
  { day: 'Thu', jobs: 30, rating: 4.6 },
  { day: 'Fri', jobs: 35, rating: 4.8 },
  { day: 'Sat', jobs: 18, rating: 4.7 },
  { day: 'Sun', jobs: 8, rating: 4.9 },
]

export default function PerformancePage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [timeRange, setTimeRange] = useState('week')
  const [selectedMetric, setSelectedMetric] = useState('jobs')

  const maxJobs = Math.max(...weeklyData.map(d => d.jobs))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Team Performance</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Track KPIs and team performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center p-1 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border rounded-xl`}>
            {['week', 'month', 'quarter'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${timeRange === range ? 'bg-emerald-500 text-white' : `${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {overallMetrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-5 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                <metric.icon className="w-5 h-5 text-emerald-400" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${metric.trend === 'up' ? 'text-emerald-400' : metric.trend === 'down' ? 'text-red-400' : `${isDark ? 'text-slate-400' : 'text-slate-500'}`}`}>
                {metric.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : metric.trend === 'down' ? <ArrowDownRight className="w-4 h-4" /> : null}
                {metric.change > 0 ? '+' : ''}{metric.change}{typeof metric.value === 'string' && metric.value.includes('%') ? '%' : ''}
              </div>
            </div>
            <p className={`text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{metric.value}</p>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{metric.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`col-span-2 p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Weekly Overview</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedMetric('jobs')}
                className={`px-3 py-1.5 rounded-lg text-sm ${selectedMetric === 'jobs' ? 'bg-emerald-500/20 text-emerald-400' : `${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}`}
              >
                Jobs
              </button>
              <button
                onClick={() => setSelectedMetric('rating')}
                className={`px-3 py-1.5 rounded-lg text-sm ${selectedMetric === 'rating' ? 'bg-emerald-500/20 text-emerald-400' : `${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}`}
              >
                Rating
              </button>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="flex items-end justify-between h-48 gap-4">
            {weeklyData.map((data, index) => (
              <div key={data.day} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: selectedMetric === 'jobs' ? `${(data.jobs / maxJobs) * 100}%` : `${(data.rating / 5) * 100}%` }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-emerald-500 to-teal-400 relative group cursor-pointer"
                >
                  <div className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-900'} text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>
                    {selectedMetric === 'jobs' ? `${data.jobs} jobs` : `${data.rating} rating`}
                  </div>
                </motion.div>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{data.day}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Performer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/20 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Top Performer</h3>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
            <div>
              <h4 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Mike Johnson</h4>
              <p className="text-amber-400">Senior Technician</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white/50'}`}>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>4.9</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Rating</p>
            </div>
            <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white/50'}`}>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>42</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Jobs</p>
            </div>
            <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white/50'}`}>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>96%</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fix Rate</p>
            </div>
            <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white/50'}`}>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>95%</p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Efficiency</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Technician Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Individual Performance</h3>
          <button className="text-sm text-emerald-400 hover:text-emerald-300">Export Report</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <th className={`text-left py-3 px-4 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Technician</th>
                <th className={`text-center py-3 px-4 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Rating</th>
                <th className={`text-center py-3 px-4 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Jobs</th>
                <th className={`text-center py-3 px-4 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Response Time</th>
                <th className={`text-center py-3 px-4 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fix Rate</th>
                <th className={`text-center py-3 px-4 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Satisfaction</th>
                <th className={`text-center py-3 px-4 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Efficiency</th>
                <th className={`text-center py-3 px-4 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {technicianPerformance.map((tech, index) => (
                <motion.tr
                  key={tech.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.6 }}
                  className={`border-b ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'} transition-colors`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                        <span className="text-white font-bold">{tech.avatar}</span>
                      </div>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{tech.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{tech.rating}</span>
                    </div>
                  </td>
                  <td className={`py-4 px-4 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>{tech.jobsCompleted}</td>
                  <td className={`py-4 px-4 text-center ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{tech.avgResponseTime}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm">
                      {tech.firstTimeFixRate}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-16 h-2 ${isDark ? 'bg-white/10' : 'bg-slate-200'} rounded-full overflow-hidden`}>
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                          style={{ width: `${tech.customerSatisfaction}%` }}
                        />
                      </div>
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{tech.customerSatisfaction}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-16 h-2 ${isDark ? 'bg-white/10' : 'bg-slate-200'} rounded-full overflow-hidden`}>
                        <div
                          className={`h-full rounded-full ${tech.efficiency >= 90 ? 'bg-emerald-500' : tech.efficiency >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${tech.efficiency}%` }}
                        />
                      </div>
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{tech.efficiency}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${
                      tech.trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' :
                      tech.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {tech.trend === 'up' ? <TrendingUp className="w-4 h-4" /> :
                       tech.trend === 'down' ? <TrendingDown className="w-4 h-4" /> :
                       <span className="w-4 h-0.5 bg-current" />}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
