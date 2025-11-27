'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, Globe, MapPin, Users, Sparkles, ArrowLeft, Check, Pencil, RefreshCw, ExternalLink, X } from 'lucide-react'
import type { CompanyInfo } from '@/types/user'

interface StepCompanyCardProps {
  companyInfo: CompanyInfo
  onConfirm: (info: CompanyInfo) => void
  onBack: () => void
  isLoading: boolean
}

export function StepCompanyCard({ companyInfo, onConfirm, onBack, isLoading }: StepCompanyCardProps) {
  const [enrichedInfo, setEnrichedInfo] = useState<CompanyInfo>(companyInfo)
  const [isEnriching, setIsEnriching] = useState(true)
  const [enrichError, setEnrichError] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({
    description: '',
    industry: '',
    size: '',
  })

  useEffect(() => {
    enrichCompanyData()
  }, [])

  const enrichCompanyData = async () => {
    setIsEnriching(true)
    setEnrichError(null)

    try {
      const response = await fetch('/api/enrich-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          website: companyInfo.website,
          name: companyInfo.name,
          existingLogo: companyInfo.logo,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to enrich company data')
      }

      const data = await response.json()

      const newInfo = {
        ...companyInfo,
        description: data.description || null,
        industry: data.industry || null,
        size: data.size || null,
        logo: companyInfo.logo || data.logo || null,
      }

      setEnrichedInfo(newInfo)
      setEditValues({
        description: data.description || '',
        industry: data.industry || '',
        size: data.size || '',
      })
    } catch (error) {
      console.error('Error enriching company:', error)
      setEnrichError('Could not fetch company details. You can still edit and continue.')
      setEnrichedInfo(companyInfo)
    } finally {
      setIsEnriching(false)
    }
  }

  const handleConfirm = () => {
    onConfirm(enrichedInfo)
  }

  const startEditing = (field: string) => {
    setEditingField(field)
    setEditValues(prev => ({
      ...prev,
      [field]: enrichedInfo[field as keyof CompanyInfo] || '',
    }))
  }

  const saveEdit = (field: string) => {
    setEnrichedInfo(prev => ({
      ...prev,
      [field]: editValues[field as keyof typeof editValues] || null,
    }))
    setEditingField(null)
  }

  const cancelEdit = () => {
    setEditingField(null)
  }

  const industries = [
    'Technology', 'SaaS', 'E-commerce', 'Healthcare', 'Finance', 'Education',
    'Marketing', 'Consulting', 'Manufacturing', 'Real Estate', 'Media',
    'Entertainment', 'Food & Beverage', 'Travel', 'Automotive', 'Other'
  ]

  const companySizes = [
    '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 shadow-lg shadow-black/5 mb-6"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-gray-600">Step 3 of 3</span>
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
          Your Company Profile
        </h1>
        <p className="text-gray-500">
          {isEnriching ? "We're fetching details from your website..." : "Review and edit your company details"}
        </p>
      </div>

      {/* Company Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-2xl overflow-hidden"
      >
        {/* Loading overlay */}
        {isEnriching && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full border-3 border-purple-200 border-t-purple-500 mb-4"
            />
            <p className="text-gray-600 font-medium">Analyzing website...</p>
            <p className="text-gray-400 text-sm mt-1">Powered by AI</p>
          </div>
        )}

        {/* Card Header with gradient */}
        <div className="h-24 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 relative">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        </div>

        {/* Logo */}
        <div className="relative px-8 -mt-12">
          <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
            {enrichedInfo.logo ? (
              <img
                src={enrichedInfo.logo}
                alt={enrichedInfo.name}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Building2 className="w-10 h-10 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 pt-4">
          {/* Company Name & Website */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{enrichedInfo.name}</h2>
            <a
              href={enrichedInfo.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              <Globe className="w-4 h-4" />
              {enrichedInfo.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Description - Editable */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">About</span>
              {editingField !== 'description' && (
                <button
                  onClick={() => startEditing('description')}
                  className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
              )}
            </div>
            {editingField === 'description' ? (
              <div>
                <textarea
                  value={editValues.description}
                  onChange={(e) => setEditValues(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 resize-none"
                  rows={3}
                  placeholder="Describe what your company does..."
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveEdit('description')}
                    className="px-3 py-1.5 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 leading-relaxed">
                {enrichedInfo.description || (
                  <button
                    onClick={() => startEditing('description')}
                    className="text-gray-400 italic hover:text-purple-500 transition-colors"
                  >
                    + Add a description
                  </button>
                )}
              </p>
            )}
          </div>

          {/* Meta info - All Editable */}
          <div className="grid grid-cols-3 gap-4">
            {/* Location - Not editable here since it was set in step 2 */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Location</span>
              </div>
              <p className="text-gray-900 font-medium">{enrichedInfo.country}</p>
            </div>

            {/* Industry - Editable */}
            <div className="bg-gray-50 rounded-xl p-4 relative group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-gray-400">
                  <Building2 className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Industry</span>
                </div>
                {editingField !== 'industry' && (
                  <button
                    onClick={() => startEditing('industry')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil className="w-3 h-3 text-purple-500" />
                  </button>
                )}
              </div>
              {editingField === 'industry' ? (
                <div className="absolute left-0 right-0 bottom-full mb-1 z-10 bg-white rounded-xl shadow-xl border border-gray-200 p-2 max-h-48 overflow-y-auto">
                  <div className="flex justify-between items-center mb-2 px-2">
                    <span className="text-xs font-medium text-gray-500">Select Industry</span>
                    <button onClick={cancelEdit}>
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                  {industries.map((ind) => (
                    <button
                      key={ind}
                      onClick={() => {
                        setEditValues(prev => ({ ...prev, industry: ind }))
                        setEnrichedInfo(prev => ({ ...prev, industry: ind }))
                        setEditingField(null)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-purple-50 transition-colors ${
                        enrichedInfo.industry === ind ? 'bg-purple-100 text-purple-700' : 'text-gray-700'
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-900 font-medium">
                  {enrichedInfo.industry || (
                    <button
                      onClick={() => startEditing('industry')}
                      className="text-gray-400 text-sm hover:text-purple-500"
                    >
                      + Add
                    </button>
                  )}
                </p>
              )}
            </div>

            {/* Size - Editable */}
            <div className="bg-gray-50 rounded-xl p-4 relative group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-gray-400">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">Size</span>
                </div>
                {editingField !== 'size' && (
                  <button
                    onClick={() => startEditing('size')}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil className="w-3 h-3 text-purple-500" />
                  </button>
                )}
              </div>
              {editingField === 'size' ? (
                <div className="absolute left-0 right-0 bottom-full mb-1 z-10 bg-white rounded-xl shadow-xl border border-gray-200 p-2">
                  <div className="flex justify-between items-center mb-2 px-2">
                    <span className="text-xs font-medium text-gray-500">Company Size</span>
                    <button onClick={cancelEdit}>
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                  {companySizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setEditValues(prev => ({ ...prev, size }))
                        setEnrichedInfo(prev => ({ ...prev, size }))
                        setEditingField(null)
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-purple-50 transition-colors ${
                        enrichedInfo.size === size ? 'bg-purple-100 text-purple-700' : 'text-gray-700'
                      }`}
                    >
                      {size} employees
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-900 font-medium">
                  {enrichedInfo.size || (
                    <button
                      onClick={() => startEditing('size')}
                      className="text-gray-400 text-sm hover:text-purple-500"
                    >
                      + Add
                    </button>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Error message */}
          {enrichError && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-700">{enrichError}</p>
              <button
                onClick={enrichCompanyData}
                className="mt-2 text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Try again
              </button>
            </div>
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
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-gray-600 bg-white/60 backdrop-blur-sm border border-gray-200 hover:bg-white/80 transition-all disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <motion.button
          onClick={handleConfirm}
          disabled={isLoading || isEnriching}
          whileHover={!isLoading && !isEnriching ? { scale: 1.02, y: -2 } : {}}
          whileTap={!isLoading && !isEnriching ? { scale: 0.98 } : {}}
          className="relative flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-white overflow-hidden shadow-xl shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
          <span className="relative z-10 flex items-center gap-2">
            {isLoading ? (
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
                <Check className="w-5 h-5" />
                Looks Good!
              </>
            )}
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
