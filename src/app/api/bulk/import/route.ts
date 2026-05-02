import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import QRCode from 'qrcode'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: 'No organization' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    const rows = text.split('\n').slice(1) // Skip header
    
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const row of rows) {
      if (!row.trim()) continue

      const [name, category, quantity, location, manufacturer, model] = row.split(',')

      try {
        const serialNumber = `SN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const qrCode = await QRCode.toDataURL(serialNumber)

        await prisma.component.create({
          data: {
            organizationId: user.organizationId,
            name: name.trim(),
            category: category.trim(),
            serialNumber,
            qrCode,
            totalStock: parseInt(quantity) || 0,
            availableStock: parseInt(quantity) || 0,
            storageLocation: location?.trim(),
            manufacturer: manufacturer?.trim(),
            model: model?.trim(),
          },
        })

        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(`Failed to import: ${name}`)
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
