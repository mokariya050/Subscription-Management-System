import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ensureHeadStyle, ensureStylesheets } from '../utils/pageStyles'

const anchorRoutes = {
    Dashboard: '/home',
    Subscriptions: '/home',
    Ledger: '/quotation-sent',
    Analytics: '/draft-invoice',
}

const buttonRoutes = {
    New: '/subscription/other-info',
    Confirm: '/quotation-sent',
    'Order Lines': '/quotation-sent',
    'Other Info': '/subscription/other-info',
}

function normalizeText(value) {
    return value.replace(/\s+/g, ' ').trim()
}

const pageStyles = `
        body { font-family: 'Manrope', sans-serif; background-color: #F5F3EF; }
        .serif-text { font-family: 'Noto Serif', serif; }
        .underline-input {
            border: none;
            border-bottom: 1px solid #1b2d4f;
            background: transparent;
            padding: 8px 0;
            transition: border-color 150ms ease;
            width: 100%;
        }
        .underline-input:focus {
            outline: none;
            border-bottom-color: #e8a838;
            box-shadow: none;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .shadow-custom {
            box-shadow: 0 10px 40px rgba(27, 45, 79, 0.05);
        }
        .helper-text { font-size: 11px; }
    `

export default function SubscriptionOtherInfoScreen() {
    const navigate = useNavigate()

    useEffect(() => {
        document.title = 'SubSync - New Subscription (Other Info)'

        ensureStylesheets([
            'https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Manrope:wght@400;500;600;700&display=swap',
            'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
        ])
        ensureHeadStyle('subscription-other-info-inline', pageStyles)
    }, [])

    function onClick(event) {
        const anchor = event.target.closest('a')
        if (anchor) {
            const href = anchor.getAttribute('href')
            if (href && href.startsWith('/')) {
                event.preventDefault()
                navigate(href)
                return
            }

            if (href === '#') {
                const route = anchorRoutes[normalizeText(anchor.textContent || '')]
                if (route) {
                    event.preventDefault()
                    navigate(route)
                    return
                }
            }
        }

        const button = event.target.closest('button')
        if (!button) {
            return
        }

        const route = buttonRoutes[normalizeText(button.textContent || '')]
        if (!route) {
            return
        }

        event.preventDefault()
        navigate(route)
    }

    return (
        <div onClick={onClick} className="w-[1440px] h-[900px] mx-auto overflow-hidden text-on-surface">
            <header className="bg-[#ffffff] flex justify-between items-center px-8 py-4 w-full max-w-full relative z-10">
                <div className="flex items-center gap-8">
                    <h1 className="text-2xl font-bold font-['Noto_Serif'] text-[#1b2d4f] uppercase tracking-wider">SubSync</h1>
                </div>
                <nav className="flex items-center gap-8 font-['Noto_Serif'] text-[#1b2d4f] uppercase tracking-wider text-sm">
                    <a className="text-slate-500 hover:text-[#1b2d4f] transition-colors" href="#">Dashboard</a>
                    <a className="text-[#1b2d4f] border-b-2 border-[#e8a838] pb-1 font-bold" href="#">Subscriptions</a>
                    <a className="text-slate-500 hover:text-[#1b2d4f] transition-colors" href="#">Ledger</a>
                    <a className="text-slate-500 hover:text-[#1b2d4f] transition-colors" href="#">Analytics</a>
                </nav>
                <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-slate-500 hover:bg-[#f3f1ed] p-2 rounded-full cursor-pointer transition-all">notifications</span>
                    <span className="material-symbols-outlined text-slate-500 hover:bg-[#f3f1ed] p-2 rounded-full cursor-pointer transition-all">settings</span>
                    <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden">
                        <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlEbaYsbG9gvXTUujenm3H6IMbe6fu-fVEC9Ef0Q9jYH_XFOPpSgQBfHTRwwwRIbNhWNVg9RpcUgLD2bhFtpLuV2D6kSiSiFz0JLdl3GEvvm09sNkscNGpqjTo2RBpAoRZFR_NZWCyHvlmz6uOZiBQEOh8SI7pWuemtRC1R7v_b21nhfMNx7rIDSLoTL8gHDi5XxfXLYBJ9B4ah1_enwqGSg9xvDvMmcpZ2Lj6-RFFWFK5tWfqm6BP3bDPQKdq5xTdt_VuW7o91Ht6" />
                    </div>
                </div>
            </header>
            <div className="h-[48px] bg-surface flex items-center justify-between px-8">
                <div className="flex items-center gap-4">
                    <button className="bg-primary-container text-on-primary px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-primary transition-all">New</button>
                    <div className="flex gap-2 text-on-surface-variant">
                        <button className="p-1.5 hover:bg-surface-container-high rounded transition-all"><span className="material-symbols-outlined text-lg">delete</span></button>
                        <button className="p-1.5 hover:bg-surface-container-high rounded transition-all"><span className="material-symbols-outlined text-lg">ios_share</span></button>
                    </div>
                    <div className="h-4 w-[1px] bg-outline-variant mx-2" />
                    <button className="border border-primary text-primary px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-surface-container-low transition-all">Send</button>
                    <button className="border border-primary text-primary px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-surface-container-low transition-all">Confirm</button>
                </div>
                <div className="flex items-center">
                    <div className="flex items-center">
                        <div className="flex items-center">
                            <span className="bg-tertiary-fixed-dim text-on-tertiary-fixed px-3 py-1 rounded-l-full text-[11px] font-bold uppercase tracking-widest border border-tertiary-fixed-dim">Quotation</span>
                            <div className="w-0 h-0 border-y-[13px] border-y-transparent border-l-[10px] border-l-tertiary-fixed-dim" />
                        </div>
                        <div className="flex items-center -ml-1">
                            <div className="w-0 h-0 border-y-[13px] border-y-transparent border-l-[10px] border-l-surface-container-low" />
                            <span className="bg-surface-container-low text-on-surface-variant px-3 py-1 text-[11px] font-medium uppercase tracking-widest border-y border-outline-variant">Quotation Sent</span>
                            <div className="w-0 h-0 border-y-[13px] border-y-transparent border-l-[10px] border-l-surface-container-low" />
                        </div>
                        <div className="flex items-center -ml-1">
                            <div className="w-0 h-0 border-y-[13px] border-y-transparent border-l-[10px] border-l-surface-container-low" />
                            <span className="bg-surface-container-low text-on-surface-variant px-3 py-1 rounded-r-full text-[11px] font-medium uppercase tracking-widest border-y border-r border-outline-variant">Subscription</span>
                        </div>
                    </div>
                </div>
            </div>
            <main className="px-8 py-6 h-full">
                <div className="max-w-[1000px] mx-auto bg-surface-container-lowest rounded-xl shadow-custom p-10">
                    <div className="mb-10">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Subscription Number</label>
                        <input className="underline-input serif-text text-3xl font-bold text-primary" type="text" defaultValue="SUB/2024/0042" />
                    </div>
                    <div className="grid grid-cols-2 gap-x-20 gap-y-6 mb-10">
                        <div className="space-y-6">
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Customer</label>
                                <input className="underline-input text-sm" placeholder="Search or select..." type="text" />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Quotation Template</label>
                                <input className="underline-input text-sm" placeholder="Standard Subscription" type="text" />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Expiration</label>
                                <input className="underline-input text-sm" type="text" defaultValue="12/31/2024" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Recurring Plan</label>
                                    <input className="underline-input text-sm" type="text" defaultValue="Monthly" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Payment Term</label>
                                    <input className="underline-input text-sm" type="text" defaultValue="Immediate" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 mb-8">
                        <button className="px-6 py-2 rounded-full border border-primary text-primary text-xs font-bold uppercase tracking-wide hover:bg-surface-container-low transition-all">Order Lines</button>
                        <button className="px-6 py-2 rounded-full bg-primary text-on-primary text-xs font-bold uppercase tracking-wide">Other Info</button>
                    </div>
                    <div className="grid grid-cols-2 gap-x-20">
                        <div className="space-y-8">
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Salesperson</label>
                                <div className="relative group">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-surface-container-low pr-3 pl-1 py-1 rounded-full border border-outline-variant/20 pointer-events-none">
                                        <img className="w-5 h-5 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDArliyZz3sSSuYlrsYqKGIx5wWYM9tppy0TcfoJmfOVn43939I8GYYsA_33sYuqvufdS_i26f2AOdmRJTLJKiDaLyLbFYrOFjdgY1cdn47bTl4KNLGj9AzVylZLhqlxh9D2H1yDi5ph18BycsdTCuwWG3pDcoKpDahwGgzjY9b_NtcBEIl4XlmCMuIqUHqTwd1PFN9SNf0pkZ4ltBsUCwHUwNCV0q-oSSO49xynxsjH3ss9zeCPyLo32NrLrxjtKgHK3c61GOhHngE" />
                                        <span className="text-xs font-medium text-primary">Julianne Durand</span>
                                    </div>
                                    <input className="underline-input pl-36 text-sm" type="text" defaultValue="" />
                                </div>
                                <p className="helper-text italic text-slate-400 mt-1">Direct account manager for this subscription</p>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Payment Method</label>
                                <input className="underline-input text-sm italic placeholder:text-slate-300" placeholder="---" type="text" />
                                <p className="helper-text italic text-slate-400 mt-1">Bank transfer or Stripe integration required</p>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div>
                                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant block mb-1">Start Date</label>
                                <div className="relative">
                                    <input className="underline-input text-sm pr-8" type="text" defaultValue="Jan 01, 2024" />
                                    <span className="material-symbols-outlined absolute right-0 bottom-2 text-slate-400 text-lg">calendar_today</span>
                                </div>
                                <p className="helper-text italic text-slate-400 mt-1">First billing cycle begins on this date</p>
                            </div>
                            <div className="flex items-center justify-between pt-4">
                                <div>
                                    <label className="text-sm font-semibold text-primary">Payment Done</label>
                                    <p className="helper-text italic text-slate-400">Mark as settled for the initial period</p>
                                </div>
                                <div className="relative flex items-center">
                                    <input className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-0 transition-all cursor-pointer" type="checkbox" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="fixed top-1/2 left-0 w-full h-[1px] bg-primary opacity-5 -z-10 rotate-1" />
                <div className="fixed top-1/3 right-40 w-64 h-[1px] bg-primary opacity-5 -z-10 -rotate-45" />
            </main>
        </div>
    )
}
