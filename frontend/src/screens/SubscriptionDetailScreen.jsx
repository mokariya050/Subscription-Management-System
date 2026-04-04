import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { subscriptionsAPI } from '../services/apiClient'
import AppPage from '../components/AppPage'

export default function SubscriptionDetailScreen() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const subscriptionId = searchParams.get('id')

    const [subscription, setSubscription] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!user) {
            navigate('/login', { replace: true })
            return
        }

        const load = async () => {
            if (!subscriptionId) {
                setError('Missing subscription id in URL')
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                const response = await subscriptionsAPI.getById(subscriptionId)
                setSubscription(response.data || null)
            } catch (err) {
                setError(err.message || 'Failed to load subscription details')
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [navigate, subscriptionId, user])

    const updateStatus = async (action) => {
        if (!subscriptionId) return
        try {
            setSaving(true)
            setError('')
            if (action === 'pause') await subscriptionsAPI.pause(subscriptionId)
            if (action === 'resume') await subscriptionsAPI.resume(subscriptionId)
            if (action === 'cancel') await subscriptionsAPI.cancel(subscriptionId)
            const response = await subscriptionsAPI.getById(subscriptionId)
            setSubscription(response.data || null)
        } catch (err) {
            setError(err.message || 'Failed to update subscription status')
        } finally {
            setSaving(false)
        }
    }

    const statusTone = useMemo(() => {
        const status = String(subscription?.status || '').toLowerCase()
        if (status === 'active') return 'bg-green-100 text-green-800'
        if (status === 'paused') return 'bg-yellow-100 text-yellow-800'
        if (status === 'cancelled') return 'bg-red-100 text-red-800'
        return 'bg-slate-100 text-slate-700'
    }, [subscription])

    const onLogout = async () => {
        await logout()
        navigate('/login', { replace: true })
    }

    return (
        <AppPage
            current="subscriptions"
            onLogout={onLogout}
            maxWidth="max-w-5xl"
            title="Subscription Detail"
            subtitle={subscriptionId ? `Subscription #${subscriptionId}` : 'Details'}
            actions={<Link to="/invoice/new" className="px-4 py-1.5 bg-[#1b2d4f] text-white rounded-full text-sm">Create Invoice</Link>}
        >
            {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

            {loading ? (
                <div className="py-10 text-center text-slate-500">Loading subscription...</div>
            ) : !subscription ? (
                <div className="bg-white border border-[#e5e3df] rounded-xl p-8 text-center">Subscription not found.</div>
            ) : (
                <div className="bg-white border border-[#e5e3df] rounded-xl p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-serif font-bold">Subscription #{subscription.id}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusTone}`}>{subscription.status || 'unknown'}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                        <div>
                            <p className="text-slate-500">Customer</p>
                            <p className="font-medium">{subscription.customer_name || subscription.user_id || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-slate-500">Plan</p>
                            <p className="font-medium">{subscription.plan_name || subscription.plan_id || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-slate-500">Start Date</p>
                            <p className="font-medium">{subscription.start_date ? new Date(subscription.start_date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-slate-500">Next Invoice</p>
                            <p className="font-medium">{subscription.next_invoice_date ? new Date(subscription.next_invoice_date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-2">
                        <button disabled={saving} onClick={() => updateStatus('pause')} className="px-4 py-2 border border-[#d0cec9] rounded-md text-sm">Pause</button>
                        <button disabled={saving} onClick={() => updateStatus('resume')} className="px-4 py-2 border border-[#d0cec9] rounded-md text-sm">Resume</button>
                        <button disabled={saving} onClick={() => updateStatus('cancel')} className="px-4 py-2 border border-red-300 text-red-700 rounded-md text-sm">Cancel</button>
                    </div>
                </div>
            )}
        </AppPage>
    )
}
