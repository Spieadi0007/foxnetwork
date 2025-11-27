'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck,
  MapPin,
  Clock,
  Navigation,
  Sparkles,
  RefreshCcw,
  ChevronDown,
  Play,
  Pause,
  Check,
  AlertTriangle,
  Fuel,
  Route,
  Timer,
  ArrowRight,
  Zap,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface RouteStop {
  id: string
  workOrderId: string
  title: string
  address: string
  estimatedArrival: string
  duration: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'normal' | 'high' | 'urgent'
}

interface TechnicianRoute {
  id: string
  technicianName: string
  technicianAvatar: string
  vehicle: string
  status: 'active' | 'paused' | 'completed'
  totalDistance: string
  totalDuration: string
  fuelEfficiency: string
  stops: RouteStop[]
}

const mockRoutes: TechnicianRoute[] = [
  {
    id: 'R1',
    technicianName: 'Mike Johnson',
    technicianAvatar: 'M',
    vehicle: 'Van #102',
    status: 'active',
    totalDistance: '45.2 mi',
    totalDuration: '4h 30m',
    fuelEfficiency: '92%',
    stops: [
      { id: 'S1', workOrderId: 'WO-001', title: 'Network Installation', address: '123 Business Ave, SF', estimatedArrival: '09:00 AM', duration: '4h', status: 'in_progress', priority: 'high' },
      { id: 'S2', workOrderId: 'WO-008', title: 'Cable Inspection', address: '456 Market St, SF', estimatedArrival: '01:30 PM', duration: '1h', status: 'pending', priority: 'normal' },
      { id: 'S3', workOrderId: 'WO-009', title: 'Equipment Delivery', address: '789 Howard St, SF', estimatedArrival: '03:00 PM', duration: '30m', status: 'pending', priority: 'normal' },
    ],
  },
  {
    id: 'R2',
    technicianName: 'Emily Williams',
    technicianAvatar: 'E',
    vehicle: 'Van #105',
    status: 'active',
    totalDistance: '38.7 mi',
    totalDuration: '6h 15m',
    fuelEfficiency: '88%',
    stops: [
      { id: 'S4', workOrderId: 'WO-003', title: 'Security Camera Setup', address: '789 Financial District, Oakland', estimatedArrival: '08:00 AM', duration: '6h', status: 'in_progress', priority: 'urgent' },
    ],
  },
  {
    id: 'R3',
    technicianName: 'David Brown',
    technicianAvatar: 'D',
    vehicle: 'Van #108',
    status: 'paused',
    totalDistance: '22.1 mi',
    totalDuration: '3h 00m',
    fuelEfficiency: '95%',
    stops: [
      { id: 'S5', workOrderId: 'WO-010', title: 'WiFi Troubleshooting', address: '321 Castro St, SF', estimatedArrival: '10:00 AM', duration: '1h', status: 'completed', priority: 'normal' },
      { id: 'S6', workOrderId: 'WO-011', title: 'Router Replacement', address: '654 Valencia St, SF', estimatedArrival: '11:30 AM', duration: '2h', status: 'pending', priority: 'high' },
    ],
  },
]

const statusColors = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  completed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

const priorityColors = {
  normal: 'bg-slate-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
}

export default function RoutingPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [selectedRoute, setSelectedRoute] = useState<TechnicianRoute | null>(mockRoutes[0])
  const [isOptimizing, setIsOptimizing] = useState(false)

  const handleOptimize = () => {
    setIsOptimizing(true)
    setTimeout(() => setIsOptimizing(false), 2000)
  }

  const stats = {
    activeRoutes: mockRoutes.filter(r => r.status === 'active').length,
    totalStops: mockRoutes.reduce((acc, r) => acc + r.stops.length, 0),
    completedStops: mockRoutes.reduce((acc, r) => acc + r.stops.filter(s => s.status === 'completed').length, 0),
    avgEfficiency: '91%',
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Route Optimization</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>AI-powered routing for maximum efficiency</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            <RefreshCcw className="w-4 h-4" />
            <span>Recalculate</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium shadow-lg shadow-violet-500/25 disabled:opacity-50"
          >
            {isOptimizing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <RefreshCcw className="w-5 h-5" />
                </motion.div>
                <span>Optimizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>AI Optimize All</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Routes', value: stats.activeRoutes, icon: Route, color: 'from-emerald-500 to-teal-500' },
          { label: 'Total Stops', value: stats.totalStops, icon: MapPin, color: 'from-violet-500 to-purple-500' },
          { label: 'Completed', value: stats.completedStops, icon: Check, color: 'from-blue-500 to-cyan-500' },
          { label: 'Avg Efficiency', value: stats.avgEfficiency, icon: Zap, color: 'from-amber-500 to-orange-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-2xl border backdrop-blur-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
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

      <div className="flex gap-6">
        {/* Routes List */}
        <div className="w-96 space-y-3">
          {mockRoutes.map((route) => (
            <motion.button
              key={route.id}
              onClick={() => setSelectedRoute(route)}
              whileHover={{ x: 4 }}
              className={`w-full p-4 rounded-2xl text-left transition-all ${
                selectedRoute?.id === route.id
                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                  : isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-slate-200 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <span className="text-white font-bold">{route.technicianAvatar}</span>
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{route.technicianName}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{route.vehicle}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-lg text-xs font-medium border capitalize ${statusColors[route.status]}`}>
                  {route.status}
                </span>
              </div>

              <div className={`flex items-center gap-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {route.stops.length} stops
                </span>
                <span className="flex items-center gap-1">
                  <Navigation className="w-4 h-4" />
                  {route.totalDistance}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {route.totalDuration}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(route.stops.filter(s => s.status === 'completed').length / route.stops.length) * 100}%` }}
                  />
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Route Details / Map */}
        <div className="flex-1 space-y-4">
          {/* Map Placeholder */}
          <div className={`h-[300px] rounded-2xl border overflow-hidden relative ${isDark ? 'bg-slate-800/50 border-white/10' : 'bg-slate-100 border-slate-200 shadow-sm'}`}>
            <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-100 to-slate-200'}`}>
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />

              {/* Route visualization */}
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="routeLine" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
                <motion.path
                  d="M 50 250 Q 150 200 200 150 T 350 100 T 500 120"
                  stroke="url(#routeLine)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2 }}
                />
              </svg>

              {/* Stop markers */}
              {selectedRoute?.stops.map((stop, index) => (
                <motion.div
                  key={stop.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className="absolute"
                  style={{
                    left: `${15 + index * 30}%`,
                    top: `${60 - index * 15}%`,
                  }}
                >
                  <div className={`p-2 rounded-full ${stop.status === 'completed' ? 'bg-emerald-500' : stop.status === 'in_progress' ? 'bg-violet-500' : 'bg-slate-500'} shadow-lg`}>
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-white font-medium whitespace-nowrap">
                    {index + 1}
                  </span>
                </motion.div>
              ))}

              {/* Truck marker */}
              <motion.div
                className="absolute"
                initial={{ left: '10%', top: '70%' }}
                animate={{ left: '25%', top: '55%' }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
              >
                <div className="p-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50">
                  <Truck className="w-5 h-5 text-white" />
                </div>
              </motion.div>
            </div>

            {/* Route Info Overlay */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between">
              <div className={`px-4 py-2 rounded-xl border backdrop-blur-sm ${isDark ? 'bg-slate-900/90 border-white/10' : 'bg-white/90 border-slate-200'}`}>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-emerald-400" />
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedRoute?.fuelEfficiency} efficiency</span>
                  </div>
                  <div className={`w-px h-4 ${isDark ? 'bg-white/20' : 'bg-slate-300'}`} />
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-violet-400" />
                    <span className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedRoute?.totalDuration} total</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stops List */}
          <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Route Stops</h3>
              <button className="text-sm text-emerald-400 hover:text-emerald-300">Reorder</button>
            </div>

            <div className="space-y-3">
              {selectedRoute?.stops.map((stop, index) => (
                <motion.div
                  key={stop.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border ${
                    stop.status === 'in_progress'
                      ? 'bg-violet-500/10 border-violet-500/30'
                      : stop.status === 'completed'
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        stop.status === 'completed' ? 'bg-emerald-500 text-white' :
                        stop.status === 'in_progress' ? 'bg-violet-500 text-white' :
                        isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {stop.status === 'completed' ? <Check className="w-4 h-4" /> : index + 1}
                      </div>
                      {index < (selectedRoute?.stops.length || 0) - 1 && (
                        <div className={`w-0.5 h-8 mt-2 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{stop.title}</h4>
                          <div className={`w-2 h-2 rounded-full ${priorityColors[stop.priority]}`} />
                        </div>
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stop.workOrderId}</span>
                      </div>
                      <p className={`text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stop.address}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          <Clock className="w-3 h-3" />
                          {stop.estimatedArrival}
                        </span>
                        <span className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          <Timer className="w-3 h-3" />
                          {stop.duration}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs capitalize ${
                          stop.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          stop.status === 'in_progress' ? 'bg-violet-500/20 text-violet-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {stop.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                      <Navigation className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
