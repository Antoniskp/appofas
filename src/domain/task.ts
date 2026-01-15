export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId?: string
  assigneeName?: string
  assigneeAvatar?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface CreateTaskInput {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId?: string
  dueDate?: string
}

export interface UpdateTaskInput {
  id: string
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assigneeId?: string
  dueDate?: string
}

export interface TaskFilters {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  assigneeId?: string[]
  search?: string
}
