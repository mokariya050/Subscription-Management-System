import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CustomerHomeLayout from '../components/layout/CustomerHomeLayout'
import PageHeader from '../components/layout/PageHeader'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import { storeAPI } from '../services/apiClient'

const formatPrice = (cents, currency = 'USD') => {
    if (typeof cents !== 'number') return 'N/A'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100)
}

export default function CustomerHomeScreen() {
    const [catalogItems, setCatalogItems] = useState([])
    const [insights, setInsights] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        let ignore = false

        const loadDashboard = async () => {
            try {
                setLoading(true)
                setError('')

                const [catalogResponse, insightsResponse] = await Promise.all([
                    storeAPI.getCatalog({ perPage: 6, sort: 'price_asc' }),
                    storeAPI.getInsights(),
                ])

                if (ignore) return

                setCatalogItems(Array.isArray(catalogResponse.data?.items) ? catalogResponse.data.items : [])
                setInsights(insightsResponse.data || null)
            } catch (err) {
                if (ignore) return
                setError(err.message || 'Unable to load catalog preview')
            } finally {
                if (!ignore) {
                    setLoading(false)
                }
            }
        }

        loadDashboard()

        return () => {
            ignore = true
        }
    }, [])

    const stats = useMemo(() => {
        const recurringCount = Number(insights?.active_subscriptions || 0)
        const categories = Number(insights?.trending_subscriptions || 0)
        return [
            { label: 'Active subscriptions', value: recurringCount },
            { label: 'Trending subscriptions', value: categories },
            { label: 'Open invoices', value: Number(insights?.open_invoices || 0) },
            { label: 'Total subscriptions', value: Number(insights?.total_subscriptions || 0) },
        ]
    }, [insights])

    const trending = useMemo(() => {
        if (!Array.isArray(insights?.trending_items)) return []
        return insights.trending_items
    }, [insights])

    return (
        <CustomerHomeLayout>
            <section className="space-y-6">
                <PageHeader
                    eyebrow="Customer"
                    title="Subscription Dashboard"
                    subtitle="Track active subscriptions, invoice pressure, and plan momentum from a single view."
                    actions={
                        <>
                            <Link to="/customer/shop">
                                <Button type="button" size="md">Browse Plans</Button>
                            </Link>
                            <Link to="/customer/orders">
                                <Button type="button" variant="secondary" size="md">View Orders</Button>
                            </Link>
                        </>
                    }
                />

                {error ? <p className="text-sm text-error">{error}</p> : null}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {stats.map((item) => (
                        <Card key={item.label} className="p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">{item.label}</p>
                            <p className="mt-3 font-serif text-3xl font-bold text-primary">{loading ? '-' : item.value}</p>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
                    <Card className="border border-dashed border-outline-variant bg-surface-container-low p-6 sm:p-7">
                        <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Trending Subscriptions</p>
                            <Badge variant="info">Last 30 days</Badge>
                        </div>

                        <div className="mt-4 space-y-3">
                            {loading ? (
                                <p className="text-sm text-on-surface-variant">Loading trends...</p>
                            ) : trending.length > 0 ? (
                                trending.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between rounded-2xl border border-outline-variant bg-white px-4 py-3">
                                        <div>
                                            <p className="text-sm font-semibold text-on-surface">{item.name}</p>
                                            <p className="text-xs text-on-surface-variant">Plan demand signal</p>
                                        </div>
                                        <p className="font-serif text-2xl font-bold text-primary">{item.count}</p>
                                    </div>
                                ))
                            ) : (
                                <EmptyState title="No trend data yet" description="As subscriptions grow, trending plans will be highlighted here." />
                            )}
                        </div>
                    </Card>

                    <Card className="p-6 sm:p-7">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Revenue Snapshot</p>
                        <p className="mt-3 font-serif text-4xl font-bold text-primary">
                            {formatPrice(Number(insights?.revenue_cents || 0), insights?.currency || 'USD')}
                        </p>
                        <p className="mt-2 text-sm text-on-surface-variant">Total captured revenue across paid invoices.</p>

                        <div className="mt-6 grid gap-3">
                            {catalogItems.slice(0, 3).map((item) => (
                                <div key={item.id} className="rounded-2xl border border-outline-variant px-4 py-3">
                                    <p className="text-sm font-semibold text-on-surface">{item.name}</p>
                                    <p className="mt-1 text-xs text-on-surface-variant">{item.description || 'No description'}</p>
                                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                                        From {formatPrice(item.pricing_summary?.from_price_cents, item.currency)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </section>
        </CustomerHomeLayout>
    )
}
