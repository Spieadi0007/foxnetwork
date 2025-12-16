'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Library,
  Users,
  Globe,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  LayoutGrid,
  List,
  MoreVertical,
  Check,
  FolderKanban,
  ChevronRight,
  ChevronDown,
  Workflow,
  ClipboardList,
  ExternalLink,
  Filter,
  GitBranch,
} from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/contexts/theme-context'
import { toast } from 'sonner'
import {
  getLibraryCategories,
  getLibraryItems,
  getLibraryItemsWithChildren,
  createLibraryItem,
  updateLibraryItem,
  deleteLibraryItem,
  getLibraryStats,
} from '@/lib/actions/library'
import type {
  LibraryCategory,
  LibraryItem,
  CreateLibraryItemInput,
  StepCondition,
  StepConditionsConfig,
} from '@/types/library'
import { SERVICE_CONDITION_FIELDS, OPERATOR_OPTIONS } from '@/types/library'

export default function LibraryPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // State
  const [categories, setCategories] = useState<LibraryCategory[]>([])
  const [items, setItems] = useState<LibraryItem[]>([])
  const [stats, setStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('clients')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('list')

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Nested items state
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [addingChildTo, setAddingChildTo] = useState<LibraryItem | null>(null)  // Parent item when adding service

  // Form state
  const [createForm, setCreateForm] = useState<CreateLibraryItemInput>({
    category_id: '',
    name: '',
    code: '',
    description: '',
  })

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [categoriesRes, statsRes] = await Promise.all([
        getLibraryCategories(),
        getLibraryStats(),
      ])

      if (categoriesRes.data) setCategories(categoriesRes.data)
      if (statsRes.data) setStats(statsRes.data)

      // Check if current category supports nesting
      const currentCategory = categoriesRes.data?.find(c => c.slug === activeCategory)

      // Use nested query for categories that support it
      if (currentCategory?.supports_nesting) {
        const itemsRes = await getLibraryItemsWithChildren(activeCategory)
        if (itemsRes.data) setItems(itemsRes.data)
      } else {
        const itemsRes = await getLibraryItems(activeCategory)
        if (itemsRes.data) setItems(itemsRes.data)
      }
    } catch (error) {
      console.error('Error loading library data:', error)
      toast.error('Failed to load library data')
    } finally {
      setLoading(false)
    }
  }, [activeCategory])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Get active category object
  const activeCategoryObj = categories.find(c => c.slug === activeCategory)

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Handlers
  const handleCreateItem = async () => {
    if (!createForm.name.trim()) {
      toast.error('Name is required')
      return
    }

    if (!activeCategoryObj) {
      toast.error('Please select a category')
      return
    }

    setFormLoading(true)
    try {
      const result = await createLibraryItem({
        ...createForm,
        category_id: activeCategoryObj.id,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${activeCategoryObj.name.slice(0, -1)} added successfully`)
        setShowCreateModal(false)
        setCreateForm({ category_id: '', name: '', code: '', description: '' })
        loadData()
      }
    } catch {
      toast.error('Failed to create item')
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateItem = async () => {
    if (!editingItem) return

    setFormLoading(true)
    try {
      const result = await updateLibraryItem(editingItem.id, {
        name: editingItem.name,
        code: editingItem.code,
        description: editingItem.description,
        is_active: editingItem.is_active,
        metadata: editingItem.metadata,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Item updated successfully')
        setEditingItem(null)
        loadData()
      }
    } catch {
      toast.error('Failed to update item')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteItem = async (id: string, hasChildren?: boolean) => {
    const message = hasChildren
      ? 'Are you sure? This will also delete all services under this project type.'
      : 'Are you sure you want to delete this item?'
    if (!confirm(message)) return

    try {
      const result = await deleteLibraryItem(id)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Item deleted successfully')
        loadData()
      }
    } catch {
      toast.error('Failed to delete item')
    }
  }

  // Toggle expanded state for nested items
  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  // Handle creating a child item (service)
  const handleCreateChild = async () => {
    if (!createForm.name.trim()) {
      toast.error('Name is required')
      return
    }

    if (!addingChildTo || !activeCategoryObj) {
      toast.error('Parent item not found')
      return
    }

    setFormLoading(true)
    try {
      const result = await createLibraryItem({
        ...createForm,
        category_id: activeCategoryObj.id,
        parent_id: addingChildTo.id,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${activeCategoryObj.child_label?.slice(0, -1) || 'Service'} added successfully`)
        setAddingChildTo(null)
        setCreateForm({ category_id: '', name: '', code: '', description: '' })
        // Expand the parent to show new child
        setExpandedItems(prev => new Set(prev).add(addingChildTo.id))
        loadData()
      }
    } catch {
      toast.error('Failed to create item')
    } finally {
      setFormLoading(false)
    }
  }

  // Get icon component for category
  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'clients':
        return Users
      case 'countries':
        return Globe
      case 'project_types':
        return FolderKanban
      case 'workflow_steps':
        return GitBranch
      case 'step_statuses':
        return Workflow
      default:
        return Library
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Library
          </h1>
          <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage reusable items like clients, countries, and more
          </p>
        </div>
        <motion.button
          onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium flex items-center gap-2 shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-5 h-5" />
          Add {activeCategoryObj?.name.slice(0, -1) || 'Item'}
        </motion.button>
      </div>

      {/* Category Tabs */}
      <div className={`flex flex-wrap gap-2 p-1 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.slug)
          const isActive = activeCategory === category.slug
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.slug)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                isActive
                  ? isDark
                    ? 'bg-white/10 text-white'
                    : 'bg-white text-slate-900 shadow-sm'
                  : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-white/5'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.name}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                isActive
                  ? isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                  : isDark ? 'bg-white/10 text-slate-500' : 'bg-slate-200 text-slate-500'
              }`}>
                {stats[category.slug] || 0}
              </span>
            </button>
          )
        })}

        {/* Divider */}
        <div className={`w-px my-1 ${isDark ? 'bg-white/10' : 'bg-slate-300'}`} />

        {/* Field Forms Link */}
        <Link
          href="/library/field-forms"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
            isDark
              ? 'text-slate-400 hover:text-white hover:bg-white/5'
              : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Field Forms
          <ExternalLink className="w-3 h-3 opacity-50" />
        </Link>
      </div>

      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder={`Search ${activeCategory}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
            }`}
          />
        </div>
        <div className={`flex rounded-xl border ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <button
            onClick={() => setViewMode('cards')}
            className={`p-2.5 rounded-l-xl transition-colors ${
              viewMode === 'cards'
                ? isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900'
                : isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-r-xl transition-colors ${
              viewMode === 'list'
                ? isDark ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900'
                : isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Items Display */}
      {viewMode === 'cards' ? (
        // Card View
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item, index) => {
            const Icon = getCategoryIcon(activeCategory)
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-xl border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {item.name}
                      </p>
                      {item.code && (
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {item.code}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingItem(item)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {item.description && (
                  <p className={`mt-3 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {item.description}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                    item.is_active
                      ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                      : isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <Check className="w-3 h-3" />
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        // List View
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Name
                </th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Code
                </th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {activeCategoryObj?.supports_nesting ? activeCategoryObj.child_label || 'Services' : 'Description'}
                </th>
                <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Status
                </th>
                <th className={`px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const Icon = getCategoryIcon(activeCategory)
                const isExpanded = expandedItems.has(item.id)
                const hasChildren = item.children && item.children.length > 0
                const supportsNesting = activeCategoryObj?.supports_nesting

                return (
                  <React.Fragment key={item.id}>
                    {/* Parent Row */}
                    <tr
                      className={`border-b last:border-0 ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {supportsNesting && (
                            <button
                              onClick={() => toggleExpanded(item.id)}
                              className={`p-1 rounded transition-colors ${
                                isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                              }`}
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {item.name}
                          </p>
                        </div>
                      </td>
                      <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {item.code || '-'}
                      </td>
                      <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {supportsNesting ? (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                          }`}>
                            {item.children?.length || 0} {activeCategoryObj?.child_label?.toLowerCase() || 'services'}
                          </span>
                        ) : (
                          <p className="truncate max-w-[200px]">{item.description || '-'}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full w-fit ${
                          item.is_active
                            ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                            : isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <Check className="w-3 h-3" />
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {supportsNesting && (
                            <button
                              onClick={() => setAddingChildTo(item)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                              }`}
                              title={`Add ${activeCategoryObj?.child_label?.slice(0, -1) || 'Service'}`}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setEditingItem(item)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                            }`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, hasChildren)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Child Rows (Services) */}
                    {supportsNesting && isExpanded && item.children?.map((child, childIndex) => (
                      <tr
                        key={child.id}
                        className={`border-b last:border-0 ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}
                      >
                        <td className="px-4 py-2.5 pl-16">
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center`}>
                              <Workflow className="w-3 h-3 text-white" />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                                isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-200 text-slate-500'
                              }`}>
                                {childIndex + 1}
                              </span>
                              <p className={`font-medium text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                {child.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className={`px-4 py-2.5 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {child.code || '-'}
                        </td>
                        <td className={`px-4 py-2.5 text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          <p className="truncate max-w-[200px]">{child.description || '-'}</p>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full w-fit ${
                            child.is_active
                              ? isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                              : isDark ? 'bg-slate-500/20 text-slate-400' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <Check className="w-3 h-3" />
                            {child.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingItem(child)}
                              className={`p-1 rounded-lg transition-colors ${
                                isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                              }`}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(child.id)}
                              className={`p-1 rounded-lg transition-colors ${
                                isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
          {(() => {
            const Icon = getCategoryIcon(activeCategory)
            return <Icon className={`w-12 h-12 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
          })()}
          <p className={`mt-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            No {activeCategory} found
          </p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Add your first {activeCategoryObj?.name.slice(0, -1).toLowerCase() || 'item'} to get started
          </p>
          <motion.button
            onClick={() => setShowCreateModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Add {activeCategoryObj?.name.slice(0, -1) || 'Item'}
          </motion.button>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
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
              {/* Header */}
              <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Add {activeCategoryObj?.name.slice(0, -1) || 'Item'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="p-5 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder={activeCategory === 'clients' ? 'e.g., Acme Corporation' : 'e.g., France'}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Code
                  </label>
                  <input
                    type="text"
                    value={createForm.code}
                    onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                    placeholder={activeCategory === 'clients' ? 'e.g., ACME' : 'e.g., FR'}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    rows={3}
                    placeholder="Optional description..."
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className={`flex items-center justify-end gap-3 p-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`px-5 py-2.5 rounded-xl font-medium ${
                    isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleCreateItem}
                  disabled={formLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium disabled:opacity-50"
                >
                  {formLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Add'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setEditingItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full ${activeCategory === 'workflow_steps' ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl ${
                isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              {/* Header */}
              <div className={`sticky top-0 z-10 flex items-center justify-between p-5 border-b backdrop-blur-xl ${isDark ? 'bg-slate-900/90 border-white/10' : 'bg-white/90 border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600">
                    <Edit className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Edit {activeCategoryObj?.name.slice(0, -1) || 'Item'}
                  </h2>
                </div>
                <button
                  onClick={() => setEditingItem(null)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="p-5 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Code
                  </label>
                  <input
                    type="text"
                    value={editingItem.code || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, code: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={editingItem.is_active}
                    onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <label htmlFor="is_active" className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Active
                  </label>
                </div>

                {/* Step Conditions Builder - Only for workflow_steps */}
                {activeCategory === 'workflow_steps' && (
                  <div className={`mt-6 pt-6 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Filter className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Auto-Assignment Conditions
                        </h3>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                        Optional
                      </span>
                    </div>
                    <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Define when this step should be automatically suggested based on service field values.
                    </p>

                    {/* Logic selector */}
                    <div className="mb-4">
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Match Logic
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const metadata = editingItem.metadata || {}
                            const conditions = (metadata as { step_conditions?: StepConditionsConfig }).step_conditions || { conditions: [], logic: 'all' }
                            setEditingItem({
                              ...editingItem,
                              metadata: { ...metadata, step_conditions: { ...conditions, logic: 'all' } }
                            })
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            ((editingItem.metadata as { step_conditions?: StepConditionsConfig })?.step_conditions?.logic || 'all') === 'all'
                              ? 'bg-blue-500 text-white'
                              : isDark ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Match ALL conditions
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const metadata = editingItem.metadata || {}
                            const conditions = (metadata as { step_conditions?: StepConditionsConfig }).step_conditions || { conditions: [], logic: 'any' }
                            setEditingItem({
                              ...editingItem,
                              metadata: { ...metadata, step_conditions: { ...conditions, logic: 'any' } }
                            })
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            (editingItem.metadata as { step_conditions?: StepConditionsConfig })?.step_conditions?.logic === 'any'
                              ? 'bg-blue-500 text-white'
                              : isDark ? 'bg-white/10 text-slate-300 hover:bg-white/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Match ANY condition
                        </button>
                      </div>
                    </div>

                    {/* Conditions List */}
                    <div className="space-y-3">
                      {((editingItem.metadata as { step_conditions?: StepConditionsConfig })?.step_conditions?.conditions || []).map((condition, index) => {
                        const fieldDef = SERVICE_CONDITION_FIELDS.find(f => f.key === condition.field)
                        const fieldType = fieldDef?.type || 'text'
                        const operators = OPERATOR_OPTIONS[fieldType as keyof typeof OPERATOR_OPTIONS] || OPERATOR_OPTIONS.all

                        return (
                          <div
                            key={index}
                            className={`flex items-center gap-2 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}
                          >
                            {/* Field selector */}
                            <select
                              value={condition.field}
                              onChange={(e) => {
                                const metadata = editingItem.metadata || {}
                                const stepConditions = (metadata as { step_conditions?: StepConditionsConfig }).step_conditions || { conditions: [], logic: 'all' }
                                const newConditions = [...stepConditions.conditions]
                                newConditions[index] = { ...condition, field: e.target.value, operator: 'is_empty', value: undefined }
                                setEditingItem({
                                  ...editingItem,
                                  metadata: { ...metadata, step_conditions: { ...stepConditions, conditions: newConditions } }
                                })
                              }}
                              className={`flex-1 px-3 py-2 rounded-lg border text-sm ${
                                isDark
                                  ? 'bg-slate-800 border-white/10 text-white'
                                  : 'bg-white border-slate-200 text-slate-900'
                              }`}
                            >
                              <option value="">Select field...</option>
                              {SERVICE_CONDITION_FIELDS.map(field => (
                                <option key={field.key} value={field.key}>{field.label}</option>
                              ))}
                            </select>

                            {/* Operator selector */}
                            <select
                              value={condition.operator}
                              onChange={(e) => {
                                const metadata = editingItem.metadata || {}
                                const stepConditions = (metadata as { step_conditions?: StepConditionsConfig }).step_conditions || { conditions: [], logic: 'all' }
                                const newConditions = [...stepConditions.conditions]
                                newConditions[index] = { ...condition, operator: e.target.value as StepCondition['operator'] }
                                setEditingItem({
                                  ...editingItem,
                                  metadata: { ...metadata, step_conditions: { ...stepConditions, conditions: newConditions } }
                                })
                              }}
                              className={`w-40 px-3 py-2 rounded-lg border text-sm ${
                                isDark
                                  ? 'bg-slate-800 border-white/10 text-white'
                                  : 'bg-white border-slate-200 text-slate-900'
                              }`}
                            >
                              {operators.map(op => (
                                <option key={op.value} value={op.value}>{op.label}</option>
                              ))}
                            </select>

                            {/* Value input (only for certain operators) */}
                            {!['is_empty', 'is_not_empty'].includes(condition.operator) && (
                              <input
                                type="text"
                                value={condition.value?.toString() || ''}
                                onChange={(e) => {
                                  const metadata = editingItem.metadata || {}
                                  const stepConditions = (metadata as { step_conditions?: StepConditionsConfig }).step_conditions || { conditions: [], logic: 'all' }
                                  const newConditions = [...stepConditions.conditions]
                                  newConditions[index] = { ...condition, value: e.target.value }
                                  setEditingItem({
                                    ...editingItem,
                                    metadata: { ...metadata, step_conditions: { ...stepConditions, conditions: newConditions } }
                                  })
                                }}
                                placeholder="Value"
                                className={`w-32 px-3 py-2 rounded-lg border text-sm ${
                                  isDark
                                    ? 'bg-slate-800 border-white/10 text-white placeholder:text-slate-500'
                                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                                }`}
                              />
                            )}

                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => {
                                const metadata = editingItem.metadata || {}
                                const stepConditions = (metadata as { step_conditions?: StepConditionsConfig }).step_conditions || { conditions: [], logic: 'all' }
                                const newConditions = stepConditions.conditions.filter((_, i) => i !== index)
                                setEditingItem({
                                  ...editingItem,
                                  metadata: { ...metadata, step_conditions: { ...stepConditions, conditions: newConditions } }
                                })
                              }}
                              className={`p-2 rounded-lg transition-colors ${
                                isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      })}

                      {/* Add condition button */}
                      <button
                        type="button"
                        onClick={() => {
                          const metadata = editingItem.metadata || {}
                          const stepConditions = (metadata as { step_conditions?: StepConditionsConfig }).step_conditions || { conditions: [], logic: 'all' }
                          const newCondition: StepCondition = { field: '', operator: 'is_empty' }
                          setEditingItem({
                            ...editingItem,
                            metadata: {
                              ...metadata,
                              step_conditions: {
                                ...stepConditions,
                                conditions: [...stepConditions.conditions, newCondition]
                              }
                            }
                          })
                        }}
                        className={`w-full py-2.5 rounded-xl border-2 border-dashed text-sm font-medium transition-colors ${
                          isDark
                            ? 'border-white/20 text-slate-400 hover:border-blue-500/50 hover:text-blue-400'
                            : 'border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'
                        }`}
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        Add Condition
                      </button>
                    </div>

                    {/* Preview */}
                    {((editingItem.metadata as { step_conditions?: StepConditionsConfig })?.step_conditions?.conditions || []).length > 0 && (
                      <div className={`mt-4 p-3 rounded-xl text-sm ${isDark ? 'bg-blue-500/10 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                        <GitBranch className="w-4 h-4 inline mr-2" />
                        <strong>{editingItem.name}</strong> will be suggested when{' '}
                        {((editingItem.metadata as { step_conditions?: StepConditionsConfig })?.step_conditions?.logic || 'all') === 'all' ? 'ALL' : 'ANY'}{' '}
                        of the {((editingItem.metadata as { step_conditions?: StepConditionsConfig })?.step_conditions?.conditions || []).length} condition(s) match.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className={`sticky bottom-0 flex items-center justify-end gap-3 p-5 border-t backdrop-blur-xl ${isDark ? 'bg-slate-900/90 border-white/10' : 'bg-white/90 border-slate-200'}`}>
                <button
                  onClick={() => setEditingItem(null)}
                  className={`px-5 py-2.5 rounded-xl font-medium ${
                    isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleUpdateItem}
                  disabled={formLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium disabled:opacity-50"
                >
                  {formLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Save Changes'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Child (Service) Modal */}
      <AnimatePresence>
        {addingChildTo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setAddingChildTo(null)
              setCreateForm({ category_id: '', name: '', code: '', description: '' })
            }}
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
              {/* Header */}
              <div className={`flex items-center justify-between p-5 border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
                    <Workflow className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Add {activeCategoryObj?.child_label?.slice(0, -1) || 'Service'}
                    </h2>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      to {addingChildTo.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAddingChildTo(null)
                    setCreateForm({ category_id: '', name: '', code: '', description: '' })
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="p-5 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    placeholder="e.g., Survey, Works, Activation"
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Code
                  </label>
                  <input
                    type="text"
                    value={createForm.code}
                    onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                    placeholder="e.g., SRV, WRK, ACT"
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    rows={3}
                    placeholder="Optional description..."
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className={`flex items-center justify-end gap-3 p-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <button
                  onClick={() => {
                    setAddingChildTo(null)
                    setCreateForm({ category_id: '', name: '', code: '', description: '' })
                  }}
                  className={`px-5 py-2.5 rounded-xl font-medium ${
                    isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleCreateChild}
                  disabled={formLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium disabled:opacity-50"
                >
                  {formLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Add'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
