'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/theme-context'
import {
  MapPinned,
  Plus,
  Search,
  Warehouse,
  Truck,
  Building2,
  Package,
  DollarSign,
  ChevronRight,
  Box,
  Edit,
  MoreHorizontal,
} from 'lucide-react'

interface Location {
  id: string
  name: string
  type: 'warehouse' | 'vehicle' | 'client'
  address?: string
  assignedTo?: string
  itemCount: number
  totalValue: number
  topItems: { name: string; quantity: number }[]
  lastUpdated: string
}

const locations: Location[] = [
  {
    id: 'L-001',
    name: 'Main Warehouse',
    type: 'warehouse',
    address: '1234 Industrial Blvd, San Francisco, CA',
    itemCount: 186,
    totalValue: 32500,
    topItems: [
      { name: 'CAT6 Ethernet Cable', quantity: 5 },
      { name: 'Cable Ties (500pk)', quantity: 15 },
      { name: 'Network Switch 24-Port', quantity: 3 },
    ],
    lastUpdated: '2 hours ago',
  },
  {
    id: 'L-002',
    name: 'Vehicle V-001',
    type: 'vehicle',
    assignedTo: 'Mike Johnson',
    itemCount: 24,
    totalValue: 4200,
    topItems: [
      { name: 'CAT6 Ethernet Cable', quantity: 2 },
      { name: 'Fiber Optic Cable SM', quantity: 2 },
      { name: 'Crimping Tool Pro', quantity: 2 },
    ],
    lastUpdated: '30 min ago',
  },
  {
    id: 'L-003',
    name: 'Vehicle V-002',
    type: 'vehicle',
    assignedTo: 'Emily Williams',
    itemCount: 18,
    totalValue: 2800,
    topItems: [
      { name: 'RJ45 Connectors (100pk)', quantity: 1 },
      { name: 'Crimping Tool Pro', quantity: 2 },
      { name: 'Cable Ties (500pk)', quantity: 3 },
    ],
    lastUpdated: '1 hour ago',
  },
  {
    id: 'L-004',
    name: 'Vehicle V-003',
    type: 'vehicle',
    assignedTo: 'David Brown',
    itemCount: 15,
    totalValue: 2100,
    topItems: [
      { name: 'CAT6 Ethernet Cable', quantity: 1 },
      { name: 'Crimping Tool Pro', quantity: 1 },
      { name: 'Cable Ties (500pk)', quantity: 2 },
    ],
    lastUpdated: '3 hours ago',
  },
  {
    id: 'L-005',
    name: 'Vehicle V-004',
    type: 'vehicle',
    assignedTo: 'Sarah Lee',
    itemCount: 12,
    totalValue: 1800,
    topItems: [
      { name: 'Cable Ties (500pk)', quantity: 2 },
      { name: 'Network Router', quantity: 1 },
    ],
    lastUpdated: '5 hours ago',
  },
  {
    id: 'L-006',
    name: 'TechCorp Industries',
    type: 'client',
    address: '123 Market Street, San Francisco, CA',
    itemCount: 8,
    totalValue: 2400,
    topItems: [
      { name: 'Network Switch 24-Port', quantity: 2 },
      { name: 'Patch Panel 48-Port', quantity: 1 },
    ],
    lastUpdated: '1 day ago',
  },
  {
    id: 'L-007',
    name: 'Bay Area Medical Center',
    type: 'client',
    address: '456 Hospital Drive, San Francisco, CA',
    itemCount: 6,
    totalValue: 2000,
    topItems: [
      { name: 'Fiber Optic Cable SM', quantity: 1 },
      { name: 'Network Switch 24-Port', quantity: 1 },
    ],
    lastUpdated: '3 days ago',
  },
]

export default function LocationsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null)

  const filteredLocations = locations.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.address?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = filterType === 'all' || l.type === filterType
    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warehouse': return Warehouse
      case 'vehicle': return Truck
      case 'client': return Building2
      default: return MapPinned
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'warehouse': return isDark ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-100 text-violet-700'
      case 'vehicle': return isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
      case 'client': return isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
      default: return isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600'
    }
  }

  const summaryStats = {
    warehouses: locations.filter(l => l.type === 'warehouse'),
    vehicles: locations.filter(l => l.type === 'vehicle'),
    clients: locations.filter(l => l.type === 'client'),
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Inventory Locations</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Track inventory across warehouses, vehicles, and client sites</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>Add Location</span>
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
              <Warehouse className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{summaryStats.warehouses.length}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Warehouses</p>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Items</span>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{summaryStats.warehouses.reduce((s, l) => s + l.itemCount, 0)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Value</span>
            <span className={`font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>${summaryStats.warehouses.reduce((s, l) => s + l.totalValue, 0).toLocaleString()}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-5 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{summaryStats.vehicles.length}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Vehicles</p>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Items</span>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{summaryStats.vehicles.reduce((s, l) => s + l.itemCount, 0)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Value</span>
            <span className={`font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>${summaryStats.vehicles.reduce((s, l) => s + l.totalValue, 0).toLocaleString()}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-5 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{summaryStats.clients.length}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Client Sites</p>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Items</span>
            <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{summaryStats.clients.reduce((s, l) => s + l.itemCount, 0)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Value</span>
            <span className={`font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>${summaryStats.clients.reduce((s, l) => s + l.totalValue, 0).toLocaleString()}</span>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className={`flex items-center gap-4 p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border`}>
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'} border focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`px-4 py-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
        >
          <option value="all">All Types</option>
          <option value="warehouse">Warehouses</option>
          <option value="vehicle">Vehicles</option>
          <option value="client">Client Sites</option>
        </select>
      </div>

      {/* Locations List */}
      <div className="space-y-4">
        {filteredLocations.map((location, index) => {
          const TypeIcon = getTypeIcon(location.type)
          const isExpanded = expandedLocation === location.id

          return (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border overflow-hidden`}
            >
              <div
                className={`p-5 cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-colors`}
                onClick={() => setExpandedLocation(isExpanded ? null : location.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                      <TypeIcon className={`w-5 h-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{location.name}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getTypeBadge(location.type)}`}>
                          {location.type}
                        </span>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {location.address || (location.assignedTo && `Assigned to ${location.assignedTo}`)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{location.itemCount}</p>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Items</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>${location.totalValue.toLocaleString()}</p>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Value</p>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''} ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </div>
                </div>
              </div>

              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`px-5 pb-5 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}
                >
                  <div className="pt-4">
                    <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Top Items at this Location</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {location.topItems.map((item, i) => (
                        <div key={i} className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                          <div className="flex items-center gap-2">
                            <Box className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</span>
                          </div>
                          <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.quantity} units</p>
                        </div>
                      ))}
                    </div>
                    <div className={`flex items-center justify-between mt-4 pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Last updated: {location.lastUpdated}</p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Manage Inventory
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
