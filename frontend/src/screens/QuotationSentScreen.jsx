import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ensureHeadStyle, ensureStylesheets } from '../utils/pageStyles'

const anchorRoutes = {
    Subscriptions: '/home',
    Ledger: '/quotation-sent',
    Insights: '/draft-invoice',
    Settings: '/home',
}

const buttonRoutes = {
    'Add Subscription': '/subscription/other-info',
    'Create Invoice': '/draft-invoice',
    'Order Lines': '/quotation-sent',
    'Other Info': '/subscription/other-info',
    Close: '/home',
    Cancel: '/home',
}

const pageStyles = `
  body { font-family: 'Manrope', sans-serif; }
  h1, h2, h3, .serif-text { font-family: 'Noto Serif', serif; }
  .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; vertical-align: middle; }
`

function normalizeText(value) {
    return value.replace(/\s+/g, ' ').trim()
}

export default function QuotationSentScreen() {
    const navigate = useNavigate()

    useEffect(() => {
        document.title = 'SubSync - Quotation Sent'
        ensureStylesheets([
            'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
            'https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700&family=Manrope:wght@400;500;600;700&display=swap',
        ])
        ensureHeadStyle('quotation-sent-inline', pageStyles)
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
        <div onClick={onClick} className="bg-surface text-on-surface min-h-screen">
            <header className="bg-[#fbf9f5] dark:bg-slate-950 docked full-width top-0 z-50">
                <nav className="flex justify-between items-center w-full px-12 py-6 max-w-[1440px] mx-auto">
                    <div className="text-2xl font-serif font-bold text-[#1b2d4f] dark:text-slate-100 tracking-tight">The Ledger</div>
                    <div className="hidden md:flex items-center gap-8">
                        <a className="text-slate-500 dark:text-slate-400 font-medium hover:text-[#1b2d4f] dark:hover:text-white transition-colors duration-200" href="#">Subscriptions</a>
                        <a className="text-[#1b2d4f] dark:text-slate-100 font-bold border-b-2 border-[#e8a838] pb-1" href="#">Ledger</a>
                        <a className="text-slate-500 dark:text-slate-400 font-medium hover:text-[#1b2d4f] dark:hover:text-white transition-colors duration-200" href="#">Insights</a>
                        <a className="text-slate-500 dark:text-slate-400 font-medium hover:text-[#1b2d4f] dark:hover:text-white transition-colors duration-200" href="#">Settings</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="bg-[#1b2d4f] text-white px-5 py-2 rounded-md font-medium text-sm hover:opacity-90 transition-opacity">Add Subscription</button>
                        <div className="flex items-center gap-3 ml-4">
                            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">notifications</span>
                            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">settings</span>
                            <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden ml-2 border border-outline-variant">
                                <img alt="User profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8dILGsfzAqzJDBPqgGtmi7GO30J_jLg0ReeZ-AMTwu1G-JUxaxjI1BYBrvVS5RoFW5Kl97zIaytaqKsdMlEF4vCEV1X3VGATNflwD00LCKDmo0u1EZ9v7rOfMO7iEJ1zG7U1LkCTFZp8gfLqpUIs1Sa82GxdqqoCjHdDZ_3Db21nQNtZM2IkHlf4Lmkg7Q_A9KwuiM-lZrcELL2FoNiovA1l-_43in_nl5_M1JhPtBQSLUa48mkkmuiG8ZEbPm8RuKqAS5HIEgmNe" />
                            </div>
                        </div>
                    </div>
                </nav>
            </header>
            <main className="max-w-[1440px] mx-auto px-12 pb-24">
                <div className="flex justify-between items-center py-6">
                    <div className="flex items-center gap-3">
                        <button className="bg-[#1b2d4f] text-white px-6 py-2 rounded-md text-sm font-semibold tracking-wide">New</button>
                        <button className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-md transition-colors"><span className="material-symbols-outlined">delete</span></button>
                        <button className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-md transition-colors"><span className="material-symbols-outlined">ios_share</span></button>
                        <div className="h-6 w-px bg-outline-variant mx-2" />
                        <button className="border border-outline px-4 py-2 rounded-md text-sm font-semibold text-primary">Send</button>
                        <button className="border border-outline px-4 py-2 rounded-md text-sm font-semibold text-primary">Confirm</button>
                        <button className="border border-outline px-4 py-2 rounded-md text-sm font-semibold text-primary">Preview</button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center">
                            <span className="px-4 py-1.5 rounded-full text-xs font-bold border border-outline text-outline">Quotation</span>
                            <div className="w-4 h-px bg-outline" />
                            <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#E8A838] text-on-tertiary-fixed shadow-sm">Quotation Sent</span>
                            <div className="w-4 h-px bg-outline" />
                            <span className="px-4 py-1.5 rounded-full text-xs font-bold border border-outline text-outline">Confirmed</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3 pb-8">
                    <button className="flex items-center border border-primary text-primary px-5 py-2 rounded-md text-sm font-bold border-l-[6px] border-l-[#E8A838]">Create Invoice</button>
                    <button className="border border-outline text-on-surface-variant px-5 py-2 rounded-md text-sm font-semibold hover:bg-surface-container-low transition-colors">Cancel</button>
                    <button className="bg-green-50 border border-green-200 text-green-800 px-5 py-2 rounded-md text-sm font-semibold hover:bg-green-100 transition-colors">Renew</button>
                    <button className="bg-green-50 border border-green-200 text-green-800 px-5 py-2 rounded-md text-sm font-semibold hover:bg-green-100 transition-colors">Upsell</button>
                    <button className="border border-outline text-on-surface-variant px-5 py-2 rounded-md text-sm font-semibold ml-auto">Close</button>
                </div>
                <div className="relative">
                    <div className="absolute -top-10 -left-10 w-40 h-40 border-l border-t border-primary/10 pointer-events-none" />
                    <div className="mx-auto max-w-[1000px] bg-surface-container-low p-8 rounded-xl shadow-sm border border-outline-variant/10">
                        <div className="bg-surface-container-lowest rounded-lg p-10 shadow-[0_10px_40px_rgba(27,45,79,0.05)] border border-outline-variant/20">
                            <div className="mb-10 border-b border-outline-variant/30 pb-6 flex justify-between items-end">
                                <div>
                                    <span className="block text-[13px] font-bold text-[#1b2d4f] uppercase tracking-wider mb-2">Subscription Number</span>
                                    <h1 className="serif-text text-3xl font-bold text-slate-400">#SUB-2023-8842</h1>
                                </div>
                                <div className="text-right">
                                    <span className="label-md block text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-1">Total Amount</span>
                                    <span className="serif-text text-2xl font-bold text-[#1b2d4f]">$1,250.00</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-16 gap-y-8">
                                <div className="space-y-8">
                                    <div className="relative group">
                                        <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 group-focus-within:text-primary transition-colors">Customer</label>
                                        <div className="w-full border-b border-outline-variant group-focus-within:border-primary transition-colors py-2 text-primary font-medium">Acme Corp International</div>
                                    </div>
                                    <div className="relative group">
                                        <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 group-focus-within:text-primary transition-colors">Quotation Template</label>
                                        <div className="w-full border-b border-outline-variant group-focus-within:border-primary transition-colors py-2 text-primary font-medium">Enterprise Subscription (v4)</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="relative group"><label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 group-focus-within:text-primary transition-colors">Expiration</label><div className="w-full border-b border-outline-variant group-focus-within:border-primary transition-colors py-2 text-primary font-medium">12/31/2024</div></div>
                                    <div className="relative group"><label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 group-focus-within:text-primary transition-colors">Order Date</label><div className="w-full border-b border-outline-variant group-focus-within:border-primary transition-colors py-2 text-primary font-medium">06/15/2023</div></div>
                                    <div className="relative group"><label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 group-focus-within:text-primary transition-colors">Recurring Plan</label><div className="w-full border-b border-outline-variant group-focus-within:border-primary transition-colors py-2 text-primary font-medium">Monthly</div></div>
                                    <div className="relative group"><label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 group-focus-within:text-primary transition-colors">Payment Term</label><div className="w-full border-b border-outline-variant group-focus-within:border-primary transition-colors py-2 text-primary font-medium">Net 30 Days</div></div>
                                    <div className="col-span-2 relative group"><label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 group-focus-within:text-primary transition-colors">Next Invoice</label><div className="w-full border-b border-outline-variant group-focus-within:border-primary transition-colors py-2 text-primary font-medium">07/15/2023</div></div>
                                </div>
                            </div>
                            <div className="mt-16">
                                <div className="flex items-center gap-4 mb-6">
                                    <button className="bg-[#1b2d4f] text-white px-6 py-2.5 rounded-md text-sm font-bold tracking-wide">Order Lines</button>
                                    <button className="border border-outline text-on-surface-variant px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-surface-container-low transition-colors">Other Info</button>
                                </div>
                                <div className="overflow-hidden rounded-lg border border-outline-variant/30">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-surface-container-low">
                                            <tr>
                                                <th className="px-4 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Product</th>
                                                <th className="px-4 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Quantity</th>
                                                <th className="px-4 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Unit Price</th>
                                                <th className="px-4 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Discount</th>
                                                <th className="px-4 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Taxes</th>
                                                <th className="px-4 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-surface-container-lowest">
                                            <tr className="group hover:bg-surface-container-high/50 transition-colors">
                                                <td className="px-4 py-4 border-b border-outline-variant/20 text-sm font-bold text-primary">SaaS Premium Subscription Plan</td>
                                                <td className="px-4 py-4 border-b border-outline-variant/20 text-sm text-right">1.00</td>
                                                <td className="px-4 py-4 border-b border-outline-variant/20 text-sm text-right">$1,250.00</td>
                                                <td className="px-4 py-4 border-b border-outline-variant/20 text-sm text-right">0.00%</td>
                                                <td className="px-4 py-4 border-b border-outline-variant/20 text-sm">VAT 15%</td>
                                                <td className="px-4 py-4 border-b border-outline-variant/20 text-sm font-bold text-right">$1,250.00</td>
                                            </tr>
                                            <tr className="border-b border-dashed border-outline-variant/40"><td className="px-4 py-4 h-[45px]" /><td className="px-4 py-4" /><td className="px-4 py-4" /><td className="px-4 py-4" /><td className="px-4 py-4" /><td className="px-4 py-4" /></tr>
                                            <tr className="border-b border-dashed border-outline-variant/40"><td className="px-4 py-4 h-[45px]" /><td className="px-4 py-4" /><td className="px-4 py-4" /><td className="px-4 py-4" /><td className="px-4 py-4" /><td className="px-4 py-4" /></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="mt-4 flex justify-start">
                                    <button className="flex items-center gap-1.5 text-[#E8A838] font-bold text-sm hover:underline tracking-tight"><span className="material-symbols-outlined text-lg">add_circle</span>Add a line</button>
                                </div>
                                <div className="mt-12 flex justify-end">
                                    <div className="w-72 space-y-3">
                                        <div className="flex justify-between items-center text-sm"><span className="text-on-surface-variant font-medium">Untaxed Amount:</span><span className="text-primary font-bold">$1,250.00</span></div>
                                        <div className="flex justify-between items-center text-sm"><span className="text-on-surface-variant font-medium">Taxes:</span><span className="text-primary font-bold">$187.50</span></div>
                                        <div className="flex justify-between items-center pt-3 border-t border-primary/10"><span className="text-primary font-extrabold text-base uppercase tracking-tighter">Total:</span><span className="serif-text text-xl font-extrabold text-primary">$1,437.50</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -bottom-12 -right-12 w-64 h-64 border-r border-b border-[#E8A838]/20 pointer-events-none rounded-br-3xl" />
                </div>
            </main>
        </div>
    )
}
