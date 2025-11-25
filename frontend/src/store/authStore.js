import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,

            setAuth: (user, accessToken, refreshToken) => set({
                user,
                accessToken,
                refreshToken,
                isAuthenticated: true,
            }),

            updateUser: (user) => set({ user }),

            logout: () => set({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false,
            }),

            updateTokens: (accessToken, refreshToken) => set({
                accessToken,
                refreshToken,
            }),
        }),
        {
            name: 'auth-storage',
        }
    )
)

export default useAuthStore
