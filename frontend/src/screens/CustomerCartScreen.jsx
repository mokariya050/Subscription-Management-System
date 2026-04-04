import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CustomerHomeLayout from '../components/layout/CustomerHomeLayout'
import PageHeader from '../components/layout/PageHeader'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
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

export default function CustomerCartScreen() {
    const navigate = useNavigate()
    const [cart, setCart] = useState(null)
    const [discountCode, setDiscountCode] = useState('')
    const [loading, setLoading] = useState(true)
    const [working, setWorking] = useState(false)
    const [error, setError] = useState('')

    const loadCart = async () => {
        try {
            setLoading(true)
            const response = await storeAPI.getCart()
            setCart(response.data || null)
        } catch (err) {
            setError(err.message || 'Failed to load cart')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCart()
    }, [])

    const updateQty = async (lineId, qty) => {
        try {
            setWorking(true)
            setError('')
            const response = await storeAPI.updateCartItem(lineId, qty)
            setCart(response.data || null)
        } catch (err) {
            setError(err.message || 'Unable to update quantity')
        } finally {
            setWorking(false)
        }
    }

    const removeLine = async (lineId) => {
        try {
            setWorking(true)
            setError('')
            const response = await storeAPI.removeCartItem(lineId)
            setCart(response.data || null)
        } catch (err) {
            setError(err.message || 'Unable to remove item')
        } finally {
            setWorking(false)
        }
    }

    const applyDiscount = async () => {
        if (!discountCode.trim()) return
        try {
            setWorking(true)
            setError('')
            const response = await storeAPI.applyDiscount(discountCode.trim())
            setCart(response.data || null)
        } catch (err) {
            setError(err.message || 'Invalid discount code')
        } finally {
            setWorking(false)
        }
    }

    const checkout = async () => {
        try {
            setWorking(true)
            setError('')
            const response = await storeAPI.checkout({
                address: 'Default address',
                paymentMethod: 'Razorpay',
            })

            const order = response.data || {}
            const orderId = order.id
            let gateway = order.payment_gateway || {}

            // Backward-compatible fallback: if checkout response has order id but no gateway,
            // request a payment session from the dedicated endpoint.
            if (orderId && gateway.provider !== 'razorpay') {
                const sessionResponse = await storeAPI.createOrderPaymentSession(orderId)
                gateway = sessionResponse.data?.payment_gateway || {}
            }

            if (!orderId || gateway.provider !== 'razorpay') {
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
                description: gateway.description || 'Order payment',
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

                        navigate(`/customer/orders/${orderId}/success`)
                    } catch (err) {
                        setError(err.message || 'Payment verification failed')
                    } finally {
                        setWorking(false)
                    }
                },
                modal: {
                    ondismiss: () => {
                        setError('Payment was cancelled. You can try again from cart.')
                        setWorking(false)
                    },
                },
                prefill: gateway.prefill || {},
                notes: {
                    customer_key: storeAPI.getCustomerKey(),
                    order_id: String(orderId),
                },
                theme: {
                    color: '#1b2d4f',
                },
            })

            razorpay.open()
            setWorking(false)
        } catch (err) {
            setError(err.message || 'Checkout failed')
            setWorking(false)
        }
    }

    return (
        <CustomerHomeLayout>
            <section className="space-y-6">
                <PageHeader
                    eyebrow="Checkout"
                    title="Cart"
                    subtitle="Update quantities, apply discounts, and complete your order."
                />

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="space-y-4">
                        {loading ? (
                            <Card className="p-4 text-sm text-on-surface-variant">Loading cart...</Card>
                        ) : (
                            <div className="space-y-3">
                                {(cart?.items || []).map((line) => (
                                    <Card key={line.line_id} className="grid gap-3 p-4 sm:grid-cols-[50px_minmax(0,1fr)_120px_auto] sm:items-center">
                                        <div className="h-10 w-10 rounded-md border border-outline-variant bg-surface-container-low" />
                                        <div>
                                            <p className="text-sm font-semibold text-on-surface">{line.product_name}</p>
                                            <p className="text-xs text-on-surface-variant">{line.plan_name || 'Default plan'}</p>
                                        </div>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={line.quantity}
                                            onChange={(event) => updateQty(line.line_id, Math.max(1, Number(event.target.value) || 1))}
                                            className="h-9 rounded-xl"
                                        />
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-primary">{formatPrice(line.line_total_cents, line.currency)}</p>
                                            <Button type="button" variant="secondary" className="h-8 rounded-md px-3 py-0 text-xs" onClick={() => removeLine(line.line_id)}>
                                                Remove
                                            </Button>
                                        </div>
                                    </Card>
                                ))}

                                {cart && cart.items.length === 0 ? (
                                    <Card className="p-5 text-sm text-on-surface-variant">Your cart is empty.</Card>
                                ) : null}
                            </div>
                        )}

                        {error ? <Alert variant="error">{error}</Alert> : null}
                    </div>

                    <Card className="space-y-3 p-4">
                        <div className="space-y-2 border-b border-outline-variant pb-3 text-sm">
                            <div className="flex items-center justify-between"><span>Subtotal</span><span>{formatPrice(cart?.subtotal_cents, cart?.currency)}</span></div>
                            <div className="flex items-center justify-between"><span>Taxes</span><span>{formatPrice(cart?.tax_cents, cart?.currency)}</span></div>
                            <div className="flex items-center justify-between font-semibold text-primary"><span>Total</span><span>{formatPrice(cart?.total_cents, cart?.currency)}</span></div>
                        </div>

                        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                            <Input
                                type="text"
                                placeholder="Discount code"
                                value={discountCode}
                                onChange={(event) => setDiscountCode(event.target.value)}
                                className="h-9 rounded-xl"
                            />
                            <Button type="button" variant="secondary" className="h-9 rounded-md px-3 py-0 text-xs" onClick={applyDiscount} disabled={working}>
                                Apply
                            </Button>
                        </div>

                        <Button type="button" className="w-full" onClick={checkout} disabled={working || !cart || cart.items.length === 0}>
                            {working ? 'Processing...' : 'Checkout'}
                        </Button>
                    </Card>
                </div>
            </section>
        </CustomerHomeLayout>
    )
}
