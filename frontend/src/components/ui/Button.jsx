function cn(...parts) {
    return parts.filter(Boolean).join(' ')
}

const variantClasses = {
    primary: 'bg-primary text-on-primary shadow-sm hover:bg-primary-container',
    secondary: 'border border-outline-variant bg-white text-on-surface hover:border-primary hover:text-primary',
    subtle: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest',
    danger: 'bg-error text-on-error shadow-sm hover:opacity-95',
}

const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
}

export default function Button({
    className = '',
    variant = 'primary',
    size = 'md',
    block = false,
    type = 'button',
    disabled = false,
    children,
    ...props
}) {
    return (
        <button
            type={type}
            disabled={disabled}
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60',
                variantClasses[variant] || variantClasses.primary,
                sizeClasses[size] || sizeClasses.md,
                block ? 'w-full' : '',
                className,
            )}
            {...props}
        >
            {children}
        </button>
    )
}