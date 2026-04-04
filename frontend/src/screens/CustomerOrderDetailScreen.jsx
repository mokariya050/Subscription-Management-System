import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
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

const formatDate = (value) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleDateString()
}

export default function CustomerOrderDetailScreen() {
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
                if (!ignore) {
                    setError(err.message || 'Failed to load order')
                }
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
                {error ? <Alert variant="error">{error}</Alert> : null}

                {loading ? (
                    <Card className="p-5 text-sm text-on-surface-variant">Loading order...</Card>
                ) : !order ? (
                    <Card className="p-5 text-sm text-on-surface-variant">Order not found.</Card>
                ) : (
                    <>
                        <PageHeader
                            eyebrow="Account"
                            title={`Order ${order.order_number}`}
                            subtitle="Review purchased items, pricing breakdown, and billing details."
                            actions={
                                <>
                                    <Link to={`/customer/orders/${order.id}/invoice`}>
                                        <Button type="button" variant="secondary" className="h-9 rounded-md px-4 py-0 text-sm">Invoice</Button>
                                    </Link>
                                    <Button type="button" variant="secondary" className="h-9 rounded-md px-4 py-0 text-sm" onClick={() => window.print()}>
                                        Print
                                    </Button>
                                </>
                            }
                        />

                        <Card className="grid gap-4 p-4 lg:grid-cols-2">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Order Date</p>
                                <p className="mt-1 text-sm">{formatDate(order.created_at)}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Billing and Shipping Address</p>
                                <p className="mt-1 whitespace-pre-line text-sm">{order.address || 'Address pending'}</p>
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
                                        {(order.items || []).map((item) => (
                                            <tr key={item.line_id} className="border-b border-outline-variant/60">
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold text-on-surface">{item.product_name}</p>
                                                    <p className="text-xs text-on-surface-variant">{item.plan_name || 'Default'}</p>
                                                </td>
                                                <td className="px-4 py-3">{item.quantity}</td>
                                                <td className="px-4 py-3">{formatPrice(item.unit_price_cents, item.currency)}</td>
                                                <td className="px-4 py-3">{formatPrice(item.line_total_cents, item.currency)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        <Card className="ml-auto w-full max-w-xs space-y-2 p-4 text-sm">
                            <div className="flex items-center justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal_cents, order.currency)}</span></div>
                            <div className="flex items-center justify-between"><span>Taxes</span><span>{formatPrice(order.tax_cents, order.currency)}</span></div>
                            <div className="flex items-center justify-between font-semibold text-primary"><span>Total</span><span>{formatPrice(order.total_cents, order.currency)}</span></div>
                        </Card>
                    </>
                )}
            </section>
        </CustomerHomeLayout>
    )
}
