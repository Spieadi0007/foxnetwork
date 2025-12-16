'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase,
  Search,
  Clock,
  CheckCircle,
  MapPin,
  Calendar,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  LayoutGrid,
  List,
  FolderKanban,
  AlertCircle,
  Pause,
  XCircle,
  PlayCircle,
  ClipboardCheck,
  Settings,
  GitBranch,
  Activity,
} from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/contexts/theme-context'
import { toast } from 'sonner'
import {
  getServices,
  createService,
  updateService,
  deleteService,
  getServiceStats,
  getProjectsForSelect,
  getServiceTypesForProject,
  getWorkflowSteps,
  getStepStatuses,
} from '@/lib/actions/services'
import { getResolvedServiceFields } from '@/lib/actions/service-field-config'
import type {
  Service,
  CreateServiceInput,
  ServiceStatus,
  ServiceUrgency,
  ResolvedServiceField,
  PartUsed,
} from '@/types/projects'

export default function ServicesPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // State
  const [services, setServices] = useState<Service[]>([])
  const [projects, setProjects] = useState<Array<{
    id: string
    name: string
    project_id?: string
    project_type?: string
    location_id: string
    location?: { id: string; name: string; city?: string; country?: string }
  }>>([])
  const [serviceTypes, setServiceTypes] = useState<Array<{ id: string; name: string; code?: string }>>([])
  const [workflowSteps, setWorkflowSteps] = useState<Array<{ id: string; name: string; code?: string }>>([])
  const [stepStatuses, setStepStatuses] = useState<Array<{ id: string; name: string; code?: string }>>([])
  const [resolvedFields, setResolvedFields] = useState<ResolvedServiceField[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterUrgency, setFilterUrgency] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [editingService, setEditingService] = useState<Service | null>(null)

  // Form states
  const [formLoading, setFormLoading] = useState(false)
  const [createForm, setCreateForm] = useState<CreateServiceInput & { metadata?: Record<string, unknown> }>({
    project_id: '',
    service_type_id: '',
    step_id: '',
    step_status_id: '',
    title: '',
    description: '',
    reference_number: '',
    urgency: 'scheduled',
    scheduled_date: '',
    scheduled_start_time: '',
    scheduled_end_time: '',
    status: 'scheduled',
    // Travel tracking
    departure_time: '',
    arrival_time: '',
    travel_duration: undefined,
    // Parts/Materials
    parts_used: [],
    // Signatures
    customer_signature: '',
    technician_signature: '',
    notes: '',
    metadata: {},
  })

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    inProgress: 0,
    pendingApproval: 0,
    completed: 0,
    cancelled: 0,
  })

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [servicesRes, statsRes, projectsRes, fieldsRes, stepsRes, stepStatusesRes] = await Promise.all([
        getServices(),
        getServiceStats(),
        getProjectsForSelect(),
        getResolvedServiceFields(),
        getWorkflowSteps(),
        getStepStatuses(),
      ])

      if (servicesRes.data) setServices(servicesRes.data)
      if (statsRes.data) setStats(statsRes.data)
      if (projectsRes.data) setProjects(projectsRes.data)
      if (fieldsRes.data) setResolvedFields(fieldsRes.data)
      if (stepsRes.data) setWorkflowSteps(stepsRes.data)
      if (stepStatusesRes.data) setStepStatuses(stepStatusesRes.data)
    } catch {
      toast.error('Failed to load services')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter services
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.service_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.reference_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.location?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.project?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.project?.project_id?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || service.status === filterStatus
    const matchesUrgency = filterUrgency === 'all' || service.urgency === filterUrgency
    return matchesSearch && matchesStatus && matchesUrgency
  })

  // Get selected project's location
  const getProjectLocation = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    return project?.location || null
  }

  // Load service types when project is selected
  const loadServiceTypesForProject = async (projectId: string) => {
    if (!projectId) {
      setServiceTypes([])
      return
    }
    const result = await getServiceTypesForProject(projectId)
    if (result.data) {
      setServiceTypes(result.data)
    } else {
      setServiceTypes([])
    }
  }

  // Handlers
  const handleCreateService = async () => {
    if (!createForm.project_id) {
      toast.error('Project is required')
      return
    }

    // Verify project exists
    const selectedProject = projects.find(p => p.id === createForm.project_id)
    if (!selectedProject) {
      toast.error('Invalid project selected')
      return
    }

    setFormLoading(true)
    try {
      // Location is auto-derived from project on the server
      const result = await createService({
        ...createForm,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Service created successfully')
        setShowCreateModal(false)
        resetCreateForm()
        loadData()
      }
    } catch {
      toast.error('Failed to create service')
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateService = async () => {
    if (!editingService) return

    if (!editingService.project_id) {
      toast.error('Project is required')
      return
    }

    // Verify project exists
    const selectedProject = projects.find(p => p.id === editingService.project_id)
    if (!selectedProject) {
      toast.error('Invalid project selected')
      return
    }

    setFormLoading(true)
    try {
      // Location is auto-derived from project on the server
      const result = await updateService(editingService.id, {
        project_id: editingService.project_id,
        service_type_id: editingService.service_type_id,
        step_id: editingService.step_id,
        step_status_id: editingService.step_status_id,
        title: editingService.title,
        description: editingService.description,
        reference_number: editingService.reference_number,
        urgency: editingService.urgency,
        scheduled_date: editingService.scheduled_date,
        scheduled_start_time: editingService.scheduled_start_time,
        scheduled_end_time: editingService.scheduled_end_time,
        status: editingService.status,
        // Travel tracking
        departure_time: editingService.departure_time,
        arrival_time: editingService.arrival_time,
        travel_duration: editingService.travel_duration,
        // Parts/Materials
        parts_used: editingService.parts_used,
        // Signatures
        customer_signature: editingService.customer_signature,
        technician_signature: editingService.technician_signature,
        notes: editingService.notes,
        metadata: editingService.metadata as Record<string, unknown>,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Service updated successfully')
        setEditingService(null)
        loadData()
      }
    } catch {
      toast.error('Failed to update service')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return

    try {
      const result = await deleteService(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Service deleted')
        loadData()
      }
    } catch {
      toast.error('Failed to delete service')
    }
  }

  const resetCreateForm = () => {
    setCreateForm({
      project_id: '',
      service_type_id: '',
      step_id: '',
      step_status_id: '',
      title: '',
      description: '',
      reference_number: '',
      urgency: 'scheduled',
      scheduled_date: '',
      scheduled_start_time: '',
      scheduled_end_time: '',
      status: 'scheduled',
      // Travel tracking
      departure_time: '',
      arrival_time: '',
      travel_duration: undefined,
      // Parts/Materials
      parts_used: [],
      // Signatures
      customer_signature: '',
      technician_signature: '',
      notes: '',
      metadata: {},
    })
    setServiceTypes([]) // Clear service types when form is reset
  }

  // UI Helpers
  const getStatusBadge = (status: ServiceStatus) => {
    switch (status) {
      case 'scheduled':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Calendar, label: 'Scheduled' }
      case 'in_progress':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: PlayCircle, label: 'In Progress' }
      case 'pending_approval':
        return { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: ClipboardCheck, label: 'Pending Approval' }
      case 'completed':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle, label: 'Completed' }
      case 'cancelled':
        return { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle, label: 'Cancelled' }
      case 'on_hold':
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: Pause, label: 'On Hold' }
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: Clock, label: status }
    }
  }

  const getUrgencyBadge = (urgency: ServiceUrgency) => {
    switch (urgency) {
      case 'scheduled':
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Scheduled' }
      case 'same_day':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Same Day' }
      case 'emergency':
        return { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Emergency' }
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', label: urgency }
    }
  }

  const getUrgencyColor = (urgency: ServiceUrgency) => {
    switch (urgency) {
      case 'scheduled':
        return 'from-blue-500 to-cyan-600'
      case 'same_day':
        return 'from-amber-500 to-orange-600'
      case 'emergency':
        return 'from-red-500 to-rose-600'
      default:
        return 'from-slate-500 to-slate-600'
    }
  }

  // Dynamic field rendering for Create form
  const renderCreateField = (field: ResolvedServiceField) => {
    if (!field.isVisible) return null

    // Skip project_id as it's handled separately with location display
    if (field.key === 'project_id') return null

    const isCustom = field.isCustomField
    const fieldKey = field.key
    const value = isCustom
      ? createForm.metadata?.[fieldKey]
      : createForm[fieldKey as keyof CreateServiceInput]

    const updateValue = (newValue: unknown) => {
      if (isCustom) {
        setCreateForm({
          ...createForm,
          metadata: { ...createForm.metadata, [fieldKey]: newValue },
        })
      } else {
        setCreateForm({ ...createForm, [fieldKey]: newValue })
      }
    }

    const inputClassName = `w-full px-4 py-2.5 rounded-xl border ${
      isDark
        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
    }`

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <div key={field.key}>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {field.label} {field.isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'url' ? 'url' : 'text'}
              value={(value as string) || ''}
              onChange={(e) => updateValue(e.target.value)}
              placeholder={field.placeholder}
              className={inputClassName}
            />
            {field.helpText && (
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{field.helpText}</p>
            )}
          </div>
        )
      case 'textarea':
        return (
          <div key={field.key} className="md:col-span-2">
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {field.label} {field.isRequired && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={(value as string) || ''}
              onChange={(e) => updateValue(e.target.value)}
              rows={3}
              placeholder={field.placeholder}
              className={inputClassName}
            />
            {field.helpText && (
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{field.helpText}</p>
            )}
          </div>
        )
      case 'number':
        return (
          <div key={field.key}>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {field.label} {field.isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              value={(value as number) || ''}
              onChange={(e) => updateValue(e.target.value ? Number(e.target.value) : '')}
              placeholder={field.placeholder}
              className={inputClassName}
            />
          </div>
        )
      case 'date':
        return (
          <div key={field.key}>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {field.label} {field.isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="date"
              value={(value as string) || ''}
              onChange={(e) => updateValue(e.target.value)}
              className={inputClassName}
            />
          </div>
        )
      case 'time':
        return (
          <div key={field.key}>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {field.label} {field.isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="time"
              value={(value as string) || ''}
              onChange={(e) => updateValue(e.target.value)}
              className={inputClassName}
            />
          </div>
        )
      case 'select':
        return (
          <div key={field.key}>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {field.label} {field.isRequired && <span className="text-red-500">*</span>}
            </label>
            <select
              value={(value as string) || ''}
              onChange={(e) => updateValue(e.target.value)}
              className={inputClassName}
            >
              <option value="">Select...</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )
      case 'checkbox':
        return (
          <div key={field.key} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => updateValue(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300"
            />
            <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {field.label} {field.isRequired && <span className="text-red-500">*</span>}
            </label>
          </div>
        )
      default:
        return null
    }
  }

  // Dynamic field rendering for Edit form
  const renderEditField = (field: ResolvedServiceField) => {
    if (!field.isVisible || !editingService) return null

    // Skip project_id as it's handled separately with location display
    if (field.key === 'project_id') return null

    const isCustom = field.isCustomField
    const fieldKey = field.key
    const value = isCustom
      ? (editingService.metadata as Record<string, unknown>)?.[fieldKey]
      : editingService[fieldKey as keyof Service]

    const updateValue = (newValue: unknown) => {
      if (isCustom) {
        setEditingService({
          ...editingService,
          metadata: { ...(editingService.metadata as Record<string, unknown>), [fieldKey]: newValue },
        })
      } else {
        setEditingService({ ...editingService, [fieldKey]: newValue } as Service)
      }
    }

    const inputClassName = `w-full px-4 py-2.5 rounded-xl border ${
      isDark
        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
    }`

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
        return (
          <div key={field.key}>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {field.label} {field.isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'url' ? 'url' : 'text'}
              value={(value as string) || ''}
              onChange={(e) => updateValue(e.target.value)}
              placeholder={field.placeholder}
              className={inputClassName}
            />
            {field.helpText && (
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{field.helpText}</p>
            )}
          </div>
        )
      case 'textarea':
        return (
          <div key={field.key} className="md:col-span-2">
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {field.label} {field.isRequired && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={(value as string) || ''}
              onChange={(e) => updateValue(e.target.value)}
              rows={3}
              placeholder={field.placeholder}
              className={inputClassName}
            />
            {field.helpText && (
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{field.helpText}</p>
            )}
          </div>
        )
      case 'number':
        return (
          <div key={field.key}>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {field.label} {field.isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="number"
              value={(value as number) || ''}
              onChange={(e) => updateValue(e.target.value ? Number(e.target.value) : '')}
              placeholder={field.placeholder}
              className={inputClassName}
            />
          </div>
        )
      case 'date':
        return (
          <div key={field.key}>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {field.label} {field.isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="date"
              value={(value as string) || ''}
              onChange={(e) => updateValue(e.target.value)}
              className={inputClassName}
            />
          </div>
        )
      case 'time':
        return (
          <div key={field.key}>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {field.label} {field.isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              type="time"
              value={(value as string) || ''}
              onChange={(e) => updateValue(e.target.value)}
              className={inputClassName}
            />
          </div>
        )
      case 'select':
        return (
          <div key={field.key}>
            <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {field.label} {field.isRequired && <span className="text-red-500">*</span>}
            </label>
            <select
              value={(value as string) || ''}
              onChange={(e) => updateValue(e.target.value)}
              className={inputClassName}
            >
              <option value="">Select...</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )
      case 'checkbox':
        return (
          <div key={field.key} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => updateValue(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300"
            />
            <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {field.label} {field.isRequired && <span className="text-red-500">*</span>}
            </label>
          </div>
        )
      default:
        return null
    }
  }

  // Fields that are handled specially (not in the dynamic form)
  const excludedFields = ['project_id', 'location_id', 'service_id', 'service_type_id', 'step_id', 'step_status_id']

  // Get required fields (platform required or client required)
  const requiredFields = resolvedFields.filter(f => f.isRequired && f.isVisible && !excludedFields.includes(f.key))
  const optionalFields = resolvedFields.filter(f => !f.isRequired && f.isVisible && !excludedFields.includes(f.key))

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
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Services</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage service visits and scheduled work
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/services/settings"
            className={`p-2.5 rounded-xl transition-colors ${
              isDark
                ? 'bg-white/5 hover:bg-white/10 text-slate-400'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
            }`}
            title="Field Configuration"
          >
            <Settings className="w-5 h-5" />
          </Link>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-5 h-5" />
            New Service
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'blue', icon: Briefcase },
          { label: 'Scheduled', value: stats.scheduled, color: 'cyan', icon: Calendar },
          { label: 'In Progress', value: stats.inProgress, color: 'amber', icon: PlayCircle },
          { label: 'Pending', value: stats.pendingApproval, color: 'purple', icon: ClipboardCheck },
          { label: 'Completed', value: stats.completed, color: 'emerald', icon: CheckCircle },
          { label: 'Cancelled', value: stats.cancelled, color: 'red', icon: XCircle },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                <stat.icon
                  className={`w-5 h-5 ${
                    stat.color === 'blue'
                      ? 'text-blue-500'
                      : stat.color === 'cyan'
                        ? 'text-cyan-500'
                        : stat.color === 'amber'
                          ? 'text-amber-500'
                          : stat.color === 'purple'
                            ? 'text-purple-500'
                            : stat.color === 'emerald'
                              ? 'text-emerald-500'
                              : 'text-red-500'
                  }`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div
        className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
            />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-2.5 rounded-xl border transition-all ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2.5 rounded-xl border ${
              isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filterUrgency}
            onChange={(e) => setFilterUrgency(e.target.value)}
            className={`px-4 py-2.5 rounded-xl border ${
              isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <option value="all">All Urgency</option>
            <option value="scheduled">Scheduled</option>
            <option value="same_day">Same Day</option>
            <option value="emergency">Emergency</option>
          </select>

          {/* View Toggle */}
          <div className={`flex rounded-xl border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2.5 rounded-l-xl transition-colors ${
                viewMode === 'cards'
                  ? isDark
                    ? 'bg-white/10 text-white'
                    : 'bg-slate-100 text-slate-900'
                  : isDark
                    ? 'text-slate-500 hover:text-white'
                    : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-r-xl transition-colors ${
                viewMode === 'list'
                  ? isDark
                    ? 'bg-white/10 text-white'
                    : 'bg-slate-100 text-slate-900'
                  : isDark
                    ? 'text-slate-500 hover:text-white'
                    : 'text-slate-400 hover:text-slate-900'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Services Grid/List */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredServices.map((service, index) => {
            const statusBadge = getStatusBadge(service.status)
            const StatusIcon = statusBadge.icon
            const urgencyBadge = getUrgencyBadge(service.urgency)

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-2xl border overflow-hidden transition-all ${
                  isDark
                    ? 'bg-white/5 border-white/10 hover:border-white/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg'
                }`}
              >
                {/* Gradient accent bar */}
                <div className={`h-1 bg-gradient-to-r ${getUrgencyColor(service.urgency)}`} />

                {/* Header */}
                <div className={`p-5 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getUrgencyColor(service.urgency)} flex items-center justify-center shadow-lg`}
                      >
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                            {service.service_id || service.reference_number || `#${service.id.slice(0, 8)}`}
                          </span>
                          {service.service_type && (
                            <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                              {service.service_type}
                            </span>
                          )}
                          <span
                            className={`text-xs px-2 py-0.5 rounded capitalize ${urgencyBadge.bg} ${urgencyBadge.text}`}
                          >
                            {urgencyBadge.label}
                          </span>
                        </div>
                        <h3 className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {service.title || 'Service Visit'}
                        </h3>
                        {/* Workflow Step & Status */}
                        {(service.step || service.step_status) && (
                          <div className="flex items-center gap-2 mt-1.5">
                            {service.step && (
                              <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                                <GitBranch className="w-3 h-3" />
                                {service.step}
                              </span>
                            )}
                            {service.step_status && (
                              <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${
                                service.step_status.toLowerCase().includes('track')
                                  ? (isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700')
                                  : service.step_status.toLowerCase().includes('delay')
                                    ? (isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700')
                                    : service.step_status.toLowerCase().includes('block') || service.step_status.toLowerCase().includes('cancel')
                                      ? (isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700')
                                      : (isDark ? 'bg-slate-500/20 text-slate-300' : 'bg-slate-100 text-slate-700')
                              }`}>
                                <Activity className="w-3 h-3" />
                                {service.step_status}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <span
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {statusBadge.label}
                    </span>
                  </div>

                  {service.description && (
                    <p className={`text-sm mt-3 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {service.description}
                    </p>
                  )}
                </div>

                {/* Details */}
                <div className="p-5">
                  <div
                    className={`flex flex-wrap items-center gap-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    {service.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {service.location.name}
                        {service.location.city && `, ${service.location.city}`}
                      </span>
                    )}
                    {service.project && (
                      <span className="flex items-center gap-1.5">
                        <FolderKanban className="w-4 h-4" />
                        {service.project.name}
                      </span>
                    )}
                    {service.scheduled_date && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(service.scheduled_date).toLocaleDateString()}
                      </span>
                    )}
                    {service.actions_count !== undefined && service.actions_count > 0 && (
                      <span className="flex items-center gap-1.5">
                        <ClipboardCheck className="w-4 h-4" />
                        {service.actions_count} actions
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={`flex items-center justify-end gap-2 mt-4 pt-4 border-t border-dashed ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                    <button
                      onClick={() => setSelectedService(service)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                      }`}
                    >
                      <AlertCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingService(service)
                        if (service.project_id) {
                          loadServiceTypesForProject(service.project_id)
                        }
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        // List View - Dynamic Fields with Horizontal Scroll
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className={`text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-500'
                }`}>
                  {/* Fixed columns - Service */}
                  <th className={`sticky left-0 z-10 px-4 py-3 text-left min-w-[200px] ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    Service
                  </th>
                  <th className="px-4 py-3 text-left min-w-[120px]">Project</th>
                  <th className="px-4 py-3 text-left min-w-[150px]">Location</th>
                  <th className="px-4 py-3 text-left min-w-[100px]">Status</th>
                  <th className="px-4 py-3 text-left min-w-[100px]">Urgency</th>

                  {/* Dynamic fields from resolved fields */}
                  {resolvedFields
                    .filter(f => f.isVisible && !['project_id', 'title', 'reference_number', 'status', 'urgency'].includes(f.key))
                    .map((field) => (
                      <th key={field.key} className="px-4 py-3 text-left min-w-[150px]">
                        <span className="flex items-center gap-1">
                          {field.label}
                          {field.isCustomField && (
                            <span className={`text-[10px] px-1 py-0.5 rounded ${
                              isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                            }`}>custom</span>
                          )}
                        </span>
                      </th>
                    ))}

                  {/* Actions column - Sticky right */}
                  <th className={`sticky right-0 z-10 px-4 py-3 text-right min-w-[100px] ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {filteredServices.map((service, index) => {
                  const statusBadge = getStatusBadge(service.status)
                  const StatusIcon = statusBadge.icon
                  const urgencyBadge = getUrgencyBadge(service.urgency)

                  return (
                    <motion.tr
                      key={service.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className={`cursor-pointer transition-colors ${
                        isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedService(service)}
                    >
                      {/* Service - Sticky */}
                      <td className={`sticky left-0 z-10 px-4 py-4 ${isDark ? 'bg-slate-900/95' : 'bg-white/95'} backdrop-blur-sm`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getUrgencyColor(service.urgency)} flex items-center justify-center shadow-md shrink-0`}>
                            <Briefcase className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {service.title || 'Service Visit'}
                            </p>
                            <p className={`text-xs font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                              {service.service_id || service.reference_number || `#${service.id.slice(0, 8)}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Project */}
                      <td className={`px-4 py-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <p className="truncate max-w-[150px]">{service.project?.name || '-'}</p>
                      </td>

                      {/* Location */}
                      <td className={`px-4 py-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <p className="truncate max-w-[150px]">
                          {service.location?.name || '-'}
                          {service.location?.city && <span className="text-xs opacity-70"> ({service.location.city})</span>}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusBadge.bg} ${statusBadge.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Urgency */}
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${urgencyBadge.bg} ${urgencyBadge.text}`}>
                          {urgencyBadge.label}
                        </span>
                      </td>

                      {/* Dynamic fields */}
                      {resolvedFields
                        .filter(f => f.isVisible && !['project_id', 'title', 'reference_number', 'status', 'urgency'].includes(f.key))
                        .map((field) => {
                          const fieldKey = field.key as keyof Service
                          const value = field.isCustomField
                            ? (service.metadata as Record<string, unknown>)?.[field.key]
                            : service[fieldKey]

                          // Format value based on type
                          let displayValue: string = '-'
                          if (value !== null && value !== undefined && value !== '') {
                            if (field.type === 'date' && typeof value === 'string') {
                              displayValue = new Date(value).toLocaleDateString()
                            } else if (field.type === 'checkbox') {
                              displayValue = value ? 'Yes' : 'No'
                            } else if (field.type === 'select' && field.options?.length) {
                              const opt = field.options.find(o => o.value === value)
                              displayValue = opt?.label || String(value)
                            } else {
                              displayValue = String(value)
                            }
                          }

                          return (
                            <td key={field.key} className="px-4 py-4">
                              <p className={`text-sm truncate max-w-[200px] ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                {displayValue}
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
                              setSelectedService(service)
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                          >
                            <AlertCircle className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingService(service)
                              if (service.project_id) {
                                loadServiceTypesForProject(service.project_id)
                              }
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteService(service.id)
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'}`}
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

      {filteredServices.length === 0 && (
        <div
          className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}
        >
          <Briefcase className={`w-12 h-12 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
          <p className={`mt-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No services found</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Create your first service to get started
          </p>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            New Service
          </motion.button>
        </div>
      )}

      {/* Create Service Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl ${
                isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              {/* Header */}
              <div
                className={`sticky top-0 z-10 flex items-center justify-between p-5 border-b ${
                  isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600">
                    <Briefcase className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Create New Service
                  </h2>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="p-5 space-y-6">
                {/* Project and Location (always required, handled specially) */}
                <div className="space-y-4">
                  <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Project & Location
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Project (required - determines location and service types) */}
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Project <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={createForm.project_id}
                        onChange={(e) => {
                          const projectId = e.target.value
                          setCreateForm({ ...createForm, project_id: projectId, service_type_id: '' })
                          loadServiceTypesForProject(projectId)
                        }}
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        <option value="">Select a project</option>
                        {projects.map((proj) => (
                          <option key={proj.id} value={proj.id}>
                            {proj.project_id || proj.name} {proj.project_type && `(${proj.project_type})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Service Type (from library, based on project type) */}
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Service Type
                      </label>
                      <select
                        value={createForm.service_type_id || ''}
                        onChange={(e) => setCreateForm({ ...createForm, service_type_id: e.target.value })}
                        disabled={!createForm.project_id || serviceTypes.length === 0}
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        } ${(!createForm.project_id || serviceTypes.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value="">{!createForm.project_id ? 'Select a project first' : serviceTypes.length === 0 ? 'No service types available' : 'Select service type'}</option>
                        {serviceTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name} {type.code && `(${type.code})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Location (auto-filled from project, read-only display) */}
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Location <span className={`text-xs font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>(from project)</span>
                      </label>
                      <div
                        className={`w-full px-4 py-2.5 rounded-xl border flex items-center gap-2 ${
                          isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        <MapPin className="w-4 h-4" />
                        {createForm.project_id ? (
                          <>
                            {getProjectLocation(createForm.project_id)?.name || 'Loading...'}
                            {getProjectLocation(createForm.project_id)?.city && (
                              <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                ({getProjectLocation(createForm.project_id)?.city})
                              </span>
                            )}
                          </>
                        ) : (
                          <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Select a project first</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workflow Step & Status */}
                {(workflowSteps.length > 0 || stepStatuses.length > 0) && (
                  <div className="space-y-4">
                    <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-blue-500' : 'bg-blue-500'}`} />
                      Workflow
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Workflow Step */}
                      <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Workflow Step
                        </label>
                        <select
                          value={createForm.step_id || ''}
                          onChange={(e) => setCreateForm({ ...createForm, step_id: e.target.value })}
                          className={`w-full px-4 py-2.5 rounded-xl border ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        >
                          <option value="">Select step</option>
                          {workflowSteps.map((step) => (
                            <option key={step.id} value={step.id}>
                              {step.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Step Status */}
                      <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Step Status
                        </label>
                        <select
                          value={createForm.step_status_id || ''}
                          onChange={(e) => setCreateForm({ ...createForm, step_status_id: e.target.value })}
                          className={`w-full px-4 py-2.5 rounded-xl border ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        >
                          <option value="">Select status</option>
                          {stepStatuses.map((status) => (
                            <option key={status.id} value={status.id}>
                              {status.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Required Fields (from configuration) */}
                {requiredFields.length > 0 && (
                  <div className="space-y-4">
                    <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Required Fields
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {requiredFields.map(renderCreateField)}
                    </div>
                  </div>
                )}

                {/* Optional Fields (from configuration) */}
                {optionalFields.length > 0 && (
                  <div className="space-y-4">
                    <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-400'}`} />
                      Optional Fields
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {optionalFields.map(renderCreateField)}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                className={`sticky bottom-0 flex items-center justify-end gap-3 p-5 border-t ${
                  isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
                }`}
              >
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`px-5 py-2.5 rounded-xl font-medium ${
                    isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleCreateService}
                  disabled={formLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium disabled:opacity-50"
                >
                  {formLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Create Service'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Service Modal */}
      <AnimatePresence>
        {editingService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditingService(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl ${
                isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              {/* Header */}
              <div
                className={`sticky top-0 z-10 flex items-center justify-between p-5 border-b ${
                  isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600">
                    <Edit className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Edit Service
                  </h2>
                </div>
                <button
                  onClick={() => setEditingService(null)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="p-5 space-y-6">
                {/* Project and Location (always required, handled specially) */}
                <div className="space-y-4">
                  <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Project & Location
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Project */}
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Project <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={editingService.project_id || ''}
                        onChange={(e) => {
                          const projectId = e.target.value
                          const project = projects.find(p => p.id === projectId)
                          setEditingService({
                            ...editingService,
                            project_id: projectId || undefined,
                            location_id: project?.location_id || editingService.location_id,
                            service_type_id: undefined, // Clear service type when project changes
                            service_type: undefined,
                          } as Service)
                          loadServiceTypesForProject(projectId)
                        }}
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        <option value="">Select a project</option>
                        {projects.map((proj) => (
                          <option key={proj.id} value={proj.id}>
                            {proj.project_id || proj.name} {proj.project_type && `(${proj.project_type})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Service Type (from library, based on project type) */}
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Service Type
                      </label>
                      <select
                        value={editingService.service_type_id || ''}
                        onChange={(e) => {
                          const selectedType = serviceTypes.find(t => t.id === e.target.value)
                          setEditingService({
                            ...editingService,
                            service_type_id: e.target.value || undefined,
                            service_type: selectedType?.name,
                          } as Service)
                        }}
                        disabled={!editingService.project_id || serviceTypes.length === 0}
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        } ${(!editingService.project_id || serviceTypes.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value="">{!editingService.project_id ? 'Select a project first' : serviceTypes.length === 0 ? 'No service types available' : 'Select service type'}</option>
                        {serviceTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name} {type.code && `(${type.code})`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Location (read-only, from project) */}
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Location <span className={`text-xs font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>(from project)</span>
                      </label>
                      <div
                        className={`w-full px-4 py-2.5 rounded-xl border flex items-center gap-2 ${
                          isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        <MapPin className="w-4 h-4" />
                        {editingService.project_id ? (
                          <>
                            {getProjectLocation(editingService.project_id)?.name || editingService.location?.name || 'Loading...'}
                            {(getProjectLocation(editingService.project_id)?.city || editingService.location?.city) && (
                              <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                ({getProjectLocation(editingService.project_id)?.city || editingService.location?.city})
                              </span>
                            )}
                          </>
                        ) : (
                          <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Select a project first</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Workflow Step & Status */}
                {(workflowSteps.length > 0 || stepStatuses.length > 0) && (
                  <div className="space-y-4">
                    <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-blue-500' : 'bg-blue-500'}`} />
                      Workflow
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Workflow Step */}
                      <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Workflow Step
                        </label>
                        <select
                          value={editingService.step_id || ''}
                          onChange={(e) => {
                            const selectedStep = workflowSteps.find(s => s.id === e.target.value)
                            setEditingService({
                              ...editingService,
                              step_id: e.target.value || undefined,
                              step: selectedStep?.name,
                            } as Service)
                          }}
                          className={`w-full px-4 py-2.5 rounded-xl border ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        >
                          <option value="">Select step</option>
                          {workflowSteps.map((step) => (
                            <option key={step.id} value={step.id}>
                              {step.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Step Status */}
                      <div>
                        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          Step Status
                        </label>
                        <select
                          value={editingService.step_status_id || ''}
                          onChange={(e) => {
                            const selectedStatus = stepStatuses.find(s => s.id === e.target.value)
                            setEditingService({
                              ...editingService,
                              step_status_id: e.target.value || undefined,
                              step_status: selectedStatus?.name,
                            } as Service)
                          }}
                          className={`w-full px-4 py-2.5 rounded-xl border ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        >
                          <option value="">Select status</option>
                          {stepStatuses.map((status) => (
                            <option key={status.id} value={status.id}>
                              {status.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Required Fields (from configuration) */}
                {requiredFields.length > 0 && (
                  <div className="space-y-4">
                    <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Required Fields
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {requiredFields.map(renderEditField)}
                    </div>
                  </div>
                )}

                {/* Optional Fields (from configuration) */}
                {optionalFields.length > 0 && (
                  <div className="space-y-4">
                    <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-400'}`} />
                      Optional Fields
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {optionalFields.map(renderEditField)}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                className={`sticky bottom-0 flex items-center justify-end gap-3 p-5 border-t ${
                  isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
                }`}
              >
                <button
                  onClick={() => setEditingService(null)}
                  className={`px-5 py-2.5 rounded-xl font-medium ${
                    isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleUpdateService}
                  disabled={formLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium disabled:opacity-50"
                >
                  {formLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Save Changes'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedService(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border shadow-2xl ${
                isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              {/* Header */}
              <div
                className={`sticky top-0 z-10 p-5 border-b backdrop-blur-xl ${
                  isDark ? 'bg-slate-900/90 border-white/10' : 'bg-white/90 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getUrgencyColor(selectedService.urgency)} flex items-center justify-center`}
                    >
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-mono ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                          {selectedService.service_id || selectedService.reference_number || `#${selectedService.id.slice(0, 8)}`}
                        </span>
                        {selectedService.service_type && (
                          <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                            {selectedService.service_type}
                          </span>
                        )}
                      </div>
                      <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {selectedService.title || 'Service Visit'}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedService(null)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-6">
                {selectedService.description && (
                  <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{selectedService.description}</p>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Location</p>
                    <p className={`font-medium mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedService.location?.name || '-'}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Project</p>
                    <p className={`font-medium mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedService.project?.name || 'Standalone'}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Status</p>
                    <p className={`font-medium mt-1 capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedService.status.replace('_', ' ')}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Urgency</p>
                    <p className={`font-medium mt-1 capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedService.urgency.replace('_', ' ')}
                    </p>
                  </div>
                  {selectedService.step && (
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Workflow Step</p>
                      <p className={`font-medium mt-1 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <GitBranch className="w-4 h-4 text-blue-500" />
                        {selectedService.step}
                      </p>
                    </div>
                  )}
                  {selectedService.step_status && (
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Step Status</p>
                      <p className={`font-medium mt-1 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <Activity className={`w-4 h-4 ${
                          selectedService.step_status.toLowerCase().includes('track') ? 'text-green-500'
                            : selectedService.step_status.toLowerCase().includes('delay') ? 'text-yellow-500'
                            : selectedService.step_status.toLowerCase().includes('block') || selectedService.step_status.toLowerCase().includes('cancel') ? 'text-red-500'
                            : 'text-slate-500'
                        }`} />
                        {selectedService.step_status}
                      </p>
                    </div>
                  )}
                  {selectedService.scheduled_date && (
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Scheduled Date</p>
                      <p className={`font-medium mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {new Date(selectedService.scheduled_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {(selectedService.scheduled_start_time || selectedService.scheduled_end_time) && (
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Time</p>
                      <p className={`font-medium mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {selectedService.scheduled_start_time || '?'} - {selectedService.scheduled_end_time || '?'}
                      </p>
                    </div>
                  )}
                  {selectedService.actions_count !== undefined && (
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Actions</p>
                      <p className={`font-medium mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {selectedService.actions_count} actions
                      </p>
                    </div>
                  )}
                </div>

                {/* Travel Tracking */}
                {(selectedService.departure_time || selectedService.arrival_time || selectedService.travel_duration) && (
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Travel Tracking
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedService.departure_time && (
                        <div>
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Departure</p>
                          <p className={`font-medium mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {new Date(selectedService.departure_time).toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                      {selectedService.arrival_time && (
                        <div>
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Arrival</p>
                          <p className={`font-medium mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {new Date(selectedService.arrival_time).toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                      {selectedService.travel_duration && (
                        <div>
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Duration</p>
                          <p className={`font-medium mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {selectedService.travel_duration} min
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Parts Used */}
                {selectedService.parts_used && selectedService.parts_used.length > 0 && (
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Parts Used
                    </h3>
                    <div className="space-y-2">
                      {selectedService.parts_used.map((part, idx) => (
                        <div key={idx} className={`flex items-center justify-between py-2 ${idx > 0 ? `border-t ${isDark ? 'border-white/10' : 'border-slate-200'}` : ''}`}>
                          <div>
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{part.name}</p>
                            {part.part_code && (
                              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Code: {part.part_code}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>x{part.quantity}</p>
                            {part.cost && (
                              <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                {part.currency || '€'}{part.cost.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signatures */}
                {(selectedService.customer_signature || selectedService.technician_signature) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedService.customer_signature && (
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Customer Signature</p>
                        <p className={`font-medium mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>✓ Signed</p>
                      </div>
                    )}
                    {selectedService.technician_signature && (
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Technician Signature</p>
                        <p className={`font-medium mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>✓ Signed</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {selectedService.notes && (
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Notes
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {selectedService.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={`p-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <div className="flex items-center justify-end gap-3">
                  <motion.button
                    onClick={() => {
                      setSelectedService(null)
                      setEditingService(selectedService)
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-5 py-2.5 rounded-xl font-medium ${
                      isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Edit Service
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium"
                  >
                    View Actions
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
