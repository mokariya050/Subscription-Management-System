import AppNavbar from './AppNavbar'

export default function AppPage({
    current,
    onLogout,
    title,
    subtitle,
    actions,
    maxWidth = 'max-w-6xl',
    children,
}) {
    return (
        <div className="min-h-screen bg-[#f5f3ef] text-[#1b2d4f]">
            <AppNavbar current={current} onLogout={onLogout} />

            <main className={`${maxWidth} mx-auto px-6 py-10`}>
                {(title || subtitle || actions) && (
                    <div className="mb-8 flex items-center justify-between gap-4">
                        <div>
                            {title && <h2 className="text-3xl font-serif font-bold">{title}</h2>}
                            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
                        </div>
                        {actions && <div className="shrink-0">{actions}</div>}
                    </div>
                )}

                {children}
            </main>
        </div>
    )
}