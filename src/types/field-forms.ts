// Field Form Field Types
export type FieldFormFieldType =
  | 'text'           // Single line text
  | 'textarea'       // Multi-line text
  | 'number'         // Number input
  | 'date'           // Date picker
  | 'time'           // Time picker
  | 'datetime'       // Date and time
  | 'photo'          // Photo capture/upload
  | 'signature'      // Signature pad
  | 'checkbox'       // Single checkbox (yes/no)
  | 'select'         // Dropdown select
  | 'radio'          // Radio buttons
  | 'checkbox_group' // Multiple checkboxes
  | 'rating'         // Star rating
  | 'location'       // GPS location capture
  | 'barcode'        // Barcode/QR scanner

// Field option for select/radio/checkbox_group
export interface FieldFormOption {
  value: string
  label: string
}

// Validation rules
export interface FieldFormValidation {
  min?: number
  max?: number
  min_length?: number
  max_length?: number
  pattern?: string
  min_photos?: number
  max_photos?: number
  accepted_file_types?: string[]
}

// Conditional display rule
export interface FieldFormCondition {
  field_key: string
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'
  value?: string | number | boolean
}

// Field Form Field
export interface FieldFormField {
  id: string
  form_id: string
  field_key: string
  label: string
  field_type: FieldFormFieldType
  is_required: boolean
  placeholder?: string
  help_text?: string
  options: FieldFormOption[]
  validation_rules: FieldFormValidation
  display_order: number
  condition?: FieldFormCondition
  is_active: boolean
  created_at: string
  updated_at: string
}

// Field Form (Template) - Reusable form structure
export interface FieldForm {
  id: string
  company_id: string
  name: string
  description?: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string
  // Joined data
  fields?: FieldFormField[]
}

// Service Form - Links a form to a service with configuration
export interface ServiceForm {
  id: string
  service_id: string
  form_id: string
  is_required: boolean
  allow_multiple: boolean
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined data
  form?: FieldForm
  service?: {
    id: string
    name: string
    parent_id?: string
  }
}

// Input types
export interface CreateFieldFormInput {
  name: string
  description?: string
  is_active?: boolean
}

export interface UpdateFieldFormInput {
  name?: string
  description?: string
  is_active?: boolean
}

export interface CreateServiceFormInput {
  service_id: string
  form_id: string
  is_required?: boolean
  allow_multiple?: boolean
  display_order?: number
  is_active?: boolean
}

export interface UpdateServiceFormInput {
  is_required?: boolean
  allow_multiple?: boolean
  display_order?: number
  is_active?: boolean
}

export interface CreateFieldFormFieldInput {
  form_id: string
  field_key: string
  label: string
  field_type: FieldFormFieldType
  is_required?: boolean
  placeholder?: string
  help_text?: string
  options?: FieldFormOption[]
  validation_rules?: FieldFormValidation
  display_order?: number
  condition?: FieldFormCondition
  is_active?: boolean
}

export interface UpdateFieldFormFieldInput {
  field_key?: string
  label?: string
  field_type?: FieldFormFieldType
  is_required?: boolean
  placeholder?: string
  help_text?: string
  options?: FieldFormOption[]
  validation_rules?: FieldFormValidation
  display_order?: number
  condition?: FieldFormCondition
  is_active?: boolean
}

// For displaying in lists
export interface FieldFormSummary {
  id: string
  name: string
  description?: string
  field_count: number
  service_name?: string
  is_required: boolean
  is_active: boolean
}
