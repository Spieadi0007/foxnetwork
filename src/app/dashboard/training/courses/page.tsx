'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  PlayCircle,
  Clock,
  Users,
  Star,
  ChevronDown,
  CheckCircle2,
  Lock,
  BarChart3,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface Course {
  id: string
  title: string
  description: string
  category: 'technical' | 'safety' | 'compliance' | 'soft_skills'
  duration: string
  modules: number
  enrolled: number
  completion: number
  rating: number
  level: 'beginner' | 'intermediate' | 'advanced'
  isRequired: boolean
  thumbnail: string
}

const mockCourses: Course[] = [
  { id: 'C1', title: 'Network Installation Fundamentals', description: 'Learn the basics of network infrastructure installation', category: 'technical', duration: '4h 30m', modules: 8, enrolled: 8, completion: 75, rating: 4.8, level: 'beginner', isRequired: false, thumbnail: '/placeholder.jpg' },
  { id: 'C2', title: 'Advanced Fiber Optics', description: 'Master fiber optic cable installation and termination', category: 'technical', duration: '6h 15m', modules: 12, enrolled: 5, completion: 45, rating: 4.9, level: 'advanced', isRequired: false, thumbnail: '/placeholder.jpg' },
  { id: 'C3', title: 'Workplace Safety Certification', description: 'Essential safety training for field technicians', category: 'safety', duration: '2h 00m', modules: 5, enrolled: 12, completion: 100, rating: 4.7, level: 'beginner', isRequired: true, thumbnail: '/placeholder.jpg' },
  { id: 'C4', title: 'OSHA Compliance Training', description: 'Required OSHA compliance and regulations', category: 'compliance', duration: '3h 30m', modules: 6, enrolled: 10, completion: 90, rating: 4.5, level: 'intermediate', isRequired: true, thumbnail: '/placeholder.jpg' },
  { id: 'C5', title: 'Customer Communication', description: 'Best practices for client interactions', category: 'soft_skills', duration: '1h 45m', modules: 4, enrolled: 6, completion: 60, rating: 4.6, level: 'beginner', isRequired: false, thumbnail: '/placeholder.jpg' },
  { id: 'C6', title: 'Security Systems Installation', description: 'Complete guide to security camera and access control systems', category: 'technical', duration: '5h 00m', modules: 10, enrolled: 7, completion: 55, rating: 4.8, level: 'intermediate', isRequired: false, thumbnail: '/placeholder.jpg' },
]

const categoryConfig = {
  technical: { label: 'Technical', color: 'bg-violet-500/20 text-violet-400' },
  safety: { label: 'Safety', color: 'bg-red-500/20 text-red-400' },
  compliance: { label: 'Compliance', color: 'bg-amber-500/20 text-amber-400' },
  soft_skills: { label: 'Soft Skills', color: 'bg-blue-500/20 text-blue-400' },
}

const levelConfig = {
  beginner: { label: 'Beginner', color: 'bg-emerald-500/20 text-emerald-400' },
  intermediate: { label: 'Intermediate', color: 'bg-amber-500/20 text-amber-400' },
  advanced: { label: 'Advanced', color: 'bg-violet-500/20 text-violet-400' },
}

export default function CoursesPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Courses</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Browse and manage training courses</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium shadow-lg shadow-violet-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>Create Course</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Courses', value: mockCourses.length, icon: BookOpen },
          { label: 'Total Enrolled', value: mockCourses.reduce((sum, c) => sum + c.enrolled, 0), icon: Users },
          { label: 'Avg Completion', value: `${Math.round(mockCourses.reduce((sum, c) => sum + c.completion, 0) / mockCourses.length)}%`, icon: BarChart3 },
          { label: 'Required', value: mockCourses.filter(c => c.isRequired).length, icon: Lock },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
              </div>
              <div className="p-3 rounded-xl bg-violet-500/20">
                <stat.icon className="w-5 h-5 text-violet-400" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            <Filter className="w-4 h-4" />
            <span>Category</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`absolute top-full mt-2 left-0 w-48 p-2 border rounded-xl shadow-xl z-10 ${isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'}`}
            >
              <button
                onClick={() => { setCategoryFilter('all'); setShowFilters(false) }}
                className={`w-full px-3 py-2 text-left text-sm rounded-lg ${categoryFilter === 'all' ? 'bg-emerald-500/20 text-emerald-400' : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                All Categories
              </button>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => { setCategoryFilter(key); setShowFilters(false) }}
                  className={`w-full px-3 py-2 text-left text-sm rounded-lg ${categoryFilter === key ? 'bg-emerald-500/20 text-emerald-400' : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  {config.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className={`rounded-2xl border overflow-hidden cursor-pointer group ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
          >
            {/* Thumbnail */}
            <div className="h-40 bg-gradient-to-br from-violet-500/20 to-purple-500/20 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-10 h-10 text-white" />
                </div>
              </div>
              {course.isRequired && (
                <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Required
                </div>
              )}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${levelConfig[course.level].color}`}>
                  {levelConfig[course.level].label}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryConfig[course.category].color}`}>
                  {categoryConfig[course.category].label}
                </span>
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="text-xs font-medium">{course.rating}</span>
                </div>
              </div>

              <h3 className={`font-semibold mb-2 line-clamp-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{course.title}</h3>
              <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{course.description}</p>

              <div className={`flex items-center justify-between text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.duration}
                </span>
                <span>{course.modules} modules</span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {course.enrolled}
                </span>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Team Progress</span>
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{course.completion}%</span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${course.completion}%` }}
                    transition={{ delay: index * 0.05 + 0.3, duration: 0.5 }}
                    className={`h-full rounded-full ${course.completion === 100 ? 'bg-emerald-500' : 'bg-violet-500'}`}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
