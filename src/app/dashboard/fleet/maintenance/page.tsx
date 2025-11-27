'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/theme-context'
import {
  Wrench,
  Plus,
  Search,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Truck,
  DollarSign,
  FileText,
  Filter,
} from 'lucide-react'

const maintenanceStats = [
  { label: 'Scheduled', value: 8, icon: Calendar, color: 'from-blue-500 to-cyan-600' },
  { label: 'In Progress', value: 3, icon: Wrench, color: 'from-amber-500 to-orange-600' },
  { label: 'Completed (MTD)', value: 12, icon: CheckCircle2, color: 'from-emerald-500 to-teal-600' },
  { label: 'Total Cost (MTD)', value: '$4,850', icon: DollarSign, color: 'from-violet-500 to-purple-600' },
]

const maintenanceRecords = [
  { id: 'M-001', vehicle: 'Ford Transit 250', plate: 'ABC-1234', type: 'Oil Change', status: 'scheduled', scheduledDate: '2024-11-28', cost: null, technician: 'Service Center', priority: 'medium', notes: 'Regular 5,000 mile service' },
  { id: 'M-002', vehicle: 'Chevrolet Express 2500', plate: 'GHI-9012', type: 'Brake Replacement', status: 'in_progress', scheduledDate: '2024-11-25', cost: 650, technician: 'AutoCare Plus', priority: 'high', notes: 'Front and rear brake pads' },
  { id: 'M-003', vehicle: 'Ram ProMaster 1500', plate: 'DEF-5678', type: 'Tire Rotation', status: 'scheduled', scheduledDate: '2024-12-02', cost: null, technician: 'Service Center', priority: 'low', notes: 'Rotate and balance all tires' },
  { id: 'M-004', vehicle: 'Ford F-150', plate: 'JKL-3456', type: 'Brake Inspection', status: 'scheduled', scheduledDate: '2024-11-29', cost: null, technician: 'Service Center', priority: 'high', notes: 'Reported squeaking noise' },
  { id: 'M-005', vehicle: 'Ford Transit 250', plate: 'ABC-1234', type: 'Transmission Service', status: 'completed', scheduledDate: '2024-11-15', cost: 450, technician: 'AutoCare Plus', priority: 'medium', notes: 'Fluid change and filter' },
  { id: 'M-006', vehicle: 'Mercedes Sprinter', plate: 'MNO-7890', type: 'AC Repair', status: 'completed', scheduledDate: '2024-11-10', cost: 380, technician: 'Climate Control Pros', priority: 'medium', notes: 'Replaced compressor' },
  { id: 'M-007', vehicle: 'Chevrolet Express 2500', plate: 'GHI-9012', type: 'Engine Diagnostic', status: 'in_progress', scheduledDate: '2024-11-25', cost: 150, technician: 'AutoCare Plus', priority: 'high', notes: 'Check engine light on' },
  { id: 'M-008', vehicle: 'Ram ProMaster 1500', plate: 'DEF-5678', type: 'Battery Replacement', status: 'completed', scheduledDate: '2024-11-05', cost: 220, technician: 'Service Center', priority: 'medium', notes: 'New AGM battery installed' },
]

export default function MaintenancePage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredRecords = maintenanceRecords.filter(r => {
    const matchesSearch = r.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.plate.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
      case 'in_progress': return isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
      case 'completed': return isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
      default: return isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
      case 'medium': return isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
      case 'low': return isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600'
      default: return isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-4 h-4" />
      case 'in_progress': return <Wrench className="w-4 h-4" />
      case 'completed': return <CheckCircle2 className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Maintenance</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Track vehicle service schedules and repair history</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>Schedule Service</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {maintenanceStats.map((stat, index) => (
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
                <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className={`flex items-center gap-4 p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border`}>
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search maintenance records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'} border focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`px-4 py-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Maintenance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border overflow-hidden`}
      >
        <table className="w-full">
          <thead>
            <tr className={isDark ? 'bg-white/5' : 'bg-slate-50'}>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Vehicle</th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Service Type</th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status</th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Priority</th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Date</th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cost</th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Vendor</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
            {filteredRecords.map((record, index) => (
              <motion.tr
                key={record.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} cursor-pointer transition-colors`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                      <Truck className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{record.vehicle}</p>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{record.plate}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{record.type}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{record.notes}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(record.status)}`}>
                    {getStatusIcon(record.status)}
                    {record.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${getPriorityBadge(record.priority)}`}>
                    {record.priority}
                  </span>
                </td>
                <td className={`px-6 py-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {record.scheduledDate}
                </td>
                <td className={`px-6 py-4 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {record.cost ? `$${record.cost}` : '—'}
                </td>
                <td className={`px-6 py-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {record.technician}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
