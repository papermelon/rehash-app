import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { noteId, scriptText } = await request.json()

    if (!noteId || typeof noteId !== 'string') {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      )
    }

    if (!scriptText || typeof scriptText !== 'string') {
      return NextResponse.json(
        { error: 'Script text is required' },
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

    // Update the script text
    const { error: updateError } = await supabase
      .from('notes')
      .update({
        script_text: scriptText,
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Failed to update script:', updateError)
      return NextResponse.json(
        { error: 'Failed to save script' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Script update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update script' },
      { status: 500 }
    )
  }
}

