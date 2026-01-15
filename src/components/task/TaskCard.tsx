import { Task, TaskStatus, TaskPriority } from '@/domain/task'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { DotsThree, Trash, Pencil } from '@phosphor-icons/react'
import { format } from 'date-fns'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'bg-slate-100 text-slate-700 border-slate-200',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700 border-blue-200',
  [TaskStatus.IN_REVIEW]: 'bg-purple-100 text-purple-700 border-purple-200',
  [TaskStatus.DONE]: 'bg-green-100 text-green-700 border-green-200'
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'bg-gray-100 text-gray-600',
  [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-700',
  [TaskPriority.HIGH]: 'bg-orange-100 text-orange-700',
  [TaskPriority.URGENT]: 'bg-red-100 text-red-700'
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: 'To Do',
  [TaskStatus.IN_PROGRESS]: 'In Progress',
  [TaskStatus.IN_REVIEW]: 'In Review',
  [TaskStatus.DONE]: 'Done'
}

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'Low',
  [TaskPriority.MEDIUM]: 'Medium',
  [TaskPriority.HIGH]: 'High',
  [TaskPriority.URGENT]: 'Urgent'
}

export function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 group border-border">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="outline" className={STATUS_COLORS[task.status]}>
              {STATUS_LABELS[task.status]}
            </Badge>
            <Badge className={PRIORITY_COLORS[task.priority]}>
              {PRIORITY_LABELS[task.priority]}
            </Badge>
          </div>
          
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {task.assigneeName && (
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={task.assigneeAvatar} />
                  <AvatarFallback className="text-xs">
                    {task.assigneeName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{task.assigneeName}</span>
              </div>
            )}
            
            {task.dueDate && (
              <span>Due {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
            )}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <DotsThree className="h-4 w-4" weight="bold" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(task.id)}
              className="text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}
