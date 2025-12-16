-- =====================================================
-- FOX NETWORK: Project ID System
-- Auto-generated unique identifier for projects
-- Format: {TYPE}_{COUNTRY}_{DDMMYY}_{SEQUENCE}
-- Example: DEP_FR_151224_001
-- =====================================================

-- ===================
-- SEQUENCE TRACKING TABLE
-- Tracks the next sequence number per company (global)
-- ===================
CREATE TABLE IF NOT EXISTS project_id_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  next_sequence INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One sequence per company
  UNIQUE(company_id)
);

-- ===================
-- ADD PROJECT_ID TO PROJECTS TABLE
-- ===================
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_id VARCHAR(50);

-- Create unique index for project_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_project_id
  ON projects(project_id) WHERE project_id IS NOT NULL;

-- ===================
-- HELPER FUNCTION: Generate Project ID
-- Uses dynamic project types from library
-- ===================
CREATE OR REPLACE FUNCTION generate_project_id(
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
  v_project_id TEXT;
BEGIN
  -- Get type code from provided code, or generate from name
  IF p_project_type_code IS NOT NULL AND p_project_type_code != '' THEN
    v_type_code := UPPER(SUBSTRING(REGEXP_REPLACE(p_project_type_code, '[^a-zA-Z0-9]', '', 'g'), 1, 3));
  ELSIF p_project_type IS NOT NULL AND p_project_type != '' THEN
    v_type_code := UPPER(SUBSTRING(REGEXP_REPLACE(p_project_type, '[^a-zA-Z0-9]', '', 'g'), 1, 3));
  ELSE
    v_type_code := 'PRJ';
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

  -- Get and increment sequence (global per company)
  INSERT INTO project_id_sequences (company_id, next_sequence)
  VALUES (p_company_id, 2)
  ON CONFLICT (company_id) DO UPDATE
  SET next_sequence = project_id_sequences.next_sequence + 1,
      updated_at = NOW()
  RETURNING
    CASE
      WHEN xmax = 0 THEN 1  -- Insert happened, use 1
      ELSE next_sequence - 1  -- Update happened, use previous value
    END INTO v_sequence;

  -- Build project ID: TYPE_COUNTRY_DDMMYY_001
  v_project_id := v_type_code || '_' || v_country_part || '_' || v_date_part || '_' || LPAD(v_sequence::TEXT, 3, '0');

  RETURN v_project_id;
END;
$$ LANGUAGE plpgsql;

-- ===================
-- RLS POLICIES
-- ===================
ALTER TABLE project_id_sequences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their company project sequences" ON project_id_sequences;
DROP POLICY IF EXISTS "Users can insert their company project sequences" ON project_id_sequences;
DROP POLICY IF EXISTS "Users can update their company project sequences" ON project_id_sequences;

CREATE POLICY "Users can view their company project sequences"
  ON project_id_sequences FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their company project sequences"
  ON project_id_sequences FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their company project sequences"
  ON project_id_sequences FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- ===================
-- GRANT EXECUTE ON FUNCTIONS
-- ===================
GRANT EXECUTE ON FUNCTION generate_project_id(UUID, TEXT, TEXT, TEXT, TEXT, DATE) TO authenticated;

-- ===================
-- ADD PROJECT_ID TO FIELD DEFINITIONS
-- ===================
INSERT INTO project_field_definitions (
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
  'project_id',
  'Project ID',
  'text',
  'general',
  0,  -- Display first
  true,  -- Is a system field (in projects table)
  false, -- Not required to fill (auto-generated)
  false, -- Clients cannot change requirement status
  NULL,
  'Auto-generated unique identifier (e.g., DEP_FR_151224_001)'
)
ON CONFLICT (field_key) DO UPDATE SET
  field_label = EXCLUDED.field_label,
  help_text = EXCLUDED.help_text,
  display_order = EXCLUDED.display_order;

-- ===================
-- UPDATE NAME FIELD TO BE AUTO-GENERATED (uses project_id)
-- ===================
UPDATE project_field_definitions
SET
  is_platform_required = false,
  is_client_configurable = false,
  help_text = 'Auto-generated from Project ID'
WHERE field_key = 'name';

-- ===================
-- REMOVE CODE FIELD (project_id replaces it)
-- ===================
-- Deactivate in field definitions (no is_visible column, use is_active)
UPDATE project_field_definitions
SET
  is_client_configurable = false,
  is_active = false,
  help_text = 'Replaced by auto-generated Project ID'
WHERE field_key = 'code';

-- Drop the code column from projects table (no existing data)
ALTER TABLE projects DROP COLUMN IF EXISTS code;

-- ===================
-- RENAME contract_type TO project_type
-- ===================
-- Rename column (if it exists as contract_type)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'contract_type'
  ) THEN
    ALTER TABLE projects RENAME COLUMN contract_type TO project_type;
  END IF;
END $$;

-- Add project_type_id to reference library items
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type_id UUID REFERENCES library_items(id);

-- Update field definitions: rename contract_type to project_type
UPDATE project_field_definitions
SET
  field_key = 'project_type',
  field_label = 'Project Type',
  help_text = 'Select from your library project types'
WHERE field_key = 'contract_type';

-- ===================
-- REMOVE CLIENT FIELDS FROM PROJECTS
-- Client info belongs at Location level, not Project level
-- ===================
ALTER TABLE projects DROP COLUMN IF EXISTS client_name;
ALTER TABLE projects DROP COLUMN IF EXISTS client_contact_name;
ALTER TABLE projects DROP COLUMN IF EXISTS client_contact_email;
ALTER TABLE projects DROP COLUMN IF EXISTS client_contact_phone;

-- Deactivate client fields in project field definitions
UPDATE project_field_definitions
SET is_active = false, help_text = 'Moved to Location level'
WHERE field_key IN ('client_name', 'client_contact_name', 'client_contact_email', 'client_contact_phone');

-- ===================
-- COMMENTS
-- ===================
COMMENT ON TABLE project_id_sequences IS 'Tracks auto-increment sequence for project IDs per company';
COMMENT ON FUNCTION generate_project_id(UUID, TEXT, TEXT, TEXT, TEXT, DATE) IS 'Generates project ID in format TYPE_COUNTRY_DDMMYY_SEQ (e.g., DEP_FR_151224_001)';
