import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai-client'
import { getStyleTemplate } from '@/lib/script-styles'
import type { ScriptStyle, ScriptSegment } from '@/lib/types'
import { getErrorMessage } from '@/lib/error-utils'

// Increase timeout for this route to handle long-running segment generation
export const maxDuration = 300 // 5 minutes
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { noteId } = await request.json()

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

    if (!note.script_text) {
      return NextResponse.json(
        { error: 'Script not found. Generate a script first.' },
        { status: 400 }
      )
    }

    // Parse script into segments (by double line breaks or paragraphs)
    const scriptText = note.script_text
    const rawSegments = scriptText
      .split(/\n\n+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0 && !s.match(/^\[.*\]$/)) // Remove stage directions like [PAUSE]

    // Get style information
    const styleTemplate = note.script_style 
      ? getStyleTemplate(note.script_style as ScriptStyle)
      : null

    const visualStyleGuide = styleTemplate?.visualStyle || 'Clean, professional video essay style with clear imagery'

    // Generate image prompts for each segment using OpenAI
    const segments: ScriptSegment[] = []
    console.log(`Starting to generate prompts for ${rawSegments.length} segments`)

    for (let i = 0; i < rawSegments.length; i++) {
      const segmentText = rawSegments[i]
      console.log(`Processing segment ${i + 1}/${rawSegments.length}`)
      
      try {
        // Use OpenAI to generate an image prompt for this segment
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert at creating image prompts for video essays. Given a script segment, create a detailed, visually descriptive prompt for an image that would accompany this narration.

Visual Style Guide: ${visualStyleGuide}

The image should:
- Complement and enhance the narration
- Be visually engaging and appropriate for the content
- Follow the established visual style
- Be suitable for ${styleTemplate?.name || 'video essay'} format

Respond with ONLY the image prompt, nothing else. Be specific about composition, colors, mood, and visual elements.`
            },
            {
              role: 'user',
              content: `Script segment: "${segmentText}"`
            }
          ],
          temperature: 0.7,
          max_tokens: 200,
        })

        const imagePrompt = completion.choices[0].message.content?.trim() || 
          `Visual representation of: ${segmentText.substring(0, 100)}...`

        segments.push({
          id: `segment-${i}`,
          text: segmentText,
          imagePrompt,
          imageUrl: null,
          order: i,
          model: null,
          cost: 0,
        })

        console.log(`Successfully generated prompt for segment ${i + 1}`)
      } catch (err) {
        console.error(`Failed to generate prompt for segment ${i + 1}:`, err)
        // Add segment with fallback prompt if OpenAI fails
        segments.push({
          id: `segment-${i}`,
          text: segmentText,
          imagePrompt: `Visual representation of: ${segmentText.substring(0, 100)}...`,
          imageUrl: null,
          order: i,
          model: null,
          cost: 0,
        })
      }
    }

    console.log(`Completed generating ${segments.length} segments`)

    // Save segments to database
    const { error: updateError } = await supabase
      .from('notes')
      .update({
        script_segments: segments,
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Failed to save segments:', updateError)
      return NextResponse.json(
        { error: 'Failed to save segments' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      segments,
      count: segments.length 
    })
  } catch (error) {
    console.error('Segment generation error:', error)
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to generate segments') },
      { status: 500 }
    )
  }
}
