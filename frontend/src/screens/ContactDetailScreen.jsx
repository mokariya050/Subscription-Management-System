import ProtectedAppPage from '../components/ProtectedAppPage'

export default function ContactDetailScreen() {
    return (
        <ProtectedAppPage
            current="settings"
            title="Contact Detail"
            subtitle="Manage contact information"
            maxWidth="max-w-3xl"
        >
            <div className="bg-white border border-[#e5e3df] rounded-xl p-8 space-y-4">
                <input className="w-full border border-[#d0cec9] rounded-lg px-3 py-2" placeholder="Contact name" />
                <input className="w-full border border-[#d0cec9] rounded-lg px-3 py-2" placeholder="Company" />
                <textarea rows={3} className="w-full border border-[#d0cec9] rounded-lg px-3 py-2" placeholder="Address" />
            </div>
        </ProtectedAppPage>
    )
}
