/**
 * Script to seed Lab Assistant account in PRODUCTION database
 * Usage: node scripts/seed-production-lab-assistant.js
 * 
 * IMPORTANT: Make sure you set DATABASE_URL to your production Supabase URL
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seedProductionLabAssistant() {
  try {
    console.log('\n🌱 Seeding Lab Assistant Account to Production...\n')
    console.log('📍 Database:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'Unknown')

    const email = 'lab.staff@sies.edu'
    const password = 'lab123'
    const name = 'Lab Staff'

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log(`ℹ️  Lab Assistant ${email} already exists.`)
      console.log('   Updating password...')
      
      // Update password
      const hashedPassword = await bcrypt.hash(password, 10)
      await prisma.user.update({
        where: { email },
        data: { 
          password: hashedPassword,
          isActive: true,
          role: 'LAB_ASSISTANT',
        }
      })
      
      console.log('✅ Password updated for existing Lab Assistant.')
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'LAB_ASSISTANT',
          department: 'IoT Lab',
          isActive: true,
          emailVerified: new Date(),
        }
      })

      console.log('✅ Lab Assistant account created successfully in production!')
      console.log('\n📋 Account Details:')
      console.log(`   ID: ${user.id}`)
      console.log(`   Name: ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Department: ${user.department}`)
      console.log(`   Active: ${user.isActive}`)
    }

    console.log('\n🔑 Production Login Credentials:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log('\n✨ You can now sign in at https://lab-inventory-siesgst.vercel.app\n')

  } catch (error) {
    console.error('\n❌ Error seeding Lab Assistant:', error.message)
    console.error('\n💡 Troubleshooting:')
    console.error('   1. Make sure DATABASE_URL in .env points to production Supabase')
    console.error('   2. Check that your Supabase database is accessible')
    console.error('   3. Verify Prisma client is generated (run: npx prisma generate)')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedProductionLabAssistant()
