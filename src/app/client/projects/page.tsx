'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderKanban,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  MapPin,
  Calendar,
  Users,
  Target,
  MoreHorizontal,
  Plus,
  ArrowRight,
  Package,
  CircleDot,
  Timer,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface Project {
  id: string
  name: string
  description: string
  requestId: string
  type: 'deployment' | 'maintenance' | 'removal' | 'upgrade'
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
  progress: number
  location: string
  startDate: string
  dueDate: string
  teamLead: string
  teamSize: number
  stages: { name: string; status: 'completed' | 'in_progress' | 'pending' }[]
}

const mockProjects: Project[] = [
  {
    id: 'PRJ-001',
    name: 'Downtown Mall Locker Expansion',
    description: 'Deploy 4 new smart lockers to expand capacity at main entrance',
    requestId: 'REQ-001',
    type: 'deployment',
    status: 'in_progress',
    progress: 65,
    location: 'Downtown Mall - Main Entrance',
    startDate: '2024-01-15',
    dueDate: '2024-02-15',
    teamLead: 'John Smith',
    teamSize: 4,
    stages: [
      { name: 'Site Survey', status: 'completed' },
      { name: 'Equipment Delivery', status: 'completed' },
      { name: 'Installation', status: 'in_progress' },
      { name: 'Testing', status: 'pending' },
      { name: 'Client Handover', status: 'pending' },
    ],
  },
  {
    id: 'PRJ-002',
    name: 'Airport Maintenance Q1',
    description: 'Quarterly maintenance for all 8 lockers at Terminal B',
    requestId: 'REQ-002',
    type: 'maintenance',
    status: 'planning',
    progress: 10,
    location: 'Airport Terminal B',
    startDate: '2024-01-20',
    dueDate: '2024-01-25',
    teamLead: 'Sarah Johnson',
    teamSize: 2,
    stages: [
      { name: 'Schedule Confirmation', status: 'completed' },
      { name: 'Parts Procurement', status: 'in_progress' },
      { name: 'Maintenance Work', status: 'pending' },
      { name: 'Testing & QA', status: 'pending' },
    ],
  },
  {
    id: 'PRJ-003',
    name: 'Tech Park System Upgrade',
    description: 'Upgrade software and hardware on existing locker units',
    requestId: 'REQ-006',
    type: 'upgrade',
    status: 'completed',
    progress: 100,
    location: 'Tech Park Building A',
    startDate: '2024-01-05',
    dueDate: '2024-01-12',
    teamLead: 'Mike Chen',
    teamSize: 3,
    stages: [
      { name: 'Backup Data', status: 'completed' },
      { name: 'Software Update', status: 'completed' },
      { name: 'Hardware Inspection', status: 'completed' },
      { name: 'Testing', status: 'completed' },
    ],
  },
  {
    id: 'PRJ-004',
    name: 'Old Unit Removal',
    description: 'Decommission and remove outdated locker units from basement',
    requestId: 'REQ-004',
    type: 'removal',
    status: 'on_hold',
    progress: 25,
    location: 'Tech Park Building A',
    startDate: '2024-01-18',
    dueDate: '2024-01-30',
    teamLead: 'Lisa Park',
    teamSize: 2,
    stages: [
      { name: 'Data Migration', status: 'completed' },
      { name: 'Disconnection', status: 'pending' },
      { name: 'Physical Removal', status: 'pending' },
      { name: 'Site Cleanup', status: 'pending' },
    ],
  },
]

export default function ClientProjectsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planning':
        return { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: Target }
      case 'in_progress':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Clock }
      case 'on_hold':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: AlertCircle }
      case 'completed':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle }
      case 'cancelled':
        return { bg: 'bg-red-500/20', text: 'text-red-400', icon: AlertCircle }
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: Clock }
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deployment':
        return 'from-blue-500 to-cyan-600'
      case 'maintenance':
        return 'from-amber-500 to-orange-600'
      case 'removal':
        return 'from-slate-500 to-slate-600'
      case 'upgrade':
        return 'from-purple-500 to-pink-600'
      default:
        return 'from-slate-500 to-slate-600'
    }
  }

  const stats = {
    total: mockProjects.length,
    active: mockProjects.filter((p) => p.status === 'in_progress').length,
    planning: mockProjects.filter((p) => p.status === 'planning').length,
    completed: mockProjects.filter((p) => p.status === 'completed').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Projects
          </h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Track and monitor your service projects
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Projects', value: stats.total, color: 'blue', icon: FolderKanban },
          { label: 'Active', value: stats.active, color: 'emerald', icon: Clock },
          { label: 'Planning', value: stats.planning, color: 'purple', icon: Target },
          { label: 'Completed', value: stats.completed, color: 'cyan', icon: CheckCircle },
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
                  stat.color === 'emerald' ? 'text-emerald-500' :
                  stat.color === 'purple' ? 'text-purple-500' :
                  'text-cyan-500'
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
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-2.5 rounded-xl border transition-all ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2.5 rounded-xl border ${
              isDark
                ? 'bg-white/5 border-white/10 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project, index) => {
          const statusBadge = getStatusBadge(project.status)
          const StatusIcon = statusBadge.icon

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setSelectedProject(project)}
              className={`rounded-2xl border overflow-hidden cursor-pointer transition-all ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:border-white/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg'
              }`}
            >
              {/* Header */}
              <div className={`p-5 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getTypeColor(project.type)} flex items-center justify-center shadow-lg`}>
                      <FolderKanban className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {project.id}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                          {project.type}
                        </span>
                      </div>
                      <h3 className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {project.name}
                      </h3>
                    </div>
                  </div>

                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                <p className={`text-sm mt-3 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {project.description}
                </p>
              </div>

              {/* Progress */}
              <div className={`px-5 py-4 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Progress</span>
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {project.progress}%
                  </span>
                </div>
                <div className={`h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${getTypeColor(project.type)}`}
                  />
                </div>
              </div>

              {/* Stages Mini View */}
              <div className={`px-5 py-3 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                <div className="flex items-center gap-1">
                  {project.stages.map((stage, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1.5 rounded-full ${
                        stage.status === 'completed'
                          ? 'bg-emerald-500'
                          : stage.status === 'in_progress'
                          ? 'bg-blue-500 animate-pulse'
                          : isDark
                          ? 'bg-white/10'
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {project.stages.filter((s) => s.status === 'completed').length} of {project.stages.length} stages completed
                </p>
              </div>

              {/* Footer */}
              <div className="p-5">
                <div className={`flex flex-wrap items-center gap-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {project.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Due: {project.dueDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {project.teamSize} members
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <FolderKanban className={`w-12 h-12 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
          <p className={`mt-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            No projects found
          </p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Projects are created from approved service requests
          </p>
        </div>
      )}

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border shadow-2xl ${
                isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              {/* Modal Header */}
              <div className={`sticky top-0 z-10 p-5 border-b backdrop-blur-xl ${
                isDark ? 'bg-slate-900/90 border-white/10' : 'bg-white/90 border-slate-200'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getTypeColor(selectedProject.type)} flex items-center justify-center`}>
                      <FolderKanban className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {selectedProject.id}
                      </span>
                      <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {selectedProject.name}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                    }`}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-5 space-y-6">
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Overall Progress</span>
                    <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedProject.progress}%
                    </span>
                  </div>
                  <div className={`h-3 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${getTypeColor(selectedProject.type)}`}
                      style={{ width: `${selectedProject.progress}%` }}
                    />
                  </div>
                </div>

                {/* Stages */}
                <div>
                  <h3 className={`font-medium mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Project Stages
                  </h3>
                  <div className="space-y-3">
                    {selectedProject.stages.map((stage, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-xl ${
                          isDark ? 'bg-white/5' : 'bg-slate-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          stage.status === 'completed'
                            ? 'bg-emerald-500/20'
                            : stage.status === 'in_progress'
                            ? 'bg-blue-500/20'
                            : isDark
                            ? 'bg-white/10'
                            : 'bg-slate-200'
                        }`}>
                          {stage.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : stage.status === 'in_progress' ? (
                            <CircleDot className="w-4 h-4 text-blue-400 animate-pulse" />
                          ) : (
                            <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <span className={`flex-1 ${
                          stage.status === 'completed'
                            ? isDark ? 'text-slate-300' : 'text-slate-700'
                            : stage.status === 'in_progress'
                            ? isDark ? 'text-white' : 'text-slate-900'
                            : isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          {stage.name}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-lg ${
                          stage.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : stage.status === 'in_progress'
                            ? 'bg-blue-500/20 text-blue-400'
                            : isDark
                            ? 'bg-white/10 text-slate-500'
                            : 'bg-slate-200 text-slate-400'
                        }`}>
                          {stage.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Location</p>
                    <p className={`font-medium mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedProject.location}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Team Lead</p>
                    <p className={`font-medium mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedProject.teamLead}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Start Date</p>
                    <p className={`font-medium mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedProject.startDate}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Due Date</p>
                    <p className={`font-medium mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedProject.dueDate}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className={`p-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <div className="flex items-center justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-5 py-2.5 rounded-xl font-medium ${
                      isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    View Activity Log
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium"
                  >
                    Contact Team
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
