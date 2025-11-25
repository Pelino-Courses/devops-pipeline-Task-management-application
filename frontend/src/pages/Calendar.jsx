import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

const Calendar = () => {
    const currentDate = new Date()
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"]

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
                <button className="btn btn-primary">
                    <CalendarIcon className="h-5 w-5" />
                    Add Event
                </button>
            </div>

            {/* Calendar View */}
            <div className="card">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <div className="flex gap-2">
                        <button className="btn-secondary p-2">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button className="btn-secondary p-2">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="text-center py-12 text-light-muted dark:text-dark-muted">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Calendar view coming soon!</p>
                    <p className="text-sm mt-2">Track your tasks and deadlines visually</p>
                </div>
            </div>
        </div>
    )
}

export default Calendar
