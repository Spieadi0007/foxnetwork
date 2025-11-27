'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Plus,
  FileText,
  Send,
  Download,
  MoreHorizontal,
  ChevronDown,
  Calendar,
  DollarSign,
  Building2,
  Eye,
  Edit3,
  Trash2,
  XCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Printer,
  Copy,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface Invoice {
  id: string
  invoiceNumber: string
  client: {
    name: string
    company: string
    email: string
  }
  amount: number
  status: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled'
  issueDate: string
  dueDate: string
  items: { description: string; quantity: number; rate: number }[]
  notes: string
}

const mockInvoices: Invoice[] = [
  {
    id: 'INV-001',
    invoiceNumber: 'INV-2025-001',
    client: { name: 'John Smith', company: 'TechCorp Inc.', email: 'john@techcorp.com' },
    amount: 4500,
    status: 'paid',
    issueDate: '2025-11-15',
    dueDate: '2025-11-30',
    items: [
      { description: 'Network Installation', quantity: 1, rate: 3500 },
      { description: 'Cable Management', quantity: 10, rate: 100 },
    ],
    notes: 'Thank you for your business!',
  },
  {
    id: 'INV-002',
    invoiceNumber: 'INV-2025-002',
    client: { name: 'Sarah Davis', company: 'DataFlow LLC', email: 'sarah@dataflow.com' },
    amount: 2800,
    status: 'pending',
    issueDate: '2025-11-20',
    dueDate: '2025-12-05',
    items: [
      { description: 'Router Configuration', quantity: 4, rate: 500 },
      { description: 'Site Survey', quantity: 1, rate: 800 },
    ],
    notes: 'Net 15 terms',
  },
  {
    id: 'INV-003',
    invoiceNumber: 'INV-2025-003',
    client: { name: 'Robert Chen', company: 'SecureBank', email: 'robert@securebank.com' },
    amount: 8200,
    status: 'sent',
    issueDate: '2025-11-22',
    dueDate: '2025-12-07',
    items: [
      { description: 'Security Camera Installation', quantity: 12, rate: 450 },
      { description: 'Access Control Setup', quantity: 1, rate: 2800 },
    ],
    notes: 'Priority installation completed',
  },
  {
    id: 'INV-004',
    invoiceNumber: 'INV-2025-004',
    client: { name: 'Dr. Lisa Park', company: 'Bay Medical Center', email: 'lisa@baymedical.org' },
    amount: 3100,
    status: 'overdue',
    issueDate: '2025-11-01',
    dueDate: '2025-11-15',
    items: [
      { description: 'WiFi Network Expansion', quantity: 1, rate: 3100 },
    ],
    notes: 'Please process payment ASAP',
  },
  {
    id: 'INV-005',
    invoiceNumber: 'INV-2025-005',
    client: { name: 'Tom Wilson', company: 'StartupHub', email: 'tom@startuphub.io' },
    amount: 1950,
    status: 'draft',
    issueDate: '2025-11-24',
    dueDate: '2025-12-09',
    items: [
      { description: 'Structured Cabling', quantity: 30, rate: 65 },
    ],
    notes: 'Draft - needs review',
  },
]

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: FileText },
  sent: { label: 'Sent', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Send },
  pending: { label: 'Pending', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock },
  paid: { label: 'Paid', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  overdue: { label: 'Overdue', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: AlertCircle },
  cancelled: { label: 'Cancelled', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: XCircle },
}

export default function InvoicesPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.company.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totals = {
    all: mockInvoices.reduce((sum, inv) => sum + inv.amount, 0),
    paid: mockInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0),
    pending: mockInvoices.filter(inv => ['pending', 'sent'].includes(inv.status)).reduce((sum, inv) => sum + inv.amount, 0),
    overdue: mockInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0),
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Invoices</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Create and manage all invoices</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>New Invoice</span>
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: totals.all, color: isDark ? 'text-white' : 'text-slate-900' },
          { label: 'Paid', value: totals.paid, color: 'text-emerald-400' },
          { label: 'Pending', value: totals.pending, color: 'text-amber-400' },
          { label: 'Overdue', value: totals.overdue, color: 'text-red-400' },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border`}
          >
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.label}</p>
            <p className={`text-2xl font-bold mt-1 ${item.color}`}>
              ${item.value.toLocaleString()}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 shadow-sm'} border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/30 transition-all`}
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'} border rounded-xl text-sm transition-all`}
          >
            <Filter className="w-4 h-4" />
            <span>Status</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`absolute top-full mt-2 left-0 w-48 p-2 ${isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200 shadow-lg'} border rounded-xl z-10`}
              >
                <button
                  onClick={() => { setStatusFilter('all'); setShowFilters(false) }}
                  className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors ${statusFilter === 'all' ? 'bg-emerald-500/20 text-emerald-400' : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  All Status
                </button>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => { setStatusFilter(key); setShowFilters(false) }}
                    className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors flex items-center gap-2 ${statusFilter === key ? 'bg-emerald-500/20 text-emerald-400' : isDark ? 'text-slate-300 hover:bg-white/5' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    <config.icon className="w-4 h-4" />
                    {config.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Invoices List */}
        <div className="flex-1 space-y-3">
          {filteredInvoices.map((invoice, index) => {
            const StatusIcon = statusConfig[invoice.status].icon
            return (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedInvoice(invoice)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  selectedInvoice?.id === invoice.id
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${selectedInvoice?.id === invoice.id ? 'bg-emerald-500/20' : isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                      <FileText className={`w-5 h-5 ${selectedInvoice?.id === invoice.id ? 'text-emerald-400' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{invoice.invoiceNumber}</p>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{invoice.client.company}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${statusConfig[invoice.status].color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusConfig[invoice.status].label}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className={`flex items-center gap-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Due {invoice.dueDate}
                    </span>
                  </div>
                  <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>${invoice.amount.toLocaleString()}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedInvoice && (
            <motion.div
              initial={{ opacity: 0, x: 50, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 400 }}
              exit={{ opacity: 0, x: 50, width: 0 }}
              className="flex-shrink-0"
            >
              <div className={`w-[400px] p-6 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border backdrop-blur-sm`}>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Invoice</span>
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedInvoice.invoiceNumber}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border mb-6 ${statusConfig[selectedInvoice.status].color}`}>
                  {(() => { const Icon = statusConfig[selectedInvoice.status].icon; return <Icon className="w-4 h-4" /> })()}
                  {statusConfig[selectedInvoice.status].label}
                </span>

                {/* Client Info */}
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'} mb-6`}>
                  <div className="flex items-center gap-3 mb-3">
                    <Building2 className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedInvoice.client.company}</p>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedInvoice.client.name}</p>
                    </div>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedInvoice.client.email}</p>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Issue Date</p>
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedInvoice.issueDate}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                    <p className={`text-xs mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Due Date</p>
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedInvoice.dueDate}</p>
                  </div>
                </div>

                {/* Line Items */}
                <div className="mb-6">
                  <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Items</h4>
                  <div className="space-y-2">
                    {selectedInvoice.items.map((item, index) => (
                      <div key={index} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                        <div>
                          <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.description}</p>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.quantity} x ${item.rate}</p>
                        </div>
                        <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>${(item.quantity * item.rate).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
                  <p className="text-emerald-400 font-medium">Total Amount</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>${selectedInvoice.amount.toLocaleString()}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </motion.button>
                  <button className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'} border`}>
                    <Download className="w-4 h-4" />
                  </button>
                  <button className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'} border`}>
                    <Printer className="w-4 h-4" />
                  </button>
                  <button className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'} border`}>
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
