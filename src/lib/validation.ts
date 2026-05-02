/**
 * Input validation schemas using Zod
 * Ensures data integrity and security
 */

import { z } from 'zod'

// ============================================================================
// Component Schemas
// ============================================================================

export const componentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  category: z.string().min(1, 'Category is required'),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
  specifications: z.string().optional(),
  datasheet: z.string().url('Invalid URL').optional().or(z.literal('')),
  totalStock: z.number().int().min(0, 'Quantity must be positive'),
  availableStock: z.number().int().min(0, 'Quantity must be positive'),
  minStockLevel: z.number().int().min(0, 'Quantity must be positive').optional(),
  location: z.string().optional(),
  price: z.number().min(0, 'Price must be positive').optional(),
})

export const componentUpdateSchema = componentSchema.partial()

export const componentIdSchema = z.object({
  id: z.string().uuid('Invalid component ID'),
})

// ============================================================================
// Request Schemas
// ============================================================================

export const requestSchema = z.object({
  componentId: z.string().uuid('Invalid component ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity too large'),
  purpose: z.string().min(10, 'Purpose must be at least 10 characters').max(500, 'Purpose too long'),
  expectedDuration: z.number().int().min(1, 'Duration must be at least 1 day').max(365, 'Duration too long'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
})

export const requestUpdateSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'ISSUED', 'RETURNED', 'CANCELLED']),
  rejectionReason: z.string().optional(),
})

export const requestIdSchema = z.object({
  id: z.string().uuid('Invalid request ID'),
})

// ============================================================================
// User Schemas
// ============================================================================

export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  role: z.enum(['STUDENT', 'LAB_ASSISTANT', 'HOD', 'ADMIN']),
  department: z.string().optional(),
  studentId: z.string().optional(),
})

export const userUpdateSchema = userSchema.partial()

// ============================================================================
// Return Schemas
// ============================================================================

export const returnSchema = z.object({
  partId: z.string().uuid('Invalid part ID'),
  condition: z.enum(['GOOD', 'DAMAGED', 'LOST']),
  notes: z.string().max(500, 'Notes too long').optional(),
})

export const scheduleReturnSchema = z.object({
  partId: z.string().uuid('Invalid part ID'),
  returnDate: z.string().datetime('Invalid date format'),
})

// ============================================================================
// Search & Filter Schemas
// ============================================================================

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query required').max(100, 'Query too long'),
  category: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
})

export const filterSchema = z.object({
  category: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minQuantity: z.number().int().min(0).optional(),
  maxQuantity: z.number().int().min(0).optional(),
})

// ============================================================================
// Bulk Operation Schemas
// ============================================================================

export const bulkImportSchema = z.object({
  components: z.array(componentSchema).min(1, 'At least one component required').max(1000, 'Too many components'),
})

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'At least one ID required').max(100, 'Too many IDs'),
})

// ============================================================================
// Pagination Schema
// ============================================================================

export const paginationSchema = z.object({
  page: z.number().int().min(1, 'Page must be at least 1').optional().default(1),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(100, 'Limit too large').optional().default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

// ============================================================================
// File Upload Schema
// ============================================================================

export const fileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename required'),
  mimetype: z.string().regex(/^(image|application)\/(jpeg|jpg|png|pdf|csv|json)$/, 'Invalid file type'),
  size: z.number().max(10 * 1024 * 1024, 'File too large (max 10MB)'),
})

// ============================================================================
// Notification Schema
// ============================================================================

export const notificationSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  type: z.enum(['REQUEST', 'APPROVAL', 'REJECTION', 'ISSUE', 'RETURN', 'REMINDER', 'SYSTEM']),
  title: z.string().min(1, 'Title required').max(100, 'Title too long'),
  message: z.string().min(1, 'Message required').max(500, 'Message too long'),
  link: z.string().url('Invalid URL').optional(),
})

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate data against schema
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: z.ZodError
} {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error }
    }
    throw error
  }
}

/**
 * Format Zod errors for API response
 */
export function formatValidationErrors(errors: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {}
  
  errors.errors.forEach((error) => {
    const path = error.path.join('.')
    if (!formatted[path]) {
      formatted[path] = []
    }
    formatted[path].push(error.message)
  })
  
  return formatted
}

/**
 * Sanitize string input (prevent XSS)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj }
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key]) as any
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key])
    }
  }
  
  return sanitized
}

// ============================================================================
// Type Exports
// ============================================================================

export type ComponentInput = z.infer<typeof componentSchema>
export type ComponentUpdate = z.infer<typeof componentUpdateSchema>
export type RequestInput = z.infer<typeof requestSchema>
export type RequestUpdate = z.infer<typeof requestUpdateSchema>
export type UserInput = z.infer<typeof userSchema>
export type UserUpdate = z.infer<typeof userUpdateSchema>
export type ReturnInput = z.infer<typeof returnSchema>
export type ScheduleReturnInput = z.infer<typeof scheduleReturnSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type FilterInput = z.infer<typeof filterSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>
export type NotificationInput = z.infer<typeof notificationSchema>
