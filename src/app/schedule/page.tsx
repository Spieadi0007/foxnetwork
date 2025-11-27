'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  CheckCircle,
  AlertCircle,
  Truck,
  Wrench,
  Package,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface ScheduledEvent {
  id: string
  title: string
  type: 'deployment' | 'maintenance' | 'inspection' | 'visit'
  date: string
  time: string
  duration: string
  location: string
  technician: string
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed'
  projectId?: string
}

const mockEvents: ScheduledEvent[] = [
  {
    id: 'EVT-001',
    title: 'Locker Installation - Phase 2',
    type: 'deployment',
    date: '2024-01-22',
    time: '09:00 AM',
    duration: '4 hours',
    location: 'Downtown Mall - Main Entrance',
    technician: 'John Smith',
    status: 'confirmed',
    projectId: 'PRJ-001',
  },
  {
    id: 'EVT-002',
    title: 'Quarterly Maintenance',
    type: 'maintenance',
    date: '2024-01-22',
    time: '02:00 PM',
    duration: '2 hours',
    location: 'Airport Terminal B',
    technician: 'Sarah Johnson',
    status: 'scheduled',
    projectId: 'PRJ-002',
  },
  {
    id: 'EVT-003',
    title: 'System Inspection',
    type: 'inspection',
    date: '2024-01-23',
    time: '10:00 AM',
    duration: '1.5 hours',
    location: 'Central Station',
    technician: 'Mike Chen',
    status: 'scheduled',
  },
  {
    id: 'EVT-004',
    title: 'Follow-up Visit',
    type: 'visit',
    date: '2024-01-24',
    time: '11:00 AM',
    duration: '1 hour',
    location: 'Tech Park Building A',
    technician: 'Lisa Park',
    status: 'scheduled',
  },
  {
    id: 'EVT-005',
    title: 'Unit Replacement',
    type: 'maintenance',
    date: '2024-01-25',
    time: '09:30 AM',
    duration: '3 hours',
    location: 'University Campus',
    technician: 'John Smith',
    status: 'scheduled',
  },
]

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function ClientSchedulePage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [currentDate, setCurrentDate] = useState(new Date(2024, 0, 22)) // January 22, 2024
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deployment':
        return Truck
      case 'maintenance':
        return Wrench
      case 'inspection':
        return CheckCircle
      case 'visit':
        return User
      default:
        return Calendar
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deployment':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' }
      case 'maintenance':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500' }
      case 'inspection':
        return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500' }
      case 'visit':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500' }
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500' }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { bg: 'bg-slate-500/20', text: 'text-slate-400' }
      case 'confirmed':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400' }
      case 'in_progress':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400' }
      case 'completed':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400' }
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400' }
    }
  }

  // Get week dates
  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      return date
    })
  }

  const weekDates = getWeekDates()

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return mockEvents.filter(event => event.date === dateStr)
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentDate(newDate)
  }

  const upcomingEvents = mockEvents.filter(event => event.status !== 'completed')

  const stats = {
    thisWeek: mockEvents.length,
    confirmed: mockEvents.filter(e => e.status === 'confirmed').length,
    pending: mockEvents.filter(e => e.status === 'scheduled').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Schedule
          </h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            View upcoming visits and service appointments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 p-1 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'week'
                  ? isDark
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-blue-600 shadow'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === 'month'
                  ? isDark
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-blue-600 shadow'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'This Week', value: stats.thisWeek, icon: Calendar, color: 'blue' },
          { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'emerald' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'amber' },
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
                  'text-amber-500'
                }`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className={`lg:col-span-2 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          {/* Calendar Header */}
          <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateWeek('prev')}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={() => navigateWeek('next')}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => setCurrentDate(new Date())}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Today
            </button>
          </div>

          {/* Week View */}
          <div className="p-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDates.map((date, index) => {
                const isToday = date.toDateString() === new Date().toDateString()
                return (
                  <div
                    key={index}
                    className={`text-center p-2 rounded-xl ${
                      isToday
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white'
                        : isDark
                        ? 'bg-white/5'
                        : 'bg-slate-50'
                    }`}
                  >
                    <p className={`text-xs font-medium ${isToday ? 'text-blue-100' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {weekDays[date.getDay()]}
                    </p>
                    <p className={`text-lg font-bold ${isToday ? 'text-white' : isDark ? 'text-white' : 'text-slate-900'}`}>
                      {date.getDate()}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Events for each day */}
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date, dayIndex) => {
                const dayEvents = getEventsForDate(date)
                return (
                  <div key={dayIndex} className="min-h-[120px] space-y-1">
                    {dayEvents.map((event) => {
                      const typeColor = getTypeColor(event.type)
                      const Icon = getTypeIcon(event.type)
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`p-2 rounded-lg border-l-2 cursor-pointer transition-all ${typeColor.border} ${
                            isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-start gap-1.5">
                            <Icon className={`w-3 h-3 mt-0.5 ${typeColor.text}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {event.title}
                              </p>
                              <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {event.time}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Events List */}
        <div className={`rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Upcoming Events
            </h2>
          </div>

          <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
            {upcomingEvents.map((event, index) => {
              const typeColor = getTypeColor(event.type)
              const Icon = getTypeIcon(event.type)
              const statusBadge = getStatusBadge(event.status)

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-colors cursor-pointer`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${typeColor.bg}`}>
                      <Icon className={`w-4 h-4 ${typeColor.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {event.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                          {event.status}
                        </span>
                      </div>

                      <div className={`flex flex-col gap-1 mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {event.time} ({event.duration})
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <User className="w-3 h-3" />
                          {event.technician}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
        <p className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Event Types</p>
        <div className="flex flex-wrap gap-4">
          {[
            { type: 'deployment', label: 'Deployment' },
            { type: 'maintenance', label: 'Maintenance' },
            { type: 'inspection', label: 'Inspection' },
            { type: 'visit', label: 'Visit' },
          ].map((item) => {
            const typeColor = getTypeColor(item.type)
            const Icon = getTypeIcon(item.type)
            return (
              <div key={item.type} className="flex items-center gap-2">
                <div className={`p-1.5 rounded ${typeColor.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${typeColor.text}`} />
                </div>
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
