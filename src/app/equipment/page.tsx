'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  Wrench,
  ChevronRight,
  Eye,
  QrCode,
  MapPin,
  Calendar,
  Activity,
  Settings,
  X,
  Thermometer,
  Wifi,
  Battery,
  Shield,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface Equipment {
  id: string
  serialNumber: string
  model: string
  type: 'locker' | 'kiosk' | 'terminal' | 'sensor'
  status: 'operational' | 'maintenance' | 'offline' | 'decommissioned'
  location: string
  locationId: string
  installDate: string
  lastMaintenance: string
  nextMaintenance: string
  firmware: string
  connectivity: 'online' | 'offline' | 'intermittent'
  batteryLevel?: number
  temperature?: number
  usageToday: number
  usageTotal: number
}

const mockEquipment: Equipment[] = [
  {
    id: 'EQ-001',
    serialNumber: 'SL-PRO-2024-001',
    model: 'Smart Locker Pro X4',
    type: 'locker',
    status: 'operational',
    location: 'Downtown Mall - Main Entrance',
    locationId: 'LOC-001',
    installDate: '2023-06-15',
    lastMaintenance: '2024-01-05',
    nextMaintenance: '2024-04-05',
    firmware: 'v2.4.1',
    connectivity: 'online',
    temperature: 22,
    usageToday: 45,
    usageTotal: 12450,
  },
  {
    id: 'EQ-002',
    serialNumber: 'SL-PRO-2024-002',
    model: 'Smart Locker Pro X4',
    type: 'locker',
    status: 'operational',
    location: 'Downtown Mall - Main Entrance',
    locationId: 'LOC-001',
    installDate: '2023-06-15',
    lastMaintenance: '2024-01-05',
    nextMaintenance: '2024-04-05',
    firmware: 'v2.4.1',
    connectivity: 'online',
    temperature: 23,
    usageToday: 38,
    usageTotal: 11200,
  },
  {
    id: 'EQ-003',
    serialNumber: 'SL-STD-2023-015',
    model: 'Smart Locker Standard',
    type: 'locker',
    status: 'maintenance',
    location: 'Central Station',
    locationId: 'LOC-003',
    installDate: '2023-05-10',
    lastMaintenance: '2023-12-20',
    nextMaintenance: '2024-01-20',
    firmware: 'v2.3.8',
    connectivity: 'intermittent',
    temperature: 25,
    usageToday: 0,
    usageTotal: 15800,
  },
  {
    id: 'EQ-004',
    serialNumber: 'KS-2024-001',
    model: 'Interactive Kiosk K1',
    type: 'kiosk',
    status: 'operational',
    location: 'Airport Terminal B',
    locationId: 'LOC-002',
    installDate: '2023-08-20',
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-04-10',
    firmware: 'v3.1.0',
    connectivity: 'online',
    temperature: 24,
    usageToday: 120,
    usageTotal: 25600,
  },
  {
    id: 'EQ-005',
    serialNumber: 'SL-PRO-2023-008',
    model: 'Smart Locker Pro X8',
    type: 'locker',
    status: 'operational',
    location: 'Airport Terminal B',
    locationId: 'LOC-002',
    installDate: '2023-08-20',
    lastMaintenance: '2024-01-10',
    nextMaintenance: '2024-04-10',
    firmware: 'v2.4.1',
    connectivity: 'online',
    temperature: 21,
    usageToday: 85,
    usageTotal: 18900,
  },
  {
    id: 'EQ-006',
    serialNumber: 'SN-ENV-001',
    model: 'Environmental Sensor',
    type: 'sensor',
    status: 'operational',
    location: 'Tech Park Building A',
    locationId: 'LOC-004',
    installDate: '2023-09-01',
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-07-15',
    firmware: 'v1.2.0',
    connectivity: 'online',
    batteryLevel: 85,
    temperature: 22,
    usageToday: 0,
    usageTotal: 0,
  },
]

export default function ClientEquipmentPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null)

  const filteredEquipment = mockEquipment.filter((item) => {
    const matchesSearch =
      item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus
    const matchesType = filterType === 'all' || item.type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle }
      case 'maintenance':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Wrench }
      case 'offline':
        return { bg: 'bg-red-500/20', text: 'text-red-400', icon: AlertTriangle }
      case 'decommissioned':
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: Clock }
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: Clock }
    }
  }

  const getConnectivityBadge = (connectivity: string) => {
    switch (connectivity) {
      case 'online':
        return { bg: 'bg-emerald-500', text: 'Online' }
      case 'offline':
        return { bg: 'bg-red-500', text: 'Offline' }
      case 'intermittent':
        return { bg: 'bg-amber-500', text: 'Intermittent' }
      default:
        return { bg: 'bg-slate-500', text: 'Unknown' }
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'locker':
        return Package
      case 'kiosk':
        return Settings
      case 'terminal':
        return Activity
      case 'sensor':
        return Thermometer
      default:
        return Package
    }
  }

  const stats = {
    total: mockEquipment.length,
    operational: mockEquipment.filter((e) => e.status === 'operational').length,
    maintenance: mockEquipment.filter((e) => e.status === 'maintenance').length,
    offline: mockEquipment.filter((e) => e.status === 'offline').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Assets
        </h1>
        <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Monitor and manage your deployed assets
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Assets', value: stats.total, icon: Package, color: 'blue' },
          { label: 'Operational', value: stats.operational, icon: CheckCircle, color: 'emerald' },
          { label: 'In Maintenance', value: stats.maintenance, icon: Wrench, color: 'amber' },
          { label: 'Offline', value: stats.offline, icon: AlertTriangle, color: 'red' },
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
                  'text-red-500'
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
              placeholder="Search by serial number, model, or location..."
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
              <option value="operational">Operational</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Offline</option>
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
              <option value="locker">Lockers</option>
              <option value="kiosk">Kiosks</option>
              <option value="terminal">Terminals</option>
              <option value="sensor">Sensors</option>
            </select>
          </div>
        </div>
      </div>

      {/* Equipment List */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
        {/* Table Header */}
        <div className={`hidden md:grid grid-cols-12 gap-4 p-4 border-b text-sm font-medium ${
          isDark ? 'border-white/10 text-slate-400 bg-white/5' : 'border-slate-200 text-slate-500 bg-slate-50'
        }`}>
          <div className="col-span-3">Equipment</div>
          <div className="col-span-3">Location</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Connectivity</div>
          <div className="col-span-2">Usage Today</div>
        </div>

        {/* Equipment Items */}
        <div className="divide-y divide-white/5">
          {filteredEquipment.map((item, index) => {
            const statusBadge = getStatusBadge(item.status)
            const StatusIcon = statusBadge.icon
            const connectivityBadge = getConnectivityBadge(item.connectivity)
            const TypeIcon = getTypeIcon(item.type)

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedEquipment(item)}
                className={`p-4 cursor-pointer transition-all ${
                  isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                }`}
              >
                <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center">
                  {/* Equipment Info */}
                  <div className="col-span-3 flex items-center gap-3 mb-3 md:mb-0">
                    <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                      <TypeIcon className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {item.model}
                      </p>
                      <p className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {item.serialNumber}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="col-span-3 mb-2 md:mb-0">
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {item.location}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 mb-2 md:mb-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {item.status}
                    </span>
                  </div>

                  {/* Connectivity */}
                  <div className="col-span-2 mb-2 md:mb-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${connectivityBadge.bg} ${item.connectivity === 'online' ? '' : 'animate-pulse'}`} />
                      <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {connectivityBadge.text}
                      </span>
                    </div>
                  </div>

                  {/* Usage */}
                  <div className="col-span-2 flex items-center justify-between">
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {item.usageToday} uses
                    </span>
                    <ChevronRight className={`w-5 h-5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {filteredEquipment.length === 0 && (
        <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <Package className={`w-12 h-12 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
          <p className={`mt-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            No equipment found
          </p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Try adjusting your filters
          </p>
        </div>
      )}

      {/* Equipment Detail Modal */}
      <AnimatePresence>
        {selectedEquipment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedEquipment(null)}
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
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600`}>
                    {(() => {
                      const Icon = getTypeIcon(selectedEquipment.type)
                      return <Icon className="w-5 h-5 text-white" />
                    })()}
                  </div>
                  <div>
                    <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedEquipment.model}
                    </h2>
                    <p className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {selectedEquipment.serialNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEquipment(null)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Status Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Status</span>
                    </div>
                    {(() => {
                      const badge = getStatusBadge(selectedEquipment.status)
                      const Icon = badge.icon
                      return (
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                          <Icon className="w-3 h-3" />
                          {selectedEquipment.status}
                        </span>
                      )
                    })()}
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Wifi className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Connectivity</span>
                    </div>
                    {(() => {
                      const badge = getConnectivityBadge(selectedEquipment.connectivity)
                      return (
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${badge.bg}`} />
                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {badge.text}
                          </span>
                        </div>
                      )
                    })()}
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  {selectedEquipment.temperature && (
                    <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <Thermometer className={`w-5 h-5 mx-auto mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {selectedEquipment.temperature}°C
                      </p>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Temperature</p>
                    </div>
                  )}
                  {selectedEquipment.batteryLevel && (
                    <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <Battery className={`w-5 h-5 mx-auto mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {selectedEquipment.batteryLevel}%
                      </p>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Battery</p>
                    </div>
                  )}
                  <div className={`p-4 rounded-xl text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <Activity className={`w-5 h-5 mx-auto mb-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedEquipment.usageToday}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Today</p>
                  </div>
                </div>

                {/* Location */}
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Location</span>
                  </div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedEquipment.location}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Install Date</p>
                    <p className={`font-medium mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedEquipment.installDate}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Firmware</p>
                    <p className={`font-medium font-mono mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedEquipment.firmware}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Last Maintenance</p>
                    <p className={`font-medium mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedEquipment.lastMaintenance}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Next Maintenance</p>
                    <p className={`font-medium mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedEquipment.nextMaintenance}
                    </p>
                  </div>
                </div>

                {/* Total Usage */}
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Lifetime Usage</span>
                    <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedEquipment.usageTotal.toLocaleString()} uses
                    </span>
                  </div>
                </div>
              </div>

              <div className={`flex items-center gap-3 p-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium ${
                    isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  View QR Code
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium"
                >
                  <Wrench className="w-4 h-4" />
                  Request Service
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
