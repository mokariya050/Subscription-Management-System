import { useEffect, useMemo, useState } from 'react'
import ProtectedAppPage from '../components/ProtectedAppPage'
import { productsAPI } from '../services/apiClient'

export default function RecurringPlanDetailScreen() {
    const [plans, setPlans] = useState([])
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [formOpen, setFormOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        product_id: '',
        name: '',
        price_cents: '',
        interval: 'monthly',
        interval_count: '1',
        trial_days: '0',
    })

    const productLookup = useMemo(() => {
        const map = new Map()
        products.forEach((product) => map.set(product.id, product.name))
        return map
    }, [products])

    const loadData = async () => {
        try {
            setLoading(true)
            setError('')
            const [plansResponse, productsResponse] = await Promise.all([
                productsAPI.getAllPlans(),
                productsAPI.getAll(),
            ])

            setPlans(Array.isArray(plansResponse.data?.items) ? plansResponse.data.items : [])
            setProducts(Array.isArray(productsResponse.data?.items) ? productsResponse.data.items : [])
        } catch (err) {
            setError(err.message || 'Failed to load recurring plans')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const onCreate = async (event) => {
        event.preventDefault()
        if (!form.product_id || !form.name || !form.price_cents) {
            setError('Product, plan name, and price are required')
            return
        }

        try {
            setSaving(true)
            setError('')
            await productsAPI.createPlan({
                product_id: Number(form.product_id),
                name: form.name.trim(),
                price_cents: Number(form.price_cents),
                interval: form.interval,
                interval_count: Number(form.interval_count || 1),
                trial_days: Number(form.trial_days || 0),
            })

            setForm({
                product_id: '',
                name: '',
                price_cents: '',
                interval: 'monthly',
                interval_count: '1',
                trial_days: '0',
            })
            setFormOpen(false)
            await loadData()
        } catch (err) {
            setError(err.message || 'Failed to create plan')
        } finally {
            setSaving(false)
        }
    }

    const onArchive = async (planId) => {
        try {
            setError('')
            await productsAPI.updatePlan(planId, { is_active: false })
            await loadData()
        } catch (err) {
            setError(err.message || 'Failed to archive plan')
        }
    }

    const onDelete = async (planId) => {
        try {
            setError('')
            await productsAPI.deletePlan(planId)
            await loadData()
        } catch (err) {
            setError(err.message || 'Failed to delete plan')
        }
    }

    return (
        <ProtectedAppPage
            current="settings"
            title="Recurring Plans"
            subtitle="Create plans and manage active records from backend"
        >
            {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

            <div className="mb-4 flex justify-end">
                <button
                    type="button"
                    onClick={() => setFormOpen((prev) => !prev)}
                    className="bg-[#1b2d4f] text-white px-4 py-2 rounded-md text-sm font-semibold"
                >
                    {formOpen ? 'Close' : 'New'}
                </button>
            </div>

            {formOpen && (
                <form onSubmit={onCreate} className="bg-white border border-[#e5e3df] rounded-xl p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <select
                            value={form.product_id}
                            onChange={(e) => setForm((prev) => ({ ...prev, product_id: e.target.value }))}
                            className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                        >
                            <option value="">Select product</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>{product.name}</option>
                            ))}
                        </select>
                        <input
                            value={form.name}
                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                            className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                            placeholder="Plan name"
                        />
                        <input
                            type="number"
                            min="0"
                            value={form.price_cents}
                            onChange={(e) => setForm((prev) => ({ ...prev, price_cents: e.target.value }))}
                            className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                            placeholder="Price (in cents)"
                        />
                        <select
                            value={form.interval}
                            onChange={(e) => setForm((prev) => ({ ...prev, interval: e.target.value }))}
                            className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                        <input
                            type="number"
                            min="1"
                            value={form.interval_count}
                            onChange={(e) => setForm((prev) => ({ ...prev, interval_count: e.target.value }))}
                            className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                            placeholder="Interval count"
                        />
                        <input
                            type="number"
                            min="0"
                            value={form.trial_days}
                            onChange={(e) => setForm((prev) => ({ ...prev, trial_days: e.target.value }))}
                            className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                            placeholder="Trial days"
                        />
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-[#1b2d4f] text-white px-4 py-2 rounded-md text-sm font-semibold disabled:opacity-60"
                        >
                            {saving ? 'Saving...' : 'Create Plan'}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="py-10 text-center text-slate-500">Loading plans...</div>
            ) : plans.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#e5e3df] p-10 text-center">No active recurring plans found.</div>
            ) : (
                <div className="bg-white rounded-xl border border-[#e5e3df] overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#e5e3df] text-xs uppercase tracking-wider">
                                <th className="px-4 py-3">Plan</th>
                                <th className="px-4 py-3">Product</th>
                                <th className="px-4 py-3">Billing</th>
                                <th className="px-4 py-3">Price</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map((plan) => (
                                <tr key={plan.id} className="border-b border-[#f0efec]">
                                    <td className="px-4 py-3 font-semibold">{plan.name}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{productLookup.get(plan.product_id) || `#${plan.product_id}`}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{`${plan.interval_count || 1} ${plan.interval || 'monthly'}`}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{plan.price_cents} cents</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onArchive(plan.id)}
                                                className="px-3 py-1.5 rounded border border-[#d0cec9] text-xs"
                                            >
                                                Archive
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDelete(plan.id)}
                                                className="px-3 py-1.5 rounded border border-red-300 text-red-700 text-xs"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </ProtectedAppPage>
    )
}
