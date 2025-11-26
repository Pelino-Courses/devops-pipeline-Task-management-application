import api from './api'

export const authService = {
    // Register new user
    register: async (userData) => {
        const response = await api.post('/auth/register', userData)
        return response.data
    },

    // Login user
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials)
        return response.data
    },

    // Logout user
    logout: async () => {
        const response = await api.post('/auth/logout')
        return response.data
    },

    // Refresh token
    refreshToken: async (refreshToken) => {
        const response = await api.post('/auth/refresh', { refresh_token: refreshToken })
        return response.data
    },
}

export const userService = {
    // Get current user profile
    getProfile: async () => {
        const response = await api.get('/users/me')
        return response.data
    },

    // Update current user profile
    updateProfile: async (userData) => {
        const response = await api.put('/users/me', userData)
        return response.data
    },

    // Change password
    changePassword: async (passwordData) => {
        const response = await api.post('/users/me/change-password', passwordData)
        return response.data
    },
}

export const taskService = {
    // Get all tasks with pagination and filters
    getTasks: async (params) => {
        const response = await api.get('/tasks', { params })
        return response.data
    },

    // Get single task
    getTask: async (taskId) => {
        const response = await api.get(`/tasks/${taskId}`)
        return response.data
    },

    // Create new task
    createTask: async (taskData) => {
        const response = await api.post('/tasks', taskData)
        return response.data
    },

    // Update task
    updateTask: async (taskId, taskData) => {
        const response = await api.put(`/tasks/${taskId}`, taskData)
        return response.data
    },

    // Update task status
    updateTaskStatus: async (taskId, status) => {
        const response = await api.patch(`/tasks/${taskId}/status`, { status })
        return response.data
    },

    // Share task
    shareTask: async (taskId, email) => {
        const response = await api.post(`/tasks/${taskId}/share`, { email })
        return response.data
    },

    // Delete task
    deleteTask: async (taskId) => {
        const response = await api.delete(`/tasks/${taskId}`)
        return response.data
    },
}

export const teamService = {
    // Get my teams
    getTeams: async () => {
        const response = await api.get('/teams')
        return response.data
    },

    // Create team
    createTeam: async (teamData) => {
        const response = await api.post('/teams', teamData)
        return response.data
    },

    // Get team details
    getTeam: async (teamId) => {
        const response = await api.get(`/teams/${teamId}`)
        return response.data
    },

    // Add member
    addMember: async (teamId, email, role = 'member') => {
        const response = await api.post(`/teams/${teamId}/members`, { email, role })
        return response.data
    },

    // Remove member
    removeMember: async (teamId, userId) => {
        const response = await api.delete(`/teams/${teamId}/members/${userId}`)
        return response.data
    }
}

export const adminService = {
    // Get dashboard statistics
    getDashboardStats: async () => {
        const response = await api.get('/admin/dashboard')
        return response.data
    },

    // Get all users
    getUsers: async (params) => {
        const response = await api.get('/admin/users', { params })
        return response.data
    },

    // Update user role
    updateUserRole: async (userId, role) => {
        const response = await api.patch(`/admin/users/${userId}/role`, { role })
        return response.data
    },

    // Update user status
    updateUserStatus: async (userId, isActive) => {
        const response = await api.patch(`/admin/users/${userId}/status`, { is_active: isActive })
        return response.data
    },

    // Get audit logs
    getAuditLogs: async (params) => {
        const response = await api.get('/admin/audit-logs', { params })
        return response.data
    },

    // Get security events
    getSecurityEvents: async (params) => {
        const response = await api.get('/admin/security-events', { params })
        return response.data
    },
}

export default {
    auth: authService,
    user: userService,
    task: taskService,
    team: teamService,
    admin: adminService,
}
