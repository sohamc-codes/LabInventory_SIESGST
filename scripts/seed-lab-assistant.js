/**
 * Script to seed a demo Lab Assistant account
 * Usage: node scripts/seed-lab-assistant.js
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seedLabAssistant() {
  try {
    console.log('\n🌱 Seeding Demo Lab Assistant Account...\n')

    const email = 'lab.staff@sies.edu'
    const password = 'lab123'
    const name = 'Lab Staff'

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log(`ℹ️  Lab Assistant ${email} already exists.`)
      
      // Update password if needed
      const hashedPassword = await bcrypt.hash(password, 10)
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
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

      console.log('✅ Demo Lab Assistant account created successfully!')
      console.log('\n📋 Account Details:')
      console.log(`   Name: ${user.name}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Department: ${user.department}`)
    }

    console.log('\n🔑 Login Credentials:')
    console.log(`   Email: ${email}`)
    console.log(`   Password: ${password}`)
    console.log('\n✨ You can now sign in using the "Lab Assistant / Staff Login" option.\n')

  } catch (error) {
    console.error('\n❌ Error seeding Lab Assistant:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seedLabAssistant()
