import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  value: number | string;
  label: string;
  prefix?: string;
  suffix?: string;
  growth?: number;
  icon?: React.ReactNode;
  iconBg?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  loading?: boolean;
}

const iconBgVariants = {
  default: 'bg-slate-100',
  success: 'bg-green-50',
  warning: 'bg-amber-50',
  danger: 'bg-red-50'
};

const iconColorVariants = {
  default: 'text-slate-500',
  success: 'text-green-500',
  warning: 'text-amber-500',
  danger: 'text-red-500'
};

const growthColorVariants = {
  positive: 'text-green-600',
  negative: 'text-red-600',
  neutral: 'text-slate-400'
};

export function KPICard({
  value,
  label,
  prefix = '',
  suffix = '',
  growth,
  icon,
  iconBg = 'bg-slate-100',
  variant = 'default',
  loading = false
}: KPICardProps) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    return new Intl.NumberFormat('pt-BR').format(val);
  };

  const getGrowthClass = () => {
    if (growth === undefined || growth === null) return '';
    if (growth > 0) return growthColorVariants.positive;
    if (growth < 0) return growthColorVariants.negative;
    return growthColorVariants.neutral;
  };

  const getGrowthIcon = () => {
    if (growth === undefined || growth === null) return null;
    if (growth > 0) return <TrendingUp size={14} />;
    if (growth < 0) return <TrendingDown size={14} />;
    return <Minus size={14} />;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
          <div className="w-12 h-4 bg-slate-200 rounded"></div>
        </div>
        <div className="w-16 h-3 bg-slate-200 rounded mb-2"></div>
        <div className="w-24 h-8 bg-slate-200 rounded"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        {icon && (
          <div className={cn('p-2 rounded-xl', iconBg)}>
            <span className={cn('block', iconColorVariants[variant])}>
              {icon}
            </span>
          </div>
        )}
        {growth !== undefined && growth !== null && (
          <span className={cn('flex items-center gap-1 text-xs font-bold', getGrowthClass())}>
            {getGrowthIcon()}
            {growth > 0 ? '+' : ''}{growth}%
          </span>
        )}
      </div>
      <p className="text-[10px] font-black uppercase text-slate-400 mb-1 truncate">
        {label}
      </p>
      <p className="text-2xl font-black text-slate-800 truncate">
        {prefix}{formatValue(value)}{suffix}
      </p>
    </div>
  );
}