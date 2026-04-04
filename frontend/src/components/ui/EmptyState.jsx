import Button from './Button'

export default function EmptyState({ title, description, actionLabel, onAction, className = '' }) {
    return (
        <section
            role="status"
            aria-live="polite"
            className={`rounded-[1.75rem] border border-dashed border-outline-variant bg-white/70 px-6 py-12 text-center ${className}`}
        >
            <h3 className="text-xl font-serif font-bold text-primary">{title}</h3>
            {description && <p className="mt-2 text-sm leading-6 text-on-surface-variant">{description}</p>}
            {actionLabel && onAction && (
                <div className="mt-6">
                    <Button variant="secondary" onClick={onAction}>
                        {actionLabel}
                    </Button>
                </div>
            )}
        </section>
    )
}