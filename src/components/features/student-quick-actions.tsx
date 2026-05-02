'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  QrCode, 
  BookOpen, 
  MessageSquare, 
  Calendar,
  Package,
  FileText,
  HelpCircle,
  Sparkles
} from 'lucide-react'
import { motion } from 'framer-motion'

interface QuickAction {
  title: string
  description: string
  icon: any
  href: string
  color: string
  gradient: string
}

export function StudentQuickActions() {
  const actions: QuickAction[] = [
    {
      title: 'New Request',
      description: 'Request components for your project',
      icon: Plus,
      href: '/requests/new',
      color: 'text-blue-600',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'My Requests',
      description: 'Track your component requests',
      icon: FileText,
      href: '/requests/my-requests',
      color: 'text-purple-600',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Scan QR Code',
      description: 'Quick component lookup',
      icon: QrCode,
      href: '/scanner',
      color: 'text-green-600',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Learning Hub',
      description: 'Tutorials and guides',
      icon: BookOpen,
      href: '/learning',
      color: 'text-orange-600',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      title: 'My Requests',
      description: 'Track your requests',
      icon: FileText,
      href: '/requests/my-requests',
      color: 'text-indigo-600',
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      title: 'Issued Items',
      description: 'View borrowed components',
      icon: Package,
      href: '/parts-issued',
      color: 'text-teal-600',
      gradient: 'from-teal-500 to-cyan-500',
    },
    {
      title: 'AI Assistant',
      description: 'Get instant help',
      icon: Sparkles,
      href: '#',
      color: 'text-yellow-600',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      title: 'Help Center',
      description: 'FAQs and support',
      icon: HelpCircle,
      href: '/help',
      color: 'text-gray-600',
      gradient: 'from-gray-500 to-slate-500',
    },
  ]

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Quick Actions</h3>
        <p className="text-sm text-gray-600 dark:text-zinc-300">
          Common tasks at your fingertips
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={action.href}>
                <div className="group p-4 rounded-lg border border-gray-200 dark:border-zinc-800 hover:border-transparent hover:shadow-lg transition-all cursor-pointer bg-white dark:bg-zinc-900 hover:bg-gradient-to-br hover:from-white hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-700">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{action.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-zinc-300 line-clamp-2">
                    {action.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </Card>
  )
}
