'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useDebounce } from 'use-debounce'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  Package, 
  Calendar,
  DollarSign,
  MapPin,
  FileText,
  Loader2,
} from 'lucide-react'
import { useComponentSearch, useComponentRecommendations } from '@/lib/hooks/use-component-search'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'

interface SmartSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectComponent: (componentId: string) => void
  userId?: string // Made optional since we don't use it anymore
}

interface Component {
  id: string
  name: string
  category: string
  manufacturer: string
  model: string
  specifications: string
  imageUrl?: string
  purchaseDate: Date
  cost: number
  storageLocation: string
  qrCode: string
  availableStock: number
  totalStock: number
  condition: string
  description?: string
}

export function SmartSearch({ open, onOpenChange, onSelectComponent, userId }: SmartSearchProps) {
  const { data: session } = useSession()
  const [query, setQuery] = useState('')
  const [debouncedQuery] = useDebounce(query, 300)
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  
  const { data: searchResults, isLoading: isSearching } = useComponentSearch(debouncedQuery)
  const { data: recommendations, isLoading: isLoadingRecommendations } = useComponentRecommendations()

  const handleSelect = (componentId: string) => {
    const component = searchResults?.components?.find(c => c.id === componentId) || 
                     recommendations?.find(c => c.id === componentId)
    if (component) {
      setSelectedComponent(component)
      setShowDetailModal(true)
    }
  }

  const handleCloseSearch = () => {
    onOpenChange(false)
    setQuery('')
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'NEW': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      case 'GOOD': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
      case 'WORN': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
      case 'DAMAGED': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
      default: return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getAvailabilityColor = (available: number, total: number) => {
    const percentage = (available / total) * 100
    if (percentage > 50) return 'text-emerald-600 dark:text-emerald-400'
    if (percentage > 20) return 'text-amber-600 dark:text-amber-400'
    return 'text-red-600 dark:text-red-400'
  }

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, onOpenChange])

  return (
    <>
      {/* Main Search Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="overflow-hidden p-0 w-[95vw] max-w-2xl sm:w-full">
          <DialogHeader className="sr-only">
            <DialogTitle>Smart Component Search</DialogTitle>
            <DialogDescription>Search and discover components with smart recommendations</DialogDescription>
          </DialogHeader>
          
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Component Search</h3>
              <p className="text-xs text-muted-foreground">Find components quickly</p>
            </div>
          </div>

          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
            <div className="flex items-center border-b border-border px-4">
              <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Search components..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
                ⌘K
              </kbd>
            </div>

            <CommandList className="max-h-[400px] overflow-y-auto p-2">
              {query.length === 0 && (
                <CommandGroup heading="Recommendations">
                  {isLoadingRecommendations ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : recommendations && recommendations.length > 0 ? (
                    recommendations.map((component) => (
                      <CommandItem
                        key={component.id}
                        value={component.id}
                        onSelect={() => handleSelect(component.id)}
                        className="flex items-center justify-between p-3 cursor-pointer rounded-md mb-1.5"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-foreground truncate">{component.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {component.category}
                              </Badge>
                              <Badge variant="secondary" className={cn("text-xs", getConditionColor(component.condition))}>
                                {component.condition}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                          <Badge variant="secondary" className="text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            92%
                          </Badge>
                          <span className={cn("text-xs font-medium", getAvailabilityColor(component.availableStock, component.totalStock))}>
                            {component.availableStock}/{component.totalStock}
                          </span>
                        </div>
                      </CommandItem>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No components available</p>
                    </div>
                  )}
                </CommandGroup>
              )}

              {query.length > 0 && (
                <>
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                      {searchResults?.components && searchResults.components.length > 0 ? (
                        <CommandGroup heading="Search Results">
                          {searchResults.components.map((component) => (
                            <CommandItem
                              key={component.id}
                              value={component.id}
                              onSelect={() => handleSelect(component.id)}
                              className="flex items-center justify-between p-3 cursor-pointer rounded-md mb-1.5"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                                  <Package className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm text-foreground truncate">{component.name}</div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {component.category}
                                    </Badge>
                                    <Badge variant="secondary" className={cn("text-xs", getConditionColor(component.condition))}>
                                      {component.condition}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                                <Badge variant="secondary" className="text-xs">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  Match
                                </Badge>
                                <span className={cn("text-xs font-medium", getAvailabilityColor(component.availableStock, component.totalStock))}>
                                  {component.availableStock}/{component.totalStock}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      ) : (
                        <CommandEmpty>
                          <div className="text-center py-8">
                            <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm font-medium text-foreground mb-1">No components found</p>
                            <p className="text-xs text-muted-foreground">
                              Try different keywords
                            </p>
                          </div>
                        </CommandEmpty>
                      )}
                    </>
                  )}
                </>
              )}
            </CommandList>

            {query.length === 0 && (
              <div className="border-t border-border bg-muted/30 px-4 py-2.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Smart recommendations</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>Press</span>
                    <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border border-border bg-background px-1 font-mono text-[10px]">
                      ↵
                    </kbd>
                    <span>to select</span>
                  </div>
                </div>
              </div>
            )}
          </Command>
        </DialogContent>
      </Dialog>

      {/* Component Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="w-[95vw] max-w-4xl sm:w-full max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Component Details
            </DialogTitle>
            <DialogDescription>
              Comprehensive information about the selected component
            </DialogDescription>
          </DialogHeader>
          
          {selectedComponent && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {/* Left Column - Image and Basic Info */}
              <div className="space-y-4">
                {/* Compact image section - only show if image exists */}
                {selectedComponent.imageUrl && (
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={selectedComponent.imageUrl} 
                      alt={selectedComponent.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Small elegant placeholder if no image */}
                {!selectedComponent.imageUrl && (
                  <div className="flex items-center justify-center p-6 bg-muted/50 rounded-lg border-2 border-dashed border-muted-foreground/20">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Package className="h-12 w-12 mb-2 opacity-40" />
                      <p className="text-xs">No image available</p>
                    </div>
                  </div>
                )}
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Component Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Name</p>
                      <p className="font-semibold">{selectedComponent.name}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Model</p>
                        <p className="text-sm font-mono">
                          {selectedComponent.model || <span className="text-muted-foreground italic">Not specified</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Category</p>
                        <Badge variant="outline" className="text-xs">
                          {selectedComponent.category || 'Uncategorized'}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Manufacturer</p>
                        <p className="text-sm">
                          {selectedComponent.manufacturer || <span className="text-muted-foreground italic">Not specified</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">QR Code</p>
                        <p className="text-sm font-mono">
                          {selectedComponent.qrCode || <span className="text-muted-foreground italic">Not assigned</span>}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Specifications</p>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {selectedComponent.specifications || <span className="text-muted-foreground italic">No specifications available</span>}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Availability and Details */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Availability
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Available</p>
                        <p className="text-2xl font-bold text-primary">{selectedComponent.availableStock}</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Total Stock</p>
                        <p className="text-2xl font-bold text-primary">{selectedComponent.totalStock}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <span className="text-sm text-muted-foreground">Condition</span>
                      <Badge className={getConditionColor(selectedComponent.condition)}>
                        {selectedComponent.condition || 'Unknown'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Purchase Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Purchase Date</p>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {selectedComponent.purchaseDate && new Date(selectedComponent.purchaseDate).getFullYear() > 1971
                              ? formatDate(selectedComponent.purchaseDate)
                              : <span className="text-muted-foreground italic">Not recorded</span>
                            }
                          </p>
                        </div>
                      </div>
                      <div className="p-2 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Unit Cost</p>
                        <p className="text-lg font-bold">
                          {selectedComponent.cost && selectedComponent.cost > 0
                            ? `₹${selectedComponent.cost}`
                            : <span className="text-sm text-muted-foreground italic">N/A</span>
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-2 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Storage Location</p>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {selectedComponent.storageLocation || <span className="text-muted-foreground italic">Not specified</span>}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {selectedComponent.description || <span className="text-muted-foreground italic">No description available for this component.</span>}
                    </p>
                  </CardContent>
                </Card>

                <div className="flex gap-2">
                  {session?.user?.role === 'STUDENT' && (
                    <Button 
                      className="flex-1"
                      onClick={() => {
                        setShowDetailModal(false)
                        handleCloseSearch()
                        window.location.href = `/requests/new?component=${selectedComponent.id}`
                      }}
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Request Component
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDetailModal(false)}
                    className={session?.user?.role === 'STUDENT' ? '' : 'flex-1'}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export function SmartSearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="relative justify-start text-sm text-muted-foreground h-8 sm:h-9 px-2 sm:px-3 md:w-40 lg:w-64"
      onClick={onClick}
    >
      <Search className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline-flex lg:hidden">Search...</span>
      <span className="hidden lg:inline-flex">Search components...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 sm:h-6 select-none items-center gap-0.5 rounded border border-border bg-muted/50 px-1.5 font-sans text-[10px] sm:text-[11px] font-medium text-muted-foreground shadow-sm md:flex">
        <span className="text-xs">⌘</span>
        <span>K</span>
      </kbd>
    </Button>
  )
}