import { useEffect, useState } from 'react'
import ProtectedAppPage from '../components/ProtectedAppPage'
import { configurationAPI } from '../services/apiClient'

export default function PaymentTermDetailScreen() {
    const [terms, setTerms] = useState([])
    const [selectedId, setSelectedId] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        name: '',
        early_discount_type: 'percent',
        early_discount_value: '0',
        due_after_days: '0',
    })

    const loadData = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await configurationAPI.getPaymentTerms()
            const items = Array.isArray(response.data) ? response.data : []
            setTerms(items)

            if (items.length > 0) {
                const first = items[0]
                setSelectedId(String(first.id))
                setForm({
                    name: first.name || '',
                    early_discount_type: first.early_discount_type || 'percent',
                    early_discount_value: String(first.early_discount_value ?? 0),
                    due_after_days: String(first.due_after_days ?? 0),
                })
            }
        } catch (err) {
            setError(err.message || 'Failed to load payment terms')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const selectTerm = (termId) => {
        setSelectedId(String(termId))
        const selected = terms.find((row) => String(row.id) === String(termId))
        if (!selected) return

        setForm({
            name: selected.name || '',
            early_discount_type: selected.early_discount_type || 'percent',
            early_discount_value: String(selected.early_discount_value ?? 0),
            due_after_days: String(selected.due_after_days ?? 0),
        })
    }

    const onNew = () => {
        setSelectedId('')
        setForm({
            name: '',
            early_discount_type: 'percent',
            early_discount_value: '0',
            due_after_days: '0',
        })
    }

    const onSave = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) {
            setError('Payment term name is required')
            return
        }

        try {
            setSaving(true)
            setError('')

            const payload = {
                name: form.name.trim(),
                early_discount_type: form.early_discount_type,
                early_discount_value: Number(form.early_discount_value || 0),
                due_after_days: Number(form.due_after_days || 0),
            }

            if (selectedId) {
                await configurationAPI.updatePaymentTerm(selectedId, payload)
            } else {
                await configurationAPI.createPaymentTerm(payload)
            }

            await loadData()
        } catch (err) {
            setError(err.message || 'Failed to save payment term')
        } finally {
            setSaving(false)
        }
    }

    return (
        <ProtectedAppPage
            current="settings"
            title="Payment term"
            subtitle="Manage early discount and due term rules"
            maxWidth="max-w-6xl"
            actions={<button type="button" onClick={onNew} className="bg-[#1b2d4f] text-white px-4 py-2 rounded-md text-sm">New</button>}
        >
            {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

            {loading ? (
                <div className="bg-white border border-[#e5e3df] rounded-xl p-8 text-center text-slate-500">Loading payment terms...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white border border-[#e5e3df] rounded-xl p-5">
                        <h3 className="font-bold mb-3">Terms</h3>
                        <div className="space-y-2 max-h-[420px] overflow-y-auto">
                            {terms.length === 0 ? (
                                <p className="text-sm text-slate-500">No payment terms yet.</p>
                            ) : terms.map((row) => (
                                <button
                                    key={row.id}
                                    type="button"
                                    onClick={() => selectTerm(row.id)}
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
                            placeholder="Payment term name"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                                value={form.early_discount_type}
                                onChange={(e) => setForm((prev) => ({ ...prev, early_discount_type: e.target.value }))}
                                className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                            >
                                <option value="percent">Early discount: Percent</option>
                                <option value="fixed">Early discount: Fixed</option>
                            </select>
                            <input
                                type="number"
                                step="0.01"
                                value={form.early_discount_value}
                                onChange={(e) => setForm((prev) => ({ ...prev, early_discount_value: e.target.value }))}
                                className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                                placeholder="Early discount value"
                            />
                        </div>

                        <input
                            type="number"
                            min="0"
                            value={form.due_after_days}
                            onChange={(e) => setForm((prev) => ({ ...prev, due_after_days: e.target.value }))}
                            className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                            placeholder="Due after days"
                        />

                        <div className="flex justify-end">
                            <button type="submit" disabled={saving} className="bg-[#1b2d4f] text-white px-4 py-2 rounded-md text-sm disabled:opacity-60">
                                {saving ? 'Saving...' : (selectedId ? 'Update Payment Term' : 'Create Payment Term')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </ProtectedAppPage>
    )
}
