import { Link } from 'react-router-dom'
import ProtectedAppPage from '../components/ProtectedAppPage'

export default function QuotationSentScreen() {
    return (
        <ProtectedAppPage
            current="subscriptions"
            title="Quotation Sent"
            subtitle="Track next steps for this customer"
            maxWidth="max-w-3xl"
            actions={<Link to="/internal/draft-invoice" className="bg-[#1b2d4f] text-white px-5 py-2 rounded-md text-sm font-semibold">Create Draft Invoice</Link>}
        >
            <div className="bg-white border border-[#e5e3df] rounded-xl p-8 space-y-4">
                <p className="text-sm">Quotation has been sent successfully.</p>
                <div className="flex flex-wrap gap-3 pt-2">
                    <Link to="/internal/home" className="px-4 py-2 border border-[#d0cec9] rounded-md text-sm">Back to Subscriptions</Link>
                    <Link to="/internal/invoice/new" className="px-4 py-2 border border-[#d0cec9] rounded-md text-sm">Create Invoice</Link>
                </div>
            </div>
        </ProtectedAppPage>
    )
}
