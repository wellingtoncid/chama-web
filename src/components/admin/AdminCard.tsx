import React from 'react';

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function AdminCard({ children, className = '', noPadding = false }: AdminCardProps) {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden ${className}`}>
      {noPadding ? children : <div className="p-6">{children}</div>}
    </div>
  );
}

interface AdminCardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function AdminCardHeader({ title, subtitle, action, className = '' }: AdminCardHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}