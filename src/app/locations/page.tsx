'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  X,
  Phone,
  Mail,
  User,
  Upload,
  Key,
  FileText,
  Link2,
  Download,
  Check,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  Code,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'
import type { Location, CreateLocationInput, CSVLocationRow, CSVUploadResult } from '@/types/locations'

// Mock data for now - will be replaced with Supabase data
const mockLocations: Location[] = [
  {
    id: 'LOC-001',
    company_id: '1',
    name: 'Downtown Mall - Main Entrance',
    code: 'DM-001',
    type: 'store',
    status: 'active',
    address_line1: '123 Commerce Street',
    city: 'Paris',
    state: 'Île-de-France',
    postal_code: '75001',
    country: 'France',
    contact_name: 'James Wilson',
    contact_phone: '+33 1 23 45 67 89',
    contact_email: 'j.wilson@downtownmall.com',
    notes: 'Access through main lobby. Security desk on ground floor.',
    source: 'manual',
    created_at: '2023-06-15T10:00:00Z',
    updated_at: '2023-06-15T10:00:00Z',
  },
  {
    id: 'LOC-002',
    company_id: '1',
    name: 'Airport Terminal B',
    code: 'AP-002',
    type: 'site',
    status: 'active',
    address_line1: '456 Airport Boulevard',
    city: 'Paris',
    state: 'Île-de-France',
    postal_code: '95700',
    country: 'France',
    contact_name: 'Sarah Martinez',
    contact_phone: '+33 1 34 56 78 90',
    contact_email: 's.martinez@cdgairport.com',
    source: 'api',
    created_at: '2023-08-20T14:30:00Z',
    updated_at: '2023-08-20T14:30:00Z',
  },
  {
    id: 'LOC-003',
    company_id: '1',
    name: 'Central Station',
    code: 'CS-003',
    type: 'site',
    status: 'pending',
    address_line1: '789 Railway Avenue',
    city: 'Lyon',
    state: 'Auvergne-Rhône-Alpes',
    postal_code: '69001',
    country: 'France',
    contact_name: 'Michael Chen',
    contact_phone: '+33 4 56 78 90 12',
    contact_email: 'm.chen@sncf.com',
    notes: 'Main concourse level, near Track 21',
    source: 'csv',
    created_at: '2023-05-10T09:00:00Z',
    updated_at: '2023-05-10T09:00:00Z',
  },
]

type ModalType = 'none' | 'add-manual' | 'add-csv' | 'add-api' | 'add-form' | 'view' | 'edit'
type AddMethod = 'manual' | 'csv' | 'api' | 'form'

export default function LocationsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [locations, setLocations] = useState<Location[]>(mockLocations)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [modalType, setModalType] = useState<ModalType>('none')
  const [showAddOptions, setShowAddOptions] = useState(false)

  // Form states
  const [formData, setFormData] = useState<CreateLocationInput>({
    name: '',
    type: 'site',
    address_line1: '',
    city: '',
    postal_code: '',
    country: 'France',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // CSV upload states
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvPreview, setCsvPreview] = useState<CSVLocationRow[]>([])
  const [csvUploadResult, setCsvUploadResult] = useState<CSVUploadResult | null>(null)

  // Filter locations
  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.code?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || location.status === filterStatus
    const matchesType = filterType === 'all' || location.type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const stats = {
    total: locations.length,
    active: locations.filter((l) => l.status === 'active').length,
    pending: locations.filter((l) => l.status === 'pending').length,
    inactive: locations.filter((l) => l.status === 'inactive').length,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { color: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700', icon: CheckCircle }
      case 'pending':
        return { color: isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700', icon: Clock }
      case 'inactive':
        return { color: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700', icon: AlertTriangle }
      default:
        return { color: isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600', icon: MapPin }
    }
  }

  const getTypeBadge = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      site: { label: 'Site', color: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700' },
      warehouse: { label: 'Warehouse', color: isDark ? 'bg-violet-500/20 text-violet-400' : 'bg-violet-100 text-violet-700' },
      office: { label: 'Office', color: isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700' },
      store: { label: 'Store', color: isDark ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-100 text-pink-700' },
      other: { label: 'Other', color: isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-600' },
    }
    return types[type] || types.other
  }

  const getSourceBadge = (source: string) => {
    const sources: Record<string, { label: string; icon: typeof FileText }> = {
      manual: { label: 'Manual', icon: Edit },
      csv: { label: 'CSV', icon: FileSpreadsheet },
      api: { label: 'API', icon: Code },
      form: { label: 'Form', icon: FileText },
    }
    return sources[source] || sources.manual
  }

  const handleSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      // TODO: Replace with actual Supabase insert
      const newLocation: Location = {
        id: `LOC-${Date.now()}`,
        company_id: '1', // Will come from auth context
        name: formData.name,
        code: formData.code,
        type: formData.type || 'site',
        status: 'active',
        address_line1: formData.address_line1,
        address_line2: formData.address_line2,
        city: formData.city,
        state: formData.state,
        postal_code: formData.postal_code,
        country: formData.country,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        notes: formData.notes,
        source: 'manual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      setLocations([newLocation, ...locations])
      setSubmitSuccess(true)
      setTimeout(() => {
        setModalType('none')
        setSubmitSuccess(false)
        setFormData({
          name: '',
          type: 'site',
          address_line1: '',
          city: '',
          postal_code: '',
          country: 'France',
        })
      }, 1500)
    } catch (error) {
      setSubmitError('Failed to create location. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCsvFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n')
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())

      const preview: CSVLocationRow[] = []
      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        if (!lines[i].trim()) continue
        const values = lines[i].split(',').map((v) => v.trim())
        const row: Record<string, string> = {}
        headers.forEach((header, index) => {
          if (values[index]) {
            row[header] = values[index]
          }
        })
        if (row.name) {
          preview.push({
            name: row.name,
            code: row.code,
            type: row.type,
            address_line1: row.address_line1,
            address_line2: row.address_line2,
            city: row.city,
            state: row.state,
            postal_code: row.postal_code,
            country: row.country,
            latitude: row.latitude,
            longitude: row.longitude,
            contact_name: row.contact_name,
            contact_email: row.contact_email,
            contact_phone: row.contact_phone,
            notes: row.notes,
          })
        }
      }
      setCsvPreview(preview)
    }
    reader.readAsText(file)
  }

  const handleCSVSubmit = async () => {
    if (!csvFile) return
    setIsSubmitting(true)

    try {
      // TODO: Parse full CSV and insert into Supabase
      const result: CSVUploadResult = {
        success: csvPreview.length,
        failed: 0,
        errors: [],
      }

      // Add preview rows as locations
      const newLocations = csvPreview.map((row, index) => ({
        id: `LOC-CSV-${Date.now()}-${index}`,
        company_id: '1',
        name: row.name,
        code: row.code,
        type: (row.type as Location['type']) || 'site',
        status: 'pending' as const,
        address_line1: row.address_line1,
        address_line2: row.address_line2,
        city: row.city,
        state: row.state,
        postal_code: row.postal_code,
        country: row.country || 'France',
        contact_name: row.contact_name,
        contact_email: row.contact_email,
        contact_phone: row.contact_phone,
        notes: row.notes,
        source: 'csv' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      setLocations([...newLocations, ...locations])
      setCsvUploadResult(result)
    } catch (error) {
      setCsvUploadResult({
        success: 0,
        failed: csvPreview.length,
        errors: [{ row: 0, error: 'Upload failed', data: csvPreview[0] }],
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const downloadCSVTemplate = () => {
    const headers = ['name', 'code', 'type', 'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country', 'contact_name', 'contact_email', 'contact_phone', 'notes']
    const example = ['Main Store', 'MS-001', 'store', '123 Main St', 'Suite 100', 'Paris', 'Île-de-France', '75001', 'France', 'John Doe', 'john@example.com', '+33 1 23 45 67 89', 'Near metro station']
    const csv = [headers.join(','), example.join(',')].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'locations_template.csv'
    a.click()
  }

  const closeModal = () => {
    setModalType('none')
    setSelectedLocation(null)
    setShowAddOptions(false)
    setSubmitError(null)
    setSubmitSuccess(false)
    setCsvFile(null)
    setCsvPreview([])
    setCsvUploadResult(null)
  }

  const addMethodOptions: Array<{ id: AddMethod; title: string; description: string; icon: typeof Plus }> = [
    { id: 'manual', title: 'Manual Entry', description: 'Add a single location using a form', icon: Edit },
    { id: 'csv', title: 'Bulk CSV Upload', description: 'Import multiple locations from a CSV file', icon: Upload },
    { id: 'api', title: 'API Integration', description: 'Generate API key for programmatic access', icon: Key },
    { id: 'form', title: 'Public Form', description: 'Create a shareable form for submissions', icon: Link2 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Locations</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage all your sites and locations
          </p>
        </div>
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddOptions(!showAddOptions)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-5 h-5" />
            Add Location
          </motion.button>

          {/* Add Options Dropdown */}
          <AnimatePresence>
            {showAddOptions && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={`absolute right-0 mt-2 w-72 rounded-xl border shadow-xl z-50 ${
                  isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'
                }`}
              >
                {addMethodOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setModalType(`add-${option.id}` as ModalType)
                      setShowAddOptions(false)
                    }}
                    className={`w-full flex items-start gap-3 p-4 text-left transition-colors first:rounded-t-xl last:rounded-b-xl ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                      <option.icon className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{option.title}</p>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{option.description}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Locations', value: stats.total, icon: MapPin, color: 'blue' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'emerald' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'amber' },
          { label: 'Inactive', value: stats.inactive, icon: AlertTriangle, color: 'red' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                <p className={`text-3xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-500/20`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <Search className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent outline-none ${isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-900 placeholder:text-slate-400'}`}
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
          >
            <option value="all">All Types</option>
            <option value="site">Site</option>
            <option value="warehouse">Warehouse</option>
            <option value="office">Office</option>
            <option value="store">Store</option>
          </select>
        </div>
      </div>

      {/* Locations List */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
        <div className={`hidden md:grid md:grid-cols-12 gap-4 p-4 text-sm font-medium border-b ${isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
          <div className="col-span-4">Location</div>
          <div className="col-span-3">Address</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Actions</div>
        </div>

        <div className="divide-y divide-white/5">
          {filteredLocations.map((location, index) => {
            const statusBadge = getStatusBadge(location.status)
            const typeBadge = getTypeBadge(location.type)
            const sourceBadge = getSourceBadge(location.source)
            const StatusIcon = statusBadge.icon
            const SourceIcon = sourceBadge.icon

            return (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 cursor-pointer transition-all ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                onClick={() => {
                  setSelectedLocation(location)
                  setModalType('view')
                }}
              >
                <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center">
                  <div className="col-span-4 flex items-center gap-3 mb-3 md:mb-0">
                    <div className={`p-2.5 rounded-xl ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                      <MapPin className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{location.name}</p>
                      <div className="flex items-center gap-2">
                        {location.code && (
                          <span className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{location.code}</span>
                        )}
                        <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          <SourceIcon className="w-3 h-3" />
                          {sourceBadge.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 mb-3 md:mb-0">
                    <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{location.address_line1}</p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {location.city}, {location.postal_code}
                    </p>
                  </div>
                  <div className="col-span-2 mb-3 md:mb-0">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${typeBadge.color}`}>
                      {typeBadge.label}
                    </span>
                  </div>
                  <div className="col-span-2 mb-3 md:mb-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {location.status}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                      className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
                    >
                      <MoreHorizontal className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {filteredLocations.length === 0 && (
          <div className="p-12 text-center">
            <MapPin className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
            <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No locations found</p>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modalType !== 'none' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border ${
                isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              {/* Manual Entry Modal */}
              {modalType === 'add-manual' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                        <Edit className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Add Location</h2>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Enter location details manually</p>
                      </div>
                    </div>
                    <button onClick={closeModal} className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                      <X className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </button>
                  </div>

                  {submitSuccess ? (
                    <div className="py-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Check className="w-8 h-8 text-emerald-500" />
                      </div>
                      <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Location Added!</p>
                      <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Your new location has been created successfully.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitManual} className="space-y-4">
                      {submitError && (
                        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                          <p className="text-sm text-red-500">{submitError}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Location Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                            placeholder="e.g., Main Office Building"
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Location Code
                          </label>
                          <input
                            type="text"
                            value={formData.code || ''}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                            placeholder="e.g., MOB-001"
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Type
                          </label>
                          <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as Location['type'] })}
                            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                          >
                            <option value="site">Site</option>
                            <option value="warehouse">Warehouse</option>
                            <option value="office">Office</option>
                            <option value="store">Store</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div className="col-span-2">
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Address Line 1 *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.address_line1 || ''}
                            onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                            placeholder="Street address"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Address Line 2
                          </label>
                          <input
                            type="text"
                            value={formData.address_line2 || ''}
                            onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                            placeholder="Apt, suite, floor, etc."
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            City *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.city || ''}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                            placeholder="City"
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            State/Region
                          </label>
                          <input
                            type="text"
                            value={formData.state || ''}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                            placeholder="State or region"
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Postal Code *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.postal_code || ''}
                            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                            placeholder="Postal code"
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Country
                          </label>
                          <input
                            type="text"
                            value={formData.country || 'France'}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                          />
                        </div>

                        <div className="col-span-2 pt-4 border-t border-white/10">
                          <p className={`text-sm font-medium mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Contact Information</p>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Contact Name
                          </label>
                          <input
                            type="text"
                            value={formData.contact_name || ''}
                            onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                            placeholder="Contact person"
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Contact Phone
                          </label>
                          <input
                            type="tel"
                            value={formData.contact_phone || ''}
                            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                            placeholder="+33 1 23 45 67 89"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Contact Email
                          </label>
                          <input
                            type="email"
                            value={formData.contact_email || ''}
                            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                            placeholder="email@example.com"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Notes
                          </label>
                          <textarea
                            rows={3}
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                            placeholder="Additional notes about this location..."
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          type="button"
                          onClick={closeModal}
                          className={`px-4 py-2.5 rounded-xl font-medium ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Create Location
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* CSV Upload Modal */}
              {modalType === 'add-csv' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isDark ? 'bg-violet-500/20' : 'bg-violet-100'}`}>
                        <Upload className={`w-5 h-5 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
                      </div>
                      <div>
                        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Bulk CSV Upload</h2>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Import multiple locations at once</p>
                      </div>
                    </div>
                    <button onClick={closeModal} className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                      <X className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </button>
                  </div>

                  {csvUploadResult ? (
                    <div className="py-8 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${csvUploadResult.failed === 0 ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                        {csvUploadResult.failed === 0 ? (
                          <Check className="w-8 h-8 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-8 h-8 text-amber-500" />
                        )}
                      </div>
                      <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Upload Complete
                      </p>
                      <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {csvUploadResult.success} locations imported successfully
                        {csvUploadResult.failed > 0 && `, ${csvUploadResult.failed} failed`}
                      </p>
                      <button
                        onClick={closeModal}
                        className="mt-6 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Upload a CSV file with your location data
                        </p>
                        <button
                          onClick={downloadCSVTemplate}
                          className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                        >
                          <Download className="w-4 h-4" />
                          Download Template
                        </button>
                      </div>

                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                          isDark ? 'border-white/10 hover:border-white/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv"
                          onChange={handleCSVUpload}
                          className="hidden"
                        />
                        <FileSpreadsheet className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                        {csvFile ? (
                          <>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{csvFile.name}</p>
                            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              Click to change file
                            </p>
                          </>
                        ) : (
                          <>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              Click to upload or drag and drop
                            </p>
                            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              CSV files only
                            </p>
                          </>
                        )}
                      </div>

                      {csvPreview.length > 0 && (
                        <div>
                          <p className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Preview ({csvPreview.length} rows)
                          </p>
                          <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className={isDark ? 'bg-white/5' : 'bg-slate-50'}>
                                  <tr>
                                    <th className={`px-4 py-2 text-left ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Name</th>
                                    <th className={`px-4 py-2 text-left ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>City</th>
                                    <th className={`px-4 py-2 text-left ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Type</th>
                                  </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                                  {csvPreview.map((row, i) => (
                                    <tr key={i}>
                                      <td className={`px-4 py-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{row.name}</td>
                                      <td className={`px-4 py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.city || '-'}</td>
                                      <td className={`px-4 py-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{row.type || 'site'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          type="button"
                          onClick={closeModal}
                          className={`px-4 py-2.5 rounded-xl font-medium ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCSVSubmit}
                          disabled={!csvFile || isSubmitting}
                          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-medium disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              Upload {csvPreview.length} Locations
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* API Key Modal */}
              {modalType === 'add-api' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                        <Key className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      </div>
                      <div>
                        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>API Integration</h2>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Generate API key for programmatic access</p>
                      </div>
                    </div>
                    <button onClick={closeModal} className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                      <X className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
                      <p className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        API keys allow you to programmatically create locations. You can share this with your systems or partners to automatically add locations.
                      </p>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        API Key Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Production API Key"
                        className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Permissions
                      </label>
                      <div className="space-y-2">
                        {['Create locations', 'Read locations', 'Update locations', 'Delete locations'].map((perm) => (
                          <label key={perm} className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" defaultChecked={perm === 'Create locations'} className="rounded" />
                            <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{perm}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Rate Limit
                      </label>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <input
                            type="number"
                            defaultValue={60}
                            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                          />
                          <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Requests per minute</p>
                        </div>
                        <div className="flex-1">
                          <input
                            type="number"
                            defaultValue={10000}
                            className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                          />
                          <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Requests per day</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className={`px-4 py-2.5 rounded-xl font-medium ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                      >
                        Cancel
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium">
                        <Key className="w-4 h-4" />
                        Generate API Key
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Public Form Modal */}
              {modalType === 'add-form' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isDark ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                        <Link2 className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                      </div>
                      <div>
                        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Public Form</h2>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Create a shareable form for location submissions</p>
                      </div>
                    </div>
                    <button onClick={closeModal} className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                      <X className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                      <p className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                        Create a public form that you can share with your clients or partners. They can submit location details which will be added to your account after approval.
                      </p>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Form Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., New Store Location Form"
                        className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Form URL Slug
                      </label>
                      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                        <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          foxnetwork.com/submit/
                        </span>
                        <input
                          type="text"
                          placeholder="new-store-form"
                          className={`flex-1 bg-transparent outline-none ${isDark ? 'text-white' : 'text-slate-900'}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Welcome Message
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Please fill out this form to submit a new location..."
                        className={`w-full px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className={`block text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Settings
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Require approval before adding locations</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Send email notification on new submission</span>
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        className={`px-4 py-2.5 rounded-xl font-medium ${isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                      >
                        Cancel
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium">
                        <Link2 className="w-4 h-4" />
                        Create Form
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* View Location Modal */}
              {modalType === 'view' && selectedLocation && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                        <MapPin className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div>
                        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedLocation.name}</h2>
                        <p className={`text-sm font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{selectedLocation.code}</p>
                      </div>
                    </div>
                    <button onClick={closeModal} className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}>
                      <X className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(selectedLocation.status).color}`}>
                        {selectedLocation.status}
                      </span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeBadge(selectedLocation.type).color}`}>
                        {getTypeBadge(selectedLocation.type).label}
                      </span>
                    </div>

                    <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Address</h3>
                      <p className={`${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedLocation.address_line1}</p>
                      {selectedLocation.address_line2 && (
                        <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{selectedLocation.address_line2}</p>
                      )}
                      <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {selectedLocation.city}, {selectedLocation.state} {selectedLocation.postal_code}
                      </p>
                      <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{selectedLocation.country}</p>
                    </div>

                    {(selectedLocation.contact_name || selectedLocation.contact_email || selectedLocation.contact_phone) && (
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                        <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Contact</h3>
                        {selectedLocation.contact_name && (
                          <p className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            <User className="w-4 h-4" />
                            {selectedLocation.contact_name}
                          </p>
                        )}
                        {selectedLocation.contact_email && (
                          <p className={`flex items-center gap-2 mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            <Mail className="w-4 h-4" />
                            {selectedLocation.contact_email}
                          </p>
                        )}
                        {selectedLocation.contact_phone && (
                          <p className={`flex items-center gap-2 mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            <Phone className="w-4 h-4" />
                            {selectedLocation.contact_phone}
                          </p>
                        )}
                      </div>
                    )}

                    {selectedLocation.notes && (
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                        <h3 className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Notes</h3>
                        <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{selectedLocation.notes}</p>
                      </div>
                    )}

                    <div className="flex justify-between pt-4">
                      <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Source: {getSourceBadge(selectedLocation.source).label} • Created {new Date(selectedLocation.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${isDark ? 'bg-white/5 text-slate-300 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-red-500 ${isDark ? 'bg-red-500/10 hover:bg-red-500/20' : 'bg-red-50 hover:bg-red-100'}`}>
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close dropdown */}
      {showAddOptions && (
        <div className="fixed inset-0 z-40" onClick={() => setShowAddOptions(false)} />
      )}
    </div>
  )
}
