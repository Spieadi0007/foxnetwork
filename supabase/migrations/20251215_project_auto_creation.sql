-- =====================================================
-- FOX NETWORK: Automatic Project Creation from Locations
-- Creates projects automatically when locations match conditions
-- Example: Client = "Acme" AND Country = "France" → Create "Deployment" project
-- =====================================================

-- ===================
-- PROJECT AUTO-CREATION RULES TABLE
-- Defines when to auto-create projects based on location conditions
-- ===================
CREATE TABLE IF NOT EXISTS project_auto_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Rule identification
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- What project to create
  project_type_id UUID NOT NULL REFERENCES library_items(id) ON DELETE CASCADE,
  default_step_id UUID REFERENCES library_items(id) ON DELETE SET NULL,  -- Starting workflow step
  default_step_status_id UUID REFERENCES library_items(id) ON DELETE SET NULL,  -- Starting step status

  -- Project defaults
  default_billing_model VARCHAR(50) DEFAULT 'fixed',
  default_sla_tier VARCHAR(50) DEFAULT 'standard',
  default_priority VARCHAR(50) DEFAULT 'medium',

  -- Location conditions (JSONB)
  -- Structure: { "conditions": [...], "logic": "all" | "any" }
  conditions JSONB NOT NULL DEFAULT '{"conditions": [], "logic": "all"}',

  -- Rule settings
  is_active BOOLEAN DEFAULT true,
  priority INT DEFAULT 0,  -- Lower number = higher priority (evaluated first)

  -- Prevent duplicate projects
  prevent_duplicates BOOLEAN DEFAULT true,  -- Don't create if project of same type exists

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
CREATE INDEX IF NOT EXISTS idx_project_auto_rules_company ON project_auto_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_project_auto_rules_active ON project_auto_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_project_auto_rules_priority ON project_auto_rules(priority);

-- ===================
-- RLS POLICIES
-- ===================
ALTER TABLE project_auto_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their company project auto rules" ON project_auto_rules;
CREATE POLICY "Users can view their company project auto rules"
  ON project_auto_rules FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert their company project auto rules" ON project_auto_rules;
CREATE POLICY "Users can insert their company project auto rules"
  ON project_auto_rules FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their company project auto rules" ON project_auto_rules;
CREATE POLICY "Users can update their company project auto rules"
  ON project_auto_rules FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their company project auto rules" ON project_auto_rules;
CREATE POLICY "Users can delete their company project auto rules"
  ON project_auto_rules FOR DELETE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- ===================
-- FUNCTION: Evaluate location condition
-- ===================
CREATE OR REPLACE FUNCTION evaluate_location_condition(
  condition JSONB,
  location_record RECORD
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

  -- Get field value from location record dynamically
  BEGIN
    EXECUTE format('SELECT ($1).%I::text', field_name) INTO field_value USING location_record;
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
-- FUNCTION: Evaluate all location conditions for a rule
-- ===================
CREATE OR REPLACE FUNCTION evaluate_location_conditions(
  rule_conditions JSONB,
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
    result := evaluate_location_condition(condition, location_record);

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
-- FUNCTION: Find matching rule for a location
-- ===================
CREATE OR REPLACE FUNCTION find_matching_project_rule(
  p_company_id UUID,
  location_record RECORD
) RETURNS TABLE(
  rule_id UUID,
  project_type_id UUID,
  project_type_name TEXT,
  project_type_code TEXT,
  default_step_id UUID,
  default_step_name TEXT,
  default_step_status_id UUID,
  default_step_status_name TEXT,
  default_billing_model TEXT,
  default_sla_tier TEXT,
  default_priority TEXT,
  prevent_duplicates BOOLEAN
) AS $$
DECLARE
  rule_record RECORD;
BEGIN
  -- Loop through active rules by priority
  FOR rule_record IN
    SELECT
      par.id,
      par.project_type_id,
      pt.name as project_type_name,
      pt.code as project_type_code,
      par.default_step_id,
      ds.name as default_step_name,
      par.default_step_status_id,
      dss.name as default_step_status_name,
      par.default_billing_model,
      par.default_sla_tier,
      par.default_priority,
      par.prevent_duplicates,
      par.conditions
    FROM project_auto_rules par
    JOIN library_items pt ON par.project_type_id = pt.id
    LEFT JOIN library_items ds ON par.default_step_id = ds.id
    LEFT JOIN library_items dss ON par.default_step_status_id = dss.id
    WHERE par.company_id = p_company_id
      AND par.is_active = TRUE
    ORDER BY par.priority ASC
  LOOP
    -- Evaluate conditions
    IF evaluate_location_conditions(rule_record.conditions, location_record) THEN
      rule_id := rule_record.id;
      project_type_id := rule_record.project_type_id;
      project_type_name := rule_record.project_type_name;
      project_type_code := rule_record.project_type_code;
      default_step_id := rule_record.default_step_id;
      default_step_name := rule_record.default_step_name;
      default_step_status_id := rule_record.default_step_status_id;
      default_step_status_name := rule_record.default_step_status_name;
      default_billing_model := rule_record.default_billing_model;
      default_sla_tier := rule_record.default_sla_tier;
      default_priority := rule_record.default_priority;
      prevent_duplicates := rule_record.prevent_duplicates;
      RETURN NEXT;
      RETURN; -- Return first match
    END IF;
  END LOOP;

  -- No match found
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- ===================
-- TRIGGER FUNCTION: Auto-create project on location insert/update
-- ===================
CREATE OR REPLACE FUNCTION auto_create_project_from_location()
RETURNS TRIGGER AS $$
DECLARE
  matched_rule RECORD;
  existing_project_count INT;
  new_project_id UUID;
  new_project_id_code TEXT;
  location_country TEXT;
BEGIN
  -- Only process on INSERT or when relevant fields change
  IF TG_OP = 'UPDATE' THEN
    -- Check if relevant fields changed
    IF NOT (
      NEW.client IS DISTINCT FROM OLD.client OR
      NEW.country IS DISTINCT FROM OLD.country OR
      NEW.state IS DISTINCT FROM OLD.state OR
      NEW.city IS DISTINCT FROM OLD.city OR
      NEW.type IS DISTINCT FROM OLD.type OR
      NEW.status IS DISTINCT FROM OLD.status
    ) THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Find matching rule
  SELECT * INTO matched_rule
  FROM find_matching_project_rule(NEW.company_id, NEW)
  LIMIT 1;

  -- If no rule matches, return
  IF matched_rule.rule_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check for duplicates if prevent_duplicates is enabled
  IF matched_rule.prevent_duplicates THEN
    SELECT COUNT(*) INTO existing_project_count
    FROM projects
    WHERE location_id = NEW.id
      AND project_type_id = matched_rule.project_type_id
      AND status NOT IN ('cancelled', 'completed');

    IF existing_project_count > 0 THEN
      -- Project of this type already exists for this location
      RETURN NEW;
    END IF;
  END IF;

  -- Get country for project ID generation
  location_country := COALESCE(NEW.country, 'XX');

  -- Generate project ID
  SELECT generate_project_id(
    NEW.company_id,
    matched_rule.project_type_name,
    matched_rule.project_type_code,
    location_country,
    location_country,
    CURRENT_DATE
  ) INTO new_project_id_code;

  -- Create the project
  INSERT INTO projects (
    company_id,
    location_id,
    project_id,
    name,
    project_type,
    project_type_id,
    billing_model,
    sla_tier,
    priority,
    status,
    currency,
    config,
    metadata,
    created_by
  ) VALUES (
    NEW.company_id,
    NEW.id,
    new_project_id_code,
    COALESCE(matched_rule.project_type_name, 'New Project') || ' - ' || NEW.name,
    matched_rule.project_type_name,
    matched_rule.project_type_id,
    COALESCE(matched_rule.default_billing_model, 'fixed'),
    COALESCE(matched_rule.default_sla_tier, 'standard'),
    COALESCE(matched_rule.default_priority, 'medium'),
    'draft',
    'EUR',
    '{}',
    jsonb_build_object(
      'auto_created', true,
      'auto_rule_id', matched_rule.rule_id,
      'default_step_id', matched_rule.default_step_id,
      'default_step_status_id', matched_rule.default_step_status_id
    ),
    NEW.created_by
  )
  RETURNING id INTO new_project_id;

  -- Log the auto-creation (optional - you can add a log table if needed)
  RAISE NOTICE 'Auto-created project % for location % using rule %',
    new_project_id, NEW.id, matched_rule.rule_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===================
-- CREATE TRIGGER ON LOCATIONS
-- ===================
DROP TRIGGER IF EXISTS auto_project_creation_trigger ON locations;

CREATE TRIGGER auto_project_creation_trigger
  AFTER INSERT OR UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_project_from_location();

-- ===================
-- COMMENTS
-- ===================
COMMENT ON TABLE project_auto_rules IS 'Rules for automatically creating projects when locations match certain conditions';
COMMENT ON FUNCTION auto_create_project_from_location() IS 'Trigger function that auto-creates projects based on location conditions';
COMMENT ON TRIGGER auto_project_creation_trigger ON locations IS 'Fires after INSERT/UPDATE on locations to auto-create projects';

-- ===================
-- LOCATION FIELDS AVAILABLE FOR CONDITIONS
-- ===================
-- The following location fields can be used in conditions:
-- - client_id (UUID) - Reference to client in library
-- - country (text) - Country name or code
-- - region (text) - Region/State
-- - city (text) - City name
-- - location_type (text) - Type of location
-- - status (text) - Location status
-- - name (text) - Location name
-- - code (text) - Location code
-- - address (text) - Full address
-- - postal_code (text) - Postal/ZIP code
