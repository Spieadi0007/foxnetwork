'use server'

import { createClient } from '@/lib/supabase/server-client'
import { revalidatePath } from 'next/cache'
import type {
  ServiceFieldDefinition,
  ServiceFieldConfig,
  ServiceCustomField,
  ResolvedServiceField,
  CreateServiceCustomFieldInput,
  UpdateServiceFieldConfigInput,
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

// ============ FIELD DEFINITIONS (Platform-wide) ============

export async function getServiceFieldDefinitions(): Promise<{
  data: ServiceFieldDefinition[] | null
  error: string | null
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('service_field_definitions')
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('display_order')

  if (error) {
    console.error('Error fetching service field definitions:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// ============ FIELD CONFIGS (Company-specific) ============

export async function getServiceFieldConfigs(): Promise<{
  data: ServiceFieldConfig[] | null
  error: string | null
}> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('service_field_configs')
    .select(`
      *,
      field_definition:service_field_definitions(*)
    `)
    .eq('company_id', companyId)

  if (error) {
    console.error('Error fetching service field configs:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function upsertServiceFieldConfig(
  input: UpdateServiceFieldConfigInput
): Promise<{ data: ServiceFieldConfig | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('service_field_configs')
    .upsert(
      {
        company_id: companyId,
        field_definition_id: input.field_definition_id,
        is_required: input.is_required,
        is_visible: input.is_visible,
        custom_label: input.custom_label || null,
        custom_placeholder: input.custom_placeholder || null,
        custom_help_text: input.custom_help_text || null,
        display_order: input.display_order,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'company_id,field_definition_id',
      }
    )
    .select(`
      *,
      field_definition:service_field_definitions(*)
    `)
    .single()

  if (error) {
    console.error('Error upserting service field config:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/services')
  revalidatePath('/services/settings')
  return { data, error: null }
}

export async function bulkUpdateServiceFieldConfigs(
  configs: UpdateServiceFieldConfigInput[]
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { error: 'Not authenticated' }
  }

  const upsertData = configs.map((config) => ({
    company_id: companyId,
    field_definition_id: config.field_definition_id,
    is_required: config.is_required,
    is_visible: config.is_visible,
    custom_label: config.custom_label || null,
    custom_placeholder: config.custom_placeholder || null,
    custom_help_text: config.custom_help_text || null,
    display_order: config.display_order,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('service_field_configs')
    .upsert(upsertData, {
      onConflict: 'company_id,field_definition_id',
    })

  if (error) {
    console.error('Error bulk updating service field configs:', error)
    return { error: error.message }
  }

  revalidatePath('/services')
  revalidatePath('/services/settings')
  return { error: null }
}

// ============ CUSTOM FIELDS (Company-specific) ============

export async function getServiceCustomFields(): Promise<{
  data: ServiceCustomField[] | null
  error: string | null
}> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('service_custom_fields')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('display_order')

  if (error) {
    console.error('Error fetching service custom fields:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function createServiceCustomField(
  input: CreateServiceCustomFieldInput
): Promise<{ data: ServiceCustomField | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  // Ensure field_key is valid (alphanumeric + underscore)
  const sanitizedKey = input.field_key.toLowerCase().replace(/[^a-z0-9_]/g, '_')

  const { data, error } = await supabase
    .from('service_custom_fields')
    .insert({
      company_id: companyId,
      field_key: `custom_${sanitizedKey}`,
      field_label: input.field_label,
      field_type: input.field_type,
      is_required: input.is_required ?? false,
      is_visible: input.is_visible ?? true,
      display_order: input.display_order ?? 100,
      category: 'custom',
      options: input.options || [],
      validation_rules: input.validation_rules || {},
      placeholder: input.placeholder || null,
      help_text: input.help_text || null,
      default_value: input.default_value || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating service custom field:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/services')
  revalidatePath('/services/settings')
  return { data, error: null }
}

export async function updateServiceCustomField(
  id: string,
  input: Partial<CreateServiceCustomFieldInput>
): Promise<{ data: ServiceCustomField | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (input.field_label !== undefined) updateData.field_label = input.field_label
  if (input.field_type !== undefined) updateData.field_type = input.field_type
  if (input.is_required !== undefined) updateData.is_required = input.is_required
  if (input.is_visible !== undefined) updateData.is_visible = input.is_visible
  if (input.display_order !== undefined) updateData.display_order = input.display_order
  if (input.options !== undefined) updateData.options = input.options
  if (input.validation_rules !== undefined) updateData.validation_rules = input.validation_rules
  if (input.placeholder !== undefined) updateData.placeholder = input.placeholder || null
  if (input.help_text !== undefined) updateData.help_text = input.help_text || null
  if (input.default_value !== undefined) updateData.default_value = input.default_value || null

  const { data, error } = await supabase
    .from('service_custom_fields')
    .update(updateData)
    .eq('id', id)
    .eq('company_id', companyId)
    .select()
    .single()

  if (error) {
    console.error('Error updating service custom field:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/services')
  revalidatePath('/services/settings')
  return { data, error: null }
}

export async function deleteServiceCustomField(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { error: 'Not authenticated' }
  }

  // Soft delete by setting is_active to false
  const { error } = await supabase
    .from('service_custom_fields')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) {
    console.error('Error deleting service custom field:', error)
    return { error: error.message }
  }

  revalidatePath('/services')
  revalidatePath('/services/settings')
  return { error: null }
}

// ============ RESOLVED FIELDS (Combined for forms) ============

export async function getResolvedServiceFields(): Promise<{
  data: ResolvedServiceField[] | null
  error: string | null
}> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  // Get field definitions
  const { data: definitions, error: defError } = await supabase
    .from('service_field_definitions')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (defError) {
    console.error('Error fetching service field definitions:', defError)
    return { data: null, error: defError.message }
  }

  // Get company field configs
  const { data: configs, error: configError } = await supabase
    .from('service_field_configs')
    .select('*')
    .eq('company_id', companyId)

  if (configError) {
    console.error('Error fetching service field configs:', configError)
    return { data: null, error: configError.message }
  }

  // Get custom fields
  const { data: customFields, error: customError } = await supabase
    .from('service_custom_fields')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('display_order')

  if (customError) {
    console.error('Error fetching service custom fields:', customError)
    return { data: null, error: customError.message }
  }

  // Build config lookup
  const configMap = new Map(
    configs?.map((c) => [c.field_definition_id, c]) || []
  )

  // Resolve system fields
  const resolvedFields: ResolvedServiceField[] = (definitions || []).map((def) => {
    const config = configMap.get(def.id)
    return {
      key: def.field_key,
      label: config?.custom_label || def.field_label,
      type: def.field_type,
      category: def.category,
      displayOrder: config?.display_order ?? def.display_order,
      isRequired: def.is_platform_required || (config?.is_required ?? false),
      isVisible: config?.is_visible ?? true,
      isSystemField: def.is_system_field,
      isPlatformRequired: def.is_platform_required,
      isClientConfigurable: def.is_client_configurable,
      isCustomField: false,
      options: def.options || [],
      validationRules: def.validation_rules || {},
      placeholder: config?.custom_placeholder || def.placeholder,
      helpText: config?.custom_help_text || def.help_text,
    }
  })

  // Add custom fields
  const customResolvedFields: ResolvedServiceField[] = (customFields || []).map((field) => ({
    key: field.field_key,
    label: field.field_label,
    type: field.field_type,
    category: field.category,
    displayOrder: field.display_order,
    isRequired: field.is_required,
    isVisible: field.is_visible,
    isSystemField: false,
    isPlatformRequired: false,
    isClientConfigurable: true,
    isCustomField: true,
    options: field.options || [],
    validationRules: field.validation_rules || {},
    placeholder: field.placeholder,
    helpText: field.help_text,
    defaultValue: field.default_value,
  }))

  // Combine and sort by display order
  const allFields = [...resolvedFields, ...customResolvedFields]
  allFields.sort((a, b) => a.displayOrder - b.displayOrder)

  return { data: allFields, error: null }
}
