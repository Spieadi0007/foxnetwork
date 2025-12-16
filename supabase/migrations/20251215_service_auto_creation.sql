-- =====================================================
-- FOX NETWORK: Automatic Service Creation from Projects
-- Creates services automatically when projects match conditions
-- Example: Project Type = "Deployment" → Create "Site Survey" + "Installation" services
-- =====================================================

-- ===================
-- SERVICE AUTO-CREATION RULES TABLE
-- Defines when to auto-create services based on project conditions
-- ===================
CREATE TABLE IF NOT EXISTS service_auto_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Rule identification
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- What service to create
  service_type_id UUID REFERENCES library_items(id) ON DELETE SET NULL,  -- Service type from library
  default_step_id UUID REFERENCES library_items(id) ON DELETE SET NULL,  -- Starting workflow step
  default_step_status_id UUID REFERENCES library_items(id) ON DELETE SET NULL,  -- Starting step status

  -- Service defaults
  default_urgency VARCHAR(50) DEFAULT 'scheduled',  -- scheduled, same_day, emergency
  default_status VARCHAR(50) DEFAULT 'scheduled',   -- scheduled, in_progress, etc.

  -- Project conditions (JSONB)
  -- Structure: { "conditions": [...], "logic": "all" | "any" }
  conditions JSONB NOT NULL DEFAULT '{"conditions": [], "logic": "all"}',

  -- Rule settings
  is_active BOOLEAN DEFAULT true,
  priority INT DEFAULT 0,  -- Lower number = higher priority (evaluated first)

  -- Prevent duplicate services
  prevent_duplicates BOOLEAN DEFAULT true,  -- Don't create if service of same type exists

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  -- Unique rule name per company
  UNIQUE(company_id, name)
);

-- ===================
-- INDEXES
-- ===================
CREATE INDEX IF NOT EXISTS idx_service_auto_rules_company ON service_auto_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_service_auto_rules_active ON service_auto_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_service_auto_rules_priority ON service_auto_rules(priority);

-- ===================
-- RLS POLICIES
-- ===================
ALTER TABLE service_auto_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their company service auto rules" ON service_auto_rules;
CREATE POLICY "Users can view their company service auto rules"
  ON service_auto_rules FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert their company service auto rules" ON service_auto_rules;
CREATE POLICY "Users can insert their company service auto rules"
  ON service_auto_rules FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their company service auto rules" ON service_auto_rules;
CREATE POLICY "Users can update their company service auto rules"
  ON service_auto_rules FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their company service auto rules" ON service_auto_rules;
CREATE POLICY "Users can delete their company service auto rules"
  ON service_auto_rules FOR DELETE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- ===================
-- FUNCTION: Evaluate project condition
-- ===================
CREATE OR REPLACE FUNCTION evaluate_project_condition(
  condition JSONB,
  project_record RECORD
) RETURNS BOOLEAN AS $$
DECLARE
  field_name TEXT;
  operator TEXT;
  condition_value TEXT;
  field_value TEXT;
  is_empty BOOLEAN;
BEGIN
  field_name := condition->>'field';
  operator := condition->>'operator';
  condition_value := condition->>'value';

  -- Get field value from project record dynamically
  BEGIN
    EXECUTE format('SELECT ($1).%I::text', field_name) INTO field_value USING project_record;
  EXCEPTION
    WHEN OTHERS THEN
      field_value := NULL;
  END;

  -- Check if empty
  is_empty := field_value IS NULL OR TRIM(field_value) = '' OR field_value = '[]' OR field_value = '{}';

  -- Evaluate based on operator
  CASE operator
    WHEN 'is_empty' THEN
      RETURN is_empty;
    WHEN 'is_not_empty' THEN
      RETURN NOT is_empty;
    WHEN 'equals' THEN
      RETURN field_value = condition_value;
    WHEN 'not_equals' THEN
      RETURN field_value != condition_value OR (field_value IS NULL AND condition_value IS NOT NULL);
    WHEN 'contains' THEN
      RETURN field_value ILIKE '%' || condition_value || '%';
    WHEN 'starts_with' THEN
      RETURN field_value ILIKE condition_value || '%';
    WHEN 'ends_with' THEN
      RETURN field_value ILIKE '%' || condition_value;
    WHEN 'in' THEN
      -- Check if value is in comma-separated list
      RETURN field_value = ANY(string_to_array(condition_value, ','));
    ELSE
      RETURN FALSE;
  END CASE;

  RETURN FALSE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ===================
-- FUNCTION: Evaluate all project conditions for a rule
-- ===================
CREATE OR REPLACE FUNCTION evaluate_project_conditions(
  rule_conditions JSONB,
  project_record RECORD
) RETURNS BOOLEAN AS $$
DECLARE
  conditions JSONB;
  logic TEXT;
  condition JSONB;
  result BOOLEAN;
  all_match BOOLEAN := TRUE;
  any_match BOOLEAN := FALSE;
BEGIN
  -- Check if conditions exist
  IF rule_conditions IS NULL OR rule_conditions->'conditions' IS NULL THEN
    RETURN FALSE;
  END IF;

  conditions := rule_conditions->'conditions';
  logic := COALESCE(rule_conditions->>'logic', 'all');

  -- Check if conditions array is empty
  IF jsonb_array_length(conditions) = 0 THEN
    RETURN FALSE;
  END IF;

  -- Evaluate each condition
  FOR condition IN SELECT * FROM jsonb_array_elements(conditions)
  LOOP
    result := evaluate_project_condition(condition, project_record);

    IF result THEN
      any_match := TRUE;
    ELSE
      all_match := FALSE;
    END IF;
  END LOOP;

  -- Return based on logic
  IF logic = 'any' THEN
    RETURN any_match;
  ELSE
    RETURN all_match;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ===================
-- FUNCTION: Find all matching service rules for a project
-- ===================
CREATE OR REPLACE FUNCTION find_matching_service_rules(
  p_company_id UUID,
  project_record RECORD
) RETURNS TABLE(
  rule_id UUID,
  rule_name TEXT,
  service_type_id UUID,
  service_type_name TEXT,
  default_step_id UUID,
  default_step_name TEXT,
  default_step_status_id UUID,
  default_step_status_name TEXT,
  default_urgency TEXT,
  default_status TEXT,
  prevent_duplicates BOOLEAN
) AS $$
DECLARE
  rule_record RECORD;
BEGIN
  -- Loop through active rules by priority
  FOR rule_record IN
    SELECT
      sar.id,
      sar.name as rule_name,
      sar.service_type_id,
      st.name as service_type_name,
      sar.default_step_id,
      ds.name as default_step_name,
      sar.default_step_status_id,
      dss.name as default_step_status_name,
      sar.default_urgency,
      sar.default_status,
      sar.prevent_duplicates,
      sar.conditions
    FROM service_auto_rules sar
    LEFT JOIN library_items st ON sar.service_type_id = st.id
    LEFT JOIN library_items ds ON sar.default_step_id = ds.id
    LEFT JOIN library_items dss ON sar.default_step_status_id = dss.id
    WHERE sar.company_id = p_company_id
      AND sar.is_active = TRUE
    ORDER BY sar.priority ASC
  LOOP
    -- Evaluate conditions
    IF evaluate_project_conditions(rule_record.conditions, project_record) THEN
      rule_id := rule_record.id;
      rule_name := rule_record.rule_name;
      service_type_id := rule_record.service_type_id;
      service_type_name := rule_record.service_type_name;
      default_step_id := rule_record.default_step_id;
      default_step_name := rule_record.default_step_name;
      default_step_status_id := rule_record.default_step_status_id;
      default_step_status_name := rule_record.default_step_status_name;
      default_urgency := rule_record.default_urgency;
      default_status := rule_record.default_status;
      prevent_duplicates := rule_record.prevent_duplicates;
      RETURN NEXT;
      -- Continue to find ALL matching rules (not just first)
    END IF;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- ===================
-- FUNCTION: Evaluate a single condition (supports both project and location fields)
-- ===================
CREATE OR REPLACE FUNCTION evaluate_service_rule_condition(
  condition JSONB,
  project_record RECORD,
  location_record RECORD
) RETURNS BOOLEAN AS $$
DECLARE
  field_name TEXT;
  field_source TEXT;
  operator TEXT;
  condition_value TEXT;
  field_value TEXT;
  is_empty BOOLEAN;
BEGIN
  field_name := condition->>'field';
  operator := condition->>'operator';
  condition_value := condition->>'value';

  -- Determine if this is a location field or project field
  -- Location fields: client, country, state, city, type, postal_code, address
  -- Everything else is a project field
  IF field_name IN ('client', 'country', 'state', 'city', 'type', 'postal_code', 'address', 'location_name', 'location_code', 'location_status') THEN
    -- Handle aliased field names
    IF field_name = 'location_name' THEN
      field_name := 'name';
    ELSIF field_name = 'location_code' THEN
      field_name := 'code';
    ELSIF field_name = 'location_status' THEN
      field_name := 'status';
    END IF;

    -- Get field value from location record
    BEGIN
      EXECUTE format('SELECT ($1).%I::text', field_name) INTO field_value USING location_record;
    EXCEPTION
      WHEN OTHERS THEN
        field_value := NULL;
    END;
  ELSE
    -- Get field value from project record
    BEGIN
      EXECUTE format('SELECT ($1).%I::text', field_name) INTO field_value USING project_record;
    EXCEPTION
      WHEN OTHERS THEN
        field_value := NULL;
    END;
  END IF;

  -- Check if empty
  is_empty := field_value IS NULL OR TRIM(field_value) = '' OR field_value = '[]' OR field_value = '{}';

  -- Evaluate based on operator
  CASE operator
    WHEN 'is_empty' THEN
      RETURN is_empty;
    WHEN 'is_not_empty' THEN
      RETURN NOT is_empty;
    WHEN 'equals' THEN
      RETURN field_value = condition_value;
    WHEN 'not_equals' THEN
      RETURN field_value != condition_value OR (field_value IS NULL AND condition_value IS NOT NULL);
    WHEN 'contains' THEN
      RETURN field_value ILIKE '%' || condition_value || '%';
    WHEN 'starts_with' THEN
      RETURN field_value ILIKE condition_value || '%';
    WHEN 'ends_with' THEN
      RETURN field_value ILIKE '%' || condition_value;
    WHEN 'in' THEN
      RETURN field_value = ANY(string_to_array(condition_value, ','));
    ELSE
      RETURN FALSE;
  END CASE;

  RETURN FALSE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ===================
-- FUNCTION: Evaluate all conditions for a service rule (supports both project and location)
-- ===================
CREATE OR REPLACE FUNCTION evaluate_service_rule_conditions(
  rule_conditions JSONB,
  project_record RECORD,
  location_record RECORD
) RETURNS BOOLEAN AS $$
DECLARE
  conditions JSONB;
  logic TEXT;
  condition JSONB;
  result BOOLEAN;
  all_match BOOLEAN := TRUE;
  any_match BOOLEAN := FALSE;
BEGIN
  -- Check if conditions exist
  IF rule_conditions IS NULL OR rule_conditions->'conditions' IS NULL THEN
    RETURN FALSE;
  END IF;

  conditions := rule_conditions->'conditions';
  logic := COALESCE(rule_conditions->>'logic', 'all');

  -- Check if conditions array is empty
  IF jsonb_array_length(conditions) = 0 THEN
    RETURN FALSE;
  END IF;

  -- Evaluate each condition
  FOR condition IN SELECT * FROM jsonb_array_elements(conditions)
  LOOP
    result := evaluate_service_rule_condition(condition, project_record, location_record);

    IF result THEN
      any_match := TRUE;
    ELSE
      all_match := FALSE;
    END IF;
  END LOOP;

  -- Return based on logic
  IF logic = 'any' THEN
    RETURN any_match;
  ELSE
    RETURN all_match;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ===================
-- FUNCTION: Find all matching service rules (with location context)
-- ===================
CREATE OR REPLACE FUNCTION find_matching_service_rules_with_location(
  p_company_id UUID,
  project_record RECORD,
  location_record RECORD
) RETURNS TABLE(
  rule_id UUID,
  rule_name TEXT,
  service_type_id UUID,
  service_type_name TEXT,
  default_step_id UUID,
  default_step_name TEXT,
  default_step_status_id UUID,
  default_step_status_name TEXT,
  default_urgency TEXT,
  default_status TEXT,
  prevent_duplicates BOOLEAN
) AS $$
DECLARE
  rule_record RECORD;
BEGIN
  -- Loop through active rules by priority
  FOR rule_record IN
    SELECT
      sar.id,
      sar.name as rule_name,
      sar.service_type_id,
      st.name as service_type_name,
      sar.default_step_id,
      ds.name as default_step_name,
      sar.default_step_status_id,
      dss.name as default_step_status_name,
      sar.default_urgency,
      sar.default_status,
      sar.prevent_duplicates,
      sar.conditions
    FROM service_auto_rules sar
    LEFT JOIN library_items st ON sar.service_type_id = st.id
    LEFT JOIN library_items ds ON sar.default_step_id = ds.id
    LEFT JOIN library_items dss ON sar.default_step_status_id = dss.id
    WHERE sar.company_id = p_company_id
      AND sar.is_active = TRUE
    ORDER BY sar.priority ASC
  LOOP
    -- Evaluate conditions with both project and location context
    IF evaluate_service_rule_conditions(rule_record.conditions, project_record, location_record) THEN
      rule_id := rule_record.id;
      rule_name := rule_record.rule_name;
      service_type_id := rule_record.service_type_id;
      service_type_name := rule_record.service_type_name;
      default_step_id := rule_record.default_step_id;
      default_step_name := rule_record.default_step_name;
      default_step_status_id := rule_record.default_step_status_id;
      default_step_status_name := rule_record.default_step_status_name;
      default_urgency := rule_record.default_urgency;
      default_status := rule_record.default_status;
      prevent_duplicates := rule_record.prevent_duplicates;
      RETURN NEXT;
      -- Continue to find ALL matching rules (not just first)
    END IF;
  END LOOP;

  RETURN;
END;
$$ LANGUAGE plpgsql;

-- ===================
-- TRIGGER FUNCTION: Auto-create services on project insert/update
-- ===================
CREATE OR REPLACE FUNCTION auto_create_services_from_project()
RETURNS TRIGGER AS $$
DECLARE
  matched_rule RECORD;
  existing_service_count INT;
  new_service_id UUID;
  new_service_id_code TEXT;
  project_country TEXT;
  location_record RECORD;
BEGIN
  -- Only process on INSERT or when project_type changes
  IF TG_OP = 'UPDATE' THEN
    -- Check if project_type_id changed
    IF NOT (NEW.project_type_id IS DISTINCT FROM OLD.project_type_id) THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Get full location record for condition evaluation
  SELECT * INTO location_record
  FROM locations
  WHERE id = NEW.location_id;

  project_country := COALESCE(location_record.country, 'XX');

  -- Find all matching rules (with location context)
  FOR matched_rule IN
    SELECT * FROM find_matching_service_rules_with_location(NEW.company_id, NEW, location_record)
  LOOP
    -- Check for duplicates if prevent_duplicates is enabled
    IF matched_rule.prevent_duplicates AND matched_rule.service_type_id IS NOT NULL THEN
      SELECT COUNT(*) INTO existing_service_count
      FROM services
      WHERE project_id = NEW.id
        AND service_type_id = matched_rule.service_type_id
        AND status NOT IN ('cancelled', 'completed');

      IF existing_service_count > 0 THEN
        -- Service of this type already exists for this project
        CONTINUE;
      END IF;
    END IF;

    -- Generate service ID
    SELECT generate_service_id(
      NEW.company_id,
      COALESCE(matched_rule.service_type_name, 'SVC'),
      NULL,
      project_country,
      CURRENT_DATE
    ) INTO new_service_id_code;

    -- Create the service
    INSERT INTO services (
      company_id,
      project_id,
      location_id,
      service_id,
      title,
      service_type,
      service_type_id,
      step,
      step_id,
      step_status,
      step_status_id,
      urgency,
      status,
      assigned_technicians,
      parts_used,
      allow_merge,
      max_actions,
      merged_from_services,
      config,
      metadata,
      created_by
    ) VALUES (
      NEW.company_id,
      NEW.id,
      NEW.location_id,
      new_service_id_code,
      COALESCE(matched_rule.service_type_name, 'New Service') || ' - ' || NEW.name,
      matched_rule.service_type_name,
      matched_rule.service_type_id,
      matched_rule.default_step_name,
      matched_rule.default_step_id,
      matched_rule.default_step_status_name,
      matched_rule.default_step_status_id,
      COALESCE(matched_rule.default_urgency, 'scheduled'),
      COALESCE(matched_rule.default_status, 'scheduled'),
      '{}',  -- assigned_technicians
      '[]',  -- parts_used
      TRUE,  -- allow_merge
      10,    -- max_actions
      '{}',  -- merged_from_services
      '{}',  -- config
      jsonb_build_object(
        'auto_created', true,
        'auto_rule_id', matched_rule.rule_id,
        'auto_rule_name', matched_rule.rule_name
      ),
      NEW.created_by
    )
    RETURNING id INTO new_service_id;

    -- Log the auto-creation
    RAISE NOTICE 'Auto-created service % for project % using rule %',
      new_service_id, NEW.id, matched_rule.rule_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===================
-- CREATE TRIGGER ON PROJECTS
-- ===================
DROP TRIGGER IF EXISTS auto_service_creation_trigger ON projects;

CREATE TRIGGER auto_service_creation_trigger
  AFTER INSERT OR UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_services_from_project();

-- ===================
-- COMMENTS
-- ===================
COMMENT ON TABLE service_auto_rules IS 'Rules for automatically creating services when projects match certain conditions';
COMMENT ON FUNCTION auto_create_services_from_project() IS 'Trigger function that auto-creates services based on project conditions';
COMMENT ON TRIGGER auto_service_creation_trigger ON projects IS 'Fires after INSERT/UPDATE on projects to auto-create services';

-- ===================
-- PROJECT FIELDS AVAILABLE FOR CONDITIONS
-- ===================
-- The following project fields can be used in conditions:
-- - project_type_id (UUID) - Reference to project type in library
-- - project_type (text) - Project type name
-- - billing_model (text) - fixed, time_and_materials, per_visit, per_action
-- - sla_tier (text) - standard, premium, critical
-- - priority (text) - low, medium, high, urgent
-- - status (text) - draft, active, on_hold, completed, cancelled
-- - location_id (UUID) - Reference to location
-- - name (text) - Project name
-- - project_id (text) - Auto-generated project ID
