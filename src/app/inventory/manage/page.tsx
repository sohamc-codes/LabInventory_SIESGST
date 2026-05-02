'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useComponents, useCreateComponent, useUpdateComponent } from '@/lib/hooks/use-components'

export default function ManageInventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showAdjustDialog, setShowAdjustDialog] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<any>(null)
  const [newTotalStock, setNewTotalStock] = useState(0)
  const [newComponent, setNewComponent] = useState({
    name: '',
    category: 'SENSOR',
    totalStock: 1,
    manufacturer: '',
  })
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [customCategoryInput, setCustomCategoryInput] = useState('')

  const { data, isLoading: dataLoading, refetch } = useComponents({
    search: searchTerm,
    limit: 50,
  })

  const createComponentMutation = useCreateComponent()
  const updateComponentMutation = useUpdateComponent(selectedComponent?.id || '')

  const categories = ['SENSOR', 'IC', 'MODULE', 'WIRE', 'TOOL', 'RESISTOR', 'CAPACITOR', 'TRANSISTOR', 'DIODE', 'MICROCONTROLLER', 'BREADBOARD', 'OTHER']
  const filteredComponents = useMemo(() => data?.components || [], [data?.components])

  // Helper function to get stock status badge
  const getStockStatus = (availableStock: number) => {
    if (availableStock === 0) {
      return {
        label: 'Out of Stock',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800'
      }
    } else if (availableStock <= 2) {
      return {
        label: 'Low Stock',
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
      }
    } else {
      return {
        label: 'In Stock',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800'
      }
    }
  }

  const handleAddComponent = async () => {
    if (!newComponent.name) return

    // Use custom category if "CUSTOM" is selected, otherwise use the selected category
    const finalCategory = isCustomCategory ? customCategoryInput.trim() : newComponent.category

    if (!finalCategory) {
      toast.error('Please provide a category')
      return
    }

    try {
      await createComponentMutation.mutateAsync({
        name: newComponent.name,
        category: finalCategory,
        manufacturer: newComponent.manufacturer,
        totalStock: newComponent.totalStock,
      })

      setNewComponent({
        name: '',
        category: 'SENSOR',
        totalStock: 1,
        manufacturer: '',
      })
      setIsCustomCategory(false)
      setCustomCategoryInput('')
      setShowAddDialog(false)
      refetch()
    } catch (error) {
      console.error('Failed to add component:', error)
    }
  }

  const handleAdjustStock = async () => {
    try {
      await updateComponentMutation.mutateAsync({ totalStock: newTotalStock })
      toast.success('Stock updated')
      setShowAdjustDialog(false)
      setSelectedComponent(null)
      refetch()
    } catch (error) {
      toast.error('Failed to adjust stock')
    }
  }

  if (dataLoading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title="Manage Inventory" subtitle="Loading..." />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading inventory...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Manage Inventory"
          subtitle="Quantity-based inventory management"
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by component name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => void refetch()}>
                      Refresh
                    </Button>
                    <Button onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Component
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Components ({filteredComponents.length})</CardTitle>
                <CardDescription>Adjust stock when parts are dumped or newly added.</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredComponents.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead className="hidden sm:table-cell">Category</TableHead>
                          <TableHead className="hidden md:table-cell">Total Stock</TableHead>
                          <TableHead>Available</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredComponents.map((component) => {
                          const status = getStockStatus(component.availableStock)
                          return (
                            <TableRow key={component.id}>
                              <TableCell>
                                <p className="font-medium">{component.name}</p>
                                <p className="text-xs text-muted-foreground sm:hidden">{component.category}</p>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">{component.category}</TableCell>
                              <TableCell className="hidden md:table-cell">{component.totalStock}</TableCell>
                              <TableCell>
                                <span className="font-medium">{component.availableStock}</span>
                                <span className="text-xs text-muted-foreground md:hidden"> / {component.totalStock}</span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={status.className}>
                                  <span className="hidden sm:inline">{status.label}</span>
                                  <span className="sm:hidden">
                                    {component.availableStock === 0 ? 'Out' : component.availableStock <= 2 ? 'Low' : 'OK'}
                                  </span>
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedComponent(component)
                                      setNewTotalStock(component.totalStock)
                                      setShowAdjustDialog(true)
                                    }}
                                  >
                                    <span className="hidden sm:inline">Adjust Stock</span>
                                    <span className="sm:hidden">Adjust</span>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No components found.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="w-[95vw] max-w-lg sm:w-full p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Add Component</DialogTitle>
            <DialogDescription>Create a quantity-managed component.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Component Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="e.g., Arduino Uno R3"
                value={newComponent.name}
                onChange={(e) => setNewComponent({ ...newComponent, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={isCustomCategory ? 'CUSTOM' : newComponent.category}
                onChange={(e) => {
                  if (e.target.value === 'CUSTOM') {
                    setIsCustomCategory(true)
                  } else {
                    setIsCustomCategory(false)
                    setNewComponent({ ...newComponent, category: e.target.value })
                  }
                }}
                className="w-full px-3 py-2 border border-border rounded-md bg-card text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none pr-10 bg-no-repeat bg-right"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1.5em 1.5em'
                }}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
                <option value="CUSTOM">Custom Category...</option>
              </select>
            </div>

            {isCustomCategory && (
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Custom Category Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., LED, BATTERY, CONNECTOR"
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value.toUpperCase())}
                  className="uppercase"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a custom category name (will be converted to uppercase)
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Manufacturer
              </label>
              <Input
                placeholder="e.g., Arduino, Texas Instruments"
                value={newComponent.manufacturer}
                onChange={(e) => setNewComponent({ ...newComponent, manufacturer: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Initial Stock <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min={0}
                placeholder="Enter quantity"
                value={newComponent.totalStock}
                onChange={(e) => setNewComponent({ ...newComponent, totalStock: Number(e.target.value) || 0 })}
              />
            </div>

            <Button 
              onClick={handleAddComponent} 
              className="w-full"
              disabled={!newComponent.name || (isCustomCategory && !customCategoryInput.trim())}
            >
              Add Component
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAdjustDialog} onOpenChange={setShowAdjustDialog}>
        <DialogContent className="w-[95vw] max-w-md sm:w-full p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>Set new total stock for {selectedComponent?.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="number"
              min={0}
              value={newTotalStock}
              onChange={(e) => setNewTotalStock(Number(e.target.value) || 0)}
            />
            <Button onClick={handleAdjustStock} className="w-full">Update Total Stock</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}