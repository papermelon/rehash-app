import OpenAI from 'openai'

// Initialize OpenAI client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Truncate text to specified character limit
export function truncateText(text: string, maxChars: number = 10000): string {
  if (text.length <= maxChars) return text
  
  // Try to truncate at word boundary
  const truncated = text.substring(0, maxChars)
  const lastSpaceIndex = truncated.lastIndexOf(' ')
  
  if (lastSpaceIndex > maxChars * 0.9) {
    return truncated.substring(0, lastSpaceIndex) + '...'
  }
  
  return truncated + '...'
}

// Generic OpenAI API call wrapper with error handling
type ChatCompletionOptions = Parameters<typeof openai.chat.completions.create>[0]

export async function callOpenAI<T>(
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  options?: {
    model?: string
    temperature?: number
    max_tokens?: number
    response_format?: ChatCompletionOptions["response_format"]
  }
): Promise<T> {
  try {
    const completion = await openai.chat.completions.create({
      model: options?.model || process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.max_tokens || 2000,
      response_format: options?.response_format,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content returned from OpenAI')
    }

    // Try to parse as JSON if response_format is json_object
    if (options?.response_format?.type === 'json_object') {
      try {
        return JSON.parse(content) as T
      } catch (parseError) {
        console.error('Failed to parse JSON response:', content)
        throw new Error('Invalid JSON response from OpenAI')
      }
    }

    return content as T
  } catch (error: any) {
    console.error('OpenAI API error:', error)
    
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.')
    }
    
    if (error.status === 401) {
      throw new Error('Invalid API key. Please check your OpenAI configuration.')
    }
    
    if (error.status === 500) {
      throw new Error('OpenAI service temporarily unavailable. Please try again.')
    }
    
    throw new Error(error.message || 'Failed to generate content')
  }
}

// Extract text content from an image using OpenAI vision models
export async function extractTextFromImage(imageUrl: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model:
        process.env.OPENAI_VISION_MODEL ||
        process.env.OPENAI_MODEL ||
        'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an OCR engine. Extract all readable text, equations, headings, and bullet lists from images. Return plain text with line breaks preserved.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract every bit of textual information from this image. Output plain text only.',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 800,
      temperature: 0,
    })

    const messageContent = completion.choices[0]?.message?.content
    if (!messageContent) {
      return ''
    }

    if (typeof messageContent === 'string') {
      return messageContent.trim()
    }

    if (Array.isArray(messageContent)) {
      const textOutput = (messageContent as Array<{ text?: string }>)
        .map((part) => {
          if ('text' in part && part.text) {
            return part.text
          }
          return ''
        })
        .join(' ')
        .trim()

      return textOutput
    }

    return ''
  } catch (error) {
    console.error('Image OCR extraction failed:', error)
    return ''
  }
}

export async function extractTextFromImageBuffer(buffer: Buffer, mimeType: string = 'image/png'): Promise<string> {
  const dataUrl = `data:${mimeType};base64,${buffer.toString('base64')}`
  return extractTextFromImage(dataUrl)
}

// Helper to extract JSON from text response (fallback for non-JSON mode)
export function extractJSONFromText<T>(text: string): T | null {
  try {
    // Try to find JSON block in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T
    }
    return null
  } catch {
    return null
  }
}

// Generate script with specific style and target word count
export async function generateScript(
  content: string,
  stylePrompt: string,
  targetWordCount: number,
  supplementalContent?: string
): Promise<string> {
  const fullContent = supplementalContent 
    ? `${content}\n\n${supplementalContent}`
    : content

  const systemPrompt = `${stylePrompt}

IMPORTANT REQUIREMENTS:
- Target word count: ${targetWordCount} words (±10%)
- Maintain technical accuracy while being engaging
- Include natural transitions and pacing cues
- Write for audio narration (conversational, clear pronunciation)
- Add [PAUSE] markers where natural breaks should occur
- Use the specified style consistently throughout

Your script should be ready to be read aloud and converted to audio.`

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `Create an engaging educational script from this content. Make it entertaining while keeping it accurate:\n\n${truncateText(fullContent, 15000)}`
    }
  ]

  try {
    const script = await callOpenAI<string>(messages, {
      model: 'gpt-4o-mini', // Use GPT-4o-mini for creative writing
      temperature: 0.8, // Higher temperature for more creative output
      max_tokens: Math.min(4000, Math.ceil(targetWordCount * 1.5)), // Allow some buffer
    })

    return script
  } catch (error: any) {
    console.error('Script generation error:', error)
    throw new Error(error.message || 'Failed to generate script')
  }
}
