import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProtectedAppPage from '../components/ProtectedAppPage'
import { productsAPI, subscriptionsAPI } from '../services/apiClient'

export default function SubscriptionOtherInfoScreen() {
    const navigate = useNavigate()
    const [plans, setPlans] = useState([])
    const [loadingPlans, setLoadingPlans] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        planId: '',
        startDate: new Date().toISOString().slice(0, 10),
        paymentMethod: 'online',
        notes: '',
    })

    useEffect(() => {
        const loadPlans = async () => {
            try {
                setLoadingPlans(true)
                const response = await productsAPI.getAllPlans()
                const items = Array.isArray(response.data?.items) ? response.data.items : []
                setPlans(items)

                if (items.length > 0) {
                    setFormData((prev) => ({ ...prev, planId: String(items[0].id) }))
                }
            } catch (err) {
                setError(err.message || 'Failed to load plans')
            } finally {
                setLoadingPlans(false)
            }
        }

        loadPlans()
    }, [])

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
                    notes: formData.notes,
                },
            })

            const subscriptionId = response.data?.subscription?.id
            const invoiceId = response.data?.invoice?.id
            const query = new URLSearchParams()

            if (subscriptionId) query.set('subscriptionId', String(subscriptionId))
            if (invoiceId) query.set('invoiceId', String(invoiceId))

            navigate(`/invoice/new/payment${query.toString() ? `?${query.toString()}` : ''}`)
        } catch (err) {
            setError(err.message || 'Failed to create subscription')
        } finally {
            setSaving(false)
        }
    }

    return (
        <ProtectedAppPage
            current="subscriptions"
            title="Create Subscription"
            subtitle="Save subscription first, then continue to payment"
            maxWidth="max-w-3xl"
        >
            {error && (
                <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
                    {error}
                </div>
            )}

            {loadingPlans ? (
                <div className="bg-white border border-[#e5e3df] rounded-xl p-8 text-center text-slate-500">
                    Loading plans...
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
                            onClick={() => navigate('/home')}
                            className="px-5 py-2 border border-[#d0cec9] rounded-md text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || plans.length === 0}
                            className="px-5 py-2 bg-[#1b2d4f] text-white rounded-md text-sm font-semibold disabled:opacity-60"
                        >
                            {saving ? 'Saving...' : 'Save Subscription & Continue'}
                        </button>
                    </div>
                </form>
            )}
        </ProtectedAppPage>
    )
}
