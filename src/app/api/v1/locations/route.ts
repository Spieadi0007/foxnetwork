import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server-client'
import crypto from 'crypto'

// Verify API key and return company_id if valid
async function verifyApiKey(apiKey: string): Promise<{
  valid: boolean
  companyId?: string
  apiKeyId?: string
  error?: string
}> {
  if (!apiKey || !apiKey.startsWith('fox_')) {
    return { valid: false, error: 'Invalid API key format' }
  }

  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
  const supabase = createAdminClient()

  const { data: keyData, error } = await supabase
    .from('api_keys')
    .select('id, company_id, status, expires_at, permissions, rate_limit_per_minute, rate_limit_per_day, total_requests')
    .eq('key_hash', keyHash)
    .single()

  if (error || !keyData) {
    return { valid: false, error: 'Invalid API key' }
  }

  if (keyData.status !== 'active') {
    return { valid: false, error: 'API key has been revoked' }
  }

  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    return { valid: false, error: 'API key has expired' }
  }

  // Update last_used_at and total_requests
  await supabase
    .from('api_keys')
    .update({
      last_used_at: new Date().toISOString(),
      total_requests: keyData.total_requests + 1,
    })
    .eq('id', keyData.id)

  return {
    valid: true,
    companyId: keyData.company_id,
    apiKeyId: keyData.id,
  }
}

// POST /api/v1/locations - Create a new location
export async function POST(request: NextRequest) {
  try {
    // Get API key from header
    const authHeader = request.headers.get('authorization')
    const apiKey = authHeader?.replace('Bearer ', '')

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing API key. Include it in the Authorization header as "Bearer <api_key>"' },
        { status: 401 }
      )
    }

    const verification = await verifyApiKey(apiKey)

    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const validTypes = ['site', 'warehouse', 'office', 'store', 'other']
    const type = body.type && validTypes.includes(body.type) ? body.type : 'site'

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('locations')
      .insert({
        company_id: verification.companyId,
        name: body.name,
        code: body.code,
        type,
        status: 'pending',
        address_line1: body.address_line1,
        address_line2: body.address_line2,
        city: body.city,
        state: body.state,
        postal_code: body.postal_code,
        country: body.country || 'France',
        latitude: body.latitude,
        longitude: body.longitude,
        contact_name: body.contact_name,
        contact_email: body.contact_email,
        contact_phone: body.contact_phone,
        notes: body.notes,
        metadata: body.metadata,
        source: 'api',
        source_reference: verification.apiKeyId,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create location', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        name: data.name,
        code: data.code,
        type: data.type,
        status: data.status,
        address: {
          line1: data.address_line1,
          line2: data.address_line2,
          city: data.city,
          state: data.state,
          postal_code: data.postal_code,
          country: data.country,
        },
        contact: {
          name: data.contact_name,
          email: data.contact_email,
          phone: data.contact_phone,
        },
        coordinates: data.latitude && data.longitude ? {
          latitude: data.latitude,
          longitude: data.longitude,
        } : null,
        created_at: data.created_at,
      },
    }, { status: 201 })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/v1/locations - List locations (optional, for API access)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const apiKey = authHeader?.replace('Bearer ', '')

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing API key' },
        { status: 401 }
      )
    }

    const verification = await verifyApiKey(apiKey)

    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // Get query params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('locations')
      .select('*', { count: 'exact' })
      .eq('company_id', verification.companyId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch locations', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data?.map(loc => ({
        id: loc.id,
        name: loc.name,
        code: loc.code,
        type: loc.type,
        status: loc.status,
        address: {
          line1: loc.address_line1,
          line2: loc.address_line2,
          city: loc.city,
          state: loc.state,
          postal_code: loc.postal_code,
          country: loc.country,
        },
        contact: {
          name: loc.contact_name,
          email: loc.contact_email,
          phone: loc.contact_phone,
        },
        coordinates: loc.latitude && loc.longitude ? {
          latitude: loc.latitude,
          longitude: loc.longitude,
        } : null,
        created_at: loc.created_at,
        updated_at: loc.updated_at,
      })),
      pagination: {
        total: count,
        limit,
        offset,
      },
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
