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
        { error: 'Unauthorized', user_id: null },
        { status: 401 }
      )
    }

    // Try to fetch folders
    const { data: folders, error: folderError } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', user.id)
      .order('order_index', { ascending: true })

    // Check if table exists
    const tableExists = !folderError || folderError.code !== '42P01'

    return NextResponse.json({
      user_id: user.id,
      user_email: user.email,
      folders: folders || [],
      folder_count: folders?.length || 0,
      table_exists: tableExists,
      error: folderError ? {
        message: folderError.message,
        code: folderError.code,
        details: folderError.details,
      } : null,
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: getErrorMessage(error, 'Failed to load folder debug info'),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
