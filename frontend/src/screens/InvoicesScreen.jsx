import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ProtectedAppPage from '../components/ProtectedAppPage'
import { invoicesAPI } from '../services/apiClient'
import { printInvoiceDocument } from '../utils/invoicePrint'

const formatDate = (value) => {
    if (!value) return 'N/A'
    return new Date(value).toLocaleDateString()
}

const formatMoney = (cents) => `$${((Number(cents) || 0) / 100).toFixed(2)}`

export default function InvoicesScreen() {
    const navigate = useNavigate()
    const [invoices, setInvoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [query, setQuery] = useState('')
    const [sendingId, setSendingId] = useState(null)
    const [printingId, setPrintingId] = useState(null)

    const loadInvoices = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await invoicesAPI.getAll()
            const items = Array.isArray(response.data) ? response.data : []
            setInvoices(items)
        } catch (err) {
            setError(err.message || 'Failed to load invoices')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadInvoices()
    }, [])

    const filteredInvoices = useMemo(() => {
        const text = query.trim().toLowerCase()
        if (!text) return invoices

        return invoices.filter((invoice) => {
            const number = String(invoice.invoice_number || '').toLowerCase()
            const status = String(invoice.status || '').toLowerCase()
            return number.includes(text) || status.includes(text) || String(invoice.id).includes(text)
        })
    }, [invoices, query])

    const onSend = async (invoiceId) => {
        try {
            setSendingId(invoiceId)
            setError('')
            await invoicesAPI.send(invoiceId)
            await loadInvoices()
        } catch (err) {
            setError(err.message || 'Failed to send invoice')
        } finally {
            setSendingId(null)
        }
    }

    const onPrint = async (invoice) => {
        try {
            setPrintingId(invoice.id)
            setError('')
            const itemsResponse = await invoicesAPI.getItems(invoice.id)
            const items = Array.isArray(itemsResponse.data) ? itemsResponse.data : []
            const printed = printInvoiceDocument({
                invoice,
                items,
                companyName: 'SubSync',
            })

            if (!printed) {
                setError('Unable to open print dialog. Please allow popups and try again.')
            }
        } catch (err) {
            setError(err.message || 'Failed to prepare invoice for printing')
        } finally {
            setPrintingId(null)
        }
    }

    return (
        <ProtectedAppPage
            current="invoices"
            title="Invoices"
            subtitle="Manage, send, print, and review all invoices"
            maxWidth="max-w-7xl"
            actions={<Link to="/invoice/new" className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-container">New invoice</Link>}
        >
            {error ? <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by invoice number, ID, or status"
                    className="w-full rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 sm:max-w-md"
                />
                <button type="button" onClick={loadInvoices} className="rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-sm font-semibold text-on-surface">
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="rounded-[1.5rem] border border-dashed border-outline-variant bg-white/70 py-12 text-center text-sm text-on-surface-variant">
                    Loading invoices...
                </div>
            ) : filteredInvoices.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-outline-variant bg-white/70 py-12 text-center text-sm text-on-surface-variant">
                    No invoices found.
                </div>
            ) : (
                <div className="overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/90 shadow-[0_18px_50px_rgba(27,45,79,0.08)]">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-surface-container-low">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Invoice #</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Date</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Due Date</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Status</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Total</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map((invoice) => (
                                    <tr key={invoice.id} className="border-t border-surface-container-high">
                                        <td className="px-4 py-4 text-sm font-semibold text-primary">{invoice.invoice_number || `#${invoice.id}`}</td>
                                        <td className="px-4 py-4 text-sm">{formatDate(invoice.invoice_date || invoice.created_at)}</td>
                                        <td className="px-4 py-4 text-sm">{formatDate(invoice.due_date)}</td>
                                        <td className="px-4 py-4 text-sm capitalize">{invoice.status || 'draft'}</td>
                                        <td className="px-4 py-4 text-right text-sm font-semibold">{formatMoney(invoice.total_amount_cents ?? invoice.amount_due_cents)}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/invoice/new/payment?invoiceId=${invoice.id}`)}
                                                    className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-semibold"
                                                >
                                                    Open
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onSend(invoice.id)}
                                                    disabled={sendingId === invoice.id}
                                                    className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                                                >
                                                    {sendingId === invoice.id ? 'Sending...' : 'Send'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onPrint(invoice)}
                                                    disabled={printingId === invoice.id}
                                                    className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-semibold disabled:opacity-60"
                                                >
                                                    {printingId === invoice.id ? 'Preparing...' : 'Print'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </ProtectedAppPage>
    )
}
