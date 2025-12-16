'use server'

import { createClient } from '@/lib/supabase/server-client'
import type {
  ActionModuleDefinition,
  ActionModuleConfig,
  ActionModuleWithConfig,
  UpdateModuleConfigInput,
} from '@/types/actions'

// =====================================================
// GET ALL MODULE DEFINITIONS
// =====================================================
export async function getActionModuleDefinitions(): Promise<{
  data: ActionModuleDefinition[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('action_module_definitions')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching action module definitions:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in getActionModuleDefinitions:', err)
    return { data: null, error: 'Failed to fetch module definitions' }
  }
}

// =====================================================
// GET COMPANY MODULE CONFIGS
// =====================================================
export async function getCompanyModuleConfigs(): Promise<{
  data: ActionModuleConfig[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    // Get current user's company
    const { data: { user } } = await supabase.auth.getUser()
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
      .from('action_module_configs')
      .select('*')
      .eq('company_id', userData.company_id)

    if (error) {
      console.error('Error fetching company module configs:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in getCompanyModuleConfigs:', err)
    return { data: null, error: 'Failed to fetch module configs' }
  }
}

// =====================================================
// GET MODULES WITH CONFIG (COMBINED)
// =====================================================
export async function getModulesWithConfig(): Promise<{
  data: ActionModuleWithConfig[] | null
  error: string | null
}> {
  try {
    const [definitionsResult, configsResult] = await Promise.all([
      getActionModuleDefinitions(),
      getCompanyModuleConfigs(),
    ])

    if (definitionsResult.error) {
      return { data: null, error: definitionsResult.error }
    }

    if (!definitionsResult.data) {
      return { data: [], error: null }
    }

    const configsMap = new Map(
      (configsResult.data || []).map(c => [c.module_id, c])
    )

    const modulesWithConfig: ActionModuleWithConfig[] = definitionsResult.data.map(def => {
      const config = configsMap.get(def.id)
      return {
        ...def,
        config,
        is_enabled: config?.is_enabled ?? false,
        is_required: config?.is_required ?? false,
        effective_label: config?.custom_label || def.name,
        effective_description: config?.custom_description || def.description,
      }
    })

    return { data: modulesWithConfig, error: null }
  } catch (err) {
    console.error('Error in getModulesWithConfig:', err)
    return { data: null, error: 'Failed to fetch modules with config' }
  }
}

// =====================================================
// UPDATE MODULE CONFIG
// =====================================================
export async function updateModuleConfig(input: UpdateModuleConfigInput): Promise<{
  data: ActionModuleConfig | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    // Get current user's company
    const { data: { user } } = await supabase.auth.getUser()
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

    // Upsert the config
    const { data, error } = await supabase
      .from('action_module_configs')
      .upsert(
        {
          company_id: userData.company_id,
          module_id: input.module_id,
          is_enabled: input.is_enabled,
          is_required: input.is_required ?? false,
          custom_label: input.custom_label,
          custom_description: input.custom_description,
          display_order: input.display_order,
          validation_rules: input.validation_rules ?? {},
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'company_id,module_id',
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error updating module config:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in updateModuleConfig:', err)
    return { data: null, error: 'Failed to update module config' }
  }
}

// =====================================================
// BULK UPDATE MODULE CONFIGS
// =====================================================
export async function bulkUpdateModuleConfigs(
  modules: UpdateModuleConfigInput[]
): Promise<{
  data: ActionModuleConfig[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    // Get current user's company
    const { data: { user } } = await supabase.auth.getUser()
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

    // Prepare upsert data
    const upsertData = modules.map(input => ({
      company_id: userData.company_id,
      module_id: input.module_id,
      is_enabled: input.is_enabled,
      is_required: input.is_required ?? false,
      custom_label: input.custom_label,
      custom_description: input.custom_description,
      display_order: input.display_order,
      validation_rules: input.validation_rules ?? {},
      updated_at: new Date().toISOString(),
    }))

    const { data, error } = await supabase
      .from('action_module_configs')
      .upsert(upsertData, {
        onConflict: 'company_id,module_id',
      })
      .select()

    if (error) {
      console.error('Error bulk updating module configs:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in bulkUpdateModuleConfigs:', err)
    return { data: null, error: 'Failed to bulk update module configs' }
  }
}

// =====================================================
// GET ENABLED MODULES FOR SERVICE ACTIONS
// =====================================================
export async function getEnabledModules(): Promise<{
  data: ActionModuleWithConfig[] | null
  error: string | null
}> {
  try {
    const result = await getModulesWithConfig()

    if (result.error || !result.data) {
      return result
    }

    // Filter to only enabled modules
    const enabledModules = result.data.filter(m => m.is_enabled)

    // Sort by display_order (using config order if set, otherwise definition order)
    enabledModules.sort((a, b) => {
      const orderA = a.config?.display_order ?? a.display_order
      const orderB = b.config?.display_order ?? b.display_order
      return orderA - orderB
    })

    return { data: enabledModules, error: null }
  } catch (err) {
    console.error('Error in getEnabledModules:', err)
    return { data: null, error: 'Failed to fetch enabled modules' }
  }
}
