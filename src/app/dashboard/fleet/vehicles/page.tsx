'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/theme-context'
import {
  Car,
  Truck,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  MapPin,
  Fuel,
  Gauge,
  Calendar,
  User,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  Box,
  Ruler,
  Weight,
  Settings,
} from 'lucide-react'

interface Vehicle {
  id: string
  name: string
  brand: string
  model: string
  year: number
  type: 'van' | 'truck' | 'trailer' | 'car' | 'other'
  plate: string
  vin: string
  status: 'active' | 'maintenance' | 'idle' | 'retired'
  assignedTo: string | null
  fuelLevel: number
  mileage: number
  lastService: string
  nextService: string
  location: string
  dimensions: {
    length: number
    width: number
    height: number
  }
  capacity: {
    weight: number
    volume: number
  }
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid'
  avgMpg: number
  insuranceExpiry: string
  registrationExpiry: string
}

const vehicles: Vehicle[] = [
  {
    id: 'V-001',
    name: 'Transit 1',
    brand: 'Ford',
    model: 'Transit 250',
    year: 2022,
    type: 'van',
    plate: 'ABC-1234',
    vin: '1FTBW2CM5MKA12345',
    status: 'active',
    assignedTo: 'Mike Johnson',
    fuelLevel: 78,
    mileage: 45230,
    lastService: '2024-11-10',
    nextService: '2024-12-15',
    location: 'San Francisco',
    dimensions: { length: 236, width: 81, height: 84 },
    capacity: { weight: 3500, volume: 460 },
    fuelType: 'gasoline',
    avgMpg: 18,
    insuranceExpiry: '2025-06-15',
    registrationExpiry: '2025-03-20',
  },
  {
    id: 'V-002',
    name: 'ProMaster 1',
    brand: 'Ram',
    model: 'ProMaster 1500',
    year: 2023,
    type: 'van',
    plate: 'DEF-5678',
    vin: '3C6TRVAG8NE123456',
    status: 'active',
    assignedTo: 'Emily Williams',
    fuelLevel: 45,
    mileage: 32100,
    lastService: '2024-10-20',
    nextService: '2024-12-20',
    location: 'Oakland',
    dimensions: { length: 236, width: 76, height: 100 },
    capacity: { weight: 4000, volume: 420 },
    fuelType: 'diesel',
    avgMpg: 22,
    insuranceExpiry: '2025-04-10',
    registrationExpiry: '2025-05-15',
  },
  {
    id: 'V-003',
    name: 'Express 1',
    brand: 'Chevrolet',
    model: 'Express 2500',
    year: 2021,
    type: 'van',
    plate: 'GHI-9012',
    vin: '1GCWGAFG7M1234567',
    status: 'maintenance',
    assignedTo: null,
    fuelLevel: 90,
    mileage: 67500,
    lastService: '2024-11-25',
    nextService: '2025-01-25',
    location: 'Service Center',
    dimensions: { length: 224, width: 79, height: 84 },
    capacity: { weight: 3200, volume: 384 },
    fuelType: 'gasoline',
    avgMpg: 16,
    insuranceExpiry: '2025-02-28',
    registrationExpiry: '2025-01-10',
  },
  {
    id: 'V-004',
    name: 'F-150 Crew',
    brand: 'Ford',
    model: 'F-150 XLT',
    year: 2023,
    type: 'truck',
    plate: 'JKL-3456',
    vin: '1FTFW1E85NFA12345',
    status: 'active',
    assignedTo: 'David Brown',
    fuelLevel: 62,
    mileage: 28900,
    lastService: '2024-11-01',
    nextService: '2025-01-01',
    location: 'San Jose',
    dimensions: { length: 232, width: 80, height: 79 },
    capacity: { weight: 2300, volume: 77 },
    fuelType: 'gasoline',
    avgMpg: 20,
    insuranceExpiry: '2025-08-20',
    registrationExpiry: '2025-07-05',
  },
  {
    id: 'V-005',
    name: 'Sprinter 1',
    brand: 'Mercedes',
    model: 'Sprinter 2500',
    year: 2023,
    type: 'van',
    plate: 'MNO-7890',
    vin: 'WDAPF4CC5N1234567',
    status: 'idle',
    assignedTo: 'Sarah Lee',
    fuelLevel: 100,
    mileage: 15200,
    lastService: '2024-11-18',
    nextService: '2025-02-18',
    location: 'Depot',
    dimensions: { length: 274, width: 79, height: 110 },
    capacity: { weight: 4500, volume: 533 },
    fuelType: 'diesel',
    avgMpg: 24,
    insuranceExpiry: '2025-09-30',
    registrationExpiry: '2025-08-15',
  },
  {
    id: 'V-006',
    name: 'Utility Trailer',
    brand: 'Carry-On',
    model: '6x12 Enclosed',
    year: 2022,
    type: 'trailer',
    plate: 'TRL-0001',
    vin: '4YMUL1210NV123456',
    status: 'idle',
    assignedTo: null,
    fuelLevel: 0,
    mileage: 8500,
    lastService: '2024-09-15',
    nextService: '2025-03-15',
    location: 'Depot',
    dimensions: { length: 144, width: 72, height: 72 },
    capacity: { weight: 2990, volume: 320 },
    fuelType: 'gasoline',
    avgMpg: 0,
    insuranceExpiry: '2025-05-01',
    registrationExpiry: '2025-04-20',
  },
]

export default function VehiclesPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.plate.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus
    const matchesType = filterType === 'all' || v.type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-400'
      case 'maintenance': return 'bg-amber-400'
      case 'idle': return 'bg-slate-400'
      case 'retired': return 'bg-red-400'
      default: return 'bg-slate-400'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
      case 'maintenance': return isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
      case 'idle': return isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600'
      case 'retired': return isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
      default: return isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'van': return Truck
      case 'truck': return Truck
      case 'trailer': return Box
      default: return Car
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
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Vehicles</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage your fleet vehicles and their specifications</p>
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

      {/* Filters */}
      <div className={`flex items-center gap-4 p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border`}>
        <div className="flex-1 relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search vehicles..."
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
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="idle">Idle</option>
          <option value="retired">Retired</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`px-4 py-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
        >
          <option value="all">All Types</option>
          <option value="van">Van</option>
          <option value="truck">Truck</option>
          <option value="trailer">Trailer</option>
          <option value="car">Car</option>
        </select>
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredVehicles.map((vehicle, index) => {
          const TypeIcon = getTypeIcon(vehicle.type)
          return (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-5 rounded-2xl ${isDark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'} border cursor-pointer transition-all`}
              onClick={() => setSelectedVehicle(vehicle)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`relative p-3 rounded-xl ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                    <TypeIcon className={`w-6 h-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${isDark ? 'border-slate-800' : 'border-white'} ${getStatusColor(vehicle.status)}`} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{vehicle.brand} {vehicle.model}</h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{vehicle.name} • {vehicle.year}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${getStatusBadge(vehicle.status)}`}>
                  {vehicle.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>License Plate</div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{vehicle.plate}</div>
                </div>
                <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Mileage</div>
                  <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{vehicle.mileage.toLocaleString()} mi</div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className={`flex items-center justify-between text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span className="flex items-center gap-1"><Fuel className="w-3 h-3" /> Fuel</span>
                    <span>{vehicle.fuelLevel}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div className={`h-full rounded-full ${getFuelColor(vehicle.fuelLevel)}`} style={{ width: `${vehicle.fuelLevel}%` }} />
                  </div>
                </div>
              </div>

              <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {vehicle.assignedTo ? (
                    <>
                      <User className="w-4 h-4" />
                      <span>{vehicle.assignedTo}</span>
                    </>
                  ) : (
                    <span className="italic">Unassigned</span>
                  )}
                </div>
                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <MapPin className="w-4 h-4" />
                  <span>{vehicle.location}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Vehicle Detail Modal */}
      <AnimatePresence>
        {selectedVehicle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedVehicle(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'} border p-6`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedVehicle.brand} {selectedVehicle.model}
                  </h2>
                  <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {selectedVehicle.name} • {selectedVehicle.year} • {selectedVehicle.plate}
                  </p>
                </div>
                <span className={`px-3 py-1.5 text-sm font-medium rounded-full capitalize ${getStatusBadge(selectedVehicle.status)}`}>
                  {selectedVehicle.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <h4 className={`text-sm font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Ruler className="w-4 h-4" /> Dimensions (inches)
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedVehicle.dimensions.length}"</div>
                      <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Length</div>
                    </div>
                    <div>
                      <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedVehicle.dimensions.width}"</div>
                      <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Width</div>
                    </div>
                    <div>
                      <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedVehicle.dimensions.height}"</div>
                      <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Height</div>
                    </div>
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <h4 className={`text-sm font-medium mb-3 flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <Weight className="w-4 h-4" /> Capacity
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedVehicle.capacity.weight.toLocaleString()}</div>
                      <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>lbs Max</div>
                    </div>
                    <div>
                      <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedVehicle.capacity.volume}</div>
                      <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>cu ft</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <Gauge className={`w-5 h-5 mx-auto mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedVehicle.avgMpg} mpg</div>
                  <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Avg Efficiency</div>
                </div>
                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <Fuel className={`w-5 h-5 mx-auto mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <div className={`text-sm font-medium capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedVehicle.fuelType}</div>
                  <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Fuel Type</div>
                </div>
                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <Calendar className={`w-5 h-5 mx-auto mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedVehicle.nextService}</div>
                  <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Next Service</div>
                </div>
                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <MapPin className={`w-5 h-5 mx-auto mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedVehicle.location}</div>
                  <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Location</div>
                </div>
              </div>

              <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Vehicle Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>VIN</span>
                    <span className={`font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedVehicle.vin}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Type</span>
                    <span className={`capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedVehicle.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Insurance Expiry</span>
                    <span className={isDark ? 'text-white' : 'text-slate-900'}>{selectedVehicle.insuranceExpiry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Registration Expiry</span>
                    <span className={isDark ? 'text-white' : 'text-slate-900'}>{selectedVehicle.registrationExpiry}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Edit Vehicle
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-4 py-3 rounded-xl ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  <Settings className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedVehicle(null)}
                  className={`px-4 py-3 rounded-xl ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
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
