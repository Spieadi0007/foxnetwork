// =====================================================
// FOX NETWORK: Action Module Types
// Configurable modules for field technician actions
// =====================================================

// Module field types
export type ActionFieldType =
  | 'datetime'
  | 'array'
  | 'signature'
  | 'photo_array'
  | 'text'
  | 'textarea'
  | 'number'
  | 'checklist'
  | 'duration'
  | 'calculated'

// Module categories
export type ActionModuleCategory =
  | 'general'
  | 'time'
  | 'materials'
  | 'verification'
  | 'media'

// Base module definition (platform-level)
export interface ActionModuleDefinition {
  id: string
  key: string
  name: string
  description: string | null
  icon: string | null
  category: ActionModuleCategory
  field_type: ActionFieldType
  field_config: Record<string, unknown>
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

// Company-specific module configuration
export interface ActionModuleConfig {
  id: string
  company_id: string
  module_id: string
  is_enabled: boolean
  is_required: boolean
  custom_label: string | null
  custom_description: string | null
  display_order: number | null
  validation_rules: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Combined module with config (for UI)
export interface ActionModuleWithConfig extends ActionModuleDefinition {
  config?: ActionModuleConfig
  is_enabled: boolean
  is_required: boolean
  effective_label: string
  effective_description: string | null
}

// Input types for mutations
export interface UpdateModuleConfigInput {
  module_id: string
  is_enabled: boolean
  is_required?: boolean
  custom_label?: string | null
  custom_description?: string | null
  display_order?: number | null
  validation_rules?: Record<string, unknown>
}

export interface BulkUpdateModuleConfigInput {
  modules: UpdateModuleConfigInput[]
}

// Field config types for specific modules
export interface DateTimeFieldConfig {
  defaultToNow?: boolean
}

export interface ArrayFieldConfig {
  itemSchema?: Record<string, string>
}

export interface PhotoFieldConfig {
  maxPhotos?: number
  allowCamera?: boolean
  allowGallery?: boolean
}

export interface TextFieldConfig {
  maxLength?: number
}

export interface ChecklistFieldConfig {
  items?: Array<{
    id: string
    label: string
    required?: boolean
  }>
}

export interface DurationFieldConfig {
  unit?: 'minutes' | 'hours'
}

export interface CalculatedFieldConfig {
  formula?: string
}

// Part used structure (for parts_used module)
export interface PartUsed {
  name: string
  quantity: number
  cost?: number
  part_code?: string
}

// Module icons mapping
export const MODULE_ICONS: Record<string, string> = {
  Play: 'Play',
  Square: 'Square',
  Package: 'Package',
  PenTool: 'PenTool',
  Edit3: 'Edit3',
  Camera: 'Camera',
  FileText: 'FileText',
  CheckSquare: 'CheckSquare',
  Navigation: 'Navigation',
  Clock: 'Clock',
  MessageCircle: 'MessageCircle',
  Languages: 'Languages',
}

// Category labels
export const CATEGORY_LABELS: Record<ActionModuleCategory, string> = {
  general: 'General',
  time: 'Time Tracking',
  materials: 'Materials & Parts',
  verification: 'Verification',
  media: 'Media & Photos',
}

// Category colors for UI
export const CATEGORY_COLORS: Record<ActionModuleCategory, string> = {
  general: 'bg-gray-100 text-gray-800',
  time: 'bg-blue-100 text-blue-800',
  materials: 'bg-amber-100 text-amber-800',
  verification: 'bg-green-100 text-green-800',
  media: 'bg-purple-100 text-purple-800',
}
