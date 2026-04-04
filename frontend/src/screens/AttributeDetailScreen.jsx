import ProtectedAppPage from '../components/ProtectedAppPage'

export default function AttributeDetailScreen() {
    return (
        <ProtectedAppPage
            current="settings"
            title="Attribute Detail"
            subtitle="Define attribute values and pricing"
            maxWidth="max-w-3xl"
        >
            <div className="bg-white border border-[#e5e3df] rounded-xl p-8 space-y-4">
                <input className="w-full border border-[#d0cec9] rounded-lg px-3 py-2" placeholder="Attribute name" />
                <textarea rows={4} className="w-full border border-[#d0cec9] rounded-lg px-3 py-2" placeholder="Values" />
            </div>
        </ProtectedAppPage>
    )
}
