'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderKanban,
  Search,
  Clock,
  CheckCircle,
  Check,
  MapPin,
  Calendar,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  LayoutGrid,
  List,
  DollarSign,
  FileText,
  Briefcase,
  ArrowUpRight,
  Pause,
  XCircle,
  Settings,
} from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/contexts/theme-context'
import { toast } from 'sonner'
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  getLocationsForSelect,
  getProjectTypesForSelect,
} from '@/lib/actions/projects'
import { getResolvedProjectFields } from '@/lib/actions/project-field-config'
import type {
  Project,
  CreateProjectInput,
  ProjectStatus,
  ProjectPriority,
  ResolvedProjectField,
} from '@/types/projects'

// Project type from library
interface ProjectTypeOption {
  id: string
  name: string
  code?: string
}

export default function ProjectsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // State
  const [projects, setProjects] = useState<Project[]>([])
  const [locations, setLocations] = useState<Array<{ id: string; name: string; code?: string; city?: string }>>([])
  const [projectTypes, setProjectTypes] = useState<ProjectTypeOption[]>([])
  const [resolvedFields, setResolvedFields] = useState<ResolvedProjectField[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterProjectType, setFilterProjectType] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  // Form states
  const [formLoading, setFormLoading] = useState(false)
  const [createForm, setCreateForm] = useState<CreateProjectInput & { metadata?: Record<string, unknown> }>({
    location_id: '',
    // name and code are auto-generated from project_id
    description: '',
    project_type_id: '',
    billing_model: 'fixed',
    sla_tier: 'standard',
    status: 'draft',
    priority: 'medium',
    start_date: '',
    target_end_date: '',
    estimated_value: undefined,
    currency: 'EUR',
    // Client Info is at Location level, not Project level
    notes: '',
    metadata: {},
  })

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    draft: 0,
    completed: 0,
    onHold: 0,
  })

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [projectsRes, statsRes, locationsRes, projectTypesRes, fieldsRes] = await Promise.all([
        getProjects(),
        getProjectStats(),
        getLocationsForSelect(),
        getProjectTypesForSelect(),
        getResolvedProjectFields(),
      ])

      if (projectsRes.data) setProjects(projectsRes.data)
      if (statsRes.data) setStats(statsRes.data)
      if (locationsRes.data) setLocations(locationsRes.data)
      if (projectTypesRes.data) setProjectTypes(projectTypesRes.data)
      if (fieldsRes.data) setResolvedFields(fieldsRes.data)
    } catch {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      // code field removed - search by project_id instead
      project.project_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.location?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    const matchesType = filterProjectType === 'all' || (project.project_type || '') === filterProjectType
    return matchesSearch && matchesStatus && matchesType
  })

  // Handlers
  const handleCreateProject = async () => {
    if (!createForm.location_id || !createForm.project_type_id) {
      toast.error('Location and project type are required')
      return
    }

    setFormLoading(true)
    try {
      const result = await createProject(createForm)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Project created successfully')
        setShowCreateModal(false)
        resetCreateForm()
        loadData()
      }
    } catch {
      toast.error('Failed to create project')
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateProject = async () => {
    if (!editingProject) return

    setFormLoading(true)
    try {
      const result = await updateProject(editingProject.id, {
        location_id: editingProject.location_id,
        name: editingProject.name,
        description: editingProject.description,
        // code field removed
        project_type_id: editingProject.project_type_id,
        billing_model: editingProject.billing_model,
        sla_tier: editingProject.sla_tier,
        status: editingProject.status,
        priority: editingProject.priority,
        start_date: editingProject.start_date,
        target_end_date: editingProject.target_end_date,
        estimated_value: editingProject.estimated_value,
        currency: editingProject.currency,
        // Client Info is at Location level, not Project level
        notes: editingProject.notes,
        metadata: editingProject.metadata as Record<string, unknown>,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Project updated successfully')
        setEditingProject(null)
        loadData()
      }
    } catch {
      toast.error('Failed to update project')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const result = await deleteProject(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Project deleted')
        loadData()
      }
    } catch {
      toast.error('Failed to delete project')
    }
  }

  const resetCreateForm = () => {
    setCreateForm({
      location_id: '',
      // name and code are auto-generated from project_id
      description: '',
      project_type_id: '',
      billing_model: 'fixed',
      sla_tier: 'standard',
      status: 'draft',
      priority: 'medium',
      start_date: '',
      target_end_date: '',
      estimated_value: undefined,
      currency: 'EUR',
      // Client Info is at Location level, not Project level
      notes: '',
      metadata: {},
    })
  }

  // UI Helpers
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'draft':
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: FileText, label: 'Draft' }
      case 'active':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: Clock, label: 'Active' }
      case 'on_hold':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: Pause, label: 'On Hold' }
      case 'completed':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: CheckCircle, label: 'Completed' }
      case 'cancelled':
        return { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle, label: 'Cancelled' }
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', icon: Clock, label: status }
    }
  }

  const getProjectTypeColor = (type: string) => {
    switch (type) {
      case 'deployment':
        return 'from-blue-500 to-cyan-600'
      case 'maintenance':
        return 'from-amber-500 to-orange-600'
      case 'break-fix':
        return 'from-red-500 to-rose-600'
      case 'ad-hoc':
        return 'from-purple-500 to-pink-600'
      default:
        return 'from-slate-500 to-slate-600'
    }
  }

  const getPriorityBadge = (priority: ProjectPriority) => {
    switch (priority) {
      case 'low':
        return { bg: 'bg-slate-500/20', text: 'text-slate-400' }
      case 'medium':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400' }
      case 'high':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400' }
      case 'urgent':
        return { bg: 'bg-red-500/20', text: 'text-red-400' }
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400' }
    }
  }

  // Get visible fields sorted by required first, then by display order
  // Exclude auto-generated/hidden fields (name, project_id, code) from the form
  const getVisibleFields = () => {
    const autoGeneratedKeys = ['name', 'project_id', 'code']
    const visibleFields = resolvedFields.filter(
      (f) => f.isVisible && !autoGeneratedKeys.includes(f.key)
    )
    const requiredFields = visibleFields.filter((f) => f.isRequired)
    const optionalFields = visibleFields.filter((f) => !f.isRequired)
    return { requiredFields, optionalFields }
  }

  // Render a single dynamic field for create form
  const renderCreateField = (field: ResolvedProjectField) => {
    // Custom fields are stored in metadata, system fields are on the form directly
    const isCustom = field.isCustomField
    const fieldKey = field.key
    const value = isCustom
      ? createForm.metadata?.[fieldKey]
      : createForm[fieldKey as keyof CreateProjectInput]

    // Helper to update the value
    const updateValue = (newValue: unknown) => {
      if (isCustom) {
        setCreateForm({
          ...createForm,
          metadata: {
            ...createForm.metadata,
            [fieldKey]: newValue,
          },
        })
      } else {
        setCreateForm({ ...createForm, [fieldKey]: newValue })
      }
    }

    // Special handling for location_id - use dropdown with locations
    if (field.key === 'location_id') {
      return (
        <div key={field.key}>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {field.label} {field.isRequired && <span className="text-red-500">*</span>}
          </label>
          <select
            value={(value as string) || ''}
            onChange={(e) => updateValue(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <option value="">Select a location</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} {loc.city && `(${loc.city})`}
              </option>
            ))}
          </select>
          {field.helpText && (
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{field.helpText}</p>
          )}
        </div>
      )
    }

    // Special handling for project_type_id - use dropdown with library project types
    if (field.key === 'project_type_id' || field.key === 'project_type') {
      return (
        <div key={field.key}>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Project Type {field.isRequired && <span className="text-red-500">*</span>}
          </label>
          <select
            value={createForm.project_type_id || ''}
            onChange={(e) => setCreateForm({ ...createForm, project_type_id: e.target.value })}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <option value="">Select a project type</option>
            {projectTypes.map((pt) => (
              <option key={pt.id} value={pt.id}>
                {pt.name} {pt.code && `(${pt.code})`}
              </option>
            ))}
          </select>
          {projectTypes.length === 0 && (
            <p className={`mt-1 text-xs ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              No project types found. Add them in Library → Project Types
            </p>
          )}
          {field.helpText && projectTypes.length > 0 && (
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{field.helpText}</p>
          )}
        </div>
      )
    }

    // Handle select fields
    if (field.type === 'select' && field.options.length > 0) {
      return (
        <div key={field.key}>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {field.label} {field.isRequired && <span className="text-red-500">*</span>}
          </label>
          <select
            value={(value as string) || field.defaultValue || ''}
            onChange={(e) => updateValue(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {field.helpText && (
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{field.helpText}</p>
          )}
        </div>
      )
    }

    // Handle multiselect fields - styled chip/pill buttons
    if (field.type === 'multiselect' && field.options.length > 0) {
      const currentValue = (value as string) || ''
      const selectedValues = currentValue ? currentValue.split(',') : []
      return (
        <div key={field.key}>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {field.label} {field.isRequired && <span className="text-red-500">*</span>}
          </label>
          <div className={`rounded-xl border p-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex flex-wrap gap-2">
              {field.options.map((opt) => {
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
                        updateValue(newValues.join(','))
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
          {field.helpText && (
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{field.helpText}</p>
          )}
        </div>
      )
    }

    // Handle checkbox fields - styled toggle
    if (field.type === 'checkbox') {
      const isChecked = value === true || value === 'true'
      return (
        <div key={field.key}>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {field.label} {field.isRequired && <span className="text-red-500">*</span>}
          </label>
          <label className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
            isChecked
              ? isDark
                ? 'bg-blue-500/20 border border-blue-500/50'
                : 'bg-blue-50 border border-blue-200'
              : isDark
                ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
          }`}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => updateValue(e.target.checked ? 'true' : 'false')}
              className="sr-only"
            />
            <span className={`w-5 h-5 rounded flex items-center justify-center ${
              isChecked
                ? 'bg-blue-500 text-white'
                : isDark ? 'bg-white/10 border border-white/20' : 'bg-white border border-slate-300'
            }`}>
              {isChecked && <Check className="w-3.5 h-3.5" />}
            </span>
            <span className={`text-sm font-medium ${
              isChecked
                ? isDark ? 'text-blue-400' : 'text-blue-700'
                : isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {field.helpText || 'Yes'}
            </span>
          </label>
        </div>
      )
    }

    // Handle textarea
    if (field.type === 'textarea') {
      return (
        <div key={field.key}>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {field.label} {field.isRequired && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={(value as string) || ''}
            onChange={(e) => updateValue(e.target.value)}
            rows={3}
            placeholder={field.placeholder || ''}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
            }`}
          />
          {field.helpText && (
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{field.helpText}</p>
          )}
        </div>
      )
    }

    // Handle number fields
    if (field.type === 'number') {
      return (
        <div key={field.key}>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {field.label} {field.isRequired && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            value={(value as number) || ''}
            onChange={(e) => updateValue(e.target.value ? Number(e.target.value) : undefined)}
            placeholder={field.placeholder || ''}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
            }`}
          />
          {field.helpText && (
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{field.helpText}</p>
          )}
        </div>
      )
    }

    // Handle date fields
    if (field.type === 'date') {
      return (
        <div key={field.key}>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {field.label} {field.isRequired && <span className="text-red-500">*</span>}
          </label>
          <input
            type="date"
            value={(value as string) || ''}
            onChange={(e) => updateValue(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          />
          {field.helpText && (
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{field.helpText}</p>
          )}
        </div>
      )
    }

    // Default: text input (also handles email, phone, url)
    return (
      <div key={field.key}>
        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {field.label} {field.isRequired && <span className="text-red-500">*</span>}
        </label>
        <input
          type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'url' ? 'url' : 'text'}
          value={(value as string) || ''}
          onChange={(e) => updateValue(e.target.value)}
          placeholder={field.placeholder || ''}
          className={`w-full px-4 py-2.5 rounded-xl border ${
            isDark
              ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
              : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
          }`}
        />
        {field.helpText && (
          <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{field.helpText}</p>
        )}
      </div>
    )
  }

  // Render a single dynamic field for edit form
  const renderEditField = (field: ResolvedProjectField) => {
    if (!editingProject) return null

    // Custom fields are stored in metadata, system fields are on the project directly
    const isCustom = field.isCustomField
    const fieldKey = field.key
    const value = isCustom
      ? (editingProject.metadata as Record<string, unknown>)?.[fieldKey]
      : editingProject[fieldKey as keyof Project]

    // Helper to update the value
    const updateValue = (newValue: unknown) => {
      if (isCustom) {
        setEditingProject({
          ...editingProject,
          metadata: {
            ...(editingProject.metadata as Record<string, unknown>),
            [fieldKey]: newValue,
          },
        })
      } else {
        setEditingProject({ ...editingProject, [fieldKey]: newValue })
      }
    }

    // Special handling for location_id - use dropdown with locations
    if (field.key === 'location_id') {
      return (
        <div key={field.key}>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {field.label} {field.isRequired && <span className="text-red-500">*</span>}
          </label>
          <select
            value={(value as string) || ''}
            onChange={(e) => updateValue(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <option value="">Select a location</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} {loc.city && `(${loc.city})`}
              </option>
            ))}
          </select>
          {field.helpText && (
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{field.helpText}</p>
          )}
        </div>
      )
    }

    // Special handling for project_type_id - use dropdown with library project types
    if (field.key === 'project_type_id' || field.key === 'project_type') {
      return (
        <div key={field.key}>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Project Type {field.isRequired && <span className="text-red-500">*</span>}
          </label>
          <select
            value={editingProject.project_type_id || ''}
            onChange={(e) => setEditingProject({ ...editingProject, project_type_id: e.target.value })}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <option value="">Select a project type</option>
            {projectTypes.map((pt) => (
              <option key={pt.id} value={pt.id}>
                {pt.name} {pt.code && `(${pt.code})`}
              </option>
            ))}
          </select>
          {projectTypes.length === 0 && (
            <p className={`mt-1 text-xs ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              No project types found. Add them in Library → Project Types
            </p>
          )}
          {field.helpText && projectTypes.length > 0 && (
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{field.helpText}</p>
          )}
        </div>
      )
    }

    // Handle select fields
    if (field.type === 'select' && field.options.length > 0) {
      return (
        <div key={field.key}>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {field.label} {field.isRequired && <span className="text-red-500">*</span>}
          </label>
          <select
            value={(value as string) || ''}
            onChange={(e) => updateValue(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {field.helpText && (
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{field.helpText}</p>
          )}
        </div>
      )
    }

    // Handle multiselect fields - styled chip/pill buttons
    if (field.type === 'multiselect' && field.options.length > 0) {
      const currentValue = (value as string) || ''
      const selectedValues = currentValue ? currentValue.split(',') : []
      return (
        <div key={field.key}>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {field.label} {field.isRequired && <span className="text-red-500">*</span>}
          </label>
          <div className={`rounded-xl border p-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex flex-wrap gap-2">
              {field.options.map((opt) => {
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
                        updateValue(newValues.join(','))
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
          {field.helpText && (
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{field.helpText}</p>
          )}
        </div>
      )
    }

    // Handle checkbox fields - styled toggle
    if (field.type === 'checkbox') {
      const isChecked = value === true || value === 'true'
      return (
        <div key={field.key}>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {field.label} {field.isRequired && <span className="text-red-500">*</span>}
          </label>
          <label className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
            isChecked
              ? isDark
                ? 'bg-blue-500/20 border border-blue-500/50'
                : 'bg-blue-50 border border-blue-200'
              : isDark
                ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
          }`}>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => updateValue(e.target.checked ? 'true' : 'false')}
              className="sr-only"
            />
            <span className={`w-5 h-5 rounded flex items-center justify-center ${
              isChecked
                ? 'bg-blue-500 text-white'
                : isDark ? 'bg-white/10 border border-white/20' : 'bg-white border border-slate-300'
            }`}>
              {isChecked && <Check className="w-3.5 h-3.5" />}
            </span>
            <span className={`text-sm font-medium ${
              isChecked
                ? isDark ? 'text-blue-400' : 'text-blue-700'
                : isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              {field.helpText || 'Yes'}
            </span>
          </label>
        </div>
      )
    }

    // Handle textarea
    if (field.type === 'textarea') {
      return (
        <div key={field.key}>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {field.label} {field.isRequired && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={(value as string) || ''}
            onChange={(e) => updateValue(e.target.value)}
            rows={3}
            placeholder={field.placeholder || ''}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
            }`}
          />
          {field.helpText && (
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{field.helpText}</p>
          )}
        </div>
      )
    }

    // Handle number fields
    if (field.type === 'number') {
      return (
        <div key={field.key}>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {field.label} {field.isRequired && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            value={(value as number) || ''}
            onChange={(e) => updateValue(e.target.value ? Number(e.target.value) : undefined)}
            placeholder={field.placeholder || ''}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
            }`}
          />
          {field.helpText && (
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{field.helpText}</p>
          )}
        </div>
      )
    }

    // Handle date fields
    if (field.type === 'date') {
      return (
        <div key={field.key}>
          <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {field.label} {field.isRequired && <span className="text-red-500">*</span>}
          </label>
          <input
            type="date"
            value={(value as string) || ''}
            onChange={(e) => updateValue(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          />
          {field.helpText && (
            <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{field.helpText}</p>
          )}
        </div>
      )
    }

    // Default: text input (also handles email, phone, url)
    return (
      <div key={field.key}>
        <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {field.label} {field.isRequired && <span className="text-red-500">*</span>}
        </label>
        <input
          type={field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : field.type === 'url' ? 'url' : 'text'}
          value={(value as string) || ''}
          onChange={(e) => updateValue(e.target.value)}
          placeholder={field.placeholder || ''}
          className={`w-full px-4 py-2.5 rounded-xl border ${
            isDark
              ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
              : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
          }`}
        />
        {field.helpText && (
          <p className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{field.helpText}</p>
        )}
      </div>
    )
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
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Projects</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage your deployment and service projects
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/projects/settings"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
              isDark
                ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="hidden sm:inline">Settings</span>
          </Link>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-5 h-5" />
            New Project
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'blue', icon: FolderKanban },
          { label: 'Active', value: stats.active, color: 'emerald', icon: Clock },
          { label: 'Draft', value: stats.draft, color: 'slate', icon: FileText },
          { label: 'Completed', value: stats.completed, color: 'cyan', icon: CheckCircle },
          { label: 'On Hold', value: stats.onHold, color: 'amber', icon: Pause },
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
                      : stat.color === 'emerald'
                        ? 'text-emerald-500'
                        : stat.color === 'slate'
                          ? 'text-slate-500'
                          : stat.color === 'cyan'
                            ? 'text-cyan-500'
                            : 'text-amber-500'
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
              placeholder="Search projects..."
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
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filterProjectType}
            onChange={(e) => setFilterProjectType(e.target.value)}
            className={`px-4 py-2.5 rounded-xl border ${
              isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <option value="all">All Types</option>
            {projectTypes.map((pt) => (
              <option key={pt.id} value={pt.name}>{pt.name}</option>
            ))}
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

      {/* Projects Grid/List */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project, index) => {
            const statusBadge = getStatusBadge(project.status)
            const StatusIcon = statusBadge.icon
            const priorityBadge = getPriorityBadge(project.priority)

            return (
              <motion.div
                key={project.id}
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
                <div className={`h-1 bg-gradient-to-r ${getProjectTypeColor(project.project_type || '')}`} />

                {/* Header */}
                <div className={`p-5 border-b ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getProjectTypeColor(project.project_type || '')} flex items-center justify-center shadow-lg`}
                      >
                        <FolderKanban className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          {project.project_id && (
                            <span className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {project.project_id}
                            </span>
                          )}
                          <span
                            className={`text-xs px-2 py-0.5 rounded capitalize ${isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'}`}
                          >
                            {(project.project_type || 'Unknown').replace('-', ' ')}
                          </span>
                        </div>
                        <h3 className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {project.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${priorityBadge.bg} ${priorityBadge.text}`}>
                        {project.priority}
                      </span>
                      <span
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>

                  {project.description && (
                    <p className={`text-sm mt-3 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {project.description}
                    </p>
                  )}
                </div>

                {/* Details */}
                <div className="p-5">
                  <div
                    className={`flex flex-wrap items-center gap-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    {project.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {project.location.name}
                        {project.location.city && `, ${project.location.city}`}
                      </span>
                    )}
                    {project.start_date && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {new Date(project.start_date).toLocaleDateString()}
                      </span>
                    )}
                    {project.estimated_value && (
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        {project.estimated_value.toLocaleString()} {project.currency}
                      </span>
                    )}
                    {project.services_count !== undefined && project.services_count > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        {project.services_count} services
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={`flex items-center justify-end gap-2 mt-4 pt-4 border-t border-dashed ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                    <button
                      onClick={() => setSelectedProject(project)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                      }`}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingProject(project)}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
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
                  {/* Fixed columns - Project */}
                  <th className={`sticky left-0 z-10 px-4 py-3 text-left min-w-[200px] ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    Project
                  </th>
                  <th className="px-4 py-3 text-left min-w-[150px]">Location</th>
                  <th className="px-4 py-3 text-left min-w-[120px]">Type</th>
                  <th className="px-4 py-3 text-left min-w-[100px]">Status</th>
                  <th className="px-4 py-3 text-left min-w-[100px]">Priority</th>

                  {/* Dynamic fields from resolved fields */}
                  {resolvedFields
                    .filter(f => f.isVisible && !['location_id', 'name', 'code', 'project_type', 'status', 'priority'].includes(f.key))
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
                {filteredProjects.map((project, index) => {
                  const statusBadge = getStatusBadge(project.status)
                  const StatusIcon = statusBadge.icon
                  const priorityBadge = getPriorityBadge(project.priority)

                  return (
                    <motion.tr
                      key={project.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className={`cursor-pointer transition-colors ${
                        isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedProject(project)}
                    >
                      {/* Project - Sticky */}
                      <td className={`sticky left-0 z-10 px-4 py-4 ${isDark ? 'bg-slate-900/95' : 'bg-white/95'} backdrop-blur-sm`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getProjectTypeColor(project.project_type || '')} flex items-center justify-center shadow-md shrink-0`}>
                            <FolderKanban className="w-5 h-5 text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className={`font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {project.name}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {project.project_id || `#${project.id.slice(0, 6)}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className={`px-4 py-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        <p className="truncate max-w-[150px]">
                          {project.location?.name || '-'}
                          {project.location?.city && <span className="text-xs opacity-70"> ({project.location.city})</span>}
                        </p>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-1 rounded capitalize whitespace-nowrap ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                          {(project.project_type || 'Unknown').replace('-', ' ')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusBadge.bg} ${statusBadge.text}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize whitespace-nowrap ${priorityBadge.bg} ${priorityBadge.text}`}>
                          {project.priority}
                        </span>
                      </td>

                      {/* Dynamic fields */}
                      {resolvedFields
                        .filter(f => f.isVisible && !['location_id', 'name', 'code', 'project_type', 'status', 'priority'].includes(f.key))
                        .map((field) => {
                          const fieldKey = field.key as keyof Project
                          const value = field.isCustomField
                            ? (project.metadata as Record<string, unknown>)?.[field.key]
                            : project[fieldKey]

                          // Format value based on type
                          let displayValue: string = '-'
                          if (value !== null && value !== undefined && value !== '') {
                            if (field.type === 'date' && typeof value === 'string') {
                              displayValue = new Date(value).toLocaleDateString()
                            } else if (field.type === 'checkbox') {
                              displayValue = value ? 'Yes' : 'No'
                            } else if (field.type === 'number' && typeof value === 'number') {
                              // Check if it's a currency field
                              if (field.key.includes('value') || field.key.includes('amount') || field.key.includes('price')) {
                                displayValue = `${value.toLocaleString()} ${project.currency || ''}`
                              } else {
                                displayValue = value.toLocaleString()
                              }
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
                              setSelectedProject(project)
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingProject(project)
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
                              handleDeleteProject(project.id)
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

      {filteredProjects.length === 0 && (
        <div
          className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}
        >
          <FolderKanban className={`w-12 h-12 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
          <p className={`mt-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No projects found</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Create your first project to get started
          </p>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            New Project
          </motion.button>
        </div>
      )}

      {/* Create Project Modal */}
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
                    <FolderKanban className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Create New Project
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
                {/* Required Fields */}
                {(() => {
                  const { requiredFields, optionalFields } = getVisibleFields()
                  return (
                    <>
                      {requiredFields.length > 0 && (
                        <div className="space-y-4">
                          <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            Required Fields
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {requiredFields.map((field) => renderCreateField(field))}
                          </div>
                        </div>
                      )}

                      {optionalFields.length > 0 && (
                        <div className="space-y-4">
                          <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-400'}`} />
                            Optional Fields
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {optionalFields.map((field) => renderCreateField(field))}
                          </div>
                        </div>
                      )}

                      {resolvedFields.length === 0 && (
                        <div className={`p-8 text-center rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                            Loading field configuration...
                          </p>
                        </div>
                      )}
                    </>
                  )
                })()}
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
                  onClick={handleCreateProject}
                  disabled={formLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium disabled:opacity-50"
                >
                  {formLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Create Project'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Project Modal */}
      <AnimatePresence>
        {editingProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditingProject(null)}
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
                    Edit Project
                  </h2>
                </div>
                <button
                  onClick={() => setEditingProject(null)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="p-5 space-y-6">
                {/* Required Fields */}
                {(() => {
                  const { requiredFields, optionalFields } = getVisibleFields()
                  return (
                    <>
                      {requiredFields.length > 0 && (
                        <div className="space-y-4">
                          <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            Required Fields
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {requiredFields.map((field) => renderEditField(field))}
                          </div>
                        </div>
                      )}

                      {optionalFields.length > 0 && (
                        <div className="space-y-4">
                          <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-400'}`} />
                            Optional Fields
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {optionalFields.map((field) => renderEditField(field))}
                          </div>
                        </div>
                      )}

                      {resolvedFields.length === 0 && (
                        <div className={`p-8 text-center rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                            Loading field configuration...
                          </p>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* Footer */}
              <div
                className={`sticky bottom-0 flex items-center justify-end gap-3 p-5 border-t ${
                  isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
                }`}
              >
                <button
                  onClick={() => setEditingProject(null)}
                  className={`px-5 py-2.5 rounded-xl font-medium ${
                    isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleUpdateProject}
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

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
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
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getProjectTypeColor(selectedProject.project_type || '')} flex items-center justify-center`}
                    >
                      <FolderKanban className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      {selectedProject.project_id && (
                        <span className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {selectedProject.project_id}
                        </span>
                      )}
                      <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {selectedProject.name}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProject(null)}
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
                {selectedProject.description && (
                  <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{selectedProject.description}</p>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedProject.project_id && (
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Project ID</p>
                      <p className={`font-medium font-mono mt-1 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                        {selectedProject.project_id}
                      </p>
                    </div>
                  )}
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Location</p>
                    <p className={`font-medium mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedProject.location?.name || '-'}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Project Type</p>
                    <p className={`font-medium mt-1 capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {(selectedProject.project_type || 'Unknown').replace('-', ' ')}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Status</p>
                    <p className={`font-medium mt-1 capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedProject.status.replace('_', ' ')}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Priority</p>
                    <p className={`font-medium mt-1 capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedProject.priority}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>SLA Tier</p>
                    <p className={`font-medium mt-1 capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedProject.sla_tier}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Billing Model</p>
                    <p className={`font-medium mt-1 capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {selectedProject.billing_model.replace('_', ' ')}
                    </p>
                  </div>
                  {selectedProject.start_date && (
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Start Date</p>
                      <p className={`font-medium mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {new Date(selectedProject.start_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedProject.target_end_date && (
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Target End Date</p>
                      <p className={`font-medium mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {new Date(selectedProject.target_end_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedProject.estimated_value && (
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Estimated Value</p>
                      <p className={`font-medium mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {selectedProject.estimated_value.toLocaleString()} {selectedProject.currency}
                      </p>
                    </div>
                  )}
                </div>

                {/* Client Contact is at Location level, not Project level */}

                {/* Notes */}
                {selectedProject.notes && (
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Notes
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {selectedProject.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={`p-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <div className="flex items-center justify-end gap-3">
                  <motion.button
                    onClick={() => {
                      setSelectedProject(null)
                      setEditingProject(selectedProject)
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-5 py-2.5 rounded-xl font-medium ${
                      isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Edit Project
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium"
                  >
                    View Services
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
