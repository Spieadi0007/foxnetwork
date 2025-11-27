'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  User,
  Bell,
  Shield,
  Globe,
  Palette,
  Mail,
  Phone,
  Building2,
  Key,
  Smartphone,
  Monitor,
  CheckCircle,
  ChevronRight,
  Camera,
  Save,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

export default function ClientSettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const [activeTab, setActiveTab] = useState('profile')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Settings
        </h1>
        <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className={`rounded-2xl border p-2 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === tab.id
                    ? isDark
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-blue-50 text-blue-600'
                    : isDark
                    ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className={`lg:col-span-3 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Profile Information
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Update your personal details and contact information
                </p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <span className="text-white font-bold text-3xl">JW</span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                  </motion.button>
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Profile Photo</p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    First Name
                  </label>
                  <input
                    type="text"
                    defaultValue="James"
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Wilson"
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue="j.wilson@company.com"
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Company
                  </label>
                  <input
                    type="text"
                    defaultValue="Acme Corporation"
                    disabled
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-slate-500'
                        : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg shadow-blue-500/25"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </motion.button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Notification Preferences
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Choose how you want to receive notifications
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: Mail,
                    title: 'Email Notifications',
                    description: 'Receive updates and alerts via email',
                    enabled: emailNotifications,
                    setEnabled: setEmailNotifications,
                  },
                  {
                    icon: Bell,
                    title: 'Push Notifications',
                    description: 'Get instant notifications in your browser',
                    enabled: pushNotifications,
                    setEnabled: setPushNotifications,
                  },
                  {
                    icon: Smartphone,
                    title: 'SMS Notifications',
                    description: 'Receive urgent alerts via SMS',
                    enabled: smsNotifications,
                    setEnabled: setSmsNotifications,
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className={`flex items-center justify-between p-4 rounded-xl ${
                      isDark ? 'bg-white/5' : 'bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/10' : 'bg-white'}`}>
                        <item.icon className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                      </div>
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.title}</p>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => item.setEnabled(!item.enabled)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        item.enabled ? 'bg-blue-500' : isDark ? 'bg-white/20' : 'bg-slate-300'
                      }`}
                    >
                      <motion.div
                        animate={{ x: item.enabled ? 24 : 2 }}
                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className={`p-4 rounded-xl border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <h3 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Notification Types
                </h3>
                <div className="space-y-3">
                  {['Project updates', 'Request status changes', 'Scheduled visit reminders', 'Team activity', 'System announcements'].map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                      />
                      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Security Settings
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Manage your password and security preferences
                </p>
              </div>

              {/* Change Password */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/10' : 'bg-white'}`}>
                    <Key className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Change Password</p>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Update your password regularly for better security</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Current password"
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`mt-4 px-4 py-2 rounded-xl font-medium ${
                    isDark
                      ? 'bg-white/10 text-white hover:bg-white/20'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  Update Password
                </motion.button>
              </div>

              {/* Two-Factor Authentication */}
              <div className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/10' : 'bg-white'}`}>
                    <Shield className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Two-Factor Authentication</p>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Add an extra layer of security to your account</p>
                  </div>
                </div>
                <button
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    twoFactorEnabled ? 'bg-blue-500' : isDark ? 'bg-white/20' : 'bg-slate-300'
                  }`}
                >
                  <motion.div
                    animate={{ x: twoFactorEnabled ? 24 : 2 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                  />
                </button>
              </div>

              {/* Active Sessions */}
              <div className={`p-4 rounded-xl border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <h3 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Active Sessions</h3>
                <div className="space-y-3">
                  {[
                    { device: 'MacBook Pro', location: 'New York, US', current: true },
                    { device: 'iPhone 14', location: 'New York, US', current: false },
                  ].map((session, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Monitor className={`w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        <div>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {session.device}
                            {session.current && (
                              <span className="ml-2 text-xs text-emerald-400">(This device)</span>
                            )}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{session.location}</p>
                        </div>
                      </div>
                      {!session.current && (
                        <button className="text-xs text-red-400 hover:text-red-300">
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Appearance
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Customize how the portal looks and feels
                </p>
              </div>

              {/* Theme Selection */}
              <div>
                <h3 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Theme</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => !isDark || toggleTheme()}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      !isDark
                        ? 'border-blue-500 bg-blue-50'
                        : isDark
                        ? 'border-white/10 hover:border-white/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-full h-20 rounded-lg bg-white border border-slate-200 mb-3 flex items-center justify-center">
                      <div className="w-8 h-8 rounded bg-slate-100" />
                    </div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Light</p>
                    {!isDark && <CheckCircle className="w-4 h-4 text-blue-500 mx-auto mt-2" />}
                  </button>
                  <button
                    onClick={() => isDark || toggleTheme()}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isDark
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-full h-20 rounded-lg bg-slate-900 border border-slate-700 mb-3 flex items-center justify-center">
                      <div className="w-8 h-8 rounded bg-slate-800" />
                    </div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Dark</p>
                    {isDark && <CheckCircle className="w-4 h-4 text-blue-500 mx-auto mt-2" />}
                  </button>
                </div>
              </div>

              {/* Language */}
              <div>
                <h3 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Language</h3>
                <select className={`w-full px-4 py-2.5 rounded-xl border ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}>
                  <option value="en">English (US)</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              {/* Timezone */}
              <div>
                <h3 className={`font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>Timezone</h3>
                <select className={`w-full px-4 py-2.5 rounded-xl border ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}>
                  <option value="est">Eastern Time (ET)</option>
                  <option value="cst">Central Time (CT)</option>
                  <option value="mst">Mountain Time (MT)</option>
                  <option value="pst">Pacific Time (PT)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
