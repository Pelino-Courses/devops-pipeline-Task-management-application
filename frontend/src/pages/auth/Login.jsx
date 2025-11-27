import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '@/store/authStore'

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    })
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const { setAuth } = useAuthStore()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500))

        try {
            // Get users from localStorage
            const users = JSON.parse(localStorage.getItem('app_users') || '[]')

            // Find user
            const user = users.find(u => u.username === formData.username)

            if (!user || user.password !== formData.password) {
                toast.error('Incorrect username or password')
                setLoading(false)
                return
            }

            // Create mock tokens
            const mockAccessToken = `mock_access_${Date.now()}`
            const mockRefreshToken = `mock_refresh_${Date.now()}`

            // Set user in store (without password)
            const { password: _password, ...userWithoutPassword } = user
            setAuth(userWithoutPassword, mockAccessToken, mockRefreshToken)

            toast.success('Login successful!')
            navigate('/dashboard')
        } catch (error) {
            toast.error('Login failed')
        }

        setLoading(false)
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    // Demo credentials hint
    const useDemoAccount = () => {
        setFormData({
            username: 'demo',
            password: 'Demo1234'
        })
        toast.success('Demo credentials filled! Click Sign In')
    }

    return (
        <div className="card animate-slide-up">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
                    <LogIn className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
                <p className="text-light-muted dark:text-dark-muted">
                    Sign in to your account to continue
                </p>
            </div>

            {/* Demo Account Button */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                    👉 Try the demo account:
                </p>
                <button
                    type="button"
                    onClick={useDemoAccount}
                    className="btn btn-secondary w-full text-sm"
                >
                    Use Demo Account (demo / Demo1234)
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium mb-2">
                        Username
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-light-muted dark:text-dark-muted" />
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="input pl-10"
                            placeholder="Enter your username"
                            required
                            autoFocus
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-light-muted dark:text-dark-muted" />
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="input pl-10"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="rounded border-light-border dark:border-dark-border"
                        />
                        <span className="text-sm">Remember me</span>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full"
                >
                    {loading ? (
                        <><Loader2 className="h-5 w-5 animate-spin" /> Signing in...</>
                    ) : (
                        <><LogIn className="h-5 w-5" /> Sign In</>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-light-muted dark:text-dark-muted">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="link font-medium">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Login
