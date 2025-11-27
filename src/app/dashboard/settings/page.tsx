'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  User,
  Building2,
  Bell,
  Shield,
  Palette,
  Globe,
  CreditCard,
  Users,
  Mail,
  Key,
  Smartphone,
  Moon,
  Sun,
  Check,
  ChevronRight,
  Camera,
  Save,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

type SettingsTab = 'profile' | 'company' | 'notifications' | 'security' | 'appearance' | 'billing'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'billing', label: 'Billing', icon: CreditCard },
]

export default function SettingsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [darkMode, setDarkMode] = useState(true)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Settings</h1>
        <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage your account and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 space-y-1">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              whileHover={{ x: 4 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : `${isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
              {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Profile Information</h3>

                {/* Avatar */}
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                      <span className="text-white font-bold text-3xl">A</span>
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Aditya</h4>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Admin</p>
                    <button className="mt-2 text-sm text-emerald-400 hover:text-emerald-300">
                      Change Avatar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Full Name</label>
                    <input
                      type="text"
                      defaultValue="Aditya"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Email</label>
                    <input
                      type="email"
                      defaultValue="aditya@fox.io"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Phone</label>
                    <input
                      type="tel"
                      defaultValue="+1 555-0123"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Role</label>
                    <input
                      type="text"
                      defaultValue="Admin"
                      disabled
                      className={`w-full px-4 py-2.5 border rounded-xl cursor-not-allowed ${isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeTab === 'company' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Company Information</h3>

                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Company Name</label>
                    <input
                      type="text"
                      defaultValue="Fox Technologies"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Industry</label>
                    <select className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                      <option>Technology</option>
                      <option>Telecommunications</option>
                      <option>Security</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Company Size</label>
                    <select className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                      <option>1-10 employees</option>
                      <option>11-50 employees</option>
                      <option>51-200 employees</option>
                      <option>200+ employees</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Website</label>
                    <input
                      type="url"
                      defaultValue="https://fox.io"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Country</label>
                    <select className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                      <option>United States</option>
                      <option>Canada</option>
                      <option>United Kingdom</option>
                    </select>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </motion.button>
              </div>

              {/* Team Members */}
              <div className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>Team Members</h3>
                  <button className="text-sm text-emerald-400 hover:text-emerald-300">
                    Invite Member
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    { name: 'Aditya', email: 'aditya@fox.io', role: 'Admin', status: 'active' },
                    { name: 'Mike Johnson', email: 'mike@fox.io', role: 'Member', status: 'active' },
                    { name: 'Emily Williams', email: 'emily@fox.io', role: 'Member', status: 'pending' },
                  ].map((member) => (
                    <div key={member.email} className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                          <span className="text-white font-bold">{member.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{member.name}</p>
                          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-lg text-sm ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{member.role}</span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${member.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {member.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
            >
              <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Notification Preferences</h3>

              <div className="space-y-6">
                {[
                  { title: 'Email Notifications', description: 'Receive email updates about your account', enabled: true },
                  { title: 'Push Notifications', description: 'Receive push notifications on your device', enabled: true },
                  { title: 'Work Order Updates', description: 'Get notified when work orders are updated', enabled: true },
                  { title: 'Team Activity', description: 'Get notified about team member activities', enabled: false },
                  { title: 'Invoice Reminders', description: 'Receive reminders for pending invoices', enabled: true },
                  { title: 'Marketing Emails', description: 'Receive promotional emails and updates', enabled: false },
                ].map((setting) => (
                  <div key={setting.title} className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{setting.title}</p>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{setting.description}</p>
                    </div>
                    <button
                      className={`relative w-12 h-6 rounded-full transition-colors ${setting.enabled ? 'bg-emerald-500' : isDark ? 'bg-slate-600' : 'bg-slate-300'}`}
                    >
                      <motion.div
                        className="absolute top-1 w-4 h-4 rounded-full bg-white"
                        animate={{ left: setting.enabled ? '1.5rem' : '0.25rem' }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Password</h3>

                <div className="space-y-4 max-w-md">
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Current Password</label>
                    <input
                      type="password"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>New Password</label>
                    <input
                      type="password"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Confirm New Password</label>
                    <input
                      type="password"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium"
                  >
                    <Key className="w-4 h-4" />
                    Update Password
                  </motion.button>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Two-Factor Authentication</h3>
                <p className={`mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Add an extra layer of security to your account</p>
                <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'}`}>
                  <Smartphone className="w-5 h-5" />
                  Enable 2FA
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
            >
              <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Appearance</h3>

              <div className="space-y-6">
                <div>
                  <p className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Theme</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setDarkMode(true)}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${darkMode ? 'bg-emerald-500/20 border-emerald-500/30' : isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                    >
                      <Moon className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                      <span className={darkMode ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'}>Dark</span>
                      {darkMode && <Check className="w-4 h-4 text-emerald-400 ml-2" />}
                    </button>
                    <button
                      onClick={() => setDarkMode(false)}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${!darkMode ? 'bg-emerald-500/20 border-emerald-500/30' : isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                    >
                      <Sun className={`w-5 h-5 ${!darkMode ? 'text-emerald-400' : isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                      <span className={!darkMode ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'}>Light</span>
                      {!darkMode && <Check className="w-4 h-4 text-emerald-400 ml-2" />}
                    </button>
                  </div>
                </div>

                <div>
                  <p className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Language</p>
                  <select className={`w-full max-w-xs px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                    <option>English (US)</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>

                <div>
                  <p className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Timezone</p>
                  <select className={`w-full max-w-xs px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                    <option>Pacific Time (PT)</option>
                    <option>Mountain Time (MT)</option>
                    <option>Central Time (CT)</option>
                    <option>Eastern Time (ET)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-emerald-400 text-sm font-medium">Current Plan</p>
                    <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Pro Plan</h3>
                  </div>
                  <span className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-medium">
                    Active
                  </span>
                </div>
                <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Unlimited work orders, team members, and premium support</p>
                <div className="flex gap-3">
                  <button className={`px-4 py-2 rounded-xl text-sm font-medium ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/50 text-slate-900 hover:bg-white/70'}`}>
                    Upgrade Plan
                  </button>
                  <button className={`px-4 py-2 rounded-xl text-sm font-medium ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-900'}`}>
                    View Plans
                  </button>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Payment Method</h3>
                <div className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/20">
                      <CreditCard className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Visa ending in 4242</p>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Expires 12/2026</p>
                    </div>
                  </div>
                  <button className="text-emerald-400 text-sm font-medium hover:text-emerald-300">
                    Update
                  </button>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Billing History</h3>
                <div className="space-y-3">
                  {[
                    { date: 'Nov 1, 2025', amount: '$99.00', status: 'Paid' },
                    { date: 'Oct 1, 2025', amount: '$99.00', status: 'Paid' },
                    { date: 'Sep 1, 2025', amount: '$99.00', status: 'Paid' },
                  ].map((invoice, index) => (
                    <div key={index} className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{invoice.date}</p>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Pro Plan - Monthly</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{invoice.amount}</span>
                        <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs">
                          {invoice.status}
                        </span>
                        <button className={isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}>
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
