-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('client', 'partner')),
  website TEXT,
  logo TEXT,
  country TEXT,
  description TEXT,
  industry TEXT,
  size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create indexes for companies
CREATE INDEX IF NOT EXISTS companies_name_idx ON public.companies(name);
CREATE INDEX IF NOT EXISTS companies_website_idx ON public.companies(website);
CREATE INDEX IF NOT EXISTS companies_country_idx ON public.companies(country);

-- Add company reference and onboarding status to users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Create index for user-company lookups
CREATE INDEX IF NOT EXISTS users_company_id_idx ON public.users(company_id);

-- Remove old company fields from users table (if they exist)
ALTER TABLE public.users
DROP COLUMN IF EXISTS company_name,
DROP COLUMN IF EXISTS company_logo,
DROP COLUMN IF EXISTS company_website,
DROP COLUMN IF EXISTS country,
DROP COLUMN IF EXISTS company_description,
DROP COLUMN IF EXISTS company_industry,
DROP COLUMN IF EXISTS company_size;

-- Drop old indexes if they exist
DROP INDEX IF EXISTS users_company_name_idx;
DROP INDEX IF EXISTS users_country_idx;

-- Enable RLS on companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own company
CREATE POLICY "Users can view own company"
  ON public.companies
  FOR SELECT
  USING (
    id IN (SELECT company_id FROM public.users WHERE id = auth.uid())
  );

-- Policy: Users can insert companies (during onboarding)
CREATE POLICY "Users can create companies"
  ON public.companies
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Users can update their own company
CREATE POLICY "Users can update own company"
  ON public.companies
  FOR UPDATE
  USING (
    id IN (SELECT company_id FROM public.users WHERE id = auth.uid())
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
