import axios from 'axios'
import useAuthStore from '@/store/authStore'
import toast from 'react-hot-toast'

// Get API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

console.log('API Base URL:', API_BASE_URL)

// Create axios instance
const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = useAuthStore.getState().refreshToken

                if (!refreshToken) {
                    useAuthStore.getState().logout()
                    window.location.href = '/login'
                    return Promise.reject(error)
                }

                // Try to refresh token
                const response = await axios.post(
                    `${API_BASE_URL}/api/v1/auth/refresh`,
                    { refresh_token: refreshToken }
                )

                const { access_token, refresh_token } = response.data

                // Update tokens
                useAuthStore.getState().updateTokens(access_token, refresh_token)

                // Retry original request
                originalRequest.headers.Authorization = `Bearer ${access_token}`
                return api(originalRequest)
            } catch (refreshError) {
                useAuthStore.getState().logout()
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }

        // Handle other errors
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred'

        // Don't show toast for certain errors
        if (error.response?.status !== 401) {
            toast.error(errorMessage)
        }

        return Promise.reject(error)
    }
)

export default api
