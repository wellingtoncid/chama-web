import type { ReactNode } from 'react';

interface DashboardShellProps {
  title: string | ReactNode;
  description?: string | ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function DashboardShell({ title, description, actions, children, className }: DashboardShellProps) {
  return (
    <div className={`space-y-5 lg:space-y-6 animate-in fade-in duration-500 pb-24 ${className ?? ''}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
