import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/apiClient'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Check if user is logged in on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        const token = localStorage.getItem('access_token')

        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser))
            } catch (e) {
                console.error('Error parsing stored user:', e)
                localStorage.removeItem('user')
            }
        }
        setLoading(false)
    }, [])

    const login = async (email, password) => {
        setLoading(true)
        setError(null)
        try {
            const response = await authAPI.login(email, password)
            setUser(response.user)
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
            setUser(null)
        } catch (err) {
            console.error('Logout error:', err)
        } finally {
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
