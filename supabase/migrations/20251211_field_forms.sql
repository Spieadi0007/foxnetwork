-- =====================================================
-- FOX NETWORK: Field Forms System
-- Form templates that technicians fill out for services
-- e.g., Site Survey Checklist, Installation Report, etc.
-- =====================================================

-- ===================
-- FIELD FORMS (Templates)
-- Reusable form templates - just the structure, no service linkage
-- ===================
CREATE TABLE IF NOT EXISTS field_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Form identification
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  -- Unique form name per company
  UNIQUE(company_id, name)
);

-- ===================
-- SERVICE FORMS (Junction table)
-- Links forms to services with configuration
-- ===================
CREATE TABLE IF NOT EXISTS service_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Links
  service_id UUID NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES field_forms(id) ON DELETE CASCADE,

  -- Configuration for this form in this service
  is_required BOOLEAN DEFAULT false,        -- Must be completed for this service
  allow_multiple BOOLEAN DEFAULT false,     -- Can submit multiple times per job
  display_order INT DEFAULT 0,              -- Order in which forms appear

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Each form can only be attached once per service
  UNIQUE(service_id, form_id)
);

-- ===================
-- FIELD FORM FIELDS
-- ===================
CREATE TABLE IF NOT EXISTS field_form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES field_forms(id) ON DELETE CASCADE,

  -- Field identification
  field_key VARCHAR(100) NOT NULL,          -- Unique key within form
  label VARCHAR(255) NOT NULL,              -- Display label

  -- Field type
  field_type VARCHAR(50) NOT NULL,          -- text, textarea, number, date, photo, signature, checkbox, select, rating, etc.

  -- Configuration
  is_required BOOLEAN DEFAULT false,
  placeholder TEXT,
  help_text TEXT,

  -- Options (for select, radio, checkbox_group)
  options JSONB DEFAULT '[]',               -- [{"value": "yes", "label": "Yes"}, ...]

  -- Validation
  validation_rules JSONB DEFAULT '{}',      -- {"min": 0, "max": 100, "pattern": "...", "min_photos": 1}

  -- Ordering
  display_order INT DEFAULT 0,

  -- Conditional display (show if another field has specific value)
  condition JSONB DEFAULT NULL,             -- {"field_key": "issue_found", "operator": "equals", "value": "yes"}

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique field key within form
  UNIQUE(form_id, field_key)
);

-- ===================
-- INDEXES
-- ===================
CREATE INDEX IF NOT EXISTS idx_field_forms_company ON field_forms(company_id);
CREATE INDEX IF NOT EXISTS idx_field_form_fields_form ON field_form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_field_form_fields_order ON field_form_fields(form_id, display_order);
CREATE INDEX IF NOT EXISTS idx_service_forms_service ON service_forms(service_id);
CREATE INDEX IF NOT EXISTS idx_service_forms_form ON service_forms(form_id);
CREATE INDEX IF NOT EXISTS idx_service_forms_order ON service_forms(service_id, display_order);

-- ===================
-- RLS POLICIES
-- ===================
ALTER TABLE field_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_forms ENABLE ROW LEVEL SECURITY;

-- Field Forms policies
DROP POLICY IF EXISTS "Users can view their company field forms" ON field_forms;
CREATE POLICY "Users can view their company field forms"
  ON field_forms FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert their company field forms" ON field_forms;
CREATE POLICY "Users can insert their company field forms"
  ON field_forms FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their company field forms" ON field_forms;
CREATE POLICY "Users can update their company field forms"
  ON field_forms FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their company field forms" ON field_forms;
CREATE POLICY "Users can delete their company field forms"
  ON field_forms FOR DELETE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Field Form Fields policies (access via form's company)
DROP POLICY IF EXISTS "Users can view their company field form fields" ON field_form_fields;
CREATE POLICY "Users can view their company field form fields"
  ON field_form_fields FOR SELECT
  TO authenticated
  USING (form_id IN (
    SELECT id FROM field_forms
    WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  ));

DROP POLICY IF EXISTS "Users can insert their company field form fields" ON field_form_fields;
CREATE POLICY "Users can insert their company field form fields"
  ON field_form_fields FOR INSERT
  TO authenticated
  WITH CHECK (form_id IN (
    SELECT id FROM field_forms
    WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  ));

DROP POLICY IF EXISTS "Users can update their company field form fields" ON field_form_fields;
CREATE POLICY "Users can update their company field form fields"
  ON field_form_fields FOR UPDATE
  TO authenticated
  USING (form_id IN (
    SELECT id FROM field_forms
    WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  ));

DROP POLICY IF EXISTS "Users can delete their company field form fields" ON field_form_fields;
CREATE POLICY "Users can delete their company field form fields"
  ON field_form_fields FOR DELETE
  TO authenticated
  USING (form_id IN (
    SELECT id FROM field_forms
    WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  ));

-- Service Forms policies (access via service's company in library_items)
DROP POLICY IF EXISTS "Users can view their company service forms" ON service_forms;
CREATE POLICY "Users can view their company service forms"
  ON service_forms FOR SELECT
  TO authenticated
  USING (service_id IN (
    SELECT id FROM library_items
    WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  ));

DROP POLICY IF EXISTS "Users can insert their company service forms" ON service_forms;
CREATE POLICY "Users can insert their company service forms"
  ON service_forms FOR INSERT
  TO authenticated
  WITH CHECK (service_id IN (
    SELECT id FROM library_items
    WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  ));

DROP POLICY IF EXISTS "Users can update their company service forms" ON service_forms;
CREATE POLICY "Users can update their company service forms"
  ON service_forms FOR UPDATE
  TO authenticated
  USING (service_id IN (
    SELECT id FROM library_items
    WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  ));

DROP POLICY IF EXISTS "Users can delete their company service forms" ON service_forms;
CREATE POLICY "Users can delete their company service forms"
  ON service_forms FOR DELETE
  TO authenticated
  USING (service_id IN (
    SELECT id FROM library_items
    WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  ));

-- ===================
-- COMMENTS
-- ===================
COMMENT ON TABLE field_forms IS 'Reusable form templates that technicians fill out during service execution';
COMMENT ON TABLE field_form_fields IS 'Individual fields within a form template';
COMMENT ON TABLE service_forms IS 'Junction table linking forms to services with configuration (required, allow_multiple, order)';
COMMENT ON COLUMN field_form_fields.field_type IS 'Supported types: text, textarea, number, date, time, photo, signature, checkbox, select, radio, checkbox_group, rating, location';
COMMENT ON COLUMN field_form_fields.condition IS 'Show this field only when condition is met, e.g., {"field_key": "has_issue", "operator": "equals", "value": "yes"}';
