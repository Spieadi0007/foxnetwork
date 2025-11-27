'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Clock,
  Package,
  MapPin,
  Calendar,
  User,
  Wrench,
  FileText,
  MessageSquare,
  Trash2,
  Check,
  CheckCheck,
  Filter,
  Settings,
  X,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'alert'
  category: 'request' | 'project' | 'equipment' | 'team' | 'system'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
}

const mockNotifications: Notification[] = [
  {
    id: 'NOT-001',
    type: 'success',
    category: 'project',
    title: 'Installation Complete',
    message: 'Phase 2 of the Downtown Mall installation has been completed successfully.',
    timestamp: '10 minutes ago',
    read: false,
    actionUrl: '/client/projects',
  },
  {
    id: 'NOT-002',
    type: 'info',
    category: 'request',
    title: 'Request Approved',
    message: 'Your maintenance request REQ-003 for Central Station has been approved.',
    timestamp: '1 hour ago',
    read: false,
    actionUrl: '/client/requests',
  },
  {
    id: 'NOT-003',
    type: 'warning',
    category: 'equipment',
    title: 'Equipment Alert',
    message: 'Locker unit at Airport Terminal B is showing intermittent connectivity.',
    timestamp: '2 hours ago',
    read: false,
    actionUrl: '/client/equipment',
  },
  {
    id: 'NOT-004',
    type: 'info',
    category: 'team',
    title: 'Team Member Joined',
    message: 'David Kim has accepted your invitation and joined the team.',
    timestamp: '3 hours ago',
    read: true,
    actionUrl: '/client/team',
  },
  {
    id: 'NOT-005',
    type: 'success',
    category: 'request',
    title: 'Visit Scheduled',
    message: 'A technician visit has been scheduled for January 22nd at 10:00 AM.',
    timestamp: '5 hours ago',
    read: true,
    actionUrl: '/client/schedule',
  },
  {
    id: 'NOT-006',
    type: 'info',
    category: 'system',
    title: 'System Update',
    message: 'The client portal has been updated with new features. Check out what\'s new!',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: 'NOT-007',
    type: 'alert',
    category: 'equipment',
    title: 'Maintenance Required',
    message: 'Scheduled maintenance is due for 3 units at University Campus.',
    timestamp: 'Yesterday',
    read: true,
    actionUrl: '/client/equipment',
  },
  {
    id: 'NOT-008',
    type: 'success',
    category: 'project',
    title: 'Project Completed',
    message: 'Tech Park System Upgrade project has been marked as completed.',
    timestamp: '2 days ago',
    read: true,
    actionUrl: '/client/projects',
  },
]

export default function ClientNotificationsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [notifications, setNotifications] = useState(mockNotifications)
  const [filterType, setFilterType] = useState<string>('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const filteredNotifications = notifications.filter((notification) => {
    const matchesType = filterType === 'all' || notification.category === filterType
    const matchesRead = !showUnreadOnly || !notification.read
    return matchesType && matchesRead
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return CheckCircle
      case 'warning':
        return AlertCircle
      case 'alert':
        return AlertCircle
      default:
        return Bell
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500' }
      case 'warning':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500' }
      case 'alert':
        return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' }
      default:
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' }
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'request':
        return FileText
      case 'project':
        return Package
      case 'equipment':
        return Wrench
      case 'team':
        return User
      case 'system':
        return Settings
      default:
        return Bell
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Notifications
          </h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Stay updated on your requests, projects, and equipment
          </p>
        </div>

        {unreadCount > 0 && (
          <motion.button
            onClick={markAllAsRead}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium ${
              isDark
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CheckCheck className="w-4 h-4" />
            Mark All as Read
          </motion.button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: notifications.length, icon: Bell, color: 'blue' },
          { label: 'Unread', value: unreadCount, icon: AlertCircle, color: 'amber' },
          { label: 'Today', value: notifications.filter((n) => n.timestamp.includes('minutes') || n.timestamp.includes('hour')).length, icon: Clock, color: 'purple' },
          { label: 'This Week', value: notifications.length, icon: Calendar, color: 'emerald' },
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All' },
              { id: 'request', label: 'Requests' },
              { id: 'project', label: 'Projects' },
              { id: 'equipment', label: 'Equipment' },
              { id: 'team', label: 'Team' },
              { id: 'system', label: 'System' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterType(filter.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterType === filter.id
                    ? isDark
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-blue-50 text-blue-600'
                    : isDark
                    ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
            />
            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Show unread only
            </span>
          </label>
        </div>
      </div>

      {/* Notifications List */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
        <AnimatePresence>
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-white/5">
              {filteredNotifications.map((notification, index) => {
                const TypeIcon = getTypeIcon(notification.type)
                const typeColor = getTypeColor(notification.type)
                const CategoryIcon = getCategoryIcon(notification.category)

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 transition-all ${
                      !notification.read
                        ? isDark
                          ? 'bg-blue-500/5'
                          : 'bg-blue-50/50'
                        : ''
                    } ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-2.5 rounded-xl ${typeColor.bg}`}>
                        <TypeIcon className={`w-5 h-5 ${typeColor.text}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                              )}
                            </div>
                            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {notification.message}
                            </p>
                            <div className={`flex items-center gap-3 mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {notification.timestamp}
                              </span>
                              <span className="flex items-center gap-1">
                                <CategoryIcon className="w-3.5 h-3.5" />
                                {notification.category}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => markAsRead(notification.id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                                }`}
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => deleteNotification(notification.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDark ? 'hover:bg-red-500/20 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-500 hover:text-red-500'
                              }`}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>

                        {/* Action Button */}
                        {notification.actionUrl && (
                          <motion.a
                            href={notification.actionUrl}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`inline-flex items-center gap-1 mt-3 px-3 py-1.5 rounded-lg text-xs font-medium ${
                              isDark
                                ? 'bg-white/10 text-white hover:bg-white/20'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            View Details
                          </motion.a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center"
            >
              <Bell className={`w-12 h-12 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
              <p className={`mt-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No notifications
              </p>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {showUnreadOnly ? "You're all caught up!" : 'You have no notifications yet'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
