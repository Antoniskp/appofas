import { useState, useEffect, useCallback } from 'react'
import { Task, TaskStatus, CreateTaskInput, UpdateTaskInput, TaskFilters } from '@/domain/task'
import { User } from '@/domain/user'
import { taskService } from '@/services/task-service'
import { authService } from '@/services/auth-service'
import { TaskBoard } from '@/components/task/TaskBoard'
import { TaskList } from '@/components/task/TaskList'
import { TaskFormDialog } from '@/components/task/TaskFormDialog'
import { AuthForm } from '@/components/auth/AuthForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Toaster } from '@/components/ui/sonner'
import { Plus, Kanban, ListBullets, MagnifyingGlass, Funnel, SignOut, User as UserIcon } from '@phosphor-icons/react'
import { toast } from 'sonner'

type ViewMode = 'board' | 'list'
type AppPage = 'tasks' | 'profile'

const DEFAULT_PAGE: AppPage = 'tasks'
const PAGE_PATHS: Record<AppPage, string> = {
  tasks: '/',
  profile: '/profile'
}

const getPageFromPath = (): AppPage => {
  if (typeof window === 'undefined') {
    return DEFAULT_PAGE
  }

  const rawPath = window.location.pathname || '/'
  const pathWithoutTrailingSlash = rawPath.replace(/\/+$/, '') || '/'

  return pathWithoutTrailingSlash.startsWith(PAGE_PATHS.profile) ? 'profile' : DEFAULT_PAGE
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('board')
  const [currentPage, setCurrentPage] = useState<AppPage>(getPageFromPath())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filters, setFilters] = useState<TaskFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const showTaskForm = currentPage === 'tasks' && isFormOpen

  const resetTaskForm = () => {
    setIsFormOpen(false)
    setEditingTask(null)
  }

  const loadUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Failed to restore session', error)
      toast.error('Unable to restore your session. Please sign in again.')
    } finally {
      setIsAuthLoading(false)
    }
  }, [])

  useEffect(() => {
    loadUser()

    const { data: { subscription } } = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser)
    })

    return () => subscription.unsubscribe()
  }, [loadUser])

  useEffect(() => {
    if (user) {
      loadTasks()
    } else {
      setTasks([])
      setFilteredTasks([])
    }
  }, [user])

  useEffect(() => {
    applyFilters()
  }, [tasks, filters, searchQuery])

  useEffect(() => {
    const handlePopState = () => {
      const nextPage = getPageFromPath()
      setCurrentPage(nextPage)
      resetTaskForm()
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const loadTasks = async () => {
    setIsLoading(true)
    try {
      const allTasks = await taskService.getTasks()
      setTasks(allTasks)
    } catch (error) {
      toast.error('Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = async () => {
    const filtered = await taskService.filterTasks({
      ...filters,
      search: searchQuery
    })
    setFilteredTasks(filtered)
  }

  const handleCreateTask = async (data: CreateTaskInput) => {
    try {
      const newTask = await taskService.createTask(data, user?.id || 'anonymous')
      setTasks([...tasks, newTask])
      toast.success('Task created successfully')
    } catch (error) {
      toast.error('Failed to create task')
    }
  }

  const handleUpdateTask = async (data: CreateTaskInput) => {
    if (!editingTask) return
    
    try {
      const updateData: UpdateTaskInput = {
        id: editingTask.id,
        ...data
      }
      const updated = await taskService.updateTask(updateData)
      setTasks(tasks.map(t => t.id === updated.id ? updated : t))
      toast.success('Task updated successfully')
      setEditingTask(null)
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id)
      setTasks(tasks.filter(t => t.id !== id))
      toast.success('Task deleted successfully')
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try {
      const updated = await taskService.updateTask({ id, status })
      setTasks(tasks.map(t => t.id === updated.id ? updated : t))
      toast.success('Status updated')
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleSignOut = async () => {
    try {
      await authService.signOut()
      setUser(null)
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  const handleCloseForm = () => {
    resetTaskForm()
  }

  const navigate = (page: AppPage) => {
    if (page === currentPage) return
    const nextPath = PAGE_PATHS[page]
    window.history.pushState({}, '', nextPath)
    setCurrentPage(page)
    resetTaskForm()
  }

  if (isAuthLoading) {
    return (
      <>
        <Toaster position="top-right" />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground">Loading session...</div>
        </div>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <Toaster position="top-right" />
        <AuthForm />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Kanban className="w-6 h-6 text-primary-foreground" weight="bold" />
              </div>
              <h1 className="text-2xl font-bold">TaskFlow</h1>
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>{user.login.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline">{user.login}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    <UserIcon className="mr-2 h-4 w-4" />
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => navigate('profile')}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleSignOut}>
                    <SignOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {currentPage === 'profile' ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-1">Profile</h2>
                <p className="text-muted-foreground">Your account details and access level.</p>
              </div>
              <Button variant="outline" onClick={() => navigate('tasks')}>
                Back to Tasks
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>{user.login.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xl font-semibold">{user.login}</p>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium">{user.isOwner ? 'Owner' : 'Member'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">User ID</p>
                  <p className="font-medium break-all">{user.id}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold mb-1">My Tasks</h2>
                <p className="text-muted-foreground">
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                  <TabsList>
                    <TabsTrigger value="board" className="gap-2">
                      <Kanban className="w-4 h-4" />
                      <span className="hidden sm:inline">Board</span>
                    </TabsTrigger>
                    <TabsTrigger value="list" className="gap-2">
                      <ListBullets className="w-4 h-4" />
                      <span className="hidden sm:inline">List</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <Button onClick={() => setIsFormOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" weight="bold" />
                  New Task
                </Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Select
                  value={filters.status?.[0] || 'all'}
                  onValueChange={(v) => setFilters({ ...filters, status: v === 'all' ? undefined : [v as TaskStatus] })}
                >
                  <SelectTrigger className="w-[140px]">
                    <Funnel className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value={TaskStatus.TODO}>To Do</SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
                    <SelectItem value={TaskStatus.DONE}>Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading tasks...</div>
              </div>
            ) : viewMode === 'board' ? (
              <TaskBoard
                tasks={filteredTasks}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            ) : (
              <TaskList
                tasks={filteredTasks}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
              />
            )}
          </div>
        )}
      </main>

      <TaskFormDialog
        open={showTaskForm}
        onClose={handleCloseForm}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
      />
    </div>
  )
}
