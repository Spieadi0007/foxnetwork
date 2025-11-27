'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronRight,
  MapPin,
  User,
  Package,
  Truck,
  Wrench,
  Camera,
  MessageSquare,
  FileText,
  Phone,
  Eye,
  Download,
  MoreHorizontal,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface ActivityEvent {
  id: string
  type: 'visit' | 'update' | 'comment' | 'status_change' | 'document' | 'call' | 'photo'
  title: string
  description: string
  projectId: string
  projectName: string
  location: string
  user: string
  userRole: string
  timestamp: string
  date: string
  outcome?: 'success' | 'partial' | 'failed' | 'pending'
  metadata?: {
    attemptNumber?: number
    duration?: string
    attachments?: number
  }
}

const mockActivities: ActivityEvent[] = [
  {
    id: 'ACT-001',
    type: 'visit',
    title: 'Installation Visit - Attempt 1',
    description: 'First installation attempt. Site was accessible but electrical work pending from client side.',
    projectId: 'PRJ-001',
    projectName: 'Downtown Mall Locker Expansion',
    location: 'Downtown Mall - Main Entrance',
    user: 'John Smith',
    userRole: 'Lead Technician',
    timestamp: '10:30 AM',
    date: '2024-01-18',
    outcome: 'partial',
    metadata: { attemptNumber: 1, duration: '2h 15m' },
  },
  {
    id: 'ACT-002',
    type: 'photo',
    title: 'Site Photos Uploaded',
    description: '8 photos uploaded documenting current installation progress',
    projectId: 'PRJ-001',
    projectName: 'Downtown Mall Locker Expansion',
    location: 'Downtown Mall - Main Entrance',
    user: 'John Smith',
    userRole: 'Lead Technician',
    timestamp: '12:45 PM',
    date: '2024-01-18',
    metadata: { attachments: 8 },
  },
  {
    id: 'ACT-003',
    type: 'status_change',
    title: 'Project Status Updated',
    description: 'Project moved from "Planning" to "In Progress"',
    projectId: 'PRJ-001',
    projectName: 'Downtown Mall Locker Expansion',
    location: 'Downtown Mall - Main Entrance',
    user: 'Sarah Johnson',
    userRole: 'Project Manager',
    timestamp: '9:00 AM',
    date: '2024-01-18',
  },
  {
    id: 'ACT-004',
    type: 'call',
    title: 'Client Coordination Call',
    description: 'Discussed electrical requirements and timeline with client facility manager',
    projectId: 'PRJ-001',
    projectName: 'Downtown Mall Locker Expansion',
    location: 'Downtown Mall - Main Entrance',
    user: 'Mike Chen',
    userRole: 'Account Manager',
    timestamp: '2:30 PM',
    date: '2024-01-17',
    metadata: { duration: '25m' },
  },
  {
    id: 'ACT-005',
    type: 'visit',
    title: 'Maintenance Visit Completed',
    description: 'Quarterly maintenance completed successfully. All units functioning properly.',
    projectId: 'PRJ-003',
    projectName: 'Tech Park System Upgrade',
    location: 'Tech Park Building A',
    user: 'Lisa Park',
    userRole: 'Maintenance Technician',
    timestamp: '4:00 PM',
    date: '2024-01-17',
    outcome: 'success',
    metadata: { duration: '3h 30m' },
  },
  {
    id: 'ACT-006',
    type: 'document',
    title: 'Service Report Generated',
    description: 'Detailed service report with findings and recommendations',
    projectId: 'PRJ-003',
    projectName: 'Tech Park System Upgrade',
    location: 'Tech Park Building A',
    user: 'Lisa Park',
    userRole: 'Maintenance Technician',
    timestamp: '5:15 PM',
    date: '2024-01-17',
    metadata: { attachments: 1 },
  },
  {
    id: 'ACT-007',
    type: 'comment',
    title: 'Internal Note Added',
    description: 'Noted that Unit #3 door mechanism needs replacement within 30 days',
    projectId: 'PRJ-003',
    projectName: 'Tech Park System Upgrade',
    location: 'Tech Park Building A',
    user: 'Lisa Park',
    userRole: 'Maintenance Technician',
    timestamp: '5:20 PM',
    date: '2024-01-17',
  },
  {
    id: 'ACT-008',
    type: 'visit',
    title: 'Initial Site Survey',
    description: 'Site survey visit failed - access denied by security. Need to reschedule with proper authorization.',
    projectId: 'PRJ-002',
    projectName: 'Airport Maintenance Q1',
    location: 'Airport Terminal B',
    user: 'Tom Wilson',
    userRole: 'Field Technician',
    timestamp: '8:30 AM',
    date: '2024-01-16',
    outcome: 'failed',
    metadata: { attemptNumber: 1 },
  },
]

export default function ClientActivityPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterProject, setFilterProject] = useState<string>('all')

  const filteredActivities = mockActivities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.projectName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || activity.type === filterType
    const matchesProject = filterProject === 'all' || activity.projectId === filterProject
    return matchesSearch && matchesType && matchesProject
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'visit':
        return Truck
      case 'update':
        return Activity
      case 'comment':
        return MessageSquare
      case 'status_change':
        return AlertCircle
      case 'document':
        return FileText
      case 'call':
        return Phone
      case 'photo':
        return Camera
      default:
        return Activity
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'visit':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' }
      case 'update':
        return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500' }
      case 'comment':
        return { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500' }
      case 'status_change':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500' }
      case 'document':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500' }
      case 'call':
        return { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500' }
      case 'photo':
        return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500' }
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500' }
    }
  }

  const getOutcomeBadge = (outcome?: string) => {
    switch (outcome) {
      case 'success':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle, label: 'Success' }
      case 'partial':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: AlertCircle, label: 'Partial' }
      case 'failed':
        return { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle, label: 'Failed' }
      case 'pending':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Clock, label: 'Pending' }
      default:
        return null
    }
  }

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = activity.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(activity)
    return groups
  }, {} as Record<string, ActivityEvent[]>)

  const uniqueProjects = [...new Set(mockActivities.map((a) => a.projectId))].map((id) => {
    const activity = mockActivities.find((a) => a.projectId === id)
    return { id, name: activity?.projectName || id }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Activity Log
        </h1>
        <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Track all activities, visits, and updates across your projects
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Activities', value: mockActivities.length, icon: Activity, color: 'blue' },
          { label: 'Site Visits', value: mockActivities.filter((a) => a.type === 'visit').length, icon: Truck, color: 'emerald' },
          { label: 'Documents', value: mockActivities.filter((a) => a.type === 'document').length, icon: FileText, color: 'purple' },
          { label: 'Today', value: mockActivities.filter((a) => a.date === '2024-01-18').length, icon: Calendar, color: 'cyan' },
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
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-2.5 rounded-xl border transition-all ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-4 py-2.5 rounded-xl border ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="all">All Types</option>
              <option value="visit">Visits</option>
              <option value="status_change">Status Changes</option>
              <option value="document">Documents</option>
              <option value="photo">Photos</option>
              <option value="call">Calls</option>
              <option value="comment">Comments</option>
            </select>

            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className={`px-4 py-2.5 rounded-xl border ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="all">All Projects</option>
              {uniqueProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-8">
        {Object.entries(groupedActivities).map(([date, activities]) => (
          <div key={date}>
            {/* Date Header */}
            <div className="flex items-center gap-4 mb-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                isDark ? 'bg-white/10' : 'bg-slate-100'
              }`}>
                <Calendar className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {date === '2024-01-18' ? 'Today' : date === '2024-01-17' ? 'Yesterday' : date}
                </span>
              </div>
              <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            </div>

            {/* Activities for this date */}
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const TypeIcon = getTypeIcon(activity.type)
                const typeColor = getTypeColor(activity.type)
                const outcomeBadge = getOutcomeBadge(activity.outcome)

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative pl-8 ${index < activities.length - 1 ? 'pb-4' : ''}`}
                  >
                    {/* Timeline line */}
                    {index < activities.length - 1 && (
                      <div className={`absolute left-[15px] top-10 bottom-0 w-0.5 ${
                        isDark ? 'bg-white/10' : 'bg-slate-200'
                      }`} />
                    )}

                    {/* Timeline dot */}
                    <div className={`absolute left-0 top-2 w-8 h-8 rounded-full flex items-center justify-center ${typeColor.bg}`}>
                      <TypeIcon className={`w-4 h-4 ${typeColor.text}`} />
                    </div>

                    {/* Activity Card */}
                    <div className={`ml-4 p-4 rounded-2xl border transition-all ${
                      isDark
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-white border-slate-200 hover:shadow-md'
                    }`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {activity.title}
                            </h3>
                            {outcomeBadge && (
                              <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${outcomeBadge.bg} ${outcomeBadge.text}`}>
                                <outcomeBadge.icon className="w-3 h-3" />
                                {outcomeBadge.label}
                              </span>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {activity.description}
                          </p>

                          {/* Metadata */}
                          <div className={`flex flex-wrap items-center gap-4 mt-3 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {activity.timestamp}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {activity.user} ({activity.userRole})
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {activity.location}
                            </span>
                            {activity.metadata?.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                Duration: {activity.metadata.duration}
                              </span>
                            )}
                            {activity.metadata?.attachments && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5" />
                                {activity.metadata.attachments} attachment(s)
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Project Badge */}
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                          isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {activity.projectId}
                        </div>
                      </div>

                      {/* Action buttons for certain types */}
                      {(activity.type === 'document' || activity.type === 'photo') && (
                        <div className={`flex items-center gap-2 mt-4 pt-3 border-t ${
                          isDark ? 'border-white/10' : 'border-slate-100'
                        }`}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                              isDark
                                ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                              isDark
                                ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <Activity className={`w-12 h-12 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
          <p className={`mt-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            No activities found
          </p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Try adjusting your filters
          </p>
        </div>
      )}
    </div>
  )
}
