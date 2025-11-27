// Business type - selected during onboarding (stored on company)
export type CompanyType = 'client' | 'partner'

// Account role within the company
export type AccountRole = 'admin' | 'member' | 'viewer'

export interface Company {
  id: string
  name: string
  type: CompanyType | null
  website: string | null
  logo: string | null
  country: string | null
  description: string | null
  industry: string | null
  size: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface CompanyInsert {
  name: string
  type?: CompanyType | null
  website?: string | null
  logo?: string | null
  country?: string | null
  description?: string | null
  industry?: string | null
  size?: string | null
  created_by?: string | null
}

export interface CompanyUpdate {
  name?: string
  type?: CompanyType | null
  website?: string | null
  logo?: string | null
  country?: string | null
  description?: string | null
  industry?: string | null
  size?: string | null
}

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: AccountRole | null
  company_id: string | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
  // Joined data
  company?: Company | null
}

export interface UserInsert {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  role?: AccountRole | null
}

export interface UserUpdate {
  full_name?: string | null
  avatar_url?: string | null
  role?: AccountRole | null
  company_id?: string | null
  onboarding_completed?: boolean
}

// Used during onboarding form
export interface CompanyInfo {
  name: string
  logo: string | null
  website: string
  country: string
  description: string | null
  industry: string | null
  size: string | null
}
