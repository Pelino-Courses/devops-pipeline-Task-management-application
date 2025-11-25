import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        full_name: '',
        password: '',
        confirmPassword: '',
    })
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match')
            setLoading(false)
            return
        }

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500))

        try {
            // Get existing users from localStorage
            const users = JSON.parse(localStorage.getItem('app_users') || '[]')

            // Check if username or email already exists
            if (users.some(u => u.username === formData.username)) {
                toast.error('Username already taken')
                setLoading(false)
                return
            }

            if (users.some(u => u.email === formData.email)) {
                toast.error('Email already registered')
                setLoading(false)
                return
            }

            // Create new user
            const newUser = {
                id: Date.now(),
                username: formData.username,
                email: formData.email,
                full_name: formData.full_name,
                password: formData.password, // In real app, this would be hashed
                role: 'user',
                is_active: true,
                is_verified: true,
                theme_preference: 'system',
                created_at: new Date().toISOString(),
            }

            // Save to localStorage
            users.push(newUser)
            localStorage.setItem('app_users', JSON.stringify(users))

            toast.success('Registration successful! Please login.')
            navigate('/login')
        } catch (error) {
            toast.error('Registration failed')
        }

        setLoading(false)
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    return (
        <div className="card animate-slide-up">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-4">
                    <UserPlus className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Create Account</h1>
                <p className="text-light-muted dark:text-dark-muted">
                    Sign up to get started with Task Manager
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium mb-2">
                        Username *
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-light-muted dark:text-dark-muted" />
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="input pl-10"
                            placeholder="Choose a username"
                            required
                            minLength={3}
                            autoFocus
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address *
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-light-muted dark:text-dark-muted" />
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="input pl-10"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="full_name" className="block text-sm font-medium mb-2">
                        Full Name
                    </label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-light-muted dark:text-dark-muted" />
                        <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className="input pl-10"
                            placeholder="Enter your full name"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-2">
                        Password *
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
                            placeholder="Create a password"
                            required
                            minLength={8}
                        />
                    </div>
                    <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
                        Must be at least 8 characters with uppercase, lowercase, and number
                    </p>
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                        Confirm Password *
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-light-muted dark:text-dark-muted" />
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="input pl-10"
                            placeholder="Confirm your password"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full"
                >
                    {loading ? (
                        <><Loader2 className="h-5 w-5 animate-spin" /> Creating account...</>
                    ) : (
                        <><UserPlus className="h-5 w-5" /> Create Account</>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-light-muted dark:text-dark-muted">
                    Already have an account?{' '}
                    <Link to="/login" className="link font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Register
