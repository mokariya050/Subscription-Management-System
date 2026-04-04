import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CustomerHomeLayout from '../components/layout/CustomerHomeLayout'
import PageHeader from '../components/layout/PageHeader'
import Alert from '../components/ui/Alert'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
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

export default function CustomerOrdersScreen() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let ignore = false

        const loadOrders = async () => {
            try {
                setLoading(true)
                const response = await storeAPI.listOrders()
                if (ignore) return
                setOrders(Array.isArray(response.data?.items) ? response.data.items : [])
            } catch (err) {
                if (!ignore) {
                    setError(err.message || 'Failed to load orders')
                }
            } finally {
                if (!ignore) {
                    setLoading(false)
                }
            }
        }

        loadOrders()

        return () => {
            ignore = true
        }
    }, [])

    return (
        <CustomerHomeLayout>
            <section className="space-y-6">
                <PageHeader
                    eyebrow="Account"
                    title="Orders"
                    subtitle="Review your past purchases and open any order details."
                />

                {error ? <Alert variant="error">{error}</Alert> : null}

                <Card className="overflow-hidden p-0">
                    {loading ? (
                        <div className="p-5 text-sm text-on-surface-variant">Loading orders...</div>
                    ) : orders.length === 0 ? (
                        <div className="p-5">
                            <EmptyState
                                title="No orders yet"
                                description="Your recent orders will appear here."
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="border-b border-outline-variant bg-surface-container-low">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Order</th>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Order Date</th>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Total</th>
                                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="border-b border-outline-variant/60">
                                            <td className="px-4 py-3 font-semibold text-primary">{order.order_number}</td>
                                            <td className="px-4 py-3 text-on-surface">{formatDate(order.created_at)}</td>
                                            <td className="px-4 py-3 text-on-surface">{formatPrice(order.total_cents, order.currency)}</td>
                                            <td className="px-4 py-3">
                                                <Link to={`/customer/orders/${order.id}`} className="font-semibold text-primary hover:underline">
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </section>
        </CustomerHomeLayout>
    )
}
