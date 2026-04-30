import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';

export type TimeFilterValue = 'today' | '7days' | '30days' | 'thisMonth' | 'custom' | 'all';

interface TimeFilterProps {
  value: TimeFilterValue;
  onChange: (value: TimeFilterValue, customRange?: { start: string; end: string }) => void;
  className?: string;
}

const TIME_OPTIONS = [
  { key: 'today' as const, label: 'Hoje' },
  { key: '7days' as const, label: 'Últimos 7 dias' },
  { key: '30days' as const, label: 'Últimos 30 dias' },
  { key: 'thisMonth' as const, label: 'Este mês' },
  { key: 'custom' as const, label: 'Personalizado' },
  { key: 'all' as const, label: 'Tudo' },
];

export default function TimeFilter({ value, onChange, className = '' }: TimeFilterProps) {
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    if (value === 'custom' && customStart && customEnd) {
      onChange('custom', { start: customStart, end: customEnd });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customStart, customEnd, value, onChange]);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Calendar size={16} className="text-slate-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TimeFilterValue)}
        className="bg-white dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 outline-none"
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
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none"
          />
          <span className="text-slate-400 text-xs">até</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none"
          />
        </div>
      )}
    </div>
  );
}
