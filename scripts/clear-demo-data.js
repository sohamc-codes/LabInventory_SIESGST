#!/usr/bin/env node

/**
 * DEMO DATA CLEAR SCRIPT
 *
 * ⚠️  WARNING: This script DELETES ALL DATA from the database.
 * It must NEVER be run against a production database.
 *
 * Usage:
 *   npm run demo:clear          (development only)
 *
 * The script is intentionally blocked when NODE_ENV=production.
 */

const { PrismaClient } = require('@prisma/client')

// ── Production guard ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  console.error('❌  BLOCKED: demo:clear must not be run in production.')
  console.error('    Set NODE_ENV to "development" or "test" to use this script.')
  process.exit(1)
}

const prisma = new PrismaClient()

async function clearDemoData() {
  console.log('🧹 Clearing demo data from IoT Parts Management System...')

  try {
    // Clear data in the correct order to avoid foreign key constraints
    console.log('Deleting audit logs...')
    await prisma.auditLog.deleteMany({})

    console.log('Deleting issued components...')
    await prisma.issuedComponent.deleteMany({})

    console.log('Deleting stock movements...')
    await prisma.stockMovement.deleteMany({})

    console.log('Deleting component requests...')
    await prisma.componentRequest.deleteMany({})

    console.log('Deleting components...')
    await prisma.component.deleteMany({})

    console.log('Deleting notifications...')
    await prisma.notification.deleteMany({})

    console.log('Deleting user sessions...')
    await prisma.session.deleteMany({})

    console.log('Deleting user accounts...')
    await prisma.account.deleteMany({})

    console.log('Deleting users...')
    await prisma.user.deleteMany({})

    console.log('\n✅ All demo data cleared successfully!')
    console.log('\n📋 Database is now empty and ready for production use:')
    console.log('   👥 Users: 0 (will be created on first login)')
    console.log('   📦 Components: 0 (lab assistants will add these)')
    console.log('   📋 Requests: 0 (students will create these)')
    console.log('   🔄 Issued Items: 0 (will be created when components are issued)')
    
    console.log('\n🚀 System is ready for real-world use!')
    console.log('   🔬 Lab assistants can now add components via /inventory/manage')
    console.log('   🎓 Students can browse and request available components')
    console.log('   👨‍💼 HODs can approve requests and view analytics')

  } catch (error) {
    console.error('❌ Error clearing demo data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearDemoData().catch((error) => {
  console.error(error)
  process.exit(1)
})