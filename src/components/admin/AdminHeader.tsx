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
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="w-12 h-12 bg-[#1f4ead]/10 rounded-xl flex items-center justify-center">
            <Icon className="text-[#1f4ead]" size={24} />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}