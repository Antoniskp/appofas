import { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '@/domain/task'
import { supabase } from '@/services/supabase-client'

const TASKS_KEY = 'tasks'

export class TaskService {
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from(TASKS_KEY)
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) {
      throw error
    }

    return (data ?? []) as Task[]
  }

  async getTaskById(id: string): Promise<Task | null> {
    const tasks = await this.getTasks()
    return tasks.find(t => t.id === id) || null
  }

  async createTask(input: CreateTaskInput, userId: string): Promise<Task> {
    const newTask: Task = {
      id: this.generateId(),
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId
    }

    const { data, error } = await supabase
      .from(TASKS_KEY)
      .insert(newTask)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Task
  }

  async updateTask(input: UpdateTaskInput): Promise<Task> {
    const updates: Partial<Task> = {
      updatedAt: new Date().toISOString()
    }

    if (input.title !== undefined) updates.title = input.title
    if (input.description !== undefined) updates.description = input.description
    if (input.status !== undefined) updates.status = input.status
    if (input.priority !== undefined) updates.priority = input.priority
    if (input.assigneeId !== undefined) updates.assigneeId = input.assigneeId
    if (input.dueDate !== undefined) updates.dueDate = input.dueDate

    const { data, error } = await supabase
      .from(TASKS_KEY)
      .update(updates)
      .eq('id', input.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Task
  }

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from(TASKS_KEY)
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
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
    const { error } = await supabase
      .from(TASKS_KEY)
      .update({ status, updatedAt: new Date().toISOString() })
      .in('id', taskIds)

    if (error) {
      throw error
    }
  }

  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

export const taskService = new TaskService()
