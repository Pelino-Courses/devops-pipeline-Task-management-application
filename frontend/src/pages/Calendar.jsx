import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { taskService } from '@/services'
import TaskModal from '@/components/TaskModal'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns'
import toast from 'react-hot-toast'

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState(null)
    const [selectedTask, setSelectedTask] = useState(null)
    const [selectedDayTasks, setSelectedDayTasks] = useState([])
    const [showDayDetails, setShowDayDetails] = useState(false)

    useEffect(() => {
        fetchTasks()
    }, [currentDate])

    const fetchTasks = async () => {
        try {
            setLoading(true)
            // Fetch all tasks to populate calendar
            // In a real app with many tasks, you might want to fetch by date range
            const response = await taskService.getTasks({ page_size: 100 })
            setTasks(response.items || response || [])
        } catch (error) {
            console.error('Failed to fetch tasks')
            toast.error('Failed to load calendar tasks')
        } finally {
            setLoading(false)
        }
    }

    const handlePrevMonth = () => {
        setCurrentDate(subMonths(currentDate, 1))
    }

    const handleNextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1))
    }

    const handleAddEvent = () => {
        setSelectedDate(new Date())
        setSelectedTask(null)
        setIsModalOpen(true)
    }

    const handleDateClick = (date) => {
        const tasksForDate = getTasksForDate(date)
        setSelectedDate(date)
        setSelectedDayTasks(tasksForDate)
        setShowDayDetails(true)
    }

    const handleCreateTaskOnDate = () => {
        // Create a task for the selected date
        // We need to pass this date to the modal
        const taskWithDate = {
            due_date: format(selectedDate, 'yyyy-MM-dd')
        }
        setSelectedTask(taskWithDate)
        setIsModalOpen(true)
    }

    const handleEditTask = (task) => {
        setSelectedTask(task)
        setIsModalOpen(true)
    }

    const getTasksForDate = (date) => {
        return tasks.filter(task =>
            task.due_date && isSameDay(new Date(task.due_date), date)
        )
    }

    const handleSuccess = () => {
        fetchTasks()
        if (selectedDate) {
            // Refresh day details if open
            const updatedTasks = getTasksForDate(selectedDate)
            setSelectedDayTasks(updatedTasks)
        }
    }

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold">Calendar</h1>
                    <p className="text-light-muted dark:text-dark-muted mt-1">
                        View your tasks and deadlines
                    </p>
                </div>
                <button onClick={handleAddEvent} className="btn btn-primary">
                    <Plus className="h-5 w-5" />
                    Add Event
                </button>
            </div>

            <div className="flex gap-6 flex-1 min-h-0">
                {/* Calendar View */}
                <div className="card flex-1 flex flex-col overflow-hidden">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <h2 className="text-xl font-bold">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <div className="flex gap-2">
                            <button onClick={handlePrevMonth} className="btn-secondary p-2">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setCurrentDate(new Date())}
                                className="btn-secondary px-4 py-2"
                            >
                                Today
                            </button>
                            <button onClick={handleNextMonth} className="btn-secondary p-2">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 mb-2 flex-shrink-0">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center font-semibold text-sm py-2 text-light-muted dark:text-dark-muted">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 flex-1 overflow-y-auto min-h-0">
                        {calendarDays.map((day, index) => {
                            const dayTasks = getTasksForDate(day)
                            const isCurrentMonth = isSameMonth(day, currentDate)
                            const isToday = isSameDay(day, new Date())
                            const isSelected = selectedDate && isSameDay(day, selectedDate)

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleDateClick(day)}
                                    className={`
                                        min-h-[80px] p-2 border rounded-lg text-left transition-all relative flex flex-col gap-1
                                        ${!isCurrentMonth ? 'opacity-40 bg-gray-50 dark:bg-gray-900/50' : 'bg-white dark:bg-dark-card'}
                                        ${isToday ? 'ring-2 ring-primary-light dark:ring-primary-dark z-10' : 'border-light-border dark:border-dark-border'}
                                        ${isSelected ? 'bg-primary-light/5 dark:bg-primary-dark/5' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
                                    `}
                                >
                                    <span className={`
                                        text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full
                                        ${isToday ? 'bg-primary-light text-white dark:bg-primary-dark' : ''}
                                    `}>
                                        {format(day, 'd')}
                                    </span>

                                    <div className="flex-1 w-full space-y-1 overflow-hidden">
                                        {dayTasks.slice(0, 3).map(task => (
                                            <div
                                                key={task.id}
                                                className={`text-[10px] px-1.5 py-0.5 rounded truncate w-full ${task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                                                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                    }`}
                                                title={task.title}
                                            >
                                                {task.title}
                                            </div>
                                        ))}
                                        {dayTasks.length > 3 && (
                                            <div className="text-[10px] text-light-muted dark:text-dark-muted pl-1">
                                                +{dayTasks.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Day Details Sidebar */}
                {showDayDetails && selectedDate && (
                    <div className="w-80 card flex flex-col animate-in slide-in-from-right duration-200">
                        <div className="flex items-center justify-between mb-4 flex-shrink-0">
                            <h3 className="font-bold text-lg">
                                {format(selectedDate, 'EEEE, MMM d')}
                            </h3>
                            <button
                                onClick={() => setShowDayDetails(false)}
                                className="text-light-muted hover:text-foreground"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-2">
                            {selectedDayTasks.length > 0 ? (
                                selectedDayTasks.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => handleEditTask(task)}
                                        className="p-3 rounded-lg border border-light-border dark:border-dark-border hover:shadow-md transition-shadow cursor-pointer bg-light-bg dark:bg-dark-bg"
                                    >
                                        <div className="flex items-start justify-between mb-1">
                                            <span className={`text-xs px-1.5 py-0.5 rounded ${task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                {task.priority}
                                            </span>
                                            <span className={`text-xs ${task.status === 'completed' ? 'text-green-600' : 'text-gray-500'}`}>
                                                {task.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <h4 className={`font-medium text-sm ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                            {task.title}
                                        </h4>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-light-muted dark:text-dark-muted">
                                    <p>No tasks for this day</p>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleCreateTaskOnDate}
                            className="btn btn-primary w-full mt-4 flex-shrink-0"
                        >
                            <Plus className="h-4 w-4" />
                            Add Task
                        </button>
                    </div>
                )}
            </div>

            {/* Task Modal */}
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setSelectedTask(null)
                }}
                task={selectedTask}
                onSuccess={handleSuccess}
            />
        </div>
    )
}

export default Calendar
