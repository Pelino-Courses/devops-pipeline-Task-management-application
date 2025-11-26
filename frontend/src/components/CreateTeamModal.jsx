import { useState } from 'react'
import { X, Users } from 'lucide-react'
import { teamService } from '@/services'
import toast from 'react-hot-toast'

const CreateTeamModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            await teamService.createTeam(formData)
            toast.success('Team created successfully')
            setFormData({ name: '', description: '' })
            onSuccess()
            onClose()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create team')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Create New Team
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-light-border dark:hover:bg-dark-border rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Team Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input w-full"
                            placeholder="e.g. Engineering, Marketing"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="input w-full min-h-[100px] resize-y"
                            placeholder="What is this team for?"
                        />
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
                            {loading ? 'Creating...' : 'Create Team'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateTeamModal
