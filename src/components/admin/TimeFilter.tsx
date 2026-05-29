import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

export type TimeFilterValue = 'today' | '7days' | '30days' | 'thisMonth' | 'custom' | 'all';

interface TimeFilterProps {
  value: TimeFilterValue;
  onChange: (value: TimeFilterValue, customRange?: { start: string; end: string }) => void;
  className?: string;
  maxDays?: number;
}

const TIME_OPTIONS = [
  { key: 'today' as const, label: 'Hoje' },
  { key: '7days' as const, label: 'Últimos 7 dias' },
  { key: '30days' as const, label: 'Últimos 30 dias' },
  { key: 'thisMonth' as const, label: 'Este mês' },
  { key: 'custom' as const, label: 'Personalizado' },
  { key: 'all' as const, label: 'Tudo' },
];

export default function TimeFilter({ value, onChange, className = '', maxDays = 365 }: TimeFilterProps) {
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    if (value === 'custom' && customStart && customEnd) {
      const startMs = new Date(customStart).getTime();
      const endMs = new Date(customEnd).getTime();
      const diffDays = (endMs - startMs) / 86400000;
      if (diffDays > maxDays) {
        const limited = new Date(startMs + maxDays * 86400000);
        setCustomEnd(limited.toISOString().split('T')[0]);
        return;
      }
      onChange('custom', { start: customStart, end: customEnd });
    }
      
  }, [customStart, customEnd, value, onChange, maxDays]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Calendar size={16} className="text-slate-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TimeFilterValue)}
        className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
      >
        {TIME_OPTIONS.map(option => (
          <option key={option.key} value={option.key}>
            {option.label}
          </option>
        ))}
      </select>

      {value === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-slate-400 text-xs">até</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            min={customStart || undefined}
            max={
              customStart
                ? new Date(new Date(customStart).getTime() + maxDays * 86400000).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0]
            }
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
}
