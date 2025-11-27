'use client'

import { motion } from 'framer-motion'
import { Briefcase, Users, Check, Sparkles } from 'lucide-react'
import type { CompanyType } from '@/types/user'

interface StepRoleProps {
  userName: string
  selectedType: CompanyType | null
  onTypeSelect: (type: CompanyType) => void
  onContinue: () => void
}

export function StepRole({ userName, selectedType, onTypeSelect, onContinue }: StepRoleProps) {
  const types = [
    {
      id: 'client' as CompanyType,
      title: 'Client',
      icon: Briefcase,
      description: 'I need services and want to connect with partners',
      benefits: [
        'Find qualified partners',
        'Manage service requests',
        'Track project progress',
      ],
      iconGradient: 'from-emerald-400 to-cyan-500',
    },
    {
      id: 'partner' as CompanyType,
      title: 'Partner',
      icon: Users,
      description: 'I provide services and expertise to clients',
      benefits: [
        'Showcase your expertise',
        'Connect with clients',
        'Grow your business',
      ],
      iconGradient: 'from-amber-400 to-orange-500',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="text-center mb-14">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 shadow-lg shadow-black/5 mb-6"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-gray-600">Step 1 of 2</span>
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          Welcome, <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent italic">{userName}!</span> 👋
        </h1>
        <p className="text-gray-500 text-lg">
          Let's get to know you better. How will you be using Fox?
        </p>
      </div>

      {/* Type Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {types.map((type, index) => {
          const isSelected = selectedType === type.id
          return (
            <motion.button
              key={type.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTypeSelect(type.id)}
              className={`
                relative p-8 rounded-3xl text-left overflow-hidden
                bg-white/70 backdrop-blur-xl
                border-2 transition-all duration-300
                ${isSelected
                  ? 'border-purple-300 shadow-2xl shadow-purple-200/50'
                  : 'border-white/60 shadow-xl shadow-black/5 hover:shadow-2xl hover:border-gray-200'
                }
                cursor-pointer group
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg"
                >
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                </motion.div>
              )}

              <div className="relative z-10">
                {/* Icon */}
                <motion.div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${type.iconGradient} flex items-center justify-center mb-6 shadow-lg`}
                  whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.5 } }}
                >
                  <type.icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                </motion.div>

                {/* Title & Description */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {type.title}
                </h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  {type.description}
                </p>

                {/* Benefits */}
                <ul className="space-y-3">
                  {type.benefits.map((benefit, i) => (
                    <motion.li
                      key={benefit}
                      className="flex items-center text-sm text-gray-600"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 + i * 0.05 }}
                    >
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${type.iconGradient} flex items-center justify-center mr-3 shadow-sm`}>
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                      {benefit}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="flex justify-center"
      >
        <motion.button
          onClick={onContinue}
          disabled={!selectedType}
          whileHover={selectedType ? { scale: 1.02, y: -2 } : {}}
          whileTap={selectedType ? { scale: 0.98 } : {}}
          className={`
            relative px-10 py-4 rounded-full font-semibold text-lg overflow-hidden
            transition-all duration-500
            ${selectedType
              ? 'text-white shadow-2xl shadow-purple-500/30'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {selectedType && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: '200% 200%' }}
            />
          )}
          <span className="relative z-10">Continue</span>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
