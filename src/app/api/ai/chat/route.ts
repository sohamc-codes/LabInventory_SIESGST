import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, context } = await request.json()

    // Get user's organization context
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        organizationId: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        requests: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            quantity: true,
            createdAt: true,
            component: {
              select: {
                id: true,
                name: true,
                category: true,
              }
            },
          },
        },
      },
    })

    // Get inventory context
    const components = await prisma.component.findMany({
      where: { organizationId: user?.organizationId || '' },
      take: 50,
      orderBy: { availableStock: 'asc' },
      select: {
        id: true,
        name: true,
        category: true,
        manufacturer: true,
        availableStock: true,
        totalStock: true,
        condition: true,
        storageLocation: true,
        // Omit: specifications, description (large text fields)
      },
    })

    // Build context for AI
    const systemContext = `
You are LabInventory AI Assistant, helping users manage their lab inventory.

Organization: ${user?.organization?.name}
User Role: ${user?.role}
Available Components: ${components.length}

Recent Activity:
${user?.requests.map(r => `- Requested ${r.component.name} (${r.status})`).join('\n')}

Low Stock Items:
${components.filter(c => c.availableStock < 10).map(c => `- ${c.name}: ${c.availableStock} left`).join('\n')}

Help the user with:
- Finding components
- Understanding inventory status
- Making requests
- Troubleshooting issues
- Best practices

Be concise, helpful, and action-oriented.
`

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    const chat = model.startChat({
      history: context || [],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    })

    const result = await chat.sendMessage(`${systemContext}\n\nUser: ${message}`)
    const response = result.response.text()

    return NextResponse.json({ 
      response,
      suggestions: generateSuggestions(message, components),
    })
  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}

function generateSuggestions(message: string, components: any[]) {
  const suggestions = []
  
  if (message.toLowerCase().includes('find') || message.toLowerCase().includes('search')) {
    suggestions.push('Browse Inventory', 'Use Smart Search (⌘K)')
  }
  
  if (message.toLowerCase().includes('request')) {
    suggestions.push('Create New Request', 'View My Requests')
  }
  
  if (message.toLowerCase().includes('low stock')) {
    const lowStock = components.filter(c => c.availableStock < 10)
    suggestions.push(`View ${lowStock.length} Low Stock Items`)
  }
  
  return suggestions
}
