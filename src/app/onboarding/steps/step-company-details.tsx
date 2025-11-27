'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, Globe, MapPin, Upload, X, ArrowLeft, ArrowRight, Image as ImageIcon, Users, Pencil, ExternalLink, Sparkles, RefreshCw, Check } from 'lucide-react'
import type { CompanyInfo } from '@/types/user'

interface StepCompanyDetailsProps {
  onSubmit: (info: CompanyInfo) => void
  onBack: () => void
  initialData: CompanyInfo
  isSubmitting: boolean
}

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'India', 'Japan', 'Brazil', 'Mexico', 'Singapore', 'Netherlands',
  'Sweden', 'Switzerland', 'Spain', 'Italy', 'South Korea', 'China',
  'United Arab Emirates', 'Israel', 'New Zealand', 'Ireland', 'Belgium',
  'Austria', 'Denmark', 'Norway', 'Finland', 'Poland', 'Portugal', 'Other'
].sort()

const industries = [
  'Technology', 'SaaS', 'E-commerce', 'Healthcare', 'Finance', 'Education',
  'Marketing', 'Consulting', 'Manufacturing', 'Real Estate', 'Media',
  'Entertainment', 'Food & Beverage', 'Travel', 'Automotive', 'Other'
]

const companySizes = [
  '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
]

export function StepCompanyDetails({ onSubmit, onBack, initialData, isSubmitting }: StepCompanyDetailsProps) {
  const [companyName, setCompanyName] = useState(initialData.name)
  const [website, setWebsite] = useState(initialData.website)
  const [country, setCountry] = useState(initialData.country)
  const [logo, setLogo] = useState<string | null>(initialData.logo)
  const [description, setDescription] = useState(initialData.description || '')
  const [industry, setIndustry] = useState(initialData.industry || '')
  const [size, setSize] = useState(initialData.size || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isEnriching, setIsEnriching] = useState(false)
  const [hasEnriched, setHasEnriched] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateUrl = (url: string): boolean => {
    if (!url) return false
    try {
      const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`
      new URL(urlWithProtocol)
      return true
    } catch {
      return false
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, logo: 'Image must be less than 5MB' }))
        return
      }
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, logo: 'Please upload an image file' }))
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogo(reader.result as string)
        setErrors(prev => ({ ...prev, logo: '' }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogo(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const enrichWithAI = async () => {
    if (!website || !validateUrl(website)) return

    setIsEnriching(true)
    try {
      const websiteUrl = website.startsWith('http') ? website : `https://${website}`
      const response = await fetch('/api/enrich-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website: websiteUrl,
          name: companyName,
          existingLogo: logo,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.description && !description) setDescription(data.description)
        if (data.industry && !industry) setIndustry(data.industry)
        if (data.size && !size) setSize(data.size)
        if (data.logo && !logo) setLogo(data.logo)
        setHasEnriched(true)
      }
    } catch (error) {
      console.error('Error enriching:', error)
    } finally {
      setIsEnriching(false)
    }
  }

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}

    if (!companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    }

    if (!website.trim()) {
      newErrors.website = 'Website URL is required'
    } else if (!validateUrl(website)) {
      newErrors.website = 'Please enter a valid URL'
    }

    if (!country) {
      newErrors.country = 'Please select a country'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      const websiteUrl = website.startsWith('http') ? website : `https://${website}`
      onSubmit({
        name: companyName.trim(),
        website: websiteUrl,
        country,
        logo,
        description: description || null,
        industry: industry || null,
        size: size || null,
      })
    }
  }

  // Format website for display
  const displayWebsite = website ? website.replace(/^https?:\/\//, '').replace(/\/$/, '') : ''

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 shadow-lg shadow-black/5 mb-6"
        >
          <Building2 className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-gray-600">Step 2 of 2</span>
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          Set up your company profile
        </h1>
        <p className="text-gray-500">
          Fill in the details and watch your profile come to life
        </p>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-6 space-y-5"
        >
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Inc."
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                  errors.companyName ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/50'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all`}
              />
            </div>
            {errors.companyName && (
              <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>
            )}
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Website <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={website}
                onChange={(e) => {
                  setWebsite(e.target.value)
                  setHasEnriched(false)
                }}
                placeholder="www.acme.com"
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                  errors.website ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/50'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all`}
              />
            </div>
            {errors.website && (
              <p className="mt-1 text-sm text-red-500">{errors.website}</p>
            )}
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border appearance-none ${
                  errors.country ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white/50'
                } focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all cursor-pointer`}
              >
                <option value="">Select a country</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.country && (
              <p className="mt-1 text-sm text-red-500">{errors.country}</p>
            )}
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Logo <span className="text-gray-400">(optional)</span>
            </label>
            <div className="flex items-center gap-4">
              {logo ? (
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl border border-gray-200 overflow-hidden bg-white">
                    <img src={logo} alt="Company logo" className="w-full h-full object-contain" />
                  </div>
                  <button
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
              )}
              <div className="flex-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  <Upload className="w-4 h-4" />
                  {logo ? 'Change' : 'Upload'}
                </button>
                <p className="text-xs text-gray-400 mt-1">Or we'll fetch it from your website</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          {/* AI Enrich Button */}
          <div className="pt-2">
            <button
              onClick={enrichWithAI}
              disabled={isEnriching || !website || !validateUrl(website)}
              className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
                isEnriching || !website || !validateUrl(website)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg shadow-orange-200 hover:shadow-xl'
              }`}
            >
              {isEnriching ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.div>
                  Analyzing website...
                </>
              ) : hasEnriched ? (
                <>
                  <Check className="w-4 h-4" />
                  Details fetched!
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Auto-fill with AI
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Right: Live Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="sticky top-8">
            <p className="text-sm font-medium text-gray-500 mb-3 text-center">Live Preview</p>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden">
              {/* Card Header */}
              <div className="h-20 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 relative">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
              </div>

              {/* Logo */}
              <div className="relative px-6 -mt-10">
                <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                  {logo ? (
                    <img src={logo} alt={companyName || 'Company'} className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="px-6 pb-6 pt-3">
                {/* Company Name & Website */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {companyName || <span className="text-gray-300">Company Name</span>}
                  </h2>
                  {displayWebsite ? (
                    <div className="flex items-center gap-1 text-purple-600 text-sm">
                      <Globe className="w-3 h-3" />
                      <span>{displayWebsite}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-300 text-sm">
                      <Globe className="w-3 h-3" />
                      <span>website.com</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-400 uppercase">About</span>
                    {description && (
                      <button
                        onClick={() => setEditingField(editingField === 'description' ? null : 'description')}
                        className="text-purple-500 hover:text-purple-600"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {editingField === 'description' ? (
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onBlur={() => setEditingField(null)}
                      autoFocus
                      className="w-full p-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none"
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {description || (
                        <button
                          onClick={() => setEditingField('description')}
                          className="text-gray-300 italic hover:text-purple-400"
                        >
                          + Add description
                        </button>
                      )}
                    </p>
                  )}
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Location */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-1 text-gray-400 mb-1">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[10px] font-medium uppercase">Location</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {country || <span className="text-gray-300">—</span>}
                    </p>
                  </div>

                  {/* Industry */}
                  <div className="bg-gray-50 rounded-lg p-3 relative">
                    <div className="flex items-center gap-1 text-gray-400 mb-1">
                      <Building2 className="w-3 h-3" />
                      <span className="text-[10px] font-medium uppercase">Industry</span>
                    </div>
                    {editingField === 'industry' ? (
                      <select
                        value={industry}
                        onChange={(e) => {
                          setIndustry(e.target.value)
                          setEditingField(null)
                        }}
                        onBlur={() => setEditingField(null)}
                        autoFocus
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      >
                        <option value="">Select</option>
                        {industries.map((ind) => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    ) : null}
                    <p
                      onClick={() => setEditingField('industry')}
                      className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-purple-600"
                    >
                      {industry || <span className="text-gray-300">+ Add</span>}
                    </p>
                  </div>

                  {/* Size */}
                  <div className="bg-gray-50 rounded-lg p-3 relative">
                    <div className="flex items-center gap-1 text-gray-400 mb-1">
                      <Users className="w-3 h-3" />
                      <span className="text-[10px] font-medium uppercase">Size</span>
                    </div>
                    {editingField === 'size' ? (
                      <select
                        value={size}
                        onChange={(e) => {
                          setSize(e.target.value)
                          setEditingField(null)
                        }}
                        onBlur={() => setEditingField(null)}
                        autoFocus
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      >
                        <option value="">Select</option>
                        {companySizes.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : null}
                    <p
                      onClick={() => setEditingField('size')}
                      className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-purple-600"
                    >
                      {size || <span className="text-gray-300">+ Add</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-between mt-8"
      >
        <motion.button
          onClick={onBack}
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-gray-600 bg-white/60 backdrop-blur-sm border border-gray-200 hover:bg-white/80 transition-all disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <motion.button
          onClick={handleSubmit}
          disabled={isSubmitting}
          whileHover={!isSubmitting ? { scale: 1.02, y: -2 } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          className="relative flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-white overflow-hidden shadow-xl shadow-purple-500/25 disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
          <span className="relative z-10 flex items-center gap-2">
            {isSubmitting ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Setting up...
              </>
            ) : (
              <>
                Complete Setup
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
