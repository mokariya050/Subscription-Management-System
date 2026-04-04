import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProtectedAppPage from '../components/ProtectedAppPage'
import { invoicesAPI, usersAPI } from '../services/apiClient'

const toCents = (value) => Math.round((Number(value) || 0) * 100)

const defaultDueDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toISOString().slice(0, 10)
}

export default function NewInvoiceScreen() {
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [loadingUsers, setLoadingUsers] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        userId: '',
        invoiceNumber: `INV-${Date.now()}`,
        dueDate: defaultDueDate(),
        itemDescription: 'Manual charge',
        amount: '0.00',
        notes: '',
    })

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoadingUsers(true)
                setError('')
                const response = await usersAPI.getAll()
                const items = Array.isArray(response.data) ? response.data : []
                setUsers(items)
                if (items.length > 0) {
                    setForm((prev) => ({ ...prev, userId: String(items[0].id) }))
                }
            } catch (err) {
                setError(err.message || 'Failed to load customers')
            } finally {
                setLoadingUsers(false)
            }
        }

        loadUsers()
    }, [])

    const onChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    const onCreateDraft = async (event) => {
        event.preventDefault()

        const userId = Number(form.userId)
        const amountCents = toCents(form.amount)

        if (!userId) {
            setError('Please select a customer')
            return
        }

        if (!form.invoiceNumber.trim()) {
            setError('Invoice number is required')
            return
        }

        if (amountCents <= 0) {
            setError('Amount must be greater than zero')
            return
        }

        try {
            setSaving(true)
            setError('')

            const payload = {
                user_id: userId,
                invoice_number: form.invoiceNumber.trim(),
                due_date: form.dueDate,
                subtotal_cents: amountCents,
                discount_cents: 0,
                tax_cents: 0,
                total_amount_cents: amountCents,
                notes: form.notes || null,
                items: [
                    {
                        description: form.itemDescription || 'Manual charge',
                        quantity: 1,
                        unit_price_cents: amountCents,
                        amount_cents: amountCents,
                        item_type: 'charge',
                    },
                ],
            }

            const response = await invoicesAPI.create(payload)
            const createdId = response.data?.id

            if (!createdId) {
                setError('Invoice created but missing ID in response')
                return
            }

            navigate(`/invoice/new/payment?invoiceId=${createdId}`, { replace: true })
        } catch (err) {
            setError(err.message || 'Failed to create invoice draft')
        } finally {
            setSaving(false)
        }
    }

    return (
        <ProtectedAppPage
            current="invoices"
            title="New Invoice"
            subtitle="Create a draft invoice, then continue to payment"
            maxWidth="max-w-3xl"
            actions={
                <button
                    type="submit"
                    form="new-invoice-form"
                    disabled={saving || loadingUsers}
                    className="bg-[#1b2d4f] text-white px-5 py-2 rounded-md text-sm font-semibold disabled:opacity-60"
                >
                    {saving ? 'Creating...' : 'Create Draft & Continue'}
                </button>
            }
        >
            {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

            <form id="new-invoice-form" onSubmit={onCreateDraft} className="bg-white border border-[#e5e3df] rounded-xl p-8 space-y-4">
                <div>
                    <label className="block text-xs uppercase tracking-wider font-bold mb-2">Customer</label>
                    <select
                        value={form.userId}
                        onChange={(e) => onChange('userId', e.target.value)}
                        className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                        disabled={loadingUsers}
                        required
                    >
                        {users.length === 0 ? (
                            <option value="">No users available</option>
                        ) : (
                            users.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.first_name} {user.last_name} ({user.email})
                                </option>
                            ))
                        )}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs uppercase tracking-wider font-bold mb-2">Invoice Number</label>
                        <input
                            value={form.invoiceNumber}
                            onChange={(e) => onChange('invoiceNumber', e.target.value)}
                            className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider font-bold mb-2">Due Date</label>
                        <input
                            type="date"
                            value={form.dueDate}
                            onChange={(e) => onChange('dueDate', e.target.value)}
                            className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs uppercase tracking-wider font-bold mb-2">Line Item Description</label>
                        <input
                            value={form.itemDescription}
                            onChange={(e) => onChange('itemDescription', e.target.value)}
                            className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider font-bold mb-2">Amount (USD)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.amount}
                            onChange={(e) => onChange('amount', e.target.value)}
                            className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs uppercase tracking-wider font-bold mb-2">Notes</label>
                    <textarea
                        rows={4}
                        value={form.notes}
                        onChange={(e) => onChange('notes', e.target.value)}
                        className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"
                    />
                </div>
            </form>
        </ProtectedAppPage>
    )
}
