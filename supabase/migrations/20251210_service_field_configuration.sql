-- =====================================================
-- FOX NETWORK: Service Field Configuration System
-- Allows clients to configure required/optional fields
-- and add custom fields stored in JSONB
-- =====================================================

-- ===================
-- SERVICE FIELD DEFINITIONS
-- Platform-level definition of all possible fields
-- ===================
CREATE TABLE IF NOT EXISTS service_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Field identification
  field_key VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'title', 'description', 'custom_field_1'
  field_label VARCHAR(255) NOT NULL,      -- Display label
  field_type VARCHAR(50) NOT NULL,        -- text, textarea, select, number, date, email, phone, url, time

  -- Field categorization
  category VARCHAR(100) DEFAULT 'general', -- general, scheduling, assignment, operational, custom
  display_order INT DEFAULT 0,

  -- Platform-level requirements
  is_system_field BOOLEAN DEFAULT false,  -- true = core field in services table
  is_platform_required BOOLEAN DEFAULT false, -- true = mandatory for ALL clients (e.g., project_id)
  is_client_configurable BOOLEAN DEFAULT true, -- true = clients can change required status

  -- Field options (for select/radio fields)
  options JSONB DEFAULT '[]', -- [{"value": "scheduled", "label": "Scheduled"}, ...]

  -- Validation
  validation_rules JSONB DEFAULT '{}', -- {"min_length": 2, "max_length": 100, "pattern": "^[a-z]+$"}
  placeholder TEXT,
  help_text TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================
-- CLIENT FIELD CONFIGURATIONS
-- Per-client customization of field requirements
-- ===================
CREATE TABLE IF NOT EXISTS service_field_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  field_definition_id UUID NOT NULL REFERENCES service_field_definitions(id) ON DELETE CASCADE,

  -- Client-level overrides
  is_required BOOLEAN DEFAULT false,      -- Client marks this as required
  is_visible BOOLEAN DEFAULT true,        -- Client can hide optional fields
  custom_label VARCHAR(255),              -- Client can override label
  custom_placeholder TEXT,
  custom_help_text TEXT,
  display_order INT,                      -- Client can reorder fields

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, field_definition_id)
);

-- ===================
-- CUSTOM FIELD DEFINITIONS
-- Client-specific custom fields (stored in services.metadata)
-- ===================
CREATE TABLE IF NOT EXISTS service_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Field definition
  field_key VARCHAR(100) NOT NULL,        -- Key used in metadata JSONB
  field_label VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL,        -- text, textarea, select, number, date, checkbox, time

  -- Configuration
  is_required BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  category VARCHAR(100) DEFAULT 'custom',

  -- Options for select fields
  options JSONB DEFAULT '[]',

  -- Validation
  validation_rules JSONB DEFAULT '{}',
  placeholder TEXT,
  help_text TEXT,
  default_value TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(company_id, field_key)
);

-- ===================
-- INDEXES
-- ===================
CREATE INDEX IF NOT EXISTS idx_service_field_definitions_category ON service_field_definitions(category);
CREATE INDEX IF NOT EXISTS idx_service_field_definitions_active ON service_field_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_service_field_configs_company ON service_field_configs(company_id);
CREATE INDEX IF NOT EXISTS idx_service_custom_fields_company ON service_custom_fields(company_id);

-- ===================
-- SEED DEFAULT FIELD DEFINITIONS
-- ===================
INSERT INTO service_field_definitions (field_key, field_label, field_type, category, display_order, is_system_field, is_platform_required, is_client_configurable, placeholder, help_text) VALUES
  -- Required system fields (cannot be made optional)
  ('project_id', 'Project', 'select', 'general', 1, true, true, false, NULL, 'The project this service belongs to'),

  -- Optional system fields (clients can make required)
  ('title', 'Service Title', 'text', 'general', 2, true, false, true, 'e.g., Installation Service', 'A descriptive title for this service'),
  ('description', 'Description', 'textarea', 'general', 3, true, false, true, 'Describe the service work...', 'Detailed description of the service'),
  ('reference_number', 'Reference Number', 'text', 'general', 4, true, false, true, 'e.g., SVC-2024-001', 'External or internal reference number'),

  -- Scheduling fields
  ('urgency', 'Urgency', 'select', 'scheduling', 10, true, false, true, NULL, 'How urgent is this service'),
  ('scheduled_date', 'Scheduled Date', 'date', 'scheduling', 11, true, false, true, NULL, 'When the service is scheduled'),
  ('scheduled_start_time', 'Start Time', 'time', 'scheduling', 12, true, false, true, NULL, 'Service start time'),
  ('scheduled_end_time', 'End Time', 'time', 'scheduling', 13, true, false, true, NULL, 'Expected end time'),
  ('status', 'Status', 'select', 'scheduling', 14, true, false, true, NULL, 'Current status of the service'),

  -- Assignment fields
  ('primary_technician_id', 'Primary Technician', 'select', 'assignment', 20, true, false, true, NULL, 'Main technician assigned'),
  ('assigned_technicians', 'Assigned Team', 'select', 'assignment', 21, true, false, true, NULL, 'All technicians assigned to this service'),

  -- Operational fields
  ('notes', 'Notes', 'textarea', 'operational', 30, true, false, true, 'Any additional notes...', 'Internal notes about this service'),
  ('access_instructions', 'Access Instructions', 'textarea', 'operational', 31, true, false, true, 'How to access the site...', 'Instructions for accessing the service location'),
  ('special_requirements', 'Special Requirements', 'textarea', 'operational', 32, true, false, true, 'Equipment, tools, safety...', 'Any special requirements or considerations')

ON CONFLICT (field_key) DO NOTHING;

-- Add options for urgency field
UPDATE service_field_definitions
SET options = '[
  {"value": "scheduled", "label": "Scheduled"},
  {"value": "same_day", "label": "Same Day"},
  {"value": "emergency", "label": "Emergency"}
]'::jsonb
WHERE field_key = 'urgency';

-- Add options for status field
UPDATE service_field_definitions
SET options = '[
  {"value": "scheduled", "label": "Scheduled"},
  {"value": "in_progress", "label": "In Progress"},
  {"value": "pending_approval", "label": "Pending Approval"},
  {"value": "completed", "label": "Completed"},
  {"value": "on_hold", "label": "On Hold"},
  {"value": "cancelled", "label": "Cancelled"}
]'::jsonb
WHERE field_key = 'status';

-- ===================
-- RLS POLICIES
-- ===================
ALTER TABLE service_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_field_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_custom_fields ENABLE ROW LEVEL SECURITY;

-- Field definitions are readable by all authenticated users (platform-wide)
DROP POLICY IF EXISTS "Service field definitions are viewable by authenticated users" ON service_field_definitions;
CREATE POLICY "Service field definitions are viewable by authenticated users"
  ON service_field_definitions FOR SELECT
  TO authenticated
  USING (true);

-- Field configs are company-scoped
DROP POLICY IF EXISTS "Users can view their company service field configs" ON service_field_configs;
CREATE POLICY "Users can view their company service field configs"
  ON service_field_configs FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage their company service field configs" ON service_field_configs;
CREATE POLICY "Users can manage their company service field configs"
  ON service_field_configs FOR ALL
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Custom fields are company-scoped
DROP POLICY IF EXISTS "Users can view their company service custom fields" ON service_custom_fields;
CREATE POLICY "Users can view their company service custom fields"
  ON service_custom_fields FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage their company service custom fields" ON service_custom_fields;
CREATE POLICY "Users can manage their company service custom fields"
  ON service_custom_fields FOR ALL
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
