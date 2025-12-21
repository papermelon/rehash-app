import { NextRequest, NextResponse } from 'next/server'
import { callOpenAI, truncateText, extractJSONFromText } from '@/lib/openai-client'
import type { RedditThread } from '@/lib/types'
import { getErrorMessage } from '@/lib/error-utils'

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

    const systemPrompt = `You reframe notes as a Reddit thread. Create an engaging discussion that makes the content memorable and deepens understanding through substantive explanations.

CRITICAL: Comments must be EXPLANATORY and EDUCATIONAL, not just affirmations. Each comment should:
- Explain a specific concept or mechanism in detail
- Break down complex ideas into understandable parts
- Provide concrete examples or analogies
- Connect ideas to broader context or real-world applications
- Add nuance, caveats, or additional perspective
- Dive deeper into "why" or "how" something works

Comment variety (include mix of these types):
1. Deep dive explanations: "Here's how this actually works..."
2. Historical/contextual: "The reason this developed was..."
3. Technical breakdowns: "Let me break down the mechanism..."
4. Practical examples: "I've seen this in action when..."
5. Counter-perspectives: "While that's true, it's worth noting..."
6. Building on ideas: "This relates to [concept] because..."

AVOID surface-level comments like:
❌ "Great post!"
❌ "This is so true!"
❌ "I agree completely!"
❌ "Thanks for sharing!"

Your output should be:
- A thought-provoking title that captures the core concept
- An engaging OP that sets up the topic with key points
- 6-10 substantive comments that explain and explore the content
- Include 1-3 nested replies that add depth or respectfully challenge/clarify
- Use Reddit-style usernames (u_username format)
- Include realistic upvote counts (higher for more insightful comments)
- Make it feel like a community of knowledgeable people discussing the topic

Output ONLY JSON in this exact format:
{
  "title": "Thread title here",
  "op": "OP content here",
  "comments": [
    {
      "user": "u_username",
      "body": "Comment text here",
      "up": 123,
      "replies": [
        {
          "user": "u_another_user",
          "body": "Reply text here",
          "up": 45
        }
      ]
    }
  ]
}`

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      {
        role: 'user' as const,
        content: `Create a Reddit thread discussion from these notes:\n\n${truncatedText}`
      }
    ]

    // Try JSON mode first
    let result: RedditThread
    try {
      result = await callOpenAI<RedditThread>(messages, {
        response_format: { type: 'json_object' }
      })
    } catch {
      // Fallback to text mode and extract JSON
      const textResponse = await callOpenAI<string>(messages)
      const extracted = extractJSONFromText<RedditThread>(textResponse)
      
      if (!extracted) {
        throw new Error('Failed to parse Reddit thread response')
      }
      result = extracted
    }

    // Validate the response structure
    if (!result.title || !result.op || !Array.isArray(result.comments)) {
      throw new Error('Invalid Reddit thread structure')
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Reddit thread generation error:', error)
    return NextResponse.json(
      { error: getErrorMessage(error, 'Failed to generate Reddit thread') },
      { status: 500 }
    )
  }
}
