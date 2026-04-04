import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import CustomerAssistantChat from '../customer/CustomerAssistantChat'
import Button from '../ui/Button'
import Card from '../ui/Card'

const navItems = [
    { key: 'home', label: 'Home', to: '/customer/home' },
    { key: 'shop', label: 'Shop', to: '/customer/shop' },
    { key: 'orders', label: 'Orders', to: '/customer/orders' },
    { key: 'account', label: 'Account', to: '/customer/profile' },
]

export default function CustomerHomeLayout({ children }) {
    const location = useLocation()
    const [profileOpen, setProfileOpen] = useState(false)
    const menuRef = useRef(null)

    const isNavActive = (to) => {
        const path = location.pathname

        if (to === '/customer/profile') {
            return path.startsWith('/customer/profile')
        }

        if (to === '/customer/orders') {
            return path.startsWith('/customer/orders')
        }

        return path === to || path.startsWith(`${to}/`)
    }

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setProfileOpen(false)
            }
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setProfileOpen(false)
            }
        }

        document.addEventListener('pointerdown', handlePointerDown)
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    return (
        <div className="min-h-screen text-[#1b2d4f]">
            <header className="sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur-xl">
                <a
                    href="#app-main"
                    className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary"
                >
                    Skip to content
                </a>
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap items-center gap-10">
                        <Link
                            to="/customer/home"
                            className="flex items-center gap-3 rounded-full px-2 py-1 text-[#1b2d4f] focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-sm">S</span>
                            <span className="text-2xl font-serif font-bold">SubSync</span>
                        </Link>

                        <nav className="ml-2 flex min-w-0 flex-1 items-center gap-3" aria-label="Customer navigation">
                            {navItems.map((item) => {
                                const active = isNavActive(item.to)

                                return (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        aria-current={active ? 'page' : undefined}
                                        className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${active
                                            ? 'border-primary bg-primary text-white shadow-sm'
                                            : 'border-outline-variant bg-white text-on-surface hover:border-primary hover:text-primary'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </nav>

                        <div className="ml-auto flex items-center gap-2" ref={menuRef}>
                            <Link to="/customer/cart">
                                <Button type="button" variant="secondary" className="px-4 py-2 text-sm">
                                    Cart
                                </Button>
                            </Link>

                            <div className="relative">
                                <Button
                                    type="button"
                                    aria-expanded={profileOpen}
                                    onClick={() => setProfileOpen((prev) => !prev)}
                                    variant="secondary"
                                    className="px-4 py-2 text-sm"
                                >
                                    My profile
                                </Button>

                                {profileOpen ? (
                                    <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-white/70 bg-white p-2 shadow-[0_20px_40px_rgba(27,45,79,0.14)]">
                                        <Link
                                            to="/customer/profile"
                                            className="mb-1 block rounded-xl px-4 py-2 text-sm text-on-surface transition hover:bg-surface-container-low hover:text-primary"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            User details
                                        </Link>
                                        <Link
                                            to="/customer/orders"
                                            className="mb-1 block rounded-xl px-4 py-2 text-sm text-on-surface transition hover:bg-surface-container-low hover:text-primary"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            My orders
                                        </Link>
                                        <Link
                                            to="/login"
                                            className="block rounded-xl px-4 py-2 text-sm text-on-surface transition hover:bg-surface-container-low hover:text-primary"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            Sign out
                                        </Link>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main id="app-main" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <Card className="h-full rounded-[2rem] px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                    {children}
                </Card>
            </main>

            <CustomerAssistantChat />
        </div>
    )
}
