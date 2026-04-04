function cn(...parts) {
    return parts.filter(Boolean).join(' ')
}

const variantClasses = {
    neutral: 'bg-surface-container-high text-on-surface',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-900',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-secondary-container text-on-secondary-container',
}

export default function Badge({ variant = 'neutral', className = '', children, ...props }) {
    return (
        <span
            className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]', variantClasses[variant] || variantClasses.neutral, className)}
            {...props}
        >
            {children}
        </span>
    )
}