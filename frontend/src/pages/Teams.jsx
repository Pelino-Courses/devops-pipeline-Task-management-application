import { useState, useEffect } from 'react'
import { Users, Plus, Loader2, Settings } from 'lucide-react'
import { teamService } from '@/services'
import CreateTeamModal from '@/components/CreateTeamModal'
import toast from 'react-hot-toast'

const Teams = () => {
    const [teams, setTeams] = useState([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    const fetchTeams = async () => {
        try {
            setLoading(true)
            const response = await teamService.getTeams()
            setTeams(response || [])
        } catch (error) {
            toast.error('Failed to fetch teams')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTeams()
    }, [])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Teams</h1>
                    <p className="text-light-muted dark:text-dark-muted mt-1">
                        Collaborate with your team members
                    </p>
                </div>
                <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
                    <Plus className="h-5 w-5" />
                    Create Team
                </button>
            </div>

            {/* Teams Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-light dark:text-primary-dark" />
                </div>
            ) : teams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teams.map((team) => (
                        <div key={team.id} className="card hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-primary-light/10 dark:bg-primary-dark/10 rounded-lg text-primary-light dark:text-primary-dark">
                                    <Users className="h-6 w-6" />
                                </div>
                                <button className="p-2 hover:bg-light-border dark:hover:bg-dark-border rounded-lg transition-colors text-light-muted dark:text-dark-muted">
                                    <Settings className="h-5 w-5" />
                                </button>
                            </div>

                            <h3 className="text-xl font-bold mb-2">{team.name}</h3>
                            <p className="text-light-muted dark:text-dark-muted text-sm mb-4 line-clamp-2">
                                {team.description || 'No description provided'}
                            </p>

                            <div className="flex items-center justify-between text-sm text-light-muted dark:text-dark-muted pt-4 border-t border-light-border dark:border-dark-border">
                                <span>{team.members?.length || 1} members</span>
                                <span>Created {new Date(team.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card">
                    <div className="text-center py-12 text-light-muted dark:text-dark-muted">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg mb-2">No teams yet</p>
                        <p className="text-sm">
                            Create a team to start collaborating with others!
                        </p>
                    </div>
                </div>
            )}

            <CreateTeamModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchTeams}
            />
        </div>
    )
}

export default Teams
