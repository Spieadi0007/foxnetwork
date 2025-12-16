-- =====================================================
-- FOX NETWORK: Automatic Step Assignment Trigger
-- Automatically updates service step based on conditions
-- Fires on INSERT/UPDATE of services table
-- =====================================================

-- ===================
-- HELPER FUNCTION: Check if value is empty
-- ===================
CREATE OR REPLACE FUNCTION is_value_empty(val ANYELEMENT)
RETURNS BOOLEAN AS $$
BEGIN
  IF val IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Check for empty string
  IF pg_typeof(val)::text = 'text' OR pg_typeof(val)::text = 'character varying' THEN
    RETURN TRIM(val::text) = '';
  END IF;

  -- Check for empty array
  IF pg_typeof(val)::text LIKE '%[]%' THEN
    RETURN array_length(val::text[], 1) IS NULL OR array_length(val::text[], 1) = 0;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ===================
-- FUNCTION: Evaluate a single condition
-- ===================
CREATE OR REPLACE FUNCTION evaluate_step_condition(
  condition JSONB,
  service_record RECORD
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

  -- Get field value from service record dynamically
  EXECUTE format('SELECT ($1).%I::text', field_name) INTO field_value USING service_record;

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
    WHEN 'greater_than' THEN
      RETURN field_value > condition_value;
    WHEN 'less_than' THEN
      RETURN field_value < condition_value;
    ELSE
      RETURN FALSE;
  END CASE;

  RETURN FALSE;
EXCEPTION
  WHEN OTHERS THEN
    -- If field doesn't exist or other error, return false
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ===================
-- FUNCTION: Evaluate all conditions for a step
-- ===================
CREATE OR REPLACE FUNCTION evaluate_step_conditions(
  step_conditions JSONB,
  service_record RECORD
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
  IF step_conditions IS NULL OR step_conditions->'conditions' IS NULL THEN
    RETURN FALSE;
  END IF;

  conditions := step_conditions->'conditions';
  logic := COALESCE(step_conditions->>'logic', 'all');

  -- Check if conditions array is empty
  IF jsonb_array_length(conditions) = 0 THEN
    RETURN FALSE;
  END IF;

  -- Evaluate each condition
  FOR condition IN SELECT * FROM jsonb_array_elements(conditions)
  LOOP
    result := evaluate_step_condition(condition, service_record);

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
-- FUNCTION: Find matching step for a service
-- ===================
CREATE OR REPLACE FUNCTION find_matching_step(
  p_company_id UUID,
  service_record RECORD
) RETURNS TABLE(step_id UUID, step_name TEXT) AS $$
DECLARE
  step_record RECORD;
  step_conditions JSONB;
BEGIN
  -- Get workflow_steps category
  FOR step_record IN
    SELECT li.id, li.name, li.metadata
    FROM library_items li
    JOIN library_categories lc ON li.category_id = lc.id
    WHERE lc.slug = 'workflow_steps'
      AND li.company_id = p_company_id
      AND li.is_active = TRUE
    ORDER BY li.display_order ASC
  LOOP
    -- Get conditions from metadata
    step_conditions := step_record.metadata->'step_conditions';

    -- Evaluate conditions
    IF evaluate_step_conditions(step_conditions, service_record) THEN
      step_id := step_record.id;
      step_name := step_record.name;
      RETURN NEXT;
      RETURN; -- Return first match
    END IF;
  END LOOP;

  -- No match found
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- ===================
-- TRIGGER FUNCTION: Auto-assign step on service changes
-- ===================
CREATE OR REPLACE FUNCTION auto_assign_service_step()
RETURNS TRIGGER AS $$
DECLARE
  matched_step RECORD;
  should_evaluate BOOLEAN := FALSE;
BEGIN
  -- Only evaluate if step_id is not explicitly being set
  -- Or if relevant fields changed
  IF TG_OP = 'INSERT' THEN
    -- On insert, evaluate if no step provided
    should_evaluate := NEW.step_id IS NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    -- On update, evaluate if step not explicitly changed AND relevant fields changed
    IF NEW.step_id IS DISTINCT FROM OLD.step_id THEN
      -- User explicitly changed step, don't override
      should_evaluate := FALSE;
    ELSE
      -- Check if relevant fields changed
      should_evaluate := (
        NEW.primary_technician_id IS DISTINCT FROM OLD.primary_technician_id OR
        NEW.assigned_technicians IS DISTINCT FROM OLD.assigned_technicians OR
        NEW.scheduled_date IS DISTINCT FROM OLD.scheduled_date OR
        NEW.scheduled_start_time IS DISTINCT FROM OLD.scheduled_start_time OR
        NEW.started_at IS DISTINCT FROM OLD.started_at OR
        NEW.completed_at IS DISTINCT FROM OLD.completed_at OR
        NEW.status IS DISTINCT FROM OLD.status OR
        NEW.departure_time IS DISTINCT FROM OLD.departure_time OR
        NEW.arrival_time IS DISTINCT FROM OLD.arrival_time OR
        NEW.customer_signature IS DISTINCT FROM OLD.customer_signature OR
        NEW.technician_signature IS DISTINCT FROM OLD.technician_signature
      );
    END IF;
  END IF;

  -- Find matching step if we should evaluate
  IF should_evaluate THEN
    SELECT * INTO matched_step
    FROM find_matching_step(NEW.company_id, NEW)
    LIMIT 1;

    IF matched_step.step_id IS NOT NULL THEN
      NEW.step_id := matched_step.step_id;
      NEW.step := matched_step.step_name;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ===================
-- CREATE TRIGGER
-- ===================
DROP TRIGGER IF EXISTS auto_step_assignment_trigger ON services;

CREATE TRIGGER auto_step_assignment_trigger
  BEFORE INSERT OR UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_service_step();

-- ===================
-- COMMENTS
-- ===================
COMMENT ON FUNCTION auto_assign_service_step() IS 'Automatically assigns workflow step based on conditions defined in library_items.metadata';
COMMENT ON TRIGGER auto_step_assignment_trigger ON services IS 'Fires before INSERT/UPDATE to auto-assign step based on conditions';
