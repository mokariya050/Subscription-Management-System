import { Link } from 'react-router-dom'
import ProtectedAppPage from '../components/ProtectedAppPage'

export default function DraftInvoiceScreen() {
    return (
        <ProtectedAppPage
            current="subscriptions"
            title="Draft Invoice"
            subtitle="Review draft lines before confirmation"
            maxWidth="max-w-4xl"
            actions={<Link to="/internal/invoice/new" className="bg-[#1b2d4f] text-white px-5 py-2 rounded-md text-sm font-semibold">Open Invoice Form</Link>}
        >
            <div className="bg-white border border-[#e5e3df] rounded-xl p-8">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-[#e5e3df] text-xs uppercase tracking-wider">
                            <th className="py-3">Item</th>
                            <th className="py-3">Quantity</th>
                            <th className="py-3">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-[#f0efec]"><td className="py-3">Subscription Charge</td><td className="py-3">1</td><td className="py-3">$99.00</td></tr>
                    </tbody>
                </table>
            </div>
        </ProtectedAppPage>
    )
}
