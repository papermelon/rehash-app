import { NextRequest, NextResponse } from 'next/server'
import { callOpenAI, truncateText, extractJSONFromText } from '@/lib/openai-client'
import { getErrorMessage } from '@/lib/error-utils'

interface NotesResponse {
  notes: string
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text content is required' },
        { status: 400 }
      )
    }

    // Truncate text to avoid token limits
    const truncatedText = truncateText(text, 10000)

    const systemPrompt = `You turn messy text into clean, deduped study notes in concise Markdown. 

Your output should be:
- Well-structured with clear headings and bullet points
- Concise but comprehensive
- Remove duplicate information
- Focus on key concepts and actionable insights
- Use proper Markdown formatting (headers, lists, emphasis)

Output ONLY JSON in this exact format:
{
  "notes": "your markdown content here"
}`

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      {
        role: 'user' as const,
        content: `Clean & bullet the following text into structured study notes:\n\n${truncatedText}`
      }
    ]

    // Try JSON mode first
    let result: NotesResponse
    try {
      result = await callOpenAI<NotesResponse>(messages, {
        response_format: { type: 'json_object' }
      })
    } catch {
      // Fallback to text mode and extract JSON
      const textResponse = await callOpenAI<string>(messages)
      const extracted = extractJSONFromText<NotesResponse>(textResponse)
      
      if (!extracted) {
        // Last resort: wrap the response in JSON structure
        result = { notes: textResponse }
      } else {
        result = extracted
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Notes generation error:', error)
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to generate notes') },
      { status: 500 }
    )
  }
}
