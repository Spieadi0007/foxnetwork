-- =====================================================
-- FOX NETWORK: Location Field Configuration System
-- Allows clients to configure required/optional fields
-- and add custom fields stored in JSONB
-- =====================================================

-- ===================
-- LOCATION FIELD DEFINITIONS
-- Platform-level definition of all possible fields
-- ===================
CREATE TABLE IF NOT EXISTS location_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Field identification
  field_key VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'name', 'address_line1', 'custom_field_1'
  field_label VARCHAR(255) NOT NULL,      -- Display label
  field_type VARCHAR(50) NOT NULL,        -- text, textarea, select, number, date, email, phone, url

  -- Field categorization
  category VARCHAR(100) DEFAULT 'general', -- general, address, contact, operational, custom
  display_order INT DEFAULT 0,

  -- Platform-level requirements
  is_system_field BOOLEAN DEFAULT false,  -- true = core field in locations table
  is_platform_required BOOLEAN DEFAULT false, -- true = mandatory for ALL clients (e.g., name)
  is_client_configurable BOOLEAN DEFAULT true, -- true = clients can change required status

  -- Field options (for select/radio fields)
  options JSONB DEFAULT '[]', -- [{"value": "store", "label": "Store"}, ...]

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
CREATE TABLE IF NOT EXISTS location_field_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  field_definition_id UUID NOT NULL REFERENCES location_field_definitions(id) ON DELETE CASCADE,

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
-- Client-specific custom fields (stored in locations.metadata)
-- ===================
CREATE TABLE IF NOT EXISTS location_custom_fields (
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

-- Add metadata column to locations if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE locations ADD COLUMN metadata JSONB DEFAULT '{}';
  END IF;
END $$;

-- Add client column to locations if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'locations' AND column_name = 'client'
  ) THEN
    ALTER TABLE locations ADD COLUMN client VARCHAR(255);
  END IF;
END $$;

-- ===================
-- INDEXES
-- ===================
CREATE INDEX IF NOT EXISTS idx_location_field_definitions_category ON location_field_definitions(category);
CREATE INDEX IF NOT EXISTS idx_location_field_definitions_active ON location_field_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_location_field_configs_company ON location_field_configs(company_id);
CREATE INDEX IF NOT EXISTS idx_location_custom_fields_company ON location_custom_fields(company_id);

-- ===================
-- SEED DEFAULT FIELD DEFINITIONS
-- ===================
INSERT INTO location_field_definitions (field_key, field_label, field_type, category, display_order, is_system_field, is_platform_required, is_client_configurable, placeholder, help_text) VALUES
  -- Required system fields (cannot be made optional)
  ('name', 'Location Name', 'text', 'general', 1, true, true, false, 'e.g., Paris Main Office', 'A unique name to identify this location'),
  ('client', 'Client', 'select', 'general', 2, true, true, false, NULL, 'The client or company this location belongs to'),
  ('country', 'Country', 'select', 'general', 3, true, true, false, NULL, 'Select the country for this location'),
  ('type', 'Location Type', 'select', 'general', 4, true, true, false, NULL, 'The type of location'),

  -- Auto-generated fields (hidden from forms, system-managed)
  ('code', 'Location Code', 'text', 'general', 5, true, false, false, NULL, 'Auto-generated based on client and country'),
  ('address_line1', 'Street Address', 'text', 'address', 10, true, false, true, '123 Rue de Paris', 'Primary street address'),
  ('address_line2', 'Address Line 2', 'text', 'address', 11, true, false, true, 'Suite, Floor, Building', 'Additional address details'),
  ('city', 'City', 'text', 'address', 12, true, false, true, 'Paris', NULL),
  ('state', 'State/Region', 'text', 'address', 13, true, false, true, 'Ile-de-France', NULL),
  ('postal_code', 'Postal Code', 'text', 'address', 14, true, false, true, '75001', NULL),
  ('latitude', 'Latitude', 'number', 'address', 15, true, false, true, '48.8566', 'GPS coordinate'),
  ('longitude', 'Longitude', 'number', 'address', 16, true, false, true, '2.3522', 'GPS coordinate'),

  -- Contact fields
  ('contact_name', 'Contact Name', 'text', 'contact', 20, true, false, true, 'Jean Dupont', 'Primary site contact'),
  ('contact_email', 'Contact Email', 'email', 'contact', 21, true, false, true, 'contact@example.com', NULL),
  ('contact_phone', 'Contact Phone', 'phone', 'contact', 22, true, false, true, '+33 1 23 45 67 89', NULL),

  -- Operational fields
  ('timezone', 'Timezone', 'select', 'operational', 30, true, false, true, NULL, 'Location timezone for scheduling'),
  ('operating_hours', 'Operating Hours', 'text', 'operational', 31, true, false, true, 'Mon-Fri 9:00-18:00', 'When the location is accessible'),
  ('access_instructions', 'Access Instructions', 'textarea', 'operational', 32, true, false, true, 'Ring bell, ask for security...', 'How to access the location'),
  ('notes', 'Notes', 'textarea', 'operational', 33, true, false, true, 'Any additional information...', 'General notes about this location')

ON CONFLICT (field_key) DO NOTHING;

-- Make country field platform required (update if already exists)
UPDATE location_field_definitions
SET
  is_platform_required = true,
  is_client_configurable = false,
  category = 'general',
  display_order = 3,
  field_type = 'select',
  help_text = 'Select the country for this location'
WHERE field_key = 'country';

-- Make code field auto-generated and hidden (update if already exists)
UPDATE location_field_definitions
SET
  is_platform_required = false,
  is_client_configurable = false,
  placeholder = NULL,
  help_text = 'Auto-generated based on client and country'
WHERE field_key = 'code';

-- Add options for type field
UPDATE location_field_definitions
SET options = '[
  {"value": "site", "label": "Site"},
  {"value": "office", "label": "Office"},
  {"value": "warehouse", "label": "Warehouse"},
  {"value": "store", "label": "Store"},
  {"value": "data_center", "label": "Data Center"},
  {"value": "branch", "label": "Branch"},
  {"value": "other", "label": "Other"}
]'::jsonb
WHERE field_key = 'type';

-- Add timezone options
UPDATE location_field_definitions
SET options = '[
  {"value": "Europe/Paris", "label": "Europe/Paris (CET)"},
  {"value": "Europe/London", "label": "Europe/London (GMT)"},
  {"value": "America/New_York", "label": "America/New_York (EST)"},
  {"value": "America/Los_Angeles", "label": "America/Los_Angeles (PST)"},
  {"value": "Asia/Tokyo", "label": "Asia/Tokyo (JST)"},
  {"value": "Asia/Singapore", "label": "Asia/Singapore (SGT)"},
  {"value": "Australia/Sydney", "label": "Australia/Sydney (AEST)"}
]'::jsonb
WHERE field_key = 'timezone';

-- ===================
-- RLS POLICIES
-- ===================
ALTER TABLE location_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_field_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_custom_fields ENABLE ROW LEVEL SECURITY;

-- Field definitions are readable by all authenticated users (platform-wide)
DROP POLICY IF EXISTS "Field definitions are viewable by authenticated users" ON location_field_definitions;
CREATE POLICY "Field definitions are viewable by authenticated users"
  ON location_field_definitions FOR SELECT
  TO authenticated
  USING (true);

-- Field configs are company-scoped
DROP POLICY IF EXISTS "Users can view their company field configs" ON location_field_configs;
CREATE POLICY "Users can view their company field configs"
  ON location_field_configs FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage their company field configs" ON location_field_configs;
CREATE POLICY "Users can manage their company field configs"
  ON location_field_configs FOR ALL
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Custom fields are company-scoped
DROP POLICY IF EXISTS "Users can view their company custom fields" ON location_custom_fields;
CREATE POLICY "Users can view their company custom fields"
  ON location_custom_fields FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can manage their company custom fields" ON location_custom_fields;
CREATE POLICY "Users can manage their company custom fields"
  ON location_custom_fields FOR ALL
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
