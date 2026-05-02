'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Plus, Folder, CheckCircle, Clock, Target, Trash2, Edit } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'in-progress' | 'completed'
  progress: number
  components: string[]
  deadline?: Date
  createdAt: Date
}

export function StudentProjectTracker() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'IoT Weather Station',
      description: 'Build a weather monitoring system with sensors',
      status: 'in-progress',
      progress: 65,
      components: ['Arduino Uno', 'DHT22 Sensor', 'LCD Display'],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    },
  ])
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '' })

  const addProject = () => {
    if (!newProject.name) return

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      status: 'planning',
      progress: 0,
      components: [],
      createdAt: new Date(),
    }

    setProjects([...projects, project])
    setNewProject({ name: '', description: '' })
    setShowNewProject(false)
  }

  const updateProgress = (id: string, progress: number) => {
    setProjects(projects.map(p => 
      p.id === id ? { ...p, progress, status: progress === 100 ? 'completed' : 'in-progress' } : p
    ))
  }

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-zinc-900 dark:text-gray-200'
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <Folder className="h-5 w-5 mr-2 text-blue-600" />
            My Projects
          </h3>
          <p className="text-sm text-gray-600 dark:text-zinc-300">
            Track your ongoing projects and components
          </p>
        </div>
        <Button size="sm" onClick={() => setShowNewProject(!showNewProject)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <AnimatePresence>
        {showNewProject && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-zinc-900"
          >
            <Input
              placeholder="Project name"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              className="mb-2"
            />
            <Input
              placeholder="Description (optional)"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="mb-2"
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={addProject}>Create</Button>
              <Button size="sm" variant="outline" onClick={() => setShowNewProject(false)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-zinc-300">
              No projects yet. Create your first project to get started!
            </p>
          </div>
        ) : (
          projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border rounded-lg hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{project.name}</h4>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  {project.description && (
                    <p className="text-sm text-gray-600 dark:text-zinc-300 mb-2">
                      {project.description}
                    </p>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button size="sm" variant="ghost" onClick={() => deleteProject(project.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-zinc-300">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
                <div className="flex items-center justify-between">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={project.progress}
                    onChange={(e) => updateProgress(project.id, parseInt(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-800"
                  />
                </div>
              </div>

              {project.components.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-500 mb-2">Components Used:</p>
                  <div className="flex flex-wrap gap-1">
                    {project.components.map((comp, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {comp}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {project.deadline && (
                <div className="mt-3 flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  Due: {project.deadline.toLocaleDateString()}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </Card>
  )
}
