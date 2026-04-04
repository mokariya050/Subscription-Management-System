import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { subscriptionsAPI } from '../services/apiClient'
import AppPage from '../components/AppPage'
import DataTable from '../components/ui/DataTable'
import EmptyState from '../components/ui/EmptyState'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

export default function HomeScreen() {
    const { user, loading: authLoading, logout } = useAuth()
    const navigate = useNavigate()
    const [subscriptions, setSubscriptions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const stats = useMemo(() => {
        const total = subscriptions.length
        const active = subscriptions.filter((sub) => sub.status === 'active').length
        const paused = subscriptions.filter((sub) => sub.status === 'paused').length

        return [
            { label: 'Total subscriptions', value: total },
            { label: 'Active', value: active },
            { label: 'Paused', value: paused },
        ]
    }, [subscriptions])

    // Wait for auth to load, then check authentication
    useEffect(() => {
        if (authLoading) {
            return // Still loading auth, wait
        }

        if (!user) {
            navigate('/login', { replace: true })
            return
        }

        const load = async () => {
            try {
                setLoading(true)
                const response = await subscriptionsAPI.getAll()
                setSubscriptions(Array.isArray(response.data?.items) ? response.data.items : [])
            } catch (err) {
                setError(err.message || 'Failed to load subscriptions')
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [navigate, user, authLoading])

    const onLogout = async () => {
        await logout()
        navigate('/login', { replace: true })
    }

    return (
        <AppPage
            current="subscriptions"
            onLogout={onLogout}
            title="Subscriptions"
            subtitle="Live data from backend API"
            actions={
                <Link
                    to="/subscription/other-info"
                    className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    New subscription
                </Link>
            }
        >

            {error ? <div className="mb-6 rounded-2xl border border-error/20 bg-error-container px-4 py-3 text-sm text-on-error-container">{error}</div> : null}

            <div className="mb-6 grid gap-4 md:grid-cols-3">
                {stats.map((item) => (
                    <Card key={item.label} className="p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">{item.label}</p>
                        <p className="mt-3 font-serif text-3xl font-bold text-primary">{item.value}</p>
                    </Card>
                ))}
            </div>

            {loading ? (
                <div className="rounded-[1.75rem] border border-dashed border-outline-variant bg-white/70 py-14 text-center text-sm text-on-surface-variant">
                    Loading subscriptions...
                </div>
            ) : subscriptions.length === 0 ? (
                <EmptyState
                    title="No subscriptions yet"
                    description="Create a subscription to see activity, status, and invoices appear here."
                    actionLabel="Create subscription"
                    onAction={() => navigate('/subscription/other-info')}
                />
            ) : (
                <DataTable
                    caption="Subscription list"
                    rows={subscriptions}
                    getRowKey={(sub) => sub.id}
                    onRowClick={(sub) => navigate(`/subscription/detail?id=${sub.id}`)}
                    emptyMessage="No subscriptions available."
                    columns={[
                        { key: 'id', label: 'ID', render: (sub) => <span className="font-semibold text-primary">#{sub.id}</span> },
                        { key: 'customer_name', label: 'Customer', render: (sub) => sub.customer_name || 'N/A' },
                        { key: 'plan_name', label: 'Plan', render: (sub) => sub.plan_name || 'N/A' },
                        {
                            key: 'status',
                            label: 'Status',
                            render: (sub) => {
                                const status = String(sub.status || 'unknown').toLowerCase()
                                const variant = status === 'active' ? 'success' : status === 'paused' ? 'warning' : status === 'cancelled' ? 'danger' : 'neutral'
                                return <Badge variant={variant}>{status}</Badge>
                            },
                        },
                    ]}
                />
            )}
        </AppPage>
    )
}
