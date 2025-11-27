'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Box,
  Search,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  MapPin,
  Calendar,
  Clock,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface InventoryItem {
  id: string
  name: string
  sku: string
  category: string
  quantity: number
  minQuantity: number
  unit: string
  lastRestocked: string
  location: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
}

interface InventoryMovement {
  id: string
  item: string
  type: 'in' | 'out'
  quantity: number
  reason: string
  date: string
  time: string
  user: string
}

const mockInventory: InventoryItem[] = [
  {
    id: 'INV-001',
    name: 'Smart Lock Module',
    sku: 'SLM-2024-A',
    category: 'Electronics',
    quantity: 45,
    minQuantity: 20,
    unit: 'units',
    lastRestocked: '2024-01-15',
    location: 'Warehouse A',
    status: 'in_stock',
  },
  {
    id: 'INV-002',
    name: 'Door Hinge Assembly',
    sku: 'DHA-STD-01',
    category: 'Hardware',
    quantity: 12,
    minQuantity: 15,
    unit: 'units',
    lastRestocked: '2024-01-10',
    location: 'Warehouse A',
    status: 'low_stock',
  },
  {
    id: 'INV-003',
    name: 'Power Supply Unit',
    sku: 'PSU-24V-5A',
    category: 'Electronics',
    quantity: 28,
    minQuantity: 10,
    unit: 'units',
    lastRestocked: '2024-01-12',
    location: 'Warehouse B',
    status: 'in_stock',
  },
  {
    id: 'INV-004',
    name: 'Touch Screen Display',
    sku: 'TSD-7IN-HD',
    category: 'Electronics',
    quantity: 0,
    minQuantity: 5,
    unit: 'units',
    lastRestocked: '2023-12-20',
    location: 'Warehouse A',
    status: 'out_of_stock',
  },
  {
    id: 'INV-005',
    name: 'Security Seal',
    sku: 'SEC-SEAL-BLU',
    category: 'Consumables',
    quantity: 500,
    minQuantity: 100,
    unit: 'pieces',
    lastRestocked: '2024-01-18',
    location: 'Warehouse A',
    status: 'in_stock',
  },
  {
    id: 'INV-006',
    name: 'Mounting Bracket',
    sku: 'MNT-BRK-LG',
    category: 'Hardware',
    quantity: 8,
    minQuantity: 10,
    unit: 'units',
    lastRestocked: '2024-01-05',
    location: 'Warehouse B',
    status: 'low_stock',
  },
]

const mockMovements: InventoryMovement[] = [
  {
    id: 'MOV-001',
    item: 'Smart Lock Module',
    type: 'out',
    quantity: 4,
    reason: 'Project deployment - Downtown Mall',
    date: '2024-01-18',
    time: '10:30 AM',
    user: 'John Smith',
  },
  {
    id: 'MOV-002',
    item: 'Security Seal',
    type: 'in',
    quantity: 200,
    reason: 'Restock from supplier',
    date: '2024-01-18',
    time: '09:15 AM',
    user: 'Sarah Johnson',
  },
  {
    id: 'MOV-003',
    item: 'Door Hinge Assembly',
    type: 'out',
    quantity: 3,
    reason: 'Maintenance - Central Station',
    date: '2024-01-17',
    time: '02:45 PM',
    user: 'Mike Chen',
  },
  {
    id: 'MOV-004',
    item: 'Power Supply Unit',
    type: 'in',
    quantity: 15,
    reason: 'Restock from supplier',
    date: '2024-01-17',
    time: '11:00 AM',
    user: 'Sarah Johnson',
  },
]

export default function ClientInventoryPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const filteredInventory = mockInventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'In Stock' }
      case 'low_stock':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Low Stock' }
      case 'out_of_stock':
        return { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Out of Stock' }
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Unknown' }
    }
  }

  const stats = {
    totalItems: mockInventory.length,
    inStock: mockInventory.filter((i) => i.status === 'in_stock').length,
    lowStock: mockInventory.filter((i) => i.status === 'low_stock').length,
    outOfStock: mockInventory.filter((i) => i.status === 'out_of_stock').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Inventory
        </h1>
        <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Track spare parts and consumables for your equipment
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: stats.totalItems, icon: Box, color: 'blue' },
          { label: 'In Stock', value: stats.inStock, icon: Package, color: 'emerald' },
          { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'amber' },
          { label: 'Out of Stock', value: stats.outOfStock, icon: AlertTriangle, color: 'red' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory List */}
        <div className={`lg:col-span-2 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  placeholder="Search inventory..."
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-4 py-2.5 rounded-xl border ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <option value="all">All Status</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {filteredInventory.map((item, index) => {
              const statusBadge = getStatusBadge(item.status)

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-colors`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                        <Package className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <h3 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {item.name}
                        </h3>
                        <p className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {item.sku}
                        </p>
                        <div className={`flex items-center gap-3 mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          <span>{item.category}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {item.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {item.quantity} <span className="text-sm font-normal">{item.unit}</span>
                      </p>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* Stock Level Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Min: {item.minQuantity} {item.unit}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Last restocked: {item.lastRestocked}
                      </span>
                    </div>
                    <div className={`h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.status === 'in_stock'
                            ? 'bg-emerald-500'
                            : item.status === 'low_stock'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((item.quantity / (item.minQuantity * 2)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {filteredInventory.length === 0 && (
            <div className="p-12 text-center">
              <Box className={`w-12 h-12 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
              <p className={`mt-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No items found
              </p>
            </div>
          )}
        </div>

        {/* Recent Movements */}
        <div className={`rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Recent Movements
            </h2>
          </div>

          <div className="divide-y divide-white/5">
            {mockMovements.map((movement, index) => (
              <motion.div
                key={movement.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    movement.type === 'in'
                      ? 'bg-emerald-500/20'
                      : 'bg-red-500/20'
                  }`}>
                    {movement.type === 'in' ? (
                      <ArrowDownRight className={`w-4 h-4 text-emerald-400`} />
                    ) : (
                      <ArrowUpRight className={`w-4 h-4 text-red-400`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {movement.item}
                      </p>
                      <span className={`text-sm font-medium ${
                        movement.type === 'in' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {movement.reason}
                    </p>
                    <div className={`flex items-center gap-2 mt-2 text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                      <span>{movement.date}</span>
                      <span>•</span>
                      <span>{movement.time}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className={`p-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-2 rounded-xl text-sm font-medium ${
                isDark
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              View All Movements
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
