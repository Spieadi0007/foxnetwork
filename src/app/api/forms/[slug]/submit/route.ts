import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server-client'
import { headers } from 'next/headers'

// POST /api/forms/[slug]/submit - Submit location via public form
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = createAdminClient()

    // Get form configuration
    const { data: form, error: formError } = await supabase
      .from('location_forms')
      .select('id, company_id, fields_config, requires_approval, notify_on_submission, notification_emails, status')
      .eq('slug', slug)
      .eq('status', 'active')
      .single()

    if (formError || !form) {
      return NextResponse.json(
        { error: 'Form not found or inactive' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Validate required fields based on form config
    const fieldsConfig = form.fields_config as Record<string, { visible: boolean; required: boolean }>
    const errors: string[] = []

    for (const [field, config] of Object.entries(fieldsConfig)) {
      if (config.visible && config.required) {
        if (!body[field] || (typeof body[field] === 'string' && body[field].trim() === '')) {
          errors.push(`${field.replace(/_/g, ' ')} is required`)
        }
      }
    }

    // Name is always required
    if (!body.name || body.name.trim() === '') {
      if (!errors.includes('name is required')) {
        errors.push('name is required')
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    // Get submitter info
    const headersList = await headers()
    const submitterIp = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    if (form.requires_approval) {
      // Create a submission that needs approval
      const { data: submission, error: submissionError } = await supabase
        .from('location_submissions')
        .insert({
          form_id: form.id,
          company_id: form.company_id,
          name: body.name,
          address_line1: body.address_line1,
          address_line2: body.address_line2,
          city: body.city,
          state: body.state,
          postal_code: body.postal_code,
          country: body.country || 'France',
          contact_name: body.contact_name,
          contact_email: body.contact_email,
          contact_phone: body.contact_phone,
          notes: body.notes,
          metadata: body.metadata,
          submitter_ip: submitterIp,
          submitter_user_agent: userAgent,
          status: 'pending',
        })
        .select()
        .single()

      if (submissionError) {
        console.error('Submission error:', submissionError)
        return NextResponse.json(
          { error: 'Failed to submit location' },
          { status: 500 }
        )
      }

      // Update form submission count
      await supabase.rpc('increment_submission_count', { form_id: form.id })
        .then(() => {})
        .catch(() => {
          // If RPC doesn't exist, update directly
          supabase
            .from('location_forms')
            .update({ submission_count: form.id })
            .eq('id', form.id)
        })

      // TODO: Send notification email if enabled

      return NextResponse.json({
        success: true,
        message: 'Location submitted successfully. It will be reviewed before being added.',
        submission_id: submission.id,
        requires_approval: true,
      }, { status: 201 })

    } else {
      // Create location directly
      const { data: location, error: locationError } = await supabase
        .from('locations')
        .insert({
          company_id: form.company_id,
          name: body.name,
          address_line1: body.address_line1,
          address_line2: body.address_line2,
          city: body.city,
          state: body.state,
          postal_code: body.postal_code,
          country: body.country || 'France',
          contact_name: body.contact_name,
          contact_email: body.contact_email,
          contact_phone: body.contact_phone,
          notes: body.notes,
          metadata: body.metadata,
          type: 'site',
          status: 'active',
          source: 'form',
          source_reference: form.id,
        })
        .select()
        .single()

      if (locationError) {
        console.error('Location error:', locationError)
        return NextResponse.json(
          { error: 'Failed to create location' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Location added successfully.',
        location_id: location.id,
        requires_approval: false,
      }, { status: 201 })
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
