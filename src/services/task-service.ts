import { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '@/domain/task'

const TASKS_KEY = 'tasks'

export class TaskService {
  async getTasks(): Promise<Task[]> {
    const tasks = await window.spark.kv.get<Task[]>(TASKS_KEY)
    return tasks || []
  }

  async getTaskById(id: string): Promise<Task | null> {
    const tasks = await this.getTasks()
    return tasks.find(t => t.id === id) || null
  }

  async createTask(input: CreateTaskInput, userId: string): Promise<Task> {
    const tasks = await this.getTasks()
    
    const newTask: Task = {
      id: this.generateId(),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId
    }

    tasks.push(newTask)
    await window.spark.kv.set(TASKS_KEY, tasks)
    
    return newTask
  }

  async updateTask(input: UpdateTaskInput): Promise<Task> {
    const tasks = await this.getTasks()
    const index = tasks.findIndex(t => t.id === input.id)
    
    if (index === -1) {
      throw new Error('Task not found')
    }

    const updatedTask = {
      ...tasks[index],
      ...input,
      updatedAt: new Date().toISOString()
    }

    tasks[index] = updatedTask
    await window.spark.kv.set(TASKS_KEY, tasks)
    
    return updatedTask
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = await this.getTasks()
    const filtered = tasks.filter(t => t.id !== id)
    await window.spark.kv.set(TASKS_KEY, filtered)
  }

  async filterTasks(filters: TaskFilters): Promise<Task[]> {
    let tasks = await this.getTasks()

    if (filters.status && filters.status.length > 0) {
      tasks = tasks.filter(t => filters.status!.includes(t.status))
    }

    if (filters.priority && filters.priority.length > 0) {
      tasks = tasks.filter(t => filters.priority!.includes(t.priority))
    }

    if (filters.assigneeId && filters.assigneeId.length > 0) {
      tasks = tasks.filter(t => t.assigneeId && filters.assigneeId!.includes(t.assigneeId))
    }

    if (filters.search && filters.search.trim()) {
      const search = filters.search.toLowerCase()
      tasks = tasks.filter(t => 
        t.title.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search)
      )
    }

    return tasks
  }

  async bulkUpdateStatus(taskIds: string[], status: string): Promise<void> {
    const tasks = await this.getTasks()
    const updated = tasks.map(t => 
      taskIds.includes(t.id) 
        ? { ...t, status: status as any, updatedAt: new Date().toISOString() }
        : t
    )
    await window.spark.kv.set(TASKS_KEY, updated)
  }

  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const taskService = new TaskService()
