import { Link } from 'react-router-dom'
import ProtectedAppPage from '../components/ProtectedAppPage'

export default function NewInvoiceScreen() {
    return (
        <ProtectedAppPage
            current="subscriptions"
            title="New Invoice"
            subtitle="Create and confirm invoice"
            maxWidth="max-w-3xl"
            actions={<Link to="/invoice/new/payment" className="bg-[#1b2d4f] text-white px-5 py-2 rounded-md text-sm font-semibold">Payment Step</Link>}
        >
            <div className="bg-white border border-[#e5e3df] rounded-xl p-8 space-y-4">
                <div>
                    <label className="block text-xs uppercase tracking-wider font-bold mb-2">Customer</label>
                    <input className="w-full border border-[#d0cec9] rounded-lg px-3 py-2" placeholder="Customer name" />
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-wider font-bold mb-2">Notes</label>
                    <textarea rows={4} className="w-full border border-[#d0cec9] rounded-lg px-3 py-2" />
                </div>
            </div>
        </ProtectedAppPage>
    )
}
