import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useThemeStore from '@/store/themeStore'
import useAuthStore from '@/store/authStore'

// Layouts
import MainLayout from '@/components/layouts/MainLayout'
import AuthLayout from '@/components/layouts/AuthLayout'

// Pages
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import Dashboard from '@/pages/Dashboard'
import Tasks from '@/pages/Tasks'
import Teams from '@/pages/Teams'
import Calendar from '@/pages/Calendar'
import Profile from '@/pages/Profile'
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminUsers from '@/pages/admin/Users'
import AdminAuditLogs from '@/pages/admin/AuditLogs'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuthStore()
    return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Admin Route Component
const AdminRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore()

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

function App() {
    const { initializeTheme } = useThemeStore()

    useEffect(() => {
        // Initialize theme on mount
        initializeTheme()

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e) => {
            const { theme, setActualTheme } = useThemeStore.getState()
            if (theme === 'system') {
                const newTheme = e.matches ? 'dark' : 'light'
                setActualTheme(newTheme)
                if (newTheme === 'dark') {
                    document.documentElement.classList.add('dark')
                } else {
                    document.documentElement.classList.remove('dark')
                }
            }
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [initializeTheme])

    return (
        <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<MainLayout />}>
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/tasks"
                    element={
                        <ProtectedRoute>
                            <Tasks />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/teams"
                    element={
                        <ProtectedRoute>
                            <Teams />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/calendar"
                    element={
                        <ProtectedRoute>
                            <Calendar />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Routes */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <AdminRoute>
                            <AdminUsers />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/admin/audit-logs"
                    element={
                        <AdminRoute>
                            <AdminAuditLogs />
                        </AdminRoute>
                    }
                />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}

export default App
