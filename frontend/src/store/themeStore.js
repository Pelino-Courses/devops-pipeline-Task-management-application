import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useThemeStore = create(
    persist(
        (set) => ({
            theme: 'system', // 'light' | 'dark' | 'system'
            actualTheme: 'light', // The actual theme being used

            setTheme: (theme) => set({ theme }),

            setActualTheme: (actualTheme) => set({ actualTheme }),

            initializeTheme: () => {
                const stored = localStorage.getItem('theme-storage')
                const theme = stored ? JSON.parse(stored).state.theme : 'system'

                let actualTheme = theme

                if (theme === 'system') {
                    actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                        ? 'dark'
                        : 'light'
                }

                // Apply theme to document
                if (actualTheme === 'dark') {
                    document.documentElement.classList.add('dark')
                } else {
                    document.documentElement.classList.remove('dark')
                }

                set({ theme, actualTheme })
            },

            toggleTheme: () => set((state) => {
                const newTheme = state.actualTheme === 'light' ? 'dark' : 'light'

                if (newTheme === 'dark') {
                    document.documentElement.classList.add('dark')
                } else {
                    document.documentElement.classList.remove('dark')
                }

                return { theme: newTheme, actualTheme: newTheme }
            }),
        }),
        {
            name: 'theme-storage',
        }
    )
)

export default useThemeStore
