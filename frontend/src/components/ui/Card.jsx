function cn(...parts) {
    return parts.filter(Boolean).join(' ')
}

export default function Card({ className = '', as: Component = 'section', children, ...props }) {
    return (
        <Component
            className={cn(
                'rounded-[1.75rem] border border-white/70 bg-white/85 shadow-[0_18px_50px_rgba(27,45,79,0.08)] backdrop-blur-sm',
                className,
            )}
            {...props}
        >
            {children}
        </Component>
    )
}