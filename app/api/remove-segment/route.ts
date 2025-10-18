import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { ScriptSegment } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { noteId, segmentId } = await request.json()

    if (!noteId || !segmentId) {
      return NextResponse.json(
        { error: 'Note ID and segment ID are required' },
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

    // Fetch the note
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId)
      .eq('user_id', user.id)
      .single()

    if (noteError || !note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      )
    }

    // Remove the segment
    const segments = (note.script_segments || []) as ScriptSegment[]
    const updatedSegments = segments
      .filter(seg => seg.id !== segmentId)
      .map((seg, index) => ({
        ...seg,
        order: index, // Re-index after removal
      }))

    // Recalculate total cost
    const totalCost = updatedSegments.reduce((sum, seg) => sum + (seg.cost || 0), 0)

    // Update note
    const { error: updateError } = await supabase
      .from('notes')
      .update({
        script_segments: updatedSegments,
        total_image_cost: totalCost,
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Failed to remove segment:', updateError)
      return NextResponse.json(
        { error: 'Failed to remove segment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Remove segment error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to remove segment' },
      { status: 500 }
    )
  }
}

