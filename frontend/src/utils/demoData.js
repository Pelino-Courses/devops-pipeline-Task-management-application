// Initialize demo account on app load
export const initializeDemoData = () => {
    // Check if users already exist
    const existingUsers = localStorage.getItem('app_users')

    if (!existingUsers) {
        // Create demo account
        const demoUsers = [
            {
                id: 1,
                username: 'demo',
                email: 'demo@taskmanager.com',
                full_name: 'Demo User',
                password: 'Demo1234',
                role: 'user',
                is_active: true,
                is_verified: true,
                theme_preference: 'system',
                created_at: new Date().toISOString(),
            },
            {
                id: 2,
                username: 'admin',
                email: 'admin@taskmanager.com',
                full_name: 'Admin User',
                password: 'Admin1234',
                role: 'admin',
                is_active: true,
                is_verified: true,
                theme_preference: 'system',
                created_at: new Date().toISOString(),
            }
        ]

        localStorage.setItem('app_users', JSON.stringify(demoUsers))
        console.log('✅ Demo accounts created: demo/Demo1234 and admin/Admin1234')
    }
}
