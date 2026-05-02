import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function generateQRCode(text: string): string {
  // This would integrate with a QR code generation library
  return `qr-${text}-${Date.now()}`
}

export function generateSerialNumber(category: string): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${category.substring(0, 3).toUpperCase()}-${timestamp}-${random}`
}

export function calculateDaysUntilReturn(returnDate: Date): number {
  const today = new Date()
  const diffTime = new Date(returnDate).getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    APPROVED: 'bg-green-100 text-green-800 border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
    ISSUED: 'bg-blue-100 text-blue-800 border-blue-200',
    RETURNED: 'bg-gray-100 text-gray-800 border-gray-200',
    OVERDUE: 'bg-red-100 text-red-800 border-red-200',
    CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
  }
  return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}

export function getConditionColor(condition: string): string {
  const conditionColors: Record<string, string> = {
    NEW: 'bg-green-100 text-green-800 border-green-200',
    GOOD: 'bg-blue-100 text-blue-800 border-blue-200',
    WORN: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    DAMAGED: 'bg-red-100 text-red-800 border-red-200',
    LOST: 'bg-red-100 text-red-800 border-red-200',
  }
  return conditionColors[condition] || 'bg-gray-100 text-gray-800 border-gray-200'
}