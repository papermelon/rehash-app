// Interfaze AI client for document and image analysis

export interface InterfazeAnalysisResult {
  text: string
  confidence?: number
  metadata?: Record<string, unknown>
}

// Extract text content from an image using Interfaze AI
export async function extractTextFromImageWithInterfaze(imageUrl: string): Promise<string> {
  try {
    const apiKey = process.env.INTERFAZE_API_KEY
    if (!apiKey) {
      console.warn('INTERFAZE_API_KEY not configured, falling back to empty string')
      return ''
    }

    // Interfaze AI API call for OCR/document analysis
    const response = await fetch('https://api.interfaze.ai/v1/vision/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        task: 'ocr',
        options: {
          extract_text: true,
          preserve_formatting: true,
          extract_tables: true,
          extract_equations: true,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Interfaze AI API error:', response.status, errorText)
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.')
      }
      
      if (response.status === 401) {
        throw new Error('Invalid Interfaze API key. Please check your configuration.')
      }
      
      if (response.status === 500) {
        throw new Error('Interfaze AI service temporarily unavailable. Please try again.')
      }
      
      throw new Error(`Interfaze AI API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Extract text from response
    // Adjust this based on actual Interfaze AI response format
    const extractedText = data.text || data.content || data.extracted_text || ''
    
    return extractedText.trim()
  } catch (error) {
    console.error('Interfaze AI image extraction failed:', error)
    // Return empty string on error to allow processing to continue
    return ''
  }
}

// Extract text from image buffer (for uploaded files)
export async function extractTextFromImageBufferWithInterfaze(
  buffer: Buffer,
  mimeType: string = 'image/png'
): Promise<string> {
  try {
    const apiKey = process.env.INTERFAZE_API_KEY
    if (!apiKey) {
      console.warn('INTERFAZE_API_KEY not configured')
      return ''
    }

    // Convert buffer to base64
    const base64Image = buffer.toString('base64')

    // Interfaze AI API call with base64 image
    const response = await fetch('https://api.interfaze.ai/v1/vision/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: `data:${mimeType};base64,${base64Image}`,
        task: 'ocr',
        options: {
          extract_text: true,
          preserve_formatting: true,
          extract_tables: true,
          extract_equations: true,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Interfaze AI API error:', response.status, errorText)
      throw new Error(`Interfaze AI API error: ${response.status}`)
    }

    const data = await response.json()
    const extractedText = data.text || data.content || data.extracted_text || ''
    
    return extractedText.trim()
  } catch (error) {
    console.error('Interfaze AI buffer extraction failed:', error)
    return ''
  }
}

// Analyze document with images (for PDF, DOCX with embedded images)
export async function analyzeDocumentWithInterfaze(
  fileUrl: string,
  fileType: 'pdf' | 'docx' | 'image'
): Promise<string> {
  try {
    const apiKey = process.env.INTERFAZE_API_KEY
    if (!apiKey) {
      console.warn('INTERFAZE_API_KEY not configured')
      return ''
    }

    const response = await fetch('https://api.interfaze.ai/v1/document/analyze', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document_url: fileUrl,
        file_type: fileType,
        options: {
          extract_text: true,
          extract_images: true,
          extract_tables: true,
          ocr_embedded_images: true,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Interfaze AI document analysis error:', response.status, errorText)
      throw new Error(`Interfaze AI API error: ${response.status}`)
    }

    const data = await response.json()
    const extractedText = data.text || data.content || data.extracted_text || ''
    
    return extractedText.trim()
  } catch (error) {
    console.error('Interfaze AI document analysis failed:', error)
    return ''
  }
}

