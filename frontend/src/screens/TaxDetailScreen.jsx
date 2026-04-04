import ProtectedAppPage from '../components/ProtectedAppPage'

export default function TaxDetailScreen() {
    return (
        <ProtectedAppPage
            current="settings"
            title="Tax Detail"
            subtitle="Configure tax computation rules"
            maxWidth="max-w-3xl"
        >
            <div className="bg-white border border-[#e5e3df] rounded-xl p-8 space-y-4">
                <input className="w-full border border-[#d0cec9] rounded-lg px-3 py-2" placeholder="Tax name" />
                <select className="w-full border border-[#d0cec9] rounded-lg px-3 py-2">
                    <option>Percentage of price</option>
                    <option>Fixed amount</option>
                </select>
                <input type="number" className="w-full border border-[#d0cec9] rounded-lg px-3 py-2" placeholder="Tax amount" />
            </div>
        </ProtectedAppPage>
    )
}
