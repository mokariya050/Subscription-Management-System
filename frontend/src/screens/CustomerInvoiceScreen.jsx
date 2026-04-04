import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import CustomerHomeLayout from '../components/layout/CustomerHomeLayout'
import PageHeader from '../components/layout/PageHeader'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { storeAPI } from '../services/apiClient'

const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) {
        resolve(true)
        return
    }

    const existing = document.querySelector('script[data-razorpay="true"]')
    if (existing) {
        existing.addEventListener('load', () => resolve(true), { once: true })
        existing.addEventListener('error', () => resolve(false), { once: true })
        return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.razorpay = 'true'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
})

const formatPrice = (cents, currency = 'USD') => {
    if (typeof cents !== 'number') return 'N/A'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100)
}

export default function CustomerInvoiceScreen() {
    const { orderId } = useParams()
    const [invoice, setInvoice] = useState(null)
    const [loading, setLoading] = useState(true)
    const [working, setWorking] = useState(false)
    const [error, setError] = useState('')

    const loadInvoice = async () => {
        try {
            setLoading(true)
            const response = await storeAPI.getInvoice(orderId)
            setInvoice(response.data || null)
        } catch (err) {
            setError(err.message || 'Failed to load invoice')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let ignore = false

        const loadInvoiceData = async () => {
            try {
                setLoading(true)
                const response = await storeAPI.getInvoice(orderId)
                if (ignore) return
                setInvoice(response.data || null)
            } catch (err) {
                if (!ignore) {
                    setError(err.message || 'Failed to load invoice')
                }
            } finally {
                if (!ignore) {
                    setLoading(false)
                }
            }
        }

        loadInvoiceData()

        return () => {
            ignore = true
        }
    }, [orderId])

    const startInvoicePayment = async () => {
        try {
            setWorking(true)
            setError('')

            const sessionResponse = await storeAPI.createOrderPaymentSession(orderId)
            const session = sessionResponse.data || {}
            const gateway = session.payment_gateway || {}

            if (gateway.provider !== 'razorpay') {
                throw new Error('Payment session was not created. Please verify backend Razorpay setup and restart backend.')
            }

            const scriptLoaded = await loadRazorpayScript()
            if (!scriptLoaded || !window.Razorpay) {
                throw new Error('Unable to load Razorpay checkout')
            }

            const razorpay = new window.Razorpay({
                key: gateway.key_id,
                amount: gateway.amount,
                currency: gateway.currency,
                name: gateway.name || 'SubSync',
                description: gateway.description || 'Invoice payment',
                order_id: gateway.order_id,
                handler: async (paymentResult) => {
                    try {
                        setWorking(true)
                        setError('')

                        await storeAPI.verifyOrderPayment(orderId, {
                            razorpay_order_id: paymentResult.razorpay_order_id,
                            razorpay_payment_id: paymentResult.razorpay_payment_id,
                            razorpay_signature: paymentResult.razorpay_signature,
                        })

                        await loadInvoice()
                    } catch (err) {
                        setError(err.message || 'Payment verification failed')
                    } finally {
                        setWorking(false)
                    }
                },
                modal: {
                    ondismiss: () => {
                        setError('Payment was cancelled. You can try again.')
                        setWorking(false)
                    },
                },
                prefill: gateway.prefill || {},
                theme: {
                    color: '#1b2d4f',
                },
            })

            razorpay.open()
            setWorking(false)
        } catch (err) {
            setError(err.message || 'Unable to start payment')
            setWorking(false)
        }
    }

    return (
        <CustomerHomeLayout>
            <section className="space-y-6">
                {error ? <Alert variant="error">{error}</Alert> : null}

                {loading ? (
                    <Card className="p-5 text-sm text-on-surface-variant">Loading invoice...</Card>
                ) : !invoice ? (
                    <Card className="p-5 text-sm text-on-surface-variant">Invoice not found.</Card>
                ) : (
                    <>
                        <PageHeader
                            eyebrow="Billing"
                            title={`Invoice ${invoice.invoice_number}`}
                            subtitle={`Order ${invoice.order_number}`}
                            actions={
                                <>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="h-9 rounded-md px-4 py-0 text-sm"
                                        onClick={startInvoicePayment}
                                        disabled={working || (invoice.amount_due_cents || 0) <= 0}
                                    >
                                        {(invoice.amount_due_cents || 0) <= 0 ? 'Paid' : (working ? 'Processing...' : 'Payment')}
                                    </Button>
                                    <Button type="button" variant="secondary" className="h-9 rounded-md px-4 py-0 text-sm" onClick={() => window.print()}>
                                        Download
                                    </Button>
                                </>
                            }
                        />

                        <Card className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Invoice {invoice.invoice_number}</p>
                                <p className="mt-2 text-sm text-on-surface-variant">Invoice Date: {invoice.invoice_date || '-'}</p>
                            </div>
                            <div className="text-sm">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Address</p>
                                <p className="mt-1 whitespace-pre-line">{invoice.address || 'Address pending'}</p>
                            </div>
                        </Card>

                        <Card className="overflow-hidden p-0">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="border-b border-outline-variant bg-surface-container-low">
                                        <tr>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Products</th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Quantity</th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Unit Price</th>
                                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(invoice.rows || []).map((row, index) => (
                                            <tr key={`${row.description}-${index}`} className="border-b border-outline-variant/60">
                                                <td className="px-4 py-3">{row.description}</td>
                                                <td className="px-4 py-3">{row.quantity}</td>
                                                <td className="px-4 py-3">{formatPrice(row.unit_price_cents, invoice.currency)}</td>
                                                <td className="px-4 py-3">{formatPrice(row.amount_cents, invoice.currency)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        <Card className="ml-auto w-full max-w-xs space-y-1 p-4 text-sm">
                            <div className="flex items-center justify-between"><span>Subtotal</span><span>{formatPrice(invoice.subtotal_cents, invoice.currency)}</span></div>
                            <div className="flex items-center justify-between"><span>Discount</span><span>{formatPrice(-Math.abs(invoice.discount_cents), invoice.currency)}</span></div>
                            <div className="flex items-center justify-between"><span>Tax</span><span>{formatPrice(invoice.tax_cents, invoice.currency)}</span></div>
                            <div className="flex items-center justify-between font-semibold text-primary"><span>Total</span><span>{formatPrice(invoice.total_cents, invoice.currency)}</span></div>
                            <div className="flex items-center justify-between font-semibold"><span>Amount Due</span><span>{formatPrice(invoice.amount_due_cents, invoice.currency)}</span></div>
                        </Card>
                    </>
                )}
            </section>
        </CustomerHomeLayout>
    )
}
