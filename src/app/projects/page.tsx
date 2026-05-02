'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import {
  Target,
  Plus,
  Calendar,
  Package,
  Clock,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

interface Project {
  id: string
  name: string
  description?: string
  startDate?: string
  endDate?: string
  status: string
  createdAt: string
  _count: {
    requests: number
  }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  // Delete confirmation states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [deleteCode, setDeleteCode] = useState('')
  const [userDeleteCode, setUserDeleteCode] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

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
      setLoading(false)
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
        await fetchProjects()
        setShowCreateDialog(false)
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

  // Generate random 6-character code
  const generateDeleteCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project)
    setDeleteCode(generateDeleteCode())
    setUserDeleteCode('')
    setShowDeleteDialog(true)
  }

  const handleDeleteProject = async () => {
    if (userDeleteCode !== deleteCode) {
      alert('Incorrect code. Please type the code exactly as shown.')
      return
    }

    if (!projectToDelete) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/projects/${projectToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchProjects()
        setShowDeleteDialog(false)
        setProjectToDelete(null)
        setDeleteCode('')
        setUserDeleteCode('')
        alert('Project deleted successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to delete project: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const getProjectStatus = (project: Project) => {
    if (!project.startDate || !project.endDate) {
      return { label: 'No Dates', color: 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-200' }
    }

    const now = new Date()
    const start = new Date(project.startDate)
    const end = new Date(project.endDate)

    if (now < start) {
      return { label: 'Upcoming', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200' }
    } else if (now > end) {
      return { label: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' }
    } else {
      return { label: 'In Progress', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200' }
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="My Projects"
          subtitle="Manage your projects and track component requests"
          rightContent={
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          }
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-zinc-400">Total Projects</p>
                      <p className="text-2xl font-bold text-blue-600">{projects.length}</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-zinc-400">Active Projects</p>
                      <p className="text-2xl font-bold text-green-600">
                        {projects.filter(p => {
                          if (!p.startDate || !p.endDate) return false
                          const now = new Date()
                          return now >= new Date(p.startDate) && now <= new Date(p.endDate)
                        }).length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-zinc-400">Total Requests</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {projects.reduce((sum, p) => sum + p._count.requests, 0)}
                      </p>
                    </div>
                    <Package className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Projects List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Projects</CardTitle>
                <CardDescription>
                  View and manage all your projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading projects...</p>
                  </div>
                ) : projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => {
                      const status = getProjectStatus(project)
                      return (
                        <div
                          key={project.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card text-card-foreground"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{project.name}</h3>
                              <Badge variant="outline" className={status.color}>
                                {status.label}
                              </Badge>
                            </div>
                            <Target className="h-5 w-5 text-blue-500" />
                          </div>

                          {project.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {project.description}
                            </p>
                          )}

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-400">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-zinc-400">
                              <Package className="h-4 w-4" />
                              <span>{project._count.requests} component requests</span>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                              onClick={() => handleDeleteClick(project)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      No projects yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first project to organize your component requests
                    </p>
                    <Button
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Create Project Dialog */}
        {showCreateDialog && (
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
                        min={startDate}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateDialog(false)
                      setNewProjectName('')
                      setNewProjectDescription('')
                      setStartDate('')
                      setEndDate('')
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

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && projectToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card text-card-foreground rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                    <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Delete Project
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                      You are about to delete:
                    </p>
                    <p className="font-semibold text-red-900 dark:text-red-100">
                      {projectToDelete.name}
                    </p>
                    {projectToDelete._count.requests > 0 && (
                      <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                        ⚠️ This project has {projectToDelete._count.requests} component request(s)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Type the following code to confirm deletion:
                    </label>
                    <div className="bg-gray-100 dark:bg-zinc-800 border-2 border-gray-300 dark:border-zinc-700 rounded-lg p-4 mb-3">
                      <p className="text-center text-2xl font-mono font-bold tracking-widest text-foreground select-all">
                        {deleteCode}
                      </p>
                    </div>
                    <Input
                      value={userDeleteCode}
                      onChange={(e) => setUserDeleteCode(e.target.value.toUpperCase())}
                      placeholder="Type the code here"
                      className="w-full text-center font-mono text-lg tracking-widest"
                      autoFocus
                    />
                    {userDeleteCode && userDeleteCode !== deleteCode && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Code doesn't match. Please type exactly as shown.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteDialog(false)
                      setProjectToDelete(null)
                      setDeleteCode('')
                      setUserDeleteCode('')
                    }}
                    disabled={isDeleting}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteProject}
                    disabled={userDeleteCode !== deleteCode || isDeleting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Project
                      </>
                    )}
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
