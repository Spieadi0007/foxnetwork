'use server'

import { createClient } from '@/lib/supabase/server-client'
import type {
  LibraryCategory,
  LibraryItem,
  CreateLibraryItemInput,
  UpdateLibraryItemInput,
  LibraryItemOption,
} from '@/types/library'

// ==================
// CATEGORIES
// ==================

export async function getLibraryCategories(): Promise<{
  data: LibraryCategory[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('library_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Error fetching library categories:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in getLibraryCategories:', err)
    return { data: null, error: 'Failed to fetch library categories' }
  }
}

export async function getCategoryBySlug(slug: string): Promise<{
  data: LibraryCategory | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('library_categories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) {
      console.error('Error fetching category:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in getCategoryBySlug:', err)
    return { data: null, error: 'Failed to fetch category' }
  }
}

// ==================
// LIBRARY ITEMS
// ==================

export async function getLibraryItems(categorySlug?: string, rootOnly?: boolean): Promise<{
  data: LibraryItem[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    // Get company_id from current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userData?.company_id) {
      return { data: null, error: 'No company found' }
    }

    let query = supabase
      .from('library_items')
      .select(`
        *,
        category:library_categories(*)
      `)
      .eq('company_id', userData.company_id)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    // Filter by category if provided
    if (categorySlug) {
      const { data: category } = await supabase
        .from('library_categories')
        .select('id')
        .eq('slug', categorySlug)
        .single()

      if (category) {
        query = query.eq('category_id', category.id)
      }
    }

    // Filter only root items (no parent) if requested
    if (rootOnly) {
      query = query.is('parent_id', null)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching library items:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in getLibraryItems:', err)
    return { data: null, error: 'Failed to fetch library items' }
  }
}

export async function getLibraryItemsForSelect(categorySlug: string): Promise<{
  data: LibraryItemOption[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    // Get company_id from current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userData?.company_id) {
      return { data: null, error: 'No company found' }
    }

    // Get category ID
    const { data: category } = await supabase
      .from('library_categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()

    if (!category) {
      return { data: [], error: null }
    }

    const { data, error } = await supabase
      .from('library_items')
      .select('id, name, code')
      .eq('company_id', userData.company_id)
      .eq('category_id', category.id)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching library items for select:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in getLibraryItemsForSelect:', err)
    return { data: null, error: 'Failed to fetch library items' }
  }
}

export async function createLibraryItem(input: CreateLibraryItemInput): Promise<{
  data: LibraryItem | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    // Get company_id from current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userData?.company_id) {
      return { data: null, error: 'No company found' }
    }

    const { data, error } = await supabase
      .from('library_items')
      .insert({
        company_id: userData.company_id,
        category_id: input.category_id,
        parent_id: input.parent_id || null,
        name: input.name,
        code: input.code,
        description: input.description,
        metadata: input.metadata || {},
        is_active: input.is_active ?? true,
        display_order: input.display_order ?? 0,
        created_by: user.id,
      })
      .select(`
        *,
        category:library_categories(*)
      `)
      .single()

    if (error) {
      console.error('Error creating library item:', error)
      if (error.code === '23505') {
        return { data: null, error: 'An item with this name already exists in this category' }
      }
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in createLibraryItem:', err)
    return { data: null, error: 'Failed to create library item' }
  }
}

export async function updateLibraryItem(id: string, input: UpdateLibraryItemInput): Promise<{
  data: LibraryItem | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('library_items')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        category:library_categories(*)
      `)
      .single()

    if (error) {
      console.error('Error updating library item:', error)
      if (error.code === '23505') {
        return { data: null, error: 'An item with this name already exists in this category' }
      }
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in updateLibraryItem:', err)
    return { data: null, error: 'Failed to update library item' }
  }
}

export async function deleteLibraryItem(id: string): Promise<{
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('library_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting library item:', error)
      return { error: error.message }
    }

    return { error: null }
  } catch (err) {
    console.error('Error in deleteLibraryItem:', err)
    return { error: 'Failed to delete library item' }
  }
}

// ==================
// NESTED ITEMS (for project types with services)
// ==================

export async function getLibraryItemsWithChildren(categorySlug: string): Promise<{
  data: LibraryItem[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    // Get company_id from current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userData?.company_id) {
      return { data: null, error: 'No company found' }
    }

    // Get category
    const { data: category } = await supabase
      .from('library_categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()

    if (!category) {
      return { data: [], error: null }
    }

    // Get all items (both parent and children)
    const { data: allItems, error } = await supabase
      .from('library_items')
      .select(`
        *,
        category:library_categories(*)
      `)
      .eq('company_id', userData.company_id)
      .eq('category_id', category.id)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching library items with children:', error)
      return { data: null, error: error.message }
    }

    // Build tree structure: parent items with their children
    const parentItems = allItems?.filter(item => !item.parent_id) || []
    const childItems = allItems?.filter(item => item.parent_id) || []

    const itemsWithChildren = parentItems.map(parent => ({
      ...parent,
      children: childItems
        .filter(child => child.parent_id === parent.id)
        .sort((a, b) => a.display_order - b.display_order)
    }))

    return { data: itemsWithChildren, error: null }
  } catch (err) {
    console.error('Error in getLibraryItemsWithChildren:', err)
    return { data: null, error: 'Failed to fetch library items' }
  }
}

export async function getChildItems(parentId: string): Promise<{
  data: LibraryItem[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('library_items')
      .select(`
        *,
        category:library_categories(*)
      `)
      .eq('parent_id', parentId)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching child items:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in getChildItems:', err)
    return { data: null, error: 'Failed to fetch child items' }
  }
}

// ==================
// SERVICE TYPES (children of project types)
// ==================

export async function getServiceTypes(): Promise<{
  data: LibraryItem[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    // Get company_id from current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userData?.company_id) {
      return { data: null, error: 'No company found' }
    }

    // Get the project_types category
    const { data: category } = await supabase
      .from('library_categories')
      .select('id')
      .eq('slug', 'project_types')
      .single()

    if (!category) {
      return { data: [], error: null }
    }

    // Get only items with a parent_id (service types, not project types)
    const { data, error } = await supabase
      .from('library_items')
      .select(`
        *,
        category:library_categories(*),
        parent:library_items!parent_id(id, name, code)
      `)
      .eq('company_id', userData.company_id)
      .eq('category_id', category.id)
      .not('parent_id', 'is', null)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching service types:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in getServiceTypes:', err)
    return { data: null, error: 'Failed to fetch service types' }
  }
}

// ==================
// STATS
// ==================

export async function getLibraryStats(): Promise<{
  data: Record<string, number> | null
  error: string | null
}> {
  try {
    const supabase = await createClient()

    // Get company_id from current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data: userData } = await supabase
      .from('users')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!userData?.company_id) {
      return { data: null, error: 'No company found' }
    }

    // Get counts per category
    const { data: categories } = await supabase
      .from('library_categories')
      .select('id, slug')
      .eq('is_active', true)

    if (!categories) {
      return { data: {}, error: null }
    }

    const stats: Record<string, number> = {}

    for (const cat of categories) {
      const { count } = await supabase
        .from('library_items')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', userData.company_id)
        .eq('category_id', cat.id)
        .eq('is_active', true)
        .is('parent_id', null)  // Only count top-level items

      stats[cat.slug] = count || 0
    }

    return { data: stats, error: null }
  } catch (err) {
    console.error('Error in getLibraryStats:', err)
    return { data: null, error: 'Failed to fetch library stats' }
  }
}
