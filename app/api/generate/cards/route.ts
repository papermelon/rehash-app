import { NextRequest, NextResponse } from 'next/server'
import { callOpenAI, truncateText, extractJSONFromText } from '@/lib/openai-client'
import type { GameCard } from '@/lib/types'

interface CardsResponse {
  cards: GameCard[]
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

    const systemPrompt = `You generate active-recall cards for learning. Create engaging quiz questions that test understanding.

Generate exactly:
- 12 Multiple Choice Questions (MCQ)
- 6 Cloze (fill-in-the-blank) items

For MCQ cards:
- Include 4 choices total (1 correct + 3 plausible distractors)
- Make distractors realistic but clearly wrong to experts
- Focus on key concepts and important details

For Cloze cards:
- Create sentences with one key word/phrase replaced by ___
- Provide 3 realistic distractors for the blank
- Test important terminology and concepts

Output ONLY JSON in this exact format:
{
  "cards": [
    {
      "type": "mcq",
      "prompt": "Question text here?",
      "answer": "Correct answer",
      "choices": ["Correct answer", "Wrong choice 1", "Wrong choice 2", "Wrong choice 3"]
    },
    {
      "type": "cloze",
      "text": "The ___ effect occurs when...",
      "answer": "key term",
      "distractors": ["similar term", "wrong term", "other term"]
    }
  ]
}`

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      {
        role: 'user' as const,
        content: `From these notes, produce 12 MCQs and 6 Cloze items for active recall:\n\n${truncatedText}`
      }
    ]

    // Try JSON mode first
    let result: CardsResponse
    try {
      result = await callOpenAI<CardsResponse>(messages, {
        response_format: { type: 'json_object' }
      })
    } catch (jsonError) {
      // Fallback to text mode and extract JSON
      const textResponse = await callOpenAI<string>(messages)
      const extracted = extractJSONFromText<CardsResponse>(textResponse)
      
      if (!extracted) {
        throw new Error('Failed to parse cards response')
      }
      result = extracted
    }

    // Validate the response structure
    if (!result || !Array.isArray(result.cards)) {
      console.warn('Invalid cards response, creating fallback cards')
      // Create fallback cards if AI response is invalid
      result = {
        cards: [
          {
            type: 'mcq',
            prompt: 'What is the main topic of these notes?',
            answer: 'Study material',
            choices: ['Study material', 'Random content', 'Unrelated topic', 'Empty notes']
          },
          {
            type: 'cloze',
            prompt: 'Complete the sentence: The main purpose of these notes is to help with ___',
            answer: 'studying',
            text: 'The main purpose of these notes is to help with ___',
            distractors: ['sleeping', 'eating', 'playing']
          }
        ]
      }
    }

    // Validate and clean each card
    const validCards = []
    for (const card of result.cards) {
      // For Cloze cards, use 'text' field as prompt if prompt is missing
      if (card.type === 'cloze' && !card.prompt && card.text) {
        card.prompt = card.text
      }
      
      if (!card.type || (!card.prompt && !card.text) || !card.answer) {
        console.warn('Skipping invalid card:', card)
        continue
      }
      
      // Fix MCQ cards with wrong number of choices
      if (card.type === 'mcq') {
        if (!card.choices || card.choices.length !== 4) {
          // Pad or trim choices to exactly 4
          const choices = card.choices || []
          while (choices.length < 4) {
            choices.push(`Option ${choices.length + 1}`)
          }
          card.choices = choices.slice(0, 4)
        }
      }
      
      // Fix Cloze cards with wrong number of distractors
      if (card.type === 'cloze') {
        if (!card.distractors || card.distractors.length !== 3) {
          // Pad or trim distractors to exactly 3
          const distractors = card.distractors || []
          while (distractors.length < 3) {
            distractors.push(`Distractor ${distractors.length + 1}`)
          }
          card.distractors = distractors.slice(0, 3)
        }
      }
      
      validCards.push(card)
    }

    // If no valid cards, create at least one fallback
    if (validCards.length === 0) {
      validCards.push({
        type: 'mcq',
        prompt: 'What is the main topic of these notes?',
        answer: 'Study material',
        choices: ['Study material', 'Random content', 'Unrelated topic', 'Empty notes']
      })
    }

    return NextResponse.json({ cards: validCards })
  } catch (error: any) {
    console.error('Cards generation error:', error)
    
    // Return fallback cards if API fails completely
    const fallbackCards = [
      {
        type: 'mcq',
        prompt: 'What is the main topic of these notes?',
        answer: 'Study material',
        choices: ['Study material', 'Random content', 'Unrelated topic', 'Empty notes']
      },
      {
        type: 'cloze',
        prompt: 'Complete the sentence: The main purpose of these notes is to help with ___',
        answer: 'studying',
        text: 'The main purpose of these notes is to help with ___',
        distractors: ['sleeping', 'eating', 'playing']
      }
    ]
    
    return NextResponse.json({ cards: fallbackCards })
  }
}
