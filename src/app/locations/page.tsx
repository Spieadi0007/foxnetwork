'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Building2,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
  X,
  Globe,
  Phone,
  Mail,
  User,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface Location {
  id: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  type: 'retail' | 'office' | 'warehouse' | 'public' | 'transit'
  status: 'active' | 'pending' | 'inactive'
  equipmentCount: number
  contactName: string
  contactPhone: string
  contactEmail: string
  notes?: string
  createdAt: string
}

const mockLocations: Location[] = [
  {
    id: 'LOC-001',
    name: 'Downtown Mall - Main Entrance',
    address: '123 Commerce Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
    type: 'retail',
    status: 'active',
    equipmentCount: 4,
    contactName: 'James Wilson',
    contactPhone: '+1 (555) 123-4567',
    contactEmail: 'j.wilson@downtownmall.com',
    notes: 'Access through main lobby. Security desk on ground floor.',
    createdAt: '2023-06-15',
  },
  {
    id: 'LOC-002',
    name: 'Airport Terminal B',
    address: '456 Airport Boulevard',
    city: 'New York',
    state: 'NY',
    zipCode: '11430',
    country: 'United States',
    type: 'transit',
    status: 'active',
    equipmentCount: 8,
    contactName: 'Sarah Martinez',
    contactPhone: '+1 (555) 234-5678',
    contactEmail: 's.martinez@jfkairport.com',
    createdAt: '2023-08-20',
  },
  {
    id: 'LOC-003',
    name: 'Central Station',
    address: '789 Railway Avenue',
    city: 'New York',
    state: 'NY',
    zipCode: '10017',
    country: 'United States',
    type: 'transit',
    status: 'active',
    equipmentCount: 6,
    contactName: 'Michael Chen',
    contactPhone: '+1 (555) 345-6789',
    contactEmail: 'm.chen@grandcentral.com',
    notes: 'Main concourse level, near Track 21',
    createdAt: '2023-05-10',
  },
  {
    id: 'LOC-004',
    name: 'Tech Park Building A',
    address: '321 Innovation Drive',
    city: 'Brooklyn',
    state: 'NY',
    zipCode: '11201',
    country: 'United States',
    type: 'office',
    status: 'active',
    equipmentCount: 3,
    contactName: 'Emily Johnson',
    contactPhone: '+1 (555) 456-7890',
    contactEmail: 'e.johnson@techpark.com',
    createdAt: '2023-09-01',
  },
  {
    id: 'LOC-005',
    name: 'Harbor View Office',
    address: '567 Waterfront Road',
    city: 'Jersey City',
    state: 'NJ',
    zipCode: '07302',
    country: 'United States',
    type: 'office',
    status: 'pending',
    equipmentCount: 0,
    contactName: 'David Kim',
    contactPhone: '+1 (555) 567-8901',
    contactEmail: 'd.kim@harborview.com',
    notes: 'New location - deployment scheduled',
    createdAt: '2024-01-10',
  },
  {
    id: 'LOC-006',
    name: 'University Campus',
    address: '890 Academic Way',
    city: 'New York',
    state: 'NY',
    zipCode: '10003',
    country: 'United States',
    type: 'public',
    status: 'active',
    equipmentCount: 12,
    contactName: 'Prof. Robert Taylor',
    contactPhone: '+1 (555) 678-9012',
    contactEmail: 'r.taylor@university.edu',
    createdAt: '2023-04-01',
  },
]

export default function ClientLocationsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  const filteredLocations = mockLocations.filter((location) => {
    const matchesSearch =
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || location.status === filterStatus
    const matchesType = filterType === 'all' || location.type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle }
      case 'pending':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Clock }
      case 'inactive':
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: AlertTriangle }
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: AlertTriangle }
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'retail':
        return 'from-pink-500 to-rose-600'
      case 'office':
        return 'from-blue-500 to-indigo-600'
      case 'warehouse':
        return 'from-amber-500 to-orange-600'
      case 'public':
        return 'from-emerald-500 to-teal-600'
      case 'transit':
        return 'from-purple-500 to-violet-600'
      default:
        return 'from-slate-500 to-slate-600'
    }
  }

  const stats = {
    total: mockLocations.length,
    active: mockLocations.filter((l) => l.status === 'active').length,
    pending: mockLocations.filter((l) => l.status === 'pending').length,
    totalEquipment: mockLocations.reduce((sum, l) => sum + l.equipmentCount, 0),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Locations
          </h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage your deployment locations
          </p>
        </div>

        <motion.button
          onClick={() => setShowAddModal(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-5 h-5" />
          Add Location
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Locations', value: stats.total, icon: MapPin, color: 'blue' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'emerald' },
          { label: 'Pending Setup', value: stats.pending, icon: Clock, color: 'amber' },
          { label: 'Total Equipment', value: stats.totalEquipment, icon: Package, color: 'purple' },
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
                  stat.color === 'amber' ? 'text-amber-500' :
                  'text-purple-500'
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
              placeholder="Search locations..."
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2.5 rounded-xl border ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>

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
              <option value="retail">Retail</option>
              <option value="office">Office</option>
              <option value="warehouse">Warehouse</option>
              <option value="public">Public</option>
              <option value="transit">Transit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLocations.map((location, index) => {
          const statusBadge = getStatusBadge(location.status)
          const StatusIcon = statusBadge.icon

          return (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-2xl border overflow-hidden transition-all ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:border-white/20'
                  : 'bg-white border-slate-200 hover:shadow-lg'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getTypeColor(location.type)} flex items-center justify-center shadow-lg`}>
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {location.id}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded capitalize ${
                          isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {location.type}
                        </span>
                      </div>
                      <h3 className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {location.name}
                      </h3>
                    </div>
                  </div>

                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {location.status}
                  </span>
                </div>

                <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div className="flex items-start gap-2">
                    <MapPin className={`w-4 h-4 mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <div>
                      <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {location.address}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                        {location.city}, {location.state} {location.zipCode}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`flex items-center gap-4 mt-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span className="flex items-center gap-1.5">
                    <Package className="w-4 h-4" />
                    {location.equipmentCount} units
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {location.contactName}
                  </span>
                </div>

                <div className={`flex items-center gap-2 mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                  <motion.button
                    onClick={() => setSelectedLocation(location)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium ${
                      isDark
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/25`}
                  >
                    <Plus className="w-4 h-4" />
                    New Request
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredLocations.length === 0 && (
        <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <MapPin className={`w-12 h-12 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
          <p className={`mt-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            No locations found
          </p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Try adjusting your filters or add a new location
          </p>
        </div>
      )}

      {/* Add Location Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border shadow-2xl ${
                isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Add New Location
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
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
                    Location Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Downtown Mall - Main Entrance"
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Location Type *
                  </label>
                  <select className={`w-full px-4 py-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}>
                    <option value="">Select type...</option>
                    <option value="retail">Retail</option>
                    <option value="office">Office</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="public">Public</option>
                    <option value="transit">Transit</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Street Address *
                  </label>
                  <input
                    type="text"
                    placeholder="123 Main Street"
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      City *
                    </label>
                    <input
                      type="text"
                      placeholder="New York"
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      State *
                    </label>
                    <input
                      type="text"
                      placeholder="NY"
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      placeholder="10001"
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Country
                    </label>
                    <input
                      type="text"
                      placeholder="United States"
                      defaultValue="United States"
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Site Contact
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Contact Name"
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Access instructions, special requirements, etc."
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
                  onClick={() => setShowAddModal(false)}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
                    isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25"
                >
                  Add Location
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Detail Modal */}
      <AnimatePresence>
        {selectedLocation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedLocation(null)}
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
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getTypeColor(selectedLocation.type)} flex items-center justify-center`}>
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {selectedLocation.id}
                    </span>
                    <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedLocation.name}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div className="flex items-start gap-3">
                    <MapPin className={`w-5 h-5 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {selectedLocation.address}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {selectedLocation.city}, {selectedLocation.state} {selectedLocation.zipCode}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {selectedLocation.country}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Status</p>
                    {(() => {
                      const badge = getStatusBadge(selectedLocation.status)
                      const Icon = badge.icon
                      return (
                        <span className={`inline-flex items-center gap-1.5 mt-1 px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                          <Icon className="w-3 h-3" />
                          {selectedLocation.status}
                        </span>
                      )
                    })()}
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Equipment</p>
                    <p className={`text-lg font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedLocation.equipmentCount} <span className="text-sm font-normal">units</span>
                    </p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <p className={`text-xs mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Site Contact</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {selectedLocation.contactName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {selectedLocation.contactPhone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {selectedLocation.contactEmail}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedLocation.notes && (
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Notes</p>
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {selectedLocation.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className={`flex items-center gap-3 p-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium ${
                    isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium"
                >
                  <Plus className="w-4 h-4" />
                  New Request
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
