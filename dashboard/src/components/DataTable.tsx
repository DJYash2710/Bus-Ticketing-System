import type { ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string | number
  loading?: boolean
  emptyMessage?: string
  footer?: ReactNode
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading,
  emptyMessage = 'No records found',
  footer,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="card p-8 text-center text-sm text-slate-500">Loading...</div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="card p-8 text-center text-sm text-slate-500">{emptyMessage}</div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 ${col.className ?? ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={keyExtractor(row)} className="transition hover:bg-slate-50/60">
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3.5 text-slate-700 ${col.className ?? ''}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer && (
        <div className="border-t border-slate-200 bg-slate-50/50 px-4 py-3">{footer}</div>
      )}
    </div>
  )
}
