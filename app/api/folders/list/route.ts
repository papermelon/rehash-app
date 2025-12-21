import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getErrorMessage } from '@/lib/error-utils'

export async function GET(_request: NextRequest) {
  try {
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

    // Fetch folders
    const { data: folders, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Failed to fetch folders:', error)
      return NextResponse.json(
        { error: 'Failed to fetch folders' },
        { status: 500 }
      )
    }

    return NextResponse.json({ folders: folders || [] })
  } catch (error) {
    console.error('Fetch folders error:', error)
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to fetch folders') },
      { status: 500 }
    )
  }
}
