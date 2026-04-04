import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { productsAPI } from '../services/apiClient'
import AppPage from '../components/AppPage'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Field from '../components/ui/Field'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'

const ASSET_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api').replace(/\/api\/?$/, '')

const resolveAssetUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
    }
    if (url.startsWith('/')) {
        return `${ASSET_BASE_URL}${url}`
    }
    return url
}

export default function ProductDetailScreen() {
    const { user, loading: authLoading, logout } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const productId = searchParams.get('id')

    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState([])
    const [error, setError] = useState('')
    const [imageUrlsText, setImageUrlsText] = useState('')

    const onLogout = async () => {
        await logout()
        navigate('/internal/login', { replace: true })
    }

    useEffect(() => {
        if (authLoading) {
            return // Still loading auth, wait
        }

        if (!user) {
            navigate('/internal/login', { replace: true })
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
                const data = response.data || null
                setProduct(data)
                setImageUrlsText(Array.isArray(data?.image_urls) ? data.image_urls.join('\n') : '')
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
                base_price_cents: product.base_price_cents === '' ? null : Number(product.base_price_cents),
                currency: (product.currency || 'USD').toUpperCase(),
                image_urls: imageUrlsText
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean),
                is_active: Boolean(product.is_active),
            })
        } catch (err) {
            setError(err.message || 'Failed to save product')
        } finally {
            setSaving(false)
        }
    }

    const onUploadImages = async () => {
        if (!productId || selectedFiles.length === 0) return

        try {
            setUploading(true)
            setError('')
            const response = await productsAPI.uploadImages(productId, selectedFiles)
            const data = response.data || null
            setProduct(data)
            setImageUrlsText(Array.isArray(data?.image_urls) ? data.image_urls.join('\n') : '')
            setSelectedFiles([])
        } catch (err) {
            setError(err.message || 'Failed to upload images')
        } finally {
            setUploading(false)
        }
    }

    const onDeleteImage = async (imageId) => {
        if (!productId) return

        try {
            setError('')
            const response = await productsAPI.deleteImage(productId, imageId)
            const data = response.data || null
            setProduct(data)
            setImageUrlsText(Array.isArray(data?.image_urls) ? data.image_urls.join('\n') : '')
        } catch (err) {
            setError(err.message || 'Failed to delete image')
        }
    }

    return (
        <AppPage
            current="products"
            onLogout={onLogout}
            maxWidth="max-w-3xl"
            title="Product Detail"
            subtitle={productId ? `Product #${productId}` : 'Details'}
            actions={
                <Link to="/internal/products">
                    <Button type="button" variant="secondary" className="h-9 rounded-md px-4 py-0 text-sm">Back to Products</Button>
                </Link>
            }
        >
            {error ? <Alert variant="error" className="mb-6">{error}</Alert> : null}

            {loading ? (
                <div className="rounded-[1.75rem] border border-dashed border-outline-variant bg-white/70 py-14 text-center text-sm text-on-surface-variant">
                    Loading product...
                </div>
            ) : !product ? (
                <Card className="p-8 text-center">Product not found.</Card>
            ) : (
                <Card className="space-y-6 p-6 sm:p-8">
                    <Field label="Name" required>
                        <Input
                            value={product.name || ''}
                            onChange={(e) => onChange('name', e.target.value)}
                            placeholder="Product name"
                        />
                    </Field>

                    <Field label="Description">
                        <Textarea
                            value={product.description || ''}
                            onChange={(e) => onChange('description', e.target.value)}
                            rows={4}
                            placeholder="Product description"
                        />
                    </Field>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Base price (cents)">
                            <Input
                                type="number"
                                min="0"
                                step="1"
                                value={product.base_price_cents ?? ''}
                                onChange={(e) => onChange('base_price_cents', e.target.value)}
                                placeholder="e.g. 9999"
                            />
                        </Field>

                        <Field label="Currency">
                            <Input
                                value={product.currency || 'USD'}
                                maxLength={3}
                                onChange={(e) => onChange('currency', e.target.value.toUpperCase())}
                                placeholder="USD"
                            />
                        </Field>
                    </div>

                    <Field label="Product photo URLs">
                        <Textarea
                            value={imageUrlsText}
                            onChange={(e) => setImageUrlsText(e.target.value)}
                            placeholder={"One URL per line\nhttps://example.com/photo-1.jpg\nhttps://example.com/photo-2.jpg"}
                            rows={5}
                        />
                    </Field>

                    <Field label="Upload product photos">
                        <Input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            multiple
                            onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                        />
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onUploadImages}
                                disabled={uploading || selectedFiles.length === 0}
                            >
                                {uploading ? 'Uploading...' : `Upload ${selectedFiles.length || ''} file${selectedFiles.length === 1 ? '' : 's'}`}
                            </Button>
                            {selectedFiles.length > 0 ? (
                                <span className="text-xs text-on-surface-variant">{selectedFiles.length} file(s) selected.</span>
                            ) : null}
                        </div>
                    </Field>

                    {Array.isArray(product.image_assets) && product.image_assets.length > 0 ? (
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Existing photos</p>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {product.image_assets.map((asset) => (
                                    <Card key={asset.id} className="overflow-hidden p-0">
                                        <div className="aspect-[4/3] w-full bg-surface-container-low">
                                            <img
                                                src={resolveAssetUrl(asset.url)}
                                                alt="Product"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-3">
                                            <span className="text-xs text-on-surface-variant">#{asset.id}</span>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                className="h-8 rounded-md px-3 py-0 text-xs"
                                                onClick={() => onDeleteImage(asset.id)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    <label className="flex items-start gap-3 rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3">
                        <input
                            type="checkbox"
                            checked={Boolean(product.is_active)}
                            onChange={(e) => onChange('is_active', e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                        />
                        <span>
                            <span className="block font-semibold text-on-surface">Active product</span>
                            <span className="block text-sm text-on-surface-variant">Inactive products stay hidden from future selections.</span>
                        </span>
                    </label>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button type="button" onClick={onSave} disabled={saving} className="sm:flex-1">
                            {saving ? 'Saving...' : 'Save changes'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => navigate('/internal/products')} className="sm:flex-1">
                            Cancel
                        </Button>
                    </div>
                </Card>
            )}
        </AppPage>
    )
}
