import { useEffect, useState } from 'react'
import ProtectedAppPage from '../components/ProtectedAppPage'
import { configurationAPI } from '../services/apiClient'

export default function TaxDetailScreen() {
    const [taxes, setTaxes] = useState([])
    const [selectedId, setSelectedId] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        name: '',
        value_type: 'percentage',
        value: '0',
    })

    const loadData = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await configurationAPI.getTaxes()
            const items = Array.isArray(response.data) ? response.data : []
            setTaxes(items)

            if (items.length > 0) {
                const first = items[0]
                setSelectedId(String(first.id))
                setForm({
                    name: first.name || '',
                    value_type: first.value_type || 'percentage',
                    value: String(first.value ?? 0),
                })
            }
        } catch (err) {
            setError(err.message || 'Failed to load taxes')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const selectTax = (taxId) => {
        setSelectedId(String(taxId))
        const selected = taxes.find((row) => String(row.id) === String(taxId))
        if (!selected) return

        setForm({
            name: selected.name || '',
            value_type: selected.value_type || 'percentage',
            value: String(selected.value ?? 0),
        })
    }

    const onNew = () => {
        setSelectedId('')
        setForm({
            name: '',
            value_type: 'percentage',
            value: '0',
        })
    }

    const onSave = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) {
            setError('Tax name is required')
            return
        }

        try {
            setSaving(true)
            setError('')

            const payload = {
                name: form.name.trim(),
                value_type: form.value_type,
                value: Number(form.value || 0),
            }

            if (selectedId) {
                await configurationAPI.updateTax(selectedId, payload)
            } else {
                await configurationAPI.createTax(payload)
            }

            await loadData()
        } catch (err) {
            setError(err.message || 'Failed to save tax')
        } finally {
            setSaving(false)
        }
    }

    return (
        <ProtectedAppPage
            current="settings"
            title="Taxes Page"
            subtitle="Maintain tax rules used in invoice calculations"
            maxWidth="max-w-6xl"
            actions={<button type="button" onClick={onNew} className="bg-[#1b2d4f] text-white px-4 py-2 rounded-md text-sm">New</button>}
        >
            {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

            {loading ? (
                <div className="bg-white border border-[#e5e3df] rounded-xl p-8 text-center text-slate-500">Loading taxes...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white border border-[#e5e3df] rounded-xl p-5">
                        <h3 className="font-bold mb-3">Taxes</h3>
                        <div className="space-y-2 max-h-[420px] overflow-y-auto">
                            {taxes.length === 0 ? (
                                <p className="text-sm text-slate-500">No taxes yet.</p>
                            ) : taxes.map((row) => (
                                <button
                                    key={row.id}
                                    type="button"
                                    onClick={() => selectTax(row.id)}
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
                            placeholder="Tax name"
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
                                placeholder="Amount"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" disabled={saving} className="bg-[#1b2d4f] text-white px-4 py-2 rounded-md text-sm disabled:opacity-60">
                                {saving ? 'Saving...' : (selectedId ? 'Update Tax' : 'Create Tax')}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </ProtectedAppPage>
    )
}
