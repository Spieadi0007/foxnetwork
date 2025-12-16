-- =====================================================
-- FOX NETWORK: Service Enhancements
-- Auto-generated Service ID, Travel Tracking, Parts, Signatures
-- Format: SVC_{TYPE}_{COUNTRY}_{DDMMYY}_{SEQUENCE}
-- Example: SVC_DEP_FR_151224_001
-- =====================================================

-- ===================
-- SEQUENCE TRACKING TABLE
-- Tracks the next sequence number per company for services
-- ===================
CREATE TABLE IF NOT EXISTS service_id_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  next_sequence INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One sequence per company
  UNIQUE(company_id)
);

-- ===================
-- ADD NEW COLUMNS TO SERVICES TABLE
-- ===================

-- Service ID (auto-generated)
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_id VARCHAR(50);

-- Create unique index for service_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_services_service_id
  ON services(service_id) WHERE service_id IS NOT NULL;

-- Travel Tracking
ALTER TABLE services ADD COLUMN IF NOT EXISTS departure_time TIMESTAMPTZ;
ALTER TABLE services ADD COLUMN IF NOT EXISTS arrival_time TIMESTAMPTZ;
ALTER TABLE services ADD COLUMN IF NOT EXISTS travel_duration INT; -- minutes

-- Parts/Materials Used (JSONB array)
-- Structure: [{"name": "Cable Cat6", "quantity": 2, "cost": 25.00, "part_code": "CAB-001"}]
ALTER TABLE services ADD COLUMN IF NOT EXISTS parts_used JSONB DEFAULT '[]';

-- Signatures
ALTER TABLE services ADD COLUMN IF NOT EXISTS customer_signature TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS technician_signature TEXT;

-- Service Type (from library - child of project type)
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_type VARCHAR(100);
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_type_id UUID REFERENCES library_items(id) ON DELETE SET NULL;

-- ===================
-- HELPER FUNCTION: Generate Service ID
-- Uses project type from the linked project
-- ===================
CREATE OR REPLACE FUNCTION generate_service_id(
  p_company_id UUID,
  p_project_type TEXT,
  p_project_type_code TEXT,
  p_country_code TEXT,
  p_country_name TEXT,
  p_date DATE DEFAULT CURRENT_DATE
) RETURNS TEXT AS $$
DECLARE
  v_type_code TEXT;
  v_country_part TEXT;
  v_date_part TEXT;
  v_sequence INT;
  v_service_id TEXT;
BEGIN
  -- Get type code from provided code, or generate from name
  IF p_project_type_code IS NOT NULL AND p_project_type_code != '' THEN
    v_type_code := UPPER(SUBSTRING(REGEXP_REPLACE(p_project_type_code, '[^a-zA-Z0-9]', '', 'g'), 1, 3));
  ELSIF p_project_type IS NOT NULL AND p_project_type != '' THEN
    v_type_code := UPPER(SUBSTRING(REGEXP_REPLACE(p_project_type, '[^a-zA-Z0-9]', '', 'g'), 1, 3));
  ELSE
    v_type_code := 'SVC';
  END IF;

  -- Ensure type code is exactly 3 characters
  IF LENGTH(v_type_code) < 3 THEN
    v_type_code := RPAD(v_type_code, 3, 'X');
  END IF;

  -- Get country code (use code if available, otherwise first 2 chars of name uppercase)
  IF p_country_code IS NOT NULL AND p_country_code != '' THEN
    v_country_part := UPPER(SUBSTRING(REGEXP_REPLACE(p_country_code, '[^a-zA-Z]', '', 'g'), 1, 2));
  ELSIF p_country_name IS NOT NULL AND p_country_name != '' THEN
    v_country_part := UPPER(SUBSTRING(REGEXP_REPLACE(p_country_name, '[^a-zA-Z]', '', 'g'), 1, 2));
  ELSE
    v_country_part := 'XX';
  END IF;

  -- Ensure country code is exactly 2 characters
  IF LENGTH(v_country_part) < 2 THEN
    v_country_part := RPAD(v_country_part, 2, 'X');
  END IF;

  -- Format date as DDMMYY
  v_date_part := TO_CHAR(p_date, 'DDMMYY');

  -- Get and increment sequence (global per company for services)
  INSERT INTO service_id_sequences (company_id, next_sequence)
  VALUES (p_company_id, 2)
  ON CONFLICT (company_id) DO UPDATE
  SET next_sequence = service_id_sequences.next_sequence + 1,
      updated_at = NOW()
  RETURNING
    CASE
      WHEN xmax = 0 THEN 1  -- Insert happened, use 1
      ELSE next_sequence - 1  -- Update happened, use previous value
    END INTO v_sequence;

  -- Build service ID: SVC_TYPE_COUNTRY_DDMMYY_001
  v_service_id := 'SVC_' || v_type_code || '_' || v_country_part || '_' || v_date_part || '_' || LPAD(v_sequence::TEXT, 3, '0');

  RETURN v_service_id;
END;
$$ LANGUAGE plpgsql;

-- ===================
-- RLS POLICIES FOR SEQUENCE TABLE
-- ===================
ALTER TABLE service_id_sequences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their company service sequences" ON service_id_sequences;
DROP POLICY IF EXISTS "Users can insert their company service sequences" ON service_id_sequences;
DROP POLICY IF EXISTS "Users can update their company service sequences" ON service_id_sequences;

CREATE POLICY "Users can view their company service sequences"
  ON service_id_sequences FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their company service sequences"
  ON service_id_sequences FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their company service sequences"
  ON service_id_sequences FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- ===================
-- GRANT EXECUTE ON FUNCTIONS
-- ===================
GRANT EXECUTE ON FUNCTION generate_service_id(UUID, TEXT, TEXT, TEXT, TEXT, DATE) TO authenticated;

-- ===================
-- MAKE PROJECT_ID REQUIRED IN FIELD DEFINITIONS
-- ===================
UPDATE service_field_definitions
SET is_platform_required = true
WHERE field_key = 'project_id';

-- ===================
-- ADD SERVICE_ID TO FIELD DEFINITIONS
-- ===================
INSERT INTO service_field_definitions (
  field_key,
  field_label,
  field_type,
  category,
  display_order,
  is_system_field,
  is_platform_required,
  is_client_configurable,
  placeholder,
  help_text
) VALUES (
  'service_id',
  'Service ID',
  'text',
  'general',
  0,  -- Display first
  true,  -- Is a system field
  false, -- Not required to fill (auto-generated)
  false, -- Clients cannot change requirement status
  NULL,
  'Auto-generated unique identifier (e.g., SVC_DEP_FR_151224_001)'
)
ON CONFLICT (field_key) DO UPDATE SET
  field_label = EXCLUDED.field_label,
  help_text = EXCLUDED.help_text,
  display_order = EXCLUDED.display_order;

-- ===================
-- ADD NEW FIELD DEFINITIONS
-- ===================

-- Travel Tracking Fields
INSERT INTO service_field_definitions (
  field_key, field_label, field_type, category, display_order,
  is_system_field, is_platform_required, is_client_configurable,
  placeholder, help_text
) VALUES
  ('departure_time', 'Departure Time', 'time', 'scheduling', 18,
   true, false, true, NULL, 'When technician departed for the service'),
  ('arrival_time', 'Arrival Time', 'time', 'scheduling', 19,
   true, false, true, NULL, 'When technician arrived at location'),
  ('travel_duration', 'Travel Duration (min)', 'number', 'scheduling', 20,
   true, false, true, NULL, 'Total travel time in minutes')
ON CONFLICT (field_key) DO UPDATE SET
  field_label = EXCLUDED.field_label,
  help_text = EXCLUDED.help_text;

-- Parts/Materials Field
INSERT INTO service_field_definitions (
  field_key, field_label, field_type, category, display_order,
  is_system_field, is_platform_required, is_client_configurable,
  placeholder, help_text
) VALUES (
  'parts_used', 'Parts Used', 'textarea', 'operational', 35,
  true, false, true, NULL, 'Materials and parts used during service'
)
ON CONFLICT (field_key) DO UPDATE SET
  field_label = EXCLUDED.field_label,
  help_text = EXCLUDED.help_text;

-- Signature Fields
INSERT INTO service_field_definitions (
  field_key, field_label, field_type, category, display_order,
  is_system_field, is_platform_required, is_client_configurable,
  placeholder, help_text
) VALUES
  ('customer_signature', 'Customer Signature', 'text', 'operational', 40,
   true, false, true, NULL, 'Customer sign-off confirmation'),
  ('technician_signature', 'Technician Signature', 'text', 'operational', 41,
   true, false, true, NULL, 'Technician sign-off confirmation')
ON CONFLICT (field_key) DO UPDATE SET
  field_label = EXCLUDED.field_label,
  help_text = EXCLUDED.help_text;

-- Service Type Field (from library - child of project type)
INSERT INTO service_field_definitions (
  field_key, field_label, field_type, category, display_order,
  is_system_field, is_platform_required, is_client_configurable,
  placeholder, help_text
) VALUES (
  'service_type_id', 'Service Type', 'select', 'general', 2,
  true, false, true, NULL, 'Type of service (from library, based on project type)'
)
ON CONFLICT (field_key) DO UPDATE SET
  field_label = EXCLUDED.field_label,
  help_text = EXCLUDED.help_text,
  display_order = EXCLUDED.display_order;

-- ===================
-- DEACTIVATE LOCATION_ID FROM VISIBLE FIELDS
-- (Location is auto-derived from project)
-- ===================
UPDATE service_field_definitions
SET
  is_platform_required = false,
  is_client_configurable = false,
  help_text = 'Auto-derived from selected project'
WHERE field_key = 'location_id';

-- ===================
-- WORKFLOW STEPS AND STATUSES
-- ===================

-- Add workflow_steps library category
INSERT INTO library_categories (slug, name, description, icon, is_system, is_active, display_order, supports_nesting, child_label)
VALUES (
  'workflow_steps',
  'Workflow Steps',
  'Service workflow stages (e.g., New, In Progress, Done)',
  'GitBranch',
  true,
  true,
  20,
  false,
  NULL
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Add step_statuses library category
INSERT INTO library_categories (slug, name, description, icon, is_system, is_active, display_order, supports_nesting, child_label)
VALUES (
  'step_statuses',
  'Step Statuses',
  'Status within a workflow step (e.g., On Track, Delayed, Blocked)',
  'Activity',
  true,
  true,
  21,
  false,
  NULL
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Add step and step_status columns to services
ALTER TABLE services ADD COLUMN IF NOT EXISTS step VARCHAR(100);
ALTER TABLE services ADD COLUMN IF NOT EXISTS step_id UUID REFERENCES library_items(id) ON DELETE SET NULL;
ALTER TABLE services ADD COLUMN IF NOT EXISTS step_status VARCHAR(100);
ALTER TABLE services ADD COLUMN IF NOT EXISTS step_status_id UUID REFERENCES library_items(id) ON DELETE SET NULL;

-- Add field definitions for step and step_status
INSERT INTO service_field_definitions (
  field_key, field_label, field_type, category, display_order,
  is_system_field, is_platform_required, is_client_configurable,
  placeholder, help_text
) VALUES
  ('step_id', 'Workflow Step', 'select', 'operational', 5,
   true, false, true, NULL, 'Current workflow stage of the service'),
  ('step_status_id', 'Step Status', 'select', 'operational', 6,
   true, false, true, NULL, 'Status within the current workflow step')
ON CONFLICT (field_key) DO UPDATE SET
  field_label = EXCLUDED.field_label,
  help_text = EXCLUDED.help_text,
  display_order = EXCLUDED.display_order;

-- ===================
-- COMMENTS
-- ===================
COMMENT ON TABLE service_id_sequences IS 'Tracks auto-increment sequence for service IDs per company';
COMMENT ON FUNCTION generate_service_id(UUID, TEXT, TEXT, TEXT, TEXT, DATE) IS 'Generates service ID in format SVC_TYPE_COUNTRY_DDMMYY_SEQ (e.g., SVC_DEP_FR_151224_001)';
