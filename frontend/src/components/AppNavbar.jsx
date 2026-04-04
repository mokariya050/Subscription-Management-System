import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const navItems = [
    { key: 'subscriptions', to: '/internal/home', label: 'Subscriptions' },
    { key: 'invoices', to: '/internal/invoices', label: 'Invoices' },
    { key: 'products', to: '/internal/products', label: 'Products' },
    { key: 'contacts', to: '/internal/contacts', label: 'Contacts' },
    { key: 'users', to: '/internal/users/detail', label: 'Users' },
    { key: 'settings', to: '/internal/configuration', label: 'Settings' },
]

export default function AppNavbar({ current, onLogout }) {
    const location = useLocation()
    const navigate = useNavigate()
    const [showSettingsMenu, setShowSettingsMenu] = useState(false)
    const [showQuickNav, setShowQuickNav] = useState(false)
    const [query, setQuery] = useState('')
    const [activeQuickNavIndex, setActiveQuickNavIndex] = useState(-1)
    const menuRef = useRef(null)
    const quickNavInputRef = useRef(null)
    const quickNavItemRefs = useRef([])

    const settingsItems = [
        { to: '/internal/configuration/variant', label: 'Variants' },
        { to: '/internal/configuration/recurring-plan', label: 'Recurring Plan' },
        { to: '/internal/configuration/quotation-template', label: 'Quotation Template' },
        { to: '/internal/configuration/payment-term', label: 'Payment Term' },
        { to: '/internal/configuration/discount', label: 'Discount' },
        { to: '/internal/configuration/tax', label: 'Taxes' },
    ]

    const routeOrder = [
        '/internal/home',
        '/internal/invoices',
        '/internal/products',
        '/internal/contacts',
        '/internal/users/detail',
        '/internal/configuration',
    ]

    const isPathActive = (key) => {
        const path = location.pathname

        if (key === 'subscriptions') {
            return path === '/internal/home' || path.startsWith('/internal/subscription') || path === '/internal/quotation-sent' || path === '/internal/draft-invoice'
        }

        if (key === 'invoices') {
            return path === '/internal/invoices' || path.startsWith('/internal/invoice/')
        }

        if (key === 'products') {
            return path.startsWith('/internal/products')
        }

        if (key === 'contacts') {
            return path.startsWith('/internal/contacts')
        }

        if (key === 'users') {
            return path.startsWith('/internal/users')
        }

        if (key === 'settings') {
            return path.startsWith('/internal/configuration')
        }

        return false
    }

    const activeRouteIndex = useMemo(() => {
        const path = location.pathname

        if (path.startsWith('/internal/subscription') || path === '/internal/quotation-sent' || path === '/internal/draft-invoice') {
            return 0
        }

        if (path === '/internal/invoices' || path.startsWith('/internal/invoice/')) {
            return 1
        }

        if (path.startsWith('/internal/products')) {
            return 2
        }

        if (path.startsWith('/internal/contacts')) {
            return 3
        }

        if (path.startsWith('/internal/users')) {
            return 4
        }

        if (path.startsWith('/internal/configuration')) {
            return 5
        }

        return -1
    }, [location.pathname])

    const quickNavItems = useMemo(() => {
        const baseItems = [
            ...navItems.map((item) => ({ to: item.to, label: item.label })),
            ...settingsItems.map((item) => ({ to: item.to, label: `Settings: ${item.label}` })),
            { to: '/invoice/new', label: 'Create New Invoice' },
            { to: '/products/new', label: 'Create New Product' },
        ]

        const normalizedQuery = query.trim().toLowerCase()

        if (!normalizedQuery) {
            return baseItems
        }

        return baseItems.filter((item) => item.label.toLowerCase().includes(normalizedQuery))
    }, [query, settingsItems])

    const openQuickNav = () => {
        setShowQuickNav(true)
    }

    const closeQuickNav = () => {
        setShowQuickNav(false)
        setQuery('')
        setActiveQuickNavIndex(-1)
    }

    const handleQuickNavigate = (to) => {
        navigate(to)
        closeQuickNav()
        setShowSettingsMenu(false)
    }

    const focusQuickNavItem = (index) => {
        const safeIndex = Math.max(0, Math.min(index, quickNavItems.length - 1))
        const element = quickNavItemRefs.current[safeIndex]

        if (element) {
            setActiveQuickNavIndex(safeIndex)
            element.focus()
        }
    }

    const moveQuickNavFocus = (direction, fromIndex = -1) => {
        if (quickNavItems.length === 0) {
            return
        }

        if (fromIndex < 0) {
            focusQuickNavItem(direction > 0 ? 0 : quickNavItems.length - 1)
            return
        }

        const nextIndex = (fromIndex + direction + quickNavItems.length) % quickNavItems.length
        focusQuickNavItem(nextIndex)
    }

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowSettingsMenu(false)
            }
        }

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setShowSettingsMenu(false)
                closeQuickNav()
            }

            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault()
                openQuickNav()
            }
        }

        document.addEventListener('pointerdown', handlePointerDown)
        document.addEventListener('keydown', handleKeyDown)

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    useEffect(() => {
        if (showQuickNav && quickNavInputRef.current) {
            quickNavInputRef.current.focus()
        }
    }, [showQuickNav])

    useEffect(() => {
        if (!showQuickNav) {
            return
        }

        if (quickNavItems.length === 0) {
            setActiveQuickNavIndex(-1)
            return
        }

        if (query.trim()) {
            setActiveQuickNavIndex(0)
            return
        }

        setActiveQuickNavIndex(-1)
    }, [showQuickNav, query, quickNavItems])

    useEffect(() => {
        if (activeQuickNavIndex < 0) {
            return
        }

        const activeElement = quickNavItemRefs.current[activeQuickNavIndex]
        if (activeElement) {
            activeElement.scrollIntoView({ block: 'nearest' })
        }
    }, [activeQuickNavIndex])

    return (
        <>
            <header className="sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur-xl">
                <a
                    href="#app-main"
                    className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary"
                >
                    Skip to content
                </a>
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    <Link to="/internal/home" className="flex items-center gap-3 rounded-full px-2 py-1 text-[#1b2d4f] focus-visible:ring-2 focus-visible:ring-primary">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-sm">S</span>
                        <span className="text-2xl font-serif font-bold">SubSync</span>
                    </Link>

                    <nav className="flex items-center gap-2" aria-label="Primary navigation">
                        <button
                            type="button"
                            onClick={openQuickNav}
                            className="hidden items-center rounded-full border border-outline-variant bg-white px-4 py-2 text-sm font-semibold text-on-surface transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:inline-flex"
                        >
                            Go to
                            <span className="ml-2 rounded-md border border-outline-variant px-2 py-0.5 text-xs text-[#4b5563]">Ctrl/Cmd+K</span>
                        </button>

                        {activeRouteIndex >= 0 && (
                            <div className="hidden items-center gap-1 lg:flex">
                                <button
                                    type="button"
                                    onClick={() => navigate(routeOrder[(activeRouteIndex - 1 + routeOrder.length) % routeOrder.length])}
                                    className="inline-flex items-center rounded-full border border-outline-variant bg-white px-3 py-2 text-sm font-semibold text-on-surface transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    aria-label="Go to previous main section"
                                >
                                    ←
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate(routeOrder[(activeRouteIndex + 1) % routeOrder.length])}
                                    className="inline-flex items-center rounded-full border border-outline-variant bg-white px-3 py-2 text-sm font-semibold text-on-surface transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    aria-label="Go to next main section"
                                >
                                    →
                                </button>
                            </div>
                        )}

                        {navItems.map((item) => {
                            if (item.key === 'settings') {
                                return (
                                    <div key={item.key} className="relative" ref={menuRef}>
                                        <button
                                            type="button"
                                            onClick={() => setShowSettingsMenu((prev) => !prev)}
                                            aria-haspopup="menu"
                                            aria-expanded={showSettingsMenu}
                                            aria-controls="settings-menu"
                                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${(current === item.key || isPathActive(item.key))
                                                ? 'border-primary bg-primary text-white shadow-sm'
                                                : 'border-outline-variant bg-white text-on-surface hover:border-primary hover:text-primary'
                                                }`}
                                        >
                                            {item.label}
                                            <span className="text-xs" aria-hidden="true">▾</span>
                                        </button>

                                        {showSettingsMenu && (
                                            <div id="settings-menu" role="menu" aria-label="Settings" className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/70 bg-white p-2 shadow-[0_20px_40px_rgba(27,45,79,0.14)]">
                                                {settingsItems.map((settingsItem) => (
                                                    <Link
                                                        key={settingsItem.to}
                                                        to={settingsItem.to}
                                                        onClick={() => setShowSettingsMenu(false)}
                                                        role="menuitem"
                                                        className="block rounded-xl px-4 py-2 text-sm text-on-surface transition hover:bg-surface-container-low hover:text-primary"
                                                    >
                                                        {settingsItem.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )
                            }

                            return (
                                <Link
                                    key={item.key}
                                    to={item.to}
                                    aria-current={current === item.key || isPathActive(item.key) ? 'page' : undefined}
                                    className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${(current === item.key || isPathActive(item.key))
                                        ? 'border-primary bg-primary text-white shadow-sm'
                                        : 'border-outline-variant bg-white text-on-surface hover:border-primary hover:text-primary'
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            )
                        })}

                        {onLogout && (
                            <button
                                type="button"
                                onClick={onLogout}
                                className="inline-flex items-center rounded-full border border-outline-variant bg-white px-4 py-2 text-sm font-semibold text-on-surface transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                Logout
                            </button>
                        )}
                    </nav>
                </div>
            </header>

            {showQuickNav && (
                <div className="fixed inset-0 z-40 bg-[#0f1f3d]/35 p-4 backdrop-blur-[2px]" onClick={closeQuickNav}>
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Quick page navigation"
                        className="absolute left-1/2 top-1/2 w-[min(100%,42rem)] max-h-[calc(100vh-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-white/70 bg-white p-4 shadow-[0_20px_40px_rgba(27,45,79,0.25)] sm:p-5"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <label htmlFor="quick-nav-input" className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[#5a6270]">
                            Jump to page
                        </label>
                        <input
                            id="quick-nav-input"
                            ref={quickNavInputRef}
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            aria-controls="quick-nav-results"
                            aria-expanded={showQuickNav}
                            aria-activedescendant={activeQuickNavIndex >= 0 ? `quick-nav-option-${activeQuickNavIndex}` : undefined}
                            onKeyDown={(event) => {
                                if (event.key === 'ArrowDown' && quickNavItems.length > 0) {
                                    event.preventDefault()
                                    moveQuickNavFocus(1, activeQuickNavIndex)
                                    return
                                }

                                if (event.key === 'ArrowUp' && quickNavItems.length > 0) {
                                    event.preventDefault()
                                    moveQuickNavFocus(-1, activeQuickNavIndex)
                                    return
                                }

                                if (event.key === 'Enter' && quickNavItems.length > 0) {
                                    event.preventDefault()
                                    const targetIndex = activeQuickNavIndex >= 0 ? activeQuickNavIndex : 0
                                    handleQuickNavigate(quickNavItems[targetIndex].to)
                                }
                            }}
                            placeholder="Type a page name..."
                            className="w-full rounded-2xl border border-outline-variant bg-white px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                        />

                        <div id="quick-nav-results" role="listbox" className="mt-3 max-h-[min(18rem,40vh)] overflow-y-auto">
                            {quickNavItems.length === 0 && (
                                <p className="rounded-2xl border border-dashed border-outline-variant px-4 py-6 text-center text-sm text-[#697180]">
                                    No pages match that search.
                                </p>
                            )}

                            {quickNavItems.map((item, index) => (
                                <button
                                    key={item.to}
                                    type="button"
                                    id={`quick-nav-option-${index}`}
                                    role="option"
                                    aria-selected={activeQuickNavIndex === index}
                                    tabIndex={activeQuickNavIndex === index ? 0 : -1}
                                    ref={(element) => {
                                        quickNavItemRefs.current[index] = element
                                    }}
                                    onMouseEnter={() => setActiveQuickNavIndex(index)}
                                    onFocus={() => setActiveQuickNavIndex(index)}
                                    onKeyDown={(event) => {
                                        if (event.key === 'ArrowDown') {
                                            event.preventDefault()
                                            moveQuickNavFocus(1, index)
                                            return
                                        }

                                        if (event.key === 'ArrowUp') {
                                            event.preventDefault()
                                            moveQuickNavFocus(-1, index)
                                            return
                                        }

                                        if (event.key === 'Escape') {
                                            event.preventDefault()
                                            quickNavInputRef.current?.focus()
                                        }
                                    }}
                                    onClick={() => handleQuickNavigate(item.to)}
                                    className={`mt-1 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition ${activeQuickNavIndex === index
                                        ? 'bg-surface-container-low text-primary'
                                        : 'text-on-surface hover:bg-surface-container-low hover:text-primary'
                                        }`}
                                >
                                    <span className="font-medium">{item.label}</span>
                                    <span className="text-xs text-[#697180]">{item.to}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}