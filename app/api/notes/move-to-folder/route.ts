import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getErrorMessage } from '@/lib/error-utils'

export async function POST(request: NextRequest) {
  try {
    const { noteId, folderId } = await request.json()

    if (!noteId || typeof noteId !== 'string') {
      return NextResponse.json(
        { error: 'Note ID is required' },
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

    // Update note's folder_id (null means no folder/uncategorized)
    const { error: updateError } = await supabase
      .from('notes')
      .update({
        folder_id: folderId || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Failed to move note to folder:', updateError)
      return NextResponse.json(
        { error: 'Failed to move note' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Move note to folder error:', error)
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to move note') },
      { status: 500 }
    )
  }
}
