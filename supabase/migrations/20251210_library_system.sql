-- =====================================================
-- FOX NETWORK: Library System
-- Allows clients to manage reusable items like
-- Countries, Clients, and other configurable lists
-- =====================================================

-- ===================
-- LIBRARY CATEGORIES
-- Defines the types of library items (countries, clients, etc.)
-- ===================
CREATE TABLE IF NOT EXISTS library_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Category identification
  slug VARCHAR(100) NOT NULL UNIQUE,        -- e.g., 'countries', 'clients'
  name VARCHAR(255) NOT NULL,               -- Display name: 'Countries', 'Clients'
  description TEXT,
  icon VARCHAR(50),                         -- Lucide icon name for UI

  -- Configuration
  is_system BOOLEAN DEFAULT false,          -- true = platform-defined, cannot be deleted
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,

  -- Nesting configuration
  supports_nesting BOOLEAN DEFAULT false,   -- true = items can have children (e.g., project_types)
  child_label VARCHAR(100),                 -- Label for child items (e.g., 'Services' for project_types)

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================
-- LIBRARY ITEMS
-- The actual items in each category (per company)
-- Supports nested items via parent_id (e.g., services under project types)
-- ===================
CREATE TABLE IF NOT EXISTS library_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES library_categories(id) ON DELETE CASCADE,

  -- Nesting support (for services under project types)
  parent_id UUID REFERENCES library_items(id) ON DELETE CASCADE,  -- NULL = top-level item

  -- Item data
  name VARCHAR(255) NOT NULL,               -- Primary display name
  code VARCHAR(100),                        -- Optional code (e.g., country code 'FR', client code 'CLI001')
  description TEXT,

  -- Additional data stored as JSON for flexibility
  metadata JSONB DEFAULT '{}',              -- e.g., {"phone": "+33...", "address": "..."}

  -- Status
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,              -- For ordering items and services in sequence

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),

  -- Ensure unique names per company per category per parent
  UNIQUE(company_id, category_id, parent_id, name)
);

-- ===================
-- INDEXES
-- ===================
CREATE INDEX IF NOT EXISTS idx_library_items_company ON library_items(company_id);
CREATE INDEX IF NOT EXISTS idx_library_items_category ON library_items(category_id);
CREATE INDEX IF NOT EXISTS idx_library_items_parent ON library_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_library_items_active ON library_items(is_active);
CREATE INDEX IF NOT EXISTS idx_library_categories_slug ON library_categories(slug);

-- ===================
-- SEED DEFAULT CATEGORIES
-- ===================
INSERT INTO library_categories (slug, name, description, icon, is_system, display_order, supports_nesting, child_label) VALUES
  ('clients', 'Clients', 'List of clients or customers your company serves', 'Users', true, 1, false, NULL),
  ('countries', 'Countries', 'List of countries where you operate or serve', 'Globe', true, 2, false, NULL),
  ('project_types', 'Project Types', 'Types of projects like Deployment, Maintenance, etc.', 'FolderKanban', true, 3, true, 'Services')
ON CONFLICT (slug) DO UPDATE SET
  supports_nesting = EXCLUDED.supports_nesting,
  child_label = EXCLUDED.child_label;

-- ===================
-- RLS POLICIES
-- ===================
ALTER TABLE library_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_items ENABLE ROW LEVEL SECURITY;

-- Categories are readable by all authenticated users (platform-wide)
DROP POLICY IF EXISTS "Library categories are viewable by authenticated users" ON library_categories;
CREATE POLICY "Library categories are viewable by authenticated users"
  ON library_categories FOR SELECT
  TO authenticated
  USING (true);

-- Items are company-scoped
DROP POLICY IF EXISTS "Users can view their company library items" ON library_items;
CREATE POLICY "Users can view their company library items"
  ON library_items FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert their company library items" ON library_items;
CREATE POLICY "Users can insert their company library items"
  ON library_items FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can update their company library items" ON library_items;
CREATE POLICY "Users can update their company library items"
  ON library_items FOR UPDATE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete their company library items" ON library_items;
CREATE POLICY "Users can delete their company library items"
  ON library_items FOR DELETE
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));
