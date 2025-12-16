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
  LayoutGrid,
  List,
  ChevronRight,
  Globe,
  Settings,
  Lock,
  Unlock,
  Type,
  Hash,
  Calendar,
  ToggleLeft,
  TextCursorInput,
  ListOrdered,
  CircleDot,
  Info,
  FileUp,
  Star,
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
  LocationFieldDefinition,
  LocationFieldConfig,
  LocationCustomField,
  FieldType,
  FieldOption,
} from '@/types/locations'
import {
  getFieldDefinitions,
  getFieldConfigs,
  getCustomFields,
  upsertFieldConfig,
  createCustomField,
  updateCustomField,
  deleteCustomField,
} from '@/lib/actions/field-config'
import { getLibraryItemsForSelect } from '@/lib/actions/library'
import type { LibraryItemOption } from '@/types/library'

type AddMethodType = 'manual' | 'csv' | 'api' | 'form' | null
type TabType = 'locations' | 'configuration'

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
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [activeTab, setActiveTab] = useState<TabType>('locations')

  // Field Configuration state
  const [fieldDefinitions, setFieldDefinitions] = useState<LocationFieldDefinition[]>([])
  const [fieldConfigs, setFieldConfigs] = useState<LocationFieldConfig[]>([])
  const [customFields, setCustomFields] = useState<LocationCustomField[]>([])
  const [configLoading, setConfigLoading] = useState(false)
  const [libraryClients, setLibraryClients] = useState<LibraryItemOption[]>([])
  const [libraryCountries, setLibraryCountries] = useState<LibraryItemOption[]>([])
  const [showAddCustomField, setShowAddCustomField] = useState(false)
  const [editingCustomField, setEditingCustomField] = useState<LocationCustomField | null>(null)
  const [newCustomField, setNewCustomField] = useState({
    field_label: '',
    field_type: 'text' as FieldType,
    is_required: false,
    placeholder: '',
    help_text: '',
    options: [] as FieldOption[],
  })

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
      const [locationsRes, apiKeysRes, formsRes, clientsRes, countriesRes] = await Promise.all([
        getLocations(),
        getApiKeys(),
        getLocationForms(),
        getLibraryItemsForSelect('clients'),
        getLibraryItemsForSelect('countries'),
      ])

      if (locationsRes.data) setLocations(locationsRes.data)
      if (apiKeysRes.data) setApiKeys(apiKeysRes.data)
      if (formsRes.data) setLocationForms(formsRes.data)
      if (clientsRes.data) setLibraryClients(clientsRes.data)
      if (countriesRes.data) setLibraryCountries(countriesRes.data)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Load field configuration data
  const loadFieldConfig = useCallback(async () => {
    setConfigLoading(true)
    try {
      const [defsRes, configsRes, customRes] = await Promise.all([
        getFieldDefinitions(),
        getFieldConfigs(),
        getCustomFields(),
      ])

      if (defsRes.data) setFieldDefinitions(defsRes.data)
      if (configsRes.data) setFieldConfigs(configsRes.data)
      if (customRes.data) setCustomFields(customRes.data)
    } catch {
      toast.error('Failed to load field configuration')
    } finally {
      setConfigLoading(false)
    }
  }, [])

  // Load field config on mount (needed for edit modal) and when switching to config tab
  useEffect(() => {
    loadFieldConfig()
  }, [loadFieldConfig])

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
      // Build update object from all system fields
      const updateData: Record<string, unknown> = {
        name: editingLocation.name,
        code: editingLocation.code,
        type: editingLocation.type,
        status: editingLocation.status,
        address_line1: editingLocation.address_line1,
        address_line2: editingLocation.address_line2,
        city: editingLocation.city,
        state: editingLocation.state,
        postal_code: editingLocation.postal_code,
        country: editingLocation.country,
        latitude: editingLocation.latitude,
        longitude: editingLocation.longitude,
        contact_name: editingLocation.contact_name,
        contact_email: editingLocation.contact_email,
        contact_phone: editingLocation.contact_phone,
        notes: editingLocation.notes,
        metadata: editingLocation.metadata || {},
      }

      const result = await updateLocation(editingLocation.id, updateData)
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

  // Field configuration handlers
  const handleToggleFieldRequired = async (fieldDefId: string, currentlyRequired: boolean) => {
    try {
      const result = await upsertFieldConfig({
        field_definition_id: fieldDefId,
        is_required: !currentlyRequired,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Field configuration updated')
        loadFieldConfig()
      }
    } catch {
      toast.error('Failed to update field')
    }
  }

  const handleToggleFieldVisible = async (fieldDefId: string, currentlyVisible: boolean) => {
    try {
      const result = await upsertFieldConfig({
        field_definition_id: fieldDefId,
        is_visible: !currentlyVisible,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Field visibility updated')
        loadFieldConfig()
      }
    } catch {
      toast.error('Failed to update field')
    }
  }

  const handleCreateCustomField = async () => {
    if (!newCustomField.field_label) {
      toast.error('Field label is required')
      return
    }

    // Validate options for select/multiselect
    if ((newCustomField.field_type === 'select' || newCustomField.field_type === 'multiselect') && newCustomField.options.length === 0) {
      toast.error('Please add at least one option for select fields')
      return
    }

    // Filter out empty options
    const validOptions = newCustomField.options.filter(opt => opt.label.trim() !== '')

    try {
      const payload = {
        field_key: newCustomField.field_label,
        field_label: newCustomField.field_label,
        field_type: newCustomField.field_type,
        is_required: newCustomField.is_required,
        placeholder: newCustomField.placeholder || undefined,
        help_text: newCustomField.help_text || undefined,
        options: validOptions,
      }
      console.log('Creating custom field with payload:', payload)
      const result = await createCustomField(payload)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Custom field created')
        setShowAddCustomField(false)
        setNewCustomField({
          field_label: '',
          field_type: 'text',
          is_required: false,
          placeholder: '',
          help_text: '',
          options: [],
        })
        loadFieldConfig()
      }
    } catch {
      toast.error('Failed to create custom field')
    }
  }

  const handleUpdateCustomField = async () => {
    if (!editingCustomField) return

    try {
      const result = await updateCustomField(editingCustomField.id, {
        field_label: editingCustomField.field_label,
        field_type: editingCustomField.field_type,
        is_required: editingCustomField.is_required,
        placeholder: editingCustomField.placeholder || undefined,
        help_text: editingCustomField.help_text || undefined,
        options: editingCustomField.options,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Custom field updated')
        setEditingCustomField(null)
        loadFieldConfig()
      }
    } catch {
      toast.error('Failed to update custom field')
    }
  }

  const handleDeleteCustomField = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom field?')) return

    try {
      const result = await deleteCustomField(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Custom field deleted')
        loadFieldConfig()
      }
    } catch {
      toast.error('Failed to delete custom field')
    }
  }

  // Get field config for a definition
  const getFieldConfig = (fieldDefId: string) => {
    return fieldConfigs.find((c) => c.field_definition_id === fieldDefId)
  }

  // Group fields by category
  const groupedFields = fieldDefinitions.reduce((acc, field) => {
    const category = field.category || 'general'
    if (!acc[category]) acc[category] = []
    acc[category].push(field)
    return acc
  }, {} as Record<string, LocationFieldDefinition[]>)

  const categoryLabels: Record<string, string> = {
    general: 'General Information',
    address: 'Address Details',
    contact: 'Contact Information',
    operational: 'Operational Details',
    custom: 'Custom Fields',
  }

  const getFieldTypeIcon = (type: FieldType) => {
    switch (type) {
      case 'text':
        return Type
      case 'textarea':
        return TextCursorInput
      case 'number':
      case 'currency':
      case 'percent':
        return Hash
      case 'email':
        return Mail
      case 'phone':
        return Phone
      case 'date':
      case 'duration':
        return Calendar
      case 'select':
        return ListOrdered
      case 'multiselect':
        return List
      case 'checkbox':
        return ToggleLeft
      case 'url':
        return LinkIcon
      case 'attachment':
        return FileUp
      case 'user':
        return User
      case 'rating':
        return Star
      default:
        return CircleDot
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Locations
            </h1>
            <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Manage your deployment locations
            </p>
          </div>

          {activeTab === 'locations' && (
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
          )}
        </div>

        {/* Tabs */}
        <div className={`flex gap-1 p-1 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
          <button
            onClick={() => setActiveTab('locations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'locations'
                ? isDark ? 'bg-white/10 text-white' : 'bg-white text-slate-900 shadow-sm'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Locations
          </button>
          <button
            onClick={() => setActiveTab('configuration')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'configuration'
                ? isDark ? 'bg-white/10 text-white' : 'bg-white text-slate-900 shadow-sm'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4" />
            Configuration
          </button>
        </div>
      </div>

      {/* Configuration Tab Content */}
      {activeTab === 'configuration' && (
        <div className="space-y-6">
          {/* Info Banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-200'
          }`}>
            <Info className={`w-5 h-5 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <div>
              <p className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-900'}`}>
                Configure Location Fields
              </p>
              <p className={`text-sm mt-1 ${isDark ? 'text-blue-300/70' : 'text-blue-700'}`}>
                Customize which fields are required or optional for your locations. Fields marked with a lock icon are required by the platform and cannot be made optional.
              </p>
            </div>
          </div>

          {configLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {/* System Fields by Category */}
              {Object.entries(groupedFields).map(([category, fields]) => {
                // Exclude auto-generated fields like 'code' from configuration
                const configurableFields = fields.filter(f => f.field_key !== 'code')
                if (configurableFields.length === 0) return null

                return (
                <div key={category} className={`rounded-2xl border overflow-hidden ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
                }`}>
                  <div className={`px-5 py-4 border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {categoryLabels[category] || category}
                    </h3>
                    <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {configurableFields.length} fields
                    </p>
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-white/5">
                    {configurableFields.map((field) => {
                      const config = getFieldConfig(field.id)
                      const isRequired = field.is_platform_required || (config?.is_required ?? false)
                      const isVisible = config?.is_visible ?? true
                      const FieldIcon = getFieldTypeIcon(field.field_type)

                      return (
                        <div
                          key={field.id}
                          className={`px-5 py-4 flex items-center gap-4 ${
                            !isVisible ? (isDark ? 'opacity-50' : 'opacity-40') : ''
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isDark ? 'bg-white/10' : 'bg-slate-100'
                          }`}>
                            <FieldIcon className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {field.field_label}
                              </p>
                              {field.is_platform_required && (
                                <Lock className="w-3.5 h-3.5 text-amber-500" />
                              )}
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {field.field_type}
                              </span>
                            </div>
                            <p className={`text-sm truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {field.help_text || field.placeholder || `Field key: ${field.field_key}`}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            {/* Visible Toggle */}
                            {!field.is_platform_required && (
                              <button
                                onClick={() => handleToggleFieldVisible(field.id, isVisible)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                  isVisible
                                    ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                                    : isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {isVisible ? 'Visible' : 'Hidden'}
                              </button>
                            )}

                            {/* Required Toggle */}
                            {field.is_client_configurable && !field.is_platform_required ? (
                              <button
                                onClick={() => handleToggleFieldRequired(field.id, isRequired)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                  isRequired
                                    ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                                    : isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {isRequired ? (
                                  <>
                                    <Lock className="w-3.5 h-3.5" />
                                    Required
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-3.5 h-3.5" />
                                    Optional
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                                isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                              }`}>
                                <Lock className="w-3.5 h-3.5" />
                                Platform Required
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )})}

              {/* Custom Fields Section */}
              <div className={`rounded-2xl border overflow-hidden ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
              }`}>
                <div className={`px-5 py-4 border-b flex items-center justify-between ${
                  isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'
                }`}>
                  <div>
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Custom Fields
                    </h3>
                    <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Add your own fields (stored in metadata)
                    </p>
                  </div>
                  <motion.button
                    onClick={() => setShowAddCustomField(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add Custom Field
                  </motion.button>
                </div>

                {customFields.length === 0 ? (
                  <div className={`px-5 py-12 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Type className="w-10 h-10 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">No custom fields yet</p>
                    <p className="text-sm mt-1">Add custom fields to capture additional information for your locations</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200 dark:divide-white/5">
                    {customFields.map((field) => {
                      const FieldIcon = getFieldTypeIcon(field.field_type)

                      return (
                        <div key={field.id} className="px-5 py-4 flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                          }`}>
                            <FieldIcon className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {field.field_label}
                              </p>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                              }`}>
                                custom
                              </span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {field.field_type}
                              </span>
                            </div>
                            <p className={`text-sm truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              Key: {field.field_key}
                              {field.help_text && ` • ${field.help_text}`}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1.5 rounded-lg text-sm ${
                              field.is_required
                                ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                                : isDark ? 'bg-white/5 text-slate-500' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {field.is_required ? 'Required' : 'Optional'}
                            </span>
                            <button
                              onClick={() => setEditingCustomField(field)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                              }`}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomField(field.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Locations Tab Content */}
      {activeTab === 'locations' && (
        <>
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

            {/* View Toggle */}
            <div className={`flex rounded-xl border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2.5 rounded-l-xl transition-colors ${
                  viewMode === 'cards'
                    ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-r-xl border-l transition-colors ${
                  isDark ? 'border-white/10' : 'border-slate-200'
                } ${
                  viewMode === 'list'
                    ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Locations - Card View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredLocations.map((location, index) => {
            const statusBadge = getStatusBadge(location.status)
            const StatusIcon = statusBadge.icon

            return (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ y: -4 }}
                className={`group relative rounded-2xl border overflow-hidden transition-all cursor-pointer ${
                  isDark
                    ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-blue-500/10'
                    : 'bg-white border-slate-200 hover:shadow-xl hover:shadow-slate-200/50'
                }`}
                onClick={() => setSelectedLocation(location)}
              >
                {/* Gradient accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getTypeColor(location.type)}`} />

                {/* Status indicator */}
                <div className="absolute top-4 right-4">
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                    <StatusIcon className="w-3 h-3" />
                    {location.status}
                  </span>
                </div>

                <div className="p-5 pt-6">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getTypeColor(location.type)} flex items-center justify-center shadow-lg shadow-black/20`}>
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 pr-16">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {location.code || `#${location.id.slice(0, 6)}`}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${
                          isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {location.type}
                        </span>
                      </div>
                      <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {location.name}
                      </h3>
                    </div>
                  </div>

                  {/* Address */}
                  <div className={`mt-4 flex items-start gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    <div className="text-sm leading-relaxed">
                      {location.address_line1 ? (
                        <>
                          <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{location.address_line1}</span>
                          {(location.city || location.country) && (
                            <span className="block">
                              {[location.city, location.state, location.country].filter(Boolean).join(', ')}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="italic">No address provided</span>
                      )}
                    </div>
                  </div>

                  {/* Contact info */}
                  {location.contact_name && (
                    <div className={`mt-3 flex items-center gap-2 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <User className="w-3.5 h-3.5" />
                      <span>{location.contact_name}</span>
                    </div>
                  )}

                  {/* Footer */}
                  <div className={`mt-4 pt-4 border-t flex items-center justify-between ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        <Globe className="w-3.5 h-3.5" />
                        via {location.source}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingLocation(location)
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                          isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteLocation(location.id)
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${
                          isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                      <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Locations - List View (Dynamic Fields) */}
      {viewMode === 'list' && (
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              {/* Table Header */}
              <thead>
                <tr className={`text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-500'
                }`}>
                  {/* Fixed columns */}
                  <th className={`sticky left-0 z-10 px-4 py-3 text-left min-w-[200px] ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>Location</th>
                  <th className="px-4 py-3 text-left min-w-[150px]">Location ID</th>
                  <th className="px-4 py-3 text-left min-w-[120px]">Client</th>
                  <th className="px-4 py-3 text-left min-w-[100px]">Status</th>

                  {/* Dynamic system fields */}
                  {fieldDefinitions
                    .filter((field) => {
                      const config = getFieldConfig(field.id)
                      return config?.is_visible !== false && !['name', 'type', 'code'].includes(field.field_key)
                    })
                    .map((field) => {
                      const config = getFieldConfig(field.id)
                      const label = config?.custom_label || field.field_label
                      return (
                        <th key={field.id} className="px-4 py-3 text-left min-w-[150px]">
                          {label}
                        </th>
                      )
                    })}

                  {/* Custom fields */}
                  {customFields
                    .filter(f => f.is_visible)
                    .map((field) => (
                      <th key={field.id} className="px-4 py-3 text-left min-w-[150px]">
                        <span className="flex items-center gap-1">
                          {field.field_label}
                          <span className={`text-[10px] px-1 py-0.5 rounded ${
                            isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                          }`}>custom</span>
                        </span>
                      </th>
                    ))}

                  {/* Actions column */}
                  <th className="sticky right-0 z-10 px-4 py-3 text-right bg-inherit min-w-[100px]">Actions</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {filteredLocations.map((location, index) => {
                  const statusBadge = getStatusBadge(location.status)
                  const StatusIcon = statusBadge.icon

                  return (
                    <motion.tr
                      key={location.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className={`cursor-pointer transition-colors ${
                        isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedLocation(location)}
                    >
                      {/* Location - Sticky */}
                      <td className={`sticky left-0 z-10 px-4 py-4 ${isDark ? 'bg-slate-900/95' : 'bg-white/95'} backdrop-blur-sm`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getTypeColor(location.type)} flex items-center justify-center shadow-md shrink-0`}>
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {location.name}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {location.code || `#${location.id.slice(0, 6)}`} • {location.type}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Location ID */}
                      <td className={`px-4 py-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <p className={`text-sm font-mono ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                          {location.location_id || '-'}
                        </p>
                      </td>

                      {/* Client */}
                      <td className={`px-4 py-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <p className="text-sm truncate max-w-[150px]">{location.client || '-'}</p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusBadge.bg} ${statusBadge.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {location.status}
                        </span>
                      </td>

                      {/* Dynamic system fields */}
                      {fieldDefinitions
                        .filter((field) => {
                          const config = getFieldConfig(field.id)
                          return config?.is_visible !== false && !['name', 'type', 'code'].includes(field.field_key)
                        })
                        .map((field) => {
                          const fieldKey = field.field_key as keyof Location
                          const value = location[fieldKey]

                          return (
                            <td key={field.id} className="px-4 py-4">
                              <p className={`text-sm truncate max-w-[200px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {value !== null && value !== undefined && value !== '' ? String(value) : '-'}
                              </p>
                            </td>
                          )
                        })}

                      {/* Custom fields */}
                      {customFields
                        .filter(f => f.is_visible)
                        .map((field) => {
                          const value = location.metadata?.[field.field_key]

                          return (
                            <td key={field.id} className="px-4 py-4">
                              <p className={`text-sm truncate max-w-[200px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {value !== null && value !== undefined && value !== '' ? String(value) : '-'}
                              </p>
                            </td>
                          )
                        })}

                      {/* Actions - Sticky */}
                      <td className={`sticky right-0 z-10 px-4 py-4 ${isDark ? 'bg-slate-900/95' : 'bg-white/95'} backdrop-blur-sm`}>
                        <div className="flex items-center justify-end gap-1">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingLocation(location)
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                            }`}
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteLocation(location.id)
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

      {/* Manual Entry Modal - Dynamic Fields */}
      <AnimatePresence>
        {addMethod === 'manual' && (
          <Modal title="Add Location - Manual Entry" onClose={closeModal} isDark={isDark} size="lg">
            <div className={`flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin ${isDark ? 'scrollbar-thumb-slate-700 scrollbar-track-transparent' : 'scrollbar-thumb-slate-300 scrollbar-track-transparent'}`} style={{ maxHeight: 'calc(85vh - 140px)' }}>
              {/* Required Fields Section */}
              {(() => {
                const requiredFields = fieldDefinitions.filter((field) => {
                  // Exclude auto-generated fields like 'code' (same as location_id)
                  if (field.field_key === 'code') return false
                  const config = getFieldConfig(field.id)
                  const isVisible = config?.is_visible !== false
                  const isRequired = field.is_platform_required || (config?.is_required ?? false)
                  return isVisible && isRequired
                })

                if (requiredFields.length === 0) return null

                return (
                  <div className="space-y-4">
                    <div className={`flex items-center gap-2 pb-2 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <h3 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Required Fields
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {requiredFields.map((field) => {
                        const config = getFieldConfig(field.id)
                        const label = config?.custom_label || field.field_label
                        const placeholder = config?.custom_placeholder || field.placeholder || ''
                        const fieldKey = field.field_key as keyof CreateLocationInput
                        const currentValue = manualForm[fieldKey] ?? ''

                        const handleChange = (value: string | number) => {
                          setManualForm({ ...manualForm, [fieldKey]: value })
                        }

                        return (
                          <div key={field.id} className={field.field_type === 'textarea' ? 'md:col-span-2' : ''}>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {label} <span className="text-red-400">*</span>
                            </label>

                            {field.field_key === 'client' ? (
                              <select
                                value={String(currentValue)}
                                onChange={(e) => handleChange(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-white'
                                    : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                              >
                                <option value="">Select Client</option>
                                {libraryClients.map((client) => (
                                  <option key={client.id} value={client.name}>{client.name}{client.code ? ` (${client.code})` : ''}</option>
                                ))}
                              </select>
                            ) : field.field_key === 'country' ? (
                              <select
                                value={String(currentValue)}
                                onChange={(e) => handleChange(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-white'
                                    : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                              >
                                <option value="">Select Country</option>
                                {libraryCountries.map((country) => (
                                  <option key={country.id} value={country.name}>{country.name}{country.code ? ` (${country.code})` : ''}</option>
                                ))}
                              </select>
                            ) : field.field_type === 'select' && field.options ? (
                              <select
                                value={String(currentValue)}
                                onChange={(e) => handleChange(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-white'
                                    : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                              >
                                <option value="">Select {label}</option>
                                {field.options.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            ) : field.field_type === 'textarea' ? (
                              <textarea
                                rows={3}
                                placeholder={placeholder}
                                value={String(currentValue)}
                                onChange={(e) => handleChange(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border resize-none ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                                }`}
                              />
                            ) : (
                              <input
                                type={field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : field.field_type === 'number' ? 'number' : 'text'}
                                placeholder={placeholder}
                                value={String(currentValue)}
                                onChange={(e) => handleChange(field.field_type === 'number' ? Number(e.target.value) : e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                                }`}
                              />
                            )}

                            {field.help_text && (
                              <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {field.help_text}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

              {/* Required Custom Fields */}
              {(() => {
                const requiredCustom = customFields.filter(f => f.is_visible && f.is_required)
                if (requiredCustom.length === 0) return null

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {requiredCustom.map((field) => {
                      const currentValue = (manualForm.metadata?.[field.field_key] as string) ?? ''

                      const handleCustomChange = (value: string) => {
                        setManualForm({
                          ...manualForm,
                          metadata: {
                            ...manualForm.metadata,
                            [field.field_key]: value,
                          },
                        })
                      }

                      return (
                        <div key={field.id} className={field.field_type === 'textarea' || field.field_type === 'multiselect' ? 'md:col-span-2' : ''}>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {field.field_label} <span className="text-red-400">*</span>
                          </label>

                          {field.field_type === 'select' && field.options ? (
                            <select
                              value={currentValue}
                              onChange={(e) => handleCustomChange(e.target.value)}
                              className={`w-full px-4 py-2.5 rounded-xl border ${
                                isDark
                                  ? 'bg-white/5 border-white/10 text-white'
                                  : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                            >
                              <option value="">Select {field.field_label}</option>
                              {field.options.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          ) : field.field_type === 'multiselect' && field.options ? (
                            <div className={`rounded-xl border p-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                              <div className="flex flex-wrap gap-2">
                                {field.options.map((opt) => {
                                  const selectedValues = currentValue ? currentValue.split(',') : []
                                  const isChecked = selectedValues.includes(opt.value)
                                  return (
                                    <label
                                      key={opt.value}
                                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                                        isChecked
                                          ? isDark
                                            ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                                            : 'bg-blue-50 border border-blue-200 text-blue-700'
                                          : isDark
                                            ? 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          const newValues = e.target.checked
                                            ? [...selectedValues, opt.value]
                                            : selectedValues.filter(v => v !== opt.value)
                                          handleCustomChange(newValues.join(','))
                                        }}
                                        className="sr-only"
                                      />
                                      <span className={`w-4 h-4 rounded flex items-center justify-center ${
                                        isChecked
                                          ? 'bg-blue-500 text-white'
                                          : isDark ? 'bg-white/10 border border-white/20' : 'bg-white border border-slate-300'
                                      }`}>
                                        {isChecked && <Check className="w-3 h-3" />}
                                      </span>
                                      <span className="text-sm font-medium">{opt.label}</span>
                                    </label>
                                  )
                                })}
                              </div>
                            </div>
                          ) : field.field_type === 'textarea' ? (
                            <textarea
                              rows={3}
                              placeholder={field.placeholder || ''}
                              value={currentValue}
                              onChange={(e) => handleCustomChange(e.target.value)}
                              className={`w-full px-4 py-2.5 rounded-xl border resize-none ${
                                isDark
                                  ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                              }`}
                            />
                          ) : field.field_type === 'checkbox' ? (
                            <label className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                              currentValue === 'true'
                                ? isDark
                                  ? 'bg-blue-500/20 border border-blue-500/50'
                                  : 'bg-blue-50 border border-blue-200'
                                : isDark
                                  ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                                  : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                            }`}>
                              <input
                                type="checkbox"
                                checked={currentValue === 'true'}
                                onChange={(e) => handleCustomChange(e.target.checked ? 'true' : 'false')}
                                className="sr-only"
                              />
                              <span className={`w-5 h-5 rounded flex items-center justify-center ${
                                currentValue === 'true'
                                  ? 'bg-blue-500 text-white'
                                  : isDark ? 'bg-white/10 border border-white/20' : 'bg-white border border-slate-300'
                              }`}>
                                {currentValue === 'true' && <Check className="w-3.5 h-3.5" />}
                              </span>
                              <span className={`text-sm font-medium ${
                                currentValue === 'true'
                                  ? isDark ? 'text-blue-400' : 'text-blue-700'
                                  : isDark ? 'text-slate-300' : 'text-slate-600'
                              }`}>
                                {field.help_text || 'Yes'}
                              </span>
                            </label>
                          ) : (
                            <input
                              type={field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : field.field_type === 'number' ? 'number' : 'text'}
                              placeholder={field.placeholder || ''}
                              value={currentValue}
                              onChange={(e) => handleCustomChange(e.target.value)}
                              className={`w-full px-4 py-2.5 rounded-xl border ${
                                isDark
                                  ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                              }`}
                            />
                          )}

                          {field.help_text && field.field_type !== 'checkbox' && (
                            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {field.help_text}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })()}

              {/* Optional Fields by Category */}
              {Object.entries(groupedFields).map(([category, fields]) => {
                const optionalFields = fields.filter((field) => {
                  // Exclude auto-generated fields like 'code' (same as location_id)
                  if (field.field_key === 'code') return false
                  const config = getFieldConfig(field.id)
                  const isVisible = config?.is_visible !== false
                  const isRequired = field.is_platform_required || (config?.is_required ?? false)
                  return isVisible && !isRequired
                })

                if (optionalFields.length === 0) return null

                return (
                  <div key={category} className="space-y-4">
                    <h3 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {categoryLabels[category] || category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {optionalFields.map((field) => {
                        const config = getFieldConfig(field.id)
                        const label = config?.custom_label || field.field_label
                        const placeholder = config?.custom_placeholder || field.placeholder || ''
                        const fieldKey = field.field_key as keyof CreateLocationInput
                        const currentValue = manualForm[fieldKey] ?? ''

                        const handleChange = (value: string | number) => {
                          setManualForm({ ...manualForm, [fieldKey]: value })
                        }

                        return (
                          <div key={field.id} className={field.field_type === 'textarea' ? 'md:col-span-2' : ''}>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {label}
                            </label>

                            {field.field_key === 'client' ? (
                              <select
                                value={String(currentValue)}
                                onChange={(e) => handleChange(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-white'
                                    : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                              >
                                <option value="">Select Client</option>
                                {libraryClients.map((client) => (
                                  <option key={client.id} value={client.name}>{client.name}{client.code ? ` (${client.code})` : ''}</option>
                                ))}
                              </select>
                            ) : field.field_key === 'country' ? (
                              <select
                                value={String(currentValue)}
                                onChange={(e) => handleChange(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-white'
                                    : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                              >
                                <option value="">Select Country</option>
                                {libraryCountries.map((country) => (
                                  <option key={country.id} value={country.name}>{country.name}{country.code ? ` (${country.code})` : ''}</option>
                                ))}
                              </select>
                            ) : field.field_type === 'select' && field.options ? (
                              <select
                                value={String(currentValue)}
                                onChange={(e) => handleChange(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-white'
                                    : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                              >
                                <option value="">Select {label}</option>
                                {field.options.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            ) : field.field_type === 'textarea' ? (
                              <textarea
                                rows={3}
                                placeholder={placeholder}
                                value={String(currentValue)}
                                onChange={(e) => handleChange(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border resize-none ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                                }`}
                              />
                            ) : (
                              <input
                                type={field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : field.field_type === 'number' ? 'number' : 'text'}
                                placeholder={placeholder}
                                value={String(currentValue)}
                                onChange={(e) => handleChange(field.field_type === 'number' ? Number(e.target.value) : e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                                }`}
                              />
                            )}

                            {field.help_text && (
                              <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {field.help_text}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Optional Custom Fields */}
              {(() => {
                const optionalCustom = customFields.filter(f => f.is_visible && !f.is_required)
                if (optionalCustom.length === 0) return null

                return (
                  <div className="space-y-4">
                    <h3 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Custom Fields
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {optionalCustom.map((field) => {
                        const currentValue = (manualForm.metadata?.[field.field_key] as string) ?? ''

                        const handleCustomChange = (value: string) => {
                          setManualForm({
                            ...manualForm,
                            metadata: {
                              ...manualForm.metadata,
                              [field.field_key]: value,
                            },
                          })
                        }

                        return (
                          <div key={field.id} className={field.field_type === 'textarea' ? 'md:col-span-2' : ''}>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {field.field_label}
                            </label>

                            {field.field_type === 'select' && field.options ? (
                              <select
                                value={currentValue}
                                onChange={(e) => handleCustomChange(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-white'
                                    : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                              >
                                <option value="">Select {field.field_label}</option>
                                {field.options.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            ) : field.field_type === 'multiselect' && field.options ? (
                              <div className={`rounded-xl border p-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="flex flex-wrap gap-2">
                                  {field.options.map((opt) => {
                                    const selectedValues = currentValue ? (typeof currentValue === 'string' ? currentValue.split(',') : []) : []
                                    const isChecked = selectedValues.includes(opt.value)
                                    return (
                                      <label
                                        key={opt.value}
                                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                                          isChecked
                                            ? isDark
                                              ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                                              : 'bg-blue-50 border border-blue-200 text-blue-700'
                                            : isDark
                                              ? 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={(e) => {
                                            const newValues = e.target.checked
                                              ? [...selectedValues, opt.value]
                                              : selectedValues.filter(v => v !== opt.value)
                                            handleCustomChange(newValues.join(','))
                                          }}
                                          className="sr-only"
                                        />
                                        <span className={`w-4 h-4 rounded flex items-center justify-center ${
                                          isChecked
                                            ? 'bg-blue-500 text-white'
                                            : isDark ? 'bg-white/10 border border-white/20' : 'bg-white border border-slate-300'
                                        }`}>
                                          {isChecked && <Check className="w-3 h-3" />}
                                        </span>
                                        <span className="text-sm font-medium">{opt.label}</span>
                                      </label>
                                    )
                                  })}
                                </div>
                              </div>
                            ) : field.field_type === 'textarea' ? (
                              <textarea
                                rows={3}
                                placeholder={field.placeholder || ''}
                                value={currentValue}
                                onChange={(e) => handleCustomChange(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border resize-none ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                                }`}
                              />
                            ) : field.field_type === 'checkbox' ? (
                              <label className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                                currentValue === 'true'
                                  ? isDark
                                    ? 'bg-blue-500/20 border border-blue-500/50'
                                    : 'bg-blue-50 border border-blue-200'
                                  : isDark
                                    ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                                    : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                              }`}>
                                <input
                                  type="checkbox"
                                  checked={currentValue === 'true'}
                                  onChange={(e) => handleCustomChange(e.target.checked ? 'true' : 'false')}
                                  className="sr-only"
                                />
                                <span className={`w-5 h-5 rounded flex items-center justify-center ${
                                  currentValue === 'true'
                                    ? 'bg-blue-500 text-white'
                                    : isDark ? 'bg-white/10 border border-white/20' : 'bg-white border border-slate-300'
                                }`}>
                                  {currentValue === 'true' && <Check className="w-3.5 h-3.5" />}
                                </span>
                                <span className={`text-sm font-medium ${
                                  currentValue === 'true'
                                    ? isDark ? 'text-blue-400' : 'text-blue-700'
                                    : isDark ? 'text-slate-300' : 'text-slate-600'
                                }`}>
                                  {field.help_text || 'Yes'}
                                </span>
                              </label>
                            ) : (
                              <input
                                type={field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : field.field_type === 'number' ? 'number' : 'text'}
                                placeholder={field.placeholder || ''}
                                value={currentValue}
                                onChange={(e) => handleCustomChange(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                                }`}
                              />
                            )}

                            {field.help_text && field.field_type !== 'checkbox' && (
                              <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {field.help_text}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Fixed Footer */}
            <div className={`flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t ${isDark ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-white'}`}>
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
              {/* Location ID */}
              {selectedLocation.location_id && (
                <div className={`p-4 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                  <div className="flex items-center gap-3">
                    <Hash className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                    <div>
                      <p className={`text-xs ${isDark ? 'text-amber-400/70' : 'text-amber-600/70'}`}>Location ID</p>
                      <p className={`font-mono font-semibold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                        {selectedLocation.location_id}
                      </p>
                    </div>
                  </div>
                </div>
              )}

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

      {/* Edit Location Modal - Dynamic Fields */}
      <AnimatePresence>
        {editingLocation && (
          <Modal title="Edit Location" onClose={() => setEditingLocation(null)} isDark={isDark} size="lg">
            <div className={`flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin ${isDark ? 'scrollbar-thumb-slate-700 scrollbar-track-transparent' : 'scrollbar-thumb-slate-300 scrollbar-track-transparent'}`} style={{ maxHeight: 'calc(85vh - 140px)' }}>
              {/* Status Field - Always show at top */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Status
                </label>
                <select
                  value={editingLocation.status}
                  onChange={(e) => setEditingLocation({ ...editingLocation, status: e.target.value as Location['status'] })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Dynamic Fields by Category */}
              {Object.entries(groupedFields).map(([category, fields]) => {
                // Filter to only visible fields
                const visibleFields = fields.filter((field) => {
                  // Exclude auto-generated fields like 'code' (same as location_id)
                  if (field.field_key === 'code') return false
                  const config = getFieldConfig(field.id)
                  return config?.is_visible !== false
                })

                if (visibleFields.length === 0) return null

                return (
                  <div key={category} className="space-y-4">
                    <h3 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {categoryLabels[category] || category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {visibleFields.map((field) => {
                        const config = getFieldConfig(field.id)
                        const isRequired = field.is_platform_required || (config?.is_required ?? false)
                        const label = config?.custom_label || field.field_label
                        const placeholder = config?.custom_placeholder || field.placeholder || ''

                        // Get current value from editingLocation
                        const fieldKey = field.field_key as keyof Location
                        const currentValue = editingLocation[fieldKey] ?? ''

                        // Handle field change
                        const handleChange = (value: string | number) => {
                          setEditingLocation({ ...editingLocation, [fieldKey]: value })
                        }

                        return (
                          <div key={field.id} className={field.field_type === 'textarea' ? 'md:col-span-2' : ''}>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              {label} {isRequired && <span className="text-red-400">*</span>}
                            </label>

                            {field.field_key === 'client' ? (
                              <select
                                value={String(currentValue)}
                                onChange={(e) => handleChange(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-white'
                                    : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                              >
                                <option value="">Select Client</option>
                                {libraryClients.map((client) => (
                                  <option key={client.id} value={client.name}>{client.name}{client.code ? ` (${client.code})` : ''}</option>
                                ))}
                              </select>
                            ) : field.field_key === 'country' ? (
                              <select
                                value={String(currentValue)}
                                onChange={(e) => handleChange(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-white'
                                    : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                              >
                                <option value="">Select Country</option>
                                {libraryCountries.map((country) => (
                                  <option key={country.id} value={country.name}>{country.name}{country.code ? ` (${country.code})` : ''}</option>
                                ))}
                              </select>
                            ) : field.field_type === 'select' && field.options ? (
                              <select
                                value={String(currentValue)}
                                onChange={(e) => handleChange(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-white'
                                    : 'bg-slate-50 border-slate-200 text-slate-900'
                                }`}
                              >
                                <option value="">Select {label}</option>
                                {field.options.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                            ) : field.field_type === 'textarea' ? (
                              <textarea
                                rows={3}
                                placeholder={placeholder}
                                value={String(currentValue)}
                                onChange={(e) => handleChange(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border resize-none ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                                }`}
                              />
                            ) : field.field_type === 'number' ? (
                              <input
                                type="number"
                                placeholder={placeholder}
                                value={currentValue === '' ? '' : Number(currentValue)}
                                onChange={(e) => handleChange(e.target.value ? Number(e.target.value) : '')}
                                className={`w-full px-4 py-2.5 rounded-xl border ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                                }`}
                              />
                            ) : (
                              <input
                                type={field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : 'text'}
                                placeholder={placeholder}
                                value={String(currentValue)}
                                onChange={(e) => handleChange(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border ${
                                  isDark
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                                }`}
                              />
                            )}

                            {field.help_text && (
                              <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {field.help_text}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Custom Fields */}
              {customFields.length > 0 && (
                <div className="space-y-4">
                  <h3 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Custom Fields
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customFields.filter(f => f.is_visible).map((field) => {
                      // Custom fields are stored in metadata
                      const currentValue = (editingLocation.metadata?.[field.field_key] as string) ?? ''

                      const handleCustomChange = (value: string) => {
                        setEditingLocation({
                          ...editingLocation,
                          metadata: {
                            ...editingLocation.metadata,
                            [field.field_key]: value,
                          },
                        })
                      }

                      return (
                        <div key={field.id} className={field.field_type === 'textarea' ? 'md:col-span-2' : ''}>
                          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {field.field_label} {field.is_required && <span className="text-red-400">*</span>}
                          </label>

                          {field.field_type === 'select' && field.options ? (
                            <select
                              value={currentValue}
                              onChange={(e) => handleCustomChange(e.target.value)}
                              className={`w-full px-4 py-2.5 rounded-xl border ${
                                isDark
                                  ? 'bg-white/5 border-white/10 text-white'
                                  : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                            >
                              <option value="">Select {field.field_label}</option>
                              {field.options.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          ) : field.field_type === 'multiselect' && field.options ? (
                            <div className={`rounded-xl border p-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                              <div className="flex flex-wrap gap-2">
                                {field.options.map((opt) => {
                                  const selectedValues = currentValue ? (typeof currentValue === 'string' ? currentValue.split(',') : []) : []
                                  const isChecked = selectedValues.includes(opt.value)
                                  return (
                                    <label
                                      key={opt.value}
                                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all ${
                                        isChecked
                                          ? isDark
                                            ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                                            : 'bg-blue-50 border border-blue-200 text-blue-700'
                                          : isDark
                                            ? 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => {
                                          const newValues = e.target.checked
                                            ? [...selectedValues, opt.value]
                                            : selectedValues.filter(v => v !== opt.value)
                                          handleCustomChange(newValues.join(','))
                                        }}
                                        className="sr-only"
                                      />
                                      <span className={`w-4 h-4 rounded flex items-center justify-center ${
                                        isChecked
                                          ? 'bg-blue-500 text-white'
                                          : isDark ? 'bg-white/10 border border-white/20' : 'bg-white border border-slate-300'
                                      }`}>
                                        {isChecked && <Check className="w-3 h-3" />}
                                      </span>
                                      <span className="text-sm font-medium">{opt.label}</span>
                                    </label>
                                  )
                                })}
                              </div>
                            </div>
                          ) : field.field_type === 'textarea' ? (
                            <textarea
                              rows={3}
                              placeholder={field.placeholder || ''}
                              value={currentValue}
                              onChange={(e) => handleCustomChange(e.target.value)}
                              className={`w-full px-4 py-2.5 rounded-xl border resize-none ${
                                isDark
                                  ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                              }`}
                            />
                          ) : field.field_type === 'checkbox' ? (
                            <label className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                              currentValue === 'true'
                                ? isDark
                                  ? 'bg-blue-500/20 border border-blue-500/50'
                                  : 'bg-blue-50 border border-blue-200'
                                : isDark
                                  ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                                  : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                            }`}>
                              <input
                                type="checkbox"
                                checked={currentValue === 'true'}
                                onChange={(e) => handleCustomChange(e.target.checked ? 'true' : 'false')}
                                className="sr-only"
                              />
                              <span className={`w-5 h-5 rounded flex items-center justify-center ${
                                currentValue === 'true'
                                  ? 'bg-blue-500 text-white'
                                  : isDark ? 'bg-white/10 border border-white/20' : 'bg-white border border-slate-300'
                              }`}>
                                {currentValue === 'true' && <Check className="w-3.5 h-3.5" />}
                              </span>
                              <span className={`text-sm font-medium ${
                                currentValue === 'true'
                                  ? isDark ? 'text-blue-400' : 'text-blue-700'
                                  : isDark ? 'text-slate-300' : 'text-slate-600'
                              }`}>
                                {field.help_text || 'Yes'}
                              </span>
                            </label>
                          ) : (
                            <input
                              type={field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : field.field_type === 'number' ? 'number' : 'text'}
                              placeholder={field.placeholder || ''}
                              value={currentValue}
                              onChange={(e) => handleCustomChange(e.target.value)}
                              className={`w-full px-4 py-2.5 rounded-xl border ${
                                isDark
                                  ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                              }`}
                            />
                          )}

                          {field.help_text && field.field_type !== 'checkbox' && (
                            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {field.help_text}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Footer */}
            <div className={`flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t ${isDark ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-white'}`}>
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
        </>
      )}

      {/* Add Custom Field Modal */}
      <AnimatePresence>
        {showAddCustomField && (
          <Modal title="Add Custom Field" onClose={() => setShowAddCustomField(false)} isDark={isDark} size="lg">
            <div className={`flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-thin ${isDark ? 'scrollbar-thumb-slate-700 scrollbar-track-transparent' : 'scrollbar-thumb-slate-300 scrollbar-track-transparent'}`} style={{ maxHeight: 'calc(85vh - 140px)' }}>
              {/* Field Label */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Field Label *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Building Access Code"
                  value={newCustomField.field_label}
                  onChange={(e) => setNewCustomField({ ...newCustomField, field_label: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              {/* Field Type Selection */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Field Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { value: 'text', label: 'Single line text', icon: 'A' },
                    { value: 'textarea', label: 'Long text', icon: '≡' },
                    { value: 'select', label: 'Single select', icon: '○' },
                    { value: 'multiselect', label: 'Multiple select', icon: '☰' },
                    { value: 'checkbox', label: 'Checkbox', icon: '☑' },
                    { value: 'date', label: 'Date', icon: '📅' },
                    { value: 'number', label: 'Number', icon: '#' },
                    { value: 'currency', label: 'Currency', icon: '$' },
                    { value: 'percent', label: 'Percent', icon: '%' },
                    { value: 'phone', label: 'Phone number', icon: '📞' },
                    { value: 'email', label: 'Email', icon: '✉' },
                    { value: 'url', label: 'URL', icon: '🔗' },
                    { value: 'attachment', label: 'Attachment', icon: '📎' },
                    { value: 'user', label: 'User', icon: '👤' },
                    { value: 'duration', label: 'Duration', icon: '⏱' },
                    { value: 'rating', label: 'Rating', icon: '⭐' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setNewCustomField({ ...newCustomField, field_type: type.value as FieldType, options: [] })}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                        newCustomField.field_type === type.value
                          ? isDark
                            ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                            : 'bg-blue-50 border-blue-500 text-blue-600'
                          : isDark
                            ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base w-5 text-center">{type.icon}</span>
                      <span className="text-sm truncate">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Options Editor for Select/Multi-select */}
              {(newCustomField.field_type === 'select' || newCustomField.field_type === 'multiselect') && (
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Options
                  </label>
                  <div className="space-y-2">
                    {newCustomField.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Option label"
                          value={option.label}
                          onChange={(e) => {
                            const newOptions = [...newCustomField.options]
                            newOptions[index] = { ...option, label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') }
                            setNewCustomField({ ...newCustomField, options: newOptions })
                          }}
                          className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                            isDark
                              ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                              : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = newCustomField.options.filter((_, i) => i !== index)
                            setNewCustomField({ ...newCustomField, options: newOptions })
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setNewCustomField({
                          ...newCustomField,
                          options: [...newCustomField.options, { value: '', label: '' }]
                        })
                      }}
                      className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed text-sm transition-colors ${
                        isDark
                          ? 'border-white/20 text-slate-400 hover:border-white/40 hover:text-slate-300'
                          : 'border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      Add option
                    </button>
                  </div>
                </div>
              )}

              {/* Placeholder (for text-based fields) */}
              {['text', 'textarea', 'email', 'phone', 'url', 'number', 'currency', 'percent'].includes(newCustomField.field_type) && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Placeholder
                  </label>
                  <input
                    type="text"
                    placeholder="Placeholder text shown in the field"
                    value={newCustomField.placeholder}
                    onChange={(e) => setNewCustomField({ ...newCustomField, placeholder: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              )}

              {/* Help Text */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Help Text
                </label>
                <input
                  type="text"
                  placeholder="Brief description of the field"
                  value={newCustomField.help_text}
                  onChange={(e) => setNewCustomField({ ...newCustomField, help_text: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              {/* Required checkbox */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_required"
                  checked={newCustomField.is_required}
                  onChange={(e) => setNewCustomField({ ...newCustomField, is_required: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label htmlFor="is_required" className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Make this field required
                </label>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className={`flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t ${isDark ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-white'}`}>
              <button
                onClick={() => setShowAddCustomField(false)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
                  isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <motion.button
                onClick={handleCreateCustomField}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25"
              >
                Create Field
              </motion.button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Edit Custom Field Modal */}
      <AnimatePresence>
        {editingCustomField && (
          <Modal title="Edit Custom Field" onClose={() => setEditingCustomField(null)} isDark={isDark} size="lg">
            <div className={`flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-thin ${isDark ? 'scrollbar-thumb-slate-700 scrollbar-track-transparent' : 'scrollbar-thumb-slate-300 scrollbar-track-transparent'}`} style={{ maxHeight: 'calc(85vh - 140px)' }}>
              {/* Field Label */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Field Label *
                </label>
                <input
                  type="text"
                  value={editingCustomField.field_label}
                  onChange={(e) => setEditingCustomField({ ...editingCustomField, field_label: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Field Type Selection */}
              <div>
                <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Field Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { value: 'text', label: 'Single line text', icon: 'A' },
                    { value: 'textarea', label: 'Long text', icon: '≡' },
                    { value: 'select', label: 'Single select', icon: '○' },
                    { value: 'multiselect', label: 'Multiple select', icon: '☰' },
                    { value: 'checkbox', label: 'Checkbox', icon: '☑' },
                    { value: 'date', label: 'Date', icon: '📅' },
                    { value: 'number', label: 'Number', icon: '#' },
                    { value: 'currency', label: 'Currency', icon: '$' },
                    { value: 'percent', label: 'Percent', icon: '%' },
                    { value: 'phone', label: 'Phone number', icon: '📞' },
                    { value: 'email', label: 'Email', icon: '✉' },
                    { value: 'url', label: 'URL', icon: '🔗' },
                    { value: 'attachment', label: 'Attachment', icon: '📎' },
                    { value: 'user', label: 'User', icon: '👤' },
                    { value: 'duration', label: 'Duration', icon: '⏱' },
                    { value: 'rating', label: 'Rating', icon: '⭐' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setEditingCustomField({ ...editingCustomField, field_type: type.value as FieldType })}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all ${
                        editingCustomField.field_type === type.value
                          ? isDark
                            ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                            : 'bg-blue-50 border-blue-500 text-blue-600'
                          : isDark
                            ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base w-5 text-center">{type.icon}</span>
                      <span className="text-sm truncate">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Options Editor for Select/Multi-select */}
              {(editingCustomField.field_type === 'select' || editingCustomField.field_type === 'multiselect') && (
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Options
                  </label>
                  <div className="space-y-2">
                    {(editingCustomField.options || []).map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Option label"
                          value={option.label}
                          onChange={(e) => {
                            const newOptions = [...(editingCustomField.options || [])]
                            newOptions[index] = { ...option, label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '_') }
                            setEditingCustomField({ ...editingCustomField, options: newOptions })
                          }}
                          className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                            isDark
                              ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                              : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = (editingCustomField.options || []).filter((_, i) => i !== index)
                            setEditingCustomField({ ...editingCustomField, options: newOptions })
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCustomField({
                          ...editingCustomField,
                          options: [...(editingCustomField.options || []), { value: '', label: '' }]
                        })
                      }}
                      className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-dashed text-sm transition-colors ${
                        isDark
                          ? 'border-white/20 text-slate-400 hover:border-white/40 hover:text-slate-300'
                          : 'border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      Add option
                    </button>
                  </div>
                </div>
              )}

              {/* Placeholder (for text-based fields) */}
              {['text', 'textarea', 'email', 'phone', 'url', 'number', 'currency', 'percent'].includes(editingCustomField.field_type) && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Placeholder
                  </label>
                  <input
                    type="text"
                    value={editingCustomField.placeholder || ''}
                    onChange={(e) => setEditingCustomField({ ...editingCustomField, placeholder: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              )}

              {/* Help Text */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Help Text
                </label>
                <input
                  type="text"
                  value={editingCustomField.help_text || ''}
                  onChange={(e) => setEditingCustomField({ ...editingCustomField, help_text: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Required checkbox */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="edit_is_required"
                  checked={editingCustomField.is_required}
                  onChange={(e) => setEditingCustomField({ ...editingCustomField, is_required: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <label htmlFor="edit_is_required" className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Make this field required
                </label>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className={`flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t ${isDark ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-white'}`}>
              <button
                onClick={() => setEditingCustomField(null)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
                  isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <motion.button
                onClick={handleUpdateCustomField}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25"
              >
                Save Changes
              </motion.button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
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
        className={`w-full ${size === 'lg' ? 'max-w-2xl' : 'max-w-lg'} max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl ${
          isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
        }`}
      >
        {/* Fixed Header */}
        <div className={`flex-shrink-0 flex items-center justify-between px-6 py-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
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
        {/* Scrollable Content */}
        {children}
      </motion.div>
    </motion.div>
  )

  if (!mounted) return null

  return createPortal(modalContent, document.body)
}
