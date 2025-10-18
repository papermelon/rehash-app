// Web search integration for content supplementation
// Using Tavily API for high-quality search results

interface TavilySearchResult {
  title: string
  url: string
  content: string
  score: number
}

interface TavilyResponse {
  results: TavilySearchResult[]
}

export async function searchWeb(query: string, maxResults: number = 3): Promise<string[]> {
  const apiKey = process.env.TAVILY_API_KEY
  
  if (!apiKey) {
    console.warn('TAVILY_API_KEY not set, skipping web search')
    return []
  }

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: maxResults,
        search_depth: 'basic',
        include_answer: false,
        include_raw_content: false,
      }),
    })

    if (!response.ok) {
      console.error('Tavily API error:', response.status)
      return []
    }

    const data: TavilyResponse = await response.json()
    
    // Extract and return content from search results
    return data.results.map(result => result.content).filter(Boolean)
  } catch (error) {
    console.error('Web search error:', error)
    return []
  }
}

export async function supplementContent(
  originalContent: string,
  targetWordCount: number
): Promise<{ supplementedContent: string; wasSupplemented: boolean; warning?: string }> {
  // Estimate word count of original content
  const originalWordCount = originalContent.split(/\s+/).length
  const requiredWordCount = Math.floor(targetWordCount * 0.5) // Need at least 50%

  if (originalWordCount >= requiredWordCount) {
    return {
      supplementedContent: originalContent,
      wasSupplemented: false,
    }
  }

  // Extract key topics from the content for search queries
  const topics = await extractKeyTopics(originalContent)
  
  if (topics.length === 0) {
    return {
      supplementedContent: originalContent,
      wasSupplemented: false,
      warning: 'Could not identify topics for supplementation',
    }
  }

  // Search for additional content
  const searchPromises = topics.slice(0, 3).map(topic => searchWeb(topic, 2))
  const searchResults = await Promise.all(searchPromises)
  const additionalContent = searchResults.flat().join('\n\n')

  if (!additionalContent) {
    return {
      supplementedContent: originalContent,
      wasSupplemented: false,
      warning: 'Web search did not return additional content',
    }
  }

  return {
    supplementedContent: `${originalContent}\n\n--- Additional Context ---\n\n${additionalContent}`,
    wasSupplemented: true,
    warning: `Original content was supplemented with web search results about: ${topics.join(', ')}`,
  }
}

async function extractKeyTopics(content: string): Promise<string[]> {
  // Simple topic extraction - look for capitalized phrases and key terms
  // In a production app, you might use NLP or AI for better topic extraction
  
  const lines = content.split('\n')
  const topics: string[] = []

  // Extract from headers (markdown)
  const headerRegex = /^#+\s+(.+)$/
  lines.forEach(line => {
    const match = line.match(headerRegex)
    if (match) {
      topics.push(match[1].trim())
    }
  })

  // Extract capitalized phrases (potential proper nouns/concepts)
  const capitalizedRegex = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g
  const matches = content.match(capitalizedRegex)
  if (matches) {
    topics.push(...matches.slice(0, 5))
  }

  // Remove duplicates and return
  return [...new Set(topics)].slice(0, 5)
}

