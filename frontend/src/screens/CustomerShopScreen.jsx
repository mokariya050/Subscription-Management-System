import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Input from '../components/ui/Input'
import CustomerHomeLayout from '../components/layout/CustomerHomeLayout'
import PageHeader from '../components/layout/PageHeader'
import { storeAPI } from '../services/apiClient'

const defaultPriceRanges = [
    { key: 'all', label: 'All prices' },
    { key: 'under_25', label: '$0 - $25' },
    { key: '25_100', label: '$25 - $100' },
    { key: '100_plus', label: '$100+' },
]

const defaultSortOptions = [
    { key: 'price_asc', label: 'Sort by Price' },
    { key: 'price_desc', label: 'Sort by Price (Desc)' },
    { key: 'name_asc', label: 'Sort by Name' },
    { key: 'newest', label: 'Sort by Newest' },
]

const formatPrice = (cents, currency = 'USD') => {
    if (typeof cents !== 'number') return 'N/A'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100)
}

const formatInterval = (interval) => {
    if (!interval) return 'No billing interval'
    if (interval === 'monthly') return 'Monthly recurring plan'
    if (interval === 'yearly') return 'Yearly recurring plan'
    if (interval === 'one_time') return 'One-time purchase'
    return interval
}

function ProductWireframeCard({ product }) {
    const fromPrice = product.pricing_summary?.from_price_cents
    const toPrice = product.pricing_summary?.to_price_cents
    const interval = product.pricing_summary?.primary_interval

    const pricingLabel = useMemo(() => {
        if (typeof fromPrice !== 'number') return 'Pricing unavailable'
        if (typeof toPrice === 'number' && toPrice > fromPrice) {
            return `${formatPrice(fromPrice, product.currency)} - ${formatPrice(toPrice, product.currency)}`
        }
        return formatPrice(fromPrice, product.currency)
    }, [fromPrice, toPrice, product.currency])

    return (
        <Card className="flex min-h-[156px] flex-col justify-between rounded-[1rem] border border-outline-variant bg-white/80 p-4 text-left">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{product.name}</p>
                <p className="mt-2 text-sm font-semibold text-on-surface">{pricingLabel}</p>
                <p className="mt-2 text-[11px] leading-4 text-on-surface-variant">{product.description || 'No description available.'}</p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge variant="neutral">{formatInterval(interval)}</Badge>
                {product.plans?.length ? (
                    <Badge variant="info">{product.plans.length} plan{product.plans.length > 1 ? 's' : ''}</Badge>
                ) : (
                    <Badge variant="warning">No plans</Badge>
                )}
                <Link to={`/customer/products/${product.id}`} className="ml-auto">
                    <Button type="button" variant="secondary" className="h-8 rounded-md px-3 py-0 text-xs">View</Button>
                </Link>
            </div>
        </Card>
    )
}

export default function CustomerShopScreen() {
    const [catalogItems, setCatalogItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [query, setQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedPriceRange, setSelectedPriceRange] = useState('all')
    const [selectedSort, setSelectedSort] = useState('price_asc')
    const [categories, setCategories] = useState([])
    const [priceRanges, setPriceRanges] = useState(defaultPriceRanges)
    const [sortOptions, setSortOptions] = useState(defaultSortOptions)
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 })

    useEffect(() => {
        let ignore = false

        const loadFilters = async () => {
            try {
                const response = await storeAPI.getFilters()
                if (ignore) return

                const responseCategories = Array.isArray(response.data?.categories) ? response.data.categories : []
                const responsePriceRanges = Array.isArray(response.data?.price_ranges) ? response.data.price_ranges : defaultPriceRanges
                const responseSortOptions = Array.isArray(response.data?.sort_options) ? response.data.sort_options : defaultSortOptions

                setCategories(responseCategories)
                setPriceRanges(responsePriceRanges)
                setSortOptions(responseSortOptions)
            } catch {
                if (ignore) return
                setCategories([])
                setPriceRanges(defaultPriceRanges)
                setSortOptions(defaultSortOptions)
            }
        }

        loadFilters()

        return () => {
            ignore = true
        }
    }, [])

    useEffect(() => {
        let ignore = false

        const loadCatalog = async () => {
            try {
                setLoading(true)
                setError('')

                const response = await storeAPI.getCatalog({
                    q: query,
                    category: selectedCategory,
                    priceRange: selectedPriceRange,
                    sort: selectedSort,
                    page: pagination.page,
                    perPage: 16,
                })

                if (ignore) return

                const data = response.data || {}
                setCatalogItems(Array.isArray(data.items) ? data.items : [])
                setPagination((prev) => ({
                    ...prev,
                    total: Number(data.total || 0),
                    pages: Number(data.pages || 1),
                }))
            } catch (err) {
                if (ignore) return
                setError(err.message || 'Failed to load catalog')
                setCatalogItems([])
            } finally {
                if (!ignore) {
                    setLoading(false)
                }
            }
        }

        loadCatalog()

        return () => {
            ignore = true
        }
    }, [query, selectedCategory, selectedPriceRange, selectedSort, pagination.page])

    const categoryOptions = useMemo(
        () => ['all', ...categories.filter((category) => category !== 'all')],
        [categories],
    )

    useEffect(() => {
        const handle = setTimeout(() => {
            setPagination((prev) => ({ ...prev, page: 1 }))
            setQuery(searchInput.trim())
        }, 300)

        return () => clearTimeout(handle)
    }, [searchInput])

    const updateCategory = (category) => {
        setPagination((prev) => ({ ...prev, page: 1 }))
        setSelectedCategory(category)
    }

    const updatePriceRange = (range) => {
        setPagination((prev) => ({ ...prev, page: 1 }))
        setSelectedPriceRange(range)
    }

    const updateSort = (event) => {
        setPagination((prev) => ({ ...prev, page: 1 }))
        setSelectedSort(event.target.value)
    }

    const canGoPrev = pagination.page > 1
    const canGoNext = pagination.page < pagination.pages

    return (
        <CustomerHomeLayout>
            <section className="space-y-6">
                <PageHeader
                    eyebrow="Catalog"
                    title="Shop"
                    subtitle="Browse products by category, pricing, and recurring plan type."
                />

                <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
                    <aside className="rounded-[1rem] border border-outline-variant bg-white/80 p-4 text-sm text-on-surface-variant">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Category</p>
                            <div className="mt-3 space-y-2">
                                {categoryOptions.map((category) => (
                                    <button
                                        type="button"
                                        key={category}
                                        onClick={() => updateCategory(category)}
                                        className={`w-full rounded-md border px-3 py-2 text-left text-xs transition ${selectedCategory === category
                                            ? 'border-primary bg-secondary-container text-primary'
                                            : 'border-outline-variant text-on-surface-variant hover:border-primary/40'
                                            }`}
                                    >
                                        {category === 'all' ? 'All products' : category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 border-t border-outline-variant pt-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Price Range</p>
                            <div className="mt-3 space-y-2">
                                {priceRanges.map((range) => (
                                    <button
                                        type="button"
                                        key={range.key}
                                        onClick={() => updatePriceRange(range.key)}
                                        className={`w-full rounded-md border px-3 py-2 text-left text-xs transition ${selectedPriceRange === range.key
                                            ? 'border-primary bg-secondary-container text-primary'
                                            : 'border-outline-variant text-on-surface-variant hover:border-primary/40'
                                            }`}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    <div className="flex min-w-0 flex-col gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant pb-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">All Products</p>
                                <p className="mt-1 text-sm text-on-surface-variant">{pagination.total} product{pagination.total === 1 ? '' : 's'} available</p>
                            </div>

                            <select
                                value={selectedSort}
                                onChange={updateSort}
                                className="h-10 rounded-2xl border border-outline-variant bg-white px-3 text-sm text-on-surface focus:border-primary focus:outline-none"
                            >
                                {sortOptions.map((option) => (
                                    <option key={option.key} value={option.key}>{option.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-[minmax(0,280px)_auto]">
                            <Input
                                type="text"
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                placeholder="Search"
                                className="h-11 rounded-2xl"
                            />
                        </div>

                        {error ? <p className="text-sm text-error">{error}</p> : null}

                        {loading ? (
                            <div className="rounded-[1.75rem] border border-dashed border-outline-variant bg-white/70 py-14 text-center text-sm text-on-surface-variant">
                                Loading products...
                            </div>
                        ) : catalogItems.length === 0 ? (
                            <EmptyState
                                title="No products found"
                                description="Try another category, price range, or search term."
                            />
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                {catalogItems.map((product) => (
                                    <ProductWireframeCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between gap-3 pt-2">
                            <p className="text-xs text-on-surface-variant">Price and billing are shown from recurring plan data.</p>
                            <div className="flex items-center gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="h-9 rounded-md px-4 py-0"
                                    disabled={!canGoPrev}
                                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                                >
                                    Prev
                                </Button>
                                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                                    Page {pagination.page} / {Math.max(pagination.pages, 1)}
                                </span>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="h-9 rounded-md px-4 py-0"
                                    disabled={!canGoNext}
                                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </CustomerHomeLayout>
    )
}