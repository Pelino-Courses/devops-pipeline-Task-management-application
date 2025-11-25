import { Plus, Search, Filter } from 'lucide-react'

const Tasks = () => {
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
                <button className="btn btn-primary">
                    <Plus className="h-5 w-5" />
                    New Task
                </button>
            </div>

            {/* Search and Filter */}
            <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-light-muted dark:text-dark-muted" />
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            className="input pl-10 w-full"
                        />
                    </div>
                    <button className="btn btn-secondary">
                        <Filter className="h-5 w-5" />
                        Filters
                    </button>
                </div>
            </div>

            {/* Tasks List */}
            <div className="card">
                <div className="text-center py-12 text-light-muted dark:text-dark-muted">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No tasks found. Create your first task!</p>
                </div>
            </div>
        </div>
    )
}

export default Tasks
