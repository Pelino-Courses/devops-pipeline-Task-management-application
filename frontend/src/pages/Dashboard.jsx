import { CheckSquare, Clock, ListTodo, TrendingUp } from 'lucide-react'
import useAuthStore from '@/store/authStore'

const Dashboard = () => {
    const { user } = useAuthStore()

    const stats = [
        { name: 'Total Tasks', value: '0', icon: ListTodo, color: 'bg-blue-500' },
        { name: 'In Progress', value: '0', icon: Clock, color: 'bg-yellow-500' },
        { name: 'Completed', value: '0', icon: CheckSquare, color: 'bg-green-500' },
        { name: 'Overall Progress', value: '0%', icon: TrendingUp, color: 'bg-purple-500' },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">
                    Welcome back, {user?.username || 'User'}! 👋
                </h1>
                <p className="text-light-muted dark:text-dark-muted mt-1">
                    Here's what's happening with your tasks today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.name} className="card-hover">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-light-muted dark:text-dark-muted">
                                        {stat.name}
                                    </p>
                                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                                </div>
                                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Quick Actions */}
            <div className="card">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="btn btn-primary">
                        <CheckSquare className="h-5 w-5" />
                        Create New Task
                    </button>
                    <button className="btn btn-secondary">
                        <ListTodo className="h-5 w-5" />
                        View All Tasks
                    </button>
                    <button className="btn btn-secondary">
                        <Clock className="h-5 w-5" />
                        View Calendar
                    </button>
                </div>
            </div>

            {/* Recent Tasks */}
            <div className="card">
                <h2 className="text-xl font-bold mb-4">Recent Tasks</h2>
                <div className="text-center py-12 text-light-muted dark:text-dark-muted">
                    <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>No tasks yet. Create your first task to get started!</p>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
