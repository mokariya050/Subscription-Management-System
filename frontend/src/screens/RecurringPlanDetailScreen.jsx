import ProtectedAppPage from '../components/ProtectedAppPage'

export default function RecurringPlanDetailScreen() {
    return (
        <ProtectedAppPage
            current="settings"
            title="Recurring Plan"
            subtitle="Configure plan billing cycle and options"
            maxWidth="max-w-3xl"
        >
            <div className="bg-white border border-[#e5e3df] rounded-xl p-8 space-y-4">
                <input className="w-full border border-[#d0cec9] rounded-lg px-3 py-2" placeholder="Plan name" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="number" className="w-full border border-[#d0cec9] rounded-lg px-3 py-2" placeholder="Interval" />
                    <select className="w-full border border-[#d0cec9] rounded-lg px-3 py-2"><option>Month</option><option>Year</option></select>
                </div>
            </div>
        </ProtectedAppPage>
    )
}
