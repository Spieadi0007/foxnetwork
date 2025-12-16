// Library Category - defines types of items (countries, clients, etc.)
export interface LibraryCategory {
  id: string
  slug: string
  name: string
  description?: string
  icon?: string
  is_system: boolean
  is_active: boolean
  display_order: number
  // Nesting support
  supports_nesting: boolean
  child_label?: string  // e.g., 'Services' for project_types
  created_at: string
  updated_at: string
}

// Library Item - individual items within a category
export interface LibraryItem {
  id: string
  company_id: string
  category_id: string
  parent_id?: string  // NULL = top-level, otherwise child of another item
  name: string
  code?: string
  description?: string
  metadata?: Record<string, unknown>
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
  created_by?: string
  // Joined data
  category?: LibraryCategory
  parent?: LibraryItem
  children?: LibraryItem[]  // For nested display
}

// Input types for creating/updating
export interface CreateLibraryItemInput {
  category_id: string
  parent_id?: string  // For creating child items (services under project types)
  name: string
  code?: string
  description?: string
  metadata?: Record<string, unknown>
  is_active?: boolean
  display_order?: number
}

export interface UpdateLibraryItemInput {
  name?: string
  code?: string
  description?: string
  metadata?: Record<string, unknown>
  is_active?: boolean
  display_order?: number
}

// For select dropdowns
export interface LibraryItemOption {
  id: string
  name: string
  code?: string
}

// ============ STEP CONDITIONS ============
// Used by workflow_steps to define when a step should be auto-suggested

export type ConditionOperator =
  | 'is_empty'           // Field is null or empty string
  | 'is_not_empty'       // Field has a value
  | 'equals'             // Field equals a specific value
  | 'not_equals'         // Field doesn't equal a specific value
  | 'contains'           // Field contains a substring (text fields)
  | 'greater_than'       // Field is greater than value (numbers/dates)
  | 'less_than'          // Field is less than value (numbers/dates)
  | 'in'                 // Field value is in a list of values

// A single condition on a service field
export interface StepCondition {
  field: string                  // Service field key (e.g., 'primary_technician_id', 'scheduled_date')
  operator: ConditionOperator    // Comparison operator
  value?: string | number | null // Value to compare against (not needed for is_empty/is_not_empty)
}

// Complete step conditions configuration stored in metadata
export interface StepConditionsConfig {
  conditions: StepCondition[]
  logic: 'all' | 'any'           // 'all' = AND (all conditions must match), 'any' = OR (at least one)
}

// Service fields available for conditions
export const SERVICE_CONDITION_FIELDS = [
  { key: 'primary_technician_id', label: 'Primary Technician', type: 'select' },
  { key: 'assigned_technicians', label: 'Assigned Technicians', type: 'array' },
  { key: 'scheduled_date', label: 'Scheduled Date', type: 'date' },
  { key: 'scheduled_start_time', label: 'Start Time', type: 'time' },
  { key: 'scheduled_end_time', label: 'End Time', type: 'time' },
  { key: 'started_at', label: 'Started At', type: 'datetime' },
  { key: 'completed_at', label: 'Completed At', type: 'datetime' },
  { key: 'departure_time', label: 'Departure Time', type: 'datetime' },
  { key: 'arrival_time', label: 'Arrival Time', type: 'datetime' },
  { key: 'status', label: 'Status', type: 'select' },
  { key: 'urgency', label: 'Urgency', type: 'select' },
  { key: 'customer_signature', label: 'Customer Signature', type: 'text' },
  { key: 'technician_signature', label: 'Technician Signature', type: 'text' },
  { key: 'service_type_id', label: 'Service Type', type: 'select' },
  { key: 'project_id', label: 'Project', type: 'select' },
] as const

// Operators available for each field type
export const OPERATOR_OPTIONS = {
  all: [
    { value: 'is_empty', label: 'Is empty' },
    { value: 'is_not_empty', label: 'Is not empty' },
  ],
  text: [
    { value: 'is_empty', label: 'Is empty' },
    { value: 'is_not_empty', label: 'Is not empty' },
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Does not equal' },
    { value: 'contains', label: 'Contains' },
  ],
  select: [
    { value: 'is_empty', label: 'Is empty' },
    { value: 'is_not_empty', label: 'Is not empty' },
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Does not equal' },
  ],
  date: [
    { value: 'is_empty', label: 'Is empty' },
    { value: 'is_not_empty', label: 'Is not empty' },
  ],
  datetime: [
    { value: 'is_empty', label: 'Is empty' },
    { value: 'is_not_empty', label: 'Is not empty' },
  ],
  time: [
    { value: 'is_empty', label: 'Is empty' },
    { value: 'is_not_empty', label: 'Is not empty' },
  ],
  array: [
    { value: 'is_empty', label: 'Is empty' },
    { value: 'is_not_empty', label: 'Is not empty' },
  ],
  number: [
    { value: 'is_empty', label: 'Is empty' },
    { value: 'is_not_empty', label: 'Is not empty' },
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Does not equal' },
    { value: 'greater_than', label: 'Greater than' },
    { value: 'less_than', label: 'Less than' },
  ],
}
