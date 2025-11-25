import { useState } from 'react'
import { CheckCircle, Circle, Clock, AlertCircle, Edit2, Trash2, Calendar } from 'lucide-react'
import { taskService } from '@/services'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const TaskItem = ({ task, onEdit, onDelete, onUpdate }) => {
    const [updating, setUpdating] = useState(false)

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'text-red-600 bg-red-100 dark:bg-red-900/20'
            case 'medium':
                return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
            case 'low':
                return 'text-green-600 bg-green-100 dark:bg-green-900/20'
            default:
                return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-600" />
            case 'in_progress':
                return <Clock className="h-5 w-5 text-blue-600" />
            default:
                return <Circle className="h-5 w-5 text-gray-400" />
        }
    }

    const handleToggleStatus = async () => {
        setUpdating(true)
        try {
            const newStatus = task.status === 'completed' ? 'todo' : 'completed'
            await taskService.updateTaskStatus(task.id, newStatus)
            toast.success(`Task marked as ${newStatus === 'completed' ? 'completed' : 'incomplete'}`)
            onUpdate()
        } catch (error) {
            toast.error('Failed to update task status')
        } finally {
            setUpdating(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this task?')) return

        try {
            await taskService.deleteTask(task.id)
            toast.success('Task deleted successfully')
            onDelete()
        } catch (error) {
            toast.error('Failed to delete task')
        }
    }

    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'

    return (
        <div className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
                {/* Status Toggle */}
                <button
                    onClick={handleToggleStatus}
                    disabled={updating}
                    className="mt-1 hover:scale-110 transition-transform"
                >
                    {getStatusIcon(task.status)}
                </button>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className={`text-lg font-semibold ${task.status === 'completed' ? 'line-through text-light-muted dark:text-dark-muted' : ''}`}>
                            {task.title}
                        </h3>

                        {/* Priority Badge */}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getPriorityColor(task.priority)}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                    </div>

                    {task.description && (
                        <p className="text-light-muted dark:text-dark-muted mb-3 line-clamp-2">
                            {task.description}
                        </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-light-muted dark:text-dark-muted">
                        {task.due_date && (
                            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 dark:text-red-400' : ''}`}>
                                {isOverdue && <AlertCircle className="h-4 w-4" />}
                                <Calendar className="h-4 w-4" />
                                <span>{format(new Date(task.due_date), 'MMM dd, yyyy')}</span>
                            </div>
                        )}

                        <span className={`px-2 py-1 rounded text-xs ${task.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                                    'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                            {task.status === 'in_progress' ? 'In Progress' : task.status === 'completed' ? 'Completed' : 'To Do'}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit(task)}
                        className="p-2 hover:bg-light-border dark:hover:bg-dark-border rounded-lg transition-colors"
                        title="Edit task"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                        title="Delete task"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TaskItem
