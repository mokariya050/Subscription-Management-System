import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { productsAPI } from '../services/apiClient'
import AppPage from '../components/AppPage'

export default function ProductDetailScreen() {
    const { user, loading: authLoading, logout } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const productId = searchParams.get('id')

    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const onLogout = async () => {
        await logout()
        navigate('/login', { replace: true })
    }

    useEffect(() => {
        if (authLoading) {
            return // Still loading auth, wait
        }

        if (!user) {
            navigate('/login', { replace: true })
            return
        }

        const load = async () => {
            if (!productId) {
                setError('Missing product id in URL')
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                const response = await productsAPI.getById(productId)
                setProduct(response.data || null)
            } catch (err) {
                setError(err.message || 'Failed to load product')
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [navigate, productId, user, authLoading])

    const onChange = (name, value) => {
        setProduct((prev) => ({ ...prev, [name]: value }))
    }

    const onSave = async () => {
        if (!productId || !product) return
        try {
            setSaving(true)
            setError('')
            await productsAPI.update(productId, {
                name: product.name,
                description: product.description,
                is_active: Boolean(product.is_active),
            })
        } catch (err) {
            setError(err.message || 'Failed to save product')
        } finally {
            setSaving(false)
        }
    }

    return (
        <AppPage
            current="products"
            onLogout={onLogout}
            title="Product Detail"
            subtitle={productId ? `Product #${productId}` : 'Details'}
            actions={<Link to="/products" className="px-4 py-1.5 border border-[#d0cec9] rounded-full text-sm">Back to Products</Link>}
        >
            {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

            {loading ? (
                <div className="py-10 text-center text-slate-500">Loading product...</div>
            ) : !product ? (
                <div className="bg-white border border-[#e5e3df] rounded-xl p-8 text-center">Product not found.</div>
            ) : (
                <div className="bg-white border border-[#e5e3df] rounded-xl p-8 space-y-5">
                    <div>
                        <label className="block text-xs uppercase tracking-wider font-bold mb-2">Name</label>
                        <input value={product.name || ''} onChange={(e) => onChange('name', e.target.value)} className="w-full border border-[#d0cec9] rounded-lg px-3 py-2" />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider font-bold mb-2">Description</label>
                        <textarea value={product.description || ''} onChange={(e) => onChange('description', e.target.value)} rows={4} className="w-full border border-[#d0cec9] rounded-lg px-3 py-2" />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={Boolean(product.is_active)} onChange={(e) => onChange('is_active', e.target.checked)} />
                        Active
                    </label>

                    <button onClick={onSave} disabled={saving} className="bg-[#1b2d4f] text-white px-6 py-2 rounded-md text-sm font-semibold disabled:opacity-60">
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            )}
        </AppPage>
    )
}
