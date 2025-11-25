import { Moon, Sun, Monitor } from 'lucide-react'
import useThemeStore from '@/store/themeStore'
import { useState, useRef, useEffect } from 'react'

const ThemeToggle = () => {
    const { theme, actualTheme, setTheme, setActualTheme } = useThemeStore()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    const themes = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'system', label: 'System', icon: Monitor },
    ]

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme)

        let actualTheme = newTheme
        if (newTheme === 'system') {
            actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
        }

        setActualTheme(actualTheme)

        if (actualTheme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }

        setIsOpen(false)
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const currentTheme = themes.find((t) => t.value === theme)
    const CurrentIcon = currentTheme.icon

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn-secondary p-2"
                aria-label="Toggle theme"
            >
                <CurrentIcon className="h-5 w-5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-36 z-50 animate-fade-in">
                    <div className="card py-1 px-0 shadow-lg">
                        {themes.map((themeOption) => {
                            const Icon = themeOption.icon
                            return (
                                <button
                                    key={themeOption.value}
                                    onClick={() => handleThemeChange(themeOption.value)}
                                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors
                    ${theme === themeOption.value
                                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                                            : 'hover:bg-gray-100 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{themeOption.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ThemeToggle
