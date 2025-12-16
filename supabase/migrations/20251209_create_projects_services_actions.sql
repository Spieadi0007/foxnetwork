-- =====================================================
-- FOX NETWORK: Projects, Services, Actions Data Model
-- Location → Project → Service → Actions
-- =====================================================

-- ===================
-- ASSETS TABLE
-- ===================
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100), -- Internal asset code/serial
  type VARCHAR(100), -- ATM, POS, Server, Network Switch, etc.
  model VARCHAR(255),
  manufacturer VARCHAR(255),
  serial_number VARCHAR(255),

  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, maintenance, retired

  -- Additional Info
  purchase_date DATE,
  warranty_expiry DATE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_assets_company_id ON assets(company_id);
CREATE INDEX idx_assets_location_id ON assets(location_id);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_type ON assets(type);

-- ===================
-- PROJECTS TABLE
-- ===================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  code VARCHAR(100), -- Internal project code

  -- Project Classification
  contract_type VARCHAR(50) NOT NULL, -- deployment, maintenance, break-fix, ad-hoc
  billing_model VARCHAR(50) DEFAULT 'fixed', -- fixed, time_and_materials, per_visit, per_action
  sla_tier VARCHAR(50) DEFAULT 'standard', -- standard, premium, critical

  -- Status
  status VARCHAR(50) DEFAULT 'draft', -- draft, active, on_hold, completed, cancelled
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent

  -- Timeline
  start_date DATE,
  target_end_date DATE,
  actual_end_date DATE,

  -- Budget/Value
  estimated_value DECIMAL(12, 2),
  actual_value DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Client Info (for partner companies managing client projects)
  client_name VARCHAR(255),
  client_contact_name VARCHAR(255),
  client_contact_email VARCHAR(255),
  client_contact_phone VARCHAR(50),

  -- Configuration (inheritable settings)
  config JSONB DEFAULT '{}',

  -- Additional Info
  notes TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_projects_location_id ON projects(location_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_contract_type ON projects(contract_type);

-- ===================
-- SERVICES TABLE
-- ===================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE, -- nullable for standalone services
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,

  -- Basic Info
  title VARCHAR(255),
  description TEXT,
  reference_number VARCHAR(100), -- Service ticket/reference number

  -- Scheduling
  urgency VARCHAR(50) DEFAULT 'scheduled', -- scheduled, same_day, emergency
  scheduled_date DATE,
  scheduled_start_time TIME,
  scheduled_end_time TIME,

  -- Actual Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Status
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, pending_approval, completed, cancelled, on_hold

  -- Assignment
  assigned_technicians UUID[] DEFAULT '{}', -- Array of user IDs
  primary_technician_id UUID REFERENCES users(id),

  -- Merge Configuration (for combining multiple issues into one visit)
  allow_merge BOOLEAN DEFAULT true,
  max_actions INT DEFAULT 10,
  merged_from_services UUID[] DEFAULT '{}', -- Track if this service was created by merging others

  -- Configuration
  config JSONB DEFAULT '{}', -- Inherited from project or custom

  -- Additional Info
  notes TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_services_company_id ON services(company_id);
CREATE INDEX idx_services_project_id ON services(project_id);
CREATE INDEX idx_services_location_id ON services(location_id);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_scheduled_date ON services(scheduled_date);
CREATE INDEX idx_services_primary_technician ON services(primary_technician_id);

-- ===================
-- ACTIONS TABLE
-- ===================
CREATE TABLE IF NOT EXISTS actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL, -- Optional: which asset this relates to

  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Action Classification
  action_type VARCHAR(50) NOT NULL, -- install, repair, inspect, survey, train, remove, maintain, configure
  complexity VARCHAR(20) DEFAULT 'standard', -- simple, standard, complex

  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, skipped, blocked
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent

  -- Source Tracking
  source VARCHAR(50) DEFAULT 'manual', -- manual, api, ticket, scheduled, project, field_discovery
  source_reference_id VARCHAR(255), -- Ticket ID, API request ID, etc.

  -- Resolution
  resolution_notes TEXT,
  resolution_code VARCHAR(50), -- success, partial, failed, not_needed

  -- Estimated vs Actual
  estimated_duration_minutes INT,
  actual_duration_minutes INT,

  -- Skills Required
  skills_required TEXT[] DEFAULT '{}',

  -- Configuration (from template)
  template_id UUID, -- Reference to action template
  config JSONB DEFAULT '{}', -- Field configuration, requirements, etc.

  -- Additional Info
  notes TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id)
);

CREATE INDEX idx_actions_company_id ON actions(company_id);
CREATE INDEX idx_actions_service_id ON actions(service_id);
CREATE INDEX idx_actions_asset_id ON actions(asset_id);
CREATE INDEX idx_actions_status ON actions(status);
CREATE INDEX idx_actions_action_type ON actions(action_type);
CREATE INDEX idx_actions_source ON actions(source);

-- ===================
-- TIME ENTRIES TABLE
-- ===================
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  technician_id UUID NOT NULL REFERENCES users(id),

  -- Time Type
  entry_type VARCHAR(50) NOT NULL, -- travel, work, break, waiting

  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_minutes INT, -- Can be computed or manually set

  -- Notes
  notes TEXT,

  -- Approval
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  approval_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  rejection_reason TEXT,

  -- Billing
  billable BOOLEAN DEFAULT true,
  hourly_rate DECIMAL(10, 2),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_time_entries_company_id ON time_entries(company_id);
CREATE INDEX idx_time_entries_action_id ON time_entries(action_id);
CREATE INDEX idx_time_entries_technician_id ON time_entries(technician_id);
CREATE INDEX idx_time_entries_started_at ON time_entries(started_at);
CREATE INDEX idx_time_entries_approval_status ON time_entries(approval_status);

-- ===================
-- PARTS USED TABLE
-- ===================
CREATE TABLE IF NOT EXISTS parts_used (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,

  -- Part Info
  part_name VARCHAR(255) NOT NULL,
  part_code VARCHAR(100),
  part_id UUID, -- Reference to inventory system (if exists)

  -- Quantity
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit VARCHAR(50) DEFAULT 'piece', -- piece, meter, kg, etc.

  -- Cost
  unit_cost DECIMAL(10, 2),
  total_cost DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'EUR',

  -- Source
  source_location VARCHAR(255), -- Van inventory, warehouse, purchased on-site

  -- Approval
  added_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  approval_status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  rejection_reason TEXT,

  -- Notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parts_used_company_id ON parts_used(company_id);
CREATE INDEX idx_parts_used_action_id ON parts_used(action_id);
CREATE INDEX idx_parts_used_approval_status ON parts_used(approval_status);

-- ===================
-- ACTION NOTES TABLE
-- ===================
CREATE TABLE IF NOT EXISTS action_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  action_id UUID NOT NULL REFERENCES actions(id) ON DELETE CASCADE,

  -- Note Content
  content TEXT NOT NULL,
  note_type VARCHAR(50) DEFAULT 'comment', -- comment, issue, resolution, photo, support

  -- Attachments
  attachments JSONB DEFAULT '[]', -- Array of {url, filename, type, size}

  -- Author
  author_id UUID REFERENCES users(id),

  -- Visibility
  is_internal BOOLEAN DEFAULT false, -- Internal notes not visible to client

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_action_notes_company_id ON action_notes(company_id);
CREATE INDEX idx_action_notes_action_id ON action_notes(action_id);
CREATE INDEX idx_action_notes_note_type ON action_notes(note_type);

-- ===================
-- APPROVALS TABLE
-- ===================
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

  -- Can be linked to service or action
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  action_id UUID REFERENCES actions(id) ON DELETE CASCADE,

  -- Approval Info
  approval_type VARCHAR(50) NOT NULL, -- tech_signoff, supervisor, client, quality_check
  approval_order INT DEFAULT 1, -- Order in approval chain

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, skipped

  -- Approver
  required_role VARCHAR(50), -- Role that can approve (if not specific user)
  assigned_to UUID REFERENCES users(id), -- Specific user assigned
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,

  -- Signature
  signature_data TEXT, -- Base64 signature if required
  signature_required BOOLEAN DEFAULT false,

  -- Notes
  notes TEXT,
  rejection_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_approvals_company_id ON approvals(company_id);
CREATE INDEX idx_approvals_service_id ON approvals(service_id);
CREATE INDEX idx_approvals_action_id ON approvals(action_id);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_approvals_assigned_to ON approvals(assigned_to);

-- Ensure at least one of service_id or action_id is set
ALTER TABLE approvals ADD CONSTRAINT approvals_check_reference
  CHECK (service_id IS NOT NULL OR action_id IS NOT NULL);

-- ===================
-- TEMPLATES SYSTEM
-- ===================

-- Template Fields Pool
CREATE TABLE IF NOT EXISTS template_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Field Definition
  code VARCHAR(100) NOT NULL UNIQUE, -- start_time, end_time, photos, signature
  label VARCHAR(255) NOT NULL,
  description TEXT,

  -- Field Type
  field_type VARCHAR(50) NOT NULL, -- text, number, datetime, date, time, file, signature, checklist, select, multiselect

  -- Default Configuration
  default_config JSONB DEFAULT '{}', -- Validation rules, options for select, etc.

  -- Category for organization
  category VARCHAR(50), -- timing, evidence, approval, tracking, custom

  -- Status
  is_system BOOLEAN DEFAULT false, -- System fields can't be deleted
  status VARCHAR(20) DEFAULT 'active',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Action Templates
CREATE TABLE IF NOT EXISTS action_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE, -- NULL for master templates

  -- Template Info
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100),
  description TEXT,
  action_type VARCHAR(50) NOT NULL, -- install, repair, inspect, etc.

  -- Hierarchy
  is_master BOOLEAN DEFAULT false, -- Master templates are platform-level
  parent_template_id UUID REFERENCES action_templates(id), -- Client template inherits from master

  -- Field Configuration
  fields_config JSONB DEFAULT '[]', -- Array of {field_id, required, order, custom_label}

  -- Workflow Configuration
  workflow_config JSONB DEFAULT '{
    "time_tracking": "both",
    "parts_tracking": true,
    "photos_required": false,
    "signature_required": false,
    "checklist_required": false
  }',

  -- Approval Configuration
  approval_config JSONB DEFAULT '{
    "chain": ["tech_signoff"],
    "signature_required": false
  }',

  -- Checklist (if applicable)
  checklist_items JSONB DEFAULT '[]', -- Array of {label, required, order}

  -- Estimated Duration
  estimated_duration_minutes INT,

  -- Skills Required
  skills_required TEXT[] DEFAULT '{}',

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, archived
  version INT DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_action_templates_company_id ON action_templates(company_id);
CREATE INDEX idx_action_templates_action_type ON action_templates(action_type);
CREATE INDEX idx_action_templates_is_master ON action_templates(is_master);
CREATE INDEX idx_action_templates_status ON action_templates(status);

-- Service Configuration Templates
CREATE TABLE IF NOT EXISTS service_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE, -- NULL for master templates

  -- Template Info
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100),
  description TEXT,

  -- Hierarchy
  is_master BOOLEAN DEFAULT false,
  parent_template_id UUID REFERENCES service_templates(id),

  -- Merge Configuration
  merge_config JSONB DEFAULT '{
    "enabled": true,
    "mode": "suggest",
    "window_hours": 24,
    "status_allowed": ["scheduled"],
    "max_actions": 10
  }',

  -- Workflow Configuration
  workflow_config JSONB DEFAULT '{
    "urgency_options": ["scheduled", "same_day", "emergency"],
    "default_urgency": "scheduled",
    "require_scheduling": true
  }',

  -- Approval Configuration
  approval_config JSONB DEFAULT '{
    "chain": ["tech_signoff", "supervisor"],
    "client_approval_required": false
  }',

  -- Default Action Templates (suggested actions for this service type)
  default_action_templates UUID[] DEFAULT '{}',

  -- Status
  status VARCHAR(20) DEFAULT 'active',
  version INT DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_service_templates_company_id ON service_templates(company_id);
CREATE INDEX idx_service_templates_is_master ON service_templates(is_master);
CREATE INDEX idx_service_templates_status ON service_templates(status);

-- Project Configuration Templates
CREATE TABLE IF NOT EXISTS project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE, -- NULL for master templates

  -- Template Info
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100),
  description TEXT,
  contract_type VARCHAR(50) NOT NULL, -- deployment, maintenance, break-fix, ad-hoc

  -- Hierarchy
  is_master BOOLEAN DEFAULT false,
  parent_template_id UUID REFERENCES project_templates(id),

  -- Default Settings
  default_billing_model VARCHAR(50) DEFAULT 'fixed',
  default_sla_tier VARCHAR(50) DEFAULT 'standard',

  -- Service Template (default for services under this project)
  default_service_template_id UUID REFERENCES service_templates(id),

  -- Workflow Configuration
  workflow_config JSONB DEFAULT '{
    "status_flow": ["draft", "active", "on_hold", "completed", "cancelled"],
    "require_start_date": true,
    "require_end_date": false
  }',

  -- SLA Configuration
  sla_config JSONB DEFAULT '{}',

  -- Status
  status VARCHAR(20) DEFAULT 'active',
  version INT DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_project_templates_company_id ON project_templates(company_id);
CREATE INDEX idx_project_templates_contract_type ON project_templates(contract_type);
CREATE INDEX idx_project_templates_is_master ON project_templates(is_master);
CREATE INDEX idx_project_templates_status ON project_templates(status);

-- ===================
-- ENABLE RLS
-- ===================
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts_used ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;

-- ===================
-- RLS POLICIES
-- ===================

-- Assets
CREATE POLICY "Users can view assets of their company" ON assets
  FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can insert assets for their company" ON assets
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can update assets of their company" ON assets
  FOR UPDATE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can delete assets of their company" ON assets
  FOR DELETE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Projects
CREATE POLICY "Users can view projects of their company" ON projects
  FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can insert projects for their company" ON projects
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can update projects of their company" ON projects
  FOR UPDATE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can delete projects of their company" ON projects
  FOR DELETE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Services
CREATE POLICY "Users can view services of their company" ON services
  FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can insert services for their company" ON services
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can update services of their company" ON services
  FOR UPDATE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can delete services of their company" ON services
  FOR DELETE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Actions
CREATE POLICY "Users can view actions of their company" ON actions
  FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can insert actions for their company" ON actions
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can update actions of their company" ON actions
  FOR UPDATE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can delete actions of their company" ON actions
  FOR DELETE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Time Entries
CREATE POLICY "Users can view time_entries of their company" ON time_entries
  FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can insert time_entries for their company" ON time_entries
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can update time_entries of their company" ON time_entries
  FOR UPDATE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can delete time_entries of their company" ON time_entries
  FOR DELETE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Parts Used
CREATE POLICY "Users can view parts_used of their company" ON parts_used
  FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can insert parts_used for their company" ON parts_used
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can update parts_used of their company" ON parts_used
  FOR UPDATE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can delete parts_used of their company" ON parts_used
  FOR DELETE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Action Notes
CREATE POLICY "Users can view action_notes of their company" ON action_notes
  FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can insert action_notes for their company" ON action_notes
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can update action_notes of their company" ON action_notes
  FOR UPDATE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can delete action_notes of their company" ON action_notes
  FOR DELETE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Approvals
CREATE POLICY "Users can view approvals of their company" ON approvals
  FOR SELECT USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can insert approvals for their company" ON approvals
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can update approvals of their company" ON approvals
  FOR UPDATE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can delete approvals of their company" ON approvals
  FOR DELETE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Template Fields (viewable by all, system managed)
CREATE POLICY "Anyone can view template_fields" ON template_fields
  FOR SELECT USING (true);

-- Action Templates (master templates viewable by all, company templates by company)
CREATE POLICY "Users can view master or their company templates" ON action_templates
  FOR SELECT USING (is_master = true OR company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can insert templates for their company" ON action_templates
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can update templates of their company" ON action_templates
  FOR UPDATE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can delete templates of their company" ON action_templates
  FOR DELETE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Service Templates
CREATE POLICY "Users can view master or their company service templates" ON service_templates
  FOR SELECT USING (is_master = true OR company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can insert service templates for their company" ON service_templates
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can update service templates of their company" ON service_templates
  FOR UPDATE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can delete service templates of their company" ON service_templates
  FOR DELETE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Project Templates
CREATE POLICY "Users can view master or their company project templates" ON project_templates
  FOR SELECT USING (is_master = true OR company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can insert project templates for their company" ON project_templates
  FOR INSERT WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can update project templates of their company" ON project_templates
  FOR UPDATE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
CREATE POLICY "Users can delete project templates of their company" ON project_templates
  FOR DELETE USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- ===================
-- TRIGGERS
-- ===================
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_actions_updated_at BEFORE UPDATE ON actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parts_used_updated_at BEFORE UPDATE ON parts_used
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_notes_updated_at BEFORE UPDATE ON action_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approvals_updated_at BEFORE UPDATE ON approvals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_fields_updated_at BEFORE UPDATE ON template_fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_templates_updated_at BEFORE UPDATE ON action_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_templates_updated_at BEFORE UPDATE ON service_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_templates_updated_at BEFORE UPDATE ON project_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================
-- SEED MASTER TEMPLATES
-- ===================

-- Seed Template Fields
INSERT INTO template_fields (code, label, description, field_type, category, is_system) VALUES
  ('start_time', 'Start Time', 'When work started', 'datetime', 'timing', true),
  ('end_time', 'End Time', 'When work ended', 'datetime', 'timing', true),
  ('duration', 'Duration', 'Time spent on action', 'number', 'timing', true),
  ('photos', 'Photos', 'Photo evidence', 'file', 'evidence', true),
  ('signature', 'Signature', 'Customer/tech signature', 'signature', 'approval', true),
  ('checklist', 'Checklist', 'Task checklist', 'checklist', 'tracking', true),
  ('notes', 'Notes', 'Additional notes', 'text', 'tracking', true),
  ('parts_used', 'Parts Used', 'Materials consumed', 'multiselect', 'tracking', true),
  ('root_cause', 'Root Cause', 'Issue root cause', 'text', 'tracking', true),
  ('resolution', 'Resolution', 'How issue was resolved', 'text', 'tracking', true),
  ('pass_fail', 'Pass/Fail', 'Inspection result', 'select', 'tracking', true),
  ('measurements', 'Measurements', 'Site measurements', 'text', 'tracking', true),
  ('attendees', 'Attendees', 'Training attendees', 'number', 'tracking', true),
  ('gps_location', 'GPS Location', 'Location coordinates', 'text', 'evidence', true)
ON CONFLICT (code) DO NOTHING;

-- Seed Master Action Templates
INSERT INTO action_templates (name, code, description, action_type, is_master, fields_config, workflow_config, estimated_duration_minutes) VALUES
  ('Installation', 'install', 'Install new equipment or system', 'install', true,
   '[{"code": "end_time", "required": true}, {"code": "photos", "required": true}, {"code": "checklist", "required": true}, {"code": "signature", "required": false}]',
   '{"time_tracking": "end_only", "parts_tracking": true, "photos_required": true}', 60),

  ('Repair', 'repair', 'Fix broken equipment or system', 'repair', true,
   '[{"code": "start_time", "required": true}, {"code": "end_time", "required": true}, {"code": "root_cause", "required": true}, {"code": "resolution", "required": true}, {"code": "photos", "required": false}]',
   '{"time_tracking": "both", "parts_tracking": true, "photos_required": false}', 45),

  ('Inspection', 'inspect', 'Inspect equipment or site', 'inspect', true,
   '[{"code": "checklist", "required": true}, {"code": "pass_fail", "required": true}, {"code": "photos", "required": true}, {"code": "notes", "required": false}]',
   '{"time_tracking": "end_only", "parts_tracking": false, "photos_required": true}', 30),

  ('Survey', 'survey', 'Site survey and assessment', 'survey', true,
   '[{"code": "measurements", "required": true}, {"code": "photos", "required": true}, {"code": "notes", "required": true}]',
   '{"time_tracking": "both", "parts_tracking": false, "photos_required": true}', 60),

  ('Training', 'train', 'Train staff or users', 'train', true,
   '[{"code": "attendees", "required": true}, {"code": "duration", "required": true}, {"code": "signature", "required": true}]',
   '{"time_tracking": "both", "parts_tracking": false, "photos_required": false, "signature_required": true}', 120),

  ('Removal', 'remove', 'Remove equipment or system', 'remove', true,
   '[{"code": "end_time", "required": true}, {"code": "photos", "required": true}, {"code": "checklist", "required": true}]',
   '{"time_tracking": "end_only", "parts_tracking": true, "photos_required": true}', 45),

  ('Preventive Maintenance', 'maintain', 'Scheduled maintenance check', 'maintain', true,
   '[{"code": "checklist", "required": true}, {"code": "pass_fail", "required": true}, {"code": "notes", "required": false}, {"code": "photos", "required": false}]',
   '{"time_tracking": "both", "parts_tracking": true, "photos_required": false}', 45),

  ('Configuration', 'configure', 'Configure or update settings', 'configure', true,
   '[{"code": "start_time", "required": true}, {"code": "end_time", "required": true}, {"code": "notes", "required": true}]',
   '{"time_tracking": "both", "parts_tracking": false, "photos_required": false}', 30);

-- Seed Master Project Templates
INSERT INTO project_templates (name, code, description, contract_type, is_master, default_billing_model, workflow_config) VALUES
  ('Deployment Project', 'deployment', 'New equipment/system deployment', 'deployment', true, 'fixed',
   '{"status_flow": ["draft", "active", "on_hold", "completed", "cancelled"], "require_start_date": true, "require_end_date": true}'),

  ('Maintenance Contract', 'maintenance', 'Ongoing maintenance agreement', 'maintenance', true, 'per_visit',
   '{"status_flow": ["draft", "active", "on_hold", "completed", "cancelled"], "require_start_date": true, "require_end_date": true}'),

  ('Break-Fix', 'break-fix', 'Ad-hoc repair and support', 'break-fix', true, 'time_and_materials',
   '{"status_flow": ["draft", "active", "completed", "cancelled"], "require_start_date": false, "require_end_date": false}'),

  ('Ad-hoc Service', 'ad-hoc', 'One-time service request', 'ad-hoc', true, 'per_action',
   '{"status_flow": ["active", "completed", "cancelled"], "require_start_date": false, "require_end_date": false}');

-- Seed Master Service Templates
INSERT INTO service_templates (name, code, description, is_master, merge_config, workflow_config) VALUES
  ('Standard Service Visit', 'standard', 'Regular scheduled service visit', true,
   '{"enabled": true, "mode": "suggest", "window_hours": 24, "status_allowed": ["scheduled"], "max_actions": 10}',
   '{"urgency_options": ["scheduled", "same_day", "emergency"], "default_urgency": "scheduled"}'),

  ('Emergency Service', 'emergency', 'Urgent unscheduled service', true,
   '{"enabled": false, "mode": "manual", "window_hours": 4, "status_allowed": ["scheduled"], "max_actions": 3}',
   '{"urgency_options": ["same_day", "emergency"], "default_urgency": "emergency"}'),

  ('Survey Visit', 'survey', 'Site survey and assessment visit', true,
   '{"enabled": false, "mode": "manual", "window_hours": 0, "status_allowed": [], "max_actions": 1}',
   '{"urgency_options": ["scheduled"], "default_urgency": "scheduled"}');
