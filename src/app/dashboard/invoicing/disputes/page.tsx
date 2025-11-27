'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  FileText,
  User,
  Calendar,
  DollarSign,
  Send,
  Paperclip,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface Dispute {
  id: string
  invoiceNumber: string
  client: string
  amount: number
  disputedAmount: number
  reason: string
  status: 'open' | 'in_review' | 'resolved' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  messages: { from: string; message: string; date: string }[]
}

const mockDisputes: Dispute[] = [
  {
    id: 'DSP-001',
    invoiceNumber: 'INV-2025-004',
    client: 'Bay Medical Center',
    amount: 3100,
    disputedAmount: 800,
    reason: 'Service not completed as described - WiFi coverage incomplete in west wing',
    status: 'open',
    priority: 'high',
    createdAt: '2025-11-18',
    messages: [
      { from: 'Bay Medical Center', message: 'The WiFi coverage does not extend to the west wing as agreed. We need this resolved before paying.', date: '2025-11-18' },
      { from: 'Support Team', message: 'We apologize for the inconvenience. Our team is reviewing the scope of work to verify the coverage area.', date: '2025-11-19' },
    ],
  },
  {
    id: 'DSP-002',
    invoiceNumber: 'INV-2025-002',
    client: 'DataFlow LLC',
    amount: 2800,
    disputedAmount: 500,
    reason: 'Charged for 4 routers but only 3 were installed',
    status: 'in_review',
    priority: 'medium',
    createdAt: '2025-11-20',
    messages: [
      { from: 'DataFlow LLC', message: 'Invoice shows 4 routers configured but we only have 3 installed at our site.', date: '2025-11-20' },
    ],
  },
]

const statusConfig = {
  open: { label: 'Open', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: AlertCircle },
  in_review: { label: 'In Review', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
}

const priorityConfig = {
  low: { label: 'Low', color: 'bg-slate-500/20 text-slate-400' },
  medium: { label: 'Medium', color: 'bg-amber-500/20 text-amber-400' },
  high: { label: 'High', color: 'bg-red-500/20 text-red-400' },
}

export default function DisputesPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(mockDisputes[0])
  const [showFilters, setShowFilters] = useState(false)
  const [newMessage, setNewMessage] = useState('')

  const filteredDisputes = mockDisputes.filter(dispute => {
    const matchesSearch = dispute.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.client.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Disputes</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Handle billing disputes and resolutions</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-medium">
            {mockDisputes.filter(d => d.status === 'open').length} Open
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search disputes..."
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

      <div className="flex gap-6 h-[calc(100vh-320px)]">
        {/* Disputes List */}
        <div className="w-96 space-y-3 overflow-y-auto">
          {filteredDisputes.map((dispute, index) => {
            const StatusIcon = statusConfig[dispute.status].icon
            return (
              <motion.div
                key={dispute.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedDispute(dispute)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedDispute?.id === dispute.id
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{dispute.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityConfig[dispute.priority].color}`}>
                      {priorityConfig[dispute.priority].label}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 ${statusConfig[dispute.status].color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusConfig[dispute.status].label}
                  </span>
                </div>

                <h4 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{dispute.client}</h4>
                <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{dispute.reason}</p>

                <div className="flex items-center justify-between text-sm">
                  <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{dispute.invoiceNumber}</span>
                  <span className="text-red-400 font-medium">-${dispute.disputedAmount}</span>
                </div>
              </motion.div>
            )
          })}

          {filteredDisputes.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>No open disputes</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>All billing issues have been resolved</p>
            </div>
          )}
        </div>

        {/* Dispute Detail */}
        {selectedDispute && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex-1 flex flex-col rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'} border overflow-hidden`}
          >
            {/* Header */}
            <div className={`p-6 ${isDark ? 'border-white/10' : 'border-slate-200'} border-b`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedDispute.id}</h3>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${statusConfig[selectedDispute.status].color}`}>
                      {statusConfig[selectedDispute.status].label}
                    </span>
                  </div>
                  <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>{selectedDispute.client}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Disputed Amount</p>
                  <p className="text-2xl font-bold text-red-400">-${selectedDispute.disputedAmount}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Invoice</span>
                  </div>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedDispute.invoiceNumber}</p>
                </div>
                <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Original Amount</span>
                  </div>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>${selectedDispute.amount}</p>
                </div>
                <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Opened</span>
                  </div>
                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedDispute.createdAt}</p>
                </div>
              </div>

              {/* Reason */}
              <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className={`text-sm ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>{selectedDispute.reason}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              <h4 className={`text-sm font-medium flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <MessageSquare className="w-4 h-4" />
                Communication History
              </h4>

              {selectedDispute.messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl ${msg.from === 'Support Team' ? 'bg-emerald-500/10 border border-emerald-500/20 ml-8' : isDark ? 'bg-white/5 mr-8' : 'bg-slate-50 mr-8'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${msg.from === 'Support Team' ? 'bg-emerald-500' : 'bg-violet-500'}`}>
                      <User className="w-3 h-3 text-white" />
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{msg.from}</span>
                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{msg.date}</span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{msg.message}</p>
                </motion.div>
              ))}
            </div>

            {/* Reply Input */}
            <div className={`p-4 ${isDark ? 'border-white/10' : 'border-slate-200'} border-t`}>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type your response..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className={`w-full px-4 py-3 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'} border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20`}
                  />
                  <button className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </motion.button>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mt-3">
                <button className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30">
                  Accept & Credit
                </button>
                <button className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/30">
                  Request More Info
                </button>
                <button className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30">
                  Reject Dispute
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
