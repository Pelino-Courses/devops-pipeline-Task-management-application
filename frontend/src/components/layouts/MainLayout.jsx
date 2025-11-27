import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import {
    LayoutDashboard, CheckSquare, Calendar,
    LogOut, User, Shield, FileText, Bell, Menu, X, Users
} from 'lucide-react'
import { useState } from 'react'
import useAuthStore from '@/store/authStore'
import ThemeToggle from '@/components/ThemeToggle'

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const { user, logout } = useAuthStore()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const isAdmin = user?.role === 'admin'

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Tasks', path: '/tasks', icon: CheckSquare },
        { name: 'Teams', path: '/teams', icon: Users },
        { name: 'Calendar', path: '/calendar', icon: Calendar },
        { name: 'Profile', path: '/profile', icon: User },
    ]

    const adminNavItems = [
        { name: 'Admin Dashboard', path: '/admin/dashboard', icon: Shield },
        { name: 'Users', path: '/admin/users', icon: User },
        { name: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
    ]

    return (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
            {/* Top Navbar */}
            <nav className="bg-white dark:bg-dark-surface border-b border-light-border dark:border-dark-border sticky top-0 z-40">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                            >
                                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                Task Manager
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                            </button>

                            <ThemeToggle />

                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-light-surface dark:bg-dark-bg">
                                <User className="h-4 w-4" />
                                <span className="text-sm font-medium">{user?.username}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={`${sidebarOpen ? 'w-64' : 'w-0'
                        } transition-all duration-300 overflow-hidden bg-white dark:bg-dark-surface border-r border-light-border dark:border-dark-border min-h-[calc(100vh-4rem)] sticky top-16`}
                >
                    <div className="p-4 space-y-6">
                        {/* Main Navigation */}
                        <div>
                            <h3 className="text-xs font-semibold text-light-muted dark:text-dark-muted uppercase tracking-wider mb-3">
                                Main
                            </h3>
                            <nav className="space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive = location.pathname === item.path
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                                                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                                                : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span className="font-medium">{item.name}</span>
                                        </Link>
                                    )
                                })}
                            </nav>
                        </div>

                        {/* Admin Navigation */}
                        {isAdmin && (
                            <div>
                                <h3 className="text-xs font-semibold text-light-muted dark:text-dark-muted uppercase tracking-wider mb-3">
                                    Admin
                                </h3>
                                <nav className="space-y-1">
                                    {adminNavItems.map((item) => {
                                        const Icon = item.icon
                                        const isActive = location.pathname === item.path
                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                                                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                                                    : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                <Icon className="h-5 w-5" />
                                                <span className="font-medium">{item.name}</span>
                                            </Link>
                                        )
                                    })}
                                </nav>
                            </div>
                        )}

                        {/* Logout */}
                        <div className="pt-4 border-t border-light-border dark:border-dark-border">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg w-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default MainLayout
