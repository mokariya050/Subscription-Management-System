import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ProtectedAppPage from '../components/ProtectedAppPage'
import { configurationAPI, invoicesAPI, productsAPI, subscriptionsAPI } from '../services/apiClient'
import { printInvoiceDocument } from '../utils/invoicePrint'

const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A'
    return new Date(dateValue).toLocaleDateString()
}

const formatMoney = (cents) => `$${((Number(cents) || 0) / 100).toFixed(2)}`

export default function SubscriptionOtherInfoScreen() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const subscriptionId = searchParams.get('id')

    const [plans, setPlans] = useState([])
    const [paymentTerms, setPaymentTerms] = useState([])
    const [loadingPlans, setLoadingPlans] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [subscription, setSubscription] = useState(null)
    const [invoices, setInvoices] = useState([])
    const [sendingInvoiceId, setSendingInvoiceId] = useState(null)

    const [formData, setFormData] = useState({
        planId: '',
        paymentTermId: '',
        startDate: new Date().toISOString().slice(0, 10),
        paymentMethod: 'online',
        notes: '',
    })

    useEffect(() => {
        const loadPlansAndData = async () => {
            try {
                setLoadingPlans(true)
                setError('')

                const [plansResponse, termsResponse, subscriptionResponse, invoicesResponse] = await Promise.all([
                    productsAPI.getAllPlans(),
                    configurationAPI.getPaymentTerms(),
                    subscriptionId ? subscriptionsAPI.getById(subscriptionId) : Promise.resolve({ data: null }),
                    subscriptionId ? subscriptionsAPI.getInvoices(subscriptionId) : Promise.resolve({ data: [] }),
                ])

                const items = Array.isArray(plansResponse.data?.items) ? plansResponse.data.items : []
                const terms = Array.isArray(termsResponse.data) ? termsResponse.data : []
                setPlans(items)
                setPaymentTerms(terms)
                setSubscription(subscriptionResponse.data || null)
                setInvoices(Array.isArray(invoicesResponse.data) ? invoicesResponse.data : [])

                if (!subscriptionId && items.length > 0) {
                    setFormData((prev) => ({
                        ...prev,
                        planId: String(items[0].id),
                        paymentTermId: terms[0] ? String(terms[0].id) : '',
                    }))
                }
            } catch (err) {
                setError(err.message || 'Failed to load subscription page')
            } finally {
                setLoadingPlans(false)
            }
        }

        loadPlansAndData()
    }, [subscriptionId])

    const selectedPlan = useMemo(
        () => plans.find((plan) => String(plan.id) === String(formData.planId)) || null,
        [formData.planId, plans],
    )

    const onChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const onCreateSubscription = async (e) => {
        e.preventDefault()

        if (!formData.planId) {
            setError('Please select a plan')
            return
        }

        try {
            setSaving(true)
            setError('')

            const response = await subscriptionsAPI.create({
                plan_id: Number(formData.planId),
                metadata: {
                    start_date: formData.startDate,
                    payment_method: formData.paymentMethod,
                    payment_term_id: formData.paymentTermId ? Number(formData.paymentTermId) : null,
                    notes: formData.notes,
                },
            })

            const subscriptionId = response.data?.subscription?.id
            const invoiceId = response.data?.invoice?.id
            if (subscriptionId) {
                navigate(`/internal/subscription/other-info?id=${subscriptionId}`, { replace: true })
                return
            }

            if (invoiceId) {
                navigate(`/internal/invoice/new/payment?invoiceId=${invoiceId}`)
                return
            }

            navigate('/internal/home')
        } catch (err) {
            setError(err.message || 'Failed to create subscription')
        } finally {
            setSaving(false)
        }
    }

    const onStatusAction = async (action) => {
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
            setError(err.message || 'Failed to update subscription')
        } finally {
            setSaving(false)
        }
    }

    const onSendInvoice = async (invoiceId) => {
        try {
            setSendingInvoiceId(invoiceId)
            setError('')
            await invoicesAPI.send(invoiceId)
            const response = await subscriptionsAPI.getInvoices(subscriptionId)
            setInvoices(Array.isArray(response.data) ? response.data : [])
        } catch (err) {
            setError(err.message || 'Failed to send invoice')
        } finally {
            setSendingInvoiceId(null)
        }
    }

    const onPrintInvoice = async (invoiceRow) => {
        try {
            setError('')
            const itemsResponse = await invoicesAPI.getItems(invoiceRow.id)
            const lineItems = Array.isArray(itemsResponse.data) ? itemsResponse.data : []
            const printed = printInvoiceDocument({
                invoice: invoiceRow,
                items: lineItems,
                subscription,
                companyName: 'SubSync',
            })

            if (!printed) {
                setError('Unable to open print dialog. Please allow popups and try again.')
            }
        } catch (err) {
            setError(err.message || 'Failed to prepare invoice for printing')
        }
    }

    return (
        <ProtectedAppPage
            current="subscriptions"
            title={subscriptionId ? 'Subscription Form View' : 'Create Subscription'}
            subtitle={subscriptionId ? `Subscription #${subscriptionId}` : 'Save subscription first, then continue to payment'}
            maxWidth="max-w-6xl"
            actions={
                subscriptionId ? (
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={() => navigate('/internal/subscription/other-info')} className="px-4 py-2 border border-[#d0cec9] rounded-md text-sm">New</button>
                        <button type="button" onClick={() => onStatusAction('pause')} disabled={saving} className="px-4 py-2 border border-[#d0cec9] rounded-md text-sm disabled:opacity-60">Pause</button>
                        <button type="button" onClick={() => onStatusAction('resume')} disabled={saving} className="px-4 py-2 border border-[#d0cec9] rounded-md text-sm disabled:opacity-60">Resume</button>
                        <button type="button" onClick={() => onStatusAction('cancel')} disabled={saving} className="px-4 py-2 border border-red-300 text-red-700 rounded-md text-sm disabled:opacity-60">Cancel</button>
                    </div>
                ) : null
            }
        >
            {error && (
                <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
                    {error}
                </div>
            )}

            {loadingPlans ? (
                <div className="bg-white border border-[#e5e3df] rounded-xl p-8 text-center text-slate-500">
                    Loading subscription page...
                </div>
            ) : subscriptionId ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border border-[#e5e3df] rounded-xl p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-500">Status</p>
                                    <p className="font-semibold">{subscription?.status || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Recurring Plan</p>
                                    <p className="font-semibold">{subscription?.plan_id || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Period Start</p>
                                    <p className="font-semibold">{formatDate(subscription?.current_period_start)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Period End</p>
                                    <p className="font-semibold">{formatDate(subscription?.current_period_end)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-[#e5e3df] rounded-xl p-6">
                            <h3 className="text-lg font-bold mb-4">Invoices</h3>
                            <div className="overflow-x-auto border border-[#e5e3df] rounded-md">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-[#e5e3df] text-xs uppercase tracking-wider">
                                            <th className="px-4 py-3">Invoice #</th>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3 text-right">Amount</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-4 text-sm text-slate-500">No invoices for this subscription.</td>
                                            </tr>
                                        ) : (
                                            invoices.map((invoice) => (
                                                <tr key={invoice.id} className="border-b border-[#f0efec]">
                                                    <td className="px-4 py-3 text-sm font-semibold">{invoice.invoice_number}</td>
                                                    <td className="px-4 py-3 text-sm">{formatDate(invoice.invoice_date)}</td>
                                                    <td className="px-4 py-3 text-sm">{invoice.status}</td>
                                                    <td className="px-4 py-3 text-sm text-right">{formatMoney(invoice.total_amount_cents)}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => navigate(`/internal/invoice/new/payment?invoiceId=${invoice.id}&subscriptionId=${subscriptionId}`)}
                                                                className="px-3 py-1.5 border border-[#d0cec9] rounded text-xs"
                                                            >
                                                                Pay
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => onSendInvoice(invoice.id)}
                                                                disabled={sendingInvoiceId === invoice.id}
                                                                className="px-3 py-1.5 border border-[#d0cec9] rounded text-xs disabled:opacity-60"
                                                            >
                                                                {sendingInvoiceId === invoice.id ? 'Sending...' : 'Send'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => onPrintInvoice(invoice)}
                                                                className="px-3 py-1.5 border border-[#d0cec9] rounded text-xs"
                                                            >
                                                                Print
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white border border-[#e5e3df] rounded-xl p-5">
                            <h4 className="font-bold mb-3">Quick Actions</h4>
                            <div className="space-y-2">
                                <button type="button" onClick={() => navigate('/internal/invoice/new')} className="w-full px-4 py-2 border border-[#d0cec9] rounded-md text-sm">New Invoice</button>
                                <button type="button" onClick={() => navigate('/internal/home')} className="w-full px-4 py-2 border border-[#d0cec9] rounded-md text-sm">Back to Subscriptions</button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={onCreateSubscription} className="bg-white border border-[#e5e3df] rounded-xl p-8 space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-wider font-bold mb-2">Plan *</label>
                        <select
                            value={formData.planId}
                            onChange={(e) => onChange('planId', e.target.value)}
                            className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                            required
                        >
                            {plans.length === 0 ? (
                                <option value="">No plans available</option>
                            ) : (
                                plans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name} ({plan.interval})
                                    </option>
                                ))
                            )}
                        </select>
                        {selectedPlan && (
                            <p className="text-xs text-slate-500 mt-2">
                                Price: {formatMoney(selectedPlan.price_cents)} | Interval: {selectedPlan.interval}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-bold mb-2">Start Date</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => onChange('startDate', e.target.value)}
                                className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-bold mb-2">Payment Term</label>
                            <select
                                value={formData.paymentTermId}
                                onChange={(e) => onChange('paymentTermId', e.target.value)}
                                className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                            >
                                {paymentTerms.length === 0 ? (
                                    <option value="">No payment terms configured</option>
                                ) : (
                                    paymentTerms.map((term) => (
                                        <option key={term.id} value={term.id}>{term.name}</option>
                                    ))
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-bold mb-2">Payment Method</label>
                            <select
                                value={formData.paymentMethod}
                                onChange={(e) => onChange('paymentMethod', e.target.value)}
                                className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                            >
                                <option value="online">Online</option>
                                <option value="upi">UPI</option>
                                <option value="cash">Cash</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider font-bold mb-2">Notes</label>
                        <textarea
                            rows={4}
                            value={formData.notes}
                            onChange={(e) => onChange('notes', e.target.value)}
                            className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                            placeholder="Optional notes for this subscription"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate('/internal/home')}
                            className="px-5 py-2 border border-[#d0cec9] rounded-md text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || plans.length === 0}
                            className="px-5 py-2 bg-[#1b2d4f] text-white rounded-md text-sm font-semibold disabled:opacity-60"
                        >
                            {saving ? 'Saving...' : 'Create Subscription'}
                        </button>
                    </div>
                </form>
            )}
        </ProtectedAppPage>
    )
}
