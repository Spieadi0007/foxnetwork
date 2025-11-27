'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/theme-context'
import {
  Box,
  Plus,
  Search,
  Filter,
  Package,
  DollarSign,
  MapPin,
  Tag,
  Edit,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'

interface Part {
  id: string
  sku: string
  name: string
  category: string
  description: string
  unitCost: number
  unitPrice: number
  totalStock: number
  minStock: number
  locations: { name: string; quantity: number }[]
  supplier: string
  lastRestocked: string
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
}

const parts: Part[] = [
  {
    id: 'P-001',
    sku: 'CAB-CAT6-1000',
    name: 'CAT6 Ethernet Cable',
    category: 'Cables',
    description: '1000ft spool, plenum rated',
    unitCost: 85,
    unitPrice: 125,
    totalStock: 8,
    minStock: 5,
    locations: [{ name: 'Warehouse', quantity: 5 }, { name: 'Vehicle V-001', quantity: 2 }, { name: 'Vehicle V-003', quantity: 1 }],
    supplier: 'CableMax Supply',
    lastRestocked: '2024-11-15',
    status: 'in_stock',
  },
  {
    id: 'P-002',
    sku: 'CON-RJ45-100',
    name: 'RJ45 Connectors',
    category: 'Connectors',
    description: '100 pack, CAT6 compatible',
    unitCost: 12,
    unitPrice: 22,
    totalStock: 3,
    minStock: 10,
    locations: [{ name: 'Warehouse', quantity: 2 }, { name: 'Vehicle V-002', quantity: 1 }],
    supplier: 'TechParts Inc',
    lastRestocked: '2024-10-28',
    status: 'low_stock',
  },
  {
    id: 'P-003',
    sku: 'SW-24P-GB',
    name: 'Network Switch 24-Port',
    category: 'Networking',
    description: 'Gigabit managed switch',
    unitCost: 180,
    unitPrice: 275,
    totalStock: 4,
    minStock: 3,
    locations: [{ name: 'Warehouse', quantity: 3 }, { name: 'Vehicle V-001', quantity: 1 }],
    supplier: 'NetGear Pro',
    lastRestocked: '2024-11-10',
    status: 'in_stock',
  },
  {
    id: 'P-004',
    sku: 'PP-48P-CAT6',
    name: 'Patch Panel 48-Port',
    category: 'Networking',
    description: 'CAT6 rated, rack mountable',
    unitCost: 45,
    unitPrice: 78,
    totalStock: 2,
    minStock: 4,
    locations: [{ name: 'Warehouse', quantity: 2 }],
    supplier: 'CableMax Supply',
    lastRestocked: '2024-10-15',
    status: 'low_stock',
  },
  {
    id: 'P-005',
    sku: 'TOOL-CTEST-P',
    name: 'Cable Tester Pro',
    category: 'Tools',
    description: 'Professional network cable tester',
    unitCost: 65,
    unitPrice: 95,
    totalStock: 0,
    minStock: 2,
    locations: [],
    supplier: 'ToolMaster',
    lastRestocked: '2024-09-01',
    status: 'out_of_stock',
  },
  {
    id: 'P-006',
    sku: 'FIB-SM-500',
    name: 'Fiber Optic Cable SM',
    category: 'Cables',
    description: '500ft single-mode fiber',
    unitCost: 220,
    unitPrice: 340,
    totalStock: 6,
    minStock: 3,
    locations: [{ name: 'Warehouse', quantity: 4 }, { name: 'Vehicle V-001', quantity: 2 }],
    supplier: 'FiberTech',
    lastRestocked: '2024-11-18',
    status: 'in_stock',
  },
  {
    id: 'P-007',
    sku: 'CRIMP-PRO',
    name: 'Crimping Tool Pro',
    category: 'Tools',
    description: 'Professional RJ45/RJ11 crimper',
    unitCost: 35,
    unitPrice: 55,
    totalStock: 8,
    minStock: 4,
    locations: [{ name: 'Warehouse', quantity: 3 }, { name: 'Vehicle V-001', quantity: 2 }, { name: 'Vehicle V-002', quantity: 2 }, { name: 'Vehicle V-003', quantity: 1 }],
    supplier: 'ToolMaster',
    lastRestocked: '2024-11-05',
    status: 'in_stock',
  },
  {
    id: 'P-008',
    sku: 'ZIP-500',
    name: 'Cable Ties',
    category: 'Accessories',
    description: '500 pack, assorted sizes',
    unitCost: 8,
    unitPrice: 15,
    totalStock: 25,
    minStock: 10,
    locations: [{ name: 'Warehouse', quantity: 15 }, { name: 'Vehicle V-001', quantity: 3 }, { name: 'Vehicle V-002', quantity: 3 }, { name: 'Vehicle V-003', quantity: 2 }, { name: 'Vehicle V-004', quantity: 2 }],
    supplier: 'GeneralSupply Co',
    lastRestocked: '2024-11-20',
    status: 'in_stock',
  },
]

const categories = ['All', 'Cables', 'Connectors', 'Networking', 'Tools', 'Accessories']

export default function PartsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)

  const filteredParts = parts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock': return isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
      case 'low_stock': return isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
      case 'out_of_stock': return isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
      default: return isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_stock': return 'In Stock'
      case 'low_stock': return 'Low Stock'
      case 'out_of_stock': return 'Out of Stock'
      default: return status
    }
  }

  const totalValue = parts.reduce((sum, p) => sum + (p.totalStock * p.unitCost), 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Parts & Spares</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage inventory items and stock levels</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>Add Part</span>
        </motion.button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{parts.length}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total SKUs</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>${totalValue.toLocaleString()}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Value</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{parts.filter(p => p.status === 'low_stock').length}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Low Stock</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-rose-600">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{parts.filter(p => p.status === 'out_of_stock').length}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Out of Stock</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className={`flex items-center gap-4 p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border`}>
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'} border focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={`px-4 py-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`px-4 py-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
        >
          <option value="all">All Status</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Parts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border overflow-hidden`}
      >
        <table className="w-full">
          <thead>
            <tr className={isDark ? 'bg-white/5' : 'bg-slate-50'}>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Item</th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Category</th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Stock</th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status</th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Cost</th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Price</th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Value</th>
              <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Locations</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
            {filteredParts.map((part, index) => (
              <motion.tr
                key={part.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedPart(part)}
                className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} cursor-pointer transition-colors`}
              >
                <td className="px-6 py-4">
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{part.name}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{part.sku}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                    {part.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{part.totalStock}</span>
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/ {part.minStock} min</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(part.status)}`}>
                    {getStatusLabel(part.status)}
                  </span>
                </td>
                <td className={`px-6 py-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  ${part.unitCost}
                </td>
                <td className={`px-6 py-4 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  ${part.unitPrice}
                </td>
                <td className={`px-6 py-4 font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  ${(part.totalStock * part.unitCost).toLocaleString()}
                </td>
                <td className={`px-6 py-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {part.locations.length} locations
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Part Detail Modal */}
      <AnimatePresence>
        {selectedPart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPart(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full max-w-lg rounded-2xl ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'} border p-6`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedPart.name}</h2>
                  <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedPart.sku}</p>
                </div>
                <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${getStatusBadge(selectedPart.status)}`}>
                  {getStatusLabel(selectedPart.status)}
                </span>
              </div>

              <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedPart.description}</p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedPart.totalStock}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Total Stock</p>
                </div>
                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>${selectedPart.unitCost}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Unit Cost</p>
                </div>
                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <p className={`text-xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>${selectedPart.unitPrice}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Unit Price</p>
                </div>
              </div>

              <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <h4 className={`text-sm font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <MapPin className="w-4 h-4" /> Stock by Location
                </h4>
                {selectedPart.locations.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPart.locations.map((loc, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{loc.name}</span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{loc.quantity} units</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No stock available</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Edit Item
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPart(null)}
                  className={`px-6 py-3 rounded-xl ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
