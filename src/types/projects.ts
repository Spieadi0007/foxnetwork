// Project Types

// Project type is now dynamic from library - this is for backwards compatibility
export type ProjectType = string  // Dynamic from library (e.g., 'Deployment', 'Maintenance')
export type BillingModel = 'fixed' | 'time_and_materials' | 'per_visit' | 'per_action'
export type SLATier = 'standard' | 'premium' | 'critical'
export type ProjectStatus = 'draft' | 'active' | 'on_hold' | 'completed' | 'cancelled'
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Project {
  id: string
  company_id: string
  location_id: string

  // Auto-generated Project ID (e.g., DEP_FR_151224_001)
  project_id?: string

  // Basic Info
  name: string
  description?: string
  // code field removed - replaced by project_id

  // Project Classification
  project_type: ProjectType  // Name from library (e.g., 'Deployment')
  project_type_id?: string   // Reference to library_items.id
  billing_model: BillingModel
  sla_tier: SLATier

  // Status
  status: ProjectStatus
  priority: ProjectPriority

  // Timeline
  start_date?: string
  target_end_date?: string
  actual_end_date?: string

  // Budget/Value
  estimated_value?: number
  actual_value?: number
  currency: string

  // Client Info is at Location level, not Project level

  // Configuration
  config: Record<string, unknown>

  // Additional Info
  notes?: string
  metadata: Record<string, unknown>

  // Timestamps
  created_at: string
  updated_at: string
  created_by?: string

  // Joined data
  location?: {
    id: string
    name: string
    code?: string
    city?: string
    country?: string
  }
  services_count?: number
}

export interface CreateProjectInput {
  location_id: string
  name?: string  // Optional - auto-generated from project_id
  description?: string
  // code removed - replaced by project_id
  project_type_id: string  // Required - reference to library item
  billing_model?: BillingModel
  sla_tier?: SLATier
  status?: ProjectStatus
  priority?: ProjectPriority
  start_date?: string
  target_end_date?: string
  estimated_value?: number
  currency?: string
  // Client Info is at Location level, not Project level
  notes?: string
  metadata?: Record<string, unknown>
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  actual_end_date?: string
  actual_value?: number
}

// Service Types (for reference)
export type ServiceUrgency = 'scheduled' | 'same_day' | 'emergency'
export type ServiceStatus = 'scheduled' | 'in_progress' | 'pending_approval' | 'completed' | 'cancelled' | 'on_hold'

// Part/Material used during service
export interface PartUsed {
  name: string
  quantity: number
  cost?: number
  part_code?: string
  currency?: string
}

export interface Service {
  id: string
  company_id: string
  project_id: string  // Required - every service belongs to a project
  location_id: string // Auto-derived from project

  // Auto-generated Service ID (e.g., SVC_DEP_FR_151224_001)
  service_id?: string

  // Service Type (from library - child of project type)
  service_type?: string       // Name from library
  service_type_id?: string    // Reference to library_items.id

  // Workflow Step and Status (from library)
  step?: string               // Current workflow stage (e.g., New, In Progress, Done)
  step_id?: string            // Reference to library_items.id (workflow_steps category)
  step_status?: string        // Status within the step (e.g., On Track, Delayed)
  step_status_id?: string     // Reference to library_items.id (step_statuses category)

  title?: string
  description?: string
  reference_number?: string

  urgency: ServiceUrgency
  scheduled_date?: string
  scheduled_start_time?: string
  scheduled_end_time?: string

  started_at?: string
  completed_at?: string

  status: ServiceStatus

  // Travel Tracking
  departure_time?: string
  arrival_time?: string
  travel_duration?: number  // minutes

  // Parts/Materials Used
  parts_used: PartUsed[]

  // Signatures
  customer_signature?: string
  technician_signature?: string

  assigned_technicians: string[]
  primary_technician_id?: string

  allow_merge: boolean
  max_actions: number
  merged_from_services: string[]

  config: Record<string, unknown>
  notes?: string
  metadata: Record<string, unknown>

  created_at: string
  updated_at: string
  created_by?: string

  // Joined data
  project?: {
    id: string
    name: string
    project_id?: string
    project_type?: string
    project_type_id?: string
  }
  location?: {
    id: string
    name: string
    code?: string
    city?: string
    country?: string
  }
  actions_count?: number
}

export interface CreateServiceInput {
  project_id: string  // Required - every service belongs to a project
  // location_id is auto-derived from project
  service_type_id?: string  // Reference to library_items.id (child of project type)
  step_id?: string          // Workflow step from library
  step_status_id?: string   // Step status from library
  title?: string
  description?: string
  reference_number?: string
  urgency?: ServiceUrgency
  scheduled_date?: string
  scheduled_start_time?: string
  scheduled_end_time?: string
  status?: ServiceStatus
  assigned_technicians?: string[]
  primary_technician_id?: string
  // Travel Tracking
  departure_time?: string
  arrival_time?: string
  travel_duration?: number
  // Parts/Materials
  parts_used?: PartUsed[]
  // Signatures
  customer_signature?: string
  technician_signature?: string
  notes?: string
  metadata?: Record<string, unknown>
}

export interface UpdateServiceInput extends Partial<Omit<CreateServiceInput, 'project_id'>> {
  project_id?: string  // Optional on update
  started_at?: string
  completed_at?: string
}

export interface ServiceStats {
  total: number
  scheduled: number
  inProgress: number
  pendingApproval: number
  completed: number
  cancelled: number
}

// Action Types (for reference)
export type ActionSource = 'manual' | 'api' | 'ticket' | 'scheduled' | 'field_discovery'
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed' | 'requires_followup'

export interface Action {
  id: string
  company_id: string
  service_id: string
  asset_id?: string
  template_id?: string

  title: string
  description?: string
  action_type: string

  source: ActionSource
  source_reference?: string

  status: ActionStatus
  priority: number

  estimated_duration_minutes?: number
  actual_duration_minutes?: number

  started_at?: string
  completed_at?: string

  performed_by?: string
  verified_by?: string

  result?: Record<string, unknown>
  notes?: string
  metadata: Record<string, unknown>

  created_at: string
  updated_at: string
  created_by?: string
}

// Stats type
export interface ProjectStats {
  total: number
  active: number
  draft: number
  completed: number
  onHold: number
}

// ============ FIELD CONFIGURATION TYPES ============

export type ProjectFieldType =
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

export interface ProjectFieldOption {
  value: string
  label: string
}

export interface ProjectValidationRules {
  min_length?: number
  max_length?: number
  min?: number
  max?: number
  pattern?: string
  pattern_message?: string
}

export interface ProjectFieldDefinition {
  id: string
  field_key: string
  field_label: string
  field_type: ProjectFieldType
  category: 'general' | 'timeline' | 'financial' | 'client' | 'operational' | 'custom'
  display_order: number
  is_system_field: boolean
  is_platform_required: boolean
  is_client_configurable: boolean
  options: ProjectFieldOption[]
  validation_rules: ProjectValidationRules
  placeholder?: string
  help_text?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProjectFieldConfig {
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
  field_definition?: ProjectFieldDefinition
}

export interface ProjectCustomField {
  id: string
  company_id: string
  field_key: string
  field_label: string
  field_type: ProjectFieldType
  is_required: boolean
  is_visible: boolean
  display_order: number
  category: string
  options: ProjectFieldOption[]
  validation_rules: ProjectValidationRules
  placeholder?: string
  help_text?: string
  default_value?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Combined field for rendering forms
export interface ResolvedProjectField {
  key: string
  label: string
  type: ProjectFieldType
  category: string
  displayOrder: number
  isRequired: boolean
  isVisible: boolean
  isSystemField: boolean
  isPlatformRequired: boolean
  isClientConfigurable: boolean
  isCustomField: boolean
  options: ProjectFieldOption[]
  validationRules: ProjectValidationRules
  placeholder?: string
  helpText?: string
  defaultValue?: string
}

export interface CreateProjectCustomFieldInput {
  field_key: string
  field_label: string
  field_type: ProjectFieldType
  is_required?: boolean
  is_visible?: boolean
  display_order?: number
  options?: ProjectFieldOption[]
  validation_rules?: ProjectValidationRules
  placeholder?: string
  help_text?: string
  default_value?: string
}

export interface UpdateProjectFieldConfigInput {
  field_definition_id: string
  is_required?: boolean
  is_visible?: boolean
  custom_label?: string
  custom_placeholder?: string
  custom_help_text?: string
  display_order?: number
}

// ============ SERVICE FIELD CONFIGURATION TYPES ============

export type ServiceFieldType =
  | 'text'           // Single line text
  | 'textarea'       // Long text
  | 'select'         // Single select dropdown
  | 'multiselect'    // Multiple select
  | 'number'         // Number input
  | 'currency'       // Currency with symbol
  | 'percent'        // Percentage
  | 'date'           // Date picker
  | 'time'           // Time picker
  | 'email'          // Email address
  | 'phone'          // Phone number
  | 'url'            // URL/Link
  | 'checkbox'       // Boolean checkbox
  | 'attachment'     // File attachment
  | 'user'           // User selector
  | 'duration'       // Time duration
  | 'rating'         // Star rating

export interface ServiceFieldOption {
  value: string
  label: string
}

export interface ServiceValidationRules {
  min_length?: number
  max_length?: number
  min?: number
  max?: number
  pattern?: string
  pattern_message?: string
}

export interface ServiceFieldDefinition {
  id: string
  field_key: string
  field_label: string
  field_type: ServiceFieldType
  category: 'general' | 'scheduling' | 'assignment' | 'operational' | 'custom'
  display_order: number
  is_system_field: boolean
  is_platform_required: boolean
  is_client_configurable: boolean
  options: ServiceFieldOption[]
  validation_rules: ServiceValidationRules
  placeholder?: string
  help_text?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ServiceFieldConfig {
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
  field_definition?: ServiceFieldDefinition
}

export interface ServiceCustomField {
  id: string
  company_id: string
  field_key: string
  field_label: string
  field_type: ServiceFieldType
  is_required: boolean
  is_visible: boolean
  display_order: number
  category: string
  options: ServiceFieldOption[]
  validation_rules: ServiceValidationRules
  placeholder?: string
  help_text?: string
  default_value?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Combined field for rendering forms
export interface ResolvedServiceField {
  key: string
  label: string
  type: ServiceFieldType
  category: string
  displayOrder: number
  isRequired: boolean
  isVisible: boolean
  isSystemField: boolean
  isPlatformRequired: boolean
  isClientConfigurable: boolean
  isCustomField: boolean
  options: ServiceFieldOption[]
  validationRules: ServiceValidationRules
  placeholder?: string
  helpText?: string
  defaultValue?: string
}

export interface CreateServiceCustomFieldInput {
  field_key: string
  field_label: string
  field_type: ServiceFieldType
  is_required?: boolean
  is_visible?: boolean
  display_order?: number
  options?: ServiceFieldOption[]
  validation_rules?: ServiceValidationRules
  placeholder?: string
  help_text?: string
  default_value?: string
}

export interface UpdateServiceFieldConfigInput {
  field_definition_id: string
  is_required?: boolean
  is_visible?: boolean
  custom_label?: string
  custom_placeholder?: string
  custom_help_text?: string
  display_order?: number
}

// ============ PROJECT AUTO-CREATION RULES ============

export type LocationConditionOperator =
  | 'is_empty'
  | 'is_not_empty'
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'starts_with'
  | 'ends_with'
  | 'in'

export interface LocationCondition {
  field: string                      // Location field (client_id, country, city, etc.)
  operator: LocationConditionOperator
  value?: string | null
}

export interface LocationConditionsConfig {
  conditions: LocationCondition[]
  logic: 'all' | 'any'
}

export interface ProjectAutoRule {
  id: string
  company_id: string
  name: string
  description?: string

  // What project to create
  project_type_id: string
  default_step_id?: string
  default_step_status_id?: string

  // Project defaults
  default_billing_model: BillingModel
  default_sla_tier: SLATier
  default_priority: ProjectPriority

  // Location conditions
  conditions: LocationConditionsConfig

  // Settings
  is_active: boolean
  priority: number
  prevent_duplicates: boolean

  // Timestamps
  created_at: string
  updated_at: string
  created_by?: string

  // Joined data
  project_type?: {
    id: string
    name: string
    code?: string
  }
  default_step?: {
    id: string
    name: string
  }
  default_step_status?: {
    id: string
    name: string
  }
}

export interface CreateProjectAutoRuleInput {
  name: string
  description?: string
  project_type_id: string
  default_step_id?: string
  default_step_status_id?: string
  default_billing_model?: BillingModel
  default_sla_tier?: SLATier
  default_priority?: ProjectPriority
  conditions: LocationConditionsConfig
  is_active?: boolean
  priority?: number
  prevent_duplicates?: boolean
}

export interface UpdateProjectAutoRuleInput extends Partial<CreateProjectAutoRuleInput> {}

// Location fields available for conditions
export const LOCATION_CONDITION_FIELDS = [
  { key: 'client', label: 'Client', type: 'select' },
  { key: 'country', label: 'Country', type: 'text' },
  { key: 'state', label: 'State/Region', type: 'text' },
  { key: 'city', label: 'City', type: 'text' },
  { key: 'type', label: 'Location Type', type: 'select' },
  { key: 'status', label: 'Status', type: 'select' },
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'code', label: 'Code', type: 'text' },
  { key: 'postal_code', label: 'Postal Code', type: 'text' },
] as const

// Operators for location conditions
export const LOCATION_OPERATOR_OPTIONS = [
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'starts_with', label: 'Starts with' },
  { value: 'ends_with', label: 'Ends with' },
  { value: 'in', label: 'Is one of (comma-separated)' },
]

// ============ SERVICE AUTO-CREATION RULES ============

export type ProjectConditionOperator =
  | 'is_empty'
  | 'is_not_empty'
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'starts_with'
  | 'ends_with'
  | 'in'

export interface ProjectCondition {
  field: string                      // Project field (project_type_id, priority, sla_tier, etc.)
  operator: ProjectConditionOperator
  value?: string | null
}

export interface ProjectConditionsConfig {
  conditions: ProjectCondition[]
  logic: 'all' | 'any'
}

export interface ServiceAutoRule {
  id: string
  company_id: string
  name: string
  description?: string

  // What service to create
  service_type_id?: string
  default_step_id?: string
  default_step_status_id?: string

  // Service defaults
  default_urgency: ServiceUrgency
  default_status: ServiceStatus

  // Project conditions
  conditions: ProjectConditionsConfig

  // Settings
  is_active: boolean
  priority: number
  prevent_duplicates: boolean

  // Timestamps
  created_at: string
  updated_at: string
  created_by?: string

  // Joined data
  service_type?: {
    id: string
    name: string
  }
  default_step?: {
    id: string
    name: string
  }
  default_step_status?: {
    id: string
    name: string
  }
}

export interface CreateServiceAutoRuleInput {
  name: string
  description?: string
  service_type_id?: string
  default_step_id?: string
  default_step_status_id?: string
  default_urgency?: ServiceUrgency
  default_status?: ServiceStatus
  conditions: ProjectConditionsConfig
  is_active?: boolean
  priority?: number
  prevent_duplicates?: boolean
}

export interface UpdateServiceAutoRuleInput extends Partial<CreateServiceAutoRuleInput> {}

// Project fields available for conditions
export const PROJECT_CONDITION_FIELDS = [
  { key: 'project_type_id', label: 'Project Type', type: 'select', group: 'project' },
  { key: 'billing_model', label: 'Billing Model', type: 'select', group: 'project' },
  { key: 'sla_tier', label: 'SLA Tier', type: 'select', group: 'project' },
  { key: 'priority', label: 'Priority', type: 'select', group: 'project' },
  { key: 'status', label: 'Project Status', type: 'select', group: 'project' },
  { key: 'name', label: 'Project Name', type: 'text', group: 'project' },
  { key: 'project_id', label: 'Project ID', type: 'text', group: 'project' },
] as const

// Service rule condition fields - includes both project AND location fields
export const SERVICE_RULE_CONDITION_FIELDS = [
  // Project fields
  { key: 'project_type_id', label: 'Project Type', type: 'select', group: 'project' },
  { key: 'billing_model', label: 'Billing Model', type: 'select', group: 'project' },
  { key: 'sla_tier', label: 'SLA Tier', type: 'select', group: 'project' },
  { key: 'priority', label: 'Priority', type: 'select', group: 'project' },
  { key: 'status', label: 'Project Status', type: 'select', group: 'project' },
  // Location fields
  { key: 'client', label: 'Client', type: 'select', group: 'location' },
  { key: 'country', label: 'Country', type: 'text', group: 'location' },
  { key: 'state', label: 'State/Region', type: 'text', group: 'location' },
  { key: 'city', label: 'City', type: 'text', group: 'location' },
  { key: 'type', label: 'Location Type', type: 'select', group: 'location' },
  { key: 'postal_code', label: 'Postal Code', type: 'text', group: 'location' },
  { key: 'location_status', label: 'Location Status', type: 'select', group: 'location' },
] as const

// Operators for project conditions (same as location)
export const PROJECT_OPERATOR_OPTIONS = [
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Does not equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'starts_with', label: 'Starts with' },
  { value: 'ends_with', label: 'Ends with' },
  { value: 'in', label: 'Is one of (comma-separated)' },
]
