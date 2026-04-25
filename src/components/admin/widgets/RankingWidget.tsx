import { cn } from '@/lib/utils';

interface RankingItem {
  rank: number;
  label: string;
  value: number;
  subtitle?: string;
}

interface RankingWidgetProps {
  data: RankingItem[];
  maxItems?: number;
  showValue?: boolean;
  showBar?: boolean;
  loading?: boolean;
  emptyMessage?: string;
}

export function RankingWidget({
  data,
  maxItems = 5,
  showValue = true,
  showBar = true,
  loading = false,
  emptyMessage = 'Sem dados para exibir'
}: RankingWidgetProps) {
  const displayData = data.slice(0, maxItems);
  const maxValue = displayData[0]?.value || 1;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-6 h-4 bg-slate-200 rounded"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded mb-2 w-3/4"></div>
              <div className="h-2 bg-slate-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (displayData.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayData.map((item) => {
        const width = showBar ? (item.value / maxValue) * 100 : 0;
        const isTop3 = item.rank <= 3;
        
        return (
          <div key={item.rank} className="flex items-center gap-3">
            <span className={cn(
              'w-6 text-xs font-bold',
              isTop3 ? 'text-indigo-600' : 'text-slate-400'
            )}>
              #{item.rank}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  'text-sm font-bold text-slate-700 truncate',
                  isTop3 && 'text-indigo-700'
                )}>
                  {item.label}
                </span>
                {showValue && (
                  <span className="text-xs font-bold text-slate-500 ml-2">
                    {item.value}
                  </span>
                )}
              </div>
              {showBar && (
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      'h-full rounded-full transition-all',
                      isTop3 ? 'bg-indigo-500' : 'bg-slate-300'
                    )}
                    style={{ width: `${width}%` }}
                  />
                </div>
              )}
              {item.subtitle && (
                <span className="text-xs text-slate-400">{item.subtitle}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}