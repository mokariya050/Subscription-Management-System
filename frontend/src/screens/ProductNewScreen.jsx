import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { productsAPI } from '../services/apiClient'
import AppPage from '../components/AppPage'
import Card from '../components/ui/Card'
import Field from '../components/ui/Field'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Textarea from '../components/ui/Textarea'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'

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

      {error ? <Alert variant="error" className="mb-6">{error}</Alert> : null}

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <Field label="Product name" required>
            <Input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Enterprise Cloud"
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Slug">
              <Input
                type="text"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="auto-generated from name"
              />
            </Field>

            <Field label="Product type" required>
              <Select
                value={formData.product_type}
                onChange={(e) => handleChange('product_type', e.target.value)}
              >
                <option value="subscription">Subscription</option>
                <option value="product">Product</option>
              </Select>
            </Field>
          </div>

          <Field label="Description">
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Product description"
              rows={4}
            />
          </Field>

          <label className="flex items-start gap-3 rounded-2xl border border-outline-variant bg-surface-container-low px-4 py-3">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
            />
            <span>
              <span className="block font-semibold text-on-surface">Active product</span>
              <span className="block text-sm text-on-surface-variant">Inactive products stay hidden from future selections.</span>
            </span>
          </label>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button type="submit" disabled={saving} className="sm:flex-1">
              {saving ? 'Creating...' : 'Create product'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/products')} className="sm:flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </AppPage>
  )
}
