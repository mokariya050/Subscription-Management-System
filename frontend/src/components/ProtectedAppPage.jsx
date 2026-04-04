import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AppPage from './AppPage'

export default function ProtectedAppPage({ children, ...pageProps }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (!user) {
            navigate('/login', { replace: true })
        }
    }, [navigate, user])

    const onLogout = async () => {
        await logout()
        navigate('/login', { replace: true })
    }

    if (!user) return null

    return (
        <AppPage {...pageProps} onLogout={onLogout}>
            {children}
        </AppPage>
    )
}
