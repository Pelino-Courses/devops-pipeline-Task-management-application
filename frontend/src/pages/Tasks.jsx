import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Loader2 } from 'lucide-react'
import { taskService } from '@/services'
import TaskModal from '@/components/TaskModal'
import TaskItem from '@/components/TaskItem'
import ShareTaskModal from '@/components/ShareTaskModal'
import toast from 'react-hot-toast'

const Tasks = () => {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterPriority, setFilterPriority] = useState('all')
    const [showFilters, setShowFilters] = useState(false)

    const fetchTasks = async () => {
        try {
            setLoading(true)
            const response = await taskService.getTasks({
                search: searchQuery || undefined,
                status: filterStatus !== 'all' ? filterStatus : undefined,
                priority: filterPriority !== 'all' ? filterPriority : undefined
            })
            setTasks(response.items || response || [])
        } catch (error) {
            if (error.response?.status !== 401) {
                toast.error('Failed to fetch tasks')
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTasks()
    }, [searchQuery, filterStatus, filterPriority, fetchTasks])

    const handleCreateTask = () => {
        setSelectedTask(null)
        setIsModalOpen(true)
    }

    const handleEditTask = (task) => {
        setSelectedTask(task)
        setIsModalOpen(true)
    }

    const handleShareTask = (task) => {
        setSelectedTask(task)
        setIsShareModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setIsShareModalOpen(false)
        setSelectedTask(null)
    }

    const handleSuccess = () => {
        fetchTasks()
    }

    const filteredTasks = tasks

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Tasks</h1>
                    <p className="text-light-muted dark:text-dark-muted mt-1">
                        Manage and organize your tasks
                    </p>
                </div>
                <button onClick={handleCreateTask} className="btn btn-primary">
                    <Plus className="h-5 w-5" />
                    New Task
                </button>
            </div>

            {/* Search and Filter */}
            <div className="card">
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-light-muted dark:text-dark-muted" />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input pl-10 w-full"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
                        >
                            <Filter className="h-5 w-5" />
                            Filters
                        </button>
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-light-border dark:border-dark-border">
                            <div>
                                <label className="block text-sm font-medium mb-2">Status</label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="input w-full"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="todo">To Do</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Priority</label>
                                <select
                                    value={filterPriority}
                                    onChange={(e) => setFilterPriority(e.target.value)}
                                    className="input w-full"
                                >
                                    <option value="all">All Priorities</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tasks List */}
            {loading ? (
                <div className="card">
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-light dark:text-primary-dark" />
                    </div>
                </div>
            ) : filteredTasks.length > 0 ? (
                <div className="space-y-4">
                    {filteredTasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            onEdit={handleEditTask}
                            onDelete={handleSuccess}
                            onUpdate={handleSuccess}
                            onShare={handleShareTask}
                        />
                    ))}
                </div>
            ) : (
                <div className="card">
                    <div className="text-center py-12 text-light-muted dark:text-dark-muted">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg mb-2">No tasks found</p>
                        <p className="text-sm">
                            {searchQuery || filterStatus !== 'all' || filterPriority !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Create your first task to get started!'}
                        </p>
                    </div>
                </div>
            )}

            {/* Task Modal */}
            <TaskModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                task={selectedTask}
                onSuccess={handleSuccess}
            />

            {/* Share Task Modal */}
            <ShareTaskModal
                isOpen={isShareModalOpen}
                onClose={handleCloseModal}
                task={selectedTask}
            />
        </div>
    )
}

export default Tasks
