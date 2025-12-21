import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getErrorMessage } from '@/lib/error-utils'

export async function POST(request: NextRequest) {
  try {
    const { viewMode } = await request.json()

    if (!viewMode || !['grid', 'list'].includes(viewMode)) {
      return NextResponse.json(
        { error: 'Valid view mode is required (grid or list)' },
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

    // Upsert user preferences
    const { error: upsertError } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        vault_view_mode: viewMode,
        updated_at: new Date().toISOString(),
      })

    if (upsertError) {
      console.error('Failed to update view mode:', upsertError)
      return NextResponse.json(
        { error: 'Failed to update view mode' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update view mode error:', error)
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to update view mode') },
      { status: 500 }
    )
  }
}
