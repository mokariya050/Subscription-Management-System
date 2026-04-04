import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { productsAPI } from '../services/apiClient'
import AppPage from '../components/AppPage'

export default function ProductsScreen() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
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
    }, [navigate, user])

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
            actions={<Link to="/products/new" className="bg-[#1b2d4f] text-white px-5 py-2 rounded-md text-sm font-semibold">New Product</Link>}
        >

            {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

            {loading ? (
                <div className="py-10 text-center text-slate-500">Loading products...</div>
            ) : products.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#e5e3df] p-10 text-center">No products found.</div>
            ) : (
                <div className="bg-white rounded-xl border border-[#e5e3df] overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#e5e3df] text-xs uppercase tracking-wider">
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} className="border-b border-[#f0efec] hover:bg-[#f9f8f6] cursor-pointer" onClick={() => navigate(`/products/detail?id=${product.id}`)}>
                                    <td className="px-4 py-3 font-semibold">{product.name}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{product.description || 'N/A'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AppPage>
    )
}
