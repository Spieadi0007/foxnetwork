'use server'

import { createClient } from '@/lib/supabase/server-client'
import { revalidatePath } from 'next/cache'
import type {
  ProjectAutoRule,
  CreateProjectAutoRuleInput,
  UpdateProjectAutoRuleInput,
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

// ============ PROJECT AUTO RULES CRUD ============

export async function getProjectAutoRules(): Promise<{
  data: ProjectAutoRule[] | null
  error: string | null
}> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('project_auto_rules')
    .select(`
      *,
      project_type:library_items!project_type_id(id, name, code),
      default_step:library_items!default_step_id(id, name),
      default_step_status:library_items!default_step_status_id(id, name)
    `)
    .eq('company_id', companyId)
    .order('priority', { ascending: true })

  if (error) {
    console.error('Error fetching project auto rules:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getProjectAutoRule(id: string): Promise<{
  data: ProjectAutoRule | null
  error: string | null
}> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('project_auto_rules')
    .select(`
      *,
      project_type:library_items!project_type_id(id, name, code),
      default_step:library_items!default_step_id(id, name),
      default_step_status:library_items!default_step_status_id(id, name)
    `)
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (error) {
    console.error('Error fetching project auto rule:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function createProjectAutoRule(
  input: CreateProjectAutoRuleInput
): Promise<{ data: ProjectAutoRule | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()
  const { data: { user } } = await supabase.auth.getUser()

  if (!companyId || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  // Validate project type exists
  const { data: projectType } = await supabase
    .from('library_items')
    .select('id, name')
    .eq('id', input.project_type_id)
    .eq('company_id', companyId)
    .single()

  if (!projectType) {
    return { data: null, error: 'Project type not found' }
  }

  // Validate step if provided
  if (input.default_step_id) {
    const { data: step } = await supabase
      .from('library_items')
      .select('id')
      .eq('id', input.default_step_id)
      .eq('company_id', companyId)
      .single()

    if (!step) {
      return { data: null, error: 'Default step not found' }
    }
  }

  const { data, error } = await supabase
    .from('project_auto_rules')
    .insert({
      company_id: companyId,
      name: input.name,
      description: input.description || null,
      project_type_id: input.project_type_id,
      default_step_id: input.default_step_id || null,
      default_step_status_id: input.default_step_status_id || null,
      default_billing_model: input.default_billing_model || 'fixed',
      default_sla_tier: input.default_sla_tier || 'standard',
      default_priority: input.default_priority || 'medium',
      conditions: input.conditions,
      is_active: input.is_active ?? true,
      priority: input.priority ?? 0,
      prevent_duplicates: input.prevent_duplicates ?? true,
      created_by: user.id,
    })
    .select(`
      *,
      project_type:library_items!project_type_id(id, name, code),
      default_step:library_items!default_step_id(id, name),
      default_step_status:library_items!default_step_status_id(id, name)
    `)
    .single()

  if (error) {
    console.error('Error creating project auto rule:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/projects/settings')
  revalidatePath('/locations')
  return { data, error: null }
}

export async function updateProjectAutoRule(
  id: string,
  input: UpdateProjectAutoRuleInput
): Promise<{ data: ProjectAutoRule | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  // Validate project type if provided
  if (input.project_type_id) {
    const { data: projectType } = await supabase
      .from('library_items')
      .select('id')
      .eq('id', input.project_type_id)
      .eq('company_id', companyId)
      .single()

    if (!projectType) {
      return { data: null, error: 'Project type not found' }
    }
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.project_type_id !== undefined) updateData.project_type_id = input.project_type_id
  if (input.default_step_id !== undefined) updateData.default_step_id = input.default_step_id || null
  if (input.default_step_status_id !== undefined) updateData.default_step_status_id = input.default_step_status_id || null
  if (input.default_billing_model !== undefined) updateData.default_billing_model = input.default_billing_model
  if (input.default_sla_tier !== undefined) updateData.default_sla_tier = input.default_sla_tier
  if (input.default_priority !== undefined) updateData.default_priority = input.default_priority
  if (input.conditions !== undefined) updateData.conditions = input.conditions
  if (input.is_active !== undefined) updateData.is_active = input.is_active
  if (input.priority !== undefined) updateData.priority = input.priority
  if (input.prevent_duplicates !== undefined) updateData.prevent_duplicates = input.prevent_duplicates

  const { data, error } = await supabase
    .from('project_auto_rules')
    .update(updateData)
    .eq('id', id)
    .eq('company_id', companyId)
    .select(`
      *,
      project_type:library_items!project_type_id(id, name, code),
      default_step:library_items!default_step_id(id, name),
      default_step_status:library_items!default_step_status_id(id, name)
    `)
    .single()

  if (error) {
    console.error('Error updating project auto rule:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/projects/settings')
  revalidatePath('/locations')
  return { data, error: null }
}

export async function deleteProjectAutoRule(id: string): Promise<{
  success: boolean
  error: string | null
}> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('project_auto_rules')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) {
    console.error('Error deleting project auto rule:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/projects/settings')
  revalidatePath('/locations')
  return { success: true, error: null }
}

// Toggle rule active status
export async function toggleProjectAutoRule(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error: string | null }> {
  const result = await updateProjectAutoRule(id, { is_active: isActive })
  return { success: !result.error, error: result.error }
}
