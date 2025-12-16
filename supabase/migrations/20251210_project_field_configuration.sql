-- =====================================================
-- FOX NETWORK: Project Field Configuration System
-- Allows clients to configure required/optional fields
-- and add custom fields stored in JSONB
-- =====================================================

-- ===================
-- PROJECT FIELD DEFINITIONS
-- Platform-level definition of all possible fields
-- ===================
CREATE TABLE IF NOT EXISTS project_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Field identification
  field_key VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'name', 'description', 'custom_field_1'
  field_label VARCHAR(255) NOT NULL,      -- Display label
  field_type VARCHAR(50) NOT NULL,        -- text, textarea, select, number, date, email, phone, url

  -- Field categorization
  category VARCHAR(100) DEFAULT 'general', -- general, timeline, financial, client, operational, custom
  display_order INT DEFAULT 0,

  -- Platform-level requirements
  is_system_field BOOLEAN DEFAULT false,  -- true = core field in projects table
  is_platform_required BOOLEAN DEFAULT false, -- true = mandatory for ALL clients (e.g., name, location_id)
  is_client_configurable BOOLEAN DEFAULT true, -- true = clients can change required status

  -- Field options (for select/radio fields)
  options JSONB DEFAULT '[]', -- [{"value": "deployment", "label": "Deployment"}, ...]

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
CREATE TABLE IF NOT EXISTS project_field_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  field_definition_id UUID NOT NULL REFERENCES project_field_definitions(id) ON DELETE CASCADE,

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
-- Client-specific custom fields (stored in projects.metadata)
-- ===================
CREATE TABLE IF NOT EXISTS project_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Field definition
  field_key VARCHAR(100) NOT NULL,        -- Key used in metadata JSONB
  field_label VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL,        -- text, textarea, select, number, date, checkbox

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
CREATE INDEX IF NOT EXISTS idx_project_field_definitions_category ON project_field_definitions(category);
CREATE INDEX IF NOT EXISTS idx_project_field_definitions_active ON project_field_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_project_field_configs_company ON project_field_configs(company_id);
CREATE INDEX IF NOT EXISTS idx_project_custom_fields_company ON project_custom_fields(company_id);

-- ===================
-- SEED DEFAULT FIELD DEFINITIONS
-- ===================
INSERT INTO project_field_definitions (field_key, field_label, field_type, category, display_order, is_system_field, is_platform_required, is_client_configurable, placeholder, help_text) VALUES
  -- Required system fields (cannot be made optional)
  ('name', 'Project Name', 'text', 'general', 1, true, true, false, 'e.g., Q1 Network Deployment', 'A unique name to identify this project'),
  ('location_id', 'Location', 'select', 'general', 2, true, true, false, NULL, 'The location this project belongs to'),
  ('contract_type', 'Contract Type', 'select', 'general', 3, true, true, false, NULL, 'Type of project contract'),

  -- Optional system fields (clients can make required)
  ('code', 'Project Code', 'text', 'general', 4, true, false, true, 'e.g., PRJ-2024-001', 'Internal reference code'),
  ('description', 'Description', 'textarea', 'general', 5, true, false, true, 'Describe the project scope and objectives...', 'Detailed project description'),
  ('status', 'Status', 'select', 'general', 6, true, false, true, NULL, 'Current project status'),
  ('priority', 'Priority', 'select', 'general', 7, true, false, true, NULL, 'Project priority level'),

  -- Contract/SLA fields
  ('billing_model', 'Billing Model', 'select', 'financial', 10, true, false, true, NULL, 'How this project is billed'),
  ('sla_tier', 'SLA Tier', 'select', 'operational', 11, true, false, true, NULL, 'Service level agreement tier'),

  -- Timeline fields
  ('start_date', 'Start Date', 'date', 'timeline', 20, true, false, true, NULL, 'When the project begins'),
  ('target_end_date', 'Target End Date', 'date', 'timeline', 21, true, false, true, NULL, 'Expected completion date'),
  ('actual_end_date', 'Actual End Date', 'date', 'timeline', 22, true, false, true, NULL, 'When the project actually completed'),

  -- Financial fields
  ('estimated_value', 'Estimated Value', 'number', 'financial', 30, true, false, true, '0.00', 'Project budget or value'),
  ('actual_value', 'Actual Value', 'number', 'financial', 31, true, false, true, '0.00', 'Actual project spend'),
  ('currency', 'Currency', 'select', 'financial', 32, true, false, true, NULL, 'Currency for financial values'),

  -- Client fields
  ('client_name', 'Client Name', 'text', 'client', 40, true, false, true, 'Acme Corporation', 'End client or customer name'),
  ('client_contact_name', 'Client Contact', 'text', 'client', 41, true, false, true, 'John Smith', 'Primary client contact person'),
  ('client_contact_email', 'Client Email', 'email', 'client', 42, true, false, true, 'contact@client.com', 'Client contact email'),
  ('client_contact_phone', 'Client Phone', 'phone', 'client', 43, true, false, true, '+33 1 23 45 67 89', 'Client contact phone'),

  -- Additional fields
  ('notes', 'Notes', 'textarea', 'operational', 50, true, false, true, 'Any additional information...', 'General project notes')

ON CONFLICT (field_key) DO NOTHING;

-- Add options for contract_type field
UPDATE project_field_definitions
SET options = '[
  {"value": "deployment", "label": "Deployment"},
  {"value": "maintenance", "label": "Maintenance"},
  {"value": "break-fix", "label": "Break-Fix"},
  {"value": "ad-hoc", "label": "Ad-Hoc"}
]'::jsonb
WHERE field_key = 'contract_type';

-- Add options for status field
UPDATE project_field_definitions
SET options = '[
  {"value": "draft", "label": "Draft"},
  {"value": "active", "label": "Active"},
  {"value": "on_hold", "label": "On Hold"},
  {"value": "completed", "label": "Completed"},
  {"value": "cancelled", "label": "Cancelled"}
]'::jsonb
WHERE field_key = 'status';

-- Add options for priority field
UPDATE project_field_definitions
SET options = '[
  {"value": "low", "label": "Low"},
  {"value": "medium", "label": "Medium"},
  {"value": "high", "label": "High"},
  {"value": "urgent", "label": "Urgent"}
]'::jsonb
WHERE field_key = 'priority';

-- Add options for billing_model field
UPDATE project_field_definitions
SET options = '[
  {"value": "fixed", "label": "Fixed Price"},
  {"value": "time_and_materials", "label": "Time & Materials"},
  {"value": "per_visit", "label": "Per Visit"},
  {"value": "per_action", "label": "Per Action"}
]'::jsonb
WHERE field_key = 'billing_model';

-- Add options for sla_tier field
UPDATE project_field_definitions
SET options = '[
  {"value": "standard", "label": "Standard"},
  {"value": "premium", "label": "Premium"},
  {"value": "critical", "label": "Critical"}
]'::jsonb
WHERE field_key = 'sla_tier';

-- Add options for currency field
UPDATE project_field_definitions
SET options = '[
  {"value": "EUR", "label": "EUR - Euro"},
  {"value": "USD", "label": "USD - US Dollar"},
  {"value": "GBP", "label": "GBP - British Pound"},
  {"value": "CHF", "label": "CHF - Swiss Franc"},
  {"value": "JPY", "label": "JPY - Japanese Yen"},
  {"value": "CAD", "label": "CAD - Canadian Dollar"},
  {"value": "AUD", "label": "AUD - Australian Dollar"}
]'::jsonb
WHERE field_key = 'currency';

-- ===================
-- RLS POLICIES
-- ===================
ALTER TABLE project_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_field_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_custom_fields ENABLE ROW LEVEL SECURITY;

-- Field definitions are readable by all authenticated users (platform-wide)
CREATE POLICY "Project field definitions are viewable by authenticated users"
  ON project_field_definitions FOR SELECT
  TO authenticated
  USING (true);

-- Field configs are company-scoped
CREATE POLICY "Users can view their company project field configs"
  ON project_field_configs FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage their company project field configs"
  ON project_field_configs FOR ALL
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Custom fields are company-scoped
CREATE POLICY "Users can view their company project custom fields"
  ON project_custom_fields FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage their company project custom fields"
  ON project_custom_fields FOR ALL
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
