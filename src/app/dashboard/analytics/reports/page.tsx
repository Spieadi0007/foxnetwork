'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  RefreshCcw,
  Eye,
  MoreHorizontal,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface Report {
  id: string
  name: string
  type: 'revenue' | 'operations' | 'team' | 'customer'
  schedule: 'daily' | 'weekly' | 'monthly' | 'one_time'
  lastGenerated: string
  status: 'ready' | 'generating' | 'scheduled'
  format: 'pdf' | 'excel' | 'csv'
}

const mockReports: Report[] = [
  { id: 'R1', name: 'Monthly Revenue Report', type: 'revenue', schedule: 'monthly', lastGenerated: '2025-11-01', status: 'ready', format: 'pdf' },
  { id: 'R2', name: 'Weekly Operations Summary', type: 'operations', schedule: 'weekly', lastGenerated: '2025-11-18', status: 'ready', format: 'excel' },
  { id: 'R3', name: 'Team Performance Analysis', type: 'team', schedule: 'monthly', lastGenerated: '2025-11-01', status: 'ready', format: 'pdf' },
  { id: 'R4', name: 'Customer Satisfaction Report', type: 'customer', schedule: 'weekly', lastGenerated: '2025-11-18', status: 'generating', format: 'pdf' },
  { id: 'R5', name: 'Daily Work Order Summary', type: 'operations', schedule: 'daily', lastGenerated: '2025-11-24', status: 'ready', format: 'csv' },
  { id: 'R6', name: 'Q4 Financial Overview', type: 'revenue', schedule: 'one_time', lastGenerated: '2025-10-01', status: 'scheduled', format: 'excel' },
]

const typeConfig = {
  revenue: { label: 'Revenue', icon: DollarSign, color: 'bg-emerald-500/20 text-emerald-400' },
  operations: { label: 'Operations', icon: BarChart3, color: 'bg-violet-500/20 text-violet-400' },
  team: { label: 'Team', icon: Users, color: 'bg-blue-500/20 text-blue-400' },
  customer: { label: 'Customer', icon: TrendingUp, color: 'bg-amber-500/20 text-amber-400' },
}

const scheduleConfig = {
  daily: { label: 'Daily', color: 'text-emerald-400' },
  weekly: { label: 'Weekly', color: 'text-blue-400' },
  monthly: { label: 'Monthly', color: 'text-violet-400' },
  one_time: { label: 'One Time', color: 'text-slate-400' },
}

const statusConfig = {
  ready: { label: 'Ready', color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle2 },
  generating: { label: 'Generating', color: 'bg-amber-500/20 text-amber-400', icon: RefreshCcw },
  scheduled: { label: 'Scheduled', color: 'bg-blue-500/20 text-blue-400', icon: Clock },
}

const reportTemplates = [
  { name: 'Revenue Report', icon: DollarSign, description: 'Financial performance and revenue breakdown' },
  { name: 'Operations Report', icon: BarChart3, description: 'Work orders, completion rates, and efficiency' },
  { name: 'Team Report', icon: Users, description: 'Technician performance and utilization' },
  { name: 'Custom Report', icon: PieChart, description: 'Build a custom report with selected metrics' },
]

export default function ReportsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filteredReports = mockReports.filter(report =>
    report.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Reports</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Generate and download detailed reports</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>Create Report</span>
        </motion.button>
      </div>

      {/* Quick Templates */}
      <div className="grid grid-cols-4 gap-4">
        {reportTemplates.map((template, index) => (
          <motion.button
            key={template.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'} border text-left transition-all`}
          >
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 w-fit mb-3">
              <template.icon className="w-5 h-5 text-violet-400" />
            </div>
            <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{template.name}</h4>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{template.description}</p>
          </motion.button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'} border rounded-xl text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
          />
        </div>
      </div>

      {/* Reports List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border overflow-hidden`}
      >
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <th className={`text-left py-4 px-6 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Report Name</th>
              <th className={`text-left py-4 px-6 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Type</th>
              <th className={`text-left py-4 px-6 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Schedule</th>
              <th className={`text-left py-4 px-6 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Last Generated</th>
              <th className={`text-left py-4 px-6 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status</th>
              <th className={`text-left py-4 px-6 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Format</th>
              <th className={`text-right py-4 px-6 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report, index) => {
              const TypeIcon = typeConfig[report.type].icon
              const StatusIcon = statusConfig[report.status].icon
              return (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.4 }}
                  className={`border-b ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'} transition-colors`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                        <FileText className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                      </div>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{report.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${typeConfig[report.type].color}`}>
                      <TypeIcon className="w-3.5 h-3.5" />
                      {typeConfig[report.type].label}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-sm font-medium ${scheduleConfig[report.schedule].color}`}>
                      {scheduleConfig[report.schedule].label}
                    </span>
                  </td>
                  <td className={`py-4 px-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{report.lastGenerated}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig[report.status].color}`}>
                      <StatusIcon className={`w-3.5 h-3.5 ${report.status === 'generating' ? 'animate-spin' : ''}`} />
                      {statusConfig[report.status].label}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'} uppercase`}>{report.format}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'} ${report.status === 'ready' ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 cursor-not-allowed'}`}
                        disabled={report.status !== 'ready'}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </motion.div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg p-6 rounded-2xl ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'} border`}
          >
            <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'} mb-6`}>Create New Report</h3>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-1.5`}>Report Name</label>
                <input
                  type="text"
                  placeholder="Enter report name"
                  className={`w-full px-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-1.5`}>Report Type</label>
                <select className={`w-full px-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}>
                  <option value="revenue">Revenue</option>
                  <option value="operations">Operations</option>
                  <option value="team">Team</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-1.5`}>Schedule</label>
                  <select className={`w-full px-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}>
                    <option value="one_time">One Time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-1.5`}>Format</label>
                  <select className={`w-full px-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}>
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-1.5`}>Date Range</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    className={`px-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                  />
                  <input
                    type="date"
                    className={`px-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium"
              >
                Generate Report
              </motion.button>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`px-4 py-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'} border font-medium`}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
