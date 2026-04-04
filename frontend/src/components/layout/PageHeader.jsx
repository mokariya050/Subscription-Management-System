export default function PageHeader({ title, subtitle, actions, eyebrow, className = '' }) {
    return (
        <header className={`flex flex-col gap-4 border-b border-white/70 pb-6 md:flex-row md:items-end md:justify-between ${className}`}>
            <div className="max-w-2xl">
                {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant">{eyebrow}</p> : null}
                <h1 className="mt-2 font-serif text-3xl font-bold text-primary sm:text-4xl">{title}</h1>
                {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant sm:text-base">{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
        </header>
    )
}