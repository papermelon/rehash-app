import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { folderIds } = await request.json()

    if (!Array.isArray(folderIds)) {
      return NextResponse.json(
        { error: 'folderIds must be an array' },
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

    // Update order_index for each folder
    const updates = folderIds.map((folderId, index) =>
      supabase
        .from('folders')
        .update({ order_index: index })
        .eq('id', folderId)
        .eq('user_id', user.id)
    )

    const results = await Promise.all(updates)

    // Check for errors
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      console.error('Failed to reorder folders:', errors)
      return NextResponse.json(
        { error: 'Failed to reorder folders' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Reorder folders error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reorder folders' },
      { status: 500 }
    )
  }
}

