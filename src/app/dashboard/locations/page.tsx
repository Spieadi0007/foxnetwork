'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Plus,
  Search,
  Building2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Edit,
  Trash2,
  Eye,
  X,
  Phone,
  Mail,
  User,
  Upload,
  Key,
  Link as LinkIcon,
  Copy,
  Check,
  Download,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'
import { toast } from 'sonner'
import {
  getLocations,
  createLocation,
  deleteLocation,
  updateLocation,
  createLocationsFromCSV,
  getApiKeys,
  createApiKey,
  revokeApiKey,
  getLocationForms,
  createLocationForm,
  deleteLocationForm,
} from '@/lib/actions/locations'
import type {
  Location,
  CreateLocationInput,
  ApiKey,
  LocationForm,
  CSVLocationRow,
} from '@/types/locations'

type AddMethodType = 'manual' | 'csv' | 'api' | 'form' | null

export default function LocationsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // State
  const [locations, setLocations] = useState<Location[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [locationForms, setLocationForms] = useState<LocationForm[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')

  // Modal states
  const [showAddDropdown, setShowAddDropdown] = useState(false)
  const [addMethod, setAddMethod] = useState<AddMethodType>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)

  // Form states
  const [formLoading, setFormLoading] = useState(false)
  const [manualForm, setManualForm] = useState<CreateLocationInput>({
    name: '',
    type: 'site',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'France',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
  })

  // CSV state
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvPreview, setCsvPreview] = useState<CSVLocationRow[]>([])
  const [csvUploading, setCsvUploading] = useState(false)

  // API Key state
  const [newApiKeyName, setNewApiKeyName] = useState('')
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)

  // Public Form state
  const [newFormName, setNewFormName] = useState('')
  const [newFormSlug, setNewFormSlug] = useState('')

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [locationsRes, apiKeysRes, formsRes] = await Promise.all([
        getLocations(),
        getApiKeys(),
        getLocationForms(),
      ])

      if (locationsRes.data) setLocations(locationsRes.data)
      if (apiKeysRes.data) setApiKeys(apiKeysRes.data)
      if (formsRes.data) setLocationForms(formsRes.data)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter locations
  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address_line1?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.city?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || location.status === filterStatus
    const matchesType = filterType === 'all' || location.type === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  // Helpers
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle }
      case 'pending':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Clock }
      case 'inactive':
      case 'archived':
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: AlertTriangle }
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: AlertTriangle }
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'store':
        return 'from-pink-500 to-rose-600'
      case 'office':
        return 'from-blue-500 to-indigo-600'
      case 'warehouse':
        return 'from-amber-500 to-orange-600'
      case 'site':
        return 'from-emerald-500 to-teal-600'
      case 'other':
        return 'from-purple-500 to-violet-600'
      default:
        return 'from-slate-500 to-slate-600'
    }
  }

  const stats = {
    total: locations.length,
    active: locations.filter((l) => l.status === 'active').length,
    pending: locations.filter((l) => l.status === 'pending').length,
    sources: {
      manual: locations.filter((l) => l.source === 'manual').length,
      csv: locations.filter((l) => l.source === 'csv').length,
      api: locations.filter((l) => l.source === 'api').length,
      form: locations.filter((l) => l.source === 'form').length,
    },
  }

  // Handlers
  const handleCreateLocation = async () => {
    if (!manualForm.name) {
      toast.error('Location name is required')
      return
    }

    setFormLoading(true)
    try {
      const result = await createLocation(manualForm)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Location created successfully')
        setManualForm({
          name: '',
          type: 'site',
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'France',
          contact_name: '',
          contact_email: '',
          contact_phone: '',
          notes: '',
        })
        setAddMethod(null)
        loadData()
      }
    } catch {
      toast.error('Failed to create location')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return

    try {
      const result = await deleteLocation(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Location deleted')
        setSelectedLocation(null)
        loadData()
      }
    } catch {
      toast.error('Failed to delete location')
    }
  }

  const handleUpdateLocation = async () => {
    if (!editingLocation) return

    setFormLoading(true)
    try {
      const result = await updateLocation(editingLocation.id, {
        name: editingLocation.name,
        type: editingLocation.type,
        address_line1: editingLocation.address_line1,
        address_line2: editingLocation.address_line2,
        city: editingLocation.city,
        state: editingLocation.state,
        postal_code: editingLocation.postal_code,
        country: editingLocation.country,
        contact_name: editingLocation.contact_name,
        contact_email: editingLocation.contact_email,
        contact_phone: editingLocation.contact_phone,
        notes: editingLocation.notes,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Location updated')
        setEditingLocation(null)
        loadData()
      }
    } catch {
      toast.error('Failed to update location')
    } finally {
      setFormLoading(false)
    }
  }

  // CSV handlers
  const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCsvFile(file)

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))

      const rows: CSVLocationRow[] = []
      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const row: Record<string, string> = {}
        headers.forEach((header, idx) => {
          row[header] = values[idx] || ''
        })
        rows.push(row as unknown as CSVLocationRow)
      }
      setCsvPreview(rows)
    }
    reader.readAsText(file)
  }

  const handleCSVUpload = async () => {
    if (!csvFile) return

    setCsvUploading(true)
    try {
      const text = await csvFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/\s+/g, '_'))

      const rows: CSVLocationRow[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const row: Record<string, string> = {}
        headers.forEach((header, idx) => {
          row[header] = values[idx] || ''
        })
        rows.push(row as unknown as CSVLocationRow)
      }

      const result = await createLocationsFromCSV(rows)
      toast.success(`Imported ${result.success} locations. ${result.failed} failed.`)
      if (result.errors.length > 0) {
        console.log('CSV errors:', result.errors)
      }
      setCsvFile(null)
      setCsvPreview([])
      setAddMethod(null)
      loadData()
    } catch {
      toast.error('Failed to upload CSV')
    } finally {
      setCsvUploading(false)
    }
  }

  // API Key handlers
  const handleCreateApiKey = async () => {
    if (!newApiKeyName) {
      toast.error('API key name is required')
      return
    }

    setFormLoading(true)
    try {
      console.log('Creating API key:', newApiKeyName)
      const result = await createApiKey({ name: newApiKeyName })
      console.log('API key result:', result)
      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        setGeneratedApiKey(result.data.plainKey)
        setNewApiKeyName('')
        toast.success('API key created successfully')
        loadData()
      } else {
        toast.error('No data returned')
      }
    } catch (error) {
      console.error('API key error:', error)
      toast.error('Failed to create API key')
    } finally {
      setFormLoading(false)
    }
  }

  const handleRevokeApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return

    try {
      const result = await revokeApiKey(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('API key revoked')
        loadData()
      }
    } catch {
      toast.error('Failed to revoke API key')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
    toast.success('Copied to clipboard')
  }

  // Public Form handlers
  const handleCreateForm = async () => {
    if (!newFormName || !newFormSlug) {
      toast.error('Form name and URL slug are required')
      return
    }

    setFormLoading(true)
    try {
      const result = await createLocationForm({
        name: newFormName,
        slug: newFormSlug.toLowerCase().replace(/\s+/g, '-'),
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Public form created')
        setNewFormName('')
        setNewFormSlug('')
        loadData()
      }
    } catch {
      toast.error('Failed to create form')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteForm = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return

    try {
      const result = await deleteLocationForm(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Form deleted')
        loadData()
      }
    } catch {
      toast.error('Failed to delete form')
    }
  }

  const closeModal = () => {
    setAddMethod(null)
    setGeneratedApiKey(null)
    setCsvFile(null)
    setCsvPreview([])
    setManualForm({
      name: '',
      type: 'site',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'France',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      notes: '',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Locations
          </h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage your deployment locations
          </p>
        </div>

        <div className="relative">
          <motion.button
            onClick={() => setShowAddDropdown(!showAddDropdown)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-5 h-5" />
            Add Location
            <ChevronDown className={`w-4 h-4 transition-transform ${showAddDropdown ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {showAddDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={`absolute right-0 mt-2 w-72 rounded-xl border shadow-xl z-50 ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}
              >
                {[
                  { id: 'manual', icon: Edit, title: 'Manual Entry', desc: 'Add a single location using a form' },
                  { id: 'csv', icon: Upload, title: 'Bulk CSV Upload', desc: 'Import multiple locations from a CSV file' },
                  { id: 'api', icon: Key, title: 'API Integration', desc: 'Generate API key for programmatic access' },
                  { id: 'form', icon: LinkIcon, title: 'Public Form', desc: 'Create a shareable form for submissions' },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => {
                      setAddMethod(method.id as AddMethodType)
                      setShowAddDropdown(false)
                    }}
                    className={`w-full flex items-start gap-3 p-4 text-left transition-colors first:rounded-t-xl last:rounded-b-xl ${
                      isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-50'}`}>
                      <method.icon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{method.title}</p>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{method.desc}</p>
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
          { label: 'Pending Setup', value: stats.pending, icon: Clock, color: 'amber' },
          { label: 'API Keys', value: apiKeys.filter(k => k.status === 'active').length, icon: Key, color: 'purple' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                <stat.icon className={`w-5 h-5 ${
                  stat.color === 'blue' ? 'text-blue-500' :
                  stat.color === 'emerald' ? 'text-emerald-500' :
                  stat.color === 'amber' ? 'text-amber-500' :
                  'text-purple-500'
                }`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-2.5 rounded-xl border transition-all ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-4 py-2.5 rounded-xl border ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-4 py-2.5 rounded-xl border ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="all">All Types</option>
              <option value="site">Site</option>
              <option value="office">Office</option>
              <option value="warehouse">Warehouse</option>
              <option value="store">Store</option>
              <option value="other">Other</option>
            </select>

            <button
              onClick={loadData}
              className={`p-2.5 rounded-xl border transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900'
              }`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLocations.map((location, index) => {
          const statusBadge = getStatusBadge(location.status)
          const StatusIcon = statusBadge.icon

          return (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-2xl border overflow-hidden transition-all ${
                isDark
                  ? 'bg-white/5 border-white/10 hover:border-white/20'
                  : 'bg-white border-slate-200 hover:shadow-lg'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getTypeColor(location.type)} flex items-center justify-center shadow-lg`}>
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {location.code || location.id.slice(0, 8)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded capitalize ${
                          isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {location.type}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-50 text-slate-400'
                        }`}>
                          via {location.source}
                        </span>
                      </div>
                      <h3 className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {location.name}
                      </h3>
                    </div>
                  </div>

                  <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {location.status}
                  </span>
                </div>

                {(location.address_line1 || location.city) && (
                  <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <div className="flex items-start gap-2">
                      <MapPin className={`w-4 h-4 mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                      <div>
                        {location.address_line1 && (
                          <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {location.address_line1}
                          </p>
                        )}
                        {(location.city || location.state || location.postal_code) && (
                          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {[location.city, location.state, location.postal_code].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {location.contact_name && (
                  <div className={`flex items-center gap-4 mt-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      {location.contact_name}
                    </span>
                  </div>
                )}

                <div className={`flex items-center gap-2 mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                  <motion.button
                    onClick={() => setSelectedLocation(location)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium ${
                      isDark
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </motion.button>
                  <motion.button
                    onClick={() => setEditingLocation(location)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium ${
                      isDark
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filteredLocations.length === 0 && (
        <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <MapPin className={`w-12 h-12 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
          <p className={`mt-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            No locations found
          </p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Try adjusting your filters or add a new location
          </p>
        </div>
      )}

      {/* Manual Entry Modal */}
      <AnimatePresence>
        {addMethod === 'manual' && (
          <Modal title="Add Location - Manual Entry" onClose={closeModal} isDark={isDark}>
            <div className="p-5 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Location Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Paris Office - Main Building"
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Location Type *
                </label>
                <select
                  value={manualForm.type}
                  onChange={(e) => setManualForm({ ...manualForm, type: e.target.value as Location['type'] })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="site">Site</option>
                  <option value="office">Office</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="store">Store</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="123 Rue de Paris"
                  value={manualForm.address_line1}
                  onChange={(e) => setManualForm({ ...manualForm, address_line1: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Paris"
                    value={manualForm.city}
                    onChange={(e) => setManualForm({ ...manualForm, city: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    State/Region
                  </label>
                  <input
                    type="text"
                    placeholder="Ile-de-France"
                    value={manualForm.state}
                    onChange={(e) => setManualForm({ ...manualForm, state: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Postal Code
                  </label>
                  <input
                    type="text"
                    placeholder="75001"
                    value={manualForm.postal_code}
                    onChange={(e) => setManualForm({ ...manualForm, postal_code: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Country
                  </label>
                  <input
                    type="text"
                    placeholder="France"
                    value={manualForm.country}
                    onChange={(e) => setManualForm({ ...manualForm, country: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Site Contact
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={manualForm.contact_name}
                    onChange={(e) => setManualForm({ ...manualForm, contact_name: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={manualForm.contact_phone}
                    onChange={(e) => setManualForm({ ...manualForm, contact_phone: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={manualForm.contact_email}
                    onChange={(e) => setManualForm({ ...manualForm, contact_email: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Access instructions, special requirements, etc."
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border resize-none ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>
            </div>

            <div className={`flex items-center justify-end gap-3 p-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <button
                onClick={closeModal}
                className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
                  isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <motion.button
                onClick={handleCreateLocation}
                disabled={formLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Location'}
              </motion.button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* CSV Upload Modal */}
      <AnimatePresence>
        {addMethod === 'csv' && (
          <Modal title="Bulk CSV Upload" onClose={closeModal} isDark={isDark}>
            <div className="p-5 space-y-4">
              <div className={`p-4 rounded-xl border-2 border-dashed ${
                isDark ? 'border-white/20 bg-white/5' : 'border-slate-300 bg-slate-50'
              }`}>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="flex flex-col items-center cursor-pointer py-8"
                >
                  <Upload className={`w-12 h-12 mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {csvFile ? csvFile.name : 'Click to upload CSV file'}
                  </p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    or drag and drop
                  </p>
                </label>
              </div>

              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Required CSV columns:
                </p>
                <code className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  name, address_line1, city, state, postal_code, country, contact_name, contact_email, contact_phone
                </code>
                <a
                  href="/sample-locations.csv"
                  download
                  className="flex items-center gap-2 mt-3 text-sm text-blue-500 hover:text-blue-400"
                >
                  <Download className="w-4 h-4" />
                  Download sample CSV
                </a>
              </div>

              {csvPreview.length > 0 && (
                <div>
                  <p className={`text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Preview (first 5 rows):
                  </p>
                  <div className="overflow-x-auto">
                    <table className={`w-full text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <thead>
                        <tr className={isDark ? 'border-b border-white/10' : 'border-b border-slate-200'}>
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">City</th>
                          <th className="text-left p-2">Country</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.map((row, idx) => (
                          <tr key={idx} className={isDark ? 'border-b border-white/5' : 'border-b border-slate-100'}>
                            <td className="p-2">{row.name}</td>
                            <td className="p-2">{row.city}</td>
                            <td className="p-2">{row.country}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className={`flex items-center justify-end gap-3 p-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <button
                onClick={closeModal}
                className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
                  isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <motion.button
                onClick={handleCSVUpload}
                disabled={!csvFile || csvUploading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                {csvUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload & Import'}
              </motion.button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* API Integration Modal */}
      <AnimatePresence>
        {addMethod === 'api' && (
          <Modal title="API Integration" onClose={closeModal} isDark={isDark} size="lg">
            <div className="p-5 space-y-6">
              {/* Existing API Keys */}
              <div>
                <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Your API Keys
                </h3>
                {apiKeys.length === 0 ? (
                  <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    No API keys yet. Create one below.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {apiKeys.map((key) => (
                      <div
                        key={key.id}
                        className={`flex items-center justify-between p-3 rounded-xl ${
                          isDark ? 'bg-white/5' : 'bg-slate-50'
                        }`}
                      >
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{key.name}</p>
                          <p className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {key.key_prefix}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            key.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {key.status}
                          </span>
                          {key.status === 'active' && (
                            <button
                              onClick={() => handleRevokeApiKey(key.id)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Create new API Key */}
              <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Create New API Key
                </h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="API Key Name (e.g., Production Key)"
                    value={newApiKeyName}
                    onChange={(e) => setNewApiKeyName(e.target.value)}
                    className={`flex-1 px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Button clicked!')
                      handleCreateApiKey()
                    }}
                    disabled={formLoading || !newApiKeyName}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50 hover:opacity-90 transition-opacity"
                  >
                    {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate'}
                  </button>
                </div>

                {generatedApiKey && (
                  <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200'}`}>
                    <p className={`text-sm font-medium mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      Your new API key (save it now, it won&apos;t be shown again):
                    </p>
                    <div className="flex items-center gap-2">
                      <code className={`flex-1 text-xs p-2 rounded bg-black/20 ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                        {generatedApiKey}
                      </code>
                      <button
                        onClick={() => copyToClipboard(generatedApiKey)}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-emerald-100'}`}
                      >
                        {copiedKey ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* API Documentation */}
              <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  API Usage
                </h3>
                <div className={`p-4 rounded-xl font-mono text-xs ${isDark ? 'bg-slate-950' : 'bg-slate-900'} text-slate-300`}>
                  <p className="text-slate-500"># Create a location via API</p>
                  <p className="mt-2">curl -X POST {typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/locations \</p>
                  <p className="ml-4">-H &quot;Authorization: Bearer YOUR_API_KEY&quot; \</p>
                  <p className="ml-4">-H &quot;Content-Type: application/json&quot; \</p>
                  <p className="ml-4">-d &apos;{`{"name": "New Location", "city": "Paris"}`}&apos;</p>
                </div>
              </div>
            </div>

            <div className={`flex items-center justify-end gap-3 p-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <button
                onClick={closeModal}
                className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
                  isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Close
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Public Form Modal */}
      <AnimatePresence>
        {addMethod === 'form' && (
          <Modal title="Public Forms" onClose={closeModal} isDark={isDark} size="lg">
            <div className="p-5 space-y-6">
              {/* Existing Forms */}
              <div>
                <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Your Public Forms
                </h3>
                {locationForms.length === 0 ? (
                  <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    No forms yet. Create one below.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {locationForms.map((form) => (
                      <div
                        key={form.id}
                        className={`flex items-center justify-between p-4 rounded-xl ${
                          isDark ? 'bg-white/5' : 'bg-slate-50'
                        }`}
                      >
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{form.name}</p>
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {form.submission_count} submissions
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            form.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-slate-500/20 text-slate-400'
                          }`}>
                            {form.status}
                          </span>
                          <a
                            href={`/submit/${form.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-white/10"
                          >
                            <ExternalLink className="w-4 h-4 text-blue-400" />
                          </a>
                          <button
                            onClick={() => copyToClipboard(`${typeof window !== 'undefined' ? window.location.origin : ''}/submit/${form.slug}`)}
                            className="p-2 rounded-lg hover:bg-white/10"
                          >
                            <Copy className="w-4 h-4 text-slate-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteForm(form.id)}
                            className="p-2 rounded-lg hover:bg-white/10 text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Create new Form */}
              <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Create New Public Form
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Form Name (e.g., Partner Location Submission)"
                    value={newFormName}
                    onChange={(e) => setNewFormName(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {typeof window !== 'undefined' ? window.location.origin : ''}/submit/
                    </span>
                    <input
                      type="text"
                      placeholder="url-slug"
                      value={newFormSlug}
                      onChange={(e) => setNewFormSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      className={`flex-1 px-4 py-2.5 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                  <motion.button
                    onClick={handleCreateForm}
                    disabled={formLoading || !newFormName || !newFormSlug}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50"
                  >
                    {formLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Create Form'}
                  </motion.button>
                </div>
              </div>
            </div>

            <div className={`flex items-center justify-end gap-3 p-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <button
                onClick={closeModal}
                className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
                  isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Close
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Location Detail Modal */}
      <AnimatePresence>
        {selectedLocation && (
          <Modal
            title={selectedLocation.name}
            onClose={() => setSelectedLocation(null)}
            isDark={isDark}
          >
            <div className="p-5 space-y-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <div className="flex items-start gap-3">
                  <MapPin className={`w-5 h-5 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div>
                    {selectedLocation.address_line1 && (
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {selectedLocation.address_line1}
                      </p>
                    )}
                    {(selectedLocation.city || selectedLocation.state || selectedLocation.postal_code) && (
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {[selectedLocation.city, selectedLocation.state, selectedLocation.postal_code].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {selectedLocation.country && (
                      <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {selectedLocation.country}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Status</p>
                  {(() => {
                    const badge = getStatusBadge(selectedLocation.status)
                    const Icon = badge.icon
                    return (
                      <span className={`inline-flex items-center gap-1.5 mt-1 px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                        <Icon className="w-3 h-3" />
                        {selectedLocation.status}
                      </span>
                    )
                  })()}
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Source</p>
                  <p className={`text-sm font-medium mt-1 capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedLocation.source}
                  </p>
                </div>
              </div>

              {(selectedLocation.contact_name || selectedLocation.contact_email || selectedLocation.contact_phone) && (
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <p className={`text-xs mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Site Contact</p>
                  <div className="space-y-2">
                    {selectedLocation.contact_name && (
                      <div className="flex items-center gap-2">
                        <User className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {selectedLocation.contact_name}
                        </span>
                      </div>
                    )}
                    {selectedLocation.contact_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {selectedLocation.contact_phone}
                        </span>
                      </div>
                    )}
                    {selectedLocation.contact_email && (
                      <div className="flex items-center gap-2">
                        <Mail className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {selectedLocation.contact_email}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedLocation.notes && (
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <p className={`text-xs mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Notes</p>
                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {selectedLocation.notes}
                  </p>
                </div>
              )}
            </div>

            <div className={`flex items-center gap-3 p-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <motion.button
                onClick={() => {
                  setEditingLocation(selectedLocation)
                  setSelectedLocation(null)
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium ${
                  isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Edit className="w-4 h-4" />
                Edit
              </motion.button>
              <motion.button
                onClick={() => handleDeleteLocation(selectedLocation.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/20 text-red-400 font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </motion.button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Edit Location Modal */}
      <AnimatePresence>
        {editingLocation && (
          <Modal title="Edit Location" onClose={() => setEditingLocation(null)} isDark={isDark}>
            <div className="p-5 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Location Name *
                </label>
                <input
                  type="text"
                  value={editingLocation.name}
                  onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Type
                  </label>
                  <select
                    value={editingLocation.type}
                    onChange={(e) => setEditingLocation({ ...editingLocation, type: e.target.value as Location['type'] })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="site">Site</option>
                    <option value="office">Office</option>
                    <option value="warehouse">Warehouse</option>
                    <option value="store">Store</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Status
                  </label>
                  <select
                    value={editingLocation.status}
                    onChange={(e) => setEditingLocation({ ...editingLocation, status: e.target.value as Location['status'] })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Address
                </label>
                <input
                  type="text"
                  value={editingLocation.address_line1 || ''}
                  onChange={(e) => setEditingLocation({ ...editingLocation, address_line1: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    City
                  </label>
                  <input
                    type="text"
                    value={editingLocation.city || ''}
                    onChange={(e) => setEditingLocation({ ...editingLocation, city: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={editingLocation.postal_code || ''}
                    onChange={(e) => setEditingLocation({ ...editingLocation, postal_code: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={editingLocation.notes || ''}
                  onChange={(e) => setEditingLocation({ ...editingLocation, notes: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border resize-none ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className={`flex items-center justify-end gap-3 p-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <button
                onClick={() => setEditingLocation(null)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
                  isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <motion.button
                onClick={handleUpdateLocation}
                disabled={formLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
              </motion.button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Click outside to close dropdown */}
      {showAddDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowAddDropdown(false)}
        />
      )}
    </div>
  )
}

// Modal Component
function Modal({
  title,
  children,
  onClose,
  isDark,
  size = 'md',
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
  isDark: boolean
  size?: 'md' | 'lg'
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${size === 'lg' ? 'max-w-2xl' : 'max-w-lg'} max-h-[85vh] overflow-y-auto rounded-2xl border shadow-2xl ${
          isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
        }`}
      >
        <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )

  if (!mounted) return null

  return createPortal(modalContent, document.body)
}
