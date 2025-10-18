import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { folderId, name, color, icon } = await request.json()

    if (!folderId || typeof folderId !== 'string') {
      return NextResponse.json(
        { error: 'Folder ID is required' },
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

    const updates: any = {
      updated_at: new Date().toISOString(),
    }

    if (name) updates.name = name
    if (color) updates.color = color
    if (icon) updates.icon = icon

    // Update folder
    const { error: updateError } = await supabase
      .from('folders')
      .update(updates)
      .eq('id', folderId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Failed to update folder:', updateError)
      return NextResponse.json(
        { error: 'Failed to update folder' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update folder error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update folder' },
      { status: 500 }
    )
  }
}

