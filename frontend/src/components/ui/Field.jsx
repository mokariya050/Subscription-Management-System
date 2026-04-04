import { cloneElement, isValidElement, useId } from 'react'

function cn(...parts) {
    return parts.filter(Boolean).join(' ')
}

export default function Field({
    id,
    label,
    hint,
    error,
    required,
    className = '',
    labelClassName = '',
    children,
}) {
    const generatedId = useId()
    const fieldId = id || generatedId
    const hintId = hint ? `${fieldId}-hint` : undefined
    const errorId = error ? `${fieldId}-error` : undefined
    const control = isValidElement(children)
        ? cloneElement(children, {
            id: children.props.id || fieldId,
            hintId,
            errorId,
            invalid: Boolean(error) || children.props.invalid,
        })
        : children

    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <label
                    htmlFor={fieldId}
                    className={cn('block text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant', labelClassName)}
                >
                    {label}
                    {required ? <span className="ml-1 text-error" aria-hidden="true">*</span> : null}
                </label>
            )}
            {control}
            {(hint || error) && (
                <p id={error ? errorId : hintId} className={cn('text-sm', error ? 'text-error' : 'text-on-surface-variant')}>
                    {error || hint}
                </p>
            )}
        </div>
    )
}