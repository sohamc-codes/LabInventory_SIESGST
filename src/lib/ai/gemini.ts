import { GoogleGenerativeAI, GenerativeModel, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

// Rate limiting configuration
const RATE_LIMIT = 15 // requests per minute (free tier limit)
const RATE_WINDOW = 60000 // 1 minute in milliseconds

// Request tracking
let requestCount = 0
let windowStart = Date.now()

// Response cache
const responseCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Get configured Gemini AI client instance
 */
export function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables')
  }
  
  return new GoogleGenerativeAI(apiKey)
}

/**
 * Get Gemini model with safety settings
 */
export function getGeminiModel(modelName?: string): GenerativeModel {
  const client = getGeminiClient()
  const model = modelName || process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  
  return client.getGenerativeModel({
    model,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
  })
}

/**
 * Check and enforce rate limiting
 */
function checkRateLimit(): void {
  const now = Date.now()
  
  // Reset counter if window has passed
  if (now - windowStart >= RATE_WINDOW) {
    requestCount = 0
    windowStart = now
  }
  
  // Check if rate limit exceeded
  if (requestCount >= RATE_LIMIT) {
    const waitTime = RATE_WINDOW - (now - windowStart)
    throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`)
  }
  
  requestCount++
}

/**
 * Get cached response if available
 */
function getCachedResponse(cacheKey: string): any | null {
  const cached = responseCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  
  // Remove expired cache entry
  if (cached) {
    responseCache.delete(cacheKey)
  }
  
  return null
}

/**
 * Cache a response
 */
function cacheResponse(cacheKey: string, data: any): void {
  responseCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  })
  
  // Clean up old cache entries (keep last 100)
  if (responseCache.size > 100) {
    const firstKey = responseCache.keys().next().value
    if (firstKey !== undefined) {
      responseCache.delete(firstKey)
    }
  }
}

/**
 * Generate text with Gemini AI
 * Includes rate limiting, caching, and error handling
 */
export async function generateText(
  prompt: string,
  options?: {
    useCache?: boolean
    maxRetries?: number
    temperature?: number
  }
): Promise<string> {
  const { useCache = true, maxRetries = 3, temperature = 0.7 } = options || {}
  
  // Check cache first
  if (useCache) {
    const cached = getCachedResponse(prompt)
    if (cached) {
      return cached
    }
  }
  
  // Check rate limit
  checkRateLimit()
  
  let lastError: Error | null = null
  
  // Retry logic with exponential backoff
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const model = getGeminiModel()
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: 2048,
        },
      })
      
      const response = result.response
      const text = response.text()
      
      // Cache the response
      if (useCache) {
        cacheResponse(prompt, text)
      }
      
      return text
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on rate limit errors
      if (lastError.message.includes('Rate limit')) {
        throw lastError
      }
      
      // Exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError || new Error('Failed to generate text after retries')
}

/**
 * Generate structured JSON response
 */
export async function generateJSON<T = any>(
  prompt: string,
  schema?: string,
  options?: {
    useCache?: boolean
    maxRetries?: number
  }
): Promise<T> {
  const schemaPrompt = schema 
    ? `${prompt}\n\nRespond with valid JSON matching this schema:\n${schema}`
    : `${prompt}\n\nRespond with valid JSON only.`
  
  const text = await generateText(schemaPrompt, {
    ...options,
    temperature: 0.3, // Lower temperature for more consistent JSON
  })
  
  try {
    // Extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/)
    const jsonText = jsonMatch ? jsonMatch[1] : text
    
    return JSON.parse(jsonText.trim())
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Stream text generation for real-time responses
 */
export async function* streamText(
  prompt: string,
  options?: {
    temperature?: number
  }
): AsyncGenerator<string, void, unknown> {
  const { temperature = 0.7 } = options || {}
  
  // Check rate limit
  checkRateLimit()
  
  const model = getGeminiModel()
  const result = await model.generateContentStream({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: 2048,
    },
  })
  
  for await (const chunk of result.stream) {
    const text = chunk.text()
    yield text
  }
}

/**
 * Analyze image with Gemini Vision
 */
export async function analyzeImage(
  imageData: string,
  prompt: string,
  options?: {
    mimeType?: string
  }
): Promise<string> {
  const { mimeType = 'image/jpeg' } = options || {}
  
  checkRateLimit()
  
  const model = getGeminiModel('gemini-1.5-flash')
  const result = await model.generateContent([
    {
      inlineData: {
        data: imageData,
        mimeType,
      },
    },
    { text: prompt },
  ])
  
  return result.response.text()
}

/**
 * Get current rate limit status
 */
export function getRateLimitStatus(): {
  requestsRemaining: number
  resetIn: number
} {
  const now = Date.now()
  const resetIn = RATE_WINDOW - (now - windowStart)
  
  return {
    requestsRemaining: Math.max(0, RATE_LIMIT - requestCount),
    resetIn: Math.max(0, resetIn),
  }
}

/**
 * Clear response cache
 */
export function clearCache(): void {
  responseCache.clear()
}
