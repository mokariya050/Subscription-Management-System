import { Link } from 'react-router-dom'

const navItems = [
    { key: 'subscriptions', to: '/home', label: 'Subscriptions' },
    { key: 'products', to: '/products', label: 'Products' },
    { key: 'settings', to: '/configuration', label: 'Settings' },
]

export default function AppNavbar({ current, onLogout }) {
    return (
        <header className="bg-white border-b border-[#e5e3df] sticky top-0 z-10">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-serif font-bold text-[#1b2d4f]">SubSync</h1>

                <div className="flex items-center gap-3">
                    {navItems.map((item) => (
                        <Link
                            key={item.key}
                            to={item.to}
                            className={`px-4 py-1.5 rounded-full text-sm border ${current === item.key
                                    ? 'border-[#1b2d4f] bg-[#1b2d4f] text-white'
                                    : 'border-[#d0cec9] text-[#1b2d4f]'
                                }`}
                        >
                            {item.label}
                        </Link>
                    ))}

                    {onLogout && (
                        <button
                            onClick={onLogout}
                            className="px-4 py-1.5 border border-[#1b2d4f] rounded-full text-sm text-[#1b2d4f]"
                        >
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </header>
    )
}