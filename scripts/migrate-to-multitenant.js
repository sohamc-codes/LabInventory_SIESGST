/**
 * Migration Script: Single-tenant to Multi-tenant
 * 
 * This script migrates existing data from the old single-tenant schema
 * to the new multi-tenant schema with organizations.
 * 
 * Usage: node scripts/migrate-to-multitenant.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateToMultiTenant() {
  console.log('🚀 Starting migration to multi-tenant architecture...\n')

  try {
    // Step 1: Create default organization
    console.log('📦 Step 1: Creating default organization...')
    
    const defaultOrg = await prisma.organization.create({
      data: {
        name: 'Default Organization',
        slug: 'default-org',
        plan: 'PROFESSIONAL',
        status: 'ACTIVE',
        maxUsers: 500,
        maxComponents: 5000,
        trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    })

    console.log(`✅ Created organization: ${defaultOrg.name} (${defaultOrg.id})\n`)

    // Step 2: Migrate users
    console.log('👥 Step 2: Migrating users...')
    
    const users = await prisma.user.findMany({
      where: {
        organizationId: null,
      },
    })

    let userCount = 0
    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          organizationId: defaultOrg.id,
          onboardedAt: user.createdAt,
        },
      })
      userCount++
    }

    console.log(`✅ Migrated ${userCount} users\n`)

    // Step 3: Migrate components
    console.log('📦 Step 3: Migrating components...')
    
    const components = await prisma.component.findMany({
      where: {
        organizationId: null,
      },
    })

    let componentCount = 0
    for (const component of components) {
      await prisma.component.update({
        where: { id: component.id },
        data: {
          organizationId: defaultOrg.id,
        },
      })
      componentCount++
    }

    console.log(`✅ Migrated ${componentCount} components\n`)

    // Step 4: Assign owner role
    console.log('👑 Step 4: Assigning owner role...')
    
    const firstAdmin = await prisma.user.findFirst({
      where: {
        organizationId: defaultOrg.id,
        role: 'ADMIN',
      },
    })

    if (firstAdmin) {
      await prisma.user.update({
        where: { id: firstAdmin.id },
        data: { role: 'OWNER' },
      })
      console.log(`✅ Assigned OWNER role to: ${firstAdmin.email}\n`)
    } else {
      console.log('⚠️  No admin user found to assign OWNER role\n')
    }

    // Step 5: Summary
    console.log('📊 Migration Summary:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Organization:  ${defaultOrg.name}`)
    console.log(`Users:         ${userCount}`)
    console.log(`Components:    ${componentCount}`)
    console.log(`Owner:         ${firstAdmin?.email || 'None'}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    console.log('✅ Migration completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('1. Verify data in Prisma Studio: npm run db:studio')
    console.log('2. Test the application: npm run dev:full')
    console.log('3. Update organization details in settings')
    console.log('4. Invite team members\n')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
migrateToMultiTenant()
  .then(() => {
    console.log('🎉 All done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
