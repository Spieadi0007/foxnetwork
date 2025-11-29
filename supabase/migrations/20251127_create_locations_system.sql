-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50), -- Internal reference code
  type VARCHAR(50) DEFAULT 'site', -- site, warehouse, office, store, etc.
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, pending, archived

  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'France',

  -- Coordinates
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Contact
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),

  -- Additional Info
  notes TEXT,
  metadata JSONB DEFAULT '{}',

  -- Source tracking
  source VARCHAR(50) DEFAULT 'manual', -- manual, csv, api, form
  source_reference VARCHAR(255), -- API key id or form id that created this

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Create index for faster queries
CREATE INDEX idx_locations_company_id ON locations(company_id);
CREATE INDEX idx_locations_status ON locations(status);
CREATE INDEX idx_locations_type ON locations(type);
CREATE INDEX idx_locations_source ON locations(source);

-- Create api_keys table for client API access
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL, -- Friendly name for the key
  key_hash VARCHAR(255) NOT NULL, -- Hashed API key (we store hash, not plain key)
  key_prefix VARCHAR(10) NOT NULL, -- First few chars for identification (e.g., "fox_abc...")

  -- Permissions
  permissions JSONB DEFAULT '["locations:create"]', -- Array of permissions

  -- Rate limiting
  rate_limit_per_minute INT DEFAULT 60,
  rate_limit_per_day INT DEFAULT 10000,

  -- Usage tracking
  last_used_at TIMESTAMPTZ,
  total_requests INT DEFAULT 0,

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, revoked, expired
  expires_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES users(id)
);

-- Create index for API key lookups
CREATE INDEX idx_api_keys_company_id ON api_keys(company_id);
CREATE INDEX idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_status ON api_keys(status);

-- Create location_forms table for public embeddable forms
CREATE TABLE IF NOT EXISTS location_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Form config
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL, -- URL-friendly identifier
  description TEXT,

  -- Customization
  logo_url VARCHAR(500),
  primary_color VARCHAR(20) DEFAULT '#3B82F6',
  welcome_message TEXT,
  success_message TEXT DEFAULT 'Thank you! Your location has been submitted.',

  -- Field configuration (which fields to show/require)
  fields_config JSONB DEFAULT '{
    "name": {"visible": true, "required": true},
    "address_line1": {"visible": true, "required": true},
    "address_line2": {"visible": true, "required": false},
    "city": {"visible": true, "required": true},
    "state": {"visible": true, "required": false},
    "postal_code": {"visible": true, "required": true},
    "country": {"visible": true, "required": true},
    "contact_name": {"visible": true, "required": false},
    "contact_email": {"visible": true, "required": false},
    "contact_phone": {"visible": true, "required": false},
    "notes": {"visible": true, "required": false}
  }',

  -- Settings
  requires_approval BOOLEAN DEFAULT true, -- New submissions need approval
  notify_on_submission BOOLEAN DEFAULT true,
  notification_emails TEXT[], -- Array of emails to notify

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, archived

  -- Usage tracking
  submission_count INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Create unique index for form slugs per company
CREATE UNIQUE INDEX idx_location_forms_company_slug ON location_forms(company_id, slug);
CREATE INDEX idx_location_forms_status ON location_forms(status);

-- Create location_submissions table for pending form submissions
CREATE TABLE IF NOT EXISTS location_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES location_forms(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Submission data (same as locations)
  name VARCHAR(255) NOT NULL,
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  notes TEXT,
  metadata JSONB DEFAULT '{}',

  -- Submission info
  submitter_ip VARCHAR(50),
  submitter_user_agent TEXT,

  -- Review status
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id),
  rejection_reason TEXT,

  -- If approved, link to created location
  location_id UUID REFERENCES locations(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_location_submissions_form_id ON location_submissions(form_id);
CREATE INDEX idx_location_submissions_company_id ON location_submissions(company_id);
CREATE INDEX idx_location_submissions_status ON location_submissions(status);

-- Enable RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for locations
CREATE POLICY "Users can view locations of their company" ON locations
  FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert locations for their company" ON locations
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update locations of their company" ON locations
  FOR UPDATE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete locations of their company" ON locations
  FOR DELETE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- RLS Policies for api_keys
CREATE POLICY "Users can view api_keys of their company" ON api_keys
  FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert api_keys for their company" ON api_keys
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update api_keys of their company" ON api_keys
  FOR UPDATE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- RLS Policies for location_forms
CREATE POLICY "Users can view location_forms of their company" ON location_forms
  FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert location_forms for their company" ON location_forms
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update location_forms of their company" ON location_forms
  FOR UPDATE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- RLS Policies for location_submissions
CREATE POLICY "Users can view submissions of their company" ON location_submissions
  FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update submissions of their company" ON location_submissions
  FOR UPDATE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Public policy for form submissions (anyone can submit to active forms)
CREATE POLICY "Anyone can submit to active public forms" ON location_submissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM location_forms
      WHERE id = form_id AND status = 'active'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_location_forms_updated_at BEFORE UPDATE ON location_forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
