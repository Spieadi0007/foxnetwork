'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LifeBuoy,
  Search,
  Book,
  FileText,
  Video,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Play,
  HelpCircle,
  Shield,
  Settings,
  Package,
  MapPin,
  Calendar,
  Users,
  Zap,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface Article {
  id: string
  title: string
  description: string
  category: string
  readTime: string
  popular?: boolean
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

const categories = [
  { id: 'getting-started', name: 'Getting Started', icon: Zap, count: 8 },
  { id: 'locations', name: 'Locations', icon: MapPin, count: 12 },
  { id: 'requests', name: 'Service Requests', icon: FileText, count: 15 },
  { id: 'equipment', name: 'Equipment', icon: Package, count: 10 },
  { id: 'team', name: 'Team Management', icon: Users, count: 6 },
  { id: 'billing', name: 'Billing & Payments', icon: Settings, count: 9 },
]

const popularArticles: Article[] = [
  {
    id: 'ART-001',
    title: 'How to Create a Service Request',
    description: 'Learn how to submit deployment, maintenance, and repair requests.',
    category: 'requests',
    readTime: '3 min',
    popular: true,
  },
  {
    id: 'ART-002',
    title: 'Adding a New Location',
    description: 'Step-by-step guide to adding and managing your deployment locations.',
    category: 'locations',
    readTime: '5 min',
    popular: true,
  },
  {
    id: 'ART-003',
    title: 'Understanding Project Stages',
    description: 'Track your projects from planning to completion.',
    category: 'requests',
    readTime: '4 min',
    popular: true,
  },
  {
    id: 'ART-004',
    title: 'Inviting Team Members',
    description: 'How to add colleagues and manage their access permissions.',
    category: 'team',
    readTime: '2 min',
    popular: true,
  },
]

const faqs: FAQ[] = [
  {
    id: 'FAQ-001',
    question: 'How do I request a new equipment deployment?',
    answer: 'To request a new deployment, go to the Requests section and click "New Request". Select "Deployment" as the request type, choose the location, and provide details about your requirements. Our team will review and get back to you within 24 hours.',
    category: 'requests',
  },
  {
    id: 'FAQ-002',
    question: 'What is the typical timeline for a new installation?',
    answer: 'Installation timelines vary based on complexity and location. Simple installations typically take 1-2 weeks, while larger deployments may take 3-4 weeks. You can track real-time progress in the Projects section once your request is approved.',
    category: 'requests',
  },
  {
    id: 'FAQ-003',
    question: 'How do I add a team member to my account?',
    answer: 'Navigate to the Team section and click "Invite Member". Enter their email address, select their role (Admin, Manager, or Viewer), and they will receive an invitation email. They can then create their account and access the portal.',
    category: 'team',
  },
  {
    id: 'FAQ-004',
    question: 'Can I track the real-time status of my equipment?',
    answer: 'Yes! The Equipment section shows real-time status including connectivity, usage metrics, and maintenance history. You can also view equipment locations on the Map View for a visual overview of all your deployments.',
    category: 'equipment',
  },
  {
    id: 'FAQ-005',
    question: 'How do I report an issue with my equipment?',
    answer: 'You can report issues through the Requests section by creating a "Repair" type request. Alternatively, use the Live Chat support for urgent issues. Include details like the equipment ID, location, and description of the problem.',
    category: 'equipment',
  },
]

const videoTutorials = [
  { id: 'VID-001', title: 'Portal Overview', duration: '5:30', thumbnail: 'dashboard' },
  { id: 'VID-002', title: 'Creating Your First Request', duration: '3:45', thumbnail: 'requests' },
  { id: 'VID-003', title: 'Managing Locations', duration: '4:15', thumbnail: 'locations' },
  { id: 'VID-004', title: 'Team Collaboration', duration: '3:00', thumbnail: 'team' },
]

export default function ClientHelpPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 mb-4"
        >
          <LifeBuoy className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Help Center
        </h1>
        <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Find answers, tutorials, and resources to help you get the most out of your client portal
        </p>

        {/* Search */}
        <div className="relative mt-6">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-4 rounded-2xl border transition-all text-lg ${
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20'
                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm'
            }`}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category, index) => (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
            className={`p-4 rounded-2xl border text-center transition-all ${
              selectedCategory === category.id
                ? isDark
                  ? 'bg-blue-500/20 border-blue-500/50'
                  : 'bg-blue-50 border-blue-200'
                : isDark
                ? 'bg-white/5 border-white/10 hover:bg-white/10'
                : 'bg-white border-slate-200 hover:shadow-md'
            }`}
          >
            <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center ${
              selectedCategory === category.id
                ? 'bg-blue-500/20'
                : isDark
                ? 'bg-white/10'
                : 'bg-slate-100'
            }`}>
              <category.icon className={`w-5 h-5 ${
                selectedCategory === category.id
                  ? 'text-blue-400'
                  : isDark
                  ? 'text-slate-400'
                  : 'text-slate-500'
              }`} />
            </div>
            <p className={`text-sm font-medium mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {category.name}
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              {category.count} articles
            </p>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Articles */}
        <div className="lg:col-span-2 space-y-6">
          <div className={`rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <h2 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Book className="w-5 h-5 text-blue-400" />
                Popular Articles
              </h2>
            </div>
            <div className="divide-y divide-white/5">
              {popularArticles.map((article, index) => (
                <motion.a
                  key={article.id}
                  href="#"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-4 transition-colors ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {article.title}
                    </h3>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {article.description}
                    </p>
                    <div className={`flex items-center gap-3 mt-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <span>{article.readTime} read</span>
                      {article.popular && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">Popular</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className={`rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <h2 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <HelpCircle className="w-5 h-5 text-purple-400" />
                Frequently Asked Questions
              </h2>
            </div>
            <div className="divide-y divide-white/5">
              {filteredFaqs.map((faq) => (
                <div key={faq.id}>
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: expandedFaq === faq.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {expandedFaq === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className={`px-4 pb-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Video Tutorials */}
          <div className={`rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
            <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <h2 className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <Video className="w-5 h-5 text-red-400" />
                Video Tutorials
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {videoTutorials.map((video) => (
                <motion.button
                  key={video.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {video.title}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {video.duration}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className={`rounded-2xl border p-5 ${
            isDark
              ? 'bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-teal-500/20 border-white/10'
              : 'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 border-blue-200'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Need More Help?
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Our team is here for you
                </p>
              </div>
            </div>
            <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Can't find what you're looking for? Chat with our support team for personalized assistance.
            </p>
            <motion.a
              href="/client/support"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25"
            >
              Start Live Chat
              <ChevronRight className="w-4 h-4" />
            </motion.a>
          </div>

          {/* Documentation Link */}
          <div className={`rounded-2xl border p-5 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                <FileText className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              </div>
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Documentation
                </h3>
              </div>
            </div>
            <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Access our comprehensive documentation for detailed guides and API references.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-medium ${
                isDark
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              View Documentation
              <ExternalLink className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
