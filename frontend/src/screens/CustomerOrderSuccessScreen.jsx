import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import CustomerHomeLayout from '../components/layout/CustomerHomeLayout'
import PageHeader from '../components/layout/PageHeader'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { storeAPI } from '../services/apiClient'

const formatPrice = (cents, currency = 'USD') => {
    if (typeof cents !== 'number') return 'N/A'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100)
}

export default function CustomerOrderSuccessScreen() {
    const { orderId } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let ignore = false

        const loadOrder = async () => {
            try {
                setLoading(true)
                const response = await storeAPI.getOrder(orderId)
                if (ignore) return
                setOrder(response.data || null)
            } catch (err) {
                if (ignore) return
                setError(err.message || 'Unable to load order details')
            } finally {
                if (!ignore) {
                    setLoading(false)
                }
            }
        }

        loadOrder()

        return () => {
            ignore = true
        }
    }, [orderId])

    return (
        <CustomerHomeLayout>
            <section className="space-y-6">
                <PageHeader
                    eyebrow="Checkout"
                    title="Order Success"
                    subtitle="Your payment is confirmed and your order details are ready."
                />

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="space-y-4">
                        {loading ? (
                            <Card className="p-5 text-sm text-on-surface-variant">Loading order...</Card>
                        ) : order ? (
                            <>
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-2xl font-serif font-bold text-primary">Thank you for your order</p>
                                        <p className="mt-2 text-sm text-on-surface">Order {order.order_number}</p>
                                    </div>
                                    <Button type="button" variant="secondary" className="h-9 rounded-md px-4 py-0 text-sm" onClick={() => window.print()}>
                                        Print
                                    </Button>
                                </div>

                                <Card className="rounded-md p-4 text-sm text-on-surface-variant">
                                    Your payment has been processed
                                </Card>

                                <div className="space-y-3">
                                    {(order.items || []).map((item) => (
                                        <Card key={item.line_id} className="grid gap-3 p-4 sm:grid-cols-[28px_minmax(0,1fr)_auto] sm:items-center">
                                            <div className="h-3 w-3 rounded-full bg-secondary" />
                                            <div>
                                                <p className="text-sm font-semibold text-on-surface">{item.product_name}</p>
                                                <p className="text-xs text-on-surface-variant">{item.plan_name || 'Default'} x {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-semibold text-primary">{formatPrice(item.line_total_cents, item.currency)}</p>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <Card className="p-5 text-sm text-on-surface-variant">Order not found.</Card>
                        )}

                        {error ? <Alert variant="error">{error}</Alert> : null}
                    </div>

                    <Card className="space-y-2 p-4 text-sm">
                        <div className="flex items-center justify-between"><span>Subtotal</span><span>{formatPrice(order?.subtotal_cents, order?.currency)}</span></div>
                        <div className="flex items-center justify-between"><span>Taxes</span><span>{formatPrice(order?.tax_cents, order?.currency)}</span></div>
                        <div className="flex items-center justify-between font-semibold text-primary"><span>Total</span><span>{formatPrice(order?.total_cents, order?.currency)}</span></div>
                    </Card>
                </div>
            </section>
        </CustomerHomeLayout>
    )
}
