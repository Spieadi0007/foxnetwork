'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  List,
  Filter,
  Search,
  Plus,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
  User,
  Building2,
  Phone,
  Navigation,
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  ArrowUpRight,
  Zap,
  Timer,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

type ViewMode = 'list' | 'map'
type WorkOrderStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent'

interface WorkOrder {
  id: string
  title: string
  description: string
  status: WorkOrderStatus
  priority: WorkOrderPriority
  client: {
    name: string
    company: string
    phone: string
  }
  address: string
  coordinates: { lat: number; lng: number }
  scheduledDate: string
  scheduledTime: string
  assignedTo: string | null
  estimatedDuration: string
  createdAt: string
}

// Mock data for work orders
const mockWorkOrders: WorkOrder[] = [
  {
    id: 'WO-001',
    title: 'Network Installation',
    description: 'Install fiber optic network infrastructure for new office building',
    status: 'in_progress',
    priority: 'high',
    client: { name: 'John Smith', company: 'TechCorp Inc.', phone: '+1 555-0123' },
    address: '123 Business Ave, San Francisco, CA 94102',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    scheduledDate: '2025-11-24',
    scheduledTime: '09:00 AM',
    assignedTo: 'Mike Johnson',
    estimatedDuration: '4 hours',
    createdAt: '2025-11-20',
  },
  {
    id: 'WO-002',
    title: 'Router Maintenance',
    description: 'Quarterly maintenance check on enterprise routers',
    status: 'pending',
    priority: 'medium',
    client: { name: 'Sarah Davis', company: 'DataFlow LLC', phone: '+1 555-0456' },
    address: '456 Tech Park, San Jose, CA 95110',
    coordinates: { lat: 37.3382, lng: -121.8863 },
    scheduledDate: '2025-11-25',
    scheduledTime: '02:00 PM',
    assignedTo: null,
    estimatedDuration: '2 hours',
    createdAt: '2025-11-21',
  },
  {
    id: 'WO-003',
    title: 'Security Camera Setup',
    description: 'Install and configure 12 security cameras across facility',
    status: 'assigned',
    priority: 'urgent',
    client: { name: 'Robert Chen', company: 'SecureBank', phone: '+1 555-0789' },
    address: '789 Financial District, Oakland, CA 94612',
    coordinates: { lat: 37.8044, lng: -122.2712 },
    scheduledDate: '2025-11-24',
    scheduledTime: '08:00 AM',
    assignedTo: 'Emily Williams',
    estimatedDuration: '6 hours',
    createdAt: '2025-11-19',
  },
  {
    id: 'WO-004',
    title: 'WiFi Network Expansion',
    description: 'Expand WiFi coverage to new wing of hospital',
    status: 'completed',
    priority: 'high',
    client: { name: 'Dr. Lisa Park', company: 'Bay Medical Center', phone: '+1 555-0321' },
    address: '321 Health Blvd, Berkeley, CA 94704',
    coordinates: { lat: 37.8716, lng: -122.2727 },
    scheduledDate: '2025-11-23',
    scheduledTime: '10:00 AM',
    assignedTo: 'David Brown',
    estimatedDuration: '5 hours',
    createdAt: '2025-11-18',
  },
  {
    id: 'WO-005',
    title: 'Server Room Cabling',
    description: 'Re-cable server room with Cat6a infrastructure',
    status: 'cancelled',
    priority: 'low',
    client: { name: 'Tom Wilson', company: 'StartupHub', phone: '+1 555-0654' },
    address: '654 Innovation Way, Palo Alto, CA 94301',
    coordinates: { lat: 37.4419, lng: -122.143 },
    scheduledDate: '2025-11-26',
    scheduledTime: '11:00 AM',
    assignedTo: null,
    estimatedDuration: '8 hours',
    createdAt: '2025-11-22',
  },
]

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock },
  assigned: { label: 'Assigned', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: User },
  in_progress: { label: 'In Progress', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', icon: Zap },
  completed: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: XCircle },
}

const priorityConfig = {
  low: { label: 'Low', color: 'bg-slate-500/20 text-slate-400' },
  medium: { label: 'Medium', color: 'bg-blue-500/20 text-blue-400' },
  high: { label: 'High', color: 'bg-orange-500/20 text-orange-400' },
  urgent: { label: 'Urgent', color: 'bg-red-500/20 text-red-400' },
}

export default function WorkOrdersPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | 'all'>('all')
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filteredOrders = mockWorkOrders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: mockWorkOrders.length,
    pending: mockWorkOrders.filter(o => o.status === 'pending').length,
    inProgress: mockWorkOrders.filter(o => o.status === 'in_progress').length,
    completed: mockWorkOrders.filter(o => o.status === 'completed').length,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Work Orders</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage and track all field service work orders</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-shadow"
        >
          <Plus className="w-5 h-5" />
          <span>New Work Order</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: stats.total, icon: List, color: 'from-slate-500 to-slate-600' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'from-amber-500 to-orange-500' },
          { label: 'In Progress', value: stats.inProgress, icon: Zap, color: 'from-violet-500 to-purple-500' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-2xl border backdrop-blur-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search work orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm transition-all ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`absolute top-full mt-2 left-0 w-48 p-2 border rounded-xl shadow-xl z-10 ${isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'}`}
                >
                  <button
                    onClick={() => { setStatusFilter('all'); setShowFilters(false) }}
                    className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${statusFilter === 'all' ? 'bg-emerald-500/20 text-emerald-400' : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    All Status
                  </button>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => { setStatusFilter(key as WorkOrderStatus); setShowFilters(false) }}
                      className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors flex items-center gap-2 ${statusFilter === key ? 'bg-emerald-500/20 text-emerald-400' : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      <config.icon className="w-4 h-4" />
                      {config.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* View Toggle */}
        <div className={`flex items-center p-1 border rounded-xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-emerald-500 text-white' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <List className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'map' ? 'bg-emerald-500 text-white' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <MapPin className="w-4 h-4" />
            Map
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Work Orders List/Map */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {viewMode === 'list' ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                {filteredOrders.map((order, index) => (
                  <WorkOrderCard
                    key={order.id}
                    order={order}
                    index={index}
                    isSelected={selectedOrder?.id === order.id}
                    onClick={() => setSelectedOrder(order)}
                    isDark={isDark}
                  />
                ))}
                {filteredOrders.length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>No work orders found</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="map"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`h-[600px] rounded-2xl border overflow-hidden relative ${isDark ? 'bg-slate-800/50 border-white/10' : 'bg-slate-50 border-slate-200'}`}
              >
                {/* Map Placeholder - In production, use Mapbox or Google Maps */}
                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-100 to-slate-200'}`}>
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }} />

                  {/* Map Markers */}
                  {filteredOrders.map((order) => (
                    <motion.button
                      key={order.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.2 }}
                      onClick={() => setSelectedOrder(order)}
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${selectedOrder?.id === order.id ? 'z-20' : 'z-10'}`}
                      style={{
                        left: `${((order.coordinates.lng + 122.5) / 1) * 100 + 30}%`,
                        top: `${((38 - order.coordinates.lat) / 1) * 100 + 20}%`,
                      }}
                    >
                      <div className={`relative p-2 rounded-full ${selectedOrder?.id === order.id ? 'bg-emerald-500' : 'bg-violet-500'} shadow-lg`}>
                        <MapPin className="w-5 h-5 text-white" />
                        {order.priority === 'urgent' && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                        )}
                      </div>
                      <div className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${selectedOrder?.id === order.id ? 'bg-emerald-500 text-white' : isDark ? 'bg-slate-700 text-slate-300' : 'bg-white text-slate-700 border border-slate-200'}`}>
                        {order.id}
                      </div>
                    </motion.button>
                  ))}

                  {/* Map Legend */}
                  <div className={`absolute bottom-4 left-4 p-3 rounded-xl border backdrop-blur-sm ${isDark ? 'bg-slate-900/90 border-white/10' : 'bg-white/90 border-slate-200'}`}>
                    <p className={`text-xs mb-2 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Map View</p>
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>Click markers to view details</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0, x: 50, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 380 }}
              exit={{ opacity: 0, x: 50, width: 0 }}
              className="flex-shrink-0"
            >
              <div className={`w-[380px] p-6 rounded-2xl border backdrop-blur-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedOrder.id}</span>
                    <h3 className={`text-lg font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedOrder.title}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                {/* Status & Priority */}
                <div className="flex items-center gap-2 mb-6">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${statusConfig[selectedOrder.status].color}`}>
                    {statusConfig[selectedOrder.status].label}
                  </span>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${priorityConfig[selectedOrder.priority].color}`}>
                    {priorityConfig[selectedOrder.priority].label} Priority
                  </span>
                </div>

                {/* Description */}
                <p className={`text-sm mb-6 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{selectedOrder.description}</p>

                {/* Details */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                      <Building2 className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Client</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedOrder.client.name}</p>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedOrder.client.company}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                      <Phone className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Phone</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedOrder.client.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                      <MapPin className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Location</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedOrder.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                      <Calendar className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Scheduled</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedOrder.scheduledDate} at {selectedOrder.scheduledTime}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                      <Timer className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Estimated Duration</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedOrder.estimatedDuration}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                      <User className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Assigned To</p>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedOrder.assignedTo || 'Unassigned'}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className={`flex gap-2 mt-6 pt-6 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
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
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'}`}
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
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

function WorkOrderCard({
  order,
  index,
  isSelected,
  onClick,
  isDark,
}: {
  order: WorkOrder
  index: number
  isSelected: boolean
  onClick: () => void
  isDark: boolean
}) {
  const StatusIcon = statusConfig[order.status].icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
        isSelected
          ? 'bg-emerald-500/10 border-emerald-500/30'
          : isDark
            ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
            : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-emerald-500/20' : isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
            <StatusIcon className={`w-5 h-5 ${isSelected ? 'text-emerald-400' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{order.id}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityConfig[order.priority].color}`}>
                {priorityConfig[order.priority].label}
              </span>
            </div>
            <h3 className={`font-medium mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{order.title}</h3>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${statusConfig[order.status].color}`}>
          {statusConfig[order.status].label}
        </span>
      </div>

      <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{order.description}</p>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <Building2 className="w-4 h-4" />
            <span>{order.client.company}</span>
          </div>
          <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <Calendar className="w-4 h-4" />
            <span>{order.scheduledDate}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {order.assignedTo ? (
            <>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <span className="text-xs text-white font-medium">{order.assignedTo.charAt(0)}</span>
              </div>
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{order.assignedTo.split(' ')[0]}</span>
            </>
          ) : (
            <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Unassigned</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
