'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser-client'
import { toast } from 'sonner'
import type { CompanyType, CompanyInfo } from '@/types/user'
import { StepRole } from './steps/step-role'
import { StepCompanyDetails } from './steps/step-company-details'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [userName, setUserName] = useState('')
  const [selectedType, setSelectedType] = useState<CompanyType | null>(null)
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    logo: null,
    website: '',
    country: '',
    description: null,
    industry: null,
    size: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/sign-in')
        return
      }

      const fullName = user.user_metadata?.full_name || 'there'
      const firstName = fullName.split(' ')[0]
      setUserName(firstName)

      // Check if user already completed onboarding
      const { data: profile } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (profile?.onboarding_completed) {
        router.push('/dashboard')
      }
    }

    checkAuth()
  }, [router, supabase])

  const handleTypeSelect = (type: CompanyType) => {
    setSelectedType(type)
  }

  const handleTypeContinue = () => {
    if (selectedType) {
      setStep(2)
    }
  }

  const handleCompanyDetailsSubmit = async (finalInfo: CompanyInfo) => {
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please sign in first')
        router.push('/sign-in')
        return
      }

      // First, create the company with the selected type
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: finalInfo.name,
          type: selectedType,
          website: finalInfo.website,
          logo: finalInfo.logo,
          country: finalInfo.country,
          description: finalInfo.description,
          industry: finalInfo.industry,
          size: finalInfo.size,
          created_by: user.id,
        })
        .select()
        .single()

      if (companyError) {
        console.error('Error creating company:', companyError)
        toast.error('Failed to create company. Please try again.')
        setIsLoading(false)
        return
      }

      // Then, link the user to the company as admin
      const { error: userError } = await supabase
        .from('users')
        .update({
          role: 'admin',
          company_id: company.id,
          onboarding_completed: true,
        })
        .eq('id', user.id)

      if (userError) {
        console.error('Error updating user:', userError)
        toast.error('Failed to save your profile. Please try again.')
        setIsLoading(false)
        return
      }

      toast.success('Welcome aboard! Your profile is ready.')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-teal-200/40 to-cyan-200/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-200/40 to-rose-200/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, 15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-purple-100/30 to-indigo-100/30 rounded-full blur-3xl"
        />
      </div>

      {/* Progress indicator */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-2">
          {[1, 2].map((s) => (
            <motion.div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step ? 'w-8 bg-gradient-to-r from-violet-500 to-purple-500' :
                s < step ? 'w-2 bg-purple-400' : 'w-2 bg-gray-300'
              }`}
              initial={false}
              animate={{ scale: s === step ? 1 : 0.9 }}
            />
          ))}
        </div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepRole
              key="role"
              userName={userName}
              selectedType={selectedType}
              onTypeSelect={handleTypeSelect}
              onContinue={handleTypeContinue}
            />
          )}
          {step === 2 && (
            <StepCompanyDetails
              key="company-details"
              onSubmit={handleCompanyDetailsSubmit}
              onBack={handleBack}
              initialData={companyInfo}
              isSubmitting={isLoading}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
