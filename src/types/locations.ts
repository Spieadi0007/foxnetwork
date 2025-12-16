export interface Location {
  id: string
  company_id: string
  location_id?: string  // Auto-generated: CLIENT_COUNTRY_00001
  name: string
  client?: string
  code?: string
  type: 'site' | 'warehouse' | 'office' | 'store' | 'other'
  status: 'active' | 'inactive' | 'pending' | 'archived'
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  latitude?: number
  longitude?: number
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  notes?: string
  metadata?: Record<string, unknown>
  source: 'manual' | 'csv' | 'api' | 'form'
  source_reference?: string
  created_at: string
  updated_at: string
  created_by?: string
}

export interface ApiKey {
  id: string
  company_id: string
  name: string
  key_hash: string
  key_prefix: string
  permissions: string[]
  rate_limit_per_minute: number
  rate_limit_per_day: number
  last_used_at?: string
  total_requests: number
  status: 'active' | 'revoked' | 'expired'
  expires_at?: string
  created_at: string
  created_by?: string
  revoked_at?: string
  revoked_by?: string
}

export interface LocationForm {
  id: string
  company_id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  primary_color: string
  welcome_message?: string
  success_message: string
  fields_config: FieldsConfig
  requires_approval: boolean
  notify_on_submission: boolean
  notification_emails?: string[]
  status: 'active' | 'inactive' | 'archived'
  submission_count: number
  created_at: string
  updated_at: string
  created_by?: string
}

export interface FieldConfig {
  visible: boolean
  required: boolean
  label?: string
  placeholder?: string
}

export interface FieldsConfig {
  name: FieldConfig
  address_line1: FieldConfig
  address_line2: FieldConfig
  city: FieldConfig
  state: FieldConfig
  postal_code: FieldConfig
  country: FieldConfig
  contact_name: FieldConfig
  contact_email: FieldConfig
  contact_phone: FieldConfig
  notes: FieldConfig
}

export interface LocationSubmission {
  id: string
  form_id: string
  company_id: string
  name: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  latitude?: number
  longitude?: number
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  notes?: string
  metadata?: Record<string, unknown>
  submitter_ip?: string
  submitter_user_agent?: string
  status: 'pending' | 'approved' | 'rejected'
  reviewed_at?: string
  reviewed_by?: string
  rejection_reason?: string
  location_id?: string
  created_at: string
}

// Form input types
export interface CreateLocationInput {
  name: string
  client?: string
  code?: string
  type?: Location['type']
  status?: Location['status']
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  latitude?: number
  longitude?: number
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  notes?: string
  metadata?: Record<string, unknown>
}

export interface CreateApiKeyInput {
  name: string
  permissions?: string[]
  rate_limit_per_minute?: number
  rate_limit_per_day?: number
  expires_at?: string
}

export interface CreateLocationFormInput {
  name: string
  slug: string
  description?: string
  logo_url?: string
  primary_color?: string
  welcome_message?: string
  success_message?: string
  fields_config?: Partial<FieldsConfig>
  requires_approval?: boolean
  notify_on_submission?: boolean
  notification_emails?: string[]
}

// CSV upload types
export interface CSVLocationRow {
  name: string
  code?: string
  type?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  latitude?: string
  longitude?: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  notes?: string
}

export interface CSVUploadResult {
  success: number
  failed: number
  errors: Array<{
    row: number
    error: string
    data: CSVLocationRow
  }>
}

// Field Configuration Types
export type FieldType =
  | 'text'           // Single line text
  | 'textarea'       // Long text
  | 'select'         // Single select dropdown
  | 'multiselect'    // Multiple select
  | 'number'         // Number input
  | 'currency'       // Currency with symbol
  | 'percent'        // Percentage
  | 'date'           // Date picker
  | 'email'          // Email address
  | 'phone'          // Phone number
  | 'url'            // URL/Link
  | 'checkbox'       // Boolean checkbox
  | 'attachment'     // File attachment
  | 'user'           // User selector
  | 'duration'       // Time duration
  | 'rating'         // Star rating

export interface FieldOption {
  value: string
  label: string
}

export interface ValidationRules {
  min_length?: number
  max_length?: number
  min?: number
  max?: number
  pattern?: string
  pattern_message?: string
}

export interface LocationFieldDefinition {
  id: string
  field_key: string
  field_label: string
  field_type: FieldType
  category: 'general' | 'address' | 'contact' | 'operational' | 'custom'
  display_order: number
  is_system_field: boolean
  is_platform_required: boolean
  is_client_configurable: boolean
  options: FieldOption[]
  validation_rules: ValidationRules
  placeholder?: string
  help_text?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LocationFieldConfig {
  id: string
  company_id: string
  field_definition_id: string
  is_required: boolean
  is_visible: boolean
  custom_label?: string
  custom_placeholder?: string
  custom_help_text?: string
  display_order?: number
  created_at: string
  updated_at: string
  // Joined field definition
  field_definition?: LocationFieldDefinition
}

export interface LocationCustomField {
  id: string
  company_id: string
  field_key: string
  field_label: string
  field_type: FieldType
  is_required: boolean
  is_visible: boolean
  display_order: number
  category: string
  options: FieldOption[]
  validation_rules: ValidationRules
  placeholder?: string
  help_text?: string
  default_value?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Combined field for rendering forms
export interface ResolvedField {
  key: string
  label: string
  type: FieldType
  category: string
  displayOrder: number
  isRequired: boolean
  isVisible: boolean
  isSystemField: boolean
  isPlatformRequired: boolean
  isClientConfigurable: boolean
  isCustomField: boolean
  options: FieldOption[]
  validationRules: ValidationRules
  placeholder?: string
  helpText?: string
  defaultValue?: string
}

export interface CreateCustomFieldInput {
  field_key: string
  field_label: string
  field_type: FieldType
  is_required?: boolean
  is_visible?: boolean
  display_order?: number
  options?: FieldOption[]
  validation_rules?: ValidationRules
  placeholder?: string
  help_text?: string
  default_value?: string
}

export interface UpdateFieldConfigInput {
  field_definition_id: string
  is_required?: boolean
  is_visible?: boolean
  custom_label?: string
  custom_placeholder?: string
  custom_help_text?: string
  display_order?: number
}
