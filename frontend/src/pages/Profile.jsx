import { useState, useEffect } from 'react'
import { User, Mail, Lock, Save, Loader2 } from 'lucide-react'
import { userService } from '@/services'
import toast from 'react-hot-toast'
import useAuthStore from '@/store/authStore'

const Profile = () => {
    const { user, setUser } = useAuthStore()
    const [loading, setLoading] = useState(false)
    const [profileData, setProfileData] = useState({
        username: '',
        email: '',
        full_name: ''
    })
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    })

    useEffect(() => {
        if (user) {
            setProfileData({
                username: user.username || '',
                email: user.email || '',
                full_name: user.full_name || ''
            })
        }
    }, [user])

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const updatedUser = await userService.updateProfile({
                full_name: profileData.full_name,
                email: profileData.email
            })
            setUser(updatedUser)
            toast.success('Profile updated successfully')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error('New passwords do not match')
            return
        }

        setLoading(true)
        try {
            await userService.changePassword({
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            })
            toast.success('Password changed successfully')
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: ''
            })
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold">Profile Settings</h1>
                <p className="text-light-muted dark:text-dark-muted mt-1">
                    Manage your account settings and preferences
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Information */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Information
                    </h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Username</label>
                            <input
                                type="text"
                                value={profileData.username}
                                disabled
                                className="input w-full bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-70"
                            />
                            <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
                                Username cannot be changed
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-light-muted dark:text-dark-muted" />
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    className="input pl-10 w-full"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-light-muted dark:text-dark-muted" />
                                <input
                                    type="text"
                                    value={profileData.full_name}
                                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                    className="input pl-10 w-full"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            <span className="ml-2">Save Changes</span>
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Change Password
                    </h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Current Password</label>
                            <input
                                type="password"
                                value={passwordData.current_password}
                                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                className="input w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">New Password</label>
                            <input
                                type="password"
                                value={passwordData.new_password}
                                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                className="input w-full"
                                required
                                minLength={8}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                            <input
                                type="password"
                                value={passwordData.confirm_password}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                className="input w-full"
                                required
                                minLength={8}
                            />
                        </div>

                        <button type="submit" className="btn btn-secondary w-full" disabled={loading}>
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
                            <span className="ml-2">Update Password</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Profile
