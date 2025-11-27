'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  MapPin,
  MoreHorizontal,
  Filter,
  Calendar as CalendarIcon,
  List,
  Grid3X3,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

type ViewMode = 'month' | 'week' | 'day'

interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  duration: string
  technician: string
  location: string
  type: 'work_order' | 'meeting' | 'training'
  status: 'scheduled' | 'in_progress' | 'completed'
}

const mockEvents: CalendarEvent[] = [
  { id: 'E1', title: 'Network Installation', date: '2025-11-24', time: '09:00', duration: '4h', technician: 'Mike Johnson', location: 'San Francisco', type: 'work_order', status: 'scheduled' },
  { id: 'E2', title: 'Security Camera Setup', date: '2025-11-24', time: '08:00', duration: '6h', technician: 'Emily Williams', location: 'Oakland', type: 'work_order', status: 'in_progress' },
  { id: 'E3', title: 'Team Standup', date: '2025-11-24', time: '10:00', duration: '30m', technician: 'All', location: 'Virtual', type: 'meeting', status: 'scheduled' },
  { id: 'E4', title: 'Router Maintenance', date: '2025-11-25', time: '14:00', duration: '2h', technician: 'David Brown', location: 'San Jose', type: 'work_order', status: 'scheduled' },
  { id: 'E5', title: 'Safety Training', date: '2025-11-26', time: '09:00', duration: '3h', technician: 'All Technicians', location: 'HQ', type: 'training', status: 'scheduled' },
  { id: 'E6', title: 'WiFi Assessment', date: '2025-11-27', time: '11:00', duration: '2h', technician: 'Sarah Lee', location: 'Berkeley', type: 'work_order', status: 'scheduled' },
]

const typeColors = {
  work_order: 'bg-violet-500/20 border-violet-500/30 text-violet-300',
  meeting: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
  training: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
}

const technicians = [
  { id: 'T1', name: 'Mike Johnson', color: 'bg-emerald-500' },
  { id: 'T2', name: 'Emily Williams', color: 'bg-violet-500' },
  { id: 'T3', name: 'David Brown', color: 'bg-blue-500' },
  { id: 'T4', name: 'Sarah Lee', color: 'bg-amber-500' },
]

export default function CalendarPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 24)) // November 2025
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    return { firstDay, daysInMonth }
  }

  const getWeekDays = (date: Date) => {
    const start = new Date(date)
    start.setDate(start.getDate() - start.getDay())
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      return day
    })
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate)
  const weekDays = getWeekDays(currentDate)
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1))
  }

  const getEventsForDate = (dateStr: string) => {
    return mockEvents.filter(e => e.date === dateStr)
  }

  const hours = Array.from({ length: 12 }, (_, i) => i + 7) // 7 AM to 6 PM

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Calendar</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Schedule and manage appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center p-1 border rounded-xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${viewMode === mode ? 'bg-emerald-500 text-white' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {mode}
              </button>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>New Event</span>
          </motion.button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth(-1)}
            className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className={`p-2 rounded-xl border transition-all ${isDark ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => setCurrentDate(new Date())}
          className={`px-4 py-2 rounded-xl border text-sm font-medium ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
        >
          Today
        </button>
      </div>

      <div className="flex gap-6">
        {/* Calendar Grid */}
        <div className="flex-1">
          {viewMode === 'month' && (
            <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
              {/* Day Headers */}
              <div className={`grid grid-cols-7 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className={`p-3 text-center text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {day}
                  </div>
                ))}
              </div>
              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {Array.from({ length: 42 }, (_, i) => {
                  const dayNum = i - firstDay + 1
                  const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth
                  const dateStr = isCurrentMonth
                    ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                    : ''
                  const events = isCurrentMonth ? getEventsForDate(dateStr) : []
                  const isToday = dateStr === '2025-11-24'

                  return (
                    <div
                      key={i}
                      className={`min-h-[100px] p-2 border-b border-r ${isDark ? 'border-white/5' : 'border-slate-200'} ${!isCurrentMonth ? (isDark ? 'bg-white/[0.02]' : 'bg-slate-50') : ''}`}
                    >
                      {isCurrentMonth && (
                        <>
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${isToday ? 'bg-emerald-500 text-white font-bold' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {dayNum}
                          </span>
                          <div className="mt-1 space-y-1">
                            {events.slice(0, 2).map((event) => (
                              <button
                                key={event.id}
                                onClick={() => setSelectedEvent(event)}
                                className={`w-full px-2 py-1 rounded text-xs text-left truncate border ${typeColors[event.type]}`}
                              >
                                {event.title}
                              </button>
                            ))}
                            {events.length > 2 && (
                              <span className={`text-xs px-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>+{events.length - 2} more</span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {viewMode === 'week' && (
            <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
              {/* Day Headers */}
              <div className={`grid grid-cols-8 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <div className={`p-3 text-center text-sm font-medium border-r ${isDark ? 'text-slate-500 border-white/10' : 'text-slate-400 border-slate-200'}`} />
                {weekDays.map((day) => {
                  const isToday = formatDate(day) === '2025-11-24'
                  return (
                    <div key={day.toISOString()} className={`p-3 text-center border-r ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()]}</p>
                      <p className={`text-lg font-semibold ${isToday ? 'text-emerald-400' : isDark ? 'text-white' : 'text-slate-900'}`}>{day.getDate()}</p>
                    </div>
                  )
                })}
              </div>
              {/* Time Slots */}
              <div className="relative">
                {hours.map((hour) => (
                  <div key={hour} className={`grid grid-cols-8 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                    <div className={`p-2 text-xs text-right pr-3 border-r ${isDark ? 'text-slate-500 border-white/10' : 'text-slate-400 border-slate-200'}`}>
                      {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                    </div>
                    {weekDays.map((day) => {
                      const dateStr = formatDate(day)
                      const events = getEventsForDate(dateStr).filter(e => parseInt(e.time.split(':')[0]) === hour)
                      return (
                        <div key={`${day.toISOString()}-${hour}`} className={`p-1 min-h-[60px] border-r relative ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                          {events.map((event) => (
                            <motion.button
                              key={event.id}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              onClick={() => setSelectedEvent(event)}
                              className={`absolute inset-x-1 px-2 py-1 rounded-lg text-xs text-left border ${typeColors[event.type]}`}
                            >
                              <p className="font-medium truncate">{event.title}</p>
                              <p className="text-[10px] opacity-70">{event.time} • {event.duration}</p>
                            </motion.button>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {viewMode === 'day' && (
            <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
              {/* Day Header */}
              <div className={`p-4 border-b text-center ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Monday</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>November 24, 2025</p>
              </div>
              {/* Time Slots */}
              <div>
                {hours.map((hour) => {
                  const events = getEventsForDate('2025-11-24').filter(e => parseInt(e.time.split(':')[0]) === hour)
                  return (
                    <div key={hour} className={`flex border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                      <div className={`w-20 p-3 text-sm text-right border-r ${isDark ? 'text-slate-500 border-white/10' : 'text-slate-400 border-slate-200'}`}>
                        {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? 'PM' : 'AM'}
                      </div>
                      <div className="flex-1 p-2 min-h-[80px]">
                        {events.map((event) => (
                          <motion.button
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            onClick={() => setSelectedEvent(event)}
                            className={`w-full p-3 rounded-xl text-left border ${typeColors[event.type]} mb-2`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium">{event.title}</p>
                              <span className="text-xs opacity-70">{event.duration}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs opacity-70">
                              <span className="flex items-center gap-1"><User className="w-3 h-3" />{event.technician}</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="w-80 space-y-4">
          {/* Technician Availability */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Technician Availability</h3>
            <div className="space-y-3">
              {technicians.map((tech) => (
                <div key={tech.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${tech.color} flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{tech.name.charAt(0)}</span>
                    </div>
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{tech.name}</span>
                  </div>
                  <span className="text-xs text-emerald-400">Available</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Event Details */}
          <AnimatePresence>
            {selectedEvent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className={`p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${typeColors[selectedEvent.type]}`}>
                      {selectedEvent.type.replace('_', ' ')}
                    </span>
                    <h3 className={`font-semibold mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedEvent.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-sm">
                  <div className={`flex items-center gap-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Clock className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <span>{selectedEvent.time} • {selectedEvent.duration}</span>
                  </div>
                  <div className={`flex items-center gap-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <User className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <span>{selectedEvent.technician}</span>
                  </div>
                  <div className={`flex items-center gap-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <MapPin className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <span>{selectedEvent.location}</span>
                  </div>
                </div>

                <div className={`flex gap-2 mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <button className="flex-1 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium">
                    Edit
                  </button>
                  <button className={`flex-1 px-4 py-2 rounded-xl border text-sm font-medium ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Event Types</h3>
            <div className="space-y-2">
              {Object.entries(typeColors).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${color.split(' ')[0]}`} />
                  <span className={`text-sm capitalize ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{type.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
