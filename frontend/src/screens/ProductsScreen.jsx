import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { productsAPI } from '../services/apiClient'
import AppPage from '../components/AppPage'
import DataTable from '../components/ui/DataTable'
import EmptyState from '../components/ui/EmptyState'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'

export default function ProductsScreen() {
    const { user, loading: authLoading, logout } = useAuth()
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const stats = useMemo(() => {
        const total = products.length
        const active = products.filter((product) => product.is_active).length
        return [
            { label: 'Total products', value: total },
            { label: 'Active products', value: active },
            { label: 'Inactive products', value: Math.max(total - active, 0) },
        ]
    }, [products])

    useEffect(() => {
        if (authLoading) {
            return // Still loading auth, wait
        }

        if (!user) {
            navigate('/login', { replace: true })
            return
        }

        const load = async () => {
            try {
                setLoading(true)
                const response = await productsAPI.getAll()
                setProducts(Array.isArray(response.data?.items) ? response.data.items : [])
            } catch (err) {
                setError(err.message || 'Failed to load products')
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [navigate, user, authLoading])

    const onLogout = async () => {
        await logout()
        navigate('/login', { replace: true })
    }

    return (
        <AppPage
            current="products"
            onLogout={onLogout}
            title="Products"
            subtitle="Live data from backend API"
            actions={
                <Link
                    to="/products/new"
                    className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    New product
                </Link>
            }
        >

            {error ? <div className="mb-6 rounded-2xl border border-error/20 bg-error-container px-4 py-3 text-sm text-on-error-container">{error}</div> : null}

            <div className="mb-6 grid gap-4 md:grid-cols-3">
                {stats.map((item) => (
                    <Card key={item.label} className="p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">{item.label}</p>
                        <p className="mt-3 font-serif text-3xl font-bold text-primary">{item.value}</p>
                    </Card>
                ))}
            </div>

            {loading ? (
                <div className="rounded-[1.75rem] border border-dashed border-outline-variant bg-white/70 py-14 text-center text-sm text-on-surface-variant">
                    Loading products...
                </div>
            ) : products.length === 0 ? (
                <EmptyState
                    title="No products found"
                    description="Add a product to start building catalog entries and subscription plans."
                    actionLabel="Create product"
                    onAction={() => navigate('/products/new')}
                />
            ) : (
                <DataTable
                    caption="Product list"
                    rows={products}
                    getRowKey={(product) => product.id}
                    onRowClick={(product) => navigate(`/products/detail?id=${product.id}`)}
                    emptyMessage="No products available."
                    columns={[
                        { key: 'name', label: 'Name', render: (product) => <span className="font-semibold text-primary">{product.name}</span> },
                        { key: 'description', label: 'Description', render: (product) => product.description || 'N/A' },
                        {
                            key: 'is_active',
                            label: 'Status',
                            render: (product) => (
                                <Badge variant={product.is_active ? 'success' : 'neutral'}>
                                    {product.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                            ),
                        },
                    ]}
                />
            )}
        </AppPage>
    )
}
