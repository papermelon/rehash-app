import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { noteId } = await request.json()

    // Validate input
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

    // Check if script exists
    if (!note.script_text) {
      return NextResponse.json(
        { error: 'Please generate a script first before creating audio' },
        { status: 400 }
      )
    }

    // Clean the script text by removing stage directions in square brackets
    // This removes things like [PAUSE], [INTRO MUSIC FADES IN], etc.
    const cleanedScript = note.script_text
      .replace(/\[.*?\]/g, '') // Remove anything in square brackets
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newline
      .trim()

    if (!cleanedScript) {
      return NextResponse.json(
        { error: 'Script contains no readable content after cleaning' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ELEVENLABS_API_KEY

    if (!apiKey) {
      console.error('ElevenLabs API key not configured')
      return NextResponse.json(
        { error: 'Audio generation service not configured' },
        { status: 500 }
      )
    }

    // Call ElevenLabs API to generate audio
    // Using Rachel voice (21m00Tcm4TlvDq8ikWAM) - a calm, professional voice
    const voiceId = '21m00Tcm4TlvDq8ikWAM'
    
    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: cleanedScript,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    )

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text()
      console.error('ElevenLabs API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to generate audio' },
        { status: 500 }
      )
    }

    // Get the audio data as buffer
    const audioBuffer = await elevenLabsResponse.arrayBuffer()
    const audioBlob = Buffer.from(audioBuffer)

    // Upload to Supabase Storage
    const fileName = `${user.id}/${noteId}_${Date.now()}.mp3`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('note-uploads')
      .upload(fileName, audioBlob, {
        contentType: 'audio/mpeg',
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to save audio file' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('note-uploads')
      .getPublicUrl(fileName)

    // Update note with audio URL
    const { error: updateError } = await supabase
      .from('notes')
      .update({
        audio_url: publicUrl,
        audio_generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', noteId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Failed to update note with audio:', updateError)
      return NextResponse.json(
        { error: 'Failed to save audio metadata' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      audioUrl: publicUrl,
      message: 'Audio generated successfully',
    })
  } catch (error: any) {
    console.error('Audio generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate audio' },
      { status: 500 }
    )
  }
}

