'use server'

import { createClient } from '@/lib/supabase/server-client'
import { revalidatePath } from 'next/cache'
import type {
  Service,
  CreateServiceInput,
  UpdateServiceInput,
  ServiceStats,
} from '@/types/projects'
import type { StepCondition, StepConditionsConfig } from '@/types/library'

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

// ============ SERVICES ============

export async function getServices(): Promise<{ data: Service[] | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      project:projects(id, name, project_id, project_type, project_type_id),
      location:locations(id, name, code, city, country)
    `)
    .eq('company_id', companyId)
    .order('scheduled_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching services:', error)
    return { data: null, error: error.message }
  }

  // Get actions count for each service
  const serviceIds = data?.map(s => s.id) || []
  if (serviceIds.length > 0) {
    const { data: actionsCounts } = await supabase
      .from('actions')
      .select('service_id')
      .in('service_id', serviceIds)

    const countsMap = new Map<string, number>()
    actionsCounts?.forEach(a => {
      countsMap.set(a.service_id, (countsMap.get(a.service_id) || 0) + 1)
    })

    data?.forEach(service => {
      service.actions_count = countsMap.get(service.id) || 0
    })
  }

  return { data, error: null }
}

export async function getServicesByProject(projectId: string): Promise<{ data: Service[] | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      project:projects(id, name, project_id, project_type, project_type_id),
      location:locations(id, name, code, city, country)
    `)
    .eq('company_id', companyId)
    .eq('project_id', projectId)
    .order('scheduled_date', { ascending: true })

  if (error) {
    console.error('Error fetching services by project:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getServicesByLocation(locationId: string): Promise<{ data: Service[] | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      project:projects(id, name, project_id, project_type, project_type_id),
      location:locations(id, name, code, city, country)
    `)
    .eq('company_id', companyId)
    .eq('location_id', locationId)
    .order('scheduled_date', { ascending: true })

  if (error) {
    console.error('Error fetching services by location:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getService(id: string): Promise<{ data: Service | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      project:projects(id, name, project_id, project_type, project_type_id),
      location:locations(id, name, code, city, country)
    `)
    .eq('id', id)
    .eq('company_id', companyId)
    .single()

  if (error) {
    console.error('Error fetching service:', error)
    return { data: null, error: error.message }
  }

  // Get actions count
  const { count } = await supabase
    .from('actions')
    .select('*', { count: 'exact', head: true })
    .eq('service_id', id)

  if (data) {
    data.actions_count = count || 0
  }

  return { data, error: null }
}

export async function createService(
  input: CreateServiceInput
): Promise<{ data: Service | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()
  const { data: { user } } = await supabase.auth.getUser()

  if (!companyId || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  // Project is required - verify it belongs to this company and get location info
  if (!input.project_id) {
    return { data: null, error: 'Project is required' }
  }

  const { data: project } = await supabase
    .from('projects')
    .select(`
      id,
      project_type,
      project_type_id,
      location_id,
      location:locations(id, country)
    `)
    .eq('id', input.project_id)
    .eq('company_id', companyId)
    .single()

  if (!project) {
    return { data: null, error: 'Project not found' }
  }

  // Get project type code from library if available
  let projectTypeCode: string | null = null
  if (project.project_type_id) {
    const { data: projectTypeItem } = await supabase
      .from('library_items')
      .select('code')
      .eq('id', project.project_type_id)
      .single()
    projectTypeCode = projectTypeItem?.code || null
  }

  // Validate and get service type from library (if provided)
  let serviceTypeName: string | null = null
  if (input.service_type_id) {
    const { data: serviceTypeItem } = await supabase
      .from('library_items')
      .select('id, name, parent_id')
      .eq('id', input.service_type_id)
      .eq('company_id', companyId)
      .single()

    if (!serviceTypeItem) {
      return { data: null, error: 'Service type not found' }
    }

    // Verify service type is a child of the project type
    if (project.project_type_id && serviceTypeItem.parent_id !== project.project_type_id) {
      return { data: null, error: 'Service type must belong to the project type' }
    }

    serviceTypeName = serviceTypeItem.name
  }

  // Validate and get workflow step from library (if provided)
  // Or auto-suggest based on conditions if not provided
  let stepName: string | null = null
  let stepId: string | null = input.step_id || null

  if (input.step_id) {
    // User provided a step - validate it
    const { data: stepItem } = await supabase
      .from('library_items')
      .select('id, name')
      .eq('id', input.step_id)
      .eq('company_id', companyId)
      .single()

    if (stepItem) {
      stepName = stepItem.name
    }
  } else {
    // No step provided - try to auto-suggest based on conditions
    const serviceDataForEval = {
      project_id: input.project_id,
      service_type_id: input.service_type_id,
      primary_technician_id: input.primary_technician_id,
      assigned_technicians: input.assigned_technicians,
      scheduled_date: input.scheduled_date,
      scheduled_start_time: input.scheduled_start_time,
      scheduled_end_time: input.scheduled_end_time,
      status: input.status || 'scheduled',
      urgency: input.urgency || 'scheduled',
      departure_time: input.departure_time,
      arrival_time: input.arrival_time,
      started_at: null,  // New service - not started yet
      completed_at: null,
      customer_signature: input.customer_signature,
      technician_signature: input.technician_signature,
    }

    const { data: suggestedStep } = await suggestWorkflowStepInternal(companyId, serviceDataForEval)
    if (suggestedStep) {
      stepId = suggestedStep.id
      stepName = suggestedStep.name
    }
  }

  // Validate and get step status from library (if provided)
  let stepStatusName: string | null = null
  if (input.step_status_id) {
    const { data: stepStatusItem } = await supabase
      .from('library_items')
      .select('id, name')
      .eq('id', input.step_status_id)
      .eq('company_id', companyId)
      .single()

    if (stepStatusItem) {
      stepStatusName = stepStatusItem.name
    }
  }

  // Get location country (handle array from join)
  const locationData = Array.isArray(project.location) ? project.location[0] : project.location
  const countryCode = locationData?.country || null

  // Generate service ID using the database function
  // Format: SVC_{TYPE}_{COUNTRY}_{DDMMYY}_{SEQ}
  const { data: serviceIdResult, error: serviceIdError } = await supabase
    .rpc('generate_service_id', {
      p_company_id: companyId,
      p_project_type: project.project_type || null,
      p_project_type_code: projectTypeCode,
      p_country_code: countryCode,
      p_country_name: countryCode,
      p_date: new Date().toISOString().split('T')[0],
    })

  if (serviceIdError) {
    console.error('Error generating service ID:', serviceIdError)
    // Continue without service_id if RPC fails
  }

  // Convert empty strings to null for optional fields
  const sanitizedInput = {
    company_id: companyId,
    project_id: input.project_id,
    location_id: project.location_id,  // Auto-derived from project
    service_id: serviceIdResult || null,
    // Service type from library
    service_type: serviceTypeName,
    service_type_id: input.service_type_id || null,
    // Workflow step and status from library
    step: stepName,
    step_id: stepId,
    step_status: stepStatusName,
    step_status_id: input.step_status_id || null,
    title: input.title || null,
    description: input.description || null,
    reference_number: input.reference_number || null,
    urgency: input.urgency || 'scheduled',
    scheduled_date: input.scheduled_date || null,
    scheduled_start_time: input.scheduled_start_time || null,
    scheduled_end_time: input.scheduled_end_time || null,
    status: input.status || 'scheduled',
    assigned_technicians: input.assigned_technicians || [],
    primary_technician_id: input.primary_technician_id || null,
    // Travel tracking
    departure_time: input.departure_time || null,
    arrival_time: input.arrival_time || null,
    travel_duration: input.travel_duration || null,
    // Parts/Materials
    parts_used: input.parts_used || [],
    // Signatures
    customer_signature: input.customer_signature || null,
    technician_signature: input.technician_signature || null,
    notes: input.notes || null,
    metadata: input.metadata || {},
    config: {},
    created_by: user.id,
  }

  const { data, error } = await supabase
    .from('services')
    .insert(sanitizedInput)
    .select(`
      *,
      project:projects(id, name, project_id, project_type, project_type_id),
      location:locations(id, name, code, city, country)
    `)
    .single()

  if (error) {
    console.error('Error creating service:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/services')
  revalidatePath('/projects')
  return { data, error: null }
}

export async function updateService(
  id: string,
  input: UpdateServiceInput
): Promise<{ data: Service | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  // If changing project, verify new project belongs to this company and get location
  let newLocationId: string | undefined
  let projectTypeId: string | undefined
  if (input.project_id) {
    const { data: project } = await supabase
      .from('projects')
      .select('id, location_id, project_type_id')
      .eq('id', input.project_id)
      .eq('company_id', companyId)
      .single()

    if (!project) {
      return { data: null, error: 'Project not found' }
    }
    // Auto-update location when project changes
    newLocationId = project.location_id
    projectTypeId = project.project_type_id
  }

  // If updating service_type_id, validate and get name
  let serviceTypeName: string | undefined
  if (input.service_type_id !== undefined) {
    if (input.service_type_id) {
      const { data: serviceTypeItem } = await supabase
        .from('library_items')
        .select('id, name, parent_id')
        .eq('id', input.service_type_id)
        .eq('company_id', companyId)
        .single()

      if (!serviceTypeItem) {
        return { data: null, error: 'Service type not found' }
      }

      // If we have project type, verify service type is a child of it
      if (projectTypeId && serviceTypeItem.parent_id !== projectTypeId) {
        return { data: null, error: 'Service type must belong to the project type' }
      }

      serviceTypeName = serviceTypeItem.name
    } else {
      serviceTypeName = undefined // Clear it if empty
    }
  }

  // If updating step_id, get name - OR auto-suggest if fields changed
  let stepName: string | undefined
  let autoSuggestedStepId: string | undefined

  if (input.step_id !== undefined) {
    // User explicitly set a step
    if (input.step_id) {
      const { data: stepItem } = await supabase
        .from('library_items')
        .select('id, name')
        .eq('id', input.step_id)
        .eq('company_id', companyId)
        .single()

      if (stepItem) {
        stepName = stepItem.name
      }
    }
  } else {
    // Step not explicitly set - check if we should auto-suggest based on field changes
    const relevantFieldsChanged =
      input.primary_technician_id !== undefined ||
      input.scheduled_date !== undefined ||
      input.started_at !== undefined ||
      input.completed_at !== undefined ||
      input.status !== undefined ||
      input.customer_signature !== undefined ||
      input.technician_signature !== undefined

    if (relevantFieldsChanged) {
      // Fetch current service to merge with input
      const { data: currentService } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .eq('company_id', companyId)
        .single()

      if (currentService) {
        // Merge current data with input changes
        const mergedData = {
          project_id: input.project_id ?? currentService.project_id,
          service_type_id: input.service_type_id ?? currentService.service_type_id,
          primary_technician_id: input.primary_technician_id ?? currentService.primary_technician_id,
          assigned_technicians: input.assigned_technicians ?? currentService.assigned_technicians,
          scheduled_date: input.scheduled_date ?? currentService.scheduled_date,
          scheduled_start_time: input.scheduled_start_time ?? currentService.scheduled_start_time,
          scheduled_end_time: input.scheduled_end_time ?? currentService.scheduled_end_time,
          status: input.status ?? currentService.status,
          urgency: input.urgency ?? currentService.urgency,
          departure_time: input.departure_time ?? currentService.departure_time,
          arrival_time: input.arrival_time ?? currentService.arrival_time,
          started_at: input.started_at ?? currentService.started_at,
          completed_at: input.completed_at ?? currentService.completed_at,
          customer_signature: input.customer_signature ?? currentService.customer_signature,
          technician_signature: input.technician_signature ?? currentService.technician_signature,
        }

        const { data: suggestedStep } = await suggestWorkflowStepInternal(companyId, mergedData)
        if (suggestedStep) {
          autoSuggestedStepId = suggestedStep.id
          stepName = suggestedStep.name
        }
      }
    }
  }

  // If updating step_status_id, get name
  let stepStatusName: string | undefined
  if (input.step_status_id !== undefined) {
    if (input.step_status_id) {
      const { data: stepStatusItem } = await supabase
        .from('library_items')
        .select('id, name')
        .eq('id', input.step_status_id)
        .eq('company_id', companyId)
        .single()

      if (stepStatusItem) {
        stepStatusName = stepStatusItem.name
      }
    }
  }

  // Sanitize input - convert empty strings to null for optional fields
  const sanitizedInput: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  // Only include fields that are provided, converting empty strings to null
  if (input.project_id !== undefined) {
    sanitizedInput.project_id = input.project_id || null
    // Auto-update location when project changes
    if (newLocationId) {
      sanitizedInput.location_id = newLocationId
    }
  }
  // Service type
  if (input.service_type_id !== undefined) {
    sanitizedInput.service_type_id = input.service_type_id || null
    sanitizedInput.service_type = serviceTypeName || null
  }
  // Workflow step and status
  if (input.step_id !== undefined) {
    sanitizedInput.step_id = input.step_id || null
    sanitizedInput.step = stepName || null
  } else if (autoSuggestedStepId) {
    // Auto-suggested step based on field conditions
    sanitizedInput.step_id = autoSuggestedStepId
    sanitizedInput.step = stepName || null
  }
  if (input.step_status_id !== undefined) {
    sanitizedInput.step_status_id = input.step_status_id || null
    sanitizedInput.step_status = stepStatusName || null
  }
  if (input.title !== undefined) sanitizedInput.title = input.title || null
  if (input.description !== undefined) sanitizedInput.description = input.description || null
  if (input.reference_number !== undefined) sanitizedInput.reference_number = input.reference_number || null
  if (input.urgency !== undefined) sanitizedInput.urgency = input.urgency
  if (input.scheduled_date !== undefined) sanitizedInput.scheduled_date = input.scheduled_date || null
  if (input.scheduled_start_time !== undefined) sanitizedInput.scheduled_start_time = input.scheduled_start_time || null
  if (input.scheduled_end_time !== undefined) sanitizedInput.scheduled_end_time = input.scheduled_end_time || null
  if (input.started_at !== undefined) sanitizedInput.started_at = input.started_at || null
  if (input.completed_at !== undefined) sanitizedInput.completed_at = input.completed_at || null
  if (input.status !== undefined) sanitizedInput.status = input.status
  if (input.assigned_technicians !== undefined) sanitizedInput.assigned_technicians = input.assigned_technicians
  if (input.primary_technician_id !== undefined) sanitizedInput.primary_technician_id = input.primary_technician_id || null
  // Travel tracking
  if (input.departure_time !== undefined) sanitizedInput.departure_time = input.departure_time || null
  if (input.arrival_time !== undefined) sanitizedInput.arrival_time = input.arrival_time || null
  if (input.travel_duration !== undefined) sanitizedInput.travel_duration = input.travel_duration || null
  // Parts/Materials
  if (input.parts_used !== undefined) sanitizedInput.parts_used = input.parts_used || []
  // Signatures
  if (input.customer_signature !== undefined) sanitizedInput.customer_signature = input.customer_signature || null
  if (input.technician_signature !== undefined) sanitizedInput.technician_signature = input.technician_signature || null
  if (input.notes !== undefined) sanitizedInput.notes = input.notes || null
  if (input.metadata !== undefined) sanitizedInput.metadata = input.metadata

  const { data, error } = await supabase
    .from('services')
    .update(sanitizedInput)
    .eq('id', id)
    .eq('company_id', companyId)
    .select(`
      *,
      project:projects(id, name, project_id, project_type, project_type_id),
      location:locations(id, name, code, city, country)
    `)
    .single()

  if (error) {
    console.error('Error updating service:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/services')
  revalidatePath('/projects')
  return { data, error: null }
}

export async function deleteService(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { error: 'Not authenticated' }
  }

  // Check if service has actions
  const { count } = await supabase
    .from('actions')
    .select('*', { count: 'exact', head: true })
    .eq('service_id', id)

  if (count && count > 0) {
    return { error: 'Cannot delete service with existing actions. Please delete or reassign actions first.' }
  }

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) {
    console.error('Error deleting service:', error)
    return { error: error.message }
  }

  revalidatePath('/services')
  revalidatePath('/projects')
  return { error: null }
}

export async function getServiceStats(): Promise<{ data: ServiceStats | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('services')
    .select('status')
    .eq('company_id', companyId)

  if (error) {
    console.error('Error fetching service stats:', error)
    return { data: null, error: error.message }
  }

  const stats: ServiceStats = {
    total: data.length,
    scheduled: data.filter(s => s.status === 'scheduled').length,
    inProgress: data.filter(s => s.status === 'in_progress').length,
    pendingApproval: data.filter(s => s.status === 'pending_approval').length,
    completed: data.filter(s => s.status === 'completed').length,
    cancelled: data.filter(s => s.status === 'cancelled').length,
  }

  return { data: stats, error: null }
}

// Get projects for dropdown (with location and type info)
export async function getProjectsForSelect(): Promise<{
  data: Array<{
    id: string
    name: string
    project_id?: string
    project_type?: string
    location_id: string
    location?: { id: string; name: string; city?: string; country?: string }
  }> | null
  error: string | null
}> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('projects')
    .select('id, name, project_id, project_type, location_id, location:locations(id, name, city, country)')
    .eq('company_id', companyId)
    .in('status', ['draft', 'active'])
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching projects for select:', error)
    return { data: null, error: error.message }
  }

  // Transform data to flatten location (Supabase returns it as array for joins)
  const transformedData = data?.map(project => ({
    ...project,
    location: Array.isArray(project.location) ? project.location[0] : project.location
  }))

  return { data: transformedData, error: null }
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

// Get service types for a project (children of project type in library)
export async function getServiceTypesForProject(projectId: string): Promise<{
  data: Array<{ id: string; name: string; code?: string }> | null
  error: string | null
}> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  // First get the project to find its project_type_id
  const { data: project } = await supabase
    .from('projects')
    .select('project_type_id')
    .eq('id', projectId)
    .eq('company_id', companyId)
    .single()

  if (!project?.project_type_id) {
    return { data: [], error: null } // No project type = no service types
  }

  // Get service types (children of the project type in library)
  const { data, error } = await supabase
    .from('library_items')
    .select('id, name, code')
    .eq('company_id', companyId)
    .eq('parent_id', project.project_type_id)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching service types:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// Get workflow steps from library
export async function getWorkflowSteps(): Promise<{
  data: Array<{ id: string; name: string; code?: string }> | null
  error: string | null
}> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  // Get the workflow_steps category
  const { data: category } = await supabase
    .from('library_categories')
    .select('id')
    .eq('slug', 'workflow_steps')
    .single()

  if (!category) {
    return { data: [], error: null }
  }

  // Get steps from library
  const { data, error } = await supabase
    .from('library_items')
    .select('id, name, code')
    .eq('company_id', companyId)
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching workflow steps:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// Get step statuses from library
export async function getStepStatuses(): Promise<{
  data: Array<{ id: string; name: string; code?: string }> | null
  error: string | null
}> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  // Get the step_statuses category
  const { data: category } = await supabase
    .from('library_categories')
    .select('id')
    .eq('slug', 'step_statuses')
    .single()

  if (!category) {
    return { data: [], error: null }
  }

  // Get statuses from library
  const { data, error } = await supabase
    .from('library_items')
    .select('id, name, code')
    .eq('company_id', companyId)
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching step statuses:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// ============ STEP CONDITION EVALUATION ============

interface WorkflowStepWithConditions {
  id: string
  name: string
  code?: string
  metadata?: {
    step_conditions?: StepConditionsConfig
  }
}

// Get workflow steps with their conditions
export async function getWorkflowStepsWithConditions(): Promise<{
  data: WorkflowStepWithConditions[] | null
  error: string | null
}> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  // Get the workflow_steps category
  const { data: category } = await supabase
    .from('library_categories')
    .select('id')
    .eq('slug', 'workflow_steps')
    .single()

  if (!category) {
    return { data: [], error: null }
  }

  // Get steps from library with metadata
  const { data, error } = await supabase
    .from('library_items')
    .select('id, name, code, metadata')
    .eq('company_id', companyId)
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching workflow steps with conditions:', error)
    return { data: null, error: error.message }
  }

  return { data: data as WorkflowStepWithConditions[], error: null }
}

// Evaluate a single condition against service data
function evaluateCondition(
  condition: StepCondition,
  serviceData: Record<string, unknown>
): boolean {
  const fieldValue = serviceData[condition.field]

  // Check if field is empty (null, undefined, empty string, empty array)
  const isEmpty = (val: unknown): boolean => {
    if (val === null || val === undefined) return true
    if (typeof val === 'string' && val.trim() === '') return true
    if (Array.isArray(val) && val.length === 0) return true
    return false
  }

  switch (condition.operator) {
    case 'is_empty':
      return isEmpty(fieldValue)

    case 'is_not_empty':
      return !isEmpty(fieldValue)

    case 'equals':
      return String(fieldValue) === String(condition.value)

    case 'not_equals':
      return String(fieldValue) !== String(condition.value)

    case 'contains':
      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().includes(String(condition.value).toLowerCase())
      }
      return false

    case 'greater_than':
      if (typeof fieldValue === 'number' && typeof condition.value === 'number') {
        return fieldValue > condition.value
      }
      // For dates, compare as strings (ISO format)
      if (typeof fieldValue === 'string' && typeof condition.value === 'string') {
        return fieldValue > condition.value
      }
      return false

    case 'less_than':
      if (typeof fieldValue === 'number' && typeof condition.value === 'number') {
        return fieldValue < condition.value
      }
      if (typeof fieldValue === 'string' && typeof condition.value === 'string') {
        return fieldValue < condition.value
      }
      return false

    case 'in':
      if (typeof condition.value === 'string') {
        const values = condition.value.split(',').map(v => v.trim())
        return values.includes(String(fieldValue))
      }
      return false

    default:
      return false
  }
}

// Evaluate all conditions for a step
function evaluateStepConditions(
  conditions: StepConditionsConfig | undefined,
  serviceData: Record<string, unknown>
): boolean {
  if (!conditions || !conditions.conditions || conditions.conditions.length === 0) {
    // No conditions defined - this step doesn't auto-match
    return false
  }

  const results = conditions.conditions.map(condition =>
    evaluateCondition(condition, serviceData)
  )

  if (conditions.logic === 'any') {
    // ANY: at least one condition must be true
    return results.some(r => r === true)
  } else {
    // ALL (default): all conditions must be true
    return results.every(r => r === true)
  }
}

// Internal function that takes companyId directly (for use in createService/updateService)
async function suggestWorkflowStepInternal(
  companyId: string,
  serviceData: Record<string, unknown>
): Promise<{ data: { id: string; name: string } | null; error: string | null }> {
  const supabase = await createClient()

  // Get the workflow_steps category
  const { data: category } = await supabase
    .from('library_categories')
    .select('id')
    .eq('slug', 'workflow_steps')
    .single()

  if (!category) {
    return { data: null, error: null }
  }

  // Get steps from library with metadata
  const { data: steps, error } = await supabase
    .from('library_items')
    .select('id, name, code, metadata')
    .eq('company_id', companyId)
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error || !steps) {
    return { data: null, error: error?.message || null }
  }

  // Find the first step whose conditions match
  for (const step of steps) {
    const conditions = (step.metadata as { step_conditions?: StepConditionsConfig })?.step_conditions
    if (evaluateStepConditions(conditions, serviceData)) {
      return { data: { id: step.id, name: step.name }, error: null }
    }
  }

  return { data: null, error: null }
}

// Suggest a workflow step based on service data
export async function suggestWorkflowStep(
  serviceData: Record<string, unknown>
): Promise<{
  data: { id: string; name: string } | null
  error: string | null
}> {
  const { data: steps, error } = await getWorkflowStepsWithConditions()

  if (error || !steps) {
    return { data: null, error: error || 'Failed to fetch workflow steps' }
  }

  // Find the first step whose conditions match
  for (const step of steps) {
    const conditions = step.metadata?.step_conditions
    if (evaluateStepConditions(conditions, serviceData)) {
      return { data: { id: step.id, name: step.name }, error: null }
    }
  }

  // No matching step found
  return { data: null, error: null }
}
