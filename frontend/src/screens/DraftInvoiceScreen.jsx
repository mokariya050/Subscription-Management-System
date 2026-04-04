import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ensureHeadStyle, ensureStylesheets } from '../utils/pageStyles'

const anchorRoutes = {
    Subscriptions: '/home',
    Products: '/subscription/other-info',
    Reporting: '/quotation-sent',
    'Users/Contacts': '/home',
    Configuration: '/home',
}

const buttonRoutes = {
    Confirm: '/home',
    Cancel: '/quotation-sent',
    'Order Lines': '/draft-invoice',
    'Other Info': '/subscription/other-info',
    'Add a line': '/draft-invoice',
}

const pageStyles = `
  .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .filled-icon { font-variation-settings: 'FILL' 1; }
  body { background-color: #f5f3ef; font-family: 'DM Sans', sans-serif; }
  .serif-text { font-family: 'Playfair Display', 'Noto Serif', serif; }
  .input-underline {
    border-bottom: 1px solid #1b2d4f;
    background: transparent;
    border-top: 0;
    border-left: 0;
    border-right: 0;
    border-radius: 0;
    padding-left: 0;
    padding-right: 0;
  }
  .input-underline:focus {
    outline: 0;
    border-bottom: 2px solid #1b2d4f;
    box-shadow: none;
  }
`

function normalizeText(value) {
    return value.replace(/\s+/g, ' ').trim()
}

export default function DraftInvoiceScreen() {
    const navigate = useNavigate()

    useEffect(() => {
        document.title = 'SubSync - Draft Invoice'
        ensureStylesheets([
            'https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;700;900&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap',
            'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap',
        ])
        ensureHeadStyle('draft-invoice-inline', pageStyles)
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
        <div onClick={onClick} className="min-h-screen text-on-background">
            <header className="bg-[#fbf9f5] dark:bg-slate-950 flex justify-between items-center w-full px-8 h-16 max-w-screen-2xl mx-auto">
                <div className="flex items-center gap-12">
                    <span className="font-serif text-2xl font-black text-[#1b2d4f] dark:text-blue-400">SubSync</span>
                    <nav className="hidden md:flex gap-8 items-center">
                        <a className="text-slate-500 dark:text-slate-400 font-medium hover:text-[#1b2d4f] transition-colors duration-200 font-sans uppercase tracking-wider text-xs font-bold" href="#">Subscriptions</a>
                        <a className="text-slate-500 dark:text-slate-400 font-medium hover:text-[#1b2d4f] transition-colors duration-200 font-sans uppercase tracking-wider text-xs font-bold" href="#">Products</a>
                        <a className="text-slate-500 dark:text-slate-400 font-medium hover:text-[#1b2d4f] transition-colors duration-200 font-sans uppercase tracking-wider text-xs font-bold" href="#">Reporting</a>
                        <a className="text-slate-500 dark:text-slate-400 font-medium hover:text-[#1b2d4f] transition-colors duration-200 font-sans uppercase tracking-wider text-xs font-bold" href="#">Users/Contacts</a>
                        <a className="text-slate-500 dark:text-slate-400 font-medium hover:text-[#1b2d4f] transition-colors duration-200 font-sans uppercase tracking-wider text-xs font-bold" href="#">Configuration</a>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary/60">My Profile</span>
                    <div className="flex -space-x-2 overflow-hidden">
                        <img alt="User Avatar" className="inline-block h-8 w-8 rounded-full ring-2 ring-background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLIwiYIDtq2b926o7KIHP3fXQ199uuaAmNz1HwPp4MUnx19p24kKPSIx8rFsLztD9t2qic82wC1SnO6Tz0COx73aydEy0nB6KQjdpQ3E95Zvp3eqjyq9sfPa_WtdSSVo93tQos2UqN9mD8W54GpshTTw3m-zE6-kfX_66oQ0XEqU9iD6MRyEvHOwU2D3TsVVhLHgCXahCsyC-EuHP1kyDzVRLwGVrROPEbZDtRYQ9wZyk0CeQLjGOMZdX8saWweAPg8WDFkJdi9vBS" />
                    </div>
                    <span className="material-symbols-outlined text-primary text-2xl cursor-pointer">account_circle</span>
                </div>
            </header>
            <main className="max-w-5xl mx-auto px-8 py-6">
                <div className="flex justify-between items-end mb-8">
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-primary/40 hover:text-error transition-colors"><span className="material-symbols-outlined">delete</span></button>
                        <button className="px-6 py-2 border-l-4 border-l-tertiary-fixed-dim border border-primary/10 text-primary font-bold text-xs uppercase tracking-widest hover:bg-surface-container transition-all">Confirm</button>
                        <button className="px-6 py-2 border border-primary/10 text-primary/60 font-bold text-xs uppercase tracking-widest hover:bg-surface-container transition-all">Cancel</button>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">State of Invoice</span>
                        <div className="flex border border-primary/10 rounded-lg overflow-hidden">
                            <div className="px-6 py-1.5 bg-tertiary-fixed-dim text-on-tertiary-fixed font-bold text-xs uppercase tracking-wider">Draft</div>
                            <div className="px-6 py-1.5 bg-transparent text-primary/30 font-bold text-xs uppercase tracking-wider border-l border-primary/10">Confirmed</div>
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute -top-6 right-0">
                        <p className="text-[10px] italic text-primary/40 font-medium">Upon clicking Create Invoice Button, redirect user to draft invoice page...</p>
                    </div>
                    <div className="bg-surface-container-lowest rounded-xl shadow-[0_10px_40px_rgba(27,45,79,0.05)] p-10 border border-primary/5">
                        <div className="mb-12">
                            <h1 className="serif-text text-4xl font-black text-primary leading-tight">Draft Invoice</h1>
                            <div className="w-12 h-1 bg-tertiary-fixed-dim mt-2" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10 mb-16">
                            <div className="flex flex-col gap-2"><label className="text-[12px] font-semibold text-primary uppercase tracking-wider">Customer</label><input className="input-underline w-[240px] text-sm text-primary/80 placeholder:text-primary/20" placeholder="Search" type="text" /></div>
                            <div className="flex flex-col gap-2"><label className="text-[12px] font-semibold text-primary uppercase tracking-wider">Invoice Date</label><input className="input-underline w-[240px] text-sm text-primary/80" type="date" /></div>
                            <div className="flex flex-col gap-2"><label className="text-[12px] font-semibold text-primary uppercase tracking-wider">Due Date</label><input className="input-underline w-[240px] text-sm text-primary/80" type="date" /></div>
                        </div>
                        <div className="flex gap-4 mb-8">
                            <button className="px-8 py-2 bg-primary text-white text-[11px] font-bold uppercase tracking-widest rounded-md">Order Lines</button>
                            <button className="px-8 py-2 border border-primary/10 text-primary/40 text-[11px] font-bold uppercase tracking-widest rounded-md hover:bg-surface-container-low transition-colors">Other Info</button>
                        </div>
                        <div className="overflow-hidden rounded-lg">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-surface-container-low text-[11px] font-bold text-primary uppercase tracking-[0.2em]">
                                        <th className="px-4 py-4 w-2/5">Product</th><th className="px-4 py-4">Quantity</th><th className="px-4 py-4">Unit Price</th><th className="px-4 py-4">Taxes</th><th className="px-4 py-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm font-medium text-primary">
                                    <tr className="border-b border-primary/5"><td className="px-4 py-5 text-primary/70 italic">demo</td><td className="px-4 py-5">1.00</td><td className="px-4 py-5">$0.00</td><td className="px-4 py-5"><span className="px-2 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px]">Exempt</span></td><td className="px-4 py-5 text-right font-bold">$0.00</td></tr>
                                    <tr className="border-b border-primary/5 border-dashed"><td className="px-4 py-5">&nbsp;</td><td className="px-4 py-5">&nbsp;</td><td className="px-4 py-5">&nbsp;</td><td className="px-4 py-5">&nbsp;</td><td className="px-4 py-5 text-right">&nbsp;</td></tr>
                                    <tr className="border-b border-primary/5 border-dashed"><td className="px-4 py-5">&nbsp;</td><td className="px-4 py-5">&nbsp;</td><td className="px-4 py-5">&nbsp;</td><td className="px-4 py-5">&nbsp;</td><td className="px-4 py-5 text-right">&nbsp;</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-6 flex justify-between items-start">
                            <button className="flex items-center gap-2 text-tertiary-fixed-dim hover:text-tertiary-container transition-colors font-bold text-xs uppercase tracking-widest"><span className="material-symbols-outlined text-lg">add_circle</span>Add a line</button>
                            <div className="w-72 flex flex-col gap-4">
                                <div className="flex justify-between items-center text-sm font-medium text-primary/60"><span>Untaxed Amount:</span><span className="serif-text font-bold">$0.00</span></div>
                                <div className="flex justify-between items-center text-sm font-medium text-primary/60"><span>Taxes:</span><span className="serif-text font-bold">$0.00</span></div>
                                <div className="w-full h-px bg-primary/10 my-2" />
                                <div className="flex justify-between items-center"><span className="text-xs font-extrabold uppercase tracking-widest text-primary">Total:</span><span className="serif-text text-2xl font-black text-primary">$0.00</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="bg-[#fbf9f5] dark:bg-slate-950 flex flex-col md:flex-row justify-between items-center px-8 py-12 border-t border-[#1b2d4f]/10 mt-12 max-w-screen-2xl mx-auto">
                <span className="font-sans text-xs uppercase tracking-widest text-slate-400">© 2024 SubSync Ledger. All rights reserved.</span>
                <div className="flex gap-8 mt-4 md:mt-0">
                    <a className="text-slate-400 font-sans text-xs uppercase tracking-widest hover:text-[#e8a838] transition-colors" href="#">Terms of Service</a>
                    <a className="text-slate-400 font-sans text-xs uppercase tracking-widest hover:text-[#e8a838] transition-colors" href="#">Privacy Policy</a>
                    <a className="text-slate-400 font-sans text-xs uppercase tracking-widest hover:text-[#e8a838] transition-colors" href="#">Audit Logs</a>
                </div>
            </footer>
        </div>
    )
}
