import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  variant?: 'default' | 'green' | 'yellow' | 'red' | 'blue' | 'purple';
}

export function StatCard({ label, value, variant = 'default' }: StatCardProps) {
  const variantColors = {
    default: 'text-slate-900 dark:text-white',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`text-2xl font-black ${variantColors[variant]}`}>
        {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
      </p>
    </div>
  );
}

interface StatsGridProps {
  children: React.ReactNode;
  className?: string;
}

export default function StatsGrid({ children, className = '' }: StatsGridProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 ${className}`}>
      {children}
    </div>
  );
}