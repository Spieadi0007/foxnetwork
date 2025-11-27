'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronRight,
  MapPin,
  Calendar,
  User,
  Package,
  Wrench,
  Truck,
  Trash2,
  MoreHorizontal,
  MessageSquare,
  FileText,
  X,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface ServiceRequest {
  id: string
  type: 'deployment' | 'maintenance' | 'removal' | 'repair' | 'inspection'
  title: string
  description: string
  location: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
  assignedTo?: string
  equipment?: string
}

const mockRequests: ServiceRequest[] = [
  {
    id: 'REQ-001',
    type: 'deployment',
    title: 'New Locker Installation - Building A',
    description: 'Deploy 4 new smart lockers in the lobby area of Building A',
    location: 'Downtown Mall - Main Entrance',
    priority: 'high',
    status: 'in_progress',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-18',
    assignedTo: 'Tech Team Alpha',
    equipment: 'Smart Locker Pro X4',
  },
  {
    id: 'REQ-002',
    type: 'maintenance',
    title: 'Scheduled Maintenance - Terminal B',
    description: 'Routine maintenance check for all 8 lockers at Terminal B',
    location: 'Airport Terminal B',
    priority: 'medium',
    status: 'approved',
    createdAt: '2024-01-16',
    updatedAt: '2024-01-17',
    assignedTo: 'Maintenance Crew',
  },
  {
    id: 'REQ-003',
    type: 'repair',
    title: 'Locker Door Malfunction',
    description: 'Door #3 on locker unit is not opening properly. Customer complaints received.',
    location: 'Central Station',
    priority: 'urgent',
    status: 'pending',
    createdAt: '2024-01-18',
    updatedAt: '2024-01-18',
    equipment: 'Locker Unit #CS-003',
  },
  {
    id: 'REQ-004',
    type: 'removal',
    title: 'Decommission Old Units',
    description: 'Remove 2 outdated locker units from basement level',
    location: 'Tech Park Building A',
    priority: 'low',
    status: 'pending',
    createdAt: '2024-01-17',
    updatedAt: '2024-01-17',
  },
  {
    id: 'REQ-005',
    type: 'inspection',
    title: 'Annual Safety Inspection',
    description: 'Complete safety inspection required for all units',
    location: 'University Campus',
    priority: 'medium',
    status: 'completed',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-14',
    assignedTo: 'Safety Inspector',
  },
]

export default function ClientRequestsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [showNewRequestModal, setShowNewRequestModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)

  const filteredRequests = mockRequests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus
    const matchesType = filterType === 'all' || request.type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deployment':
        return Truck
      case 'maintenance':
        return Wrench
      case 'removal':
        return Trash2
      case 'repair':
        return AlertTriangle
      case 'inspection':
        return FileText
      default:
        return ClipboardList
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Clock }
      case 'approved':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: CheckCircle }
      case 'in_progress':
        return { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: Clock }
      case 'completed':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle }
      case 'cancelled':
        return { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle }
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: Clock }
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-500' }
      case 'high':
        return { bg: 'bg-orange-500/20', text: 'text-orange-400', dot: 'bg-orange-500' }
      case 'medium':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', dot: 'bg-blue-500' }
      case 'low':
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', dot: 'bg-slate-500' }
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', dot: 'bg-slate-500' }
    }
  }

  const stats = {
    total: mockRequests.length,
    pending: mockRequests.filter((r) => r.status === 'pending').length,
    inProgress: mockRequests.filter((r) => r.status === 'in_progress').length,
    completed: mockRequests.filter((r) => r.status === 'completed').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Service Requests
          </h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Create and manage your service requests
          </p>
        </div>

        <motion.button
          onClick={() => setShowNewRequestModal(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-5 h-5" />
          New Request
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: stats.total, color: 'blue', icon: ClipboardList },
          { label: 'Pending', value: stats.pending, color: 'amber', icon: Clock },
          { label: 'In Progress', value: stats.inProgress, color: 'purple', icon: AlertTriangle },
          { label: 'Completed', value: stats.completed, color: 'emerald', icon: CheckCircle },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                <stat.icon className={`w-5 h-5 ${
                  stat.color === 'blue' ? 'text-blue-500' :
                  stat.color === 'amber' ? 'text-amber-500' :
                  stat.color === 'purple' ? 'text-purple-500' :
                  'text-emerald-500'
                }`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-2.5 rounded-xl border transition-all ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/50'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500'
              }`}
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2.5 rounded-xl border transition-all ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-4 py-2.5 rounded-xl border transition-all ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="all">All Types</option>
              <option value="deployment">Deployment</option>
              <option value="maintenance">Maintenance</option>
              <option value="repair">Repair</option>
              <option value="removal">Removal</option>
              <option value="inspection">Inspection</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="divide-y divide-white/5">
          {filteredRequests.map((request, index) => {
            const TypeIcon = getTypeIcon(request.type)
            const statusBadge = getStatusBadge(request.status)
            const StatusIcon = statusBadge.icon
            const priorityBadge = getPriorityBadge(request.priority)

            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedRequest(request)}
                className={`p-5 cursor-pointer transition-all ${
                  isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${
                    request.type === 'deployment' ? 'bg-blue-500/20' :
                    request.type === 'maintenance' ? 'bg-amber-500/20' :
                    request.type === 'repair' ? 'bg-red-500/20' :
                    request.type === 'removal' ? 'bg-slate-500/20' :
                    'bg-purple-500/20'
                  }`}>
                    <TypeIcon className={`w-5 h-5 ${
                      request.type === 'deployment' ? 'text-blue-400' :
                      request.type === 'maintenance' ? 'text-amber-400' :
                      request.type === 'repair' ? 'text-red-400' :
                      request.type === 'removal' ? 'text-slate-400' :
                      'text-purple-400'
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {request.id}
                          </span>
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${priorityBadge.bg} ${priorityBadge.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${priorityBadge.dot}`} />
                            {request.priority}
                          </span>
                        </div>
                        <h3 className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {request.title}
                        </h3>
                        <p className={`text-sm mt-1 line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {request.description}
                        </p>
                      </div>

                      <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${statusBadge.bg} ${statusBadge.text}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {request.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className={`flex flex-wrap items-center gap-4 mt-3 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {request.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {request.createdAt}
                      </span>
                      {request.assignedTo && (
                        <span className="flex items-center gap-1.5">
                          <User className="w-4 h-4" />
                          {request.assignedTo}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className={`w-5 h-5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                </div>
              </motion.div>
            )
          })}
        </div>

        {filteredRequests.length === 0 && (
          <div className="p-12 text-center">
            <ClipboardList className={`w-12 h-12 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
            <p className={`mt-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              No requests found
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Try adjusting your filters or create a new request
            </p>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {showNewRequestModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNewRequestModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-2xl border shadow-2xl ${
                isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Create New Request
                </h2>
                <button
                  onClick={() => setShowNewRequestModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Request Type
                  </label>
                  <select className={`w-full px-4 py-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}>
                    <option value="">Select type...</option>
                    <option value="deployment">Deployment</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="repair">Repair</option>
                    <option value="removal">Removal</option>
                    <option value="inspection">Inspection</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of the request"
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Location
                  </label>
                  <select className={`w-full px-4 py-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}>
                    <option value="">Select location...</option>
                    <option value="1">Downtown Mall - Main Entrance</option>
                    <option value="2">Airport Terminal B</option>
                    <option value="3">Central Station</option>
                    <option value="4">Tech Park Building A</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Priority
                  </label>
                  <select className={`w-full px-4 py-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide details about the request..."
                    className={`w-full px-4 py-2.5 rounded-xl border resize-none ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div className={`flex items-center justify-end gap-3 p-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <button
                  onClick={() => setShowNewRequestModal(false)}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
                    isDark
                      ? 'text-slate-300 hover:bg-white/10'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25"
                >
                  Submit Request
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
