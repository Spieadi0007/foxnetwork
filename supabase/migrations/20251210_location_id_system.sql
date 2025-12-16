-- =====================================================
-- FOX NETWORK: Location ID System
-- Auto-generated unique identifier for locations
-- Format: {CLIENT_CODE}_{COUNTRY_CODE}_{00001}
-- =====================================================

-- ===================
-- SEQUENCE TRACKING TABLE
-- Tracks the next sequence number per company
-- ===================
CREATE TABLE IF NOT EXISTS location_id_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  next_sequence INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One sequence per company
  UNIQUE(company_id)
);

-- ===================
-- ADD LOCATION_ID TO LOCATIONS TABLE
-- ===================
ALTER TABLE locations ADD COLUMN IF NOT EXISTS location_id VARCHAR(50);

-- Create unique index for location_id (per company for safety)
CREATE UNIQUE INDEX IF NOT EXISTS idx_locations_location_id
  ON locations(location_id) WHERE location_id IS NOT NULL;

-- ===================
-- HELPER FUNCTION: Generate Location ID
-- ===================
CREATE OR REPLACE FUNCTION generate_location_id(
  p_company_id UUID,
  p_client_name TEXT,
  p_client_code TEXT,
  p_country_name TEXT,
  p_country_code TEXT
) RETURNS TEXT AS $$
DECLARE
  v_client_part TEXT;
  v_country_part TEXT;
  v_sequence INT;
  v_location_id TEXT;
BEGIN
  -- Get client code (use code if available, otherwise first 4 chars of name uppercase)
  IF p_client_code IS NOT NULL AND p_client_code != '' THEN
    v_client_part := UPPER(SUBSTRING(REGEXP_REPLACE(p_client_code, '[^a-zA-Z0-9]', '', 'g'), 1, 6));
  ELSIF p_client_name IS NOT NULL AND p_client_name != '' THEN
    v_client_part := UPPER(SUBSTRING(REGEXP_REPLACE(p_client_name, '[^a-zA-Z0-9]', '', 'g'), 1, 4));
  ELSE
    v_client_part := 'NOCL';
  END IF;

  -- Get country code (use code if available, otherwise first 2 chars of name uppercase)
  IF p_country_code IS NOT NULL AND p_country_code != '' THEN
    v_country_part := UPPER(SUBSTRING(REGEXP_REPLACE(p_country_code, '[^a-zA-Z0-9]', '', 'g'), 1, 3));
  ELSIF p_country_name IS NOT NULL AND p_country_name != '' THEN
    v_country_part := UPPER(SUBSTRING(REGEXP_REPLACE(p_country_name, '[^a-zA-Z0-9]', '', 'g'), 1, 2));
  ELSE
    v_country_part := 'XX';
  END IF;

  -- Get and increment sequence
  INSERT INTO location_id_sequences (company_id, next_sequence)
  VALUES (p_company_id, 1)
  ON CONFLICT (company_id) DO UPDATE
  SET next_sequence = location_id_sequences.next_sequence + 1,
      updated_at = NOW()
  RETURNING next_sequence INTO v_sequence;

  -- If we got the incremented value, we need the previous one
  -- Actually the RETURNING gives us the NEW value after update, so subtract 1 for insert case
  -- Let's fix this logic
  IF v_sequence = 1 THEN
    -- First insert, use 1
    v_sequence := 1;
    -- Update to 2 for next time
    UPDATE location_id_sequences SET next_sequence = 2 WHERE company_id = p_company_id;
  END IF;

  -- Build location ID: CLIENT_COUNTRY_00001
  v_location_id := v_client_part || '_' || v_country_part || '_' || LPAD(v_sequence::TEXT, 5, '0');

  RETURN v_location_id;
END;
$$ LANGUAGE plpgsql;

-- ===================
-- RLS POLICIES
-- ===================
ALTER TABLE location_id_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company sequences"
  ON location_id_sequences FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their company sequences"
  ON location_id_sequences FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their company sequences"
  ON location_id_sequences FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- ===================
-- GRANT EXECUTE ON FUNCTION
-- ===================
GRANT EXECUTE ON FUNCTION generate_location_id TO authenticated;
