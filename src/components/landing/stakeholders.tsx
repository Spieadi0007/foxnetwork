'use client'

import { motion } from 'framer-motion'
import {
  Building2,
  Handshake,
  Wrench,
  ArrowRight,
} from 'lucide-react'

const stakeholders = [
  {
    type: 'For Clients',
    icon: Building2,
    tagline: 'Centralized Control, Global Visibility',
    description:
      'Manage your entire service network from a single platform with real-time insights and complete operational control.',
  },
  {
    type: 'For Partners',
    icon: Handshake,
    tagline: 'Grow Your Business, Maximize Revenue',
    description:
      'Access global opportunities, manage tasks efficiently, and build reputation through transparent performance tracking.',
  },
  {
    type: 'For Technicians',
    icon: Wrench,
    tagline: 'Streamlined Workflows, Career Growth',
    description:
      'Execute tasks with guided workflows and advance your career with skill-based recognition and performance tracking.',
  },
]

export function Stakeholders() {
  return (
    <section id="solutions" className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
            Built for Every Stakeholder
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Purpose-built solutions for clients, partners, and technicians. One platform, three powerful experiences.
          </p>
        </motion.div>

        {/* Stakeholder Cards - Simple Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {stakeholders.map((stakeholder, index) => (
            <motion.div
              key={stakeholder.type}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="p-8 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg bg-white h-full flex flex-col">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-6 group-hover:bg-mint-100 transition-colors">
                  <stakeholder.icon className="w-6 h-6 text-gray-700 group-hover:text-mint-600 transition-colors" />
                </div>

                {/* Type */}
                <div className="text-sm font-medium text-mint-600 mb-3">
                  {stakeholder.type}
                </div>

                {/* Tagline */}
                <h3 className="text-xl font-bold mb-3 text-foreground">
                  {stakeholder.tagline}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed mb-6 flex-grow">
                  {stakeholder.description}
                </p>

                {/* Learn More Link */}
                <a
                  href="#"
                  className="inline-flex items-center text-sm font-medium text-foreground hover:text-mint-600 transition-colors group"
                >
                  Learn more
                  <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
