'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  MapPin,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react'

interface FormConfig {
  id: string
  name: string
  description?: string
  logo_url?: string
  primary_color: string
  welcome_message?: string
  success_message: string
  fields_config: {
    [key: string]: {
      visible: boolean
      required: boolean
      label?: string
      placeholder?: string
    }
  }
  status: string
}

interface FormData {
  name: string
  address_line1: string
  address_line2: string
  city: string
  state: string
  postal_code: string
  country: string
  contact_name: string
  contact_email: string
  contact_phone: string
  notes: string
}

export default function PublicSubmitFormPage() {
  const params = useParams()
  const slug = params.slug as string

  const [formConfig, setFormConfig] = useState<FormConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'France',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
  })

  useEffect(() => {
    async function loadFormConfig() {
      try {
        const response = await fetch(`/api/forms/${slug}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Form not found')
          } else {
            setError('Failed to load form')
          }
          return
        }
        const data = await response.json()
        setFormConfig(data)
      } catch {
        setError('Failed to load form')
      } finally {
        setLoading(false)
      }
    }

    loadFormConfig()
  }, [slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formConfig) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/forms/${slug}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit form')
    } finally {
      setSubmitting(false)
    }
  }

  const getFieldConfig = (field: keyof FormData) => {
    return formConfig?.fields_config[field] || { visible: true, required: false }
  }

  const renderField = (
    field: keyof FormData,
    label: string,
    type: string = 'text',
    placeholder?: string,
    options?: { textarea?: boolean }
  ) => {
    const config = getFieldConfig(field)
    if (!config.visible) return null

    const fieldLabel = config.label || label
    const fieldPlaceholder = config.placeholder || placeholder || ''

    return (
      <div key={field} className={field === 'notes' ? 'col-span-2' : ''}>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {fieldLabel}
          {config.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {options?.textarea ? (
          <textarea
            rows={3}
            value={formData[field]}
            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
            required={config.required}
            placeholder={fieldPlaceholder}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        ) : (
          <input
            type={type}
            value={formData[field]}
            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
            required={config.required}
            placeholder={fieldPlaceholder}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-500">Loading form...</p>
        </div>
      </div>
    )
  }

  if (error && !formConfig) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Form Not Available</h1>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!formConfig) {
    return null
  }

  const primaryColor = formConfig.primary_color || '#3B82F6'

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <Check className="w-8 h-8" style={{ color: primaryColor }} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Submitted!</h1>
          <p className="text-slate-600">{formConfig.success_message}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div
            className="p-6 text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-4">
              {formConfig.logo_url ? (
                <img
                  src={formConfig.logo_url}
                  alt="Logo"
                  className="w-12 h-12 rounded-xl bg-white/10"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{formConfig.name}</h1>
                {formConfig.description && (
                  <p className="text-white/80 mt-1">{formConfig.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6">
            {formConfig.welcome_message && (
              <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                <p className="text-slate-600">{formConfig.welcome_message}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField('name', 'Location Name', 'text', 'e.g., Main Office')}
                {renderField('address_line1', 'Address Line 1', 'text', 'Street address')}
                {renderField('address_line2', 'Address Line 2', 'text', 'Apt, suite, floor')}
                {renderField('city', 'City', 'text', 'City')}
                {renderField('state', 'State/Region', 'text', 'State or region')}
                {renderField('postal_code', 'Postal Code', 'text', 'Postal code')}
                {renderField('country', 'Country', 'text', 'Country')}
                {renderField('contact_name', 'Contact Name', 'text', 'Contact person')}
                {renderField('contact_email', 'Contact Email', 'email', 'email@example.com')}
                {renderField('contact_phone', 'Contact Phone', 'tel', '+33 1 23 45 67 89')}
                {renderField('notes', 'Additional Notes', 'text', 'Any additional information...', { textarea: true })}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-6 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    'Submit Location'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Powered by Fox Network
        </p>
      </motion.div>
    </div>
  )
}
