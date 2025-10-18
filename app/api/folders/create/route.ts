import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { name, color, icon } = await request.json()

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      )
    }

    const supabase = await getSupabaseServerClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get max order_index for user's folders
    const { data: maxFolder } = await supabase
      .from('folders')
      .select('order_index')
      .eq('user_id', user.id)
      .order('order_index', { ascending: false })
      .limit(1)
      .single()

    const newOrderIndex = (maxFolder?.order_index ?? -1) + 1

    // Create folder
    const { data: folder, error: createError } = await supabase
      .from('folders')
      .insert({
        user_id: user.id,
        name,
        color: color || '#6366f1',
        icon: icon || '📁',
        order_index: newOrderIndex,
      })
      .select()
      .single()

    if (createError) {
      console.error('Failed to create folder:', createError)
      return NextResponse.json(
        { error: 'Failed to create folder' },
        { status: 500 }
      )
    }

    return NextResponse.json({ folder })
  } catch (error: any) {
    console.error('Create folder error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create folder' },
      { status: 500 }
    )
  }
}

