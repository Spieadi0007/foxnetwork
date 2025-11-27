'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Search,
  Filter,
  List,
  Grid,
  Navigation,
  Building2,
  Box,
  CheckCircle,
  AlertTriangle,
  Clock,
  Wrench,
  ChevronRight,
  Layers,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface Location {
  id: string
  name: string
  address: string
  city: string
  status: 'active' | 'maintenance' | 'pending' | 'inactive'
  equipmentCount: number
  coordinates: { lat: number; lng: number }
  lastActivity: string
}

const mockLocations: Location[] = [
  {
    id: '1',
    name: 'Downtown Mall - Main Entrance',
    address: '123 Commerce St',
    city: 'New York',
    status: 'active',
    equipmentCount: 4,
    coordinates: { lat: 40.7128, lng: -74.006 },
    lastActivity: '2 hours ago',
  },
  {
    id: '2',
    name: 'Airport Terminal B',
    address: '456 Airport Blvd',
    city: 'New York',
    status: 'active',
    equipmentCount: 8,
    coordinates: { lat: 40.6413, lng: -73.7781 },
    lastActivity: '30 mins ago',
  },
  {
    id: '3',
    name: 'Central Station',
    address: '789 Railway Ave',
    city: 'New York',
    status: 'maintenance',
    equipmentCount: 6,
    coordinates: { lat: 40.7527, lng: -73.9772 },
    lastActivity: '1 day ago',
  },
  {
    id: '4',
    name: 'Tech Park Building A',
    address: '321 Innovation Dr',
    city: 'Brooklyn',
    status: 'active',
    equipmentCount: 3,
    coordinates: { lat: 40.6892, lng: -73.9442 },
    lastActivity: '5 hours ago',
  },
  {
    id: '5',
    name: 'Harbor View Office',
    address: '567 Waterfront Rd',
    city: 'Jersey City',
    status: 'pending',
    equipmentCount: 0,
    coordinates: { lat: 40.7178, lng: -74.0431 },
    lastActivity: 'Pending deployment',
  },
  {
    id: '6',
    name: 'University Campus',
    address: '890 Academic Way',
    city: 'New York',
    status: 'active',
    equipmentCount: 12,
    coordinates: { lat: 40.7295, lng: -73.9965 },
    lastActivity: '1 hour ago',
  },
]

export default function ClientMapPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map')

  const filteredLocations = mockLocations.filter((location) => {
    const matchesSearch =
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || location.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500'
      case 'maintenance':
        return 'bg-amber-500'
      case 'pending':
        return 'bg-blue-500'
      case 'inactive':
        return 'bg-slate-500'
      default:
        return 'bg-slate-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle }
      case 'maintenance':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Wrench }
      case 'pending':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Clock }
      case 'inactive':
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: AlertTriangle }
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: AlertTriangle }
    }
  }

  const stats = {
    total: mockLocations.length,
    active: mockLocations.filter((l) => l.status === 'active').length,
    maintenance: mockLocations.filter((l) => l.status === 'maintenance').length,
    pending: mockLocations.filter((l) => l.status === 'pending').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Map View
          </h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            View all your locations and equipment on an interactive map
          </p>
        </div>

        {/* View Toggle */}
        <div className={`flex items-center gap-1 p-1 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'map'
                ? isDark
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-blue-600 shadow'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Map
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'list'
                ? isDark
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-blue-600 shadow'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" />
            List
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Locations', value: stats.total, color: 'blue' },
          { label: 'Active', value: stats.active, color: 'emerald' },
          { label: 'Maintenance', value: stats.maintenance, color: 'amber' },
          { label: 'Pending', value: stats.pending, color: 'purple' },
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
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all ${
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            }`}
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-3 rounded-xl border transition-all ${
              isDark
                ? 'bg-white/5 border-white/10 text-white focus:border-blue-500/50'
                : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
            }`}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-3 rounded-xl border transition-all ${
              isDark
                ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map / List View */}
        <div className={`lg:col-span-2 rounded-2xl border overflow-hidden ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
        }`}>
          {viewMode === 'map' ? (
            <div className="relative h-[600px]">
              {/* Map Placeholder */}
              <div className={`absolute inset-0 flex items-center justify-center ${
                isDark ? 'bg-slate-900' : 'bg-slate-100'
              }`}>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4">
                    <MapPin className="w-10 h-10 text-white" />
                  </div>
                  <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Interactive Map
                  </p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Map integration will be available here
                  </p>
                </div>
              </div>

              {/* Location Markers Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {filteredLocations.map((location, index) => (
                  <motion.div
                    key={location.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    style={{
                      position: 'absolute',
                      left: `${20 + (index * 12) % 60}%`,
                      top: `${20 + (index * 15) % 50}%`,
                    }}
                    className="pointer-events-auto"
                  >
                    <motion.button
                      whileHover={{ scale: 1.2 }}
                      onClick={() => setSelectedLocation(location)}
                      className={`relative group`}
                    >
                      <div className={`w-8 h-8 rounded-full ${getStatusColor(location.status)} flex items-center justify-center shadow-lg`}>
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 ${getStatusColor(location.status)} rotate-45`} />

                      {/* Tooltip */}
                      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${
                        isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900 shadow-lg'
                      }`}>
                        {location.name}
                      </div>
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              {/* Map Controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {[
                  { icon: ZoomIn, label: 'Zoom In' },
                  { icon: ZoomOut, label: 'Zoom Out' },
                  { icon: Maximize2, label: 'Fullscreen' },
                  { icon: Navigation, label: 'My Location' },
                ].map((control, index) => (
                  <motion.button
                    key={control.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2.5 rounded-xl shadow-lg transition-all ${
                      isDark
                        ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                        : 'bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <control.icon className="w-5 h-5" />
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredLocations.map((location) => {
                const statusBadge = getStatusBadge(location.status)
                const StatusIcon = statusBadge.icon

                return (
                  <motion.div
                    key={location.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => setSelectedLocation(location)}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedLocation?.id === location.id
                        ? isDark
                          ? 'bg-blue-500/10'
                          : 'bg-blue-50'
                        : isDark
                        ? 'hover:bg-white/5'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${
                        isDark ? 'bg-white/10' : 'bg-slate-100'
                      }`}>
                        <Building2 className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {location.name}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {location.address}, {location.city}
                            </p>
                          </div>
                          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {location.status}
                          </span>
                        </div>
                        <div className={`flex items-center gap-4 mt-2 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          <span className="flex items-center gap-1">
                            <Box className="w-4 h-4" />
                            {location.equipmentCount} units
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {location.lastActivity}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Location Details Panel */}
        <div className={`rounded-2xl border ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
        }`}>
          <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Location Details
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {selectedLocation ? (
              <motion.div
                key={selectedLocation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 space-y-4"
              >
                {/* Location Header */}
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedLocation.name}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {selectedLocation.address}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status</span>
                    {(() => {
                      const badge = getStatusBadge(selectedLocation.status)
                      const Icon = badge.icon
                      return (
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${badge.bg} ${badge.text}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {selectedLocation.status}
                        </span>
                      )
                    })()}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Equipment</p>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedLocation.equipmentCount} <span className="text-sm font-normal">units</span>
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>City</p>
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedLocation.city}
                    </p>
                  </div>
                </div>

                {/* Last Activity */}
                <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Last Activity</p>
                  <p className={`text-sm font-medium mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedLocation.lastActivity}
                  </p>
                </div>

                {/* Coordinates */}
                <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Coordinates</p>
                  <p className={`text-sm font-mono mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {selectedLocation.coordinates.lat.toFixed(4)}, {selectedLocation.coordinates.lng.toFixed(4)}
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium text-sm shadow-lg shadow-blue-500/25"
                  >
                    View Details
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-2.5 rounded-xl font-medium text-sm transition-colors ${
                      isDark
                        ? 'bg-white/10 text-white hover:bg-white/15'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Create Request
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-8 text-center"
              >
                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center ${
                  isDark ? 'bg-white/5' : 'bg-slate-100'
                }`}>
                  <MapPin className={`w-8 h-8 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                </div>
                <p className={`mt-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Select a location to view details
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
