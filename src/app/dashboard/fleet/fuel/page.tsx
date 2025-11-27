'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/theme-context'
import {
  Fuel,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Gauge,
  Truck,
  Calendar,
  MapPin,
  BarChart3,
} from 'lucide-react'

const fuelStats = [
  { label: 'Total Gallons (MTD)', value: '1,245', icon: Fuel, color: 'from-blue-500 to-cyan-600', trend: '+8%' },
  { label: 'Total Cost (MTD)', value: '$4,980', icon: DollarSign, color: 'from-emerald-500 to-teal-600', trend: '+12%' },
  { label: 'Avg Price/Gallon', value: '$4.00', icon: TrendingUp, color: 'from-amber-500 to-orange-600', trend: '+$0.15' },
  { label: 'Fleet Avg MPG', value: '19.2', icon: Gauge, color: 'from-violet-500 to-purple-600', trend: '+0.8' },
]

const fuelEntries = [
  { id: 'F-001', vehicle: 'Ford Transit 250', plate: 'ABC-1234', driver: 'Mike Johnson', date: '2024-11-25', gallons: 18.5, pricePerGallon: 4.05, total: 74.93, odometer: 45230, station: 'Shell - Market St', location: 'San Francisco' },
  { id: 'F-002', vehicle: 'Ram ProMaster 1500', plate: 'DEF-5678', driver: 'Emily Williams', date: '2024-11-24', gallons: 22.3, pricePerGallon: 3.98, total: 88.75, odometer: 32100, station: 'Chevron - Broadway', location: 'Oakland' },
  { id: 'F-003', vehicle: 'Ford F-150', plate: 'JKL-3456', driver: 'David Brown', date: '2024-11-24', gallons: 20.1, pricePerGallon: 4.12, total: 82.81, odometer: 28900, station: 'Arco - First St', location: 'San Jose' },
  { id: 'F-004', vehicle: 'Mercedes Sprinter', plate: 'MNO-7890', driver: 'Sarah Lee', date: '2024-11-23', gallons: 25.0, pricePerGallon: 4.25, total: 106.25, odometer: 15200, station: 'Shell - El Camino', location: 'Palo Alto' },
  { id: 'F-005', vehicle: 'Ford Transit 250', plate: 'ABC-1234', driver: 'Mike Johnson', date: '2024-11-22', gallons: 17.8, pricePerGallon: 4.02, total: 71.56, odometer: 44950, station: 'Costco Gas', location: 'San Francisco' },
  { id: 'F-006', vehicle: 'Chevrolet Express 2500', plate: 'GHI-9012', driver: 'James Wilson', date: '2024-11-22', gallons: 21.5, pricePerGallon: 3.95, total: 84.93, odometer: 67200, station: '76 - Mission Blvd', location: 'Fremont' },
  { id: 'F-007', vehicle: 'Ram ProMaster 1500', plate: 'DEF-5678', driver: 'Emily Williams', date: '2024-11-21', gallons: 19.7, pricePerGallon: 4.08, total: 80.38, odometer: 31800, station: 'Shell - Broadway', location: 'Oakland' },
  { id: 'F-008', vehicle: 'Ford F-150', plate: 'JKL-3456', driver: 'David Brown', date: '2024-11-20', gallons: 18.9, pricePerGallon: 4.15, total: 78.44, odometer: 28600, station: 'Chevron - Almaden', location: 'San Jose' },
]

const vehicleFuelSummary = [
  { vehicle: 'Ford Transit 250', totalGallons: 156, totalCost: 624, avgMpg: 18.2, fillups: 8 },
  { vehicle: 'Ram ProMaster 1500', totalGallons: 178, totalCost: 712, avgMpg: 22.1, fillups: 9 },
  { vehicle: 'Chevrolet Express 2500', totalGallons: 198, totalCost: 782, avgMpg: 16.4, fillups: 10 },
  { vehicle: 'Ford F-150', totalGallons: 142, totalCost: 584, avgMpg: 20.5, fillups: 7 },
  { vehicle: 'Mercedes Sprinter', totalGallons: 125, totalCost: 531, avgMpg: 24.2, fillups: 5 },
]

export default function FuelPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [view, setView] = useState<'log' | 'summary'>('log')

  const filteredEntries = fuelEntries.filter(e =>
    e.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.plate.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Fuel Log</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Track fuel consumption and costs across your fleet</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>Add Entry</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {fuelStats.map((stat, index) => (
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
                    <span className={`text-xs font-medium ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{stat.trend}</span>
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

      {/* View Toggle & Filters */}
      <div className={`flex items-center justify-between gap-4 p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border`}>
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search by vehicle, driver, or plate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'} border focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
          />
        </div>
        <div className={`flex items-center p-1 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
          <button
            onClick={() => setView('log')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'log'
              ? isDark ? 'bg-white/10 text-white' : 'bg-white text-slate-900 shadow-sm'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Fuel Log
          </button>
          <button
            onClick={() => setView('summary')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'summary'
              ? isDark ? 'bg-white/10 text-white' : 'bg-white text-slate-900 shadow-sm'
              : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Vehicle Summary
          </button>
        </div>
      </div>

      {view === 'log' ? (
        /* Fuel Log Table */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border overflow-hidden`}
        >
          <table className="w-full">
            <thead>
              <tr className={isDark ? 'bg-white/5' : 'bg-slate-50'}>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Vehicle</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Driver</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Date</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Gallons</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Price/Gal</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Odometer</th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Station</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
              {filteredEntries.map((entry, index) => (
                <motion.tr
                  key={entry.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} cursor-pointer transition-colors`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                        <Truck className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                      </div>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{entry.vehicle}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{entry.plate}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {entry.driver}
                  </td>
                  <td className={`px-6 py-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {entry.date}
                  </td>
                  <td className={`px-6 py-4 font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {entry.gallons} gal
                  </td>
                  <td className={`px-6 py-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    ${entry.pricePerGallon.toFixed(2)}
                  </td>
                  <td className={`px-6 py-4 font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    ${entry.total.toFixed(2)}
                  </td>
                  <td className={`px-6 py-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {entry.odometer.toLocaleString()} mi
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{entry.station}</p>
                      <p className={`text-xs flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        <MapPin className="w-3 h-3" />
                        {entry.location}
                      </p>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      ) : (
        /* Vehicle Summary Cards */
        <div className="grid grid-cols-2 gap-4">
          {vehicleFuelSummary.map((vehicle, index) => (
            <motion.div
              key={vehicle.vehicle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-5 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                    <Truck className={`w-5 h-5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{vehicle.vehicle}</h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{vehicle.fillups} fill-ups this month</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <Fuel className={`w-5 h-5 mx-auto mb-1 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{vehicle.totalGallons}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Gallons</p>
                </div>
                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <DollarSign className={`w-5 h-5 mx-auto mb-1 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>${vehicle.totalCost}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Total Cost</p>
                </div>
                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <Gauge className={`w-5 h-5 mx-auto mb-1 ${isDark ? 'text-violet-400' : 'text-violet-500'}`} />
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{vehicle.avgMpg}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Avg MPG</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
