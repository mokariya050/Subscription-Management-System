import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { authAPI } from '../services/apiClient'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const refreshIntervalRef = useRef(null)

    // Helper to clear all auth data
    const clearAuthData = () => {
        setUser(null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        localStorage.removeItem('token_expires_at')
    }

    // Helper to restore session from stored tokens
    const restoreSession = () => {
        const storedUser = localStorage.getItem('user')
        const token = localStorage.getItem('access_token')
        const expiresAt = localStorage.getItem('token_expires_at')

        if (storedUser && token) {
            // Check if token hasn't expired
            if (expiresAt && Date.now() > parseInt(expiresAt)) {
                console.log('Token expired, clearing session')
                clearAuthData()
                return false
            }

            try {
                setUser(JSON.parse(storedUser))
                return true
            } catch (e) {
                console.error('Error parsing stored user:', e)
                clearAuthData()
                return false
            }
        }
        return false
    }

    // Check if user is logged in on mount and set up refresh interval
    useEffect(() => {
        restoreSession()
        setLoading(false)

        // Set up periodic token refresh (every 50 minutes) to keep session alive
        refreshIntervalRef.current = setInterval(async () => {
            const token = localStorage.getItem('access_token')
            const refreshToken = localStorage.getItem('refresh_token')

            if (token && refreshToken) {
                try {
                    const response = await authAPI.refresh()
                    localStorage.setItem('token_expires_at', Date.now() + (59 * 60 * 1000))
                    console.log('Token refreshed successfully')
                } catch (err) {
                    console.log('Token refresh failed, clearing session')
                    clearAuthData()
                }
            }
        }, 50 * 60 * 1000) // 50 minutes

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current)
            }
        }
    }, [])

    const login = async (email, password) => {
        setLoading(true)
        setError(null)
        try {
            const response = await authAPI.login(email, password)
            setUser(response.user)
            // Set token expiration time (59 minutes from now)
            localStorage.setItem('token_expires_at', Date.now() + (59 * 60 * 1000))
            return response
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const register = async (userData) => {
        setLoading(true)
        setError(null)
        try {
            const response = await authAPI.register(userData)
            setUser(response.user)
            // Set token expiration time (59 minutes from now)
            localStorage.setItem('token_expires_at', Date.now() + (59 * 60 * 1000))
            return response
        } catch (err) {
            setError(err.message)
            throw err
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        setLoading(true)
        try {
            await authAPI.logout()
        } catch (err) {
            console.error('Logout error:', err)
        } finally {
            clearAuthData()
            // Clean up refresh interval
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current)
            }
            setLoading(false)
        }
    }

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
