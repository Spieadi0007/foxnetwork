'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTheme } from '@/contexts/theme-context'
import {
  Car,
  Truck,
  Wrench,
  Fuel,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Plus,
  MapPin,
  Calendar,
  Gauge,
  Battery,
} from 'lucide-react'

const fleetStats = [
  { label: 'Total Vehicles', value: 18, icon: Car, color: 'from-violet-500 to-purple-600', trend: '+2' },
  { label: 'Active Now', value: 12, icon: Truck, color: 'from-emerald-500 to-teal-600', trend: null },
  { label: 'In Maintenance', value: 3, icon: Wrench, color: 'from-amber-500 to-orange-600', trend: '-1' },
  { label: 'Avg Fuel Efficiency', value: '24 mpg', icon: Fuel, color: 'from-blue-500 to-cyan-600', trend: '+2.3' },
]

const vehicles = [
  { id: 'V-001', name: 'Ford Transit 250', type: 'Van', plate: 'ABC-1234', status: 'active', driver: 'Mike Johnson', fuel: 78, mileage: '45,230 mi', lastService: '2 weeks ago', location: 'San Francisco' },
  { id: 'V-002', name: 'Ram ProMaster 1500', type: 'Van', plate: 'DEF-5678', status: 'active', driver: 'Emily Williams', fuel: 45, mileage: '32,100 mi', lastService: '1 month ago', location: 'Oakland' },
  { id: 'V-003', name: 'Chevrolet Express 2500', type: 'Van', plate: 'GHI-9012', status: 'maintenance', driver: 'Unassigned', fuel: 90, mileage: '67,500 mi', lastService: 'Today', location: 'Service Center' },
  { id: 'V-004', name: 'Ford F-150', type: 'Truck', plate: 'JKL-3456', status: 'active', driver: 'David Brown', fuel: 62, mileage: '28,900 mi', lastService: '3 weeks ago', location: 'San Jose' },
  { id: 'V-005', name: 'Mercedes Sprinter', type: 'Van', plate: 'MNO-7890', status: 'idle', driver: 'Sarah Lee', fuel: 100, mileage: '15,200 mi', lastService: '1 week ago', location: 'Depot' },
]

const upcomingMaintenance = [
  { vehicle: 'Ford Transit 250', type: 'Oil Change', dueDate: 'In 3 days', priority: 'medium' },
  { vehicle: 'Ram ProMaster 1500', type: 'Tire Rotation', dueDate: 'In 1 week', priority: 'low' },
  { vehicle: 'Ford F-150', type: 'Brake Inspection', dueDate: 'In 5 days', priority: 'high' },
]

const modules = [
  {
    title: 'Vehicles',
    description: 'Manage all vehicles, specs, and assignments',
    href: '/dashboard/fleet/vehicles',
    icon: Truck,
    count: 18,
  },
  {
    title: 'Maintenance',
    description: 'Track service schedules and repairs',
    href: '/dashboard/fleet/maintenance',
    icon: Wrench,
    count: 3,
  },
  {
    title: 'Fuel Log',
    description: 'Monitor fuel consumption and costs',
    href: '/dashboard/fleet/fuel',
    icon: Fuel,
    count: null,
  },
]

export default function FleetPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-400'
      case 'maintenance': return 'bg-amber-400'
      case 'idle': return 'bg-slate-400'
      default: return 'bg-slate-400'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
      case 'maintenance': return isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
      case 'idle': return isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600'
      default: return isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600'
    }
  }

  const getFuelColor = (fuel: number) => {
    if (fuel > 60) return 'bg-emerald-500'
    if (fuel > 30) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Fleet Management</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Track and manage your vehicles, maintenance, and fuel</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>Add Vehicle</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {fleetStats.map((stat, index) => (
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
                    <span className={`text-xs font-medium ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-amber-400'}`}>{stat.trend}</span>
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

      <div className="grid grid-cols-3 gap-6">
        {/* Vehicle List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`col-span-2 p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Car className="w-5 h-5 text-violet-400" />
              Vehicle Overview
            </h3>
            <Link href="/dashboard/fleet/vehicles" className="text-sm text-emerald-400 hover:text-emerald-300">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {vehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
                className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'} transition-colors`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-white border border-slate-200'}`}>
                      {vehicle.type === 'Van' ? (
                        <Truck className={`w-6 h-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                      ) : (
                        <Car className={`w-6 h-6 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
                      )}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${isDark ? 'border-slate-800' : 'border-white'} ${getStatusColor(vehicle.status)}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{vehicle.name}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${getStatusBadge(vehicle.status)}`}>
                        {vehicle.status}
                      </span>
                    </div>
                    <div className={`flex items-center gap-3 text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>{vehicle.plate}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {vehicle.location}
                      </span>
                      <span>{vehicle.driver}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Fuel className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      <div className={`w-16 h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <div
                          className={`h-full rounded-full ${getFuelColor(vehicle.fuel)}`}
                          style={{ width: `${vehicle.fuel}%` }}
                        />
                      </div>
                      <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{vehicle.fuel}%</span>
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{vehicle.mileage}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Maintenance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <Wrench className="w-5 h-5 text-amber-400" />
              Upcoming Service
            </h3>
            <Link href="/dashboard/fleet/maintenance" className="text-sm text-emerald-400 hover:text-emerald-300">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingMaintenance.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.6 }}
                className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.vehicle}</p>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    item.priority === 'high'
                      ? isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                      : item.priority === 'medium'
                        ? isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                        : isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.priority}
                  </span>
                </div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{item.type}</p>
                <div className={`flex items-center gap-1 mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  <Calendar className="w-3 h-3" />
                  {item.dueDate}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full mt-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              isDark
                ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Schedule Maintenance
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
