import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  variant?: 'default' | 'green' | 'yellow' | 'red' | 'blue' | 'purple';
  icon?: LucideIcon | React.ReactNode;
  prefix?: string;
}

export function StatCard({ label, value, variant = 'default', icon, prefix }: StatCardProps) {
  const variantColors = {
    default: 'text-slate-900 dark:text-white',
    green: 'text-emerald-600 dark:text-emerald-400',
    yellow: 'text-amber-600 dark:text-amber-400',
    red: 'text-red-600 dark:text-red-400',
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };

  const bgColors = {
    default: 'bg-blue-100 dark:bg-blue-900/30',
    green: 'bg-emerald-100 dark:bg-emerald-900/30',
    yellow: 'bg-amber-100 dark:bg-amber-900/30',
    red: 'bg-red-100 dark:bg-red-900/30',
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`${bgColors[variant]} p-2 rounded-xl`}>
            {React.isValidElement(icon) ? icon : React.createElement(icon as LucideIcon, { size: 20, className: variantColors[variant] })}
          </div>
        )}
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">{label}</p>
          <p className={`text-xl lg:text-2xl font-black ${variantColors[variant]}`}>
            {prefix}{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
          </p>
        </div>
      </div>
    </div>
  );
}

interface StatsGridProps {
  children: React.ReactNode;
  className?: string;
}

export default function StatsGrid({ children, className = '' }: StatsGridProps) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {children}
    </div>
  );
}