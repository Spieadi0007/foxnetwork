'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardList,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  ChevronLeft,
  Copy,
  FileText,
  Camera,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  List,
  Star,
  MapPin,
  PenTool,
  Clock,
  QrCode,
  GripVertical,
  Settings,
  ToggleLeft,
} from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/contexts/theme-context'
import { toast } from 'sonner'
import {
  getFieldForms,
  createFieldForm,
  updateFieldForm,
  deleteFieldForm,
  duplicateFieldForm,
  getFieldFormById,
  createFieldFormField,
  updateFieldFormField,
  deleteFieldFormField,
} from '@/lib/actions/field-forms'
import type { FieldForm, FieldFormField, CreateFieldFormInput, FieldFormFieldType } from '@/types/field-forms'

// Field type configuration
const FIELD_TYPES: { type: FieldFormFieldType; label: string; icon: React.ElementType; description: string }[] = [
  { type: 'text', label: 'Text', icon: Type, description: 'Single line text input' },
  { type: 'textarea', label: 'Long Text', icon: FileText, description: 'Multi-line text area' },
  { type: 'number', label: 'Number', icon: Hash, description: 'Numeric input' },
  { type: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
  { type: 'time', label: 'Time', icon: Clock, description: 'Time picker' },
  { type: 'photo', label: 'Photo', icon: Camera, description: 'Capture or upload photos' },
  { type: 'signature', label: 'Signature', icon: PenTool, description: 'Digital signature pad' },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, description: 'Yes/No checkbox' },
  { type: 'select', label: 'Dropdown', icon: List, description: 'Single select dropdown' },
  { type: 'radio', label: 'Radio', icon: ToggleLeft, description: 'Radio button options' },
  { type: 'checkbox_group', label: 'Multi-Select', icon: CheckSquare, description: 'Multiple checkboxes' },
  { type: 'rating', label: 'Rating', icon: Star, description: 'Star rating (1-5)' },
  { type: 'location', label: 'Location', icon: MapPin, description: 'GPS coordinates' },
  { type: 'barcode', label: 'Barcode', icon: QrCode, description: 'Scan barcode/QR' },
]

export default function FieldFormsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // State
  const [forms, setForms] = useState<FieldForm[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingForm, setEditingForm] = useState<FieldForm | null>(null)
  const [buildingForm, setBuildingForm] = useState<FieldForm | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Form state (simplified - just name and description)
  const [createForm, setCreateForm] = useState<CreateFieldFormInput>({
    name: '',
    description: '',
  })

  // Field builder state
  const [addingField, setAddingField] = useState(false)
  const [editingField, setEditingField] = useState<FieldFormField | null>(null)
  const [newField, setNewField] = useState({
    label: '',
    field_type: 'text' as FieldFormFieldType,
    is_required: false,
    placeholder: '',
    help_text: '',
    options: [] as { value: string; label: string }[],
  })

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const formsRes = await getFieldForms()
      if (formsRes.data) setForms(formsRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Load form with fields for builder
  const loadFormForBuilding = async (formId: string) => {
    const { data, error } = await getFieldFormById(formId)
    if (error) {
      toast.error(error)
    } else if (data) {
      setBuildingForm(data)
    }
  }

  // Filter forms
  const filteredForms = forms.filter(form => {
    const matchesSearch = !searchQuery ||
      form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Handlers
  const handleCreateForm = async () => {
    if (!createForm.name.trim()) {
      toast.error('Name is required')
      return
    }

    setFormLoading(true)
    try {
      const result = await createFieldForm(createForm)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Form created successfully')
        setShowCreateModal(false)
        setCreateForm({ name: '', description: '' })
        loadData()
        // Open the form builder
        if (result.data) {
          setBuildingForm({ ...result.data, fields: [] })
        }
      }
    } catch {
      toast.error('Failed to create form')
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateForm = async () => {
    if (!editingForm) return

    setFormLoading(true)
    try {
      const result = await updateFieldForm(editingForm.id, {
        name: editingForm.name,
        description: editingForm.description,
        is_active: editingForm.is_active,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Form updated successfully')
        setEditingForm(null)
        loadData()
      }
    } catch {
      toast.error('Failed to update form')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteForm = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form and all its fields?')) return

    try {
      const result = await deleteFieldForm(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Form deleted successfully')
        loadData()
      }
    } catch {
      toast.error('Failed to delete form')
    }
  }

  const handleDuplicateForm = async (id: string, name: string) => {
    const newName = prompt('Enter name for the duplicate:', `${name} (Copy)`)
    if (!newName) return

    try {
      const result = await duplicateFieldForm(id, newName)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Form duplicated successfully')
        loadData()
      }
    } catch {
      toast.error('Failed to duplicate form')
    }
  }

  // Field handlers
  const handleAddField = async () => {
    if (!buildingForm || !newField.label.trim()) {
      toast.error('Field label is required')
      return
    }

    // Generate field_key from label
    const fieldKey = newField.label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')

    setFormLoading(true)
    try {
      const result = await createFieldFormField({
        form_id: buildingForm.id,
        field_key: fieldKey,
        label: newField.label,
        field_type: newField.field_type,
        is_required: newField.is_required,
        placeholder: newField.placeholder || undefined,
        help_text: newField.help_text || undefined,
        options: newField.options.length > 0 ? newField.options : undefined,
        display_order: buildingForm.fields?.length || 0,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Field added')
        setAddingField(false)
        setNewField({ label: '', field_type: 'text', is_required: false, placeholder: '', help_text: '', options: [] })
        // Reload form with fields
        loadFormForBuilding(buildingForm.id)
      }
    } catch {
      toast.error('Failed to add field')
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateField = async () => {
    if (!editingField) return

    setFormLoading(true)
    try {
      const result = await updateFieldFormField(editingField.id, {
        label: editingField.label,
        field_type: editingField.field_type,
        is_required: editingField.is_required,
        placeholder: editingField.placeholder || undefined,
        help_text: editingField.help_text || undefined,
        options: editingField.options,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Field updated')
        setEditingField(null)
        if (buildingForm) loadFormForBuilding(buildingForm.id)
      }
    } catch {
      toast.error('Failed to update field')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Delete this field?')) return

    try {
      const result = await deleteFieldFormField(fieldId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Field deleted')
        if (buildingForm) loadFormForBuilding(buildingForm.id)
      }
    } catch {
      toast.error('Failed to delete field')
    }
  }

  // Get field type icon
  const getFieldTypeIcon = (type: FieldFormFieldType) => {
    const config = FIELD_TYPES.find(f => f.type === type)
    return config?.icon || Type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  // Form Builder View
  if (buildingForm) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setBuildingForm(null)}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {buildingForm.name}
            </h1>
            <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {buildingForm.description || 'No description'}
            </p>
          </div>
          <button
            onClick={() => setEditingForm(buildingForm)}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Fields List */}
        <div className={`rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <div className={`px-5 py-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Form Fields ({buildingForm.fields?.length || 0})
              </h2>
              <motion.button
                onClick={() => setAddingField(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Field
              </motion.button>
            </div>
          </div>

          {/* Fields */}
          <div className="p-4 space-y-2">
            {buildingForm.fields && buildingForm.fields.length > 0 ? (
              buildingForm.fields.map((field, index) => {
                const FieldIcon = getFieldTypeIcon(field.field_type)
                return (
                  <div
                    key={field.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <GripVertical className={`w-4 h-4 ${isDark ? 'text-slate-600' : 'text-slate-400'} cursor-grab`} />
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {index + 1}
                    </span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                    }`}>
                      <FieldIcon className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {field.label}
                        {field.is_required && <span className="text-red-500 ml-1">*</span>}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {FIELD_TYPES.find(t => t.type === field.field_type)?.label || field.field_type}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingField(field)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-200 text-slate-500'
                        }`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteField(field.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className={`text-center py-12 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">No fields yet</p>
                <p className="text-sm mt-1">Add fields to build your form</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Field Modal */}
        <AnimatePresence>
          {addingField && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setAddingField(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-lg rounded-2xl border shadow-2xl max-h-[90vh] overflow-y-auto ${
                  isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
                }`}
              >
                {/* Header */}
                <div className={`flex items-center justify-between p-5 border-b sticky top-0 ${
                  isDark ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-white'
                }`}>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Add Field
                  </h2>
                  <button
                    onClick={() => setAddingField(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5">
                  {/* Field Type Grid */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Field Type
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
                        <button
                          key={type}
                          onClick={() => setNewField({ ...newField, field_type: type })}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            newField.field_type === type
                              ? isDark
                                ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                : 'bg-blue-50 border-blue-500 text-blue-600'
                              : isDark
                                ? 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <Icon className="w-5 h-5 mx-auto mb-1" />
                          <span className="text-xs font-medium">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Label */}
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Label <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newField.label}
                      onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                      placeholder="e.g., Device Serial Number"
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>

                  {/* Required */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_required"
                      checked={newField.is_required}
                      onChange={(e) => setNewField({ ...newField, is_required: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <label htmlFor="is_required" className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Required field
                    </label>
                  </div>

                  {/* Placeholder */}
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={newField.placeholder}
                      onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                      placeholder="Optional placeholder text"
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>

                  {/* Options for select/radio/checkbox_group */}
                  {['select', 'radio', 'checkbox_group'].includes(newField.field_type) && (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Options
                      </label>
                      <div className="space-y-2">
                        {newField.options.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={opt.label}
                              onChange={(e) => {
                                const newOpts = [...newField.options]
                                newOpts[i] = {
                                  value: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
                                  label: e.target.value
                                }
                                setNewField({ ...newField, options: newOpts })
                              }}
                              placeholder={`Option ${i + 1}`}
                              className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                                isDark
                                  ? 'bg-white/5 border-white/10 text-white'
                                  : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                            />
                            <button
                              onClick={() => {
                                const newOpts = newField.options.filter((_, idx) => idx !== i)
                                setNewField({ ...newField, options: newOpts })
                              }}
                              className={`p-2 rounded-lg ${
                                isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'
                              }`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => setNewField({
                            ...newField,
                            options: [...newField.options, { value: '', label: '' }]
                          })}
                          className={`w-full py-2 rounded-lg border-2 border-dashed text-sm font-medium ${
                            isDark
                              ? 'border-white/10 text-slate-400 hover:border-white/20'
                              : 'border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          + Add Option
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Help Text */}
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Help Text
                    </label>
                    <input
                      type="text"
                      value={newField.help_text}
                      onChange={(e) => setNewField({ ...newField, help_text: e.target.value })}
                      placeholder="Optional instructions for the technician"
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                          : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className={`flex items-center justify-end gap-3 p-5 border-t sticky bottom-0 ${
                  isDark ? 'border-white/10 bg-slate-900' : 'border-slate-200 bg-white'
                }`}>
                  <button
                    onClick={() => setAddingField(false)}
                    className={`px-5 py-2.5 rounded-xl font-medium ${
                      isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleAddField}
                    disabled={formLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium disabled:opacity-50"
                  >
                    {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Field'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Field Modal */}
        <AnimatePresence>
          {editingField && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setEditingField(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-md rounded-2xl border shadow-2xl ${
                  isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
                }`}
              >
                <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Edit Field
                  </h2>
                  <button
                    onClick={() => setEditingField(null)}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Label
                    </label>
                    <input
                      type="text"
                      value={editingField.label}
                      onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="edit_is_required"
                      checked={editingField.is_required}
                      onChange={(e) => setEditingField({ ...editingField, is_required: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <label htmlFor="edit_is_required" className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      Required field
                    </label>
                  </div>
                </div>

                <div className={`flex items-center justify-end gap-3 p-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <button
                    onClick={() => setEditingField(null)}
                    className={`px-5 py-2.5 rounded-xl font-medium ${
                      isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleUpdateField}
                    disabled={formLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium disabled:opacity-50"
                  >
                    {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Main List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/library"
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Field Forms
            </h1>
            <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Create form templates for technicians to fill during service
            </p>
          </div>
        </div>
        <motion.button
          onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium flex items-center gap-2 shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-5 h-5" />
          Create Form
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        <input
          type="text"
          placeholder="Search forms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
            isDark
              ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
              : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
          }`}
        />
      </div>

      {/* Forms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredForms.map((form, index) => (
          <motion.div
            key={form.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-5 rounded-2xl border cursor-pointer transition-all hover:shadow-lg ${
              isDark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => loadFormForBuilding(form.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center`}>
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {form.name}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Form template
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleDuplicateForm(form.id, form.name)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingForm(form)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteForm(form.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {form.description && (
              <p className={`mt-3 text-sm line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {form.description}
              </p>
            )}

            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2 py-1 rounded-full ${
                isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
              }`}>
                {form.fields?.length || 0} fields
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'
              }`}>
                Click to edit
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredForms.length === 0 && (
        <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <ClipboardList className={`w-12 h-12 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
          <p className={`mt-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            No field forms yet
          </p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Create your first form template for technicians
          </p>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Create Form
          </motion.button>
        </div>
      )}

      {/* Create Form Modal */}
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
              className={`w-full max-w-md rounded-2xl border shadow-2xl ${
                isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
                    <ClipboardList className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Create Field Form
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

              <div className="p-5 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Form Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="e.g., Site Survey Checklist"
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    rows={2}
                    placeholder="What is this form for?"
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  After creating the form, you can add fields to it. Connect forms to services in the Library page.
                </p>
              </div>

              <div className={`flex items-center justify-end gap-3 p-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`px-5 py-2.5 rounded-xl font-medium ${
                    isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleCreateForm}
                  disabled={formLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium disabled:opacity-50"
                >
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create & Add Fields'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Form Modal */}
      <AnimatePresence>
        {editingForm && !buildingForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditingForm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl border shadow-2xl ${
                isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Edit Form Settings
                </h2>
                <button
                  onClick={() => setEditingForm(null)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Form Name
                  </label>
                  <input
                    type="text"
                    value={editingForm.name}
                    onChange={(e) => setEditingForm({ ...editingForm, name: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={editingForm.description || ''}
                    onChange={(e) => setEditingForm({ ...editingForm, description: e.target.value })}
                    rows={2}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit_is_active"
                    checked={editingForm.is_active}
                    onChange={(e) => setEditingForm({ ...editingForm, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <label htmlFor="edit_is_active" className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Active
                  </label>
                </div>
              </div>

              <div className={`flex items-center justify-end gap-3 p-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <button
                  onClick={() => setEditingForm(null)}
                  className={`px-5 py-2.5 rounded-xl font-medium ${
                    isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleUpdateForm}
                  disabled={formLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium disabled:opacity-50"
                >
                  {formLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
