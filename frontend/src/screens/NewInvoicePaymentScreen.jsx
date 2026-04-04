import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ProtectedAppPage from '../components/ProtectedAppPage'
import { invoicesAPI, subscriptionsAPI, usersAPI } from '../services/apiClient'
import { printInvoiceDocument } from '../utils/invoicePrint'

const formatMoney = (cents) => `$${((Number(cents) || 0) / 100).toFixed(2)}`

export default function NewInvoicePaymentScreen() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [searchParams] = useSearchParams()
    const invoiceId = searchParams.get('invoiceId')
    const subscriptionId = searchParams.get('subscriptionId')

    const [invoice, setInvoice] = useState(null)
    const [items, setItems] = useState([])
    const [subscription, setSubscription] = useState(null)
    const [methods, setMethods] = useState([])
    const [availableInvoices, setAvailableInvoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [paymentMethodId, setPaymentMethodId] = useState('')
    const [amount, setAmount] = useState('0.00')
    const [sending, setSending] = useState(false)

    const loadData = async () => {
        if (!invoiceId) {
            try {
                setLoading(true)
                setError('')
                const response = await invoicesAPI.getAll()
                const items = Array.isArray(response.data) ? response.data : []
                setAvailableInvoices(items)
            } catch (err) {
                setError(err.message || 'Failed to load invoices')
            } finally {
                setLoading(false)
            }
            return
        }

        try {
            setLoading(true)
            setError('')
            setPaymentMethodId('')

            const [invoiceRes, itemsRes] = await Promise.all([
                invoicesAPI.getById(invoiceId),
                invoicesAPI.getItems(invoiceId),
            ])

            const invoiceData = invoiceRes.data || null

            let methodItems = []
            if (invoiceData?.user_id) {
                const methodsRes = await usersAPI.getPaymentMethods(invoiceData.user_id)
                methodItems = Array.isArray(methodsRes.data) ? methodsRes.data : []
            }

            setInvoice(invoiceData)
            setItems(Array.isArray(itemsRes.data) ? itemsRes.data : [])
            setMethods(methodItems)
            setAmount(((invoiceData?.amount_due_cents || 0) / 100).toFixed(2))
            if (methodItems.length > 0) {
                setPaymentMethodId(String(methodItems[0].id))
            } else {
                setPaymentMethodId('')
            }

            if (subscriptionId) {
                const subRes = await subscriptionsAPI.getById(subscriptionId)
                setSubscription(subRes.data || null)
            }
        } catch (err) {
            setError(err.message || 'Failed to load invoice payment page data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!user) {
            return
        }
        loadData()
    }, [invoiceId, subscriptionId, user])

    const createDemoMethod = async () => {
        if (!invoice?.user_id) {
            setError('Invoice owner not found to attach a payment method')
            return
        }

        try {
            setError('')
            await usersAPI.addPaymentMethod(invoice.user_id, {
                provider: 'stripe',
                brand: 'visa',
                last_four: '4242',
                expiry_month: 12,
                expiry_year: new Date().getFullYear() + 2,
                is_default: true,
            })
            await loadData()
        } catch (err) {
            setError(err.message || 'Failed to create payment method')
        }
    }

    const onSendInvoice = async () => {
        try {
            setSending(true)
            setError('')
            await invoicesAPI.send(invoiceId)
            await loadData()
        } catch (err) {
            setError(err.message || 'Failed to mark invoice as sent')
        } finally {
            setSending(false)
        }
    }

    const onPay = async () => {
        const parsedAmount = Number(amount)

        const selectedMethodExists = methods.some((method) => String(method.id) === String(paymentMethodId))
        if (!paymentMethodId) {
            setError('Select a payment method before paying')
            return
        }

        if (!selectedMethodExists) {
            setError('Selected payment method is invalid for this invoice owner')
            return
        }

        if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('Enter a valid payment amount')
            return
        }

        try {
            setSending(true)
            setError('')
            await invoicesAPI.processPayment({
                invoice_id: Number(invoiceId),
                amount_cents: Math.round(parsedAmount * 100),
                payment_method_id: Number(paymentMethodId),
            })
            await loadData()
        } catch (err) {
            setError(err.message || 'Failed to process payment')
        } finally {
            setSending(false)
        }
    }

    const onPrintInvoice = () => {
        const printed = printInvoiceDocument({
            invoice,
            items,
            subscription,
            companyName: 'SubSync',
        })

        if (!printed) {
            setError('Unable to open print dialog. Please allow popups and try again.')
        }
    }

    return (
        <ProtectedAppPage
            current="subscriptions"
            title="Invoice & Payment"
            subtitle={invoiceId ? `Invoice #${invoiceId}` : 'Payment'}
            maxWidth="max-w-6xl"
            actions={
                <div className="flex items-center gap-2">
                    <button type="button" onClick={onSendInvoice} disabled={sending || !invoiceId} className="px-3 py-2 border border-[#d0cec9] rounded-md text-sm disabled:opacity-60">Send</button>
                    <button type="button" onClick={onPrintInvoice} disabled={!invoice || loading} className="px-3 py-2 border border-[#d0cec9] rounded-md text-sm disabled:opacity-60">Print</button>
                    <button type="button" onClick={() => navigate('/home')} className="px-3 py-2 border border-[#d0cec9] rounded-md text-sm">Close</button>
                </div>
            }
        >
            {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

            {loading ? (
                <div className="py-10 text-center text-slate-500">Loading invoice...</div>
            ) : !invoiceId ? (
                <div className="space-y-4">
                    <div className="bg-white border border-[#e5e3df] rounded-xl p-8 text-center">
                        <h3 className="text-xl font-semibold text-[#1b2d4f]">Choose an invoice</h3>
                        <p className="mt-2 text-sm text-slate-600">This page can be opened directly from the Invoices page or by selecting an invoice below.</p>
                        <div className="mt-4 flex items-center justify-center gap-3">
                            <button type="button" onClick={() => navigate('/invoices')} className="px-4 py-2 border border-[#d0cec9] rounded-md text-sm">Go to Invoices</button>
                            <button type="button" onClick={() => navigate('/invoice/new')} className="px-4 py-2 bg-[#1b2d4f] text-white rounded-md text-sm">Create New Invoice</button>
                        </div>
                    </div>

                    {availableInvoices.length > 0 && (
                        <div className="bg-white border border-[#e5e3df] rounded-xl overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-[#e5e3df] text-xs uppercase tracking-wider">
                                        <th className="px-4 py-3">Invoice #</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {availableInvoices.slice(0, 20).map((row) => (
                                        <tr key={row.id} className="border-b border-[#f0efec]">
                                            <td className="px-4 py-3 text-sm font-semibold">{row.invoice_number || `#${row.id}`}</td>
                                            <td className="px-4 py-3 text-sm">{row.invoice_date ? new Date(row.invoice_date).toLocaleDateString() : 'N/A'}</td>
                                            <td className="px-4 py-3 text-sm">{row.status || 'draft'}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/invoice/new/payment?invoiceId=${row.id}`)}
                                                    className="px-3 py-1.5 border border-[#d0cec9] rounded text-xs"
                                                >
                                                    Open
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : !invoice ? (
                <div className="bg-white border border-[#e5e3df] rounded-xl p-8 text-center">Invoice not found.</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white border border-[#e5e3df] rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-serif font-bold">Subscription Invoice</h3>
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-700">{invoice.status || 'draft'}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                            <div>
                                <p className="text-slate-500">Invoice Number</p>
                                <p className="font-medium">{invoice.invoice_number}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Due Date</p>
                                <p className="font-medium">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>

                        <div className="border border-[#e5e3df] rounded-md overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-[#e5e3df] text-xs uppercase tracking-wider">
                                        <th className="px-4 py-3">Product</th>
                                        <th className="px-4 py-3 text-right">Quantity</th>
                                        <th className="px-4 py-3 text-right">Unit Price</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.length === 0 ? (
                                        <tr><td className="px-4 py-4 text-sm text-slate-500" colSpan={4}>No line items</td></tr>
                                    ) : (
                                        items.map((item) => (
                                            <tr key={item.id} className="border-b border-[#f0efec]">
                                                <td className="px-4 py-3 text-sm">{item.description}</td>
                                                <td className="px-4 py-3 text-sm text-right">{item.quantity}</td>
                                                <td className="px-4 py-3 text-sm text-right">{formatMoney(item.unit_price_cents)}</td>
                                                <td className="px-4 py-3 text-sm text-right font-semibold">{formatMoney(item.amount_cents)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white border border-[#e5e3df] rounded-xl p-5">
                            <h4 className="font-bold mb-4">Totals</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span>Untaxed Amount</span><span>{formatMoney(invoice.subtotal_cents)}</span></div>
                                <div className="flex justify-between"><span>Taxes</span><span>{formatMoney(invoice.tax_cents)}</span></div>
                                <div className="flex justify-between"><span>Discount</span><span>-{formatMoney(invoice.discount_cents)}</span></div>
                                <div className="border-t border-[#e5e3df] pt-2 mt-2 flex justify-between font-bold"><span>Total Due</span><span>{formatMoney(invoice.amount_due_cents)}</span></div>
                            </div>
                        </div>

                        <div className="bg-white border border-[#e5e3df] rounded-xl p-5">
                            <h4 className="font-bold mb-4">Payment Term</h4>
                            <p className="text-sm text-slate-600">Payment methods and amount entry from backend records.</p>

                            {methods.length === 0 ? (
                                <button type="button" onClick={createDemoMethod} className="mt-3 px-3 py-2 bg-[#1b2d4f] text-white rounded-md text-sm">Create Demo Method</button>
                            ) : (
                                <div className="mt-3 space-y-3">
                                    <select value={paymentMethodId} onChange={(e) => setPaymentMethodId(e.target.value)} className="w-full border border-[#d0cec9] rounded-lg px-3 py-2 text-sm">
                                        {methods.map((method) => (
                                            <option key={method.id} value={method.id}>{`${method.provider} ${method.brand || ''} ${method.last_four ? `****${method.last_four}` : ''}`}</option>
                                        ))}
                                    </select>
                                    <input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border border-[#d0cec9] rounded-lg px-3 py-2 text-sm" placeholder="Amount" />
                                    <button type="button" onClick={onPay} disabled={sending} className="w-full px-4 py-2 bg-[#1b2d4f] text-white rounded-md text-sm font-semibold disabled:opacity-60">
                                        {sending ? 'Processing...' : 'Confirm Payment'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {subscription && (
                            <div className="bg-white border border-[#e5e3df] rounded-xl p-5 text-sm">
                                <h4 className="font-bold mb-3">Subscription</h4>
                                <p><span className="text-slate-500">Subscription #</span> {subscription.id}</p>
                                <p><span className="text-slate-500">Plan</span> {subscription.plan_id}</p>
                                <p><span className="text-slate-500">Status</span> {subscription.status}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </ProtectedAppPage>
    )
}
