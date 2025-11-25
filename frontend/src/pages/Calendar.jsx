import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { taskService } from '@/services'
import TaskModal from '@/components/TaskModal'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns'

const Calendar = () => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [tasks, setTasks] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState(null)

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"]

    useEffect(() => {
        fetchTasks()
    }, [currentDate])

    const fetchTasks = async () => {
        try {
            const response = await taskService.getTasks()
            setTasks(response.items || response || [])
        } catch (error) {
            console.error('Failed to fetch tasks')
        }
    }

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    }

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    }

    const handleAddEvent = () => {
        setSelectedDate(null)
        setIsModalOpen(true)
    }

    const handleDateClick = (date) => {
        setSelectedDate(date)
        setIsModalOpen(true)
    }

    const getTasksForDate = (date) => {
        return tasks.filter(task =>
            task.due_date && isSameDay(new Date(task.due_date), date)
        )
    }

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Calendar</h1>
                    <p className="text-light-muted dark:text-dark-muted mt-1">
                        View your tasks and deadlines
                    </p>
                </div>
                <button onClick={handleAddEvent} className="btn btn-primary">
                    <CalendarIcon className="h-5 w-5" />
                    Add Event
                </button>
            </div>

            {/* Calendar View */}
            <div className="card">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={handlePrevMonth} className="btn-secondary p-2 hover:bg-light-muted/20 dark:hover:bg-dark-muted/20 rounded-lg transition-colors">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="btn-secondary px-4 py-2 rounded-lg transition-colors"
                        >
                            Today
                        </button>
                        <button onClick={handleNextMonth} className="btn-secondary p-2 hover:bg-light-muted/20 dark:hover:bg-dark-muted/20 rounded-lg transition-colors">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Day Headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center font-semibold text-sm py-2 text-light-muted dark:text-dark-muted">
                            {day}
                        </div>
                    ))}

                    {/* Calendar Days */}
                    {calendarDays.map((day, index) => {
                        const dayTasks = getTasksForDate(day)
                        const isCurrentMonth = isSameMonth(day, currentDate)
                        const isToday = isSameDay(day, new Date())

                        return (
                            <button
                                key={index}
                                onClick={() => handleDateClick(day)}
                                className={`
                                    min-h-[100px] p-2 border border-light-border dark:border-dark-border rounded-lg
                                    hover:bg-light-muted/10 dark:hover:bg-dark-muted/10 transition-colors
                                    ${!isCurrentMonth ? 'opacity-40' : ''}
                                    ${isToday ? 'bg-primary-light/10 dark:bg-primary-dark/10 border-primary-light dark:border-primary-dark' : ''}
                                `}
                            >
                                <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-primary-light dark:text-primary-dark' : ''}`}>
                                    {format(day, 'd')}
                                </div>
                                <div className="space-y-1">
                                    {dayTasks.slice(0, 2).map(task => (
                                        <div
                                            key={task.id}
                                            className={`text-xs p-1 rounded truncate ${task.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                                                    task.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                                                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                }`}
                                        >
                                            {task.title}
                                        </div>
                                    ))}
                                    {dayTasks.length > 2 && (
                                        <div className="text-xs text-light-muted dark:text-dark-muted">
                                            +{dayTasks.length - 2} more
                                        </div>
                                    )}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Task Modal */}
            <TaskModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setSelectedDate(null)
                }}
                task={null}
                onSuccess={() => {
                    fetchTasks()
                    setIsModalOpen(false)
                    setSelectedDate(null)
                }}
            />
        </div>
    )
}

export default Calendar

