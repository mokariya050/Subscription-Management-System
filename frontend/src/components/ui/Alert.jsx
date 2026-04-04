function cn(...parts) {
    return parts.filter(Boolean).join(' ')
}

const variantClasses = {
    error: 'border-error/20 bg-error-container text-on-error-container',
    info: 'border-secondary/20 bg-secondary-container text-on-secondary-container',
    success: 'border-green-200 bg-green-50 text-green-900',
}

export default function Alert({ variant = 'info', className = '', children, ...props }) {
    return (
        <div
            role="alert"
            className={cn('rounded-2xl border px-4 py-3 text-sm leading-6', variantClasses[variant] || variantClasses.info, className)}
            {...props}
        >
            {children}
        </div>
    )
}