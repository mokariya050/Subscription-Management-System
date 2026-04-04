export default function AuthLayout({
    brand = 'SubSync',
    title,
    description,
    highlights = [],
    children,
}) {
    return (
        <div className="min-h-screen text-[#1b2d4f]">
            <header className="sticky top-0 z-20 border-b border-white/60 bg-white/80 backdrop-blur-xl">
                <a
                    href="#auth-main"
                    className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary"
                >
                    Skip to content
                </a>
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 rounded-full px-2 py-1 text-[#1b2d4f]">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-sm">S</span>
                        <span className="text-2xl font-serif font-bold">{brand}</span>
                    </div>
                </div>
            </header>

            <main id="auth-main" className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <section className="rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-[0_18px_50px_rgba(27,45,79,0.08)] backdrop-blur-sm sm:p-7 lg:p-8">
                    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
                        <section className="rounded-[1.75rem] border border-outline-variant bg-surface-container-low p-6 sm:p-7">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">{brand}</p>
                            <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-primary sm:text-4xl">{title}</h1>
                            <p className="mt-4 text-sm leading-6 text-on-surface-variant sm:text-base">{description}</p>

                            {highlights.length > 0 ? (
                                <div className="mt-6 grid gap-3">
                                    {highlights.map((item) => (
                                        <div key={item.title} className="rounded-2xl border border-outline-variant bg-white p-4">
                                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{item.title}</p>
                                            <p className="mt-1 text-sm leading-6 text-on-surface-variant">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </section>

                        <div className="flex items-center justify-center">
                            <div className="w-full max-w-[560px]">{children}</div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    )
}