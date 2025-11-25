import { useState, useEffect } from 'react'
import { Search, Shield, UserX, UserCheck, Loader2 } from 'lucide-react'
import { adminService } from '@/services'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const Users = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterRole, setFilterRole] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await adminService.getUsers()
            setUsers(response.items || response || [])
        } catch (error) {
            toast.error('Failed to fetch users')
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async (userId, newRole) => {
        try {
            await adminService.updateUserRole(userId, newRole)
            toast.success('User role updated successfully')
            fetchUsers()
        } catch (error) {
            toast.error('Failed to update user role')
        }
    }

    const handleStatusToggle = async (userId, currentStatus) => {
        try {
            await adminService.updateUserStatus(userId, !currentStatus)
            toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
            fetchUsers()
        } catch (error) {
            toast.error('Failed to update user status')
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRole = filterRole === 'all' || user.role === filterRole
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && user.is_active) ||
            (filterStatus === 'inactive' && !user.is_active)
        return matchesSearch && matchesRole && matchesStatus
    })

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
            case 'manager':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-light-muted dark:text-dark-muted mt-1">
                    Manage users, roles, and permissions
                </p>
            </div>

            {/* Search and Filters */}
            <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-light-muted dark:text-dark-muted" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input pl-10 w-full"
                        />
                    </div>
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="input"
                    >
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="user">User</option>
                    </select>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="input"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-light dark:text-primary-dark" />
                    </div>
                ) : filteredUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-light-muted/30 dark:bg-dark-muted/30">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Join Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        Last Login
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-light-border dark:divide-dark-border">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-light-muted/20 dark:hover:bg-dark-muted/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-semibold">{user.full_name || user.username}</div>
                                                <div className="text-sm text-light-muted dark:text-dark-muted">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                                            >
                                                <option value="user">User</option>
                                                <option value="manager">Manager</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleStatusToggle(user.id, user.is_active)}
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${user.is_active
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
                                                    }`}
                                            >
                                                {user.is_active ? (
                                                    <>
                                                        <UserCheck className="h-3 w-3" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserX className="h-3 w-3" />
                                                        Inactive
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-light-muted dark:text-dark-muted">
                                            {user.created_at ? format(new Date(user.created_at), 'MMM dd, yyyy') : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-light-muted dark:text-dark-muted">
                                            {user.last_login ? format(new Date(user.last_login), 'MMM dd, yyyy HH:mm') : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                className="inline-flex items-center gap-1 px-3 py-1 text-sm text-primary-light dark:text-primary-dark hover:underline"
                                            >
                                                <Shield className="h-4 w-4" />
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-light-muted dark:text-dark-muted">
                        <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p>No users found</p>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card">
                    <div className="text-sm text-light-muted dark:text-dark-muted mb-1">Total Users</div>
                    <div className="text-2xl font-bold">{users.length}</div>
                </div>
                <div className="card">
                    <div className="text-sm text-light-muted dark:text-dark-muted mb-1">Active Users</div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {users.filter(u => u.is_active).length}
                    </div>
                </div>
                <div className="card">
                    <div className="text-sm text-light-muted dark:text-dark-muted mb-1">Admins</div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {users.filter(u => u.role === 'admin').length}
                    </div>
                </div>
                <div className="card">
                    <div className="text-sm text-light-muted dark:text-dark-muted mb-1">Managers</div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {users.filter(u => u.role === 'manager').length}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Users

