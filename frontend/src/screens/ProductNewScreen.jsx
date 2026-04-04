import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { productsAPI } from '../services/apiClient'
import AppPage from '../components/AppPage'

export default function ProductNewScreen() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    product_type: 'subscription',
    description: '',
    is_active: true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')

      const generatedSlug = (formData.slug || formData.name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')

      await productsAPI.create({
        name: formData.name,
        slug: generatedSlug,
        product_type: formData.product_type,
        description: formData.description,
        is_active: formData.is_active,
      })
      navigate('/products', { replace: true })
    } catch (err) {
      setError(err.message || 'Failed to create product')
    } finally {
      setSaving(false)
    }
  }

  const onLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  return (
    <AppPage
      current="products"
      onLogout={onLogout}
      maxWidth="max-w-2xl"
      title="New Product"
      subtitle="Create a new product for your subscriptions"
    >

      {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

      <form onSubmit={handleSave} className="bg-white border border-[#e5e3df] rounded-xl p-8 space-y-6">
        <div>
          <label className="block text-xs uppercase tracking-wider font-bold mb-2">Product Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Enterprise Cloud"
            className="w-full border border-[#d0cec9] rounded-lg px-4 py-2 text-[#1b2d4f] focus:outline-none focus:border-[#1b2d4f]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold mb-2">Slug *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              placeholder="auto-generated from name"
              className="w-full border border-[#d0cec9] rounded-lg px-4 py-2 text-[#1b2d4f] focus:outline-none focus:border-[#1b2d4f]"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-bold mb-2">Product Type *</label>
            <select
              value={formData.product_type}
              onChange={(e) => handleChange('product_type', e.target.value)}
              className="w-full border border-[#d0cec9] rounded-lg px-4 py-2 text-[#1b2d4f] focus:outline-none focus:border-[#1b2d4f]"
            >
              <option value="subscription">Subscription</option>
              <option value="product">Product</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-bold mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Product description"
            rows={4}
            className="w-full border border-[#d0cec9] rounded-lg px-4 py-2 text-[#1b2d4f] focus:outline-none focus:border-[#1b2d4f]"
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => handleChange('is_active', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm font-medium">Active</span>
        </label>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-[#1b2d4f] text-white px-6 py-2 rounded-md text-sm font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Creating...' : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="flex-1 border border-[#d0cec9] text-[#1b2d4f] px-6 py-2 rounded-md text-sm font-semibold hover:bg-[#f9f8f6]"
          >
            Cancel
          </button>
        </div>
      </form>
    </AppPage>
  )
}
