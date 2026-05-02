import { generateJSON, generateText } from './gemini'

export interface ComponentAnalysis {
  category: string
  specifications: {
    key: string
    value: string
  }[]
  compatibleWith: string[]
  suggestedProjects: string[]
  tags: string[]
  confidence: number
}

export interface CompatibilityCheck {
  compatible: boolean
  issues: string[]
  suggestions: string[]
  confidence: number
}

/**
 * Analyze a component and extract structured information
 */
export async function analyzeComponent(input: {
  name: string
  description?: string
  category?: string
}): Promise<ComponentAnalysis> {
  const { name, description, category } = input
  
  const prompt = `Analyze this electronic component for an IoT/Electronics lab inventory system:

Component Name: ${name}
${description ? `Description: ${description}` : ''}
${category ? `Current Category: ${category}` : ''}

Please provide a detailed analysis in JSON format with:
1. category: The most appropriate category (MICROCONTROLLER, SENSOR, ACTUATOR, DISPLAY, COMMUNICATION, POWER, PASSIVE, CONNECTOR, DEVELOPMENT_BOARD, MODULE, OTHER)
2. specifications: Array of key-value pairs for technical specs (voltage, current, dimensions, protocols, etc.)
3. compatibleWith: Array of component names/types that work well with this
4. suggestedProjects: Array of 3-5 project ideas using this component
5. tags: Array of relevant keywords for search
6. confidence: Your confidence score (0-1) in this analysis

Respond with valid JSON only.`

  try {
    const result = await generateJSON<ComponentAnalysis>(prompt, undefined, {
      useCache: true,
      maxRetries: 2,
    })
    
    return result
  } catch (error) {
    console.error('Component analysis failed:', error)
    
    // Fallback to basic analysis
    return {
      category: category || 'OTHER',
      specifications: [],
      compatibleWith: [],
      suggestedProjects: [],
      tags: [name.toLowerCase()],
      confidence: 0.3,
    }
  }
}

/**
 * Check compatibility between multiple components
 */
export async function checkCompatibility(
  components: Array<{ name: string; specifications?: string }>
): Promise<CompatibilityCheck> {
  if (components.length < 2) {
    return {
      compatible: true,
      issues: [],
      suggestions: [],
      confidence: 1.0,
    }
  }
  
  const componentList = components
    .map((c, i) => `${i + 1}. ${c.name}${c.specifications ? ` (${c.specifications})` : ''}`)
    .join('\n')
  
  const prompt = `Check if these electronic components are compatible with each other:

${componentList}

Analyze for:
- Voltage level compatibility
- Current requirements
- Communication protocol compatibility
- Physical connection compatibility
- Power supply requirements

Respond with JSON:
{
  "compatible": true/false,
  "issues": ["list of compatibility issues"],
  "suggestions": ["suggestions to resolve issues or improve the setup"],
  "confidence": 0.0-1.0
}`

  try {
    const result = await generateJSON<CompatibilityCheck>(prompt, undefined, {
      useCache: true,
    })
    
    return result
  } catch (error) {
    console.error('Compatibility check failed:', error)
    
    return {
      compatible: true,
      issues: ['Unable to perform compatibility check'],
      suggestions: ['Please verify component specifications manually'],
      confidence: 0.0,
    }
  }
}

/**
 * Generate a detailed component description
 */
export async function generateComponentDescription(
  name: string,
  specifications?: Record<string, string>
): Promise<string> {
  const specsText = specifications
    ? Object.entries(specifications)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')
    : ''
  
  const prompt = `Generate a clear, concise description (2-3 sentences) for this electronic component:

Component: ${name}
${specsText ? `Specifications: ${specsText}` : ''}

The description should:
- Explain what the component is
- Mention key features and specifications
- Indicate common use cases
- Be suitable for a student inventory system

Respond with just the description text, no JSON.`

  try {
    const description = await generateText(prompt, {
      useCache: true,
      temperature: 0.7,
    })
    
    return description.trim()
  } catch (error) {
    console.error('Description generation failed:', error)
    return `${name} - Electronic component for IoT and electronics projects.`
  }
}

/**
 * Suggest component categorization
 */
export async function suggestCategory(
  name: string,
  description?: string
): Promise<{
  category: string
  confidence: number
  reasoning: string
}> {
  const prompt = `Categorize this electronic component:

Component: ${name}
${description ? `Description: ${description}` : ''}

Choose the most appropriate category from:
- MICROCONTROLLER
- SENSOR
- ACTUATOR
- DISPLAY
- COMMUNICATION
- POWER
- PASSIVE
- CONNECTOR
- DEVELOPMENT_BOARD
- MODULE
- OTHER

Respond with JSON:
{
  "category": "CATEGORY_NAME",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`

  try {
    const result = await generateJSON<{
      category: string
      confidence: number
      reasoning: string
    }>(prompt)
    
    return result
  } catch (error) {
    console.error('Category suggestion failed:', error)
    
    return {
      category: 'OTHER',
      confidence: 0.0,
      reasoning: 'Unable to determine category',
    }
  }
}

/**
 * Extract specifications from free-text description
 */
export async function extractSpecifications(
  description: string
): Promise<Record<string, string>> {
  const prompt = `Extract technical specifications from this component description:

"${description}"

Identify and extract specs like:
- Operating voltage
- Current consumption
- Dimensions
- Communication protocols
- Operating temperature
- Frequency
- Power rating
- Any other technical specs

Respond with JSON object where keys are spec names and values are the extracted values.
Example: {"voltage": "3.3V-5V", "current": "20mA", "protocol": "I2C"}

If no specs found, return empty object {}.`

  try {
    const specs = await generateJSON<Record<string, string>>(prompt)
    return specs
  } catch (error) {
    console.error('Specification extraction failed:', error)
    return {}
  }
}

/**
 * Find related components based on usage patterns
 */
export async function findRelatedComponents(
  componentName: string,
  projectType?: string
): Promise<string[]> {
  const prompt = `List 5-8 electronic components that are commonly used together with "${componentName}"${
    projectType ? ` in ${projectType} projects` : ''
  }.

Consider:
- Components that complement its functionality
- Required supporting components (power supplies, connectors, etc.)
- Sensors/actuators commonly paired with it
- Communication modules that work with it

Respond with a JSON array of component names only.
Example: ["Arduino Uno", "Breadboard", "Jumper Wires", "LED 5mm", "Resistor 220Ω"]`

  try {
    const components = await generateJSON<string[]>(prompt)
    return components
  } catch (error) {
    console.error('Related components search failed:', error)
    return []
  }
}
