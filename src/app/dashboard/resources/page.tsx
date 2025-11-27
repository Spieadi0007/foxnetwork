'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Truck,
  Search,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Wrench,
  Package,
  ChevronRight,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface AssignedResource {
  id: string
  type: 'technician' | 'team' | 'vehicle'
  name: string
  specialization?: string
  contact?: {
    phone: string
    email: string
  }
  status: 'available' | 'assigned' | 'on_break'
  currentProject?: string
  currentLocation?: string
  rating?: number
  completedJobs?: number
  nextAvailable?: string
}

const mockResources: AssignedResource[] = [
  {
    id: 'RES-001',
    type: 'team',
    name: 'Tech Team Alpha',
    specialization: 'Locker Installation & Setup',
    contact: {
      phone: '+1 (555) 111-2222',
      email: 'alpha.team@foxpartners.com',
    },
    status: 'assigned',
    currentProject: 'Downtown Mall Expansion',
    currentLocation: 'Downtown Mall - Main Entrance',
    rating: 4.9,
    completedJobs: 156,
  },
  {
    id: 'RES-002',
    type: 'technician',
    name: 'John Smith',
    specialization: 'Lead Installation Technician',
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'j.smith@foxpartners.com',
    },
    status: 'assigned',
    currentProject: 'Downtown Mall Expansion',
    currentLocation: 'On route to Downtown Mall',
    rating: 4.8,
    completedJobs: 234,
  },
  {
    id: 'RES-003',
    type: 'technician',
    name: 'Sarah Johnson',
    specialization: 'Maintenance Specialist',
    contact: {
      phone: '+1 (555) 234-5678',
      email: 's.johnson@foxpartners.com',
    },
    status: 'available',
    nextAvailable: 'Now',
    rating: 4.9,
    completedJobs: 312,
  },
  {
    id: 'RES-004',
    type: 'vehicle',
    name: 'Service Van #12',
    specialization: 'Equipped for installations',
    status: 'assigned',
    currentLocation: 'Downtown Mall - Parking B2',
    currentProject: 'Downtown Mall Expansion',
  },
  {
    id: 'RES-005',
    type: 'team',
    name: 'Maintenance Crew',
    specialization: 'Preventive Maintenance & Repairs',
    contact: {
      phone: '+1 (555) 333-4444',
      email: 'maintenance@foxpartners.com',
    },
    status: 'available',
    nextAvailable: 'Tomorrow 9 AM',
    rating: 4.7,
    completedJobs: 89,
  },
]

export default function ClientResourcesPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')

  const filteredResources = mockResources.filter((resource) => {
    const matchesSearch =
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || resource.type === filterType
    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'technician':
        return Users
      case 'team':
        return Users
      case 'vehicle':
        return Truck
      default:
        return Package
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'technician':
        return 'from-blue-500 to-indigo-600'
      case 'team':
        return 'from-emerald-500 to-teal-600'
      case 'vehicle':
        return 'from-amber-500 to-orange-600'
      default:
        return 'from-slate-500 to-slate-600'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Available' }
      case 'assigned':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Assigned' }
      case 'on_break':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'On Break' }
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Unknown' }
    }
  }

  const stats = {
    total: mockResources.length,
    technicians: mockResources.filter((r) => r.type === 'technician').length,
    teams: mockResources.filter((r) => r.type === 'team').length,
    vehicles: mockResources.filter((r) => r.type === 'vehicle').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Assigned Resources
        </h1>
        <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          View technicians, teams, and vehicles assigned to your projects
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Resources', value: stats.total, icon: Package, color: 'blue' },
          { label: 'Technicians', value: stats.technicians, icon: Users, color: 'emerald' },
          { label: 'Teams', value: stats.teams, icon: Users, color: 'purple' },
          { label: 'Vehicles', value: stats.vehicles, icon: Truck, color: 'amber' },
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
                  'text-amber-500'
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
              placeholder="Search resources..."
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
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`px-4 py-2.5 rounded-xl border ${
              isDark
                ? 'bg-white/5 border-white/10 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <option value="all">All Types</option>
            <option value="technician">Technicians</option>
            <option value="team">Teams</option>
            <option value="vehicle">Vehicles</option>
          </select>
        </div>
      </div>

      {/* Resources List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredResources.map((resource, index) => {
          const TypeIcon = getTypeIcon(resource.type)
          const typeColor = getTypeColor(resource.type)
          const statusBadge = getStatusBadge(resource.status)

          return (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`rounded-2xl border overflow-hidden ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:border-white/20'
                  : 'bg-white border-slate-200 hover:shadow-lg'
              } transition-all`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeColor} flex items-center justify-center shadow-lg`}>
                      <TypeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {resource.name}
                        </h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                      {resource.specialization && (
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {resource.specialization}
                        </p>
                      )}
                    </div>
                  </div>

                  {resource.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {resource.rating}
                      </span>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                {resource.contact && (
                  <div className={`flex flex-wrap gap-4 mt-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4" />
                      {resource.contact.phone}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      {resource.contact.email}
                    </span>
                  </div>
                )}

                {/* Current Assignment */}
                {(resource.currentProject || resource.currentLocation) && (
                  <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      Current Assignment
                    </p>
                    {resource.currentProject && (
                      <div className="flex items-center gap-2 mb-1">
                        <Wrench className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {resource.currentProject}
                        </span>
                      </div>
                    )}
                    {resource.currentLocation && (
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {resource.currentLocation}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Next Available */}
                {resource.nextAvailable && (
                  <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        Available: {resource.nextAvailable}
                      </span>
                    </div>
                  </div>
                )}

                {/* Stats */}
                {resource.completedJobs && (
                  <div className={`flex items-center gap-4 mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {resource.completedJobs} jobs completed
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className={`flex items-center gap-3 p-4 border-t ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium ${
                    isDark
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  Contact
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-medium"
                >
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <Truck className={`w-12 h-12 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
          <p className={`mt-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            No resources found
          </p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Resources will be assigned to your active projects
          </p>
        </div>
      )}
    </div>
  )
}
