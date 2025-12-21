import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { ScriptSegment } from '@/lib/types'
import { getErrorMessage } from '@/lib/error-utils'

const FAL_AI_API_KEY = process.env.FAL_AI_API_KEY

// Cost per image in USD
const COSTS = {
  'flux-pro/kontext': 0.04,
  'recraft/v3': 0.02,
}

export async function POST(request: NextRequest) {
  try {
    const { noteId, segmentId, prompt, isFirstSegment } = await request.json()

    if (!noteId || !segmentId || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!FAL_AI_API_KEY) {
      console.error('FAL_AI_API_KEY not configured')
      return NextResponse.json(
        { error: 'Image generation service not configured' },
        { status: 500 }
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

    // Determine which model to use
    // Use flux-pro/kontext for first segment or key frames, recraft/v3 for others
    const model = isFirstSegment ? 'flux-pro/kontext' : 'fal-ai/recraft-v3'
    const cost = isFirstSegment ? COSTS['flux-pro/kontext'] : COSTS['recraft/v3']

    let imageUrl: string

    try {
      if (isFirstSegment) {
        // Use flux-pro/kontext for style anchor frames
        const response = await fetch('https://fal.run/fal-ai/flux-pro', {
          method: 'POST',
          headers: {
            'Authorization': `Key ${FAL_AI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            image_size: {
              width: 1024,
              height: 576
            },
            num_inference_steps: 28,
            guidance_scale: 3.5,
            num_images: 1,
            enable_safety_checker: true,
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Fal.ai API error:', errorText)
          throw new Error('Failed to generate image with fal.ai')
        }

        const result = await response.json()
        imageUrl = result.images?.[0]?.url

        if (!imageUrl) {
          throw new Error('No image URL in response')
        }
      } else {
        // Use recraft/v3 for additional stills
        const response = await fetch('https://fal.run/fal-ai/recraft-v3', {
          method: 'POST',
          headers: {
            'Authorization': `Key ${FAL_AI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            image_size: {
              width: 1024,
              height: 576
            },
            style: 'digital_illustration',
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('Fal.ai API error:', errorText)
          throw new Error('Failed to generate image with fal.ai')
        }

        const result = await response.json()
        imageUrl = result.images?.[0]?.url

        if (!imageUrl) {
          throw new Error('No image URL in response')
        }
      }
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to generate image with fal.ai')
      console.error('Image generation failed:', message)
      return NextResponse.json(
        { error: `Failed to generate image: ${message}` },
        { status: 500 }
      )
    }

    // Download the image and upload to Supabase Storage
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    const imageBlob = Buffer.from(imageBuffer)

    const fileName = `${user.id}/${noteId}_${segmentId}_${Date.now()}.png`
    
    const { error: uploadError } = await supabase.storage
      .from('note-uploads')
      .upload(fileName, imageBlob, {
        contentType: 'image/png',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to save image file' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('note-uploads')
      .getPublicUrl(fileName)

    // Update the segment with the image URL
    const segments = (note.script_segments || []) as ScriptSegment[]
    const updatedSegments = segments.map(seg => {
      if (seg.id === segmentId) {
        return {
          ...seg,
          imageUrl: publicUrl,
          model,
          cost,
          imagePrompt: prompt, // Update with edited prompt
        }
      }
      return seg
    })

    // Calculate total cost
    const totalCost = updatedSegments.reduce((sum, seg) => sum + (seg.cost || 0), 0)

    // Update note with new segments and total cost
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
      console.error('Failed to update note with image:', updateError)
      return NextResponse.json(
        { error: 'Failed to save image metadata' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      imageUrl: publicUrl,
      cost,
      model,
    })
  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to generate image') },
      { status: 500 }
    )
  }
}
