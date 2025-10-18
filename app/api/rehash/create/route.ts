import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await getServerSupabase();

    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
    }

    const body = await req.json()
    const { title, files, consolidatedText, notesMd, redditJson, cardsJson } = body

    // Insert note with only existing columns
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: title || 'Untitled Rehash',
        type: 'image',
        summary: notesMd?.substring(0, 500) + (notesMd?.length > 500 ? '...' : '') || 'Generated rehash',
        processed_at: new Date().toISOString(),
        // Add new rehash columns if they exist
        ...(notesMd && { notes_md: notesMd }),
        ...(redditJson && { reddit_json: redditJson }),
        ...(cardsJson && { cards_json: cardsJson }),
        ...(consolidatedText && { input_text: consolidatedText }),
      })
      .select()
      .single()

    if (noteError) {
      console.error('Note insert error:', noteError)
      return NextResponse.json({ error: noteError.message }, { status: 400 })
    }

    // Insert photos if we have files
    if (files && files.length > 0) {
      const photosToInsert = files.map((file: any, idx: number) => ({
        rehash_id: note.id,
        user_id: user.id,
        image_url: file.url,
        note: file.note || '',
        idx: idx,
        filename: file.filename,
        file_size: file.file_size
      }))

      const { error: photosError } = await supabase
        .from('photos')
        .insert(photosToInsert)

      if (photosError) {
        console.error('Photos insert error:', photosError)
        // Don't fail the whole request if photos fail
      }
    }

    return NextResponse.json({ noteId: note.id }, { status: 200 })

  } catch (error: any) {
    console.error('Rehash creation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create rehash' }, { status: 500 })
  }
}
