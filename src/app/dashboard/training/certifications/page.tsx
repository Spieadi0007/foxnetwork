'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Award,
  Search,
  Filter,
  Plus,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  Download,
  Eye,
  RefreshCcw,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface Certification {
  id: string
  name: string
  technician: string
  issuer: string
  issueDate: string
  expiryDate: string
  status: 'active' | 'expiring_soon' | 'expired' | 'pending'
  category: 'technical' | 'safety' | 'industry'
}

const mockCertifications: Certification[] = [
  { id: 'CERT-001', name: 'BICSI Installer Level 1', technician: 'Mike Johnson', issuer: 'BICSI', issueDate: '2024-03-15', expiryDate: '2027-03-15', status: 'active', category: 'technical' },
  { id: 'CERT-002', name: 'CompTIA Network+', technician: 'Mike Johnson', issuer: 'CompTIA', issueDate: '2023-06-20', expiryDate: '2026-06-20', status: 'active', category: 'technical' },
  { id: 'CERT-003', name: 'OSHA 30-Hour', technician: 'Emily Williams', issuer: 'OSHA', issueDate: '2024-01-10', expiryDate: '2025-01-10', status: 'expiring_soon', category: 'safety' },
  { id: 'CERT-004', name: 'Cisco CCNA', technician: 'David Brown', issuer: 'Cisco', issueDate: '2022-08-05', expiryDate: '2025-08-05', status: 'active', category: 'technical' },
  { id: 'CERT-005', name: 'Safety First Aid', technician: 'Sarah Lee', issuer: 'Red Cross', issueDate: '2023-11-20', expiryDate: '2025-11-20', status: 'expiring_soon', category: 'safety' },
  { id: 'CERT-006', name: 'BICSI Technician', technician: 'Sarah Lee', issuer: 'BICSI', issueDate: '2024-05-01', expiryDate: '2027-05-01', status: 'active', category: 'industry' },
  { id: 'CERT-007', name: 'ASIS CPP', technician: 'Emily Williams', issuer: 'ASIS International', issueDate: '2023-02-15', expiryDate: '2024-11-15', status: 'expired', category: 'industry' },
  { id: 'CERT-008', name: 'CompTIA Security+', technician: 'James Wilson', issuer: 'CompTIA', issueDate: '2024-09-01', expiryDate: '2027-09-01', status: 'pending', category: 'technical' },
]

const statusConfig = {
  active: { label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  expiring_soon: { label: 'Expiring Soon', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock },
  expired: { label: 'Expired', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertCircle },
  pending: { label: 'Pending', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock },
}

const categoryConfig = {
  technical: { label: 'Technical', color: 'bg-violet-500/20 text-violet-400' },
  safety: { label: 'Safety', color: 'bg-red-500/20 text-red-400' },
  industry: { label: 'Industry', color: 'bg-blue-500/20 text-blue-400' },
}

export default function CertificationsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  const filteredCertifications = mockCertifications.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.technician.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: mockCertifications.length,
    active: mockCertifications.filter(c => c.status === 'active').length,
    expiring: mockCertifications.filter(c => c.status === 'expiring_soon').length,
    expired: mockCertifications.filter(c => c.status === 'expired').length,
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Certifications</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Track and manage team certifications</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium shadow-lg shadow-amber-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>Add Certification</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-white', bg: 'bg-white/5' },
          { label: 'Active', value: stats.active, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Expiring Soon', value: stats.expiring, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Expired', value: stats.expired, color: 'text-red-400', bg: 'bg-red-500/10' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-2xl border ${stat.bg} ${isDark ? 'border-white/10' : 'border-slate-200 shadow-sm'}`}
          >
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search certifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            <Filter className="w-4 h-4" />
            <span>Status</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`absolute top-full mt-2 left-0 w-48 p-2 border rounded-xl shadow-xl z-10 ${isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'}`}
            >
              <button
                onClick={() => { setStatusFilter('all'); setShowFilters(false) }}
                className={`w-full px-3 py-2 text-left text-sm rounded-lg ${statusFilter === 'all' ? 'bg-emerald-500/20 text-emerald-400' : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                All Status
              </button>
              {Object.entries(statusConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => { setStatusFilter(key); setShowFilters(false) }}
                  className={`w-full px-3 py-2 text-left text-sm rounded-lg flex items-center gap-2 ${statusFilter === key ? 'bg-emerald-500/20 text-emerald-400' : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <config.icon className="w-4 h-4" />
                  {config.label}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Certifications Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
      >
        <table className="w-full">
          <thead>
            <tr className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <th className={`text-left py-4 px-6 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Certification</th>
              <th className={`text-left py-4 px-6 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Technician</th>
              <th className={`text-left py-4 px-6 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Category</th>
              <th className={`text-left py-4 px-6 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Issue Date</th>
              <th className={`text-left py-4 px-6 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Expiry Date</th>
              <th className={`text-left py-4 px-6 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status</th>
              <th className={`text-right py-4 px-6 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCertifications.map((cert, index) => {
              const StatusIcon = statusConfig[cert.status].icon
              return (
                <motion.tr
                  key={cert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-b transition-colors ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/20">
                        <Award className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{cert.name}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{cert.issuer}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{cert.technician.charAt(0)}</span>
                      </div>
                      <span className={isDark ? 'text-white' : 'text-slate-900'}>{cert.technician}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${categoryConfig[cert.category].color}`}>
                      {categoryConfig[cert.category].label}
                    </span>
                  </td>
                  <td className={`py-4 px-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{cert.issueDate}</td>
                  <td className="py-4 px-6">
                    <span className={cert.status === 'expired' || cert.status === 'expiring_soon' ? 'text-amber-400' : isDark ? 'text-slate-300' : 'text-slate-700'}>
                      {cert.expiryDate}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${statusConfig[cert.status].color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusConfig[cert.status].label}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                        <Download className="w-4 h-4" />
                      </button>
                      {(cert.status === 'expired' || cert.status === 'expiring_soon') && (
                        <button className="p-2 rounded-lg hover:bg-amber-500/20 text-amber-400">
                          <RefreshCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </motion.div>
    </div>
  )
}
