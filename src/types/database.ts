// Database types to replace Prisma enums for SQLite compatibility

export const UserRole = {
  STUDENT: 'STUDENT',
  LAB_ASSISTANT: 'LAB_ASSISTANT',
  HOD: 'HOD',
  ADMIN: 'ADMIN',
} as const

export type UserRole = typeof UserRole[keyof typeof UserRole]

export const RequestStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  ISSUED: 'ISSUED',
  RETURNED: 'RETURNED',
  OVERDUE: 'OVERDUE',
  CLOSED: 'CLOSED',
} as const

export type RequestStatus = typeof RequestStatus[keyof typeof RequestStatus]

export const ComponentCondition = {
  NEW: 'NEW',
  GOOD: 'GOOD',
  WORN: 'WORN',
  DAMAGED: 'DAMAGED',
  LOST: 'LOST',
} as const

export type ComponentCondition = typeof ComponentCondition[keyof typeof ComponentCondition]

export const ComponentCategory = {
  SENSOR: 'SENSOR',
  IC: 'IC',
  MODULE: 'MODULE',
  WIRE: 'WIRE',
  TOOL: 'TOOL',
  RESISTOR: 'RESISTOR',
  CAPACITOR: 'CAPACITOR',
  TRANSISTOR: 'TRANSISTOR',
  DIODE: 'DIODE',
  MICROCONTROLLER: 'MICROCONTROLLER',
  BREADBOARD: 'BREADBOARD',
  OTHER: 'OTHER',
} as const

export type ComponentCategory = typeof ComponentCategory[keyof typeof ComponentCategory]

export const NotificationType = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',
} as const

export type NotificationType = typeof NotificationType[keyof typeof NotificationType]