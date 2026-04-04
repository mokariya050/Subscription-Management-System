import ProtectedAppPage from '../components/ProtectedAppPage'

export default function VariantDetailScreen() {
    return (
        <ProtectedAppPage
            current="settings"
            title="Variant Detail"
            subtitle="Configure variant definitions used in products"
            maxWidth="max-w-3xl"
        >
            <div className="bg-white border border-[#e5e3df] rounded-xl p-8 space-y-4">
                <input className="w-full border border-[#d0cec9] rounded-lg px-3 py-2" placeholder="Variant name" />
                <textarea rows={4} className="w-full border border-[#d0cec9] rounded-lg px-3 py-2" placeholder="Variant options (comma separated)" />
            </div>
        </ProtectedAppPage>
    )
}
