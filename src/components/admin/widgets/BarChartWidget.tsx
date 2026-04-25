import { useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

interface ChartData {
  label: string;
  value: number;
}

interface BarChartWidgetProps {
  data: ChartData[];
  color?: string;
  loading?: boolean;
  emptyMessage?: string;
}

export function BarChartWidget({
  data,
  color = 'bg-indigo-500',
  loading = false,
  emptyMessage = 'Sem dados para exibir'
}: BarChartWidgetProps) {
  const { isDark } = useTheme();
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);

  if (loading) {
    return (
      <div className="h-40 flex items-center justify-center">
        <div className="w-full h-full flex items-end gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex-1 animate-pulse">
              <div 
                className={`rounded-t ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                style={{ height: `${Math.random() * 60 + 20}%` }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`h-40 flex items-center justify-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="h-40 flex items-end gap-1">
      {data.map((item, idx) => {
        const height = (item.value / maxValue) * 100;
        return (
          <div 
            key={idx} 
            className={cn('flex-1 rounded-t transition-all hover:opacity-80 relative group', color)}
            style={{ height: `${Math.max(height, 2)}%` }}
          >
            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 ${isDark ? 'bg-slate-700 text-slate-200' : 'bg-slate-800 text-white'} text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10`}>
              {item.label}: {item.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}