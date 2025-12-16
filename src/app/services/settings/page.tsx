'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  Loader2,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  GripVertical,
  AlertCircle,
  Lock,
  Type,
  Hash,
  Calendar,
  Mail,
  Phone,
  Link as LinkIcon,
  CheckSquare,
  AlignLeft,
  List,
  Save,
  ArrowLeft,
  User,
  DollarSign,
  Percent,
  Star,
  Paperclip,
  Timer,
  ListChecks,
  Clock,
  Zap,
  Filter,
  FolderKanban,
  GitBranch,
  ToggleLeft,
  ToggleRight,
  Wrench,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  getServiceFieldDefinitions,
  getServiceFieldConfigs,
  getServiceCustomFields,
  bulkUpdateServiceFieldConfigs,
  createServiceCustomField,
  updateServiceCustomField,
  deleteServiceCustomField,
} from '@/lib/actions/service-field-config'
import {
  getServiceAutoRules,
  createServiceAutoRule,
  updateServiceAutoRule,
  deleteServiceAutoRule,
  toggleServiceAutoRule,
} from '@/lib/actions/service-auto-rules'
import { getLibraryItems, getChildItems } from '@/lib/actions/library'
import { getWorkflowSteps, getStepStatuses } from '@/lib/actions/services'
import type {
  ServiceFieldDefinition,
  ServiceFieldConfig,
  ServiceCustomField,
  ServiceFieldType,
  ServiceFieldOption,
  CreateServiceCustomFieldInput,
  UpdateServiceFieldConfigInput,
  ServiceAutoRule,
  ProjectCondition,
  ProjectConditionsConfig,
  ServiceUrgency,
  ServiceStatus,
} from '@/types/projects'
import { SERVICE_RULE_CONDITION_FIELDS, PROJECT_OPERATOR_OPTIONS } from '@/types/projects'

interface FieldConfigState {
  definition: ServiceFieldDefinition
  config?: ServiceFieldConfig
  isRequired: boolean
  isVisible: boolean
  customLabel: string
  customPlaceholder: string
  customHelpText: string
  displayOrder: number
  hasChanges: boolean
}

const fieldTypeIcons: Record<ServiceFieldType, typeof Type> = {
  text: Type,
  textarea: AlignLeft,
  select: List,
  multiselect: ListChecks,
  number: Hash,
  currency: DollarSign,
  percent: Percent,
  date: Calendar,
  time: Clock,
  email: Mail,
  phone: Phone,
  url: LinkIcon,
  checkbox: CheckSquare,
  attachment: Paperclip,
  user: User,
  duration: Timer,
  rating: Star,
}

const categoryLabels: Record<string, string> = {
  general: 'General Information',
  scheduling: 'Scheduling',
  assignment: 'Assignment',
  operational: 'Operational',
  custom: 'Custom Fields',
}

const categoryOrder = ['general', 'scheduling', 'assignment', 'operational', 'custom']

export default function ServiceSettingsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // State
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfigState[]>([])
  const [customFields, setCustomFields] = useState<ServiceCustomField[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categoryOrder)
  )

  // Modal states
  const [showAddCustomField, setShowAddCustomField] = useState(false)
  const [editingCustomField, setEditingCustomField] = useState<ServiceCustomField | null>(null)

  // Custom field form
  const [customFieldForm, setCustomFieldForm] = useState<CreateServiceCustomFieldInput>({
    field_key: '',
    field_label: '',
    field_type: 'text',
    is_required: false,
    is_visible: true,
    display_order: 100,
    options: [],
    placeholder: '',
    help_text: '',
    default_value: '',
  })
  const [customFieldOptions, setCustomFieldOptions] = useState<ServiceFieldOption[]>([])

  // Tabs
  const [activeTab, setActiveTab] = useState<'fields' | 'auto-rules'>('fields')

  // Auto-creation rules state
  const [autoRules, setAutoRules] = useState<ServiceAutoRule[]>([])
  const [showAddRule, setShowAddRule] = useState(false)
  const [editingRule, setEditingRule] = useState<ServiceAutoRule | null>(null)
  const [serviceTypes, setServiceTypes] = useState<Array<{ id: string; name: string }>>([])
  const [projectTypes, setProjectTypes] = useState<Array<{ id: string; name: string }>>([])
  const [workflowSteps, setWorkflowSteps] = useState<Array<{ id: string; name: string }>>([])
  const [stepStatuses, setStepStatuses] = useState<Array<{ id: string; name: string }>>([])
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])
  const [locationTypes, setLocationTypes] = useState<Array<{ id: string; name: string }>>([])
  const [filteredServiceTypes, setFilteredServiceTypes] = useState<Array<{ id: string; name: string }>>([])
  const [ruleForm, setRuleForm] = useState<{
    name: string
    description: string
    service_type_id: string
    default_step_id: string
    default_step_status_id: string
    default_urgency: ServiceUrgency
    default_status: ServiceStatus
    conditions: ProjectConditionsConfig
    is_active: boolean
    priority: number
    prevent_duplicates: boolean
  }>({
    name: '',
    description: '',
    service_type_id: '',
    default_step_id: '',
    default_step_status_id: '',
    default_urgency: 'scheduled',
    default_status: 'scheduled',
    conditions: { conditions: [], logic: 'all' },
    is_active: true,
    priority: 0,
    prevent_duplicates: true,
  })

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [
        definitionsResult,
        configsResult,
        customResult,
        rulesResult,
        serviceTypesResult,
        projectTypesResult,
        stepsResult,
        statusesResult,
        clientsResult,
        locationTypesResult,
      ] = await Promise.all([
        getServiceFieldDefinitions(),
        getServiceFieldConfigs(),
        getServiceCustomFields(),
        getServiceAutoRules(),
        getLibraryItems('service_types'),
        getLibraryItems('project_types', true),  // rootOnly=true to exclude child service types
        getWorkflowSteps(),
        getStepStatuses(),
        getLibraryItems('clients'),
        getLibraryItems('location_types'),
      ])

      if (definitionsResult.error || configsResult.error || customResult.error) {
        toast.error('Failed to load field configuration')
        return
      }

      const definitions = definitionsResult.data || []
      const configs = configsResult.data || []
      const custom = customResult.data || []

      // Build config map
      const configMap = new Map(
        configs.map((c) => [c.field_definition_id, c])
      )

      // Build field config states
      const states: FieldConfigState[] = definitions.map((def) => {
        const config = configMap.get(def.id)
        return {
          definition: def,
          config,
          isRequired: def.is_platform_required || (config?.is_required ?? false),
          isVisible: config?.is_visible ?? true,
          customLabel: config?.custom_label || '',
          customPlaceholder: config?.custom_placeholder || '',
          customHelpText: config?.custom_help_text || '',
          displayOrder: config?.display_order ?? def.display_order,
          hasChanges: false,
        }
      })

      setFieldConfigs(states)
      setCustomFields(custom)
      setAutoRules(rulesResult.data || [])
      setServiceTypes(serviceTypesResult.data?.map(st => ({ id: st.id, name: st.name })) || [])
      setProjectTypes(projectTypesResult.data?.map(pt => ({ id: pt.id, name: pt.name })) || [])
      setWorkflowSteps(stepsResult.data || [])
      setStepStatuses(statusesResult.data || [])
      setClients(clientsResult.data?.map(c => ({ id: c.id, name: c.name })) || [])
      setLocationTypes(locationTypesResult.data?.map(lt => ({ id: lt.id, name: lt.name })) || [])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load field configuration')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Fetch service types based on selected project type in conditions
  useEffect(() => {
    const fetchFilteredServiceTypes = async () => {
      // Find project_type_id condition with 'equals' operator
      const projectTypeCondition = ruleForm.conditions.conditions.find(
        c => c.field === 'project_type_id' && c.operator === 'equals' && c.value
      )

      if (projectTypeCondition?.value) {
        // Fetch child service types for this project type
        const result = await getChildItems(projectTypeCondition.value)
        if (result.data) {
          setFilteredServiceTypes(result.data.map(item => ({ id: item.id, name: item.name })))
        } else {
          setFilteredServiceTypes([])
        }
      } else {
        // No project type selected, show all service types
        setFilteredServiceTypes(serviceTypes)
      }
    }

    fetchFilteredServiceTypes()
  }, [ruleForm.conditions.conditions, serviceTypes])

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  // Update field config
  const updateFieldConfig = (
    definitionId: string,
    updates: Partial<Omit<FieldConfigState, 'definition' | 'config'>>
  ) => {
    setFieldConfigs((prev) =>
      prev.map((fc) => {
        if (fc.definition.id === definitionId) {
          return { ...fc, ...updates, hasChanges: true }
        }
        return fc
      })
    )
  }

  // Save all changes
  const handleSaveAll = async () => {
    const changedConfigs = fieldConfigs.filter((fc) => fc.hasChanges)
    if (changedConfigs.length === 0) {
      toast.info('No changes to save')
      return
    }

    setSaving(true)
    try {
      const updates: UpdateServiceFieldConfigInput[] = changedConfigs.map((fc) => ({
        field_definition_id: fc.definition.id,
        is_required: fc.isRequired,
        is_visible: fc.isVisible,
        custom_label: fc.customLabel || undefined,
        custom_placeholder: fc.customPlaceholder || undefined,
        custom_help_text: fc.customHelpText || undefined,
        display_order: fc.displayOrder,
      }))

      const result = await bulkUpdateServiceFieldConfigs(updates)
      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Field configuration saved')
      // Reset hasChanges flags
      setFieldConfigs((prev) =>
        prev.map((fc) => ({ ...fc, hasChanges: false }))
      )
    } catch (error) {
      console.error('Error saving configuration:', error)
      toast.error('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  // Create custom field
  const handleCreateCustomField = async () => {
    if (!customFieldForm.field_label.trim()) {
      toast.error('Field label is required')
      return
    }

    setSaving(true)
    try {
      const result = await createServiceCustomField({
        ...customFieldForm,
        field_key: customFieldForm.field_label.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        options: customFieldForm.field_type === 'select' ? customFieldOptions : [],
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Custom field created')
      setShowAddCustomField(false)
      resetCustomFieldForm()
      loadData()
    } catch (error) {
      console.error('Error creating custom field:', error)
      toast.error('Failed to create custom field')
    } finally {
      setSaving(false)
    }
  }

  // Update custom field
  const handleUpdateCustomField = async () => {
    if (!editingCustomField) return

    setSaving(true)
    try {
      const result = await updateServiceCustomField(editingCustomField.id, {
        field_label: customFieldForm.field_label,
        field_type: customFieldForm.field_type,
        is_required: customFieldForm.is_required,
        is_visible: customFieldForm.is_visible,
        display_order: customFieldForm.display_order,
        options: customFieldForm.field_type === 'select' ? customFieldOptions : [],
        placeholder: customFieldForm.placeholder,
        help_text: customFieldForm.help_text,
        default_value: customFieldForm.default_value,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Custom field updated')
      setEditingCustomField(null)
      resetCustomFieldForm()
      loadData()
    } catch (error) {
      console.error('Error updating custom field:', error)
      toast.error('Failed to update custom field')
    } finally {
      setSaving(false)
    }
  }

  // Delete custom field
  const handleDeleteCustomField = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom field?')) return

    try {
      const result = await deleteServiceCustomField(id)
      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Custom field deleted')
      loadData()
    } catch (error) {
      console.error('Error deleting custom field:', error)
      toast.error('Failed to delete custom field')
    }
  }

  // Reset custom field form
  const resetCustomFieldForm = () => {
    setCustomFieldForm({
      field_key: '',
      field_label: '',
      field_type: 'text',
      is_required: false,
      is_visible: true,
      display_order: 100,
      options: [],
      placeholder: '',
      help_text: '',
      default_value: '',
    })
    setCustomFieldOptions([])
  }

  // Open edit custom field modal
  const openEditCustomField = (field: ServiceCustomField) => {
    setEditingCustomField(field)
    setCustomFieldForm({
      field_key: field.field_key,
      field_label: field.field_label,
      field_type: field.field_type,
      is_required: field.is_required,
      is_visible: field.is_visible,
      display_order: field.display_order,
      options: field.options,
      placeholder: field.placeholder || '',
      help_text: field.help_text || '',
      default_value: field.default_value || '',
    })
    setCustomFieldOptions(field.options || [])
  }

  // Add option for select fields
  const addOption = () => {
    setCustomFieldOptions((prev) => [...prev, { value: '', label: '' }])
  }

  // Update option
  const updateOption = (index: number, key: 'value' | 'label', value: string) => {
    setCustomFieldOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [key]: value } : opt))
    )
  }

  // Remove option
  const removeOption = (index: number) => {
    setCustomFieldOptions((prev) => prev.filter((_, i) => i !== index))
  }

  // Group fields by category
  const fieldsByCategory = categoryOrder.reduce(
    (acc, category) => {
      acc[category] = fieldConfigs.filter(
        (fc) => fc.definition.category === category
      )
      return acc
    },
    {} as Record<string, FieldConfigState[]>
  )

  const hasUnsavedChanges = fieldConfigs.some((fc) => fc.hasChanges)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Header */}
      <div
        className={`sticky top-0 z-40 border-b ${
          isDark ? 'bg-slate-900/95 border-white/10' : 'bg-white/95 border-slate-200'
        } backdrop-blur-xl`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/services"
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Service Settings
                </h1>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Configure fields and auto-creation rules
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {activeTab === 'fields' && hasUnsavedChanges && (
                <span className="text-sm text-amber-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Unsaved changes
                </span>
              )}
              {activeTab === 'fields' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveAll}
                  disabled={saving || !hasUnsavedChanges}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    hasUnsavedChanges
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                      : isDark
                        ? 'bg-white/5 text-slate-500'
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </motion.button>
              )}
              {activeTab === 'auto-rules' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setRuleForm({
                      name: '',
                      description: '',
                      service_type_id: '',
                      default_step_id: '',
                      default_step_status_id: '',
                      default_urgency: 'scheduled',
                      default_status: 'scheduled',
                      conditions: { conditions: [], logic: 'all' },
                      is_active: true,
                      priority: 0,
                      prevent_duplicates: true,
                    })
                    setShowAddRule(true)
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/25"
                >
                  <Plus className="w-4 h-4" />
                  Add Rule
                </motion.button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            <button
              onClick={() => setActiveTab('fields')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'fields'
                  ? isDark
                    ? 'bg-white/10 text-white'
                    : 'bg-slate-900 text-white'
                  : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/5'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              Field Configuration
            </button>
            <button
              onClick={() => setActiveTab('auto-rules')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'auto-rules'
                  ? isDark
                    ? 'bg-white/10 text-white'
                    : 'bg-slate-900 text-white'
                  : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/5'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-4 h-4" />
              Auto-Creation Rules
              {autoRules.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === 'auto-rules'
                    ? 'bg-white/20'
                    : isDark ? 'bg-white/10' : 'bg-slate-200'
                }`}>
                  {autoRules.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Field Configuration Tab */}
        {activeTab === 'fields' && (
          <>
        {/* System Fields */}
        {categoryOrder.slice(0, -1).map((category) => {
          const fields = fieldsByCategory[category]
          if (!fields || fields.length === 0) return null

          const isExpanded = expandedCategories.has(category)

          return (
            <div
              key={category}
              className={`rounded-2xl border ${
                isDark ? 'bg-slate-900/50 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className={`w-full flex items-center justify-between p-4 ${
                  isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                } rounded-t-2xl transition-colors`}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  ) : (
                    <ChevronRight className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  )}
                  <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {categoryLabels[category]}
                  </h2>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {fields.length} fields
                  </span>
                </div>
              </button>

              {/* Fields */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                      {fields.map((fc) => {
                        const Icon = fieldTypeIcons[fc.definition.field_type as ServiceFieldType] || Type
                        const isLocked = fc.definition.is_platform_required

                        return (
                          <div
                            key={fc.definition.id}
                            className={`flex items-center gap-4 p-4 border-b last:border-b-0 ${
                              isDark ? 'border-white/5' : 'border-slate-100'
                            }`}
                          >
                            {/* Drag Handle */}
                            <div className={`${isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                              <GripVertical className="w-4 h-4" />
                            </div>

                            {/* Field Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Icon
                                  className={`w-4 h-4 ${
                                    isDark ? 'text-slate-400' : 'text-slate-500'
                                  }`}
                                />
                                <span
                                  className={`font-medium ${
                                    isDark ? 'text-white' : 'text-slate-900'
                                  }`}
                                >
                                  {fc.customLabel || fc.definition.field_label}
                                </span>
                                {isLocked && (
                                  <span className="flex items-center gap-1 text-xs text-amber-500">
                                    <Lock className="w-3 h-3" />
                                    Required
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-sm truncate ${
                                  isDark ? 'text-slate-500' : 'text-slate-400'
                                }`}
                              >
                                {fc.definition.field_key} &bull; {fc.definition.field_type}
                              </p>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-4">
                              {/* Visible Toggle */}
                              <button
                                onClick={() =>
                                  updateFieldConfig(fc.definition.id, {
                                    isVisible: !fc.isVisible,
                                  })
                                }
                                disabled={isLocked}
                                className={`p-2 rounded-lg transition-colors ${
                                  fc.isVisible
                                    ? isDark
                                      ? 'bg-blue-500/20 text-blue-400'
                                      : 'bg-blue-100 text-blue-600'
                                    : isDark
                                      ? 'bg-white/5 text-slate-500'
                                      : 'bg-slate-100 text-slate-400'
                                } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={fc.isVisible ? 'Visible' : 'Hidden'}
                              >
                                {fc.isVisible ? (
                                  <Eye className="w-4 h-4" />
                                ) : (
                                  <EyeOff className="w-4 h-4" />
                                )}
                              </button>

                              {/* Required Toggle */}
                              <label
                                className={`flex items-center gap-2 ${
                                  isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={fc.isRequired}
                                  onChange={(e) =>
                                    updateFieldConfig(fc.definition.id, {
                                      isRequired: e.target.checked,
                                    })
                                  }
                                  disabled={isLocked}
                                  className="sr-only"
                                />
                                <div
                                  className={`w-10 h-6 rounded-full transition-colors relative ${
                                    fc.isRequired
                                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600'
                                      : isDark
                                        ? 'bg-white/10'
                                        : 'bg-slate-200'
                                  }`}
                                >
                                  <div
                                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                      fc.isRequired ? 'left-5' : 'left-1'
                                    }`}
                                  />
                                </div>
                                <span
                                  className={`text-sm ${
                                    isDark ? 'text-slate-400' : 'text-slate-600'
                                  }`}
                                >
                                  Required
                                </span>
                              </label>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}

        {/* Custom Fields Section */}
        <div
          className={`rounded-2xl border ${
            isDark ? 'bg-slate-900/50 border-white/10' : 'bg-white border-slate-200'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Settings className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Custom Fields
              </h2>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {customFields.length} fields
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddCustomField(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Custom Field
            </motion.button>
          </div>

          {/* Custom Fields List */}
          {customFields.length > 0 ? (
            <div className={`border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              {customFields.map((field) => {
                const Icon = fieldTypeIcons[field.field_type] || Type

                return (
                  <div
                    key={field.id}
                    className={`flex items-center gap-4 p-4 border-b last:border-b-0 ${
                      isDark ? 'border-white/5' : 'border-slate-100'
                    }`}
                  >
                    <div className={`${isDark ? 'text-slate-600' : 'text-slate-300'}`}>
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Icon
                          className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                        />
                        <span
                          className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}
                        >
                          {field.field_label}
                        </span>
                        {field.is_required && (
                          <span className="text-xs text-amber-500">Required</span>
                        )}
                      </div>
                      <p
                        className={`text-sm truncate ${
                          isDark ? 'text-slate-500' : 'text-slate-400'
                        }`}
                      >
                        {field.field_key} &bull; {field.field_type}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditCustomField(field)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark
                            ? 'hover:bg-white/10 text-slate-400'
                            : 'hover:bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustomField(field.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark
                            ? 'hover:bg-red-500/20 text-red-400'
                            : 'hover:bg-red-50 text-red-500'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div
              className={`p-8 text-center border-t ${
                isDark ? 'border-white/10' : 'border-slate-200'
              }`}
            >
              <Settings
                className={`w-12 h-12 mx-auto mb-3 ${
                  isDark ? 'text-slate-700' : 'text-slate-300'
                }`}
              />
              <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No custom fields yet
              </p>
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Add custom fields to capture additional service information
              </p>
            </div>
          )}
        </div>
          </>
        )}

        {/* Auto-Creation Rules Tab */}
        {activeTab === 'auto-rules' && (
          <div className="space-y-6">
            {/* Rules List */}
            {autoRules.length > 0 ? (
              <div className="space-y-4">
                {autoRules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`rounded-2xl border overflow-hidden ${
                      isDark ? 'bg-slate-900/50 border-white/10' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${
                              rule.is_active
                                ? isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                                : isDark ? 'bg-white/5' : 'bg-slate-100'
                            }`}>
                              <Zap className={`w-5 h-5 ${
                                rule.is_active
                                  ? 'text-emerald-500'
                                  : isDark ? 'text-slate-500' : 'text-slate-400'
                              }`} />
                            </div>
                            <div>
                              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {rule.name}
                              </h3>
                              {rule.description && (
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {rule.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Rule Details */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {rule.service_type && (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                                isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                              }`}>
                                <Wrench className="w-3.5 h-3.5" />
                                {rule.service_type.name}
                              </span>
                            )}
                            {rule.default_step && (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                                isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                              }`}>
                                <GitBranch className="w-3.5 h-3.5" />
                                {rule.default_step.name}
                              </span>
                            )}
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                              isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'
                            }`}>
                              <Filter className="w-3.5 h-3.5" />
                              {rule.conditions.conditions.length} condition{rule.conditions.conditions.length !== 1 ? 's' : ''}
                              {' '}({rule.conditions.logic === 'all' ? 'Match ALL' : 'Match ANY'})
                            </span>
                            {rule.prevent_duplicates && (
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                                isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                              }`}>
                                Prevent Duplicates
                              </span>
                            )}
                          </div>

                          {/* Conditions Preview */}
                          {rule.conditions.conditions.length > 0 && (
                            <div className={`mt-3 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                              <p className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                When project/location matches:
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {rule.conditions.conditions.map((condition, idx) => {
                                  const fieldDef = SERVICE_RULE_CONDITION_FIELDS.find(f => f.key === condition.field)
                                  const fieldLabel = fieldDef?.label || condition.field
                                  const fieldGroup = fieldDef?.group || 'project'
                                  const operatorLabel = PROJECT_OPERATOR_OPTIONS.find(o => o.value === condition.operator)?.label || condition.operator
                                  // Show friendly names for IDs
                                  let displayValue = condition.value
                                  if (condition.field === 'project_type_id' && condition.value) {
                                    const pt = projectTypes.find(p => p.id === condition.value)
                                    displayValue = pt?.name || condition.value
                                  } else if (condition.field === 'client' && condition.value) {
                                    const client = clients.find(c => c.id === condition.value)
                                    displayValue = client?.name || condition.value
                                  } else if (condition.field === 'type' && condition.value) {
                                    const lt = locationTypes.find(t => t.id === condition.value)
                                    displayValue = lt?.name || condition.value
                                  }
                                  return (
                                    <span
                                      key={idx}
                                      className={`text-xs px-2 py-1 rounded ${
                                        fieldGroup === 'location'
                                          ? isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700 border border-purple-200'
                                          : isDark ? 'bg-white/10 text-slate-300' : 'bg-white text-slate-600 border border-slate-200'
                                      }`}
                                    >
                                      {fieldLabel} {operatorLabel.toLowerCase()}{displayValue ? ` "${displayValue}"` : ''}
                                    </span>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              const result = await toggleServiceAutoRule(rule.id, !rule.is_active)
                              if (result.error) {
                                toast.error(result.error)
                              } else {
                                toast.success(rule.is_active ? 'Rule disabled' : 'Rule enabled')
                                loadData()
                              }
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? 'hover:bg-white/10 text-slate-400'
                                : 'hover:bg-slate-100 text-slate-500'
                            }`}
                            title={rule.is_active ? 'Disable rule' : 'Enable rule'}
                          >
                            {rule.is_active ? (
                              <ToggleRight className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setEditingRule(rule)
                              setRuleForm({
                                name: rule.name,
                                description: rule.description || '',
                                service_type_id: rule.service_type_id || '',
                                default_step_id: rule.default_step_id || '',
                                default_step_status_id: rule.default_step_status_id || '',
                                default_urgency: rule.default_urgency,
                                default_status: rule.default_status,
                                conditions: rule.conditions,
                                is_active: rule.is_active,
                                priority: rule.priority,
                                prevent_duplicates: rule.prevent_duplicates,
                              })
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? 'hover:bg-white/10 text-slate-400'
                                : 'hover:bg-slate-100 text-slate-500'
                            }`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm('Are you sure you want to delete this rule?')) return
                              const result = await deleteServiceAutoRule(rule.id)
                              if (result.error) {
                                toast.error(result.error)
                              } else {
                                toast.success('Rule deleted')
                                loadData()
                              }
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? 'hover:bg-red-500/20 text-red-400'
                                : 'hover:bg-red-50 text-red-500'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`rounded-2xl border p-12 text-center ${
                  isDark ? 'bg-slate-900/50 border-white/10' : 'bg-white border-slate-200'
                }`}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                  isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                }`}>
                  <Zap className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  No Auto-Creation Rules Yet
                </h3>
                <p className={`max-w-md mx-auto mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Create rules to automatically generate services when projects match certain conditions.
                  For example: Create a &quot;Site Survey&quot; service when a project&apos;s type is &quot;Deployment&quot;.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setRuleForm({
                      name: '',
                      description: '',
                      service_type_id: '',
                      default_step_id: '',
                      default_step_status_id: '',
                      default_urgency: 'scheduled',
                      default_status: 'scheduled',
                      conditions: { conditions: [], logic: 'all' },
                      is_active: true,
                      priority: 0,
                      prevent_duplicates: true,
                    })
                    setShowAddRule(true)
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/25"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Rule
                </motion.button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Service Auto-Creation Rule Modal */}
      <AnimatePresence>
        {(showAddRule || editingRule) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowAddRule(false)
              setEditingRule(null)
            }}
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
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {editingRule ? 'Edit Auto-Creation Rule' : 'Create Auto-Creation Rule'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddRule(false)
                    setEditingRule(null)
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="p-5 space-y-5">
                {/* Rule Name */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Rule Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ruleForm.name}
                    onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                    placeholder="e.g., Deployment Site Survey"
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={ruleForm.description}
                    onChange={(e) => setRuleForm({ ...ruleForm, description: e.target.value })}
                    placeholder="Describe when this rule should apply..."
                    rows={2}
                    className={`w-full px-4 py-2.5 rounded-xl border resize-none ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* Default Step & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Starting Step
                    </label>
                    <select
                      value={ruleForm.default_step_id}
                      onChange={(e) => setRuleForm({ ...ruleForm, default_step_id: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="">None</option>
                      {workflowSteps.map((step) => (
                        <option key={step.id} value={step.id}>{step.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Starting Status
                    </label>
                    <select
                      value={ruleForm.default_step_status_id}
                      onChange={(e) => setRuleForm({ ...ruleForm, default_step_status_id: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="">None</option>
                      {stepStatuses.map((status) => (
                        <option key={status.id} value={status.id}>{status.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Urgency & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Urgency
                    </label>
                    <select
                      value={ruleForm.default_urgency}
                      onChange={(e) => setRuleForm({ ...ruleForm, default_urgency: e.target.value as ServiceUrgency })}
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="same_day">Same Day</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Status
                    </label>
                    <select
                      value={ruleForm.default_status}
                      onChange={(e) => setRuleForm({ ...ruleForm, default_status: e.target.value as ServiceStatus })}
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in_progress">In Progress</option>
                      <option value="pending_approval">Pending Approval</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                </div>

                {/* Project/Location Conditions */}
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Conditions <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={ruleForm.conditions.logic}
                      onChange={(e) => setRuleForm({
                        ...ruleForm,
                        conditions: { ...ruleForm.conditions, logic: e.target.value as 'all' | 'any' }
                      })}
                      className={`px-3 py-1.5 rounded-lg text-sm border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="all">Match ALL conditions</option>
                      <option value="any">Match ANY condition</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    {ruleForm.conditions.conditions.map((condition, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <select
                          value={condition.field}
                          onChange={(e) => {
                            const newConditions = [...ruleForm.conditions.conditions]
                            newConditions[index] = { ...condition, field: e.target.value, value: '' }
                            setRuleForm({ ...ruleForm, conditions: { ...ruleForm.conditions, conditions: newConditions } })
                          }}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                            isDark
                              ? 'bg-white/5 border-white/10 text-white'
                              : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        >
                          <option value="">Select field...</option>
                          <optgroup label="Project Fields">
                            {SERVICE_RULE_CONDITION_FIELDS.filter(f => f.group === 'project').map((field) => (
                              <option key={field.key} value={field.key}>{field.label}</option>
                            ))}
                          </optgroup>
                          <optgroup label="Location Fields">
                            {SERVICE_RULE_CONDITION_FIELDS.filter(f => f.group === 'location').map((field) => (
                              <option key={field.key} value={field.key}>{field.label}</option>
                            ))}
                          </optgroup>
                        </select>
                        <select
                          value={condition.operator}
                          onChange={(e) => {
                            const newConditions = [...ruleForm.conditions.conditions]
                            newConditions[index] = { ...condition, operator: e.target.value as ProjectCondition['operator'] }
                            setRuleForm({ ...ruleForm, conditions: { ...ruleForm.conditions, conditions: newConditions } })
                          }}
                          className={`w-40 px-3 py-2 rounded-lg text-sm border ${
                            isDark
                              ? 'bg-white/5 border-white/10 text-white'
                              : 'bg-white border-slate-200 text-slate-900'
                          }`}
                        >
                          {PROJECT_OPERATOR_OPTIONS.map((op) => (
                            <option key={op.value} value={op.value}>{op.label}</option>
                          ))}
                        </select>
                        {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
                          condition.field === 'project_type_id' ? (
                            <select
                              value={condition.value || ''}
                              onChange={(e) => {
                                const newConditions = [...ruleForm.conditions.conditions]
                                newConditions[index] = { ...condition, value: e.target.value }
                                setRuleForm({ ...ruleForm, conditions: { ...ruleForm.conditions, conditions: newConditions } })
                              }}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                                isDark
                                  ? 'bg-white/5 border-white/10 text-white'
                                  : 'bg-white border-slate-200 text-slate-900'
                              }`}
                            >
                              <option value="">Select project type...</option>
                              {projectTypes.map((pt) => (
                                <option key={pt.id} value={pt.id}>{pt.name}</option>
                              ))}
                            </select>
                          ) : condition.field === 'billing_model' ? (
                            <select
                              value={condition.value || ''}
                              onChange={(e) => {
                                const newConditions = [...ruleForm.conditions.conditions]
                                newConditions[index] = { ...condition, value: e.target.value }
                                setRuleForm({ ...ruleForm, conditions: { ...ruleForm.conditions, conditions: newConditions } })
                              }}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                                isDark
                                  ? 'bg-white/5 border-white/10 text-white'
                                  : 'bg-white border-slate-200 text-slate-900'
                              }`}
                            >
                              <option value="">Select...</option>
                              <option value="fixed">Fixed</option>
                              <option value="time_and_materials">Time & Materials</option>
                              <option value="per_visit">Per Visit</option>
                              <option value="per_action">Per Action</option>
                            </select>
                          ) : condition.field === 'sla_tier' ? (
                            <select
                              value={condition.value || ''}
                              onChange={(e) => {
                                const newConditions = [...ruleForm.conditions.conditions]
                                newConditions[index] = { ...condition, value: e.target.value }
                                setRuleForm({ ...ruleForm, conditions: { ...ruleForm.conditions, conditions: newConditions } })
                              }}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                                isDark
                                  ? 'bg-white/5 border-white/10 text-white'
                                  : 'bg-white border-slate-200 text-slate-900'
                              }`}
                            >
                              <option value="">Select...</option>
                              <option value="standard">Standard</option>
                              <option value="premium">Premium</option>
                              <option value="critical">Critical</option>
                            </select>
                          ) : condition.field === 'priority' ? (
                            <select
                              value={condition.value || ''}
                              onChange={(e) => {
                                const newConditions = [...ruleForm.conditions.conditions]
                                newConditions[index] = { ...condition, value: e.target.value }
                                setRuleForm({ ...ruleForm, conditions: { ...ruleForm.conditions, conditions: newConditions } })
                              }}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                                isDark
                                  ? 'bg-white/5 border-white/10 text-white'
                                  : 'bg-white border-slate-200 text-slate-900'
                              }`}
                            >
                              <option value="">Select...</option>
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          ) : condition.field === 'status' ? (
                            <select
                              value={condition.value || ''}
                              onChange={(e) => {
                                const newConditions = [...ruleForm.conditions.conditions]
                                newConditions[index] = { ...condition, value: e.target.value }
                                setRuleForm({ ...ruleForm, conditions: { ...ruleForm.conditions, conditions: newConditions } })
                              }}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                                isDark
                                  ? 'bg-white/5 border-white/10 text-white'
                                  : 'bg-white border-slate-200 text-slate-900'
                              }`}
                            >
                              <option value="">Select...</option>
                              <option value="draft">Draft</option>
                              <option value="active">Active</option>
                              <option value="on_hold">On Hold</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : condition.field === 'client' ? (
                            <select
                              value={condition.value || ''}
                              onChange={(e) => {
                                const newConditions = [...ruleForm.conditions.conditions]
                                newConditions[index] = { ...condition, value: e.target.value }
                                setRuleForm({ ...ruleForm, conditions: { ...ruleForm.conditions, conditions: newConditions } })
                              }}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                                isDark
                                  ? 'bg-white/5 border-white/10 text-white'
                                  : 'bg-white border-slate-200 text-slate-900'
                              }`}
                            >
                              <option value="">Select client...</option>
                              {clients.map((client) => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                              ))}
                            </select>
                          ) : condition.field === 'type' ? (
                            <select
                              value={condition.value || ''}
                              onChange={(e) => {
                                const newConditions = [...ruleForm.conditions.conditions]
                                newConditions[index] = { ...condition, value: e.target.value }
                                setRuleForm({ ...ruleForm, conditions: { ...ruleForm.conditions, conditions: newConditions } })
                              }}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                                isDark
                                  ? 'bg-white/5 border-white/10 text-white'
                                  : 'bg-white border-slate-200 text-slate-900'
                              }`}
                            >
                              <option value="">Select location type...</option>
                              {locationTypes.map((lt) => (
                                <option key={lt.id} value={lt.id}>{lt.name}</option>
                              ))}
                            </select>
                          ) : condition.field === 'location_status' ? (
                            <select
                              value={condition.value || ''}
                              onChange={(e) => {
                                const newConditions = [...ruleForm.conditions.conditions]
                                newConditions[index] = { ...condition, value: e.target.value }
                                setRuleForm({ ...ruleForm, conditions: { ...ruleForm.conditions, conditions: newConditions } })
                              }}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                                isDark
                                  ? 'bg-white/5 border-white/10 text-white'
                                  : 'bg-white border-slate-200 text-slate-900'
                              }`}
                            >
                              <option value="">Select...</option>
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="pending">Pending</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={condition.value || ''}
                              onChange={(e) => {
                                const newConditions = [...ruleForm.conditions.conditions]
                                newConditions[index] = { ...condition, value: e.target.value }
                                setRuleForm({ ...ruleForm, conditions: { ...ruleForm.conditions, conditions: newConditions } })
                              }}
                              placeholder="Value..."
                              className={`flex-1 px-3 py-2 rounded-lg text-sm border ${
                                isDark
                                  ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                                  : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                              }`}
                            />
                          )
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const newConditions = ruleForm.conditions.conditions.filter((_, i) => i !== index)
                            setRuleForm({ ...ruleForm, conditions: { ...ruleForm.conditions, conditions: newConditions } })
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark
                              ? 'hover:bg-red-500/20 text-red-400'
                              : 'hover:bg-red-50 text-red-500'
                          }`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newConditions = [...ruleForm.conditions.conditions, { field: '', operator: 'equals' as const, value: '' }]
                        setRuleForm({ ...ruleForm, conditions: { ...ruleForm.conditions, conditions: newConditions } })
                      }}
                      className={`w-full py-2 rounded-lg border border-dashed text-sm transition-colors ${
                        isDark
                          ? 'border-white/20 text-slate-400 hover:bg-white/5'
                          : 'border-slate-300 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      + Add Condition
                    </button>
                  </div>
                </div>

                {/* Service Type to Create - Shown after conditions are set */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Service Type to Create
                  </label>
                  {(() => {
                    const hasProjectTypeCondition = ruleForm.conditions.conditions.some(
                      c => c.field === 'project_type_id' && c.operator === 'equals' && c.value
                    )

                    if (!hasProjectTypeCondition) {
                      return (
                        <p className={`text-sm py-2.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          First add a &quot;Project Type equals...&quot; condition above to see available service types
                        </p>
                      )
                    }

                    if (filteredServiceTypes.length === 0) {
                      return (
                        <p className={`text-sm py-2.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                          No service types found for the selected project type
                        </p>
                      )
                    }

                    return (
                      <select
                        value={ruleForm.service_type_id}
                        onChange={(e) => setRuleForm({ ...ruleForm, service_type_id: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                      >
                        <option value="">Select service type...</option>
                        {filteredServiceTypes.map((type) => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    )
                  })()}
                </div>

                {/* Settings */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ruleForm.is_active}
                      onChange={(e) => setRuleForm({ ...ruleForm, is_active: e.target.checked })}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-6 rounded-full transition-colors relative ${
                        ruleForm.is_active
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                          : isDark ? 'bg-white/10' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          ruleForm.is_active ? 'left-5' : 'left-1'
                        }`}
                      />
                    </div>
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Active
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ruleForm.prevent_duplicates}
                      onChange={(e) => setRuleForm({ ...ruleForm, prevent_duplicates: e.target.checked })}
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-6 rounded-full transition-colors relative ${
                        ruleForm.prevent_duplicates
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-600'
                          : isDark ? 'bg-white/10' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          ruleForm.prevent_duplicates ? 'left-5' : 'left-1'
                        }`}
                      />
                    </div>
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Prevent Duplicates
                    </span>
                  </label>
                </div>

                {/* Priority */}
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Rule Priority
                    <span className={`ml-2 font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      (Lower = Higher Priority)
                    </span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={ruleForm.priority}
                    onChange={(e) => setRuleForm({ ...ruleForm, priority: parseInt(e.target.value) || 0 })}
                    className={`w-24 px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Footer */}
              <div
                className={`flex justify-end gap-3 p-5 border-t ${
                  isDark ? 'border-white/10' : 'border-slate-200'
                }`}
              >
                <button
                  onClick={() => {
                    setShowAddRule(false)
                    setEditingRule(null)
                  }}
                  className={`px-4 py-2 rounded-xl font-medium ${
                    isDark
                      ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    if (!ruleForm.name.trim()) {
                      toast.error('Rule name is required')
                      return
                    }
                    if (ruleForm.conditions.conditions.length === 0) {
                      toast.error('At least one condition is required')
                      return
                    }

                    setSaving(true)
                    try {
                      if (editingRule) {
                        const result = await updateServiceAutoRule(editingRule.id, ruleForm)
                        if (result.error) {
                          toast.error(result.error)
                        } else {
                          toast.success('Rule updated')
                          setEditingRule(null)
                          loadData()
                        }
                      } else {
                        const result = await createServiceAutoRule(ruleForm)
                        if (result.error) {
                          toast.error(result.error)
                        } else {
                          toast.success('Rule created')
                          setShowAddRule(false)
                          loadData()
                        }
                      }
                    } finally {
                      setSaving(false)
                    }
                  }}
                  disabled={saving || !ruleForm.name.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-cyan-600 text-white disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Custom Field Modal */}
      <AnimatePresence>
        {(showAddCustomField || editingCustomField) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowAddCustomField(false)
              setEditingCustomField(null)
              resetCustomFieldForm()
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl ${
                isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              {/* Header */}
              <div
                className={`sticky top-0 z-10 flex items-center justify-between p-5 border-b ${
                  isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
                }`}
              >
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {editingCustomField ? 'Edit Custom Field' : 'Add Custom Field'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddCustomField(false)
                    setEditingCustomField(null)
                    resetCustomFieldForm()
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="p-5 space-y-4">
                {/* Field Label */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-1.5 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Field Label <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customFieldForm.field_label}
                    onChange={(e) =>
                      setCustomFieldForm({ ...customFieldForm, field_label: e.target.value })
                    }
                    placeholder="e.g., Equipment Required"
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* Field Type */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-1.5 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Field Type
                  </label>
                  <select
                    value={customFieldForm.field_type}
                    onChange={(e) =>
                      setCustomFieldForm({
                        ...customFieldForm,
                        field_type: e.target.value as ServiceFieldType,
                      })
                    }
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Text Area</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="time">Time</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="url">URL</option>
                    <option value="select">Dropdown Select</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                </div>

                {/* Options for Select type */}
                {customFieldForm.field_type === 'select' && (
                  <div>
                    <label
                      className={`block text-sm font-medium mb-1.5 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Options
                    </label>
                    <div className="space-y-2">
                      {customFieldOptions.map((opt, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={opt.value}
                            onChange={(e) => updateOption(index, 'value', e.target.value)}
                            placeholder="Value"
                            className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                              isDark
                                ? 'bg-white/5 border-white/10 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                          <input
                            type="text"
                            value={opt.label}
                            onChange={(e) => updateOption(index, 'label', e.target.value)}
                            placeholder="Label"
                            className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                              isDark
                                ? 'bg-white/5 border-white/10 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                          <button
                            onClick={() => removeOption(index)}
                            className={`p-2 rounded-lg ${
                              isDark
                                ? 'hover:bg-red-500/20 text-red-400'
                                : 'hover:bg-red-50 text-red-500'
                            }`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addOption}
                        className={`w-full py-2 rounded-lg border border-dashed text-sm ${
                          isDark
                            ? 'border-white/20 text-slate-400 hover:bg-white/5'
                            : 'border-slate-300 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        + Add Option
                      </button>
                    </div>
                  </div>
                )}

                {/* Placeholder */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-1.5 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Placeholder
                  </label>
                  <input
                    type="text"
                    value={customFieldForm.placeholder}
                    onChange={(e) =>
                      setCustomFieldForm({ ...customFieldForm, placeholder: e.target.value })
                    }
                    placeholder="Placeholder text..."
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* Help Text */}
                <div>
                  <label
                    className={`block text-sm font-medium mb-1.5 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Help Text
                  </label>
                  <input
                    type="text"
                    value={customFieldForm.help_text}
                    onChange={(e) =>
                      setCustomFieldForm({ ...customFieldForm, help_text: e.target.value })
                    }
                    placeholder="Help text for users..."
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customFieldForm.is_required}
                      onChange={(e) =>
                        setCustomFieldForm({ ...customFieldForm, is_required: e.target.checked })
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-6 rounded-full transition-colors relative ${
                        customFieldForm.is_required
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-600'
                          : isDark
                            ? 'bg-white/10'
                            : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          customFieldForm.is_required ? 'left-5' : 'left-1'
                        }`}
                      />
                    </div>
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Required
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={customFieldForm.is_visible}
                      onChange={(e) =>
                        setCustomFieldForm({ ...customFieldForm, is_visible: e.target.checked })
                      }
                      className="sr-only"
                    />
                    <div
                      className={`w-10 h-6 rounded-full transition-colors relative ${
                        customFieldForm.is_visible
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-600'
                          : isDark
                            ? 'bg-white/10'
                            : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          customFieldForm.is_visible ? 'left-5' : 'left-1'
                        }`}
                      />
                    </div>
                    <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Visible
                    </span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div
                className={`flex justify-end gap-3 p-5 border-t ${
                  isDark ? 'border-white/10' : 'border-slate-200'
                }`}
              >
                <button
                  onClick={() => {
                    setShowAddCustomField(false)
                    setEditingCustomField(null)
                    resetCustomFieldForm()
                  }}
                  className={`px-4 py-2 rounded-xl font-medium ${
                    isDark
                      ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={editingCustomField ? handleUpdateCustomField : handleCreateCustomField}
                  disabled={saving || !customFieldForm.field_label.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-cyan-600 text-white disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editingCustomField ? 'Update' : 'Create'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
