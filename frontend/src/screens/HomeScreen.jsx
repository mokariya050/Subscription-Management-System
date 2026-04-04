import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { subscriptionsAPI } from '../services/apiClient'
import AppPage from '../components/AppPage'

export default function HomeScreen() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [subscriptions, setSubscriptions] = useState([])
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
                const response = await subscriptionsAPI.getAll()
                setSubscriptions(Array.isArray(response.data?.items) ? response.data.items : [])
            } catch (err) {
                setError(err.message || 'Failed to load subscriptions')
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
            current="subscriptions"
            onLogout={onLogout}
            title="Subscriptions"
            subtitle="Live data from backend API"
            actions={<Link to="/subscription/other-info" className="bg-[#1b2d4f] text-white px-5 py-2 rounded-md text-sm font-semibold">New</Link>}
        >

            {error && <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

            {loading ? (
                <div className="py-10 text-center text-slate-500">Loading subscriptions...</div>
            ) : subscriptions.length === 0 ? (
                <div className="bg-white rounded-xl border border-[#e5e3df] p-10 text-center">No subscriptions yet.</div>
            ) : (
                <div className="bg-white rounded-xl border border-[#e5e3df] overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#e5e3df] text-xs uppercase tracking-wider">
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Plan</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.map((sub) => (
                                <tr key={sub.id} className="border-b border-[#f0efec] hover:bg-[#f9f8f6] cursor-pointer" onClick={() => navigate(`/subscription/detail?id=${sub.id}`)}>
                                    <td className="px-4 py-3"># <span className="font-semibold">{sub.id}</span></td>
                                    <td className="px-4 py-3">{sub.customer_name || 'N/A'}</td>
                                    <td className="px-4 py-3">{sub.plan_name || 'N/A'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${sub.status === 'active' ? 'bg-green-100 text-green-800' :
                                            sub.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                                sub.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {sub.status || 'unknown'}
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
