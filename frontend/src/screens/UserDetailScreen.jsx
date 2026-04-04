import ProtectedAppPage from '../components/ProtectedAppPage'

export default function UserDetailScreen() {
    return (
        <ProtectedAppPage
            current="settings"
            title="User Detail"
            subtitle="Manage user profile information"
            maxWidth="max-w-3xl"
        >
            <div className="bg-white border border-[#e5e3df] rounded-xl p-8 space-y-4">
                <input className="w-full border border-[#d0cec9] rounded-lg px-3 py-2" placeholder="Full name" />
                <input className="w-full border border-[#d0cec9] rounded-lg px-3 py-2" placeholder="Email" />
                <input className="w-full border border-[#d0cec9] rounded-lg px-3 py-2" placeholder="Phone" />
            </div>
        </ProtectedAppPage>
    )
}
