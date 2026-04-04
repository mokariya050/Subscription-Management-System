import { useEffect, useState } from 'react'
import ProtectedAppPage from '../components/ProtectedAppPage'
import { configurationAPI } from '../services/apiClient'

export default function AttributeDetailScreen() {
    const [attributes, setAttributes] = useState([])
    const [values, setValues] = useState([])
    const [selectedAttributeId, setSelectedAttributeId] = useState('')
    const [newAttributeName, setNewAttributeName] = useState('')
    const [newValue, setNewValue] = useState('')
    const [newExtraPrice, setNewExtraPrice] = useState('0')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const loadData = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await configurationAPI.getAttributes()
            const items = Array.isArray(response.data) ? response.data : []
            setAttributes(items)

            const defaultId = selectedAttributeId || (items[0] ? String(items[0].id) : '')
            setSelectedAttributeId(defaultId)

            if (defaultId) {
                const valueResponse = await configurationAPI.getAttributeValues(defaultId)
                setValues(Array.isArray(valueResponse.data) ? valueResponse.data : [])
            } else {
                setValues([])
            }
        } catch (err) {
            setError(err.message || 'Failed to load attributes')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    const onChangeAttribute = async (nextId) => {
        setSelectedAttributeId(nextId)
        if (!nextId) {
            setValues([])
            return
        }

        try {
            setError('')
            const response = await configurationAPI.getAttributeValues(nextId)
            setValues(Array.isArray(response.data) ? response.data : [])
        } catch (err) {
            setError(err.message || 'Failed to load attribute values')
        }
    }

    const onCreateAttribute = async (e) => {
        e.preventDefault()
        if (!newAttributeName.trim()) return

        try {
            setSaving(true)
            setError('')
            const response = await configurationAPI.createAttribute({ name: newAttributeName.trim() })
            const created = response.data
            setNewAttributeName('')
            await loadData()
            if (created?.id) {
                await onChangeAttribute(String(created.id))
            }
        } catch (err) {
            setError(err.message || 'Failed to create attribute')
        } finally {
            setSaving(false)
        }
    }

    const onAddValue = async (e) => {
        e.preventDefault()
        if (!selectedAttributeId || !newValue.trim()) return

        try {
            setSaving(true)
            setError('')
            await configurationAPI.createAttributeValue(selectedAttributeId, {
                value: newValue.trim(),
                extra_price_cents: Math.round(Number(newExtraPrice || 0) * 100),
            })
            setNewValue('')
            setNewExtraPrice('0')
            await onChangeAttribute(selectedAttributeId)
        } catch (err) {
            setError(err.message || 'Failed to add value')
        } finally {
            setSaving(false)
        }
    }

    const onDeleteValue = async (valueId) => {
        try {
            setError('')
            await configurationAPI.deleteAttributeValue(valueId)
            await onChangeAttribute(selectedAttributeId)
        } catch (err) {
            setError(err.message || 'Failed to delete value')
        }
    }

    return (
        <ProtectedAppPage
            current="settings"
            title="Attribute Name"
            subtitle="Manage attributes and default extra price values"
            maxWidth="max-w-6xl"
        >
            {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

            {loading ? (
                <div className="bg-white border border-[#e5e3df] rounded-xl p-8 text-center text-slate-500">Loading attributes...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white border border-[#e5e3df] rounded-xl p-5">
                        <h3 className="font-bold mb-3">Attributes</h3>
                        <form onSubmit={onCreateAttribute} className="flex gap-2 mb-4">
                            <input
                                value={newAttributeName}
                                onChange={(e) => setNewAttributeName(e.target.value)}
                                className="flex-1 border border-[#d0cec9] rounded-lg px-3 py-2 text-sm"
                                placeholder="New attribute"
                            />
                            <button type="submit" disabled={saving} className="px-3 py-2 bg-[#1b2d4f] text-white rounded-md text-sm disabled:opacity-60">Add</button>
                        </form>

                        <select
                            value={selectedAttributeId}
                            onChange={(e) => onChangeAttribute(e.target.value)}
                            className="w-full border border-[#d0cec9] rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="">Select attribute</option>
                            {attributes.map((attribute) => (
                                <option key={attribute.id} value={attribute.id}>{attribute.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="lg:col-span-2 bg-white border border-[#e5e3df] rounded-xl p-5">
                        <h3 className="font-bold mb-3">Attribute Values</h3>
                        <form onSubmit={onAddValue} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                            <input
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                className="border border-[#d0cec9] rounded-lg px-3 py-2 text-sm"
                                placeholder="Value (e.g. brand)"
                            />
                            <input
                                type="number"
                                step="0.01"
                                value={newExtraPrice}
                                onChange={(e) => setNewExtraPrice(e.target.value)}
                                className="border border-[#d0cec9] rounded-lg px-3 py-2 text-sm"
                                placeholder="Extra price"
                            />
                            <button type="submit" disabled={saving || !selectedAttributeId} className="px-3 py-2 bg-[#1b2d4f] text-white rounded-md text-sm disabled:opacity-60">Add value</button>
                        </form>

                        <div className="overflow-x-auto border border-[#e5e3df] rounded-md">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-[#e5e3df] text-xs uppercase tracking-wider">
                                        <th className="px-4 py-3">Value</th>
                                        <th className="px-4 py-3">Default Extra Price</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {values.length === 0 ? (
                                        <tr><td colSpan={3} className="px-4 py-4 text-sm text-slate-500">No values yet.</td></tr>
                                    ) : (
                                        values.map((row) => (
                                            <tr key={row.id} className="border-b border-[#f0efec]">
                                                <td className="px-4 py-3 text-sm">{row.value}</td>
                                                <td className="px-4 py-3 text-sm">${((row.extra_price_cents || 0) / 100).toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button type="button" onClick={() => onDeleteValue(row.id)} className="px-3 py-1.5 border border-red-300 text-red-700 rounded text-xs">Delete</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </ProtectedAppPage>
    )
}
