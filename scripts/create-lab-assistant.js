/**
 * Script to create Lab Assistant accounts with hashed passwords
 * Usage: node scripts/create-lab-assistant.js
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function createLabAssistant() {
  try {
    console.log('\n🔧 Lab Assistant Account Creator\n')
    console.log('This script creates a Lab Assistant account with email/password authentication.\n')

    const name = await question('Enter full name: ')
    const email = await question('Enter email address: ')
    const password = await question('Enter password: ')
    const department = await question('Enter department (optional): ')

    // Validate inputs
    if (!name || !email || !password) {
      console.error('\n❌ Error: Name, email, and password are required.')
      process.exit(1)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.error(`\n❌ Error: User with email ${email} already exists.`)
      process.exit(1)
    }

    // Hash password
    console.log('\n🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    console.log('👤 Creating Lab Assistant account...')
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'LAB_ASSISTANT',
        department: department || null,
        isActive: true,
        emailVerified: new Date(),
      }
    })

    console.log('\n✅ Lab Assistant account created successfully!')
    console.log('\n📋 Account Details:')
    console.log(`   Name: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Department: ${user.department || 'Not specified'}`)
    console.log(`\n🔑 Login Credentials:`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Password: ${password}`)
    console.log('\n⚠️  Please save these credentials securely!\n')

  } catch (error) {
    console.error('\n❌ Error creating Lab Assistant:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    rl.close()
  }
}

createLabAssistant()
