'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin,
  Layers,
  Filter,
  Search,
  ChevronDown,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Building2,
  Navigation,
  Zap,
  Route,
  Users,
  Truck,
  RefreshCcw,
  Maximize2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface MapLocation {
  id: string
  type: 'work_order' | 'technician' | 'warehouse'
  name: string
  status?: string
  coordinates: { lat: number; lng: number }
  address: string
  details: string
}

const mockLocations: MapLocation[] = [
  { id: 'WO-001', type: 'work_order', name: 'Network Installation', status: 'in_progress', coordinates: { lat: 37.7749, lng: -122.4194 }, address: '123 Business Ave, San Francisco', details: 'TechCorp Inc.' },
  { id: 'WO-002', type: 'work_order', name: 'Router Maintenance', status: 'pending', coordinates: { lat: 37.3382, lng: -121.8863 }, address: '456 Tech Park, San Jose', details: 'DataFlow LLC' },
  { id: 'WO-003', type: 'work_order', name: 'Security Camera Setup', status: 'assigned', coordinates: { lat: 37.8044, lng: -122.2712 }, address: '789 Financial District, Oakland', details: 'SecureBank' },
  { id: 'TECH-001', type: 'technician', name: 'Mike Johnson', coordinates: { lat: 37.7849, lng: -122.4094 }, address: 'En route to WO-001', details: 'Senior Technician' },
  { id: 'TECH-002', type: 'technician', name: 'Emily Williams', coordinates: { lat: 37.7944, lng: -122.2612 }, address: 'En route to WO-003', details: 'Lead Installer' },
  { id: 'WH-001', type: 'warehouse', name: 'Central Warehouse', coordinates: { lat: 37.6879, lng: -122.4702 }, address: 'South San Francisco', details: 'Main distribution center' },
]

const typeConfig = {
  work_order: { color: 'bg-violet-500', icon: MapPin, label: 'Work Orders' },
  technician: { color: 'bg-emerald-500', icon: Truck, label: 'Technicians' },
  warehouse: { color: 'bg-amber-500', icon: Building2, label: 'Warehouses' },
}

export default function MapViewPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [visibleLayers, setVisibleLayers] = useState<string[]>(['work_order', 'technician', 'warehouse'])
  const [showLayerPanel, setShowLayerPanel] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const toggleLayer = (layer: string) => {
    setVisibleLayers(prev =>
      prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]
    )
  }

  const filteredLocations = mockLocations.filter(loc =>
    visibleLayers.includes(loc.type) &&
    (loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     loc.address.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const stats = {
    workOrders: mockLocations.filter(l => l.type === 'work_order').length,
    technicians: mockLocations.filter(l => l.type === 'technician').length,
    warehouses: mockLocations.filter(l => l.type === 'warehouse').length,
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Live Map View</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Track work orders and technicians in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-slate-200 hover:bg-slate-50 shadow-sm'} ${isDark ? 'text-slate-300' : 'text-slate-700'} transition-all`}
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Refresh</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium"
          >
            <Route className="w-4 h-4" />
            <span>Optimize Routes</span>
          </motion.button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 flex gap-4">
        {/* Main Map */}
        <div className={`flex-1 relative rounded-2xl ${isDark ? 'bg-slate-800/50 border border-white/10' : 'bg-white border border-slate-200 shadow-sm'} overflow-hidden`}>
          {/* Map Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${isDark ? 'from-slate-800 to-slate-900' : 'from-slate-50 to-slate-100'}`}>
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />

            {/* Map Markers */}
            {filteredLocations.map((location) => {
              const config = typeConfig[location.type]
              return (
                <motion.button
                  key={location.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setSelectedLocation(location)}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 ${selectedLocation?.id === location.id ? 'z-20' : ''}`}
                  style={{
                    left: `${((location.coordinates.lng + 122.5) / 0.8) * 100 + 20}%`,
                    top: `${((38 - location.coordinates.lat) / 0.8) * 100 + 20}%`,
                  }}
                >
                  <div className={`relative p-2.5 rounded-full ${config.color} shadow-lg ${selectedLocation?.id === location.id ? 'ring-4 ring-white/30' : ''}`}>
                    <config.icon className="w-5 h-5 text-white" />
                    {location.type === 'technician' && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900" />
                    )}
                  </div>
                  <div className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${selectedLocation?.id === location.id ? (isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white') : (isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700')}`}>
                    {location.type === 'work_order' ? location.id : location.name.split(' ')[0]}
                  </div>
                </motion.button>
              )
            })}

            {/* Route Lines (simplified representation) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              {/* Example route line */}
              <motion.path
                d="M 30% 35% Q 40% 30% 50% 40%"
                stroke="url(#routeGradient)"
                strokeWidth="3"
                strokeDasharray="8 4"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </svg>
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-64 pl-10 pr-4 py-2.5 ${isDark ? 'bg-slate-900/90 border border-white/10 text-white placeholder:text-slate-500' : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-sm'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 backdrop-blur-sm`}
              />
            </div>

            {/* Layer Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowLayerPanel(!showLayerPanel)}
                className={`flex items-center gap-2 px-4 py-2.5 ${isDark ? 'bg-slate-900/90 border border-white/10 hover:bg-slate-800/90' : 'bg-white border border-slate-200 hover:bg-slate-50 shadow-sm'} rounded-xl text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} backdrop-blur-sm`}
              >
                <Layers className="w-4 h-4" />
                <span>Layers</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showLayerPanel ? 'rotate-180' : ''}`} />
              </button>
              {showLayerPanel && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`absolute top-full mt-2 left-0 w-48 p-2 ${isDark ? 'bg-slate-900/95 border border-white/10' : 'bg-white border border-slate-200 shadow-sm'} rounded-xl backdrop-blur-sm`}
                >
                  {Object.entries(typeConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => toggleLayer(key)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${visibleLayers.includes(key) ? (isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900') : (isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-50')}`}
                    >
                      <div className={`w-3 h-3 rounded-full ${config.color}`} />
                      <span>{config.label}</span>
                      {visibleLayers.includes(key) && <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-400" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <button className={`p-2.5 ${isDark ? 'bg-slate-900/90 border border-white/10 hover:bg-slate-800/90' : 'bg-white border border-slate-200 hover:bg-slate-50 shadow-sm'} rounded-xl ${isDark ? 'text-slate-300' : 'text-slate-700'} backdrop-blur-sm`}>
              <ZoomIn className="w-5 h-5" />
            </button>
            <button className={`p-2.5 ${isDark ? 'bg-slate-900/90 border border-white/10 hover:bg-slate-800/90' : 'bg-white border border-slate-200 hover:bg-slate-50 shadow-sm'} rounded-xl ${isDark ? 'text-slate-300' : 'text-slate-700'} backdrop-blur-sm`}>
              <ZoomOut className="w-5 h-5" />
            </button>
            <button className={`p-2.5 ${isDark ? 'bg-slate-900/90 border border-white/10 hover:bg-slate-800/90' : 'bg-white border border-slate-200 hover:bg-slate-50 shadow-sm'} rounded-xl ${isDark ? 'text-slate-300' : 'text-slate-700'} backdrop-blur-sm`}>
              <Maximize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Overlay */}
          <div className="absolute bottom-4 left-4 flex gap-3">
            {[
              { label: 'Work Orders', value: stats.workOrders, color: 'bg-violet-500' },
              { label: 'Technicians', value: stats.technicians, color: 'bg-emerald-500' },
              { label: 'Warehouses', value: stats.warehouses, color: 'bg-amber-500' },
            ].map((stat) => (
              <div key={stat.label} className={`flex items-center gap-2 px-3 py-2 ${isDark ? 'bg-slate-900/90 border border-white/10' : 'bg-white border border-slate-200 shadow-sm'} rounded-xl backdrop-blur-sm`}>
                <div className={`w-2.5 h-2.5 rounded-full ${stat.color}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</span>
                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-80 flex flex-col gap-4">
          {/* Selected Location Details */}
          {selectedLocation ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-5 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-200 shadow-sm'} backdrop-blur-sm`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${typeConfig[selectedLocation.type].color}`}>
                    {(() => {
                      const Icon = typeConfig[selectedLocation.type].icon
                      return <Icon className="w-5 h-5 text-white" />
                    })()}
                  </div>
                  <div>
                    <span className={`text-xs uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{selectedLocation.type.replace('_', ' ')}</span>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedLocation.name}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-start gap-3">
                  <MapPin className={`w-4 h-4 mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{selectedLocation.address}</p>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className={`w-4 h-4 mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{selectedLocation.details}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm"
                >
                  <Navigation className="w-4 h-4" />
                  Navigate
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl ${isDark ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10' : 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 shadow-sm'} font-medium text-sm`}
                >
                  View Details
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className={`p-5 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-200 shadow-sm'} backdrop-blur-sm text-center`}>
              <MapPin className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Select a location on the map to view details</p>
            </div>
          )}

          {/* Active Technicians */}
          <div className={`flex-1 p-5 rounded-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-slate-200 shadow-sm'} backdrop-blur-sm overflow-hidden flex flex-col`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Users className="w-5 h-5 text-emerald-400" />
                Active Technicians
              </h3>
              <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">{stats.technicians} online</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {mockLocations.filter(l => l.type === 'technician').map((tech) => (
                <motion.button
                  key={tech.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setSelectedLocation(tech)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${selectedLocation?.id === tech.id ? 'bg-emerald-500/20 border border-emerald-500/30' : (isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100')}`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                      <span className="text-white font-semibold">{tech.name.charAt(0)}</span>
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 ${isDark ? 'border-slate-900' : 'border-white'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{tech.name}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{tech.address}</p>
                  </div>
                  <Zap className="w-4 h-4 text-emerald-400" />
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
