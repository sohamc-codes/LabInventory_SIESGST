'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, Plus, Trash2, ShoppingCart, Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface WishlistItem {
  id: string
  name: string
  category: string
  availability: 'in-stock' | 'low-stock' | 'out-of-stock'
  quantity: number
  priority: 'high' | 'medium' | 'low'
  notes?: string
}

export function StudentComponentWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([
    {
      id: '1',
      name: 'ESP32 WiFi Module',
      category: 'Microcontroller',
      availability: 'in-stock',
      quantity: 5,
      priority: 'high',
      notes: 'For IoT project',
    },
    {
      id: '2',
      name: 'OLED Display 128x64',
      category: 'Display',
      availability: 'low-stock',
      quantity: 2,
      priority: 'medium',
    },
    {
      id: '3',
      name: 'Servo Motor SG90',
      category: 'Actuator',
      availability: 'out-of-stock',
      quantity: 3,
      priority: 'low',
      notes: 'Robot arm project',
    },
  ])

  const removeItem = (id: string) => {
    setWishlist(wishlist.filter(item => item.id !== id))
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in-stock':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
      case 'out-of-stock':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-zinc-900 dark:text-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-zinc-900 dark:text-gray-200'
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              <Heart className="h-5 w-5 mr-2 text-pink-600" />
              Component Wishlist
            </h3>
            <p className="text-sm text-gray-600 dark:text-zinc-300">
              Save components for future projects
            </p>
          </div>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {wishlist.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-zinc-300">
                Your wishlist is empty. Start adding components!
              </p>
            </div>
          ) : (
            wishlist.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 border rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <Badge className={getAvailabilityColor(item.availability)}>
                        {item.availability.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-300 mb-2">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>Qty: {item.quantity}</span>
                      <Badge className={getPriorityColor(item.priority)} variant="outline">
                        {item.priority} priority
                      </Badge>
                    </div>
                    {item.notes && (
                      <p className="text-xs text-gray-500 italic">{item.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {item.availability === 'in-stock' && (
                    <Button size="sm" className="flex-1">
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Request Now
                    </Button>
                  )}
                  {item.availability === 'out-of-stock' && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <Bell className="h-3 w-3 mr-1" />
                      Notify Me
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {wishlist.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-pink-900 dark:text-pink-100">
                {wishlist.filter(i => i.availability === 'in-stock').length} items available
              </h4>
              <p className="text-sm text-pink-700 dark:text-pink-300">
                Ready to request now
              </p>
            </div>
            <Button size="sm">Request All</Button>
          </div>
        </div>
      )}
    </Card>
  )
}
