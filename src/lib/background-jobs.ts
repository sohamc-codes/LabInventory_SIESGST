// Background job system for automatic status updates and history migration
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export class BackgroundJobManager {
  private static instance: BackgroundJobManager
  private intervals: Map<string, NodeJS.Timeout> = new Map()

  private constructor() {}

  static getInstance(): BackgroundJobManager {
    if (!BackgroundJobManager.instance) {
      BackgroundJobManager.instance = new BackgroundJobManager()
    }
    return BackgroundJobManager.instance
  }

  // Start all background jobs
  startAllJobs() {
    this.startHistoryMigrationJob()
    this.startOverdueCheckJob()
    this.startNotificationCleanupJob()
  }

  // Stop all background jobs
  stopAllJobs() {
    this.intervals.forEach((interval) => {
      clearInterval(interval)
    })
    this.intervals.clear()
  }

  // Job 1: Migrate returned components to history after 24 hours
  private startHistoryMigrationJob() {
    const interval = setInterval(async () => {
      try {
        await this.migrateToHistory()
      } catch (error) {
        console.error('History migration job failed:', error)
      }
    }, 60 * 60 * 1000) // Run every hour

    this.intervals.set('historyMigration', interval)
  }

  // Job 2: Check for overdue returns and update status
  private startOverdueCheckJob() {
    const interval = setInterval(async () => {
      try {
        await this.checkOverdueReturns()
      } catch (error) {
        console.error('Overdue check job failed:', error)
      }
    }, 30 * 60 * 1000) // Run every 30 minutes

    this.intervals.set('overdueCheck', interval)
  }

  // Job 3: Clean up old notifications
  private startNotificationCleanupJob() {
    const interval = setInterval(async () => {
      try {
        await this.cleanupOldNotifications()
      } catch (error) {
        console.error('Notification cleanup job failed:', error)
      }
    }, 24 * 60 * 60 * 1000) // Run daily

    this.intervals.set('notificationCleanup', interval)
  }

  // Migrate returned components to history after 24 hours
  private async migrateToHistory() {
    const now = new Date()
    
    // Find components that have been returned successfully for 24+ hours
    const componentsToMigrate = await prisma.issuedComponent.findMany({
      where: {
        status: 'RETURNED_SUCCESSFULLY',
        returnedAt: {
          lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago
        }
      },
      include: {
        component: true,
        student: true,
      }
    })

    for (const component of componentsToMigrate) {
      // Create history record
      await prisma.componentHistory.create({
        data: {
          componentId: component.componentId,
          studentId: component.studentId,
          quantity: component.quantity,
          issuedAt: component.issuedAt,
          expectedReturnDate: component.expectedReturnDate,
          returnedAt: component.returnedAt,
          returnedBy: component.returnedBy,
          purpose: component.purpose,
          condition: component.condition,
          returnCondition: component.returnCondition,
          issuedBy: component.issuedBy ?? 'SYSTEM',
          notes: component.notes,
          migratedAt: now,
        }
      })

      // Delete from active issued components
      await prisma.issuedComponent.delete({
        where: { id: component.id }
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: 'SYSTEM',
          action: 'COMPONENT_MIGRATED_TO_HISTORY',
          resource: 'ISSUED_COMPONENT',
          details: JSON.stringify({
            componentId: component.componentId,
            componentName: component.component.name,
            studentId: component.studentId,
            studentName: component.student.name,
            migratedAt: now.toISOString(),
          })
        }
      })
    }

    if (componentsToMigrate.length > 0) {
      console.log(`Migrated ${componentsToMigrate.length} components to history`)
    }
  }

  // Check for overdue returns and update status
  private async checkOverdueReturns() {
    const now = new Date()

    // Find return scheduled items that are now overdue
    const overdueReturns = await prisma.issuedComponent.updateMany({
      where: {
        status: 'RETURN_SCHEDULED',
        returnDeadline: {
          lt: now
        }
      },
      data: {
        status: 'RETURN_OVERDUE'
      }
    })

    if (overdueReturns.count > 0) {
      console.log(`Updated ${overdueReturns.count} returns to overdue status`)

      // Create notifications for overdue returns
      const overdueComponents = await prisma.issuedComponent.findMany({
        where: {
          status: 'RETURN_OVERDUE',
          returnDeadline: {
            lt: now,
            gt: new Date(now.getTime() - 60 * 60 * 1000) // Within last hour
          }
        },
        include: {
          component: true,
          student: true,
        }
      })

      for (const component of overdueComponents) {
        // Notify lab assistants about overdue return
        await prisma.notification.create({
          data: {
            type: 'RETURN_OVERDUE',
            title: 'Component Return Overdue',
            message: `${component.student.name}'s ${component.component.name} return is overdue`,
            data: JSON.stringify({
              partId: component.id,
              studentId: component.studentId,
              studentName: component.student.name,
              componentName: component.component.name,
              quantity: component.quantity,
              overdueBy: Math.floor((now.getTime() - component.returnDeadline!.getTime()) / (1000 * 60 * 60)), // hours
            }),
            targetRole: 'LAB_ASSISTANT',
            isRead: false,
          }
        })

        // Notify student about overdue return
        await prisma.notification.create({
          data: {
            type: 'RETURN_OVERDUE_STUDENT',
            title: 'Component Return Overdue',
            message: `Your ${component.component.name} return is overdue. Please return it immediately.`,
            data: JSON.stringify({
              partId: component.id,
              componentName: component.component.name,
              quantity: component.quantity,
              overdueBy: Math.floor((now.getTime() - component.returnDeadline!.getTime()) / (1000 * 60 * 60)),
            }),
            userId: component.studentId,
            isRead: false,
          }
        })
      }
    }
  }

  // Clean up old notifications (older than 30 days)
  private async cleanupOldNotifications() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const deletedCount = await prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    })

    if (deletedCount.count > 0) {
      console.log(`Cleaned up ${deletedCount.count} old notifications`)
    }
  }

  // Manual trigger for testing
  async runHistoryMigration() {
    await this.migrateToHistory()
  }

  async runOverdueCheck() {
    await this.checkOverdueReturns()
  }
}

// Initialize background jobs when the module is imported
if (typeof window === 'undefined') { // Only run on server side
  const jobManager = BackgroundJobManager.getInstance()
  
  // Start jobs in production or when explicitly enabled
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_BACKGROUND_JOBS === 'true') {
    jobManager.startAllJobs()
    console.log('Background jobs started')
  }
}

export default BackgroundJobManager