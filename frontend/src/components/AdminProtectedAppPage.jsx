import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AppPage from './AppPage'
import { usersAPI } from '../services/apiClient'

const ADMIN_ROLE_VALUES = new Set(['admin', 'administrator', 'super_admin', 'superadmin'])

const normalizeRoleValue = (value) => {
    if (typeof value !== 'string') {
        return ''
    }

    return value.trim().toLowerCase()
}

const roleEntryToValue = (role) => {
    if (typeof role === 'string') {
        return role
    }

    if (!role || typeof role !== 'object') {
        return ''
    }

    return role.role || role.name || role.role_name || role.code || ''
}

const hasAdminRole = (user) => {
    if (!user) {
        return false
    }

    if (user.is_admin === true) {
        return true
    }

    const singleRoleValue = normalizeRoleValue(user.role || user.role_name)
    if (ADMIN_ROLE_VALUES.has(singleRoleValue)) {
        return true
    }

    const roleCollections = [user.roles, user.user_roles, user.permissions]

    for (const collection of roleCollections) {
        if (!Array.isArray(collection)) {
            continue
        }

        const hasMatch = collection.some((role) => {
            const value = normalizeRoleValue(roleEntryToValue(role))
            return ADMIN_ROLE_VALUES.has(value)
        })

        if (hasMatch) {
            return true
        }
    }

    return false
}

export default function AdminProtectedAppPage({ children, ...pageProps }) {
    const { user, loading, logout } = useAuth()
    const navigate = useNavigate()
    const [authorized, setAuthorized] = useState(false)
    const [authorizing, setAuthorizing] = useState(true)

    useEffect(() => {
        let isMounted = true

        if (loading) {
            return
        }

        if (!user) {
            navigate('/internal/login', { replace: true })
            return
        }

        const allowByLocalRole = hasAdminRole(user)
        if (allowByLocalRole) {
            if (isMounted) {
                setAuthorized(true)
                setAuthorizing(false)
            }
            return () => {
                isMounted = false
            }
        }

        // Some sessions contain minimal user payloads without full role objects.
        // Probe an admin-only endpoint before deciding to redirect.
        const verifyAdminAccess = async () => {
            try {
                await usersAPI.getAll()
                if (isMounted) {
                    setAuthorized(true)
                }
            } catch {
                if (isMounted) {
                    setAuthorized(false)
                    navigate('/internal/home', { replace: true })
                }
            } finally {
                if (isMounted) {
                    setAuthorizing(false)
                }
            }
        }

        verifyAdminAccess()

        return () => {
            isMounted = false
        }
    }, [navigate, user, loading])

    const onLogout = async () => {
        await logout()
        navigate('/internal/login', { replace: true })
    }

    if (loading || authorizing || !user || !authorized) {
        return null
    }

    return (
        <AppPage {...pageProps} onLogout={onLogout}>
            {children}
        </AppPage>
    )
}