import { useState, useMemo } from 'react';
import { 
  Check, Search, Grid3X3, Type, BarChart3, 
  TrendingUp, Table, Gauge, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AvailableWidget } from './useDashboardWidgets';

interface WidgetSelectorProps {
  availableWidgets: AvailableWidget[];
  selectedWidgets: string[];
  onToggle: (widgetKey: string) => void;
  loading?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  kpi: <Type size={18} />,
  chart_bar: <BarChart3 size={18} />,
  chart_line: <TrendingUp size={18} />,
  ranking: <Award size={18} />,
  table: <Table size={18} />,
  gauge: <Gauge size={18} />
};

const categoryColors: Record<string, string> = {
  'Fretes': 'bg-orange-100 text-orange-700',
  'Usuários': 'bg-blue-100 text-blue-700',
  'Financeiro': 'bg-green-100 text-green-700',
  'Cotações': 'bg-amber-100 text-amber-700',
  'Marketplace': 'bg-purple-100 text-purple-700',
  'Publicidade': 'bg-pink-100 text-pink-700',
  'Suporte': 'bg-red-100 text-red-700',
  'Grupos': 'bg-cyan-100 text-cyan-700',
  'Artigos': 'bg-indigo-100 text-indigo-700',
  'Planos': 'bg-violet-100 text-violet-700',
  'Rankings': 'bg-emerald-100 text-emerald-700'
};

export function WidgetSelector({
  availableWidgets,
  selectedWidgets,
  onToggle,
  loading = false
}: WidgetSelectorProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set(availableWidgets.map(w => w.category));
    return ['all', ...Array.from(cats)];
  }, [availableWidgets]);

  const filteredWidgets = useMemo(() => {
    return availableWidgets.filter(w => {
      const matchesSearch = !search || 
        w.label.toLowerCase().includes(search.toLowerCase()) ||
        w.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || w.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [availableWidgets, search, categoryFilter]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse bg-slate-100 rounded-xl h-20"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar widgets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
              categoryFilter === cat
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            )}
          >
            {cat === 'all' ? 'Todos' : cat}
          </button>
        ))}
      </div>

      {/* Widget List */}
      <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
        {filteredWidgets.map(widget => {
          const isSelected = selectedWidgets.includes(widget.widget_key);
          const colorClass = categoryColors[widget.category] || 'bg-slate-100 text-slate-600';
          
          return (
            <button
              key={widget.widget_key}
              onClick={() => onToggle(widget.widget_key)}
              className={cn(
                'p-3 rounded-xl border-2 transition-all text-left',
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-slate-200 hover:border-indigo-300'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={cn('p-1.5 rounded-lg', colorClass.split(' ')[0])}>
                  {iconMap[widget.widget_type] || <Grid3X3 size={16} />}
                </div>
                {isSelected && (
                  <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </div>
              <p className="text-sm font-bold text-slate-700 truncate">
                {widget.label}
              </p>
              <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                {widget.description}
              </p>
            </button>
          );
        })}
      </div>

      {filteredWidgets.length === 0 && (
        <p className="text-center text-slate-400 py-8">
          Nenhum widget encontrado
        </p>
      )}
    </div>
  );
}