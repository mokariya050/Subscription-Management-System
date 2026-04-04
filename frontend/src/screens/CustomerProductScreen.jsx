import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CustomerHomeLayout from '../components/layout/CustomerHomeLayout'
import PageHeader from '../components/layout/PageHeader'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import { storeAPI } from '../services/apiClient'

const formatPrice = (cents, currency = 'USD') => {
    if (typeof cents !== 'number') return 'N/A'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100)
}

export default function CustomerProductScreen() {
    const { productId } = useParams()
    const navigate = useNavigate()

    const [product, setProduct] = useState(null)
    const [selectedPlanId, setSelectedPlanId] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        let ignore = false

        const loadProduct = async () => {
            try {
                setLoading(true)
                setError('')

                const response = await storeAPI.getProduct(productId)
                if (ignore) return

                const data = response.data || null
                setProduct(data)

                if (Array.isArray(data?.plans) && data.plans.length > 0) {
                    setSelectedPlanId(String(data.plans[0].id))
                }
            } catch (err) {
                if (ignore) return
                setError(err.message || 'Failed to load product details')
            } finally {
                if (!ignore) {
                    setLoading(false)
                }
            }
        }

        loadProduct()

        return () => {
            ignore = true
        }
    }, [productId])

    const selectedPlan = useMemo(
        () => product?.plans?.find((plan) => String(plan.id) === String(selectedPlanId)) || null,
        [product, selectedPlanId],
    )

    const priceLabel = useMemo(() => {
        if (selectedPlan?.price_cents != null) {
            return formatPrice(selectedPlan.price_cents, selectedPlan.currency || product?.currency)
        }

        if (product?.pricing_summary?.from_price_cents != null) {
            return formatPrice(product.pricing_summary.from_price_cents, product.currency)
        }

        return 'N/A'
    }, [selectedPlan, product])

    const addToCart = async () => {
        if (!product) return

        try {
            setSaving(true)
            setError('')

            await storeAPI.addCartItem({
                productId: product.id,
                planId: selectedPlan ? selectedPlan.id : null,
                quantity,
            })

            navigate('/customer/cart')
        } catch (err) {
            setError(err.message || 'Unable to add item to cart')
        } finally {
            setSaving(false)
        }
    }

    return (
        <CustomerHomeLayout>
            <section className="space-y-6">
                <PageHeader
                    eyebrow="Shop"
                    title="Product Details"
                    subtitle="Review pricing, choose a plan, and add the product to your cart."
                />

                <div className="grid gap-6 lg:grid-cols-[72px_minmax(0,1fr)_320px]">
                    <aside className="flex flex-row gap-3 lg:flex-col">
                        {['img 1', 'img 2', 'img 3'].map((label) => (
                            <Card key={label} className="flex h-14 w-14 items-center justify-center rounded-md border border-outline-variant text-xs text-on-surface-variant">
                                {label}
                            </Card>
                        ))}
                    </aside>

                    <Card className="flex min-h-[320px] items-center justify-center rounded-[0.4rem] border border-outline-variant bg-surface-container-low">
                        <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Select image / big view</p>
                    </Card>

                    <div className="space-y-4">
                        <Card className="space-y-4 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Product</p>

                            {loading ? (
                                <p className="text-sm text-on-surface-variant">Loading product details...</p>
                            ) : product ? (
                                <>
                                    <div className="rounded-md border border-outline-variant p-3">
                                        <p className="text-sm font-semibold text-on-surface">{product.name}</p>
                                        <p className="mt-1 text-xs text-on-surface-variant">{product.description || 'No description available.'}</p>
                                    </div>

                                    <div className="rounded-md border border-outline-variant p-3">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Price</p>
                                        <p className="mt-1 text-sm font-semibold text-primary">{priceLabel}</p>
                                    </div>

                                    <div className="rounded-md border border-outline-variant p-3">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Product Category</p>
                                        <p className="mt-1 text-sm text-on-surface">{product.product_type || 'General'}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Variants available</p>
                                        <select
                                            value={selectedPlanId}
                                            onChange={(event) => setSelectedPlanId(event.target.value)}
                                            className="h-10 w-full rounded-xl border border-outline-variant bg-white px-3 text-sm text-on-surface focus:border-primary focus:outline-none"
                                        >
                                            {product.plans && product.plans.length > 0 ? (
                                                product.plans.map((plan) => (
                                                    <option key={plan.id} value={plan.id}>
                                                        {plan.name} - {formatPrice(plan.price_cents, plan.currency)}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="">Default option</option>
                                            )}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Quantity</p>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={quantity}
                                            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                                            className="h-10 rounded-xl"
                                        />
                                    </div>

                                    <Button type="button" onClick={addToCart} disabled={saving}>
                                        {saving ? 'Adding...' : 'Add to cart'}
                                    </Button>
                                </>
                            ) : (
                                <p className="text-sm text-on-surface-variant">Product not found.</p>
                            )}
                        </Card>

                        {error ? <Alert variant="error">{error}</Alert> : null}

                        <Card className="space-y-2 p-4 text-xs text-on-surface-variant">
                            <p>Terms and conditions</p>
                            <p>14 day money back guarantee</p>
                            <p>Shipping 2-3 business days</p>
                        </Card>
                    </div>
                </div>
            </section>
        </CustomerHomeLayout>
    )
}
