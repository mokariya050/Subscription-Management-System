import { forwardRef } from 'react'

function cn(...parts) {
    return parts.filter(Boolean).join(' ')
}

const Select = forwardRef(function Select({ className = '', invalid = false, id, hintId, errorId, children, ...props }, ref) {
    return (
        <select
            ref={ref}
            id={id}
            aria-invalid={invalid || undefined}
            aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
            className={cn(
                'block w-full rounded-2xl border border-outline-variant bg-white px-4 py-3 text-on-surface shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-surface-container-highest disabled:text-on-surface-variant',
                className,
            )}
            {...props}
        >
            {children}
        </select>
    )
})

export default Select