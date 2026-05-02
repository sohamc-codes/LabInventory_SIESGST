import { generateJSON, generateText } from './gemini'
import { prisma } from '@/lib/prisma'

export interface SmartRecommendation {
  componentId?: string
  componentName: string
  category: string
  reason: string
  confidence: number
  relatedComponents: string[]
  estimatedUsage: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface ProjectSuggestion {
  title: string
  description: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  estimatedDuration: string
  requiredComponents: string[]
  learningOutcomes: string[]
}

/**
 * Get personalized component recommendations for a student
 */
export async function getPersonalizedRecommendations(input: {
  studentId: string
  projectType?: string
  selectedComponents?: string[]
  limit?: number
}): Promise<SmartRecommendation[]> {
  const { studentId, projectType, selectedComponents, limit = 5 } = input

  try {
    // Fetch student's request history
    const requestHistory = await prisma.componentRequest.findMany({
      where: { studentId },
      include: {
        component: {
          select: {
            name: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const historyText = requestHistory.length > 0
      ? requestHistory
          .map(r => `${r.component.name} (${r.component.category}) - ${r.purpose}`)
          .join('\n')
      : 'No previous requests'

    const selectedText = selectedComponents && selectedComponents.length > 0
      ? `\nCurrently selected: ${selectedComponents.join(', ')}`
      : ''

    const prompt = `You are an AI assistant for an IoT/Electronics lab inventory system. Recommend ${limit} components for a student based on their history and current needs.

Student's Previous Requests:
${historyText}
${selectedText}
${projectType ? `\nProject Type: ${projectType}` : ''}

Provide ${limit} personalized recommendations considering:
1. Student's skill progression (beginner → advanced)
2. Complementary components to what they've used
3. Trending components in IoT/Electronics
4. Components that enable new project types
5. Educational value and learning progression

Respond with JSON array:
[{
  "componentName": "Component Name",
  "category": "CATEGORY",
  "reason": "Why this is recommended for this student",
  "confidence": 0.0-1.0,
  "relatedComponents": ["component1", "component2"],
  "estimatedUsage": days_typically_needed,
  "priority": "HIGH|MEDIUM|LOW"
}]`

    const recommendations = await generateJSON<SmartRecommendation[]>(prompt, undefined, {
      useCache: false, // Don't cache personalized recommendations
      maxRetries: 2,
    })

    return recommendations.slice(0, limit)
  } catch (error) {
    console.error('Personalized recommendations failed:', error)
    return []
  }
}

/**
 * Generate project suggestions based on selected components
 */
export async function generateProjectSuggestions(
  components: string[],
  skillLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
): Promise<ProjectSuggestion[]> {
  if (components.length === 0) {
    return []
  }

  const prompt = `Generate 3 creative project ideas using these electronic components:

Components: ${components.join(', ')}
${skillLevel ? `Student Skill Level: ${skillLevel}` : ''}

For each project, provide:
1. Engaging title
2. Brief description (2-3 sentences)
3. Difficulty level (BEGINNER, INTERMEDIATE, or ADVANCED)
4. Estimated duration to complete
5. Required components from the list (and any additional common items)
6. Learning outcomes (what skills/concepts students will learn)

Respond with JSON array:
[{
  "title": "Project Title",
  "description": "What the project does and why it's interesting",
  "difficulty": "BEGINNER|INTERMEDIATE|ADVANCED",
  "estimatedDuration": "e.g., 2-3 days, 1 week",
  "requiredComponents": ["component1", "component2"],
  "learningOutcomes": ["skill1", "skill2", "skill3"]
}]`

  try {
    const projects = await generateJSON<ProjectSuggestion[]>(prompt)
    return projects
  } catch (error) {
    console.error('Project suggestions failed:', error)
    return []
  }
}

/**
 * Find complementary components ("students who requested X also requested Y")
 */
export async function findComplementaryComponents(
  componentId: string,
  limit: number = 5
): Promise<string[]> {
  try {
    // Get the component details
    const component = await prisma.component.findUnique({
      where: { id: componentId },
      select: { name: true, category: true },
    })

    if (!component) {
      return []
    }

    // Find requests that included this component
    const requests = await prisma.componentRequest.findMany({
      where: { componentId },
      select: { studentId: true },
      take: 50,
    })

    const studentIds = requests.map(r => r.studentId)

    if (studentIds.length === 0) {
      // Fallback to AI recommendations
      return await getAIComplementaryComponents(component.name, limit)
    }

    // Find other components requested by the same students
    const otherComponents = await prisma.componentRequest.findMany({
      where: {
        studentId: { in: studentIds },
        componentId: { not: componentId },
      },
      include: {
        component: {
          select: { name: true },
        },
      },
      take: 100,
    })

    // Count frequency
    const frequency = new Map<string, number>()
    otherComponents.forEach(req => {
      const name = req.component.name
      frequency.set(name, (frequency.get(name) || 0) + 1)
    })

    // Sort by frequency and return top N
    const sorted = Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name]) => name)

    return sorted
  } catch (error) {
    console.error('Complementary components search failed:', error)
    return []
  }
}

/**
 * AI-powered complementary component suggestions
 */
async function getAIComplementaryComponents(
  componentName: string,
  limit: number
): Promise<string[]> {
  const prompt = `List ${limit} electronic components that are commonly used together with "${componentName}" in IoT/Electronics projects.

Focus on:
- Components that complement its functionality
- Required supporting components
- Commonly paired sensors/actuators
- Communication modules

Respond with JSON array of component names only:
["Component 1", "Component 2", ...]`

  try {
    const components = await generateJSON<string[]>(prompt)
    return components.slice(0, limit)
  } catch (error) {
    console.error('AI complementary components failed:', error)
    return []
  }
}

/**
 * Validate and improve request purpose using AI
 */
export async function validateRequestPurpose(
  purpose: string,
  componentName: string
): Promise<{
  isValid: boolean
  score: number
  suggestions: string[]
  improvedPurpose?: string
}> {
  const prompt = `Evaluate this component request purpose for quality and detail:

Component: ${componentName}
Purpose: "${purpose}"

Assess:
1. Is it specific enough? (mentions what will be built/learned)
2. Is it educational/legitimate?
3. Does it make sense for this component?

Respond with JSON:
{
  "isValid": true/false,
  "score": 0-100 (quality score),
  "suggestions": ["how to improve the purpose description"],
  "improvedPurpose": "optional: a better version of the purpose if score < 70"
}`

  try {
    const result = await generateJSON<{
      isValid: boolean
      score: number
      suggestions: string[]
      improvedPurpose?: string
    }>(prompt)

    return result
  } catch (error) {
    console.error('Purpose validation failed:', error)
    return {
      isValid: true,
      score: 50,
      suggestions: [],
    }
  }
}

/**
 * Get trending components based on recent activity
 */
export async function getTrendingComponents(
  limit: number = 5,
  timeframeDays: number = 30
): Promise<Array<{ name: string; category: string; trendScore: number; reason: string }>> {
  try {
    const since = new Date()
    since.setDate(since.getDate() - timeframeDays)

    // Get most requested components in timeframe
    const requests = await prisma.componentRequest.findMany({
      where: {
        createdAt: { gte: since },
      },
      include: {
        component: {
          select: { name: true, category: true },
        },
      },
    })

    // Count requests per component
    const componentCounts = new Map<string, { name: string; category: string; count: number }>()
    
    requests.forEach(req => {
      const key = req.component.name
      const existing = componentCounts.get(key)
      if (existing) {
        existing.count++
      } else {
        componentCounts.set(key, {
          name: req.component.name,
          category: req.component.category,
          count: 1,
        })
      }
    })

    // Sort by count and get top N
    const trending = Array.from(componentCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    // Add AI-generated reasons
    const prompt = `These components are trending in an IoT/Electronics lab (last ${timeframeDays} days):

${trending.map((c, i) => `${i + 1}. ${c.name} (${c.category}) - ${c.count} requests`).join('\n')}

For each component, provide a brief reason why it might be trending (1 sentence).

Respond with JSON array:
[{
  "name": "Component Name",
  "category": "CATEGORY",
  "trendScore": count_normalized_to_0-1,
  "reason": "Why it's trending"
}]`

    const withReasons = await generateJSON<Array<{
      name: string
      category: string
      trendScore: number
      reason: string
    }>>(prompt)

    return withReasons
  } catch (error) {
    console.error('Trending components failed:', error)
    return []
  }
}
