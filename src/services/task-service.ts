import { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '@/domain/task'
import { supabase } from '@/services/supabase-client'
import { v4 as uuidv4 } from 'uuid'

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
    const { data, error } = await supabase
      .from(TASKS_KEY)
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data as Task | null
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
    const updates = Object.fromEntries(
      Object.entries({
        title: input.title,
        description: input.description,
        status: input.status,
        priority: input.priority,
        assigneeId: input.assigneeId,
        dueDate: input.dueDate
      }).filter(([, value]) => value !== undefined)
    ) as Partial<Task>

    updates.updatedAt = new Date().toISOString()

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
    let query = supabase
      .from(TASKS_KEY)
      .select('*')

    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status)
    }

    if (filters.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority)
    }

    if (filters.assigneeId && filters.assigneeId.length > 0) {
      query = query.in('assigneeId', filters.assigneeId)
    }

    const { data, error } = await query.order('createdAt', { ascending: false })

    if (error) {
      throw error
    }

    let tasks = (data ?? []) as Task[]

    if (filters.search && filters.search.trim()) {
      const search = filters.search.trim().toLowerCase()
      tasks = tasks.filter(task =>
        task.title.toLowerCase().includes(search)
        || task.description.toLowerCase().includes(search)
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
    return uuidv4()
  }
}

export const taskService = new TaskService()
