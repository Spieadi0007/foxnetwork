'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Search,
  Filter,
  Upload,
  Download,
  Eye,
  Folder,
  File,
  FileVideo,
  FileImage,
  ChevronDown,
  MoreHorizontal,
  Star,
  Clock,
  Grid3X3,
  List,
} from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'

interface Document {
  id: string
  name: string
  type: 'pdf' | 'video' | 'image' | 'doc'
  category: 'manuals' | 'procedures' | 'guides' | 'templates'
  size: string
  uploadedBy: string
  uploadedAt: string
  starred: boolean
}

const mockDocuments: Document[] = [
  { id: 'D1', name: 'Network Installation Manual', type: 'pdf', category: 'manuals', size: '4.2 MB', uploadedBy: 'Admin', uploadedAt: '2025-11-15', starred: true },
  { id: 'D2', name: 'Safety Procedures Guide', type: 'pdf', category: 'procedures', size: '2.1 MB', uploadedBy: 'Admin', uploadedAt: '2025-11-10', starred: true },
  { id: 'D3', name: 'Fiber Optic Installation Video', type: 'video', category: 'guides', size: '156 MB', uploadedBy: 'Training Team', uploadedAt: '2025-11-08', starred: false },
  { id: 'D4', name: 'Work Order Template', type: 'doc', category: 'templates', size: '128 KB', uploadedBy: 'Admin', uploadedAt: '2025-11-05', starred: false },
  { id: 'D5', name: 'Equipment Catalog', type: 'pdf', category: 'manuals', size: '8.5 MB', uploadedBy: 'Admin', uploadedAt: '2025-11-01', starred: false },
  { id: 'D6', name: 'Customer Service Guidelines', type: 'pdf', category: 'guides', size: '1.8 MB', uploadedBy: 'HR', uploadedAt: '2025-10-28', starred: true },
  { id: 'D7', name: 'Site Inspection Checklist', type: 'doc', category: 'templates', size: '85 KB', uploadedBy: 'Operations', uploadedAt: '2025-10-25', starred: false },
  { id: 'D8', name: 'Cable Testing Procedure', type: 'video', category: 'procedures', size: '89 MB', uploadedBy: 'Training Team', uploadedAt: '2025-10-20', starred: false },
]

const typeConfig = {
  pdf: { icon: FileText, color: 'text-red-400 bg-red-500/20' },
  video: { icon: FileVideo, color: 'text-violet-400 bg-violet-500/20' },
  image: { icon: FileImage, color: 'text-blue-400 bg-blue-500/20' },
  doc: { icon: File, color: 'text-emerald-400 bg-emerald-500/20' },
}

const categoryConfig = {
  manuals: { label: 'Manuals', color: 'bg-violet-500/20 text-violet-400' },
  procedures: { label: 'Procedures', color: 'bg-blue-500/20 text-blue-400' },
  guides: { label: 'Guides', color: 'bg-emerald-500/20 text-emerald-400' },
  templates: { label: 'Templates', color: 'bg-amber-500/20 text-amber-400' },
}

export default function DocumentsPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const starredDocs = filteredDocuments.filter(d => d.starred)
  const recentDocs = filteredDocuments.filter(d => !d.starred)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Documents</h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Access training materials and documentation</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-lg shadow-emerald-500/25"
        >
          <Upload className="w-5 h-5" />
          <span>Upload Document</span>
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(categoryConfig).map(([key, config], index) => {
          const count = mockDocuments.filter(d => d.category === key).length
          return (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setCategoryFilter(categoryFilter === key ? 'all' : key)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                categoryFilter === key
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                  <Folder className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{config.label}</p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{count} files</p>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
            />
          </div>
        </div>

        <div className={`flex items-center p-1 border rounded-xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-emerald-500 text-white' : isDark ? 'text-slate-400' : 'text-slate-500'}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-emerald-500 text-white' : isDark ? 'text-slate-400' : 'text-slate-500'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Starred Documents */}
      {starredDocs.length > 0 && (
        <div>
          <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            Starred
          </h3>
          <div className={viewMode === 'grid' ? 'grid grid-cols-4 gap-4' : 'space-y-2'}>
            {starredDocs.map((doc, index) => (
              <DocumentCard key={doc.id} doc={doc} index={index} viewMode={viewMode} isDark={isDark} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Documents */}
      <div>
        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <Clock className={`w-5 h-5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          Recent
        </h3>
        <div className={viewMode === 'grid' ? 'grid grid-cols-4 gap-4' : 'space-y-2'}>
          {recentDocs.map((doc, index) => (
            <DocumentCard key={doc.id} doc={doc} index={index} viewMode={viewMode} isDark={isDark} />
          ))}
        </div>
      </div>
    </div>
  )
}

function DocumentCard({ doc, index, viewMode, isDark }: { doc: Document; index: number; viewMode: 'grid' | 'list'; isDark: boolean }) {
  const TypeIcon = typeConfig[doc.type].icon

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
        className={`flex items-center justify-between p-4 rounded-xl border transition-colors group ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'}`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl ${typeConfig[doc.type].color}`}>
            <TypeIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{doc.name}</p>
              {doc.starred && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
            </div>
            <div className={`flex items-center gap-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className={`px-2 py-0.5 rounded text-xs ${categoryConfig[doc.category].color}`}>
                {categoryConfig[doc.category].label}
              </span>
              <span>{doc.size}</span>
              <span>{doc.uploadedAt}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
            <Eye className="w-4 h-4" />
          </button>
          <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
            <Download className="w-4 h-4" />
          </button>
          <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -4 }}
      className={`p-4 rounded-2xl border transition-colors cursor-pointer group ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${typeConfig[doc.type].color}`}>
          <TypeIcon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-1">
          {doc.starred && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
          <button className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <h4 className={`font-medium mb-2 line-clamp-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{doc.name}</h4>

      <div className="flex items-center justify-between text-sm">
        <span className={`px-2 py-0.5 rounded text-xs ${categoryConfig[doc.category].color}`}>
          {categoryConfig[doc.category].label}
        </span>
        <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{doc.size}</span>
      </div>
    </motion.div>
  )
}
