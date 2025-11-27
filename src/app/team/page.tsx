'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Shield,
  Settings,
  MoreHorizontal,
  CheckCircle,
  Clock,
  X,
  UserPlus,
  Building2,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface TeamMember {
  id: string
  name: string
  email: string
  phone: string
  role: 'admin' | 'manager' | 'viewer'
  department: string
  status: 'active' | 'pending' | 'inactive'
  lastActive: string
  avatar?: string
}

const mockTeam: TeamMember[] = [
  {
    id: 'TM-001',
    name: 'James Wilson',
    email: 'j.wilson@company.com',
    phone: '+1 (555) 123-4567',
    role: 'admin',
    department: 'Operations',
    status: 'active',
    lastActive: '2 mins ago',
  },
  {
    id: 'TM-002',
    name: 'Sarah Martinez',
    email: 's.martinez@company.com',
    phone: '+1 (555) 234-5678',
    role: 'manager',
    department: 'Facility Management',
    status: 'active',
    lastActive: '1 hour ago',
  },
  {
    id: 'TM-003',
    name: 'Michael Chen',
    email: 'm.chen@company.com',
    phone: '+1 (555) 345-6789',
    role: 'manager',
    department: 'IT',
    status: 'active',
    lastActive: '3 hours ago',
  },
  {
    id: 'TM-004',
    name: 'Emily Johnson',
    email: 'e.johnson@company.com',
    phone: '+1 (555) 456-7890',
    role: 'viewer',
    department: 'Finance',
    status: 'active',
    lastActive: 'Yesterday',
  },
  {
    id: 'TM-005',
    name: 'David Kim',
    email: 'd.kim@company.com',
    phone: '+1 (555) 567-8901',
    role: 'viewer',
    department: 'Operations',
    status: 'pending',
    lastActive: 'Invitation sent',
  },
]

export default function ClientTeamPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [showInviteModal, setShowInviteModal] = useState(false)

  const filteredTeam = mockTeam.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = filterRole === 'all' || member.role === filterRole
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Admin' }
      case 'manager':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Manager' }
      case 'viewer':
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Viewer' }
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Unknown' }
    }
  }

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500'
      case 'pending':
        return 'bg-amber-500'
      case 'inactive':
        return 'bg-slate-500'
      default:
        return 'bg-slate-500'
    }
  }

  const stats = {
    total: mockTeam.length,
    active: mockTeam.filter((m) => m.status === 'active').length,
    pending: mockTeam.filter((m) => m.status === 'pending').length,
    admins: mockTeam.filter((m) => m.role === 'admin').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            My Team
          </h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage your organization's portal access
          </p>
        </div>

        <motion.button
          onClick={() => setShowInviteModal(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25"
        >
          <UserPlus className="w-5 h-5" />
          Invite Member
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: stats.total, icon: Users, color: 'blue' },
          { label: 'Active', value: stats.active, icon: CheckCircle, color: 'emerald' },
          { label: 'Pending Invites', value: stats.pending, icon: Clock, color: 'amber' },
          { label: 'Admins', value: stats.admins, icon: Shield, color: 'purple' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                <stat.icon className={`w-5 h-5 ${
                  stat.color === 'blue' ? 'text-blue-500' :
                  stat.color === 'emerald' ? 'text-emerald-500' :
                  stat.color === 'amber' ? 'text-amber-500' :
                  'text-purple-500'
                }`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-2.5 rounded-xl border transition-all ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className={`px-4 py-2.5 rounded-xl border ${
              isDark
                ? 'bg-white/5 border-white/10 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
      </div>

      {/* Team List */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="divide-y divide-white/5">
          {filteredTeam.map((member, index) => {
            const roleBadge = getRoleBadge(member.role)

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`p-5 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-colors`}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${
                      isDark ? 'border-slate-900' : 'border-white'
                    } ${getStatusIndicator(member.status)}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {member.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${roleBadge.bg} ${roleBadge.text}`}>
                        {roleBadge.label}
                      </span>
                      {member.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/20 text-amber-400">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {member.department}
                    </p>
                    <div className={`flex items-center gap-4 mt-2 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4" />
                        {member.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4" />
                        {member.phone}
                      </span>
                    </div>
                  </div>

                  {/* Last Active & Actions */}
                  <div className="text-right">
                    <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {member.lastActive}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                        }`}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {filteredTeam.length === 0 && (
          <div className="p-12 text-center">
            <Users className={`w-12 h-12 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
            <p className={`mt-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              No team members found
            </p>
          </div>
        )}
      </div>

      {/* Role Permissions Info */}
      <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
        <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Role Permissions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              role: 'Admin',
              color: 'purple',
              permissions: ['Full portal access', 'Manage team members', 'View billing', 'Create requests'],
            },
            {
              role: 'Manager',
              color: 'blue',
              permissions: ['View all data', 'Create requests', 'Manage locations', 'View reports'],
            },
            {
              role: 'Viewer',
              color: 'slate',
              permissions: ['View dashboard', 'View requests', 'View locations', 'View reports'],
            },
          ].map((item) => (
            <div
              key={item.role}
              className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Shield className={`w-4 h-4 ${
                  item.color === 'purple' ? 'text-purple-400' :
                  item.color === 'blue' ? 'text-blue-400' :
                  'text-slate-400'
                }`} />
                <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {item.role}
                </span>
              </div>
              <ul className="space-y-1.5">
                {item.permissions.map((perm, i) => (
                  <li key={i} className={`text-sm flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowInviteModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-md rounded-2xl border shadow-2xl ${
              isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
            }`}
          >
            <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Invite Team Member
              </h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Role *
                </label>
                <select className={`w-full px-4 py-2.5 rounded-xl border ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}>
                  <option value="">Select role...</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Department
                </label>
                <input
                  type="text"
                  placeholder="Operations"
                  className={`w-full px-4 py-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>
            </div>

            <div className={`flex items-center justify-end gap-3 p-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <button
                onClick={() => setShowInviteModal(false)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
                  isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25"
              >
                Send Invitation
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
