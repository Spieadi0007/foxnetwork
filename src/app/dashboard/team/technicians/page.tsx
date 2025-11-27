'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/theme-context'
import {
  Search,
  Filter,
  UserPlus,
  MapPin,
  Phone,
  Mail,
  Star,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  Edit3,
  Trash2,
  Eye,
  Award,
  Briefcase,
  Calendar,
  ChevronDown,
  XCircle,
  Shield,
  Wrench,
} from 'lucide-react'

interface Technician {
  id: string
  name: string
  email: string
  phone: string
  role: string
  status: 'active' | 'on_break' | 'off_duty' | 'on_leave'
  location: string
  rating: number
  completedJobs: number
  skills: string[]
  certifications: string[]
  hireDate: string
  avatar: string
}

const mockTechnicians: Technician[] = [
  {
    id: 'T1',
    name: 'Mike Johnson',
    email: 'mike.j@fox.io',
    phone: '+1 555-0123',
    role: 'Senior Technician',
    status: 'active',
    location: 'San Francisco, CA',
    rating: 4.9,
    completedJobs: 156,
    skills: ['Network Installation', 'Fiber Optics', 'Cable Management'],
    certifications: ['BICSI', 'CompTIA Network+'],
    hireDate: '2022-03-15',
    avatar: 'M',
  },
  {
    id: 'T2',
    name: 'Emily Williams',
    email: 'emily.w@fox.io',
    phone: '+1 555-0456',
    role: 'Lead Installer',
    status: 'active',
    location: 'Oakland, CA',
    rating: 4.8,
    completedJobs: 142,
    skills: ['Security Systems', 'Camera Installation', 'Access Control'],
    certifications: ['ASIS CPP', 'PSP'],
    hireDate: '2022-06-01',
    avatar: 'E',
  },
  {
    id: 'T3',
    name: 'David Brown',
    email: 'david.b@fox.io',
    phone: '+1 555-0789',
    role: 'Technician',
    status: 'on_break',
    location: 'San Jose, CA',
    rating: 4.7,
    completedJobs: 128,
    skills: ['WiFi Setup', 'Router Configuration', 'Troubleshooting'],
    certifications: ['Cisco CCNA'],
    hireDate: '2023-01-10',
    avatar: 'D',
  },
  {
    id: 'T4',
    name: 'Sarah Lee',
    email: 'sarah.l@fox.io',
    phone: '+1 555-0321',
    role: 'Technician',
    status: 'active',
    location: 'Berkeley, CA',
    rating: 4.6,
    completedJobs: 98,
    skills: ['Structured Cabling', 'Testing', 'Documentation'],
    certifications: ['BICSI Technician'],
    hireDate: '2023-04-20',
    avatar: 'S',
  },
  {
    id: 'T5',
    name: 'James Wilson',
    email: 'james.w@fox.io',
    phone: '+1 555-0654',
    role: 'Junior Technician',
    status: 'off_duty',
    location: 'Palo Alto, CA',
    rating: 4.4,
    completedJobs: 45,
    skills: ['Basic Installation', 'Cable Pulling'],
    certifications: [],
    hireDate: '2024-02-01',
    avatar: 'J',
  },
]

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  on_break: { label: 'On Break', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  off_duty: { label: 'Off Duty', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  on_leave: { label: 'On Leave', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
}

export default function TechniciansPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filteredTechnicians = mockTechnicians.filter(tech => {
    const matchesSearch = tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.role.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || tech.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Technicians</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage your field service technicians</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25"
        >
          <UserPlus className="w-5 h-5" />
          <span>Add Technician</span>
        </motion.button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search technicians..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-sm'} border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all`}
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'} border rounded-xl text-sm transition-all`}
          >
            <Filter className="w-4 h-4" />
            <span>Status</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`absolute top-full mt-2 left-0 w-48 p-2 ${isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'} border rounded-xl shadow-xl z-10`}
              >
                <button
                  onClick={() => { setStatusFilter('all'); setShowFilters(false) }}
                  className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${statusFilter === 'all' ? 'bg-emerald-500/20 text-emerald-400' : `${isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}`}
                >
                  All Status
                </button>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => { setStatusFilter(key); setShowFilters(false) }}
                    className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${statusFilter === key ? 'bg-emerald-500/20 text-emerald-400' : `${isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-50'}`}`}
                  >
                    {config.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Technicians Grid */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          {filteredTechnicians.map((tech, index) => (
            <motion.div
              key={tech.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedTechnician(tech)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedTechnician?.id === tech.id
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : `${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:bg-slate-50'}`
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{tech.avatar}</span>
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${isDark ? 'border-slate-900' : 'border-white'} ${
                      tech.status === 'active' ? 'bg-emerald-400' :
                      tech.status === 'on_break' ? 'bg-amber-400' :
                      'bg-slate-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{tech.name}</h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{tech.role}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusConfig[tech.status].color}`}>
                  {statusConfig[tech.status].label}
                </span>
              </div>

              <div className={`flex items-center gap-4 text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{tech.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{tech.completedJobs} jobs</span>
                </div>
              </div>

              <div className={`flex items-center gap-1.5 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <MapPin className="w-4 h-4" />
                <span>{tech.location}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {tech.skills.slice(0, 2).map((skill) => (
                  <span key={skill} className={`px-2 py-1 rounded-lg ${isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-600'} text-xs`}>
                    {skill}
                  </span>
                ))}
                {tech.skills.length > 2 && (
                  <span className={`px-2 py-1 rounded-lg ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'} text-xs`}>
                    +{tech.skills.length - 2}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedTechnician && (
            <motion.div
              initial={{ opacity: 0, x: 50, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 380 }}
              exit={{ opacity: 0, x: 50, width: 0 }}
              className="flex-shrink-0"
            >
              <div className={`w-[380px] p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">{selectedTechnician.avatar}</span>
                    </div>
                    <div>
                      <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedTechnician.name}</h3>
                      <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>{selectedTechnician.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTechnician(null)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-medium border mb-6 ${statusConfig[selectedTechnician.status].color}`}>
                  {statusConfig[selectedTechnician.status].label}
                </span>

                {/* Contact Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                      <Mail className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </div>
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{selectedTechnician.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                      <Phone className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </div>
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{selectedTechnician.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                      <MapPin className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </div>
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{selectedTechnician.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                      <Calendar className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </div>
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Hired {selectedTechnician.hireDate}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'} text-center`}>
                    <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span className="font-bold text-lg">{selectedTechnician.rating}</span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Rating</p>
                  </div>
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'} text-center`}>
                    <p className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedTechnician.completedJobs}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Completed Jobs</p>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-6">
                  <h4 className={`text-sm font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Wrench className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTechnician.skills.map((skill) => (
                      <span key={skill} className="px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div className="mb-6">
                  <h4 className={`text-sm font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Shield className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    Certifications
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTechnician.certifications.length > 0 ? (
                      selectedTechnician.certifications.map((cert) => (
                        <span key={cert} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {cert}
                        </span>
                      ))
                    ) : (
                      <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No certifications</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className={`flex gap-2 pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'} border text-sm`}
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
