'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/theme-context'
import {
  ShoppingCart,
  Plus,
  Search,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  DollarSign,
  Calendar,
  Building2,
  FileText,
  ExternalLink,
} from 'lucide-react'

const orderStats = [
  { label: 'Pending Orders', value: 6, icon: Clock, color: 'from-amber-500 to-orange-600' },
  { label: 'In Transit', value: 3, icon: Truck, color: 'from-blue-500 to-cyan-600' },
  { label: 'Received (MTD)', value: 12, icon: CheckCircle2, color: 'from-emerald-500 to-teal-600' },
  { label: 'Total Spent (MTD)', value: '$8,450', icon: DollarSign, color: 'from-violet-500 to-purple-600' },
]

const orders = [
  {
    id: 'PO-2024-001',
    supplier: 'CableMax Supply',
    status: 'pending',
    orderDate: '2024-11-25',
    expectedDate: '2024-11-30',
    items: [
      { name: 'CAT6 Ethernet Cable (1000ft)', quantity: 10, unitPrice: 85, total: 850 },
      { name: 'RJ45 Connectors (100pk)', quantity: 20, unitPrice: 12, total: 240 },
    ],
    total: 1090,
    notes: 'Restock order for low inventory items',
  },
  {
    id: 'PO-2024-002',
    supplier: 'NetGear Pro',
    status: 'in_transit',
    orderDate: '2024-11-22',
    expectedDate: '2024-11-27',
    trackingNumber: 'UPS1Z999AA10123456784',
    items: [
      { name: 'Network Switch 24-Port', quantity: 5, unitPrice: 180, total: 900 },
      { name: 'Patch Panel 48-Port', quantity: 8, unitPrice: 45, total: 360 },
    ],
    total: 1260,
    notes: 'Scheduled delivery for main warehouse',
  },
  {
    id: 'PO-2024-003',
    supplier: 'ToolMaster',
    status: 'in_transit',
    orderDate: '2024-11-20',
    expectedDate: '2024-11-26',
    trackingNumber: 'FEDEX794644790030',
    items: [
      { name: 'Cable Tester Pro', quantity: 3, unitPrice: 65, total: 195 },
      { name: 'Crimping Tool Pro', quantity: 5, unitPrice: 35, total: 175 },
    ],
    total: 370,
    notes: 'Tools for new technician kits',
  },
  {
    id: 'PO-2024-004',
    supplier: 'FiberTech',
    status: 'pending',
    orderDate: '2024-11-24',
    expectedDate: '2024-12-02',
    items: [
      { name: 'Fiber Optic Cable SM (500ft)', quantity: 8, unitPrice: 220, total: 1760 },
    ],
    total: 1760,
    notes: 'Fiber cable for upcoming enterprise project',
  },
  {
    id: 'PO-2024-005',
    supplier: 'GeneralSupply Co',
    status: 'received',
    orderDate: '2024-11-15',
    receivedDate: '2024-11-20',
    items: [
      { name: 'Cable Ties (500pk)', quantity: 20, unitPrice: 8, total: 160 },
      { name: 'Velcro Straps (100pk)', quantity: 15, unitPrice: 12, total: 180 },
    ],
    total: 340,
    notes: 'Monthly consumables order',
  },
  {
    id: 'PO-2024-006',
    supplier: 'CableMax Supply',
    status: 'received',
    orderDate: '2024-11-10',
    receivedDate: '2024-11-15',
    items: [
      { name: 'CAT6 Ethernet Cable (1000ft)', quantity: 5, unitPrice: 85, total: 425 },
    ],
    total: 425,
    notes: 'Emergency restock',
  },
  {
    id: 'PO-2024-007',
    supplier: 'NetGear Pro',
    status: 'cancelled',
    orderDate: '2024-11-08',
    items: [
      { name: 'Network Router Enterprise', quantity: 2, unitPrice: 450, total: 900 },
    ],
    total: 900,
    notes: 'Cancelled - client changed requirements',
  },
]

export default function OrdersPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.supplier.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
      case 'in_transit': return isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
      case 'received': return isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
      case 'cancelled': return isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
      default: return isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'in_transit': return <Truck className="w-4 h-4" />
      case 'received': return <CheckCircle2 className="w-4 h-4" />
      case 'cancelled': return <AlertCircle className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'in_transit': return 'In Transit'
      case 'received': return 'Received'
      case 'cancelled': return 'Cancelled'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Purchase Orders</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage inventory orders and track shipments</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>Create Order</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {orderStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}
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

      {/* Filters */}
      <div className={`flex items-center gap-4 p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border`}>
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'} border focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`px-4 py-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_transit">In Transit</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order, index) => {
          const isExpanded = expandedOrder === order.id

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border overflow-hidden`}
            >
              <div
                className={`p-5 cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-colors`}
                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                      <ShoppingCart className={`w-5 h-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{order.id}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadge(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <div className={`flex items-center gap-3 text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5" />
                          {order.supplier}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {order.orderDate}
                        </span>
                        <span>{order.items.length} items</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {order.status === 'in_transit' && order.trackingNumber && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(`https://www.google.com/search?q=${order.trackingNumber}`, '_blank')
                        }}
                        className={`flex items-center gap-1 text-sm ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                      >
                        <Truck className="w-4 h-4" />
                        Track
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                    <div className="text-right">
                      <p className={`text-xl font-bold ${order.status === 'cancelled' ? isDark ? 'text-slate-500 line-through' : 'text-slate-400 line-through' : isDark ? 'text-white' : 'text-slate-900'}`}>
                        ${order.total.toLocaleString()}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {order.status === 'received' ? `Received ${order.receivedDate}` : `Expected ${order.expectedDate}`}
                      </p>
                    </div>
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
                    <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Order Items</h4>
                    <div className={`rounded-xl overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <table className="w-full">
                        <thead>
                          <tr className={isDark ? 'bg-white/5' : 'bg-slate-100'}>
                            <th className={`px-4 py-2 text-left text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Item</th>
                            <th className={`px-4 py-2 text-center text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Qty</th>
                            <th className={`px-4 py-2 text-right text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Unit Price</th>
                            <th className={`px-4 py-2 text-right text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-200'}`}>
                          {order.items.map((item, i) => (
                            <tr key={i}>
                              <td className={`px-4 py-3 text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</td>
                              <td className={`px-4 py-3 text-sm text-center ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.quantity}</td>
                              <td className={`px-4 py-3 text-sm text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>${item.unitPrice}</td>
                              <td className={`px-4 py-3 text-sm text-right font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>${item.total}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className={isDark ? 'bg-white/5' : 'bg-slate-100'}>
                            <td colSpan={3} className={`px-4 py-3 text-sm text-right font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Total</td>
                            <td className={`px-4 py-3 text-sm text-right font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>${order.total.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {order.notes && (
                      <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                        <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Notes</p>
                        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{order.notes}</p>
                      </div>
                    )}

                    {order.trackingNumber && (
                      <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                        <p className={`text-xs font-medium mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Tracking Number</p>
                        <p className={`text-sm font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{order.trackingNumber}</p>
                      </div>
                    )}

                    <div className={`flex items-center justify-end gap-3 mt-4 pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                      >
                        <FileText className="w-4 h-4" />
                        View Invoice
                      </motion.button>
                      {order.status === 'in_transit' && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Mark Received
                        </motion.button>
                      )}
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
