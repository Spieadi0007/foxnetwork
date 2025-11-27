'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTheme } from '@/contexts/theme-context'
import {
  Package,
  Box,
  Warehouse,
  MapPinned,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
  Search,
  DollarSign,
  Truck,
  CheckCircle2,
} from 'lucide-react'

const inventoryStats = [
  { label: 'Total SKUs', value: 248, icon: Package, color: 'from-violet-500 to-purple-600', trend: '+12' },
  { label: 'Total Value', value: '$45.8K', icon: DollarSign, color: 'from-emerald-500 to-teal-600', trend: '+8%' },
  { label: 'Low Stock Items', value: 14, icon: AlertTriangle, color: 'from-amber-500 to-orange-600', trend: '-3' },
  { label: 'Pending Orders', value: 6, icon: ShoppingCart, color: 'from-blue-500 to-cyan-600', trend: '+2' },
]

const modules = [
  {
    title: 'Parts & Spares',
    description: 'Manage inventory items, stock levels, and pricing',
    href: '/dashboard/inventory/parts',
    icon: Box,
    count: 248,
  },
  {
    title: 'Locations',
    description: 'Track inventory across warehouses, vehicles, and client sites',
    href: '/dashboard/inventory/locations',
    icon: MapPinned,
    count: 12,
  },
  {
    title: 'Orders',
    description: 'Manage purchase orders and restock requests',
    href: '/dashboard/inventory/orders',
    icon: ShoppingCart,
    count: 6,
  },
]

const lowStockItems = [
  { name: 'CAT6 Ethernet Cable (1000ft)', sku: 'CAB-CAT6-1000', current: 2, min: 5, location: 'Warehouse' },
  { name: 'RJ45 Connectors (100pk)', sku: 'CON-RJ45-100', current: 3, min: 10, location: 'Warehouse' },
  { name: 'Network Switch 24-Port', sku: 'SW-24P-GB', current: 1, min: 3, location: 'Warehouse' },
  { name: 'Patch Panel 48-Port', sku: 'PP-48P-CAT6', current: 2, min: 4, location: 'Warehouse' },
  { name: 'Cable Tester Pro', sku: 'TOOL-CTEST-P', current: 0, min: 2, location: 'Vehicle V-002' },
]

const recentMovements = [
  { item: 'Fiber Optic Cable (500ft)', type: 'out', quantity: 2, from: 'Warehouse', to: 'Vehicle V-001', time: '2 hours ago' },
  { item: 'Network Router', type: 'in', quantity: 5, from: 'Supplier', to: 'Warehouse', time: '5 hours ago' },
  { item: 'RJ45 Connectors (100pk)', type: 'out', quantity: 1, from: 'Vehicle V-003', to: 'Client Site - TechCorp', time: '1 day ago' },
  { item: 'Crimping Tool', type: 'transfer', quantity: 1, from: 'Vehicle V-002', to: 'Vehicle V-005', time: '1 day ago' },
  { item: 'Cable Ties (500pk)', type: 'in', quantity: 10, from: 'Supplier', to: 'Warehouse', time: '2 days ago' },
]

const locationSummary = [
  { name: 'Main Warehouse', type: 'warehouse', items: 186, value: 32500, icon: Warehouse },
  { name: 'Vehicle Fleet', type: 'vehicles', items: 48, value: 8900, icon: Truck },
  { name: 'Client Sites', type: 'client', items: 14, value: 4400, icon: MapPinned },
]

export default function InventoryPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Inventory Management</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Track parts, spares, and equipment across all locations</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>Add Item</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {inventoryStats.map((stat, index) => (
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
                <div className="flex items-baseline gap-2 mt-1">
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                  {stat.trend && (
                    <span className={`text-xs font-medium ${stat.trend.startsWith('+') ? 'text-emerald-400' : stat.trend.startsWith('-') ? 'text-amber-400' : 'text-slate-400'}`}>{stat.trend}</span>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modules */}
      <div className="grid grid-cols-3 gap-6">
        {modules.map((module, index) => (
          <Link key={module.title} href={module.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'} backdrop-blur-sm cursor-pointer group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                  <module.icon className="w-6 h-6 text-white" />
                </div>
                {module.count && (
                  <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{module.count}</span>
                )}
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{module.title}</h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{module.description}</p>
              <div className="flex items-center text-emerald-400 text-sm font-medium group-hover:gap-2 transition-all">
                <span>View {module.title}</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Location Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <MapPinned className="w-5 h-5 text-violet-400" />
            Inventory by Location
          </h3>
          <Link href="/dashboard/inventory/locations" className="text-sm text-emerald-400 hover:text-emerald-300">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {locationSummary.map((location, index) => (
            <motion.div
              key={location.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-white/10' : 'bg-white border border-slate-200'}`}>
                  <location.icon className={`w-5 h-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{location.name}</p>
                  <p className={`text-xs capitalize ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{location.type}</p>
                </div>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{location.items}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Items</p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>${location.value.toLocaleString()}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Value</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Low Stock Alerts
            </h3>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
              {lowStockItems.length} items
            </span>
          </div>

          <div className="space-y-3">
            {lowStockItems.map((item, index) => (
              <motion.div
                key={item.sku}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.6 }}
                className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}
              >
                <div className="flex-1">
                  <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.sku} • {item.location}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${item.current === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                    {item.current} / {item.min}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Current / Min</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full mt-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              isDark
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
            }`}
          >
            Create Restock Order
          </motion.button>
        </motion.div>

        {/* Recent Movements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Recent Movements
            </h3>
            <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Last 7 days</span>
          </div>

          <div className="space-y-3">
            {recentMovements.map((movement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.7 }}
                className="flex items-start gap-3"
              >
                <div className={`mt-0.5 p-1.5 rounded-full ${
                  movement.type === 'in'
                    ? isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                    : movement.type === 'out'
                      ? isDark ? 'bg-red-500/20' : 'bg-red-100'
                      : isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                }`}>
                  {movement.type === 'in' ? (
                    <TrendingUp className={`w-3 h-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                  ) : movement.type === 'out' ? (
                    <TrendingDown className={`w-3 h-3 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  ) : (
                    <ArrowRight className={`w-3 h-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <span className="font-medium">{movement.item}</span>
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}> x{movement.quantity}</span>
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    {movement.from} → {movement.to}
                  </p>
                </div>
                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{movement.time}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
