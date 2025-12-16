-- =====================================================
-- FOX NETWORK: Action Modules Configuration
-- Configurable modules for field technician actions
-- Example: Start Time, End Time, Parts Used, Signatures, Photos
-- =====================================================

-- ===================
-- ACTION MODULES DEFINITION TABLE
-- Platform-level module definitions (what modules are available)
-- ===================
CREATE TABLE IF NOT EXISTS action_module_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Module identification
  key VARCHAR(50) NOT NULL UNIQUE,  -- e.g., 'start_time', 'end_time', 'parts_used'
  name VARCHAR(100) NOT NULL,        -- Display name
  description TEXT,
  icon VARCHAR(50),                  -- Icon name for UI

  -- Module category
  category VARCHAR(50) DEFAULT 'general',  -- general, time, materials, verification, media

  -- Field configuration
  field_type VARCHAR(50) NOT NULL,   -- datetime, array, signature, photo, text, number
  field_config JSONB DEFAULT '{}',   -- Additional field configuration

  -- Module settings
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================
-- COMPANY ACTION MODULE CONFIG TABLE
-- Per-company module enablement and customization
-- ===================
CREATE TABLE IF NOT EXISTS action_module_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES action_module_definitions(id) ON DELETE CASCADE,

  -- Enablement
  is_enabled BOOLEAN DEFAULT false,
  is_required BOOLEAN DEFAULT false,

  -- Customization
  custom_label VARCHAR(100),         -- Override module name
  custom_description TEXT,           -- Override description
  display_order INT,                 -- Custom order for this company

  -- Validation rules
  validation_rules JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique per company-module
  UNIQUE(company_id, module_id)
);

-- ===================
-- INDEXES
-- ===================
CREATE INDEX IF NOT EXISTS idx_action_module_configs_company ON action_module_configs(company_id);
CREATE INDEX IF NOT EXISTS idx_action_module_configs_enabled ON action_module_configs(is_enabled);
CREATE INDEX IF NOT EXISTS idx_action_module_definitions_key ON action_module_definitions(key);
CREATE INDEX IF NOT EXISTS idx_action_module_definitions_active ON action_module_definitions(is_active);

-- ===================
-- RLS POLICIES
-- ===================
ALTER TABLE action_module_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_module_configs ENABLE ROW LEVEL SECURITY;

-- Module definitions are readable by all authenticated users
DROP POLICY IF EXISTS "Anyone can view action module definitions" ON action_module_definitions;
CREATE POLICY "Anyone can view action module definitions"
  ON action_module_definitions FOR SELECT
  TO authenticated
  USING (true);

-- Company configs
DROP POLICY IF EXISTS "Users can view their company action module configs" ON action_module_configs;
CREATE POLICY "Users can view their company action module configs"
  ON action_module_configs FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert their company action module configs" ON action_module_configs;
CREATE POLICY "Users can insert their company action module configs"
  ON action_module_configs FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their company action module configs" ON action_module_configs;
CREATE POLICY "Users can update their company action module configs"
  ON action_module_configs FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their company action module configs" ON action_module_configs;
CREATE POLICY "Users can delete their company action module configs"
  ON action_module_configs FOR DELETE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- ===================
-- SEED DEFAULT MODULES
-- ===================
INSERT INTO action_module_definitions (key, name, description, icon, category, field_type, field_config, display_order) VALUES
  ('start_time', 'Start Time', 'When the technician started working on this service', 'Play', 'time', 'datetime', '{"defaultToNow": true}', 1),
  ('end_time', 'End Time', 'When the technician finished working on this service', 'Square', 'time', 'datetime', '{"defaultToNow": true}', 2),
  ('parts_used', 'Parts Used', 'Materials and parts consumed during the service', 'Package', 'materials', 'array', '{"itemSchema": {"name": "string", "quantity": "number", "partCode": "string", "cost": "number"}}', 3),
  ('customer_signature', 'Customer Signature', 'Digital signature from the customer', 'PenTool', 'verification', 'signature', '{}', 4),
  ('technician_signature', 'Technician Signature', 'Digital signature from the technician', 'Edit3', 'verification', 'signature', '{}', 5),
  ('photos', 'Photos', 'Photos taken during the service (before/after)', 'Camera', 'media', 'photo_array', '{"maxPhotos": 10, "allowCamera": true, "allowGallery": true}', 6),
  ('notes', 'Notes', 'Additional notes about the service', 'FileText', 'general', 'textarea', '{"maxLength": 2000}', 7),
  ('checklist', 'Checklist', 'Checklist of items to verify', 'CheckSquare', 'verification', 'checklist', '{"items": []}', 8),
  ('travel_time', 'Travel Time', 'Time spent traveling to the location', 'Navigation', 'time', 'duration', '{"unit": "minutes"}', 9),
  ('work_duration', 'Work Duration', 'Calculated duration of work (end - start)', 'Clock', 'time', 'calculated', '{"formula": "end_time - start_time"}', 10)
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  field_type = EXCLUDED.field_type,
  field_config = EXCLUDED.field_config,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- ===================
-- COMMENTS
-- ===================
COMMENT ON TABLE action_module_definitions IS 'Platform-level definitions of available action modules';
COMMENT ON TABLE action_module_configs IS 'Per-company configuration of which modules are enabled';
