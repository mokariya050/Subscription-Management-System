import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AppPage from './AppPage'

const hasAdminRole = (user) => {
    if (!user) {
        return false
    }

    const roles = user.roles
    if (!Array.isArray(roles)) {
        return false
    }

    return roles.some((role) => {
        if (typeof role === 'string') {
            return role === 'admin'
        }

        return role?.role === 'admin'
    })
}

export default function AdminProtectedAppPage({ children, ...pageProps }) {
    const { user, loading, logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (loading) {
            return
        }

        if (!user) {
            navigate('/internal/login', { replace: true })
            return
        }

        if (!hasAdminRole(user)) {
            navigate('/internal/home', { replace: true })
        }
    }, [navigate, user, loading])

    const onLogout = async () => {
        await logout()
        navigate('/internal/login', { replace: true })
    }

    if (loading || !user || !hasAdminRole(user)) {
        return null
    }

    return (
        <AppPage {...pageProps} onLogout={onLogout}>
            {children}
        </AppPage>
    )
}