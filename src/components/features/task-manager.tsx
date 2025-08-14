"use client"

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Calendar, Filter, Search, Clock, AlertCircle, CheckCircle2, Edit2, Trash2, GripVertical, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface Task {
  id: string
  title: string
  description?: string
  dueDate?: Date
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  createdAt: Date
}

interface TaskFormData {
  title: string
  description: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
}

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Complete React project',
    description: 'Finish the task management component with all required features',
    dueDate: new Date('2024-01-15'),
    priority: 'high',
    completed: false,
    createdAt: new Date('2024-01-10')
  },
  {
    id: '2',
    title: 'Study for algorithms exam',
    description: 'Review sorting algorithms and data structures',
    dueDate: new Date('2024-01-20'),
    priority: 'medium',
    completed: false,
    createdAt: new Date('2024-01-12')
  },
  {
    id: '3',
    title: 'Buy groceries',
    description: '',
    dueDate: new Date('2024-01-14'),
    priority: 'low',
    completed: true,
    createdAt: new Date('2024-01-13')
  }
]

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-orange-500',
  low: 'bg-green-500'
}

const priorityLabels = {
  high: 'High',
  medium: 'Medium',
  low: 'Low'
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [currentView, setCurrentView] = useState<'all' | 'today' | 'upcoming' | 'completed'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'created'>('date')
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium'
  })

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      priority: 'medium'
    })
  }, [])

  const handleCreateTask = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    const newTask: Task = {
      id: Date.now().toString(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      priority: formData.priority,
      completed: false,
      createdAt: new Date()
    }

    setTasks(prev => [newTask, ...prev])
    setIsCreateDialogOpen(false)
    resetForm()
    setIsLoading(false)
  }, [formData, resetForm])

  const handleUpdateTask = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask || !formData.title.trim()) return

    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    setTasks(prev => prev.map(task => 
      task.id === editingTask.id 
        ? {
            ...task,
            title: formData.title.trim(),
            description: formData.description.trim(),
            dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
            priority: formData.priority
          }
        : task
    ))

    setEditingTask(null)
    resetForm()
    setIsLoading(false)
  }, [editingTask, formData, resetForm])

  const handleToggleComplete = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }, [])

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }, [])

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : '',
      priority: task.priority
    })
  }, [])

  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter(task => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!task.title.toLowerCase().includes(query) && 
            !task.description?.toLowerCase().includes(query)) {
          return false
        }
      }

      // View filter
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      switch (currentView) {
        case 'today':
          return task.dueDate && 
                 task.dueDate >= today && 
                 task.dueDate < tomorrow && 
                 !task.completed
        case 'upcoming':
          return task.dueDate && task.dueDate >= tomorrow && !task.completed
        case 'completed':
          return task.completed
        default:
          return true
      }
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return a.dueDate.getTime() - b.dueDate.getTime()
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [tasks, searchQuery, currentView, sortBy])

  const getDateStatus = useCallback((dueDate?: Date) => {
    if (!dueDate) return null
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const taskDate = new Date(dueDate)
    taskDate.setHours(0, 0, 0, 0)
    
    const diffTime = taskDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { status: 'overdue', label: 'Overdue', color: 'text-red-500' }
    if (diffDays === 0) return { status: 'today', label: 'Due today', color: 'text-orange-500' }
    if (diffDays === 1) return { status: 'tomorrow', label: 'Due tomorrow', color: 'text-blue-500' }
    return { status: 'upcoming', label: `Due in ${diffDays} days`, color: 'text-text-secondary' }
  }, [])

  const viewCounts = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return {
      all: tasks.length,
      today: tasks.filter(task => 
        task.dueDate && 
        task.dueDate >= today && 
        task.dueDate < tomorrow && 
        !task.completed
      ).length,
      upcoming: tasks.filter(task => 
        task.dueDate && 
        task.dueDate >= tomorrow && 
        !task.completed
      ).length,
      completed: tasks.filter(task => task.completed).length
    }
  }, [tasks])

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">Task Manager</h1>
            <p className="text-sm text-text-secondary mt-1">
              Stay organized and productive with your tasks
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-surface hover:bg-accent text-text-primary border border-border">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-surface border-border">
              <DialogHeader>
                <DialogTitle className="text-text-primary">Create New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-text-primary">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title..."
                    className="bg-background border-border text-text-primary"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-text-primary">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter task description..."
                    className="bg-background border-border text-text-primary resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dueDate" className="text-text-primary">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="bg-background border-border text-text-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-text-primary">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setFormData(prev => ({ ...prev, priority: value }))
                    }>
                      <SelectTrigger className="bg-background border-border text-text-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-surface border-border">
                        <SelectItem value="low" className="text-text-primary hover:bg-accent">Low</SelectItem>
                        <SelectItem value="medium" className="text-text-primary hover:bg-accent">Medium</SelectItem>
                        <SelectItem value="high" className="text-text-primary hover:bg-accent">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="bg-background border-border text-text-primary hover:bg-accent"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !formData.title.trim()}
                    className="bg-interactive hover:bg-accent text-background"
                  >
                    {isLoading ? 'Creating...' : 'Create Task'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Search */}
        <Card className="bg-surface border-border">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* View Tabs */}
              <div className="flex gap-1 bg-background rounded-lg p-1">
                {[
                  { value: 'all', label: 'All', count: viewCounts.all },
                  { value: 'today', label: 'Today', count: viewCounts.today },
                  { value: 'upcoming', label: 'Upcoming', count: viewCounts.upcoming },
                  { value: 'completed', label: 'Completed', count: viewCounts.completed }
                ].map((view) => (
                  <button
                    key={view.value}
                    onClick={() => setCurrentView(view.value as any)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentView === view.value
                        ? 'bg-accent text-background'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {view.label}
                    {view.count > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-border text-text-secondary">
                        {view.count}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>

              {/* Search and Sort */}
              <div className="flex gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background border-border text-text-primary"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-background border-border text-text-primary hover:bg-accent">
                      <Filter className="w-4 h-4 mr-2" />
                      Sort
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-surface border-border">
                    <DropdownMenuLabel className="text-text-primary">Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem 
                      onClick={() => setSortBy('date')}
                      className="text-text-primary hover:bg-accent"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Due Date
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSortBy('priority')}
                      className="text-text-primary hover:bg-accent"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Priority
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setSortBy('created')}
                      className="text-text-primary hover:bg-accent"
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Created Date
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-12"
              >
                <div className="bg-surface border border-border rounded-lg p-8 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-text-muted" />
                  </div>
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    {currentView === 'completed' ? 'No completed tasks' : 'No tasks found'}
                  </h3>
                  <p className="text-text-secondary mb-4">
                    {currentView === 'completed' 
                      ? 'Complete some tasks to see them here.'
                      : searchQuery 
                        ? 'Try adjusting your search or filters.'
                        : 'Create your first task to get started.'
                    }
                  </p>
                  {!searchQuery && currentView === 'all' && (
                    <Button 
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="bg-interactive hover:bg-accent text-background"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Task
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : (
              filteredAndSortedTasks.map((task) => {
                const dateStatus = getDateStatus(task.dueDate)
                
                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={`bg-surface border-border hover:border-accent transition-colors group ${
                      task.completed ? 'opacity-60' : ''
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Drag Handle */}
                          <div className="opacity-0 group-hover:opacity-50 transition-opacity cursor-grab">
                            <GripVertical className="w-4 h-4 text-text-muted" />
                          </div>

                          {/* Checkbox */}
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={() => handleToggleComplete(task.id)}
                            className="mt-1 border-border data-[state=checked]:bg-interactive data-[state=checked]:border-interactive"
                          />

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-medium text-text-primary ${
                                  task.completed ? 'line-through' : ''
                                }`}>
                                  {task.title}
                                </h3>
                                {task.description && (
                                  <p className={`text-sm text-text-secondary mt-1 ${
                                    task.completed ? 'line-through' : ''
                                  }`}>
                                    {task.description}
                                  </p>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditTask(task)}
                                  className="h-8 w-8 p-0 hover:bg-accent text-text-muted hover:text-text-primary"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="h-8 w-8 p-0 hover:bg-red-500/10 text-text-muted hover:text-red-500"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Meta Info */}
                            <div className="flex items-center gap-4 mt-3">
                              {/* Priority */}
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`} />
                                <span className="text-xs text-text-secondary">
                                  {priorityLabels[task.priority]}
                                </span>
                              </div>

                              {/* Due Date */}
                              {dateStatus && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-text-muted" />
                                  <span className={`text-xs ${dateStatus.color}`}>
                                    {dateStatus.label}
                                  </span>
                                </div>
                              )}

                              {/* Created Date */}
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-text-muted" />
                                <span className="text-xs text-text-muted">
                                  {task.createdAt.toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>

        {/* Edit Task Dialog */}
        <Dialog open={editingTask !== null} onOpenChange={(open) => !open && setEditingTask(null)}>
          <DialogContent className="bg-surface border-border">
            <DialogHeader>
              <DialogTitle className="text-text-primary">Edit Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-text-primary">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title..."
                  className="bg-background border-border text-text-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-text-primary">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter task description..."
                  className="bg-background border-border text-text-primary resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-dueDate" className="text-text-primary">Due Date</Label>
                  <Input
                    id="edit-dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="bg-background border-border text-text-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-priority" className="text-text-primary">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setFormData(prev => ({ ...prev, priority: value }))
                  }>
                    <SelectTrigger className="bg-background border-border text-text-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-surface border-border">
                      <SelectItem value="low" className="text-text-primary hover:bg-accent">Low</SelectItem>
                      <SelectItem value="medium" className="text-text-primary hover:bg-accent">Medium</SelectItem>
                      <SelectItem value="high" className="text-text-primary hover:bg-accent">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingTask(null)}
                  className="bg-background border-border text-text-primary hover:bg-accent"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || !formData.title.trim()}
                  className="bg-interactive hover:bg-accent text-background"
                >
                  {isLoading ? 'Updating...' : 'Update Task'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}