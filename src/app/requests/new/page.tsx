'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import {
  Search,
  Package,
  Plus,
  Minus,
  ArrowLeft,
  Send,
  Info,
  Filter,
  Grid,
  List,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  Target,
  Calendar,
  User,
} from 'lucide-react'
import { useComponents } from '@/lib/hooks/use-components'
import { useCreateRequest } from '@/lib/hooks/use-requests'

interface SelectedComponent {
  id: string
  name: string
  category: string
  manufacturer?: string
  availableStock: number
  maxQuantity: number
  selectedQuantity: number
}

export default function NewRequestPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponent[]>([])
  const [purpose, setPurpose] = useState('')
  const [expectedDuration, setExpectedDuration] = useState(180) // Default 6 months (180 days)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  // New project and date states
  const [selectedProject, setSelectedProject] = useState('OTHER')
  const [projects, setProjects] = useState<any[]>([])
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loadingProjects, setLoadingProjects] = useState(true)

  const { data: componentsData, isLoading } = useComponents({
    search: searchTerm,
    category: selectedCategory === 'ALL' ? undefined : selectedCategory,
  })

  const createRequestMutation = useCreateRequest()

  // Load projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects')
        if (response.ok) {
          const data = await response.json()
          setProjects(data.projects || [])
        }
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoadingProjects(false)
      }
    }
    fetchProjects()
  }, [])

  // Calculate duration from dates
  const calculateDuration = () => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      if (diffDays > 0) {
        setExpectedDuration(diffDays)
      }
    }
  }

  // Update duration when dates change
  useEffect(() => {
    calculateDuration()
  }, [startDate, endDate])

  const categories = ['ALL', 'MICROCONTROLLER', 'SENSOR', 'BREADBOARD', 'MOTOR', 'DISPLAY', 'IC', 'WIRE']

  // Calculate statistics
  const stats = {
    totalComponents: componentsData?.components?.length || 0,
    availableComponents: componentsData?.components?.filter(c => c.availableStock > 0).length || 0,
    selectedItems: selectedComponents.reduce((sum, c) => sum + c.selectedQuantity, 0),
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'MICROCONTROLLER': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200',
      'SENSOR': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200',
      'DISPLAY': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200',
      'MOTOR': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200',
      'BREADBOARD': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200',
      'IC': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200',
      'WIRE': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200',
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-200'
  }

  const getAvailabilityStatus = (available: number, total: number) => {
    const percentage = (available / total) * 100
    if (percentage >= 80) return { status: 'High', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/20' }
    if (percentage >= 50) return { status: 'Medium', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' }
    if (percentage >= 20) return { status: 'Low', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/20' }
    return { status: 'Critical', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/20' }
  }

  // Calculate priority: anything > 6 months (180 days) is High Priority
  const getPriorityLevel = (partsCount: number, durationDays: number) => {
    if (durationDays > 180) { // 6 months = 180 days
      return { level: 'High', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/20' }
    }
    return { level: 'Normal', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/20' }
  }

  // Duration options in days (converted from months for display)
  const durationOptions = [
    { value: 180, label: '6 Months' },   // 6 * 30 = 180 days
    { value: 360, label: '12 Months' },  // 12 * 30 = 360 days
    { value: 540, label: '18 Months' },  // 18 * 30 = 540 days
    { value: 720, label: '24 Months' },  // 24 * 30 = 720 days
  ]

  const addComponent = (component: any) => {
    const existing = selectedComponents.find(c => c.id === component.id)
    if (existing) {
      if (existing.selectedQuantity < existing.maxQuantity) {
        setSelectedComponents(prev =>
          prev.map(c =>
            c.id === component.id
              ? { ...c, selectedQuantity: c.selectedQuantity + 1 }
              : c
          )
        )
      }
    } else {
      setSelectedComponents(prev => [
        ...prev,
        {
          id: component.id,
          name: component.name,
          category: component.category,
          manufacturer: component.manufacturer,
          availableStock: component.availableStock,
          maxQuantity: Math.min(component.availableStock, component.availableStock), // Can request up to available stock
          selectedQuantity: 1,
        }
      ])
    }
  }

  const removeComponent = (componentId: string) => {
    setSelectedComponents(prev => prev.filter(c => c.id !== componentId))
  }

  const updateQuantity = (componentId: string, change: number) => {
    setSelectedComponents(prev =>
      prev.map(c => {
        if (c.id === componentId) {
          const newQuantity = c.selectedQuantity + change
          if (newQuantity >= 1 && newQuantity <= c.maxQuantity) {
            return { ...c, selectedQuantity: newQuantity }
          }
        }
        return c
      })
    )
  }

  const handleSubmit = async () => {
    if (selectedComponents.length === 0) {
      alert('Please select at least one component')
      return
    }

    // Validate based on selection type
    if (selectedProject === 'OTHER') {
      // For "Other": require purpose and dates
      if (purpose.length < 10) {
        alert('Please provide a detailed purpose (at least 10 characters)')
        return
      }
      if (!startDate || !endDate) {
        alert('Please select start and end dates')
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Auto-fill purpose for project-based requests
      const requestPurpose = selectedProject === 'OTHER' 
        ? purpose 
        : `Project: ${projects.find(p => p.id === selectedProject)?.name || 'Unknown Project'}`

      // Calculate duration in DAYS (not months) - this is what the backend expects
      let durationInDays = expectedDuration
      if (selectedProject === 'OTHER' && startDate && endDate) {
        const start = new Date(startDate)
        const end = new Date(endDate)
        durationInDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      }

      // Submit each component as a separate request
      for (const component of selectedComponents) {
        await createRequestMutation.mutateAsync({
          componentId: component.id,
          quantity: component.selectedQuantity,
          purpose: requestPurpose,
          expectedDuration: durationInDays, // Send days, not months
          projectId: selectedProject !== 'OTHER' ? selectedProject : undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        })
      }

      router.push('/requests/my-requests')
    } catch (error) {
      console.error('Error submitting requests:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      alert('Please enter a project name')
      return
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDescription,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      })

      if (response.ok) {
        const newProject = await response.json()
        setProjects([...projects, newProject])
        setSelectedProject(newProject.id)
        setShowNewProjectDialog(false)
        setNewProjectName('')
        setNewProjectDescription('')
        setStartDate('')
        setEndDate('')
        alert('Project created successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to create project: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project. Please try again.')
    }
  }

  const filteredComponents = componentsData?.components || []

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="New Request"
          subtitle={`Request components for your project • ${stats.availableComponents} components available`}
          rightContent={
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          }
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Enhanced Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-zinc-400">Available Components</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.availableComponents}</p>
                      <p className="text-xs text-muted-foreground">Ready to request</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-zinc-400">Selected Items</p>
                      <p className="text-2xl font-bold text-green-600">{stats.selectedItems}</p>
                      <p className="text-xs text-muted-foreground">In your request</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              </Card>

              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-zinc-400">Request Priority</p>
                      <p className={`text-2xl font-bold ${getPriorityLevel(stats.selectedItems, expectedDuration).color}`}>
                        {getPriorityLevel(stats.selectedItems, expectedDuration).level}
                      </p>
                      <p className="text-xs text-muted-foreground">{stats.selectedItems} parts, {Math.ceil(expectedDuration / 30)} months</p>
                    </div>
                    <Target className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Enhanced Component Selection */}
              <div className="lg:col-span-2 space-y-6">
                {/* Enhanced Search and Filters */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search components by name, manufacturer, or specifications..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowFilters(!showFilters)}
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          Filters
                        </Button>
                        <Button
                          variant={viewMode === 'grid' ? "default" : "outline"}
                          size="sm"
                          onClick={() => setViewMode('grid')}
                        >
                          <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={viewMode === 'list' ? "default" : "outline"}
                          size="sm"
                          onClick={() => setViewMode('list')}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {showFilters && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800">
                        <div className="flex flex-wrap gap-2">
                          {categories.map(category => (
                            <Button
                              key={category}
                              variant={selectedCategory === category ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedCategory(category)}
                            >
                              {category === 'ALL' ? 'All Categories' : category.replace('_', ' ')}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Enhanced Available Components */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Available Components</CardTitle>
                        <CardDescription>
                          Select components you need for your project
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {filteredComponents.length} available
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading components...</p>
                      </div>
                    ) : filteredComponents.length > 0 ? (
                      <div className={viewMode === 'grid' 
                        ? "grid grid-cols-1 md:grid-cols-2 gap-4"
                        : "space-y-4"
                      }>
                        {filteredComponents.map((component) => {
                          const availability = getAvailabilityStatus(component.availableStock, component.totalStock)
                          const isSelected = selectedComponents.some(c => c.id === component.id)
                          
                          return (
                            <div
                              key={component.id}
                              className={`border rounded-lg p-4 transition-all duration-200 ${
                                isSelected 
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                  : 'hover:bg-gray-50 dark:hover:bg-zinc-800 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h3 className="font-medium">{component.name}</h3>
                                  <p className="text-sm text-muted-foreground">{component.manufacturer}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className={getCategoryColor(component.category)}>
                                      {component.category}
                                    </Badge>
                                    <Badge 
                                      variant="outline" 
                                      className={`${availability.bgColor} ${availability.color} border-0 font-semibold`}
                                    >
                                      {component.availableStock > 0 ? '✓ Available' : '✗ Out of Stock'}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground mb-1">In Stock</p>
                                  <p className={`font-bold text-2xl ${availability.color}`}>
                                    {component.availableStock}
                                  </p>
                                  <p className="text-xs text-gray-400">of {component.totalStock}</p>
                                </div>
                              </div>
                              
                              {/* Availability Progress */}
                              <div className={`p-2 rounded mb-3 ${availability.bgColor}`}>
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span>Stock Level</span>
                                  <span>{Math.round((component.availableStock / component.totalStock) * 100)}%</span>
                                </div>
                                <Progress 
                                  value={(component.availableStock / component.totalStock) * 100} 
                                  className="h-1" 
                                />
                              </div>
                              
                              {component.specifications && (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {component.specifications}
                                </p>
                              )}
                              
                              <Button
                                size="sm"
                                onClick={() => addComponent(component)}
                                disabled={isSelected || component.availableStock === 0}
                                className={`w-full ${
                                  isSelected 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : component.availableStock === 0
                                    ? 'bg-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                              >
                                {isSelected ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Added to Request
                                  </>
                                ) : component.availableStock === 0 ? (
                                  <>
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    Out of Stock
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add to Request
                                  </>
                                )}
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No components found</h3>
                        <p className="text-muted-foreground">
                          Try adjusting your search terms or filters
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Request Summary */}
              <div className="space-y-6">
                {/* Selected Components */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Selected Components</CardTitle>
                        <CardDescription>
                          Components in your request
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        {selectedComponents.length} items
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedComponents.length > 0 ? (
                      <div className="space-y-4">
                        {selectedComponents.map((component) => (
                          <div key={component.id} className="border rounded-lg p-4 bg-card text-card-foreground/50">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{component.name}</h4>
                                <p className="text-xs text-muted-foreground">{component.category}</p>
                                <Badge variant="outline" className="mt-1 text-xs">
                                  Max: {component.maxQuantity}
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeComponent(component.id)}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                              >
                                ×
                              </Button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(component.id, -1)}
                                  disabled={component.selectedQuantity <= 1}
                                  className="h-6 w-6 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-medium w-8 text-center">
                                  {component.selectedQuantity}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(component.id, 1)}
                                  disabled={component.selectedQuantity >= component.maxQuantity}
                                  className="h-6 w-6 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Available: {component.maxQuantity}
                              </span>
                            </div>
                          </div>
                        ))}
                        
                        {/* Request Summary */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Request Summary</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-blue-700 dark:text-blue-300">Total Items:</span>
                              <span className="font-medium text-blue-900 dark:text-blue-100">{stats.selectedItems}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-700 dark:text-blue-300">Components:</span>
                              <span className="font-medium text-blue-900 dark:text-blue-100">{selectedComponents.length}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No components selected</p>
                        <p className="text-xs">Add components from the list to get started</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Enhanced Request Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Request Details</CardTitle>
                    <CardDescription>
                      Provide information about your request
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Project Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Project
                      </label>
                      <select
                        value={selectedProject}
                        onChange={(e) => {
                          if (e.target.value === 'CREATE_NEW') {
                            setShowNewProjectDialog(true)
                          } else {
                            setSelectedProject(e.target.value)
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-card text-card-foreground appearance-none pr-10 bg-no-repeat bg-right"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.5rem center',
                          backgroundSize: '1.5em 1.5em'
                        }}
                      >
                        <option value="OTHER">Other (Single Parts)</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                        <option value="CREATE_NEW">+ Create New Project</option>
                      </select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedProject === 'OTHER' 
                          ? 'Requesting individual components without a project'
                          : 'Components will be linked to this project'}
                      </p>
                    </div>

                    {/* For Projects: Show month dropdown */}
                    {selectedProject !== 'OTHER' && selectedProject !== 'CREATE_NEW' && (
                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Project Duration (Months)
                        </label>
                        <select
                          value={expectedDuration}
                          onChange={(e) => setExpectedDuration(parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md bg-card text-card-foreground appearance-none pr-10 bg-no-repeat bg-right"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 0.5rem center',
                            backgroundSize: '1.5em 1.5em'
                          }}
                        >
                          {durationOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-muted-foreground">
                            Select project duration
                          </p>
                          <div className={`px-2 py-1 rounded text-xs ${getPriorityLevel(stats.selectedItems, expectedDuration).bgColor} ${getPriorityLevel(stats.selectedItems, expectedDuration).color}`}>
                            {getPriorityLevel(stats.selectedItems, expectedDuration).level} Priority
                          </div>
                        </div>
                      </div>
                    )}

                    {/* For "Other": Show date pickers */}
                    {selectedProject === 'OTHER' && (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Start Date <span className="text-red-500">*</span>
                            </label>
                            <Input
                              type="date"
                              value={startDate}
                              onChange={(e) => {
                                setStartDate(e.target.value)
                              }}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              End Date <span className="text-red-500">*</span>
                            </label>
                            <Input
                              type="date"
                              value={endDate}
                              onChange={(e) => {
                                setEndDate(e.target.value)
                              }}
                              min={startDate || new Date().toISOString().split('T')[0]}
                              className="w-full"
                              required
                            />
                          </div>
                        </div>

                        {/* Auto-calculated Duration Display */}
                        {startDate && endDate && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                  Duration: {Math.ceil(expectedDuration / 30)} months ({expectedDuration} days)
                                </span>
                              </div>
                              <div className={`px-2 py-1 rounded text-xs ${getPriorityLevel(stats.selectedItems, Math.ceil(expectedDuration / 30)).bgColor} ${getPriorityLevel(stats.selectedItems, Math.ceil(expectedDuration / 30)).color}`}>
                                {getPriorityLevel(stats.selectedItems, Math.ceil(expectedDuration / 30)).level} Priority
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Purpose - Only show for "Other (Single Parts)" */}
                    {selectedProject === 'OTHER' && (
                      <div>
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Purpose <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          placeholder="Describe the purpose of your request in detail (minimum 10 characters)"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md resize-none bg-card text-card-foreground text-foreground"
                          rows={4}
                          required
                        />
                        <div className="flex items-center justify-between mt-1">
                          <p className={`text-xs ${purpose.length >= 10 ? 'text-green-600' : 'text-gray-500'} dark:text-zinc-400`}>
                            {purpose.length}/10 minimum characters
                          </p>
                          {purpose.length >= 10 && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Project Info - Show when project is selected */}
                    {selectedProject !== 'OTHER' && selectedProject !== 'CREATE_NEW' && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Target className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                              Project Request
                            </p>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              Components will be linked to: <span className="font-semibold">
                                {projects.find(p => p.id === selectedProject)?.name}
                              </span>
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              Purpose will be automatically set based on your project
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Enhanced Guidelines */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-amber-800 dark:text-amber-200">
                          <p className="font-medium mb-2">Important Guidelines:</p>
                          <ul className="text-xs space-y-1">
                            <li>• Return components on time to maintain good standing</li>
                            <li>• Report any damaged components immediately</li>
                            <li>• Handle all components with proper care</li>
                            <li>• Follow lab safety protocols at all times</li>
                            <li>• Requests are subject to HOD approval</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Submit Button */}
                    <div className="space-y-3">
                      <Button
                        onClick={handleSubmit}
                        disabled={
                          selectedComponents.length === 0 || 
                          (selectedProject === 'OTHER' && purpose.length < 10) ||
                          isSubmitting
                        }
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting Request...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Submit Request ({selectedComponents.length} items)
                          </>
                        )}
                      </Button>
                      
                      {selectedComponents.length === 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <AlertCircle className="h-4 w-4" />
                          <span>Please select at least one component</span>
                        </div>
                      )}
                      
                      {selectedProject === 'OTHER' && purpose.length < 10 && selectedComponents.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <AlertCircle className="h-4 w-4" />
                          <span>Please provide a detailed purpose</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        {/* Create New Project Dialog */}
        {showNewProjectDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card text-card-foreground rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Create New Project
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Project Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="e.g., IoT Home Automation"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      placeholder="Brief description of your project"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md resize-none bg-card text-card-foreground text-foreground"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNewProjectDialog(false)
                      setNewProjectName('')
                      setNewProjectDescription('')
                      setSelectedProject('OTHER')
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Create Project
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}