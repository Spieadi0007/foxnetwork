'use server'

import { createClient } from '@/lib/supabase/server-client'
import { revalidatePath } from 'next/cache'
import type {
  ServiceAutoRule,
  CreateServiceAutoRuleInput,
  UpdateServiceAutoRuleInput,
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

// ============ SERVICE AUTO RULES CRUD ============

export async function getServiceAutoRules(): Promise<{
  data: ServiceAutoRule[] | null
  error: string | null
}> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('service_auto_rules')
    .select(`
      *,
      service_type:library_items!service_type_id(id, name),
      default_step:library_items!default_step_id(id, name),
      default_step_status:library_items!default_step_status_id(id, name)
    `)
    .eq('company_id', companyId)
    .order('priority', { ascending: true })

  if (error) {
    console.error('Error fetching service auto rules:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getServiceAutoRule(id: string): Promise<{
  data: ServiceAutoRule | null
  error: string | null
}> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('service_auto_rules')
    .select(`
      *,
      service_type:library_items!service_type_id(id, name),
      default_step:library_items!default_step_id(id, name),
      default_step_status:library_items!default_step_status_id(id, name)
    `)
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (error) {
    console.error('Error fetching service auto rule:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function createServiceAutoRule(
  input: CreateServiceAutoRuleInput
): Promise<{ data: ServiceAutoRule | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()
  const { data: { user } } = await supabase.auth.getUser()

  if (!companyId || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  // Validate service type if provided
  if (input.service_type_id) {
    const { data: serviceType } = await supabase
      .from('library_items')
      .select('id, name')
      .eq('id', input.service_type_id)
      .eq('company_id', companyId)
      .single()

    if (!serviceType) {
      return { data: null, error: 'Service type not found' }
    }
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
    .from('service_auto_rules')
    .insert({
      company_id: companyId,
      name: input.name,
      description: input.description || null,
      service_type_id: input.service_type_id || null,
      default_step_id: input.default_step_id || null,
      default_step_status_id: input.default_step_status_id || null,
      default_urgency: input.default_urgency || 'scheduled',
      default_status: input.default_status || 'scheduled',
      conditions: input.conditions,
      is_active: input.is_active ?? true,
      priority: input.priority ?? 0,
      prevent_duplicates: input.prevent_duplicates ?? true,
      created_by: user.id,
    })
    .select(`
      *,
      service_type:library_items!service_type_id(id, name),
      default_step:library_items!default_step_id(id, name),
      default_step_status:library_items!default_step_status_id(id, name)
    `)
    .single()

  if (error) {
    console.error('Error creating service auto rule:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/services/settings')
  revalidatePath('/projects')
  return { data, error: null }
}

export async function updateServiceAutoRule(
  id: string,
  input: UpdateServiceAutoRuleInput
): Promise<{ data: ServiceAutoRule | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  // Validate service type if provided
  if (input.service_type_id) {
    const { data: serviceType } = await supabase
      .from('library_items')
      .select('id')
      .eq('id', input.service_type_id)
      .eq('company_id', companyId)
      .single()

    if (!serviceType) {
      return { data: null, error: 'Service type not found' }
    }
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.service_type_id !== undefined) updateData.service_type_id = input.service_type_id || null
  if (input.default_step_id !== undefined) updateData.default_step_id = input.default_step_id || null
  if (input.default_step_status_id !== undefined) updateData.default_step_status_id = input.default_step_status_id || null
  if (input.default_urgency !== undefined) updateData.default_urgency = input.default_urgency
  if (input.default_status !== undefined) updateData.default_status = input.default_status
  if (input.conditions !== undefined) updateData.conditions = input.conditions
  if (input.is_active !== undefined) updateData.is_active = input.is_active
  if (input.priority !== undefined) updateData.priority = input.priority
  if (input.prevent_duplicates !== undefined) updateData.prevent_duplicates = input.prevent_duplicates

  const { data, error } = await supabase
    .from('service_auto_rules')
    .update(updateData)
    .eq('id', id)
    .eq('company_id', companyId)
    .select(`
      *,
      service_type:library_items!service_type_id(id, name),
      default_step:library_items!default_step_id(id, name),
      default_step_status:library_items!default_step_status_id(id, name)
    `)
    .single()

  if (error) {
    console.error('Error updating service auto rule:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/services/settings')
  revalidatePath('/projects')
  return { data, error: null }
}

export async function deleteServiceAutoRule(id: string): Promise<{
  success: boolean
  error: string | null
}> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { success: false, error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('service_auto_rules')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) {
    console.error('Error deleting service auto rule:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/services/settings')
  revalidatePath('/projects')
  return { success: true, error: null }
}

// Toggle rule active status
export async function toggleServiceAutoRule(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error: string | null }> {
  const result = await updateServiceAutoRule(id, { is_active: isActive })
  return { success: !result.error, error: result.error }
}
