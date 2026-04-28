import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

export default function AdminHeader({ title, description, icon: Icon, actions }: AdminHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {description}
          </p>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}