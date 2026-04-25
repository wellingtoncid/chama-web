import React from 'react';
import { Loader2 } from 'lucide-react';

interface TableColumnProps<T = unknown> {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
}

interface TableActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: (row: unknown) => void;
  variant?: 'default' | 'danger' | 'warning';
  disabled?: boolean;
}

interface DataTableProps<T = unknown> {
  columns: TableColumnProps<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  actions?: TableActionProps[];
  onRowClick?: (row: T) => void;
  className?: string;
}

export default function DataTable<T = unknown>({ 
  columns, 
  data, 
  loading = false, 
  emptyMessage = 'Nenhum registro encontrado',
  actions,
  onRowClick,
  className = '' 
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase"
                >
                  {col.label}
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr 
                  key={index} 
                  className={onRowClick ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => {
                    const cellValue = (row as Record<string, unknown>)[col.key];
                    return (
                      <td key={col.key} className={`px-4 py-3 ${col.className || ''}`}>
                        {col.render 
                          ? col.render(cellValue, row, index)
                          : (cellValue as React.ReactNode)}
                      </td>
                    );
                  })}
                  {actions && actions.length > 0 && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {actions.map((action, i) => (
                          <button
                            key={i}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            disabled={action.disabled}
                            className={`p-2 transition-colors disabled:opacity-50 ${
                              action.variant === 'danger' 
                                ? 'text-red-600 hover:text-red-700' 
                                : action.variant === 'warning'
                                ? 'text-yellow-600 hover:text-yellow-700'
                                : 'text-slate-500 hover:text-blue-600'
                            }`}
                            title={action.label}
                          >
                            {action.icon}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export type { TableColumnProps as TableColumn, TableActionProps as TableAction };