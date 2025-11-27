'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  GraduationCap,
  BookOpen,
  Award,
  FileCheck,
  PlayCircle,
  Clock,
  Users,
  TrendingUp,
  ArrowRight,
  Star,
  CheckCircle2,
  Target,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

const trainingStats = [
  { label: 'Active Courses', value: 12, icon: BookOpen, color: 'from-violet-500 to-purple-600', trend: '+3' },
  { label: 'Certifications', value: 24, icon: Award, color: 'from-amber-500 to-orange-600', trend: '+5' },
  { label: 'Completion Rate', value: '87%', icon: TrendingUp, color: 'from-emerald-500 to-teal-600', trend: '+4%' },
  { label: 'Active Learners', value: 8, icon: Users, color: 'from-blue-500 to-cyan-600', trend: null },
]

const modules = [
  {
    title: 'Courses',
    description: 'Browse and manage training courses for your team',
    href: '/dashboard/training/courses',
    icon: BookOpen,
    count: 12,
    color: 'from-violet-500 to-purple-600',
  },
  {
    title: 'Certifications',
    description: 'Track certifications and compliance requirements',
    href: '/dashboard/training/certifications',
    icon: Award,
    count: 24,
    color: 'from-amber-500 to-orange-600',
  },
  {
    title: 'Documents',
    description: 'Access training materials and documentation',
    href: '/dashboard/training/documents',
    icon: FileCheck,
    count: 45,
    color: 'from-emerald-500 to-teal-600',
  },
]

const featuredCourses = [
  { title: 'Network Installation Basics', duration: '4h 30m', enrolled: 8, completion: 75, level: 'Beginner' },
  { title: 'Advanced Fiber Optics', duration: '6h 15m', enrolled: 5, completion: 45, level: 'Advanced' },
  { title: 'Safety Certification', duration: '2h 00m', enrolled: 12, completion: 100, level: 'Required' },
]

const upcomingCertifications = [
  { name: 'BICSI Installer', technician: 'Mike Johnson', dueDate: '2025-12-15', status: 'in_progress' },
  { name: 'CompTIA Network+', technician: 'Emily Williams', dueDate: '2025-12-30', status: 'pending' },
  { name: 'Safety Renewal', technician: 'David Brown', dueDate: '2025-11-30', status: 'urgent' },
]

const statusColors = {
  in_progress: 'bg-blue-500/20 text-blue-400',
  pending: 'bg-amber-500/20 text-amber-400',
  urgent: 'bg-red-500/20 text-red-400',
}

export default function TrainingPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Training Center</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage courses, certifications, and training materials</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium shadow-lg shadow-violet-500/25"
        >
          <BookOpen className="w-5 h-5" />
          <span>Create Course</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {trainingStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-2xl border backdrop-blur-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                  {stat.trend && (
                    <span className="text-xs font-medium text-emerald-400">{stat.trend}</span>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modules */}
      <div className="grid grid-cols-3 gap-6">
        {modules.map((module, index) => (
          <Link key={module.title} href={module.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`p-6 rounded-2xl border backdrop-blur-sm cursor-pointer group h-full ${isDark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${module.color}`}>
                  <module.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{module.count}</span>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{module.title}</h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{module.description}</p>
              <div className="flex items-center text-emerald-400 text-sm font-medium group-hover:gap-2 transition-all">
                <span>View {module.title}</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Featured Courses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`p-6 rounded-2xl border backdrop-blur-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <PlayCircle className="w-5 h-5 text-violet-400" />
              Featured Courses
            </h3>
            <Link href="/dashboard/training/courses" className="text-sm text-emerald-400 hover:text-emerald-300">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {featuredCourses.map((course, index) => (
              <motion.div
                key={course.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.6 }}
                className={`p-4 rounded-xl transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{course.title}</h4>
                    <div className={`flex items-center gap-3 mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {course.enrolled} enrolled
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    course.level === 'Required' ? 'bg-red-500/20 text-red-400' :
                    course.level === 'Advanced' ? 'bg-violet-500/20 text-violet-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {course.level}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course.completion}%` }}
                      transition={{ delay: index * 0.1 + 0.8, duration: 0.5 }}
                      className={`h-full rounded-full ${course.completion === 100 ? 'bg-emerald-500' : 'bg-violet-500'}`}
                    />
                  </div>
                  <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{course.completion}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`p-6 rounded-2xl border backdrop-blur-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Award className="w-5 h-5 text-amber-400" />
              Certification Deadlines
            </h3>
            <Link href="/dashboard/training/certifications" className="text-sm text-emerald-400 hover:text-emerald-300">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingCertifications.map((cert, index) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.7 }}
                className={`flex items-center justify-between p-4 rounded-xl transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${cert.status === 'urgent' ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
                    <Award className={`w-5 h-5 ${cert.status === 'urgent' ? 'text-red-400' : 'text-amber-400'}`} />
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{cert.name}</p>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{cert.technician}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Due</p>
                  <p className={`text-sm font-medium ${cert.status === 'urgent' ? 'text-red-400' : isDark ? 'text-white' : 'text-slate-900'}`}>
                    {cert.dueDate}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
