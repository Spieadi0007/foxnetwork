'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Building2, Globe, MapPin, Upload, X, ArrowLeft, ArrowRight, Image as ImageIcon } from 'lucide-react'
import type { CompanyInfo } from '@/types/user'

interface StepCompanyInfoProps {
  onSubmit: (info: Omit<CompanyInfo, 'description' | 'industry' | 'size'> & { uploadedLogo?: string }) => void
  onBack: () => void
  initialData: CompanyInfo
}

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
  'France', 'India', 'Japan', 'Brazil', 'Mexico', 'Singapore', 'Netherlands',
  'Sweden', 'Switzerland', 'Spain', 'Italy', 'South Korea', 'China',
  'United Arab Emirates', 'Israel', 'New Zealand', 'Ireland', 'Belgium',
  'Austria', 'Denmark', 'Norway', 'Finland', 'Poland', 'Portugal', 'Other'
].sort()

export function StepCompanyInfo({ onSubmit, onBack, initialData }: StepCompanyInfoProps) {
  const [companyName, setCompanyName] = useState(initialData.name)
  const [website, setWebsite] = useState(initialData.website)
  const [country, setCountry] = useState(initialData.country)
  const [logo, setLogo] = useState<string | null>(initialData.logo)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
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
      setLogoFile(file)
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
    setLogoFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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
        logo: null,
        uploadedLogo: logo || undefined,
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl mx-auto"
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
          <span className="text-sm font-medium text-gray-600">Step 2 of 3</span>
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          Tell us about your company
        </h1>
        <p className="text-gray-500">
          We'll use this to create your company profile
        </p>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl p-8 space-y-6"
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
              onChange={(e) => setWebsite(e.target.value)}
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
          <div className="flex items-start gap-4">
            {logo ? (
              <div className="relative">
                <div className="w-20 h-20 rounded-xl border border-gray-200 overflow-hidden bg-white">
                  <img src={logo} alt="Company logo" className="w-full h-full object-contain" />
                </div>
                <button
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
              >
                <ImageIcon className="w-6 h-6 mb-1" />
                <span className="text-xs">Upload</span>
              </button>
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-2">
                Upload your company logo, or we'll try to extract it from your website.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                <Upload className="w-4 h-4" />
                {logo ? 'Change image' : 'Choose file'}
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
          {errors.logo && (
            <p className="mt-1 text-sm text-red-500">{errors.logo}</p>
          )}
        </div>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-between mt-8"
      >
        <motion.button
          onClick={onBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-gray-600 bg-white/60 backdrop-blur-sm border border-gray-200 hover:bg-white/80 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <motion.button
          onClick={handleSubmit}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="relative flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-white overflow-hidden shadow-xl shadow-purple-500/25"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
          <span className="relative z-10">Continue</span>
          <ArrowRight className="relative z-10 w-4 h-4" />
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
