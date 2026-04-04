function cn(...parts) {
    return parts.filter(Boolean).join(' ')
}

export default function DataTable({
    caption,
    columns,
    rows,
    getRowKey,
    onRowClick,
    emptyMessage = 'No records found.',
    className = '',
}) {
    if (!rows.length) {
        return (
            <div className="rounded-[1.75rem] border border-dashed border-outline-variant bg-white/80 px-6 py-14 text-center text-sm text-on-surface-variant">
                {emptyMessage}
            </div>
        )
    }

    return (
        <div className={cn('overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/90 shadow-[0_18px_50px_rgba(27,45,79,0.08)]', className)}>
            <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                    {caption ? <caption className="sr-only">{caption}</caption> : null}
                    <thead className="bg-surface-container-low">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    scope="col"
                                    className={cn(
                                        'px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant',
                                        column.headerClassName,
                                    )}
                                >
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr
                                key={getRowKey ? getRowKey(row, index) : index}
                                className={cn(
                                    'border-t border-surface-container-high transition hover:bg-surface-container-low',
                                    onRowClick ? 'cursor-pointer' : '',
                                )}
                                onClick={onRowClick ? () => onRowClick(row) : undefined}
                                tabIndex={onRowClick ? 0 : undefined}
                                onKeyDown={
                                    onRowClick
                                        ? (event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault()
                                                onRowClick(row)
                                            }
                                        }
                                        : undefined
                                }
                            >
                                {columns.map((column) => (
                                    <td key={column.key} className={cn('px-4 py-4 text-sm text-on-surface', column.cellClassName)}>
                                        {column.render ? column.render(row, index) : row[column.key] ?? '—'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}