import { useState } from 'react'
import { X, Share2, UserPlus } from 'lucide-react'
import { taskService } from '@/services'
import toast from 'react-hot-toast'

const ShareTaskModal = ({ isOpen, onClose, task }) => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email) return

        setLoading(true)
        try {
            await taskService.shareTask(task.id, email)
            toast.success(`Task shared with ${email}`)
            setEmail('')
            onClose()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to share task')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen || !task) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        Share Task
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-light-border dark:hover:bg-dark-border rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-sm text-light-muted dark:text-dark-muted mb-4">
                        Share <span className="font-semibold text-foreground">&quot;{task.title}&quot;</span> with another user by entering their email address.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                User Email
                            </label>
                            <div className="relative">
                                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-light-muted dark:text-dark-muted" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pl-10 w-full"
                                    placeholder="Enter user email"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-secondary flex-1"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary flex-1"
                                disabled={loading}
                            >
                                {loading ? 'Sharing...' : 'Share'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ShareTaskModal
