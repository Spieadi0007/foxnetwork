'use server'

import { createClient } from '@/lib/supabase/server-client'
import type {
  FieldForm,
  FieldFormField,
  ServiceForm,
  CreateFieldFormInput,
  UpdateFieldFormInput,
  CreateFieldFormFieldInput,
  UpdateFieldFormFieldInput,
  CreateServiceFormInput,
  UpdateServiceFormInput,
} from '@/types/field-forms'

// ==================
// FIELD FORMS
// ==================

export async function getFieldForms(): Promise<{
  data: FieldForm[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    // Get company_id from current user
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
      .from('field_forms')
      .select('*')
      .eq('company_id', userData.company_id)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching field forms:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in getFieldForms:', err)
    return { data: null, error: 'Failed to fetch field forms' }
  }
}

export async function getFieldFormById(id: string): Promise<{
  data: FieldForm | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('field_forms')
      .select(`
        *,
        fields:field_form_fields(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching field form:', error)
      return { data: null, error: error.message }
    }

    // Sort fields by display_order
    if (data?.fields) {
      data.fields.sort((a: FieldFormField, b: FieldFormField) => a.display_order - b.display_order)
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in getFieldFormById:', err)
    return { data: null, error: 'Failed to fetch field form' }
  }
}

export async function createFieldForm(input: CreateFieldFormInput): Promise<{
  data: FieldForm | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    // Get company_id from current user
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
      .from('field_forms')
      .insert({
        company_id: userData.company_id,
        name: input.name,
        description: input.description,
        is_active: input.is_active ?? true,
        created_by: user.id,
      })
      .select('*')
      .single()

    if (error) {
      console.error('Error creating field form:', error)
      if (error.code === '23505') {
        return { data: null, error: 'A form with this name already exists' }
      }
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in createFieldForm:', err)
    return { data: null, error: 'Failed to create field form' }
  }
}

export async function updateFieldForm(id: string, input: UpdateFieldFormInput): Promise<{
  data: FieldForm | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('field_forms')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating field form:', error)
      if (error.code === '23505') {
        return { data: null, error: 'A form with this name already exists' }
      }
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in updateFieldForm:', err)
    return { data: null, error: 'Failed to update field form' }
  }
}

export async function deleteFieldForm(id: string): Promise<{
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('field_forms')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting field form:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (err) {
    console.error('Error in deleteFieldForm:', err)
    return { error: 'Failed to delete field form' }
  }
}

// ==================
// FIELD FORM FIELDS
// ==================

export async function getFieldFormFields(formId: string): Promise<{
  data: FieldFormField[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('field_form_fields')
      .select('*')
      .eq('form_id', formId)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching field form fields:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in getFieldFormFields:', err)
    return { data: null, error: 'Failed to fetch field form fields' }
  }
}

export async function createFieldFormField(input: CreateFieldFormFieldInput): Promise<{
  data: FieldFormField | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('field_form_fields')
      .insert({
        form_id: input.form_id,
        field_key: input.field_key,
        label: input.label,
        field_type: input.field_type,
        is_required: input.is_required ?? false,
        placeholder: input.placeholder,
        help_text: input.help_text,
        options: input.options || [],
        validation_rules: input.validation_rules || {},
        display_order: input.display_order ?? 0,
        condition: input.condition || null,
        is_active: input.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating field form field:', error)
      if (error.code === '23505') {
        return { data: null, error: 'A field with this key already exists in this form' }
      }
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in createFieldFormField:', err)
    return { data: null, error: 'Failed to create field' }
  }
}

export async function updateFieldFormField(id: string, input: UpdateFieldFormFieldInput): Promise<{
  data: FieldFormField | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('field_form_fields')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating field form field:', error)
      if (error.code === '23505') {
        return { data: null, error: 'A field with this key already exists in this form' }
      }
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in updateFieldFormField:', err)
    return { data: null, error: 'Failed to update field' }
  }
}

export async function deleteFieldFormField(id: string): Promise<{
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('field_form_fields')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting field form field:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (err) {
    console.error('Error in deleteFieldFormField:', err)
    return { error: 'Failed to delete field' }
  }
}

// ==================
// BULK OPERATIONS
// ==================

export async function reorderFieldFormFields(formId: string, fieldIds: string[]): Promise<{
  error: string | null
}> {
  try {
    const supabase = await createClient()

    // Update each field's display_order
    for (let i = 0; i < fieldIds.length; i++) {
      const { error } = await supabase
        .from('field_form_fields')
        .update({ display_order: i, updated_at: new Date().toISOString() })
        .eq('id', fieldIds[i])
        .eq('form_id', formId)

      if (error) {
        console.error('Error reordering field:', error)
        return { error: error.message }
      }
    }

    return { error: null }
  } catch (err) {
    console.error('Error in reorderFieldFormFields:', err)
    return { error: 'Failed to reorder fields' }
  }
}

export async function duplicateFieldForm(id: string, newName: string): Promise<{
  data: FieldForm | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    // Get the original form with fields
    const { data: original, error: fetchError } = await supabase
      .from('field_forms')
      .select(`
        *,
        fields:field_form_fields(*)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !original) {
      return { data: null, error: 'Form not found' }
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    // Create the new form
    const { data: newForm, error: createError } = await supabase
      .from('field_forms')
      .insert({
        company_id: original.company_id,
        name: newName,
        description: original.description,
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single()

    if (createError || !newForm) {
      console.error('Error duplicating form:', createError)
      return { data: null, error: createError?.message || 'Failed to duplicate form' }
    }

    // Duplicate all fields
    if (original.fields && original.fields.length > 0) {
      const newFields = original.fields.map((field: FieldFormField) => ({
        form_id: newForm.id,
        field_key: field.field_key,
        label: field.label,
        field_type: field.field_type,
        is_required: field.is_required,
        placeholder: field.placeholder,
        help_text: field.help_text,
        options: field.options,
        validation_rules: field.validation_rules,
        display_order: field.display_order,
        condition: field.condition,
        is_active: field.is_active,
      }))

      const { error: fieldsError } = await supabase
        .from('field_form_fields')
        .insert(newFields)

      if (fieldsError) {
        console.error('Error duplicating fields:', fieldsError)
        // Don't fail the whole operation, form was created
      }
    }

    return { data: newForm, error: null }
  } catch (err) {
    console.error('Error in duplicateFieldForm:', err)
    return { data: null, error: 'Failed to duplicate form' }
  }
}

// ==================
// SERVICE FORMS (Junction table)
// ==================

export async function getServiceForms(serviceId: string): Promise<{
  data: ServiceForm[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('service_forms')
      .select(`
        *,
        form:field_forms(*)
      `)
      .eq('service_id', serviceId)
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching service forms:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in getServiceForms:', err)
    return { data: null, error: 'Failed to fetch service forms' }
  }
}

export async function attachFormToService(input: CreateServiceFormInput): Promise<{
  data: ServiceForm | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    // Get max display_order for this service
    const { data: existing } = await supabase
      .from('service_forms')
      .select('display_order')
      .eq('service_id', input.service_id)
      .order('display_order', { ascending: false })
      .limit(1)

    const nextOrder = existing && existing.length > 0 ? existing[0].display_order + 1 : 0

    const { data, error } = await supabase
      .from('service_forms')
      .insert({
        service_id: input.service_id,
        form_id: input.form_id,
        is_required: input.is_required ?? false,
        allow_multiple: input.allow_multiple ?? false,
        display_order: input.display_order ?? nextOrder,
        is_active: input.is_active ?? true,
      })
      .select(`
        *,
        form:field_forms(*)
      `)
      .single()

    if (error) {
      console.error('Error attaching form to service:', error)
      if (error.code === '23505') {
        return { data: null, error: 'This form is already attached to this service' }
      }
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in attachFormToService:', err)
    return { data: null, error: 'Failed to attach form to service' }
  }
}

export async function updateServiceForm(id: string, input: UpdateServiceFormInput): Promise<{
  data: ServiceForm | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('service_forms')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        form:field_forms(*)
      `)
      .single()

    if (error) {
      console.error('Error updating service form:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in updateServiceForm:', err)
    return { data: null, error: 'Failed to update service form' }
  }
}

export async function detachFormFromService(id: string): Promise<{
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('service_forms')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error detaching form from service:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (err) {
    console.error('Error in detachFormFromService:', err)
    return { error: 'Failed to detach form from service' }
  }
}

export async function reorderServiceForms(serviceId: string, formIds: string[]): Promise<{
  error: string | null
}> {
  try {
    const supabase = await createClient()

    // Update each service form's display_order
    for (let i = 0; i < formIds.length; i++) {
      const { error } = await supabase
        .from('service_forms')
        .update({ display_order: i, updated_at: new Date().toISOString() })
        .eq('id', formIds[i])
        .eq('service_id', serviceId)

      if (error) {
        console.error('Error reordering service form:', error)
        return { error: error.message }
      }
    }

    return { error: null }
  } catch (err) {
    console.error('Error in reorderServiceForms:', err)
    return { error: 'Failed to reorder service forms' }
  }
}
