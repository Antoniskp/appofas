import { Task, TaskStatus } from '@/domain/task'
import { TaskCard } from './TaskCard'

interface TaskBoardProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
}

const STATUS_COLUMNS = [
  { status: TaskStatus.TODO, label: 'To Do' },
  { status: TaskStatus.IN_PROGRESS, label: 'In Progress' },
  { status: TaskStatus.IN_REVIEW, label: 'In Review' },
  { status: TaskStatus.DONE, label: 'Done' }
]

export function TaskBoard({ tasks, onEdit, onDelete, onStatusChange }: TaskBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {STATUS_COLUMNS.map(column => {
        const columnTasks = tasks.filter(t => t.status === column.status)
        
        return (
          <div key={column.status} className="flex flex-col">
            <div className="mb-4">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                {column.label}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {columnTasks.length} {columnTasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
            
            <div className="flex-1 space-y-3 min-h-[200px] p-3 rounded-lg bg-muted/30">
              {columnTasks.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                  No tasks
                </div>
              ) : (
                columnTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
