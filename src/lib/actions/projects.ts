'use server'

import { createClient } from '@/lib/supabase/server-client'
import { revalidatePath } from 'next/cache'
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectStats,
} from '@/types/projects'

// Get current user's company_id
async function getCompanyId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  return userData?.company_id || null
}

// ============ PROJECTS ============

export async function getProjects(): Promise<{ data: Project[] | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      location:locations(id, name, code, city, country)
    `)
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return { data: null, error: error.message }
  }

  // Get services count for each project
  const projectIds = data?.map(p => p.id) || []
  if (projectIds.length > 0) {
    const { data: servicesCounts } = await supabase
      .from('services')
      .select('project_id')
      .in('project_id', projectIds)

    const countsMap = new Map<string, number>()
    servicesCounts?.forEach(s => {
      countsMap.set(s.project_id, (countsMap.get(s.project_id) || 0) + 1)
    })

    data?.forEach(project => {
      project.services_count = countsMap.get(project.id) || 0
    })
  }

  return { data, error: null }
}

export async function getProjectsByLocation(locationId: string): Promise<{ data: Project[] | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      location:locations(id, name, code, city, country)
    `)
    .eq('company_id', companyId)
    .eq('location_id', locationId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects by location:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getProject(id: string): Promise<{ data: Project | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      location:locations(id, name, code, city, country)
    `)
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    return { data: null, error: error.message }
  }

  // Get services count
  const { count } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', id)

  if (data) {
    data.services_count = count || 0
  }

  return { data, error: null }
}

export async function createProject(
  input: CreateProjectInput
): Promise<{ data: Project | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()
  const { data: { user } } = await supabase.auth.getUser()

  if (!companyId || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  // Verify location belongs to this company and get country info for project ID
  const { data: location } = await supabase
    .from('locations')
    .select('id, country')
    .eq('id', input.location_id)
    .eq('company_id', companyId)
    .single()

  if (!location) {
    return { data: null, error: 'Location not found' }
  }

  // Fetch project type from library
  const { data: projectTypeItem } = await supabase
    .from('library_items')
    .select('id, name, code')
    .eq('id', input.project_type_id)
    .single()

  if (!projectTypeItem) {
    return { data: null, error: 'Project type not found' }
  }

  // Generate project ID using the database function
  // Format: TYPE_COUNTRY_DDMMYY_SEQ (e.g., DEP_FR_151224_001)
  const { data: projectIdResult, error: projectIdError } = await supabase
    .rpc('generate_project_id', {
      p_company_id: companyId,
      p_project_type: projectTypeItem.name,
      p_project_type_code: projectTypeItem.code || null,
      p_country_code: location.country || null,
      p_country_name: location.country || null,
      p_date: new Date().toISOString().split('T')[0],
    })

  if (projectIdError) {
    console.error('Error generating project ID:', projectIdError)
    // Continue without project_id if RPC fails (e.g., migration not run yet)
  }

  // Use project_id as the name, or fallback to input.name or a generated name
  const projectName = projectIdResult || input.name || `Project ${new Date().toISOString().split('T')[0]}`

  // Convert empty strings to null for optional fields
  const sanitizedInput = {
    company_id: companyId,
    location_id: input.location_id,
    name: projectName,
    description: input.description || null,
    project_id: projectIdResult || null,
    project_type: projectTypeItem.name,
    project_type_id: input.project_type_id,
    billing_model: input.billing_model || 'fixed',
    sla_tier: input.sla_tier || 'standard',
    status: input.status || 'draft',
    priority: input.priority || 'medium',
    start_date: input.start_date || null,
    target_end_date: input.target_end_date || null,
    estimated_value: input.estimated_value || null,
    currency: input.currency || 'EUR',
    // Client Info is at Location level, not Project level
    notes: input.notes || null,
    metadata: input.metadata || {},
    config: {},
    created_by: user.id,
  }

  const { data, error } = await supabase
    .from('projects')
    .insert(sanitizedInput)
    .select(`
      *,
      location:locations(id, name, code, city, country)
    `)
    .single()

  if (error) {
    console.error('Error creating project:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath('/locations')
  return { data, error: null }
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput
): Promise<{ data: Project | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  // If changing location, verify new location belongs to this company
  if (input.location_id) {
    const { data: location } = await supabase
      .from('locations')
      .select('id')
      .eq('id', input.location_id)
      .eq('company_id', companyId)
      .single()

    if (!location) {
      return { data: null, error: 'Location not found' }
    }
  }

  // Sanitize input - convert empty strings to null for optional fields
  const sanitizedInput: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  // Only include fields that are provided, converting empty strings to null
  if (input.location_id !== undefined) sanitizedInput.location_id = input.location_id
  if (input.name !== undefined) sanitizedInput.name = input.name
  if (input.description !== undefined) sanitizedInput.description = input.description || null
  // code field removed - replaced by project_id
  if (input.project_type_id !== undefined) sanitizedInput.project_type_id = input.project_type_id
  if (input.billing_model !== undefined) sanitizedInput.billing_model = input.billing_model
  if (input.sla_tier !== undefined) sanitizedInput.sla_tier = input.sla_tier
  if (input.status !== undefined) sanitizedInput.status = input.status
  if (input.priority !== undefined) sanitizedInput.priority = input.priority
  if (input.start_date !== undefined) sanitizedInput.start_date = input.start_date || null
  if (input.target_end_date !== undefined) sanitizedInput.target_end_date = input.target_end_date || null
  if (input.actual_end_date !== undefined) sanitizedInput.actual_end_date = input.actual_end_date || null
  if (input.estimated_value !== undefined) sanitizedInput.estimated_value = input.estimated_value || null
  if (input.actual_value !== undefined) sanitizedInput.actual_value = input.actual_value || null
  if (input.currency !== undefined) sanitizedInput.currency = input.currency
  // Client Info is at Location level, not Project level
  if (input.notes !== undefined) sanitizedInput.notes = input.notes || null
  if (input.metadata !== undefined) sanitizedInput.metadata = input.metadata

  const { data, error } = await supabase
    .from('projects')
    .update(sanitizedInput)
    .eq('id', id)
    .eq('company_id', companyId)
    .select(`
      *,
      location:locations(id, name, code, city, country)
    `)
    .single()

  if (error) {
    console.error('Error updating project:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath('/locations')
  return { data, error: null }
}

export async function deleteProject(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { error: 'Not authenticated' }
  }

  // Check if project has services
  const { count } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', id)

  if (count && count > 0) {
    return { error: 'Cannot delete project with existing services. Please delete or reassign services first.' }
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) {
    console.error('Error deleting project:', error)
    return { error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath('/locations')
  return { error: null }
}

export async function getProjectStats(): Promise<{ data: ProjectStats | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('projects')
    .select('status')
    .eq('company_id', companyId)

  if (error) {
    console.error('Error fetching project stats:', error)
    return { data: null, error: error.message }
  }

  const stats: ProjectStats = {
    total: data.length,
    active: data.filter(p => p.status === 'active').length,
    draft: data.filter(p => p.status === 'draft').length,
    completed: data.filter(p => p.status === 'completed').length,
    onHold: data.filter(p => p.status === 'on_hold').length,
  }

  return { data: stats, error: null }
}

// Get locations for dropdown (simple list)
export async function getLocationsForSelect(): Promise<{
  data: Array<{ id: string; name: string; code?: string; city?: string }> | null
  error: string | null
}> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('locations')
    .select('id, name, code, city')
    .eq('company_id', companyId)
    .eq('status', 'active')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching locations for select:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// Get project types from library for dropdown
export async function getProjectTypesForSelect(): Promise<{
  data: Array<{ id: string; name: string; code?: string }> | null
  error: string | null
}> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  // First get the project_types category
  const { data: category, error: categoryError } = await supabase
    .from('library_categories')
    .select('id')
    .eq('slug', 'project_types')
    .single()

  if (categoryError || !category) {
    console.error('Error fetching project_types category:', categoryError)
    return { data: null, error: 'Project types category not found' }
  }

  // Then fetch project types for this company
  const { data, error } = await supabase
    .from('library_items')
    .select('id, name, code')
    .eq('company_id', companyId)
    .eq('category_id', category.id)
    .is('parent_id', null)  // Only top-level items (not services)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching project types:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
