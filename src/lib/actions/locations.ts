'use server'

import { createClient } from '@/lib/supabase/server-client'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'
import type {
  Location,
  CreateLocationInput,
  ApiKey,
  CreateApiKeyInput,
  LocationForm,
  CreateLocationFormInput,
  CSVLocationRow
} from '@/types/locations'

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

// ============ LOCATIONS ============

export async function getLocations(): Promise<{ data: Location[] | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function createLocation(
  input: CreateLocationInput
): Promise<{ data: Location | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()
  const { data: { user } } = await supabase.auth.getUser()

  if (!companyId || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  // Look up client name/code from library_items if client is a UUID
  let clientName: string | null = null
  let clientCode: string | null = null
  if (input.client) {
    const { data: clientItem } = await supabase
      .from('library_items')
      .select('name, code')
      .eq('id', input.client)
      .single()

    if (clientItem) {
      clientName = clientItem.name
      clientCode = clientItem.code
    } else {
      // If not a UUID, use the value directly as the name
      clientName = input.client
    }
  }

  // Look up country name/code from library_items if country is a UUID
  let countryName: string | null = null
  let countryCode: string | null = null
  if (input.country) {
    const { data: countryItem } = await supabase
      .from('library_items')
      .select('name, code')
      .eq('id', input.country)
      .single()

    if (countryItem) {
      countryName = countryItem.name
      countryCode = countryItem.code
    } else {
      // If not a UUID, use the value directly as the name
      countryName = input.country
    }
  }

  // Generate location_id using the PostgreSQL function
  const { data: locationIdResult, error: locationIdError } = await supabase
    .rpc('generate_location_id', {
      p_company_id: companyId,
      p_client_name: clientName,
      p_client_code: clientCode,
      p_country_name: countryName,
      p_country_code: countryCode,
    })

  if (locationIdError) {
    console.error('Failed to generate location_id:', locationIdError)
    // Continue without location_id if generation fails
  }

  const { data, error } = await supabase
    .from('locations')
    .insert({
      company_id: companyId,
      location_id: locationIdResult || null,
      name: input.name,
      client: input.client,
      code: locationIdResult || null, // Auto-generated, same as location_id
      type: input.type || 'site',
      status: 'active',
      address_line1: input.address_line1,
      address_line2: input.address_line2,
      city: input.city,
      state: input.state,
      postal_code: input.postal_code,
      country: input.country,
      latitude: input.latitude,
      longitude: input.longitude,
      contact_name: input.contact_name,
      contact_email: input.contact_email,
      contact_phone: input.contact_phone,
      notes: input.notes,
      metadata: input.metadata,
      source: 'manual',
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath('/locations')
  return { data, error: null }
}

export async function createLocationsFromCSV(
  rows: CSVLocationRow[]
): Promise<{ success: number; failed: number; errors: Array<{ row: number; error: string }> }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()
  const { data: { user } } = await supabase.auth.getUser()

  if (!companyId || !user) {
    return {
      success: 0,
      failed: rows.length,
      errors: [{ row: 0, error: 'Not authenticated' }]
    }
  }

  const result = {
    success: 0,
    failed: 0,
    errors: [] as Array<{ row: number; error: string }>
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]

    // Validate required fields
    if (!row.name) {
      result.failed++
      result.errors.push({ row: i + 1, error: 'Name is required' })
      continue
    }

    const validTypes = ['site', 'warehouse', 'office', 'store', 'other']
    const type = row.type && validTypes.includes(row.type) ? row.type : 'site'

    const { error } = await supabase
      .from('locations')
      .insert({
        company_id: companyId,
        name: row.name,
        code: row.code,
        type,
        status: 'pending',
        address_line1: row.address_line1,
        address_line2: row.address_line2,
        city: row.city,
        state: row.state,
        postal_code: row.postal_code,
        country: row.country || 'France',
        latitude: row.latitude ? parseFloat(row.latitude) : null,
        longitude: row.longitude ? parseFloat(row.longitude) : null,
        contact_name: row.contact_name,
        contact_email: row.contact_email,
        contact_phone: row.contact_phone,
        notes: row.notes,
        source: 'csv',
        created_by: user.id,
      })

    if (error) {
      result.failed++
      result.errors.push({ row: i + 1, error: error.message })
    } else {
      result.success++
    }
  }

  revalidatePath('/locations')
  return result
}

export async function updateLocation(
  id: string,
  input: Partial<CreateLocationInput>
): Promise<{ data: Location | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('locations')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('company_id', companyId)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath('/locations')
  return { data, error: null }
}

export async function deleteLocation(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/locations')
  return { error: null }
}

// ============ API KEYS ============

function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = `fox_${crypto.randomBytes(32).toString('base64url')}`
  const hash = crypto.createHash('sha256').update(key).digest('hex')
  const prefix = key.substring(0, 12) + '...'
  return { key, hash, prefix }
}

export async function getApiKeys(): Promise<{ data: ApiKey[] | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function createApiKey(
  input: CreateApiKeyInput
): Promise<{ data: { apiKey: ApiKey; plainKey: string } | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()
  const { data: { user } } = await supabase.auth.getUser()

  if (!companyId || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { key, hash, prefix } = generateApiKey()

  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      company_id: companyId,
      name: input.name,
      key_hash: hash,
      key_prefix: prefix,
      permissions: input.permissions || ['locations:create'],
      rate_limit_per_minute: input.rate_limit_per_minute || 60,
      rate_limit_per_day: input.rate_limit_per_day || 10000,
      expires_at: input.expires_at,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath('/locations')
  return { data: { apiKey: data, plainKey: key }, error: null }
}

export async function revokeApiKey(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()
  const { data: { user } } = await supabase.auth.getUser()

  if (!companyId || !user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('api_keys')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
      revoked_by: user.id,
    })
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/locations')
  return { error: null }
}

// ============ LOCATION FORMS ============

export async function getLocationForms(): Promise<{ data: LocationForm[] | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('location_forms')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function createLocationForm(
  input: CreateLocationFormInput
): Promise<{ data: LocationForm | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()
  const { data: { user } } = await supabase.auth.getUser()

  if (!companyId || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  // Check if slug is unique for this company
  const { data: existingForm } = await supabase
    .from('location_forms')
    .select('id')
    .eq('company_id', companyId)
    .eq('slug', input.slug)
    .single()

  if (existingForm) {
    return { data: null, error: 'A form with this URL slug already exists' }
  }

  const defaultFieldsConfig = {
    name: { visible: true, required: true },
    address_line1: { visible: true, required: true },
    address_line2: { visible: true, required: false },
    city: { visible: true, required: true },
    state: { visible: true, required: false },
    postal_code: { visible: true, required: true },
    country: { visible: true, required: true },
    contact_name: { visible: true, required: false },
    contact_email: { visible: true, required: false },
    contact_phone: { visible: true, required: false },
    notes: { visible: true, required: false },
  }

  const { data, error } = await supabase
    .from('location_forms')
    .insert({
      company_id: companyId,
      name: input.name,
      slug: input.slug,
      description: input.description,
      logo_url: input.logo_url,
      primary_color: input.primary_color || '#3B82F6',
      welcome_message: input.welcome_message,
      success_message: input.success_message || 'Thank you! Your location has been submitted.',
      fields_config: input.fields_config || defaultFieldsConfig,
      requires_approval: input.requires_approval ?? true,
      notify_on_submission: input.notify_on_submission ?? true,
      notification_emails: input.notification_emails,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath('/locations')
  return { data, error: null }
}

export async function updateLocationForm(
  id: string,
  input: Partial<CreateLocationFormInput> & { status?: 'active' | 'inactive' | 'archived' }
): Promise<{ data: LocationForm | null; error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('location_forms')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('company_id', companyId)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  revalidatePath('/locations')
  return { data, error: null }
}

export async function deleteLocationForm(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const companyId = await getCompanyId()

  if (!companyId) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('location_forms')
    .delete()
    .eq('id', id)
    .eq('company_id', companyId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/locations')
  return { error: null }
}
