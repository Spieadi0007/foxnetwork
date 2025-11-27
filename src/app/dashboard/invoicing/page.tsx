'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Receipt,
  FileText,
  CreditCard,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowRight,
  Send,
  Download,
  MoreHorizontal,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

const invoicingStats = [
  { label: 'Total Revenue', value: '$47,250', icon: DollarSign, color: 'from-emerald-500 to-teal-600', trend: '+12%' },
  { label: 'Pending Invoices', value: 8, icon: Clock, color: 'from-amber-500 to-orange-600', trend: null },
  { label: 'Paid This Month', value: '$32,100', icon: CheckCircle2, color: 'from-blue-500 to-cyan-600', trend: '+8%' },
  { label: 'Open Disputes', value: 2, icon: AlertCircle, color: 'from-red-500 to-rose-600', trend: null },
]

const modules = [
  {
    title: 'Invoices',
    description: 'Create, send, and track all invoices',
    href: '/dashboard/invoicing/list',
    icon: FileText,
    count: 24,
    color: 'from-violet-500 to-purple-600',
  },
  {
    title: 'Rate Cards',
    description: 'Manage service rates and pricing',
    href: '/dashboard/invoicing/rate-cards',
    icon: CreditCard,
    count: 6,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    title: 'Disputes',
    description: 'Handle billing disputes and resolutions',
    href: '/dashboard/invoicing/disputes',
    icon: AlertCircle,
    count: 2,
    color: 'from-amber-500 to-orange-600',
  },
]

const recentInvoices = [
  { id: 'INV-001', client: 'TechCorp Inc.', amount: '$4,500', status: 'paid', date: '2025-11-20' },
  { id: 'INV-002', client: 'DataFlow LLC', amount: '$2,800', status: 'pending', date: '2025-11-22' },
  { id: 'INV-003', client: 'SecureBank', amount: '$8,200', status: 'sent', date: '2025-11-23' },
  { id: 'INV-004', client: 'Bay Medical', amount: '$3,100', status: 'overdue', date: '2025-11-10' },
  { id: 'INV-005', client: 'StartupHub', amount: '$1,950', status: 'draft', date: '2025-11-24' },
]

const statusColors = {
  paid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  sent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
  draft: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

export default function InvoicingPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Invoicing</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage invoices, rates, and billing</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25"
        >
          <Receipt className="w-5 h-5" />
          <span>Create Invoice</span>
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {invoicingStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
                  {stat.trend && (
                    <span className="text-xs font-medium text-emerald-400">{stat.trend}</span>
                  )}
                </div>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modules */}
      <div className="grid grid-cols-3 gap-6">
        {modules.map((module, index) => (
          <Link key={module.title} href={module.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'} border backdrop-blur-sm cursor-pointer group h-full`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${module.color}`}>
                  <module.icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{module.count}</span>
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{module.title}</h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{module.description}</p>
              <div className="flex items-center text-emerald-400 text-sm font-medium group-hover:gap-2 transition-all">
                <span>View {module.title}</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Recent Invoices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <FileText className="w-5 h-5 text-violet-400" />
            Recent Invoices
          </h3>
          <Link href="/dashboard/invoicing/list" className="text-sm text-emerald-400 hover:text-emerald-300">
            View All
          </Link>
        </div>

        <div className="space-y-3">
          {recentInvoices.map((invoice, index) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 + 0.6 }}
              className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50 hover:bg-slate-100'} transition-colors group`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                  <FileText className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{invoice.id}</p>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border capitalize ${statusColors[invoice.status as keyof typeof statusColors]}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{invoice.client}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{invoice.amount}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{invoice.date}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                    <Send className="w-4 h-4" />
                  </button>
                  <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                    <Download className="w-4 h-4" />
                  </button>
                  <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
