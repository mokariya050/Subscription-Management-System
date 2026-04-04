import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AppPage from './AppPage'

export default function ProtectedAppPage({ children, ...pageProps }) {
    const { user, loading, logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (loading) {
            return // Still loading auth, wait
        }

        if (!user) {
            navigate('/login', { replace: true })
        }
    }, [navigate, user, loading])

    const onLogout = async () => {
        await logout()
        navigate('/login', { replace: true })
    }

    // Show nothing while auth is loading
    if (loading || !user) return null

    return (
        <AppPage {...pageProps} onLogout={onLogout}>
            {children}
        </AppPage>
    )
}
