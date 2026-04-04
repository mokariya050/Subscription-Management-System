export default function AuthLayout({
    brand = 'SubSync',
    title,
    description,
    highlights = [],
    children,
}) {
    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(77,94,131,0.12),_transparent_32%),linear-gradient(180deg,#fbf9f5_0%,#f5f3ef_100%)] text-on-surface">
            <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
                <section className="relative hidden overflow-hidden border-r border-white/50 bg-primary px-10 py-12 text-on-primary lg:flex lg:flex-col lg:justify-between">
                    <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.22) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                    <div className="relative z-10 max-w-xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary-fixed-dim">{brand}</p>
                        <h1 className="mt-6 max-w-lg font-serif text-5xl font-bold leading-tight text-white">{title}</h1>
                        <p className="mt-6 max-w-lg text-base leading-7 text-primary-fixed-dim">{description}</p>
                    </div>

                    {highlights.length > 0 ? (
                        <div className="relative z-10 grid gap-4">
                            {highlights.map((item) => (
                                <div key={item.title} className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-fixed-dim">{item.title}</p>
                                    <p className="mt-1 text-sm leading-6 text-white/90">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </section>

                <main className="flex items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
                    <div className="w-full max-w-[560px]">{children}</div>
                </main>
            </div>
        </div>
    )
}