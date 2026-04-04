import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { configurationAPI, invoicesAPI, subscriptionsAPI } from '../services/apiClient'
import AppPage from '../components/AppPage'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import DataTable from '../components/ui/DataTable'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'

const formatDate = (value) => {
    if (!value) return 'N/A'
    return new Date(value).toLocaleDateString()
}

const formatMoney = (cents) => `$${((Number(cents) || 0) / 100).toFixed(2)}`

export default function SubscriptionDetailScreen() {
    const { user, loading: authLoading, logout } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const subscriptionId = searchParams.get('id')

    const [subscription, setSubscription] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)
    const [invoices, setInvoices] = useState([])
    const [invoiceItems, setInvoiceItems] = useState([])
    const [paymentTerm, setPaymentTerm] = useState(null)

    useEffect(() => {
        if (authLoading) {
            return // Still loading auth, wait
        }

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
                const [subscriptionRes, invoicesRes] = await Promise.all([
                    subscriptionsAPI.getById(subscriptionId),
                    subscriptionsAPI.getInvoices(subscriptionId),
                ])

                const subscriptionData = subscriptionRes.data || null
                const invoiceList = Array.isArray(invoicesRes.data) ? invoicesRes.data : []
                setSubscription(subscriptionData)
                setInvoices(invoiceList)

                if (invoiceList[0]?.id) {
                    const itemsRes = await invoicesAPI.getItems(invoiceList[0].id)
                    setInvoiceItems(Array.isArray(itemsRes.data) ? itemsRes.data : [])
                } else {
                    setInvoiceItems([])
                }

                const paymentTermId = subscriptionData?.metadata?.payment_term_id
                if (paymentTermId) {
                    const termRes = await configurationAPI.getPaymentTerms()
                    const terms = Array.isArray(termRes.data) ? termRes.data : []
                    const matched = terms.find((term) => Number(term.id) === Number(paymentTermId)) || null
                    setPaymentTerm(matched)
                } else {
                    setPaymentTerm(null)
                }
            } catch (err) {
                setError(err.message || 'Failed to load subscription details')
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [navigate, subscriptionId, user, authLoading])

    const updateStatus = async (action) => {
        if (!subscriptionId) return
        try {
            setSaving(true)
            setError('')
            if (action === 'pause') await subscriptionsAPI.pause(subscriptionId)
            if (action === 'resume') await subscriptionsAPI.resume(subscriptionId)
            if (action === 'cancel') await subscriptionsAPI.cancel(subscriptionId)
            const [subRes, invoicesRes] = await Promise.all([
                subscriptionsAPI.getById(subscriptionId),
                subscriptionsAPI.getInvoices(subscriptionId),
            ])
            setSubscription(subRes.data || null)
            const list = Array.isArray(invoicesRes.data) ? invoicesRes.data : []
            setInvoices(list)
            if (list[0]?.id) {
                const itemsRes = await invoicesAPI.getItems(list[0].id)
                setInvoiceItems(Array.isArray(itemsRes.data) ? itemsRes.data : [])
            }
        } catch (err) {
            setError(err.message || 'Failed to update subscription status')
        } finally {
            setSaving(false)
        }
    }

    const statusVariant = useMemo(() => {
        const status = String(subscription?.status || '').toLowerCase()
        if (status === 'active') return 'success'
        if (status === 'paused') return 'warning'
        if (status === 'cancelled') return 'danger'
        return 'neutral'
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
            title="Subscription"
            subtitle={subscriptionId ? `Subscription number #${subscriptionId}` : 'Details'}
            actions={
                <Link
                    to="/invoice/new"
                    className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    Create invoice
                </Link>
            }
        >
            {error ? <Alert variant="error" className="mb-6">{error}</Alert> : null}

            {loading ? (
                <div className="rounded-[1.75rem] border border-dashed border-outline-variant bg-white/70 py-14 text-center text-sm text-on-surface-variant">
                    Loading subscription...
                </div>
            ) : !subscription ? (
                <Card className="p-8 text-center">Subscription not found.</Card>
            ) : (
                <Card className="space-y-6 p-6 sm:p-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">Subscription</p>
                            <h2 className="mt-2 font-serif text-3xl font-bold text-primary">Subscription number #{subscription.id}</h2>
                        </div>
                        <Badge variant={statusVariant}>{subscription.status || 'unknown'}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                        <div>
                            <p className="text-slate-500">Customer</p>
                            <p className="font-medium">{subscription.customer_name || subscription.user_id || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-slate-500">Expiration</p>
                            <p className="font-medium">{formatDate(subscription.current_period_end)}</p>
                        </div>
                        <div>
                            <p className="text-slate-500">Quotation date</p>
                            <p className="font-medium">{formatDate(invoices[0]?.invoice_date)}</p>
                        </div>
                        <div>
                            <p className="text-slate-500">Recurring Plan</p>
                            <p className="font-medium">{subscription.plan_name || subscription.plan_id || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-slate-500">Payment Term</p>
                            <p className="font-medium">{paymentTerm?.name || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="pt-2">
                        <h3 className="mb-3 font-semibold text-primary">Order lines</h3>
                        <DataTable
                            caption="Invoice items"
                            rows={invoiceItems}
                            emptyMessage="No invoice lines available."
                            columns={[
                                { key: 'description', label: 'Product', render: (item) => item.description || 'demo' },
                                { key: 'quantity', label: 'Quantity', cellClassName: 'text-right', headerClassName: 'text-right', render: (item) => item.quantity || 1 },
                                { key: 'unit_price_cents', label: 'Unit price', cellClassName: 'text-right', headerClassName: 'text-right', render: (item) => formatMoney(item.unit_price_cents) },
                                { key: 'discount', label: 'Discount', cellClassName: 'text-right', headerClassName: 'text-right', render: () => '-' },
                                { key: 'taxes', label: 'Taxes', cellClassName: 'text-right', headerClassName: 'text-right', render: () => '-' },
                                { key: 'amount_cents', label: 'Amount', cellClassName: 'text-right font-semibold', headerClassName: 'text-right', render: (item) => formatMoney(item.amount_cents) },
                            ]}
                        />
                    </div>

                    <div className="pt-2 flex flex-wrap gap-2">
                        <Button variant="secondary" disabled={saving} onClick={() => updateStatus('pause')}>
                            Pause
                        </Button>
                        <Button variant="secondary" disabled={saving} onClick={() => updateStatus('resume')}>
                            Resume
                        </Button>
                        <Button variant="danger" disabled={saving} onClick={() => updateStatus('cancel')}>
                            Cancel
                        </Button>
                    </div>
                </Card>
            )}

            {paymentTerm && (
                <Card className="mt-8 p-6 sm:p-8">
                    <h3 className="mb-4 font-serif text-2xl font-bold text-primary">Payment term</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                        <div>
                            <p className="text-slate-500">Early discount</p>
                            <p className="font-medium">
                                {paymentTerm.early_discount_type === 'percent'
                                    ? `${paymentTerm.early_discount_value}%`
                                    : `$${Number(paymentTerm.early_discount_value || 0).toFixed(2)}`}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-500">Due term</p>
                            <p className="font-medium">{paymentTerm.due_after_days} day(s) after invoice creation</p>
                        </div>
                    </div>
                </Card>
            )}
        </AppPage>
    )
}
