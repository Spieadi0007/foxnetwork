'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Plus,
  Edit3,
  Trash2,
  Search,
  DollarSign,
  Clock,
  Package,
  Tag,
  MoreHorizontal,
  ChevronDown,
  Check,
  XCircle,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface RateCard {
  id: string
  name: string
  description: string
  category: 'labor' | 'materials' | 'equipment' | 'service'
  unit: string
  rate: number
  isActive: boolean
  lastUpdated: string
}

const mockRateCards: RateCard[] = [
  { id: 'RC-001', name: 'Standard Labor Rate', description: 'Regular technician hourly rate', category: 'labor', unit: 'hour', rate: 75, isActive: true, lastUpdated: '2025-11-01' },
  { id: 'RC-002', name: 'Senior Tech Rate', description: 'Senior technician hourly rate', category: 'labor', unit: 'hour', rate: 95, isActive: true, lastUpdated: '2025-11-01' },
  { id: 'RC-003', name: 'Emergency Rate', description: 'After-hours emergency service', category: 'labor', unit: 'hour', rate: 150, isActive: true, lastUpdated: '2025-11-01' },
  { id: 'RC-004', name: 'Cat6 Cable', description: 'Category 6 ethernet cable', category: 'materials', unit: 'foot', rate: 1.5, isActive: true, lastUpdated: '2025-10-15' },
  { id: 'RC-005', name: 'Fiber Optic Cable', description: 'Single-mode fiber optic cable', category: 'materials', unit: 'foot', rate: 3.25, isActive: true, lastUpdated: '2025-10-15' },
  { id: 'RC-006', name: 'Network Switch', description: '24-port managed network switch', category: 'equipment', unit: 'unit', rate: 450, isActive: true, lastUpdated: '2025-09-20' },
  { id: 'RC-007', name: 'Security Camera', description: 'IP security camera with night vision', category: 'equipment', unit: 'unit', rate: 350, isActive: true, lastUpdated: '2025-09-20' },
  { id: 'RC-008', name: 'Site Survey', description: 'Pre-installation site assessment', category: 'service', unit: 'visit', rate: 250, isActive: true, lastUpdated: '2025-11-10' },
]

const categoryConfig = {
  labor: { label: 'Labor', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', icon: Clock },
  materials: { label: 'Materials', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Package },
  equipment: { label: 'Equipment', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CreditCard },
  service: { label: 'Service', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Tag },
}

export default function RateCardsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedRate, setSelectedRate] = useState<RateCard | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filteredRates = mockRateCards.filter(rate => {
    const matchesSearch = rate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rate.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || rate.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const groupedRates = filteredRates.reduce((acc, rate) => {
    if (!acc[rate.category]) acc[rate.category] = []
    acc[rate.category].push(rate)
    return acc
  }, {} as Record<string, RateCard[]>)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Rate Cards</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage service rates and pricing</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>Add Rate</span>
        </motion.button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search rates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-sm'} border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all`}
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'} border rounded-xl text-sm transition-all`}
          >
            <Tag className="w-4 h-4" />
            <span>Category</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`absolute top-full mt-2 left-0 w-48 p-2 ${isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200 shadow-lg'} border rounded-xl z-10`}
              >
                <button
                  onClick={() => { setCategoryFilter('all'); setShowFilters(false) }}
                  className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${categoryFilter === 'all' ? 'bg-emerald-500/20 text-emerald-400' : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  All Categories
                </button>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => { setCategoryFilter(key); setShowFilters(false) }}
                    className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors flex items-center gap-2 ${categoryFilter === key ? 'bg-emerald-500/20 text-emerald-400' : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`}
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

      {/* Rate Cards Grid */}
      <div className="space-y-8">
        {Object.entries(groupedRates).map(([category, rates]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-4">
              {(() => {
                const config = categoryConfig[category as keyof typeof categoryConfig]
                const Icon = config.icon
                return (
                  <>
                    <div className={`p-1.5 rounded-lg ${config.color.split(' ')[0]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{config.label}</h3>
                    <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>({rates.length})</span>
                  </>
                )
              })()}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {rates.map((rate, index) => (
                <motion.div
                  key={rate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedRate(rate)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    selectedRate?.id === rate.id
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{rate.name}</h4>
                      <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{rate.description}</p>
                    </div>
                    <button className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>${rate.rate}</p>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>per {rate.unit}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs ${rate.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                      {rate.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal (simplified) */}
      <AnimatePresence>
        {selectedRate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setSelectedRate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md p-6 rounded-2xl ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'} border`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Edit Rate</h3>
                <button
                  onClick={() => setSelectedRate(null)}
                  className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Name</label>
                  <input
                    type="text"
                    defaultValue={selectedRate.name}
                    className={`w-full px-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Description</label>
                  <input
                    type="text"
                    defaultValue={selectedRate.description}
                    className={`w-full px-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Rate</label>
                    <div className="relative">
                      <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      <input
                        type="number"
                        defaultValue={selectedRate.rate}
                        className={`w-full pl-9 pr-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Unit</label>
                    <input
                      type="text"
                      defaultValue={selectedRate.unit}
                      className={`w-full px-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </motion.button>
                <button
                  onClick={() => setSelectedRate(null)}
                  className={`px-4 py-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'} border font-medium`}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
