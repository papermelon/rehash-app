import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { generateScript } from '@/lib/openai-client'
import { supplementContent } from '@/lib/web-search'
import { getStyleTemplate } from '@/lib/script-styles'
import type { ScriptStyle, ScriptGenerationResponse } from '@/lib/types'
import { getErrorMessage } from '@/lib/error-utils'

// Increase timeout for this route to handle long script generation + segments
export const maxDuration = 300 // 5 minutes
export const dynamic = 'force-dynamic'

const WORDS_PER_MINUTE = 150

export async function POST(request: NextRequest) {
  try {
    const { noteId, style, durationMinutes } = await request.json()

    // Validate inputs
    if (!noteId || typeof noteId !== 'string') {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      )
    }

    if (!style || !['casually-explained', 'cgp-grey', 'kurzgesagt', 'school-of-life'].includes(style)) {
      return NextResponse.json(
        { error: 'Valid style is required (casually-explained, cgp-grey, kurzgesagt, school-of-life)' },
        { status: 400 }
      )
    }

    if (!durationMinutes || durationMinutes < 1 || durationMinutes > 10) {
      return NextResponse.json(
        { error: 'Duration must be between 1 and 10 minutes' },
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

    // Get the content to work with (prefer notes_md, fallback to original_text)
    const sourceContent = note.notes_md || note.original_text || note.input_text

    if (!sourceContent) {
      return NextResponse.json(
        { error: 'Note has no content to generate script from' },
        { status: 400 }
      )
    }

    // Calculate target word count
    const targetWordCount = durationMinutes * WORDS_PER_MINUTE

    // Check if we need to supplement content
    const { 
      supplementedContent, 
      wasSupplemented, 
      warning 
    } = await supplementContent(sourceContent, targetWordCount)

    // Get the style template
    const styleTemplate = getStyleTemplate(style as ScriptStyle)

    // Generate the script
    const script = await generateScript(
      sourceContent,
      styleTemplate.systemPrompt,
      targetWordCount,
      wasSupplemented ? supplementedContent.split('--- Additional Context ---')[1] : undefined
    )

    // Calculate actual word count
    const wordCount = script.split(/\s+/).length

    // Update the note in database
    const { error: updateError } = await supabase
      .from('notes')
      .update({
        script_text: script,
        script_style: style,
        script_duration_minutes: durationMinutes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Failed to update note with script:', updateError)
      return NextResponse.json(
        { error: 'Failed to save script' },
        { status: 500 }
      )
    }

    // Generate segments with image prompts
    const rawSegments = script
      .split(/\n\n+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0 && !s.match(/^\[.*\]$/))

    const segments = []
    const visualStyleGuide = styleTemplate.visualStyle

    for (let i = 0; i < rawSegments.length; i++) {
      const segmentText = rawSegments[i]
      
      try {
        const { openai } = await import('@/lib/openai-client')
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
- Be suitable for ${styleTemplate.name} format

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
      } catch (err) {
        console.error('Failed to generate prompt for segment', i, err)
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

    // Update with segments
    console.log(`Generated ${segments.length} segments for note ${noteId}`)
    const { error: segmentsError } = await supabase
      .from('notes')
      .update({
        script_segments: segments,
      })
      .eq('id', noteId)
      .eq('user_id', user.id)

    if (segmentsError) {
      console.error('Failed to save segments:', segmentsError)
      // Don't fail the whole request, segments can be regenerated
    } else {
      console.log(`Successfully saved ${segments.length} segments`)
    }

    const response: ScriptGenerationResponse = {
      script,
      style: style as ScriptStyle,
      durationMinutes,
      wordCount,
      wasSupplemented,
      supplementWarning: warning,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Script generation error:', error)
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to generate script') },
      { status: 500 }
    )
  }
}
