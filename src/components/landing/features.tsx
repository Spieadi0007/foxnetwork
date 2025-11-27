'use client'

import { motion } from 'framer-motion'
import {
  Network,
  Zap,
  Shield,
  BarChart3,
  Globe2,
  Users,
  Workflow,
  Clock,
  Target,
} from 'lucide-react'
import { Card } from '@/components/ui/card'

const features = [
  {
    icon: Network,
    title: 'Intelligent Matching Engine',
    description:
      'AI-powered algorithms match service requests with the most qualified partners based on skills, performance, and availability.',
    color: 'mint',
  },
  {
    icon: Workflow,
    title: 'Configurable Workflows',
    description:
      'Design custom workflows that adapt to your unique operational needs with our flexible, no-code workflow builder.',
    color: 'lavender',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description:
      'Comprehensive dashboards provide instant visibility into operations, performance metrics, and actionable insights.',
    color: 'peach',
  },
  {
    icon: Globe2,
    title: 'Global Scalability',
    description:
      'Multi-tenant architecture with localization support ensures seamless operations across regions and time zones.',
    color: 'mint',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'Bank-level encryption, role-based access control, and compliance with global security standards protect your data.',
    color: 'coral',
  },
  {
    icon: Zap,
    title: 'Real-time Communication',
    description:
      'Instant messaging, notifications, and updates keep all stakeholders connected and informed throughout the workflow.',
    color: 'lavender',
  },
  {
    icon: Users,
    title: 'Multi-stakeholder Platform',
    description:
      'Purpose-built interfaces for clients, partners, and technicians ensure optimal experience for every user type.',
    color: 'peach',
  },
  {
    icon: Clock,
    title: 'Performance Tracking',
    description:
      '360-degree performance monitoring with automated SLA tracking and compliance reporting for accountability.',
    color: 'mint',
  },
  {
    icon: Target,
    title: 'Smart Task Allocation',
    description:
      'Automated task routing based on partner capacity, skills, location, and historical performance data.',
    color: 'coral',
  },
]

const colorClasses = {
  mint: {
    bg: 'bg-mint-100',
    icon: 'text-mint-600',
    border: 'border-mint-200',
    shadow: 'shadow-mint-500/10',
  },
  lavender: {
    bg: 'bg-lavender-100',
    icon: 'text-lavender-600',
    border: 'border-lavender-200',
    shadow: 'shadow-lavender-500/10',
  },
  peach: {
    bg: 'bg-peach-100',
    icon: 'text-peach-600',
    border: 'border-peach-200',
    shadow: 'shadow-peach-500/10',
  },
  coral: {
    bg: 'bg-coral-100',
    icon: 'text-coral-600',
    border: 'border-coral-200',
    shadow: 'shadow-coral-500/10',
  },
}

export function Features() {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-background to-mint-50/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-mint-600 to-lavender-600 bg-clip-text text-transparent">
            Powerful Features for Modern Operations
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to manage global operations seamlessly, from intelligent matching to real-time analytics.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const colors = colorClasses[feature.color as keyof typeof colorClasses]
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`p-6 h-full bg-white/60 backdrop-blur-sm border ${colors.border} ${colors.shadow} hover:shadow-lg transition-all duration-300 group cursor-pointer`}>
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
