export interface Location {
  id: string
  company_id: string
  name: string
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
  code?: string
  type?: Location['type']
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
