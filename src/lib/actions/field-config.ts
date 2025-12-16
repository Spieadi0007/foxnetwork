'use server'

import { createClient } from '@/lib/supabase/server-client'
import type {
  LocationFieldDefinition,
  LocationFieldConfig,
  LocationCustomField,
  ResolvedField,
  CreateCustomFieldInput,
  UpdateFieldConfigInput,
} from '@/types/locations'

// Get all platform field definitions
export async function getFieldDefinitions(): Promise<{
  data: LocationFieldDefinition[] | null
  error: string | null
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('location_field_definitions')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching field definitions:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// Get company's field configurations
export async function getFieldConfigs(): Promise<{
  data: LocationFieldConfig[] | null
  error: string | null
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!userData?.company_id) {
    return { data: null, error: 'No company found' }
  }

  const { data, error } = await supabase
    .from('location_field_configs')
    .select(`
      *,
      field_definition:location_field_definitions(*)
    `)
    .eq('company_id', userData.company_id)

  if (error) {
    console.error('Error fetching field configs:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// Get company's custom fields
export async function getCustomFields(): Promise<{
  data: LocationCustomField[] | null
  error: string | null
}> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!userData?.company_id) {
    return { data: null, error: 'No company found' }
  }

  const { data, error } = await supabase
    .from('location_custom_fields')
    .select('*')
    .eq('company_id', userData.company_id)
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching custom fields:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// Update or create field configuration
export async function upsertFieldConfig(
  input: UpdateFieldConfigInput
): Promise<{ data: LocationFieldConfig | null; error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!userData?.company_id) {
    return { data: null, error: 'No company found' }
  }

  const { data, error } = await supabase
    .from('location_field_configs')
    .upsert(
      {
        company_id: userData.company_id,
        field_definition_id: input.field_definition_id,
        is_required: input.is_required,
        is_visible: input.is_visible,
        custom_label: input.custom_label,
        custom_placeholder: input.custom_placeholder,
        custom_help_text: input.custom_help_text,
        display_order: input.display_order,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'company_id,field_definition_id',
      }
    )
    .select()
    .single()

  if (error) {
    console.error('Error upserting field config:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// Create custom field
export async function createCustomField(
  input: CreateCustomFieldInput
): Promise<{ data: LocationCustomField | null; error: string | null }> {
  const supabase = await createClient()

  // Debug log
  console.log('Creating custom field with input:', JSON.stringify(input, null, 2))

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!userData?.company_id) {
    return { data: null, error: 'No company found' }
  }

  // Generate a safe field key
  const fieldKey = input.field_key
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')

  const insertData = {
    company_id: userData.company_id,
    field_key: `custom_${fieldKey}`,
    field_label: input.field_label,
    field_type: input.field_type,
    is_required: input.is_required ?? false,
    is_visible: input.is_visible ?? true,
    display_order: input.display_order ?? 100,
    category: 'custom',
    options: input.options ?? [],
    validation_rules: input.validation_rules ?? {},
    placeholder: input.placeholder,
    help_text: input.help_text,
    default_value: input.default_value,
  }

  console.log('Inserting data:', JSON.stringify(insertData, null, 2))

  const { data, error } = await supabase
    .from('location_custom_fields')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('Error creating custom field:', error)
    return { data: null, error: error.message }
  }

  console.log('Created custom field:', JSON.stringify(data, null, 2))

  return { data, error: null }
}

// Update custom field
export async function updateCustomField(
  id: string,
  input: Partial<CreateCustomFieldInput>
): Promise<{ data: LocationCustomField | null; error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!userData?.company_id) {
    return { data: null, error: 'No company found' }
  }

  const { data, error } = await supabase
    .from('location_custom_fields')
    .update({
      field_label: input.field_label,
      field_type: input.field_type,
      is_required: input.is_required,
      is_visible: input.is_visible,
      display_order: input.display_order,
      options: input.options,
      validation_rules: input.validation_rules,
      placeholder: input.placeholder,
      help_text: input.help_text,
      default_value: input.default_value,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('company_id', userData.company_id)
    .select()
    .single()

  if (error) {
    console.error('Error updating custom field:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// Delete custom field (hard delete)
export async function deleteCustomField(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('company_id')
    .eq('id', user.id)
    .single()

  if (!userData?.company_id) {
    return { success: false, error: 'No company found' }
  }

  const { error } = await supabase
    .from('location_custom_fields')
    .delete()
    .eq('id', id)
    .eq('company_id', userData.company_id)

  if (error) {
    console.error('Error deleting custom field:', error)
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

// Get all resolved fields for the company (combines definitions, configs, and custom fields)
export async function getResolvedFields(): Promise<{
  data: ResolvedField[] | null
  error: string | null
}> {
  const [definitionsResult, configsResult, customFieldsResult] = await Promise.all([
    getFieldDefinitions(),
    getFieldConfigs(),
    getCustomFields(),
  ])

  if (definitionsResult.error) {
    return { data: null, error: definitionsResult.error }
  }

  const definitions = definitionsResult.data ?? []
  const configs = configsResult.data ?? []
  const customFields = customFieldsResult.data ?? []

  // Create a map of configs by field_definition_id
  const configMap = new Map(configs.map((c) => [c.field_definition_id, c]))

  // Resolve system fields with client overrides
  const resolvedSystemFields: ResolvedField[] = definitions.map((def) => {
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
      options: def.options ?? [],
      validationRules: def.validation_rules ?? {},
      placeholder: config?.custom_placeholder || def.placeholder,
      helpText: config?.custom_help_text || def.help_text,
    }
  })

  // Add custom fields
  const resolvedCustomFields: ResolvedField[] = customFields.map((cf) => ({
    key: cf.field_key,
    label: cf.field_label,
    type: cf.field_type,
    category: cf.category,
    displayOrder: cf.display_order,
    isRequired: cf.is_required,
    isVisible: cf.is_visible,
    isSystemField: false,
    isPlatformRequired: false,
    isClientConfigurable: true,
    isCustomField: true,
    options: cf.options ?? [],
    validationRules: cf.validation_rules ?? {},
    placeholder: cf.placeholder,
    helpText: cf.help_text,
    defaultValue: cf.default_value,
  }))

  // Combine and sort by display order
  const allFields = [...resolvedSystemFields, ...resolvedCustomFields].sort(
    (a, b) => a.displayOrder - b.displayOrder
  )

  return { data: allFields, error: null }
}
