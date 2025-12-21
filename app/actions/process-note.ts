"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies, headers } from "next/headers"
// Using Interfaze AI for image and document analysis with OpenAI fallback
import { extractTextFromImageWithInterfaze } from "@/lib/interfaze-client"
import { extractTextFromImage as extractTextFromImageOpenAI } from "@/lib/openai-client"
import { getErrorMessage } from "@/lib/error-utils"

interface UploadedFileData {
  file: File
  note: string
  isHEIC: boolean
}

interface ProcessNoteInput {
  images: UploadedFileData[]
  documents?: UploadedFileData[]
  textNotes?: string[]
  title?: string
}

export async function processNote(input: ProcessNoteInput) {
  try {
    const headerList = await headers()
    const originHeader = headerList.get('origin') || headerList.get('referer')
    const envBase = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
    const baseUrl = (originHeader?.replace(/\/$/, '') || envBase || '')
    const buildUrl = (path: string) => (baseUrl ? `${baseUrl}${path}` : path)

    // Create Supabase client with proper cookie handling
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
            } catch {
              // Handle cookie setting errors in server actions
            }
          },
        },
      },
    )

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Auth error:", authError)
      return { error: "Unauthorized" }
    }

    // Upload all files to Supabase Storage
    const uploadedFiles: Array<{ url: string; filename: string; note: string; idx: number }> = []
    const imageOcrTexts: string[] = []
    
    const images = input.images || []
    for (let i = 0; i < images.length; i++) {
      const fileData = images[i]
      const fileExtension = fileData.file.name.split('.').pop() || 'jpg'
      const fileName = `${user.id}/${Date.now()}-${i}.${fileExtension}`

      // Convert file to buffer
      const buffer = Buffer.from(await fileData.file.arrayBuffer())

      const { error: uploadError } = await supabase.storage
        .from("note-uploads")
        .upload(fileName, buffer, {
          contentType: fileData.file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        return { error: `Failed to upload file: ${uploadError.message}` }
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("note-uploads")
        .getPublicUrl(fileName)

      // Try Interfaze AI first, fallback to OpenAI if not available
      let ocrText = await extractTextFromImageWithInterfaze(publicUrl)
      
      // If Interfaze AI returns empty (no API key or failed), try OpenAI Vision
      if (!ocrText?.trim()) {
        console.log("Interfaze AI failed or not configured, trying OpenAI Vision...")
        ocrText = await extractTextFromImageOpenAI(publicUrl)
      }
      
      console.log("OCR extract", {
        file: fileData.file.name,
        hasText: Boolean(ocrText?.trim()),
        preview: ocrText?.slice(0, 140) || "",
      })
      imageOcrTexts.push(ocrText)

      uploadedFiles.push({
        url: publicUrl,
        filename: fileData.file.name,
        note: fileData.note,
        idx: i
      })
    }

    // Handle documents (docx/txt)
    const documentSections: string[] = []
    const documents = input.documents || []
    if (documents.length > 0) {
      let mammothModule: typeof import("mammoth") | null = null
      for (let i = 0; i < documents.length; i++) {
        const docData = documents[i]
        const buffer = Buffer.from(await docData.file.arrayBuffer())
        let extracted = ''
        if (docData.file.type === 'text/plain') {
          extracted = buffer.toString('utf-8')
        } else if (docData.file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          try {
            if (!mammothModule) {
              mammothModule = await import('mammoth')
            }
            const { value } = await mammothModule.extractRawText({ buffer })
            extracted = value || ''
          } catch (error) {
            console.error('Docx extraction error:', error)
          }
        } else {
          console.warn(`Unsupported document type: ${docData.file.type}`)
        }
        if (extracted.trim()) {
          documentSections.push(`Document ${i + 1} (${docData.file.name}):\n${extracted.trim()}`)
        }
      }
    }

    const textSections = (input.textNotes || [])
      .map((note, idx) => {
        const trimmed = note.trim()
        return trimmed ? `Text Note ${idx + 1}:\n${trimmed}` : ''
      })
      .filter(Boolean)

    // Consolidate all content into input_text
    const imageCount = images.length
    const documentCount = documents.length
    const textCount = textSections.length

    const computedTitle = (() => {
      if (input.title?.trim()) return input.title.trim()
      if (documentCount && imageCount) {
        return `${documentCount} document${documentCount > 1 ? 's' : ''} + ${imageCount} image${imageCount > 1 ? 's' : ''}`
      }
      if (documentCount) {
        return `${documentCount} document${documentCount > 1 ? 's' : ''}`
      }
      if (imageCount) {
        return `${imageCount} image${imageCount > 1 ? 's' : ''}`
      }
      if (textCount) {
        return textCount > 1 ? `${textCount} text notes` : 'Text note rehash'
      }
      return 'Untitled Rehash'
    })()

    const consolidatedText = [
      ...documentSections,
      ...textSections,
      ...uploadedFiles.map((file, idx) => {
        const noteText = file.note?.trim() ? file.note : "[No annotation provided]"
        const ocrText = imageOcrTexts[idx]?.trim()
        const sections = [
          `Image ${idx + 1} (${file.filename}):`,
          `User Annotation: ${noteText}`,
        ]
        if (ocrText) {
          sections.push(`Extracted Text:\n${ocrText}`)
        }
        return sections.join("\n")
      }),
    ].join('\n\n')

    // Call all three generation APIs
    const [notesResponse, redditResponse, cardsResponse] = await Promise.allSettled([
      fetch(buildUrl('/api/generate/notes'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: consolidatedText })
      }),
      fetch(buildUrl('/api/generate/reddit'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: consolidatedText })
      }),
      fetch(buildUrl('/api/generate/cards'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: consolidatedText })
      })
    ])

    // Process API responses
    let notesMd = ""
    let redditJson = null
    let cardsJson = null

    if (notesResponse.status === 'fulfilled' && notesResponse.value.ok) {
      const notesData = await notesResponse.value.json()
      notesMd = notesData.notes || ""
    }

    if (redditResponse.status === 'fulfilled' && redditResponse.value.ok) {
      redditJson = await redditResponse.value.json()
    }

    if (cardsResponse.status === 'fulfilled' && cardsResponse.value.ok) {
      cardsJson = await cardsResponse.value.json()
    }

    // Generate title
    const title = computedTitle

    // Call the dedicated API route to save everything
    const cookieHeader = cookieStore
      .getAll()
      .map(({ name, value }) => `${name}=${value}`)
      .join("; ")

    const response = await fetch(buildUrl('/api/rehash/create'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify({
        title,
        files: uploadedFiles,
        consolidatedText,
        notesMd,
        redditJson,
        cardsJson
      })
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Rehash creation error:', result.error)
      return { error: result.error || 'Failed to save note' }
    }

    return { noteId: result.noteId }
  } catch (error) {
    console.error("Process note error:", error)
    return { error: getErrorMessage(error, "Failed to process note") }
  }
}
