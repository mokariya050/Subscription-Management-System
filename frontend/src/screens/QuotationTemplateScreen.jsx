import ProtectedAppPage from '../components/ProtectedAppPage'

export default function QuotationTemplateScreen() {
    return (
        <ProtectedAppPage
            current="settings"
            title="Quotation Template"
            subtitle="Maintain default quotation settings"
            maxWidth="max-w-3xl"
        >
            <div className="bg-white border border-[#e5e3df] rounded-xl p-8 space-y-4">
                <input className="w-full border border-[#d0cec9] rounded-lg px-3 py-2" placeholder="Template name" />
                <textarea rows={5} className="w-full border border-[#d0cec9] rounded-lg px-3 py-2" placeholder="Template body" />
            </div>
        </ProtectedAppPage>
    )
}
