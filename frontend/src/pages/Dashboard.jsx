import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckSquare, Clock, ListTodo, TrendingUp } from 'lucide-react'
import { taskService } from '@/services'
import useAuthStore from '@/store/authStore'

const Dashboard = () => {
    const { user } = useAuthStore()
    const [tasks, setTasks] = useState([])
    const [stats, setStats] = useState([
        { name: 'Total Tasks', value: '0', icon: ListTodo, color: 'bg-blue-500' },
        { name: 'In Progress', value: '0', icon: Clock, color: 'bg-yellow-500' },
        { name: 'Completed', value: '0', icon: CheckSquare, color: 'bg-green-500' },
        { name: 'Overall Progress', value: '0%', icon: TrendingUp, color: 'bg-purple-500' },
    ])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await taskService.getTasks()
                const allTasks = response.items || response || []
                setTasks(allTasks)
                calculateStats(allTasks)
            } catch (error) {
                console.error('Failed to fetch dashboard data')
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    const calculateStats = (taskList) => {
        const total = taskList.length
        const completed = taskList.filter(t => t.status === 'completed').length
        const inProgress = taskList.filter(t => t.status === 'in_progress').length
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0

        setStats([
            { name: 'Total Tasks', value: total.toString(), icon: ListTodo, color: 'bg-blue-500' },
            { name: 'In Progress', value: inProgress.toString(), icon: Clock, color: 'bg-yellow-500' },
            { name: 'Completed', value: completed.toString(), icon: CheckSquare, color: 'bg-green-500' },
            { name: 'Overall Progress', value: `${progress}%`, icon: TrendingUp, color: 'bg-purple-500' },
        ])
    }

    const recentTasks = tasks.slice(0, 5)

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
                        <div key={stat.name} className="card hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-light-muted dark:text-dark-muted">
                                        {stat.name}
                                    </p>
                                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                                </div>
                                <div className={`${stat.color} p-3 rounded-lg text-white shadow-md`}>
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
                    <button onClick={() => navigate('/tasks')} className="btn btn-primary h-auto py-4 flex flex-col items-center gap-2">
                        <CheckSquare className="h-6 w-6" />
                        <span>Manage Tasks</span>
                    </button>
                    <button onClick={() => navigate('/calendar')} className="btn btn-secondary h-auto py-4 flex flex-col items-center gap-2">
                        <Clock className="h-6 w-6" />
                        <span>View Calendar</span>
                    </button>
                    <button onClick={() => navigate('/profile')} className="btn btn-secondary h-auto py-4 flex flex-col items-center gap-2">
                        <TrendingUp className="h-6 w-6" />
                        <span>View Profile</span>
                    </button>
                </div>
            </div>

            {/* Recent Tasks */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Recent Tasks</h2>
                    <button onClick={() => navigate('/tasks')} className="text-primary-light dark:text-primary-dark hover:underline text-sm">
                        View All
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : recentTasks.length > 0 ? (
                    <div className="space-y-3">
                        {recentTasks.map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-light-bg dark:bg-dark-bg rounded-lg border border-light-border dark:border-dark-border">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' :
                                            task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                        }`} />
                                    <span className="font-medium">{task.title}</span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${task.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                            'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                                    }`}>
                                    {task.status.replace('_', ' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-light-muted dark:text-dark-muted">
                        <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p>No tasks yet. Create your first task to get started!</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard
