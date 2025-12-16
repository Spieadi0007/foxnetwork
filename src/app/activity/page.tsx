'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronRight,
  MapPin,
  User,
  Package,
  Truck,
  Wrench,
  Camera,
  MessageSquare,
  MessageCircle,
  FileText,
  Phone,
  Eye,
  Download,
  MoreHorizontal,
  Play,
  Square,
  PenTool,
  Edit3,
  Navigation,
  CheckSquare,
  Settings,
  Smartphone,
  Plus,
  Timer,
  Loader2,
  Building,
  Tag,
  Hash,
  FolderKanban,
  Info,
  ChevronDown,
  LayoutGrid,
  List,
  Languages,
  Monitor,
  Headphones,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'
import { toast } from 'sonner'
import { getModulesWithConfig, updateModuleConfig } from '@/lib/actions/action-modules'
import { getServiceTypes } from '@/lib/actions/library'
import type { ActionModuleWithConfig, ActionModuleCategory } from '@/types/actions'
import type { LibraryItem } from '@/types/library'
import { CATEGORY_LABELS } from '@/types/actions'

// Information fields that can be displayed in the field app
const INFORMATION_FIELDS = {
  location: [
    { key: 'location_name', label: 'Location Name', icon: 'MapPin' },
    { key: 'location_address', label: 'Address', icon: 'MapPin' },
    { key: 'location_city', label: 'City', icon: 'MapPin' },
    { key: 'location_country', label: 'Country', icon: 'MapPin' },
    { key: 'location_client', label: 'Client', icon: 'Building' },
    { key: 'location_contact', label: 'Contact Person', icon: 'User' },
    { key: 'location_phone', label: 'Phone', icon: 'Phone' },
  ],
  project: [
    { key: 'project_name', label: 'Project Name', icon: 'FolderKanban' },
    { key: 'project_type', label: 'Project Type', icon: 'Tag' },
    { key: 'project_status', label: 'Project Status', icon: 'Activity' },
    { key: 'project_priority', label: 'Priority', icon: 'AlertCircle' },
  ],
  service: [
    { key: 'service_type', label: 'Service Type', icon: 'Wrench' },
    { key: 'service_category', label: 'Category', icon: 'Tag' },
    { key: 'service_issue', label: 'Issue/Problem', icon: 'AlertCircle' },
    { key: 'service_description', label: 'Description', icon: 'FileText' },
    { key: 'service_scheduled_date', label: 'Scheduled Date', icon: 'Calendar' },
    { key: 'service_priority', label: 'Priority', icon: 'AlertCircle' },
    { key: 'service_reference', label: 'Reference Number', icon: 'Hash' },
  ],
}

interface ActivityEvent {
  id: string
  type: 'visit' | 'update' | 'comment' | 'status_change' | 'document' | 'call' | 'photo'
  title: string
  description: string
  projectId: string
  projectName: string
  location: string
  user: string
  userRole: string
  timestamp: string
  date: string
  outcome?: 'success' | 'partial' | 'failed' | 'pending'
  metadata?: {
    attemptNumber?: number
    duration?: string
    attachments?: number
  }
}

const mockActivities: ActivityEvent[] = [
  {
    id: 'ACT-001',
    type: 'visit',
    title: 'Installation Visit - Attempt 1',
    description: 'First installation attempt. Site was accessible but electrical work pending from client side.',
    projectId: 'PRJ-001',
    projectName: 'Downtown Mall Locker Expansion',
    location: 'Downtown Mall - Main Entrance',
    user: 'John Smith',
    userRole: 'Lead Technician',
    timestamp: '10:30 AM',
    date: '2024-01-18',
    outcome: 'partial',
    metadata: { attemptNumber: 1, duration: '2h 15m' },
  },
  {
    id: 'ACT-002',
    type: 'photo',
    title: 'Site Photos Uploaded',
    description: '8 photos uploaded documenting current installation progress',
    projectId: 'PRJ-001',
    projectName: 'Downtown Mall Locker Expansion',
    location: 'Downtown Mall - Main Entrance',
    user: 'John Smith',
    userRole: 'Lead Technician',
    timestamp: '12:45 PM',
    date: '2024-01-18',
    metadata: { attachments: 8 },
  },
  {
    id: 'ACT-003',
    type: 'status_change',
    title: 'Project Status Updated',
    description: 'Project moved from "Planning" to "In Progress"',
    projectId: 'PRJ-001',
    projectName: 'Downtown Mall Locker Expansion',
    location: 'Downtown Mall - Main Entrance',
    user: 'Sarah Johnson',
    userRole: 'Project Manager',
    timestamp: '9:00 AM',
    date: '2024-01-18',
  },
  {
    id: 'ACT-004',
    type: 'call',
    title: 'Client Coordination Call',
    description: 'Discussed electrical requirements and timeline with client facility manager',
    projectId: 'PRJ-001',
    projectName: 'Downtown Mall Locker Expansion',
    location: 'Downtown Mall - Main Entrance',
    user: 'Mike Chen',
    userRole: 'Account Manager',
    timestamp: '2:30 PM',
    date: '2024-01-17',
    metadata: { duration: '25m' },
  },
  {
    id: 'ACT-005',
    type: 'visit',
    title: 'Maintenance Visit Completed',
    description: 'Quarterly maintenance completed successfully. All units functioning properly.',
    projectId: 'PRJ-003',
    projectName: 'Tech Park System Upgrade',
    location: 'Tech Park Building A',
    user: 'Lisa Park',
    userRole: 'Maintenance Technician',
    timestamp: '4:00 PM',
    date: '2024-01-17',
    outcome: 'success',
    metadata: { duration: '3h 30m' },
  },
  {
    id: 'ACT-006',
    type: 'document',
    title: 'Service Report Generated',
    description: 'Detailed service report with findings and recommendations',
    projectId: 'PRJ-003',
    projectName: 'Tech Park System Upgrade',
    location: 'Tech Park Building A',
    user: 'Lisa Park',
    userRole: 'Maintenance Technician',
    timestamp: '5:15 PM',
    date: '2024-01-17',
    metadata: { attachments: 1 },
  },
  {
    id: 'ACT-007',
    type: 'comment',
    title: 'Internal Note Added',
    description: 'Noted that Unit #3 door mechanism needs replacement within 30 days',
    projectId: 'PRJ-003',
    projectName: 'Tech Park System Upgrade',
    location: 'Tech Park Building A',
    user: 'Lisa Park',
    userRole: 'Maintenance Technician',
    timestamp: '5:20 PM',
    date: '2024-01-17',
  },
  {
    id: 'ACT-008',
    type: 'visit',
    title: 'Initial Site Survey',
    description: 'Site survey visit failed - access denied by security. Need to reschedule with proper authorization.',
    projectId: 'PRJ-002',
    projectName: 'Airport Maintenance Q1',
    location: 'Airport Terminal B',
    user: 'Tom Wilson',
    userRole: 'Field Technician',
    timestamp: '8:30 AM',
    date: '2024-01-16',
    outcome: 'failed',
    metadata: { attemptNumber: 1 },
  },
]

// Helper function to get icon component for action modules
const getModuleIcon = (iconName: string | null) => {
  const iconMap: Record<string, typeof Play> = {
    Play,
    Square,
    Package,
    PenTool,
    Edit3,
    Camera,
    FileText,
    CheckSquare,
    Navigation,
    Clock,
    MessageCircle,
    Languages,
  }
  return iconMap[iconName || ''] || Settings
}

// Helper function to get icon component for information fields
const getInfoFieldIcon = (iconName: string) => {
  const iconMap: Record<string, typeof MapPin> = {
    MapPin,
    Building,
    User,
    Phone,
    FolderKanban,
    Tag,
    Activity,
    AlertCircle,
    Wrench,
    FileText,
    Calendar,
    Hash,
  }
  return iconMap[iconName] || Info
}

// Helper function to render module preview based on field type
const renderModulePreview = (module: ActionModuleWithConfig, isDark: boolean) => {
  switch (module.field_type) {
    case 'datetime':
      return (
        <div className={`flex items-center gap-2 p-2 rounded-lg ${
          isDark ? 'bg-white/5' : 'bg-white'
        }`}>
          <Clock className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })}
          </span>
        </div>
      )
    case 'signature':
      return (
        <div className={`h-16 rounded-lg border-2 border-dashed flex items-center justify-center ${
          isDark ? 'border-white/20 bg-white/5' : 'border-slate-300 bg-white'
        }`}>
          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Tap to sign
          </span>
        </div>
      )
    case 'photo_array':
      return (
        <div className="flex gap-2">
          <div className={`w-12 h-12 rounded-lg border-2 border-dashed flex items-center justify-center ${
            isDark ? 'border-white/20 bg-white/5' : 'border-slate-300 bg-white'
          }`}>
            <Camera className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          </div>
          <div className={`w-12 h-12 rounded-lg border-2 border-dashed flex items-center justify-center ${
            isDark ? 'border-white/20 bg-white/5' : 'border-slate-300 bg-white'
          }`}>
            <Plus className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          </div>
        </div>
      )
    case 'array':
      return (
        <div className="space-y-1">
          <div className={`flex items-center gap-2 p-2 rounded-lg ${
            isDark ? 'bg-white/5' : 'bg-white'
          }`}>
            <Package className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Add part or material...
            </span>
          </div>
        </div>
      )
    case 'textarea':
      return (
        <div className={`p-2 rounded-lg min-h-[40px] ${
          isDark ? 'bg-white/5' : 'bg-white'
        }`}>
          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Enter notes...
          </span>
        </div>
      )
    case 'checklist':
      return (
        <div className="space-y-1">
          {[1, 2].map(i => (
            <div key={i} className={`flex items-center gap-2 p-1.5 rounded ${
              isDark ? 'bg-white/5' : 'bg-white'
            }`}>
              <div className={`w-4 h-4 rounded border ${
                isDark ? 'border-white/20' : 'border-slate-300'
              }`} />
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Checklist item {i}
              </span>
            </div>
          ))}
        </div>
      )
    case 'duration':
      return (
        <div className={`flex items-center gap-2 p-2 rounded-lg ${
          isDark ? 'bg-white/5' : 'bg-white'
        }`}>
          <Timer className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            -- minutes
          </span>
        </div>
      )
    case 'calculated':
      return (
        <div className={`p-2 rounded-lg ${
          isDark ? 'bg-blue-500/10' : 'bg-blue-50'
        }`}>
          <span className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
            Auto-calculated
          </span>
        </div>
      )
    default:
      return (
        <div className={`p-2 rounded-lg ${
          isDark ? 'bg-white/5' : 'bg-white'
        }`}>
          <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Enter value...
          </span>
        </div>
      )
  }
}

export default function ClientActivityPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterProject, setFilterProject] = useState<string>('all')

  // Tabs
  const [activeTab, setActiveTab] = useState<'activity' | 'modules' | 'support'>('activity')

  // Action modules state
  const [actionModules, setActionModules] = useState<ActionModuleWithConfig[]>([])
  const [loadingModules, setLoadingModules] = useState(false)
  const [savingModule, setSavingModule] = useState<string | null>(null)

  // Field App configuration per service type
  interface FieldAppConfig {
    infoFields: string[]
    enabledModules: string[]
    screenType: 'cards' | 'details'
  }

  const defaultConfig: FieldAppConfig = {
    infoFields: ['location_name', 'location_address', 'location_client', 'service_type', 'service_issue'],
    enabledModules: [],
    screenType: 'cards',
  }

  // Service types from library
  const [serviceTypes, setServiceTypes] = useState<LibraryItem[]>([])
  const [loadingServiceTypes, setLoadingServiceTypes] = useState(false)
  const [selectedServiceType, setSelectedServiceType] = useState<string>('')
  const [serviceTypeConfigs, setServiceTypeConfigs] = useState<Record<string, FieldAppConfig>>({})

  // Get current config for selected service type
  const currentConfig = serviceTypeConfigs[selectedServiceType] || defaultConfig

  // Update config for current service type
  const updateCurrentConfig = (updates: Partial<FieldAppConfig>) => {
    setServiceTypeConfigs(prev => ({
      ...prev,
      [selectedServiceType]: {
        ...prev[selectedServiceType],
        ...updates,
      },
    }))
  }

  // Legacy state mappings for compatibility
  const selectedInfoFields = currentConfig.infoFields
  const setSelectedInfoFields = (updater: string[] | ((prev: string[]) => string[])) => {
    const newFields = typeof updater === 'function' ? updater(currentConfig.infoFields) : updater
    updateCurrentConfig({ infoFields: newFields })
  }
  const infoScreenType = currentConfig.screenType
  const setInfoScreenType = (type: 'cards' | 'details') => {
    updateCurrentConfig({ screenType: type })
  }

  const [expandedInfoSection, setExpandedInfoSection] = useState<string | null>('location')

  // Support App state - which fields and modules to show in the support app
  const [selectedSupportInfoFields, setSelectedSupportInfoFields] = useState<string[]>([
    'location_name',
    'location_address',
    'location_city',
    'location_client',
    'location_contact',
    'location_phone',
    'service_type',
    'service_issue',
    'service_description',
    'service_scheduled_date',
    'service_reference',
    'project_name',
    'project_type',
    'project_status',
  ])
  const [expandedSupportInfoSection, setExpandedSupportInfoSection] = useState<string | null>('location')
  const [selectedSupportModules, setSelectedSupportModules] = useState<string[]>([
    'chat',
    'auto_translate',
    'notes',
  ])

  // Load service types from library (children of project types)
  const loadServiceTypes = useCallback(async () => {
    setLoadingServiceTypes(true)
    try {
      const result = await getServiceTypes()
      if (result.error) {
        toast.error(result.error)
      } else if (result.data) {
        setServiceTypes(result.data)
        // Initialize configs for new service types using functional update
        setServiceTypeConfigs(prev => {
          const newConfigs: Record<string, FieldAppConfig> = { ...prev }
          result.data.forEach(type => {
            if (!newConfigs[type.id]) {
              newConfigs[type.id] = { ...defaultConfig }
            }
          })
          return newConfigs
        })
        // Select first service type if none selected
        setSelectedServiceType(prev => {
          if (!prev && result.data.length > 0) {
            return result.data[0].id
          }
          return prev
        })
      }
    } catch (error) {
      console.error('Error loading service types:', error)
      toast.error('Failed to load service types')
    } finally {
      setLoadingServiceTypes(false)
    }
  }, [])

  // Load action modules
  const loadModules = useCallback(async () => {
    setLoadingModules(true)
    try {
      const result = await getModulesWithConfig()
      if (result.error) {
        toast.error(result.error)
      } else {
        setActionModules(result.data || [])
      }
    } catch (error) {
      console.error('Error loading modules:', error)
      toast.error('Failed to load modules')
    } finally {
      setLoadingModules(false)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'modules' || activeTab === 'support') {
      loadModules()
    }
    if (activeTab === 'modules') {
      loadServiceTypes()
    }
  }, [activeTab, loadModules, loadServiceTypes])

  const filteredActivities = mockActivities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.projectName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || activity.type === filterType
    const matchesProject = filterProject === 'all' || activity.projectId === filterProject
    return matchesSearch && matchesType && matchesProject
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'visit':
        return Truck
      case 'update':
        return Activity
      case 'comment':
        return MessageSquare
      case 'status_change':
        return AlertCircle
      case 'document':
        return FileText
      case 'call':
        return Phone
      case 'photo':
        return Camera
      default:
        return Activity
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'visit':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' }
      case 'update':
        return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500' }
      case 'comment':
        return { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500' }
      case 'status_change':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500' }
      case 'document':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500' }
      case 'call':
        return { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500' }
      case 'photo':
        return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500' }
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500' }
    }
  }

  const getOutcomeBadge = (outcome?: string) => {
    switch (outcome) {
      case 'success':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: CheckCircle, label: 'Success' }
      case 'partial':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: AlertCircle, label: 'Partial' }
      case 'failed':
        return { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle, label: 'Failed' }
      case 'pending':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: Clock, label: 'Pending' }
      default:
        return null
    }
  }

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = activity.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(activity)
    return groups
  }, {} as Record<string, ActivityEvent[]>)

  const uniqueProjects = [...new Set(mockActivities.map((a) => a.projectId))].map((id) => {
    const activity = mockActivities.find((a) => a.projectId === id)
    return { id, name: activity?.projectName || id }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Actions
          </h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Track all actions taken within your projects
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'activity'
              ? isDark
                ? 'bg-white/10 text-white'
                : 'bg-slate-900 text-white'
              : isDark
                ? 'text-slate-400 hover:text-white hover:bg-white/5'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Activity className="w-4 h-4" />
          Activity
        </button>
        <button
          onClick={() => setActiveTab('modules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'modules'
              ? isDark
                ? 'bg-white/10 text-white'
                : 'bg-slate-900 text-white'
              : isDark
                ? 'text-slate-400 hover:text-white hover:bg-white/5'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Field App
          {currentConfig.enabledModules.length > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeTab === 'modules'
                ? 'bg-white/20'
                : isDark ? 'bg-white/10' : 'bg-slate-200'
            }`}>
              {currentConfig.enabledModules.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'support'
              ? isDark
                ? 'bg-white/10 text-white'
                : 'bg-slate-900 text-white'
              : isDark
                ? 'text-slate-400 hover:text-white hover:bg-white/5'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Headphones className="w-4 h-4" />
          Support App
        </button>
      </div>

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Activities', value: mockActivities.length, icon: Activity, color: 'blue' },
              { label: 'Site Visits', value: mockActivities.filter((a) => a.type === 'visit').length, icon: Truck, color: 'emerald' },
              { label: 'Documents', value: mockActivities.filter((a) => a.type === 'document').length, icon: FileText, color: 'purple' },
              { label: 'Today', value: mockActivities.filter((a) => a.date === '2024-01-18').length, icon: Calendar, color: 'cyan' },
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
                      stat.color === 'purple' ? 'text-purple-500' :
                      'text-cyan-500'
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
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-2.5 rounded-xl border transition-all ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div className="flex gap-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={`px-4 py-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="all">All Types</option>
                  <option value="visit">Visits</option>
                  <option value="status_change">Status Changes</option>
                  <option value="document">Documents</option>
                  <option value="photo">Photos</option>
                  <option value="call">Calls</option>
                  <option value="comment">Comments</option>
                </select>

                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  className={`px-4 py-2.5 rounded-xl border ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="all">All Projects</option>
                  {uniqueProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-8">
            {Object.entries(groupedActivities).map(([date, activities]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                    isDark ? 'bg-white/10' : 'bg-slate-100'
                  }`}>
                    <Calendar className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {date === '2024-01-18' ? 'Today' : date === '2024-01-17' ? 'Yesterday' : date}
                    </span>
                  </div>
                  <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
                </div>

                {/* Activities for this date */}
                <div className="space-y-4">
                  {activities.map((activity, index) => {
                    const TypeIcon = getTypeIcon(activity.type)
                    const typeColor = getTypeColor(activity.type)
                    const outcomeBadge = getOutcomeBadge(activity.outcome)

                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`relative pl-8 ${index < activities.length - 1 ? 'pb-4' : ''}`}
                      >
                        {/* Timeline line */}
                        {index < activities.length - 1 && (
                          <div className={`absolute left-[15px] top-10 bottom-0 w-0.5 ${
                            isDark ? 'bg-white/10' : 'bg-slate-200'
                          }`} />
                        )}

                        {/* Timeline dot */}
                        <div className={`absolute left-0 top-2 w-8 h-8 rounded-full flex items-center justify-center ${typeColor.bg}`}>
                          <TypeIcon className={`w-4 h-4 ${typeColor.text}`} />
                        </div>

                        {/* Activity Card */}
                        <div className={`ml-4 p-4 rounded-2xl border transition-all ${
                          isDark
                            ? 'bg-white/5 border-white/10 hover:bg-white/10'
                            : 'bg-white border-slate-200 hover:shadow-md'
                        }`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  {activity.title}
                                </h3>
                                {outcomeBadge && (
                                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${outcomeBadge.bg} ${outcomeBadge.text}`}>
                                    <outcomeBadge.icon className="w-3 h-3" />
                                    {outcomeBadge.label}
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {activity.description}
                              </p>

                              {/* Metadata */}
                              <div className={`flex flex-wrap items-center gap-4 mt-3 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {activity.timestamp}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="w-3.5 h-3.5" />
                                  {activity.user} ({activity.userRole})
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {activity.location}
                                </span>
                                {activity.metadata?.duration && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    Duration: {activity.metadata.duration}
                                  </span>
                                )}
                                {activity.metadata?.attachments && (
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3.5 h-3.5" />
                                    {activity.metadata.attachments} attachment(s)
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Project Badge */}
                            <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                              isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {activity.projectId}
                            </div>
                          </div>

                          {/* Action buttons for certain types */}
                          {(activity.type === 'document' || activity.type === 'photo') && (
                            <div className={`flex items-center gap-2 mt-4 pt-3 border-t ${
                              isDark ? 'border-white/10' : 'border-slate-100'
                            }`}>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                                  isDark
                                    ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                                  isDark
                                    ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download
                              </motion.button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {filteredActivities.length === 0 && (
            <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
              <Activity className={`w-12 h-12 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
              <p className={`mt-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No activities found
              </p>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Try adjusting your filters
              </p>
            </div>
          )}
        </>
      )}

      {/* Modules Tab */}
      {activeTab === 'modules' && (
        <div className="space-y-6">
          {/* Service Type Selector */}
          <div className={`rounded-2xl border overflow-hidden ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
          }`}>
            <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Service Type Configuration
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Configure different Field App layouts for each service type
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              {loadingServiceTypes ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className={`w-6 h-6 animate-spin ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <span className={`ml-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Loading service types...
                  </span>
                </div>
              ) : serviceTypes.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No service types configured</p>
                  <p className="text-xs mt-1">Add service types under Project Types in Library</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {serviceTypes.map(type => {
                    const config = serviceTypeConfigs[type.id]
                    const moduleCount = config?.enabledModules?.length || 0
                    const isSelected = selectedServiceType === type.id
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedServiceType(type.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500/10'
                            : isDark ? 'border-white/10 hover:border-white/20 bg-white/5' : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? 'bg-blue-500 text-white'
                            : isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-200 text-slate-500'
                        }`}>
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className={`font-medium text-sm ${
                            isSelected
                              ? 'text-blue-600'
                              : isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            {type.name}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {moduleCount} modules
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 ml-2 text-blue-500" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Configuration */}
          <div className="space-y-4">
            {/* Information Fields Section */}
            <div className={`rounded-2xl border overflow-hidden ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
            }`}>
              <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Information Display
                    </h3>
                  </div>
                  {/* Screen Type Tabs */}
                  <div className={`flex rounded-lg p-1 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                    <button
                      onClick={() => setInfoScreenType('cards')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        infoScreenType === 'cards'
                          ? isDark ? 'bg-white/10 text-white' : 'bg-white text-slate-900 shadow-sm'
                          : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      Cards
                    </button>
                    <button
                      onClick={() => setInfoScreenType('details')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        infoScreenType === 'details'
                          ? isDark ? 'bg-white/10 text-white' : 'bg-white text-slate-900 shadow-sm'
                          : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                      Details
                    </button>
                  </div>
                </div>
                <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {infoScreenType === 'cards'
                    ? 'Compact card view with key information at a glance'
                    : 'Detailed view with full information categorized by section'
                  }
                </p>
              </div>

              <div className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                {/* Location Fields */}
                <div>
                  <button
                    onClick={() => setExpandedInfoSection(expandedInfoSection === 'location' ? null : 'location')}
                    className={`w-full flex items-center justify-between px-4 py-3 ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Location
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {selectedInfoFields.filter(f => f.startsWith('location_')).length}/{INFORMATION_FIELDS.location.length}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      expandedInfoSection === 'location' ? 'rotate-180' : ''
                    } ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </button>
                  {expandedInfoSection === 'location' && (
                    <div className={`px-4 pb-3 space-y-1 ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50/50'}`}>
                      {INFORMATION_FIELDS.location.map(field => {
                        const IconComponent = getInfoFieldIcon(field.icon)
                        const isSelected = selectedInfoFields.includes(field.key)
                        return (
                          <button
                            key={field.key}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedInfoFields(prev => prev.filter(f => f !== field.key))
                              } else {
                                setSelectedInfoFields(prev => [...prev, field.key])
                              }
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              isSelected
                                ? isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                                : isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                              isSelected
                                ? 'bg-emerald-500 text-white'
                                : isDark ? 'bg-white/10 text-slate-500' : 'bg-slate-200 text-slate-400'
                            }`}>
                              {isSelected ? <CheckCircle className="w-4 h-4" /> : <IconComponent className="w-3.5 h-3.5" />}
                            </div>
                            <span className={`text-sm ${
                              isSelected
                                ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                                : isDark ? 'text-slate-300' : 'text-slate-600'
                            }`}>
                              {field.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Project Fields */}
                <div>
                  <button
                    onClick={() => setExpandedInfoSection(expandedInfoSection === 'project' ? null : 'project')}
                    className={`w-full flex items-center justify-between px-4 py-3 ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FolderKanban className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Project
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {selectedInfoFields.filter(f => f.startsWith('project_')).length}/{INFORMATION_FIELDS.project.length}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      expandedInfoSection === 'project' ? 'rotate-180' : ''
                    } ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </button>
                  {expandedInfoSection === 'project' && (
                    <div className={`px-4 pb-3 space-y-1 ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50/50'}`}>
                      {INFORMATION_FIELDS.project.map(field => {
                        const IconComponent = getInfoFieldIcon(field.icon)
                        const isSelected = selectedInfoFields.includes(field.key)
                        return (
                          <button
                            key={field.key}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedInfoFields(prev => prev.filter(f => f !== field.key))
                              } else {
                                setSelectedInfoFields(prev => [...prev, field.key])
                              }
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              isSelected
                                ? isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                                : isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                              isSelected
                                ? 'bg-purple-500 text-white'
                                : isDark ? 'bg-white/10 text-slate-500' : 'bg-slate-200 text-slate-400'
                            }`}>
                              {isSelected ? <CheckCircle className="w-4 h-4" /> : <IconComponent className="w-3.5 h-3.5" />}
                            </div>
                            <span className={`text-sm ${
                              isSelected
                                ? isDark ? 'text-purple-400' : 'text-purple-700'
                                : isDark ? 'text-slate-300' : 'text-slate-600'
                            }`}>
                              {field.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Service Fields */}
                <div>
                  <button
                    onClick={() => setExpandedInfoSection(expandedInfoSection === 'service' ? null : 'service')}
                    className={`w-full flex items-center justify-between px-4 py-3 ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Wrench className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Service
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {selectedInfoFields.filter(f => f.startsWith('service_')).length}/{INFORMATION_FIELDS.service.length}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      expandedInfoSection === 'service' ? 'rotate-180' : ''
                    } ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </button>
                  {expandedInfoSection === 'service' && (
                    <div className={`px-4 pb-3 space-y-1 ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50/50'}`}>
                      {INFORMATION_FIELDS.service.map(field => {
                        const IconComponent = getInfoFieldIcon(field.icon)
                        const isSelected = selectedInfoFields.includes(field.key)
                        return (
                          <button
                            key={field.key}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedInfoFields(prev => prev.filter(f => f !== field.key))
                              } else {
                                setSelectedInfoFields(prev => [...prev, field.key])
                              }
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              isSelected
                                ? isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                                : isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                              isSelected
                                ? 'bg-blue-500 text-white'
                                : isDark ? 'bg-white/10 text-slate-500' : 'bg-slate-200 text-slate-400'
                            }`}>
                              {isSelected ? <CheckCircle className="w-4 h-4" /> : <IconComponent className="w-3.5 h-3.5" />}
                            </div>
                            <span className={`text-sm ${
                              isSelected
                                ? isDark ? 'text-blue-400' : 'text-blue-700'
                                : isDark ? 'text-slate-300' : 'text-slate-600'
                            }`}>
                              {field.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Available Modules Section */}
            <div className={`rounded-2xl border overflow-hidden ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
            }`}>
              <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Available Modules
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Enable modules for field technicians to capture during service actions
                </p>
              </div>

              {loadingModules ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                  {(['time', 'materials', 'verification', 'media', 'general'] as ActionModuleCategory[]).map(category => {
                    const categoryModules = actionModules.filter(m => m.category === category)
                    if (categoryModules.length === 0) return null

                    return (
                      <div key={category}>
                        <div className={`px-4 py-2 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                          <span className={`text-xs font-medium uppercase tracking-wider ${
                            isDark ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            {CATEGORY_LABELS[category]}
                          </span>
                        </div>
                        {categoryModules.map(module => {
                          const IconComponent = getModuleIcon(module.icon)
                          const isModuleEnabled = currentConfig.enabledModules.includes(module.key)
                          return (
                            <div
                              key={module.id}
                              className={`flex items-center gap-4 p-4 transition-colors ${
                                isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                isModuleEnabled
                                  ? isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                                  : isDark ? 'bg-white/5' : 'bg-slate-100'
                              }`}>
                                <IconComponent className={`w-5 h-5 ${
                                  isModuleEnabled
                                    ? 'text-blue-500'
                                    : isDark ? 'text-slate-500' : 'text-slate-400'
                                }`} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {module.effective_label}
                                  </span>
                                </div>
                                <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  {module.effective_description}
                                </p>
                              </div>

                              <div className="flex items-center gap-3">
                                {/* Enable/Disable Toggle */}
                                <button
                                  onClick={() => {
                                    if (isModuleEnabled) {
                                      updateCurrentConfig({
                                        enabledModules: currentConfig.enabledModules.filter(k => k !== module.key)
                                      })
                                    } else {
                                      updateCurrentConfig({
                                        enabledModules: [...currentConfig.enabledModules, module.key]
                                      })
                                    }
                                  }}
                                  className="relative"
                                >
                                  <div
                                    className={`w-11 h-6 rounded-full transition-colors relative ${
                                      isModuleEnabled
                                        ? 'bg-gradient-to-r from-blue-500 to-cyan-600'
                                        : isDark ? 'bg-white/10' : 'bg-slate-200'
                                    }`}
                                  >
                                    <div
                                      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                        isModuleEnabled ? 'left-6' : 'left-1'
                                      }`}
                                    />
                                  </div>
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Mobile App Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <div className={`rounded-2xl border overflow-hidden ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
            }`}>
              <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <Smartphone className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Mobile App Preview
                  </h3>
                </div>
                {selectedServiceType && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {serviceTypes.find(t => t.id === selectedServiceType)?.name || 'Select Type'}
                  </span>
                )}
              </div>

              <div className="p-4">
                {/* Phone Frame */}
                <div className={`mx-auto max-w-[280px] rounded-[2.5rem] border-8 ${
                  isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-white'
                } shadow-xl`}>
                  {/* Phone Notch */}
                  <div className="relative pt-2">
                    <div className={`mx-auto w-24 h-6 rounded-full ${
                      isDark ? 'bg-slate-900' : 'bg-slate-200'
                    }`} />
                  </div>

                  {/* Phone Content */}
                  <div className="px-3 pb-6 pt-4 space-y-3 min-h-[400px] max-h-[500px] overflow-y-auto">
                    {/* Header */}
                    <div className={`text-center pb-2 border-b ${
                      isDark ? 'border-white/10' : 'border-slate-100'
                    }`}>
                      <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Service Action
                      </p>
                      <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Complete Service
                      </p>
                    </div>

                    {/* Service Information Section - Cards View (only when no modules enabled) */}
                    {infoScreenType === 'cards' && selectedInfoFields.length > 0 && currentConfig.enabledModules.length === 0 && (
                      <div className={`p-2.5 rounded-xl ${
                        isDark ? 'bg-white/5' : 'bg-slate-50'
                      }`}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Info className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                          <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Service Info
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {/* Location info */}
                          {selectedInfoFields.filter(f => f.startsWith('location_')).length > 0 && (
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                              {selectedInfoFields.includes('location_name') && (
                                <p className={`text-xs font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  Acme Store #123
                                </p>
                              )}
                              {selectedInfoFields.includes('location_address') && (
                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  123 Main Street
                                </p>
                              )}
                              {selectedInfoFields.includes('location_city') && (
                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  Paris, France
                                </p>
                              )}
                              {selectedInfoFields.includes('location_client') && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Building className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Acme Corporation
                                  </span>
                                </div>
                              )}
                              {selectedInfoFields.includes('location_contact') && (
                                <div className="flex items-center gap-1 mt-1">
                                  <User className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    John Manager
                                  </span>
                                </div>
                              )}
                              {selectedInfoFields.includes('location_phone') && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Phone className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                                  <span className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                    +33 1 23 45 67 89
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          {/* Service info */}
                          {selectedInfoFields.filter(f => f.startsWith('service_')).length > 0 && (
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                              {selectedInfoFields.includes('service_type') && (
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                                    isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    Installation
                                  </span>
                                </div>
                              )}
                              {selectedInfoFields.includes('service_issue') && (
                                <p className={`text-xs font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  New locker unit setup
                                </p>
                              )}
                              {selectedInfoFields.includes('service_description') && (
                                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                  Install and configure 2x parcel lockers at store entrance
                                </p>
                              )}
                              {selectedInfoFields.includes('service_scheduled_date') && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Calendar className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Today, 10:00 AM
                                  </span>
                                </div>
                              )}
                              {selectedInfoFields.includes('service_reference') && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Hash className={`w-3 h-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    SVC-2024-001234
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          {/* Project info */}
                          {selectedInfoFields.filter(f => f.startsWith('project_')).length > 0 && (
                            <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                              {selectedInfoFields.includes('project_name') && (
                                <p className={`text-xs font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                  Q1 Deployment - France
                                </p>
                              )}
                              {selectedInfoFields.includes('project_type') && (
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                                }`}>
                                  Deployment
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Service Information Section - Details View (always shown when modules are enabled) */}
                    {(infoScreenType === 'details' || currentConfig.enabledModules.length > 0) && selectedInfoFields.length > 0 && (
                      <div className="space-y-3">
                        {/* Location Details Section */}
                        {selectedInfoFields.filter(f => f.startsWith('location_')).length > 0 && (
                          <div className={`rounded-xl overflow-hidden ${
                            isDark ? 'bg-white/5' : 'bg-slate-50'
                          }`}>
                            <div className={`px-3 py-2 flex items-center gap-2 ${
                              isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'
                            }`}>
                              <MapPin className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                              <span className={`text-xs font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                Location Details
                              </span>
                            </div>
                            <div className="p-3 space-y-2">
                              {selectedInfoFields.includes('location_name') && (
                                <div className="flex justify-between items-start">
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Name</span>
                                  <span className={`text-xs font-medium text-right ${isDark ? 'text-white' : 'text-slate-900'}`}>Acme Store #123</span>
                                </div>
                              )}
                              {selectedInfoFields.includes('location_address') && (
                                <div className="flex justify-between items-start">
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Address</span>
                                  <span className={`text-xs text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>123 Main Street</span>
                                </div>
                              )}
                              {selectedInfoFields.includes('location_city') && (
                                <div className="flex justify-between items-start">
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>City</span>
                                  <span className={`text-xs text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Paris, France</span>
                                </div>
                              )}
                              {selectedInfoFields.includes('location_country') && (
                                <div className="flex justify-between items-start">
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Country</span>
                                  <span className={`text-xs text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>France</span>
                                </div>
                              )}
                              {selectedInfoFields.includes('location_client') && (
                                <div className="flex justify-between items-start">
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Client</span>
                                  <span className={`text-xs font-medium text-right ${isDark ? 'text-white' : 'text-slate-900'}`}>Acme Corporation</span>
                                </div>
                              )}
                              {selectedInfoFields.includes('location_contact') && (
                                <div className="flex justify-between items-start">
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Contact</span>
                                  <span className={`text-xs text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>John Manager</span>
                                </div>
                              )}
                              {selectedInfoFields.includes('location_phone') && (
                                <div className="flex justify-between items-start">
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Phone</span>
                                  <span className={`text-xs text-right ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>+33 1 23 45 67 89</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Service Details Section */}
                        {selectedInfoFields.filter(f => f.startsWith('service_')).length > 0 && (
                          <div className={`rounded-xl overflow-hidden ${
                            isDark ? 'bg-white/5' : 'bg-slate-50'
                          }`}>
                            <div className={`px-3 py-2 flex items-center gap-2 ${
                              isDark ? 'bg-blue-500/10' : 'bg-blue-50'
                            }`}>
                              <Wrench className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                              <span className={`text-xs font-semibold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                                Service Details
                              </span>
                            </div>
                            <div className="p-3 space-y-2">
                              {selectedInfoFields.includes('service_type') && (
                                <div className="flex justify-between items-center">
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Type</span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                                    isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    Installation
                                  </span>
                                </div>
                              )}
                              {selectedInfoFields.includes('service_category') && (
                                <div className="flex justify-between items-center">
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Category</span>
                                  <span className={`text-xs text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Hardware</span>
                                </div>
                              )}
                              {selectedInfoFields.includes('service_issue') && (
                                <div className="flex justify-between items-start">
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Issue</span>
                                  <span className={`text-xs font-medium text-right max-w-[120px] ${isDark ? 'text-white' : 'text-slate-900'}`}>New locker unit setup</span>
                                </div>
                              )}
                              {selectedInfoFields.includes('service_description') && (
                                <div>
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Description</span>
                                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                    Install and configure 2x parcel lockers at store entrance
                                  </p>
                                </div>
                              )}
                              {selectedInfoFields.includes('service_scheduled_date') && (
                                <div className="flex justify-between items-center">
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Scheduled</span>
                                  <span className={`text-xs text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Today, 10:00 AM</span>
                                </div>
                              )}
                              {selectedInfoFields.includes('service_priority') && (
                                <div className="flex justify-between items-center">
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Priority</span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                                    isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    High
                                  </span>
                                </div>
                              )}
                              {selectedInfoFields.includes('service_reference') && (
                                <div className="flex justify-between items-center">
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Reference</span>
                                  <span className={`text-xs font-mono text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>SVC-2024-001234</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Project Details Section */}
                        {selectedInfoFields.filter(f => f.startsWith('project_')).length > 0 && (
                          <div className={`rounded-xl overflow-hidden ${
                            isDark ? 'bg-white/5' : 'bg-slate-50'
                          }`}>
                            <div className={`px-3 py-2 flex items-center gap-2 ${
                              isDark ? 'bg-purple-500/10' : 'bg-purple-50'
                            }`}>
                              <FolderKanban className={`w-3.5 h-3.5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                              <span className={`text-xs font-semibold ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                                Project Details
                              </span>
                            </div>
                            <div className="p-3 space-y-2">
                              {selectedInfoFields.includes('project_name') && (
                                <div className="flex justify-between items-start">
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Name</span>
                                  <span className={`text-xs font-medium text-right ${isDark ? 'text-white' : 'text-slate-900'}`}>Q1 Deployment - France</span>
                                </div>
                              )}
                              {selectedInfoFields.includes('project_type') && (
                                <div className="flex justify-between items-center">
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Type</span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                                    isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                                  }`}>
                                    Deployment
                                  </span>
                                </div>
                              )}
                              {selectedInfoFields.includes('project_status') && (
                                <div className="flex justify-between items-center">
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Status</span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                                    isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                                  }`}>
                                    In Progress
                                  </span>
                                </div>
                              )}
                              {selectedInfoFields.includes('project_priority') && (
                                <div className="flex justify-between items-center">
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Priority</span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                                    isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    High
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Enabled Modules */}
                    {currentConfig.enabledModules.length === 0 && selectedInfoFields.length === 0 ? (
                      <div className="text-center py-8">
                        <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3 ${
                          isDark ? 'bg-white/5' : 'bg-slate-100'
                        }`}>
                          <Settings className={`w-6 h-6 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                        </div>
                        <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          No modules enabled
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                          Enable modules on the left to see them here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {actionModules
                          .filter(m => currentConfig.enabledModules.includes(m.key))
                          .sort((a, b) => a.display_order - b.display_order)
                          .map(module => {
                            const IconComponent = getModuleIcon(module.icon)
                            return (
                              <div
                                key={module.id}
                                className={`p-3 rounded-xl border ${
                                  isDark
                                    ? 'bg-white/5 border-white/10'
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <IconComponent className={`w-4 h-4 ${
                                    isDark ? 'text-blue-400' : 'text-blue-600'
                                  }`} />
                                  <span className={`text-sm font-medium ${
                                    isDark ? 'text-white' : 'text-slate-900'
                                  }`}>
                                    {module.effective_label}
                                  </span>
                                </div>
                                {/* Placeholder for field type */}
                                {renderModulePreview(module, isDark)}
                              </div>
                            )
                          })}
                      </div>
                    )}

                    {/* Submit Button */}
                    {currentConfig.enabledModules.length > 0 && (
                      <div className="pt-3">
                        <div className={`w-full py-2.5 rounded-xl text-center text-sm font-medium ${
                          isDark
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white'
                            : 'bg-blue-500 text-white'
                        }`}>
                          Complete Action
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phone Home Indicator */}
                  <div className="pb-2 flex justify-center">
                    <div className={`w-28 h-1 rounded-full ${
                      isDark ? 'bg-slate-600' : 'bg-slate-300'
                    }`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Support App Tab */}
      {activeTab === 'support' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Panel - Configuration */}
          <div className="xl:col-span-1 space-y-4">
            {/* Information Fields Section */}
            <div className={`rounded-2xl border overflow-hidden ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
            }`}>
              <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2">
                  <Info className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Information Display
                  </h3>
                </div>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Select which information support staff can view
                </p>
              </div>

              <div className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                {/* Location Fields */}
                <div>
                  <button
                    onClick={() => setExpandedSupportInfoSection(expandedSupportInfoSection === 'location' ? null : 'location')}
                    className={`w-full flex items-center justify-between px-4 py-3 ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Location
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {selectedSupportInfoFields.filter(f => f.startsWith('location_')).length}/{INFORMATION_FIELDS.location.length}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      expandedSupportInfoSection === 'location' ? 'rotate-180' : ''
                    } ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </button>
                  {expandedSupportInfoSection === 'location' && (
                    <div className={`px-4 pb-3 space-y-1 ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50/50'}`}>
                      {INFORMATION_FIELDS.location.map(field => {
                        const IconComponent = getInfoFieldIcon(field.icon)
                        const isSelected = selectedSupportInfoFields.includes(field.key)
                        return (
                          <button
                            key={field.key}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedSupportInfoFields(prev => prev.filter(f => f !== field.key))
                              } else {
                                setSelectedSupportInfoFields(prev => [...prev, field.key])
                              }
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              isSelected
                                ? isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                                : isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                              isSelected
                                ? 'bg-emerald-500 text-white'
                                : isDark ? 'bg-white/10 text-slate-500' : 'bg-slate-200 text-slate-400'
                            }`}>
                              {isSelected ? <CheckCircle className="w-4 h-4" /> : <IconComponent className="w-3.5 h-3.5" />}
                            </div>
                            <span className={`text-sm ${
                              isSelected
                                ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                                : isDark ? 'text-slate-300' : 'text-slate-600'
                            }`}>
                              {field.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Project Fields */}
                <div>
                  <button
                    onClick={() => setExpandedSupportInfoSection(expandedSupportInfoSection === 'project' ? null : 'project')}
                    className={`w-full flex items-center justify-between px-4 py-3 ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FolderKanban className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Project
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {selectedSupportInfoFields.filter(f => f.startsWith('project_')).length}/{INFORMATION_FIELDS.project.length}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      expandedSupportInfoSection === 'project' ? 'rotate-180' : ''
                    } ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </button>
                  {expandedSupportInfoSection === 'project' && (
                    <div className={`px-4 pb-3 space-y-1 ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50/50'}`}>
                      {INFORMATION_FIELDS.project.map(field => {
                        const IconComponent = getInfoFieldIcon(field.icon)
                        const isSelected = selectedSupportInfoFields.includes(field.key)
                        return (
                          <button
                            key={field.key}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedSupportInfoFields(prev => prev.filter(f => f !== field.key))
                              } else {
                                setSelectedSupportInfoFields(prev => [...prev, field.key])
                              }
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              isSelected
                                ? isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                                : isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                              isSelected
                                ? 'bg-purple-500 text-white'
                                : isDark ? 'bg-white/10 text-slate-500' : 'bg-slate-200 text-slate-400'
                            }`}>
                              {isSelected ? <CheckCircle className="w-4 h-4" /> : <IconComponent className="w-3.5 h-3.5" />}
                            </div>
                            <span className={`text-sm ${
                              isSelected
                                ? isDark ? 'text-purple-400' : 'text-purple-700'
                                : isDark ? 'text-slate-300' : 'text-slate-600'
                            }`}>
                              {field.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Service Fields */}
                <div>
                  <button
                    onClick={() => setExpandedSupportInfoSection(expandedSupportInfoSection === 'service' ? null : 'service')}
                    className={`w-full flex items-center justify-between px-4 py-3 ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Wrench className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Service
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {selectedSupportInfoFields.filter(f => f.startsWith('service_')).length}/{INFORMATION_FIELDS.service.length}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${
                      expandedSupportInfoSection === 'service' ? 'rotate-180' : ''
                    } ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </button>
                  {expandedSupportInfoSection === 'service' && (
                    <div className={`px-4 pb-3 space-y-1 ${isDark ? 'bg-white/[0.02]' : 'bg-slate-50/50'}`}>
                      {INFORMATION_FIELDS.service.map(field => {
                        const IconComponent = getInfoFieldIcon(field.icon)
                        const isSelected = selectedSupportInfoFields.includes(field.key)
                        return (
                          <button
                            key={field.key}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedSupportInfoFields(prev => prev.filter(f => f !== field.key))
                              } else {
                                setSelectedSupportInfoFields(prev => [...prev, field.key])
                              }
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              isSelected
                                ? isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                                : isDark ? 'hover:bg-white/5' : 'hover:bg-slate-100'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                              isSelected
                                ? 'bg-blue-500 text-white'
                                : isDark ? 'bg-white/10 text-slate-500' : 'bg-slate-200 text-slate-400'
                            }`}>
                              {isSelected ? <CheckCircle className="w-4 h-4" /> : <IconComponent className="w-3.5 h-3.5" />}
                            </div>
                            <span className={`text-sm ${
                              isSelected
                                ? isDark ? 'text-blue-400' : 'text-blue-700'
                                : isDark ? 'text-slate-300' : 'text-slate-600'
                            }`}>
                              {field.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Support Tools Section */}
            <div className={`rounded-2xl border overflow-hidden ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
            }`}>
              <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Support Tools
                </h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Enable tools for support staff to assist technicians
                </p>
              </div>

              {loadingModules ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
                  {actionModules
                    .filter(m => ['chat', 'auto_translate', 'notes', 'photos'].includes(m.key))
                    .map(module => {
                      const IconComponent = getModuleIcon(module.icon)
                      const isSelected = selectedSupportModules.includes(module.key)
                      return (
                        <div
                          key={module.id}
                          className={`flex items-center gap-4 p-4 transition-colors ${
                            isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                              : isDark ? 'bg-white/5' : 'bg-slate-100'
                          }`}>
                            <IconComponent className={`w-5 h-5 ${
                              isSelected
                                ? 'text-blue-500'
                                : isDark ? 'text-slate-500' : 'text-slate-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {module.effective_label}
                            </p>
                            <p className={`text-sm truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {module.effective_description}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              if (isSelected) {
                                setSelectedSupportModules(prev => prev.filter(k => k !== module.key))
                              } else {
                                setSelectedSupportModules(prev => [...prev, module.key])
                              }
                            }}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              isSelected
                                ? 'bg-blue-500'
                                : isDark ? 'bg-white/10' : 'bg-slate-200'
                            }`}
                          >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                              isSelected ? 'translate-x-7' : 'translate-x-1'
                            }`} />
                          </button>
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Desktop Preview */}
          <div className="xl:col-span-2">
            <div className={`rounded-2xl border overflow-hidden ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
            }`}>
              <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-slate-200'} flex items-center gap-2`}>
                <Monitor className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Desktop App Preview
                </h3>
              </div>

              <div className="p-6">
                {/* Desktop Frame */}
                <div className={`rounded-lg border-4 ${
                  isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-100'
                } shadow-xl`}>
                  {/* Desktop Title Bar */}
                  <div className={`flex items-center gap-2 px-4 py-2 ${
                    isDark ? 'bg-slate-900' : 'bg-slate-200'
                  }`}>
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className={`flex-1 text-center text-xs font-medium ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      Fox Network Support Dashboard
                    </div>
                  </div>

                  {/* Desktop Content */}
                  <div className={`p-4 min-h-[400px] ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    {/* Support Header */}
                    <div className={`flex items-center justify-between pb-4 border-b mb-4 ${
                      isDark ? 'border-white/10' : 'border-slate-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                        }`}>
                          <User className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                        <div>
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Active Support Session
                          </p>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Technician: John Smith • SVC-2024-001234
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        Connected
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {/* Left: Service Info */}
                      <div className="col-span-2 space-y-4">
                        {/* Location Details */}
                        {selectedSupportInfoFields.filter(f => f.startsWith('location_')).length > 0 && (
                          <div className={`rounded-xl overflow-hidden ${
                            isDark ? 'bg-white/5' : 'bg-slate-50'
                          }`}>
                            <div className={`px-4 py-2 flex items-center gap-2 ${
                              isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'
                            }`}>
                              <MapPin className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                              <span className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                Location Details
                              </span>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-3">
                              {selectedSupportInfoFields.includes('location_name') && (
                                <div>
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Name</span>
                                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Acme Store #123</p>
                                </div>
                              )}
                              {selectedSupportInfoFields.includes('location_address') && (
                                <div>
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Address</span>
                                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>123 Main Street</p>
                                </div>
                              )}
                              {selectedSupportInfoFields.includes('location_city') && (
                                <div>
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>City</span>
                                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Paris, France</p>
                                </div>
                              )}
                              {selectedSupportInfoFields.includes('location_client') && (
                                <div>
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Client</span>
                                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Acme Corporation</p>
                                </div>
                              )}
                              {selectedSupportInfoFields.includes('location_contact') && (
                                <div>
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Contact</span>
                                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>John Manager</p>
                                </div>
                              )}
                              {selectedSupportInfoFields.includes('location_phone') && (
                                <div>
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Phone</span>
                                  <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>+33 1 23 45 67 89</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Service Details */}
                        {selectedSupportInfoFields.filter(f => f.startsWith('service_')).length > 0 && (
                          <div className={`rounded-xl overflow-hidden ${
                            isDark ? 'bg-white/5' : 'bg-slate-50'
                          }`}>
                            <div className={`px-4 py-2 flex items-center gap-2 ${
                              isDark ? 'bg-blue-500/10' : 'bg-blue-50'
                            }`}>
                              <Wrench className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                              <span className={`text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                                Service Details
                              </span>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-3">
                              {selectedSupportInfoFields.includes('service_type') && (
                                <div>
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Type</span>
                                  <p className={`text-sm`}>
                                    <span className={`px-2 py-0.5 rounded ${
                                      isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                                    }`}>Installation</span>
                                  </p>
                                </div>
                              )}
                              {selectedSupportInfoFields.includes('service_issue') && (
                                <div>
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Issue</span>
                                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>New locker unit setup</p>
                                </div>
                              )}
                              {selectedSupportInfoFields.includes('service_description') && (
                                <div className="col-span-2">
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Description</span>
                                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                    Install and configure 2x parcel lockers at store entrance
                                  </p>
                                </div>
                              )}
                              {selectedSupportInfoFields.includes('service_scheduled_date') && (
                                <div>
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Scheduled</span>
                                  <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Today, 10:00 AM</p>
                                </div>
                              )}
                              {selectedSupportInfoFields.includes('service_reference') && (
                                <div>
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Reference</span>
                                  <p className={`text-sm font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>SVC-2024-001234</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Project Details */}
                        {selectedSupportInfoFields.filter(f => f.startsWith('project_')).length > 0 && (
                          <div className={`rounded-xl overflow-hidden ${
                            isDark ? 'bg-white/5' : 'bg-slate-50'
                          }`}>
                            <div className={`px-4 py-2 flex items-center gap-2 ${
                              isDark ? 'bg-purple-500/10' : 'bg-purple-50'
                            }`}>
                              <FolderKanban className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                              <span className={`text-sm font-semibold ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                                Project Details
                              </span>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-3">
                              {selectedSupportInfoFields.includes('project_name') && (
                                <div>
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Name</span>
                                  <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Q1 Deployment - France</p>
                                </div>
                              )}
                              {selectedSupportInfoFields.includes('project_type') && (
                                <div>
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Type</span>
                                  <p className={`text-sm`}>
                                    <span className={`px-2 py-0.5 rounded ${
                                      isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                                    }`}>Deployment</span>
                                  </p>
                                </div>
                              )}
                              {selectedSupportInfoFields.includes('project_status') && (
                                <div>
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Status</span>
                                  <p className={`text-sm`}>
                                    <span className={`px-2 py-0.5 rounded ${
                                      isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                                    }`}>In Progress</span>
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Support Tools */}
                      <div className="space-y-4">
                        {/* Chat Panel */}
                        {selectedSupportModules.includes('chat') && (
                          <div className={`rounded-xl overflow-hidden ${
                            isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'
                          }`}>
                            <div className={`px-3 py-2 flex items-center gap-2 ${
                              isDark ? 'bg-white/5' : 'bg-slate-100'
                            }`}>
                              <MessageCircle className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                              <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Live Chat
                              </span>
                              <span className={`ml-auto w-2 h-2 rounded-full bg-emerald-500`} />
                            </div>
                            <div className={`p-3 space-y-2 h-32 overflow-y-auto ${
                              isDark ? 'bg-slate-900/50' : 'bg-white'
                            }`}>
                              <div className={`p-2 rounded-lg text-xs max-w-[80%] ${
                                isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'
                              }`}>
                                Need help with the wiring setup
                              </div>
                              <div className={`p-2 rounded-lg text-xs max-w-[80%] ml-auto ${
                                isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                              }`}>
                                Sure, sending you the diagram now
                              </div>
                            </div>
                            <div className={`p-2 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                                isDark ? 'bg-slate-900' : 'bg-white border border-slate-200'
                              }`}>
                                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Type a message...</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Auto Translate */}
                        {selectedSupportModules.includes('auto_translate') && (
                          <div className={`rounded-xl p-3 ${
                            isDark ? 'bg-white/5' : 'bg-slate-50'
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              <Languages className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                              <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Auto Translate
                              </span>
                            </div>
                            <div className={`flex items-center justify-between p-2 rounded-lg ${
                              isDark ? 'bg-white/5' : 'bg-white'
                            }`}>
                              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>EN → FR</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                              }`}>Active</span>
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {selectedSupportModules.includes('notes') && (
                          <div className={`rounded-xl p-3 ${
                            isDark ? 'bg-white/5' : 'bg-slate-50'
                          }`}>
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className={`w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                              <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Support Notes
                              </span>
                            </div>
                            <div className={`p-2 rounded-lg min-h-[60px] ${
                              isDark ? 'bg-slate-900' : 'bg-white border border-slate-200'
                            }`}>
                              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Add notes for technician...
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
