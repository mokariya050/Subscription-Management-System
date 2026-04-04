import { useEffect, useState } from 'react'
import ProtectedAppPage from '../components/ProtectedAppPage'
import { configurationAPI, productsAPI } from '../services/apiClient'

export default function DiscountDetailScreen() {
    const [discounts, setDiscounts] = useState([])
    const [plans, setPlans] = useState([])
    const [selectedId, setSelectedId] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        name: '',
        value_type: 'percentage',
        value: '0',
        recurring_plan_id: '',
        notes: '',
    })

    const loadData = async () => {
        try {
            setLoading(true)
            setError('')
            const [discountRes, planRes] = await Promise.all([
                configurationAPI.getDiscounts(),
                productsAPI.getAllPlans(),
            ])

            const nextDiscounts = Array.isArray(discountRes.data) ? discountRes.data : []
            const nextPlans = Array.isArray(planRes.data?.items) ? planRes.data.items : []
            setDiscounts(nextDiscounts)
            setPlans(nextPlans)

            if (nextDiscounts.length > 0) {
                const first = nextDiscounts[0]
                setSelectedId(String(first.id))
                setForm({
                    name: first.name || '',
                    value_type: first.value_type || 'percentage',
                    value: String(first.value ?? 0),
                    recurring_plan_id: first.recurring_plan_id ? String(first.recurring_plan_id) : '',
                    notes: first.notes || '',
                })
            }
        } catch (err) {
            setError(err.message || 'Failed to load discounts')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const selectDiscount = (discountId) => {
        setSelectedId(String(discountId))
        const selected = discounts.find((row) => String(row.id) === String(discountId))
        if (!selected) return

        setForm({
            name: selected.name || '',
            value_type: selected.value_type || 'percentage',
            value: String(selected.value ?? 0),
            recurring_plan_id: selected.recurring_plan_id ? String(selected.recurring_plan_id) : '',
            notes: selected.notes || '',
        })
    }

    const onNew = () => {
        setSelectedId('')
        setForm({
            name: '',
            value_type: 'percentage',
            value: '0',
            recurring_plan_id: '',
            notes: '',
        })
    }

    const onSave = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) {
            setError('Discount name is required')
            return
        }

        try {
            setSaving(true)
            setError('')

            const payload = {
                name: form.name.trim(),
                value_type: form.value_type,
                value: Number(form.value || 0),
                recurring_plan_id: form.recurring_plan_id ? Number(form.recurring_plan_id) : null,
                notes: form.notes || null,
            }

            if (selectedId) {
                await configurationAPI.updateDiscount(selectedId, payload)
            } else {
                await configurationAPI.createDiscount(payload)
            }

            await loadData()
        } catch (err) {
            setError(err.message || 'Failed to save discount. Admin role is required to create/update.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <ProtectedAppPage
            current="settings"
            title="Discount Page"
            subtitle="Discount records are admin-managed configuration"
            maxWidth="max-w-6xl"
            actions={<button type="button" onClick={onNew} className="bg-[#1b2d4f] text-white px-4 py-2 rounded-md text-sm">New</button>}
        >
            {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

            {loading ? (
                <div className="bg-white border border-[#e5e3df] rounded-xl p-8 text-center text-slate-500">Loading discounts...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white border border-[#e5e3df] rounded-xl p-5">
                        <h3 className="font-bold mb-3">Discounts</h3>
                        <div className="space-y-2 max-h-[420px] overflow-y-auto">
                            {discounts.length === 0 ? (
                                <p className="text-sm text-slate-500">No discounts yet.</p>
                            ) : discounts.map((row) => (
                                <button
                                    key={row.id}
                                    type="button"
                                    onClick={() => selectDiscount(row.id)}
                                    className={`w-full text-left px-3 py-2 rounded border text-sm ${String(row.id) === selectedId ? 'border-[#1b2d4f] bg-[#f5f3ef]' : 'border-[#e5e3df]'}`}
                                >
                                    {row.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={onSave} className="lg:col-span-2 bg-white border border-[#e5e3df] rounded-xl p-6 space-y-4">
                        <input
                            value={form.name}
                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                            className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                            placeholder="Discount name"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                                value={form.value_type}
                                onChange={(e) => setForm((prev) => ({ ...prev, value_type: e.target.value }))}
                                className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                            >
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed amount</option>
                            </select>
                            <input
                                type="number"
                                step="0.01"
                                value={form.value}
                                onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
                                className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                                placeholder="Value"
                            />
                        </div>

                        <select
                            value={form.recurring_plan_id}
                            onChange={(e) => setForm((prev) => ({ ...prev, recurring_plan_id: e.target.value }))}
                            className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                        >
                            <option value="">Linked recurring plan (optional)</option>
                            {plans.map((plan) => (
                                <option key={plan.id} value={plan.id}>{plan.name}</option>
                            ))}
                        </select>

                        <textarea
                            rows={4}
                            value={form.notes}
                            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                            className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                            placeholder="Notes"
                        />

                        <p className="text-xs text-slate-500">Only admin users can create or edit discounts.</p>

                        <div className="flex justify-end">
                            <button type="submit" disabled={saving} className="bg-[#1b2d4f] text-white px-4 py-2 rounded-md text-sm disabled:opacity-60">
                                {saving ? 'Saving...' : (selectedId ? 'Update Discount' : 'Create Discount')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </ProtectedAppPage>
    )
}
