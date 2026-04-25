import { 
  Truck, Users, FileText, DollarSign, ShoppingBag, Headphones, 
  CreditCard, Megaphone, Building2, Clock, CheckCircle, BarChart3, 
  Award, TrendingUp, MapPin, Tag, UserPlus, PenTool, Shield, Calendar
} from 'lucide-react';
import { KPICard } from './KPICard';
import { BarChartWidget } from './BarChartWidget';
import { RankingWidget } from './RankingWidget';

const iconMap: Record<string, { icon: React.ReactNode; bg: string }> = {
  freights_total: { icon: <Truck size={18} />, bg: 'bg-orange-100 text-orange-600' },
  freights_growth: { icon: <TrendingUp size={18} />, bg: 'bg-orange-100 text-orange-600' },
  freights_chart: { icon: <BarChart3 size={18} />, bg: 'bg-orange-100 text-orange-600' },
  my_freights: { icon: <Truck size={18} />, bg: 'bg-orange-100 text-orange-600' },
  my_freights_growth: { icon: <TrendingUp size={18} />, bg: 'bg-orange-100 text-orange-600' },
  users_total: { icon: <Users size={18} />, bg: 'bg-blue-100 text-blue-600' },
  users_growth: { icon: <TrendingUp size={18} />, bg: 'bg-blue-100 text-blue-600' },
  companies_total: { icon: <Building2 size={18} />, bg: 'bg-purple-100 text-purple-600' },
  revenue_total: { icon: <DollarSign size={18} />, bg: 'bg-green-100 text-green-600' },
  revenue_new_vs_recurring: { icon: <TrendingUp size={18} />, bg: 'bg-green-100 text-green-600' },
  avg_ticket: { icon: <CreditCard size={18} />, bg: 'bg-green-100 text-green-600' },
  my_revenue: { icon: <DollarSign size={18} />, bg: 'bg-green-100 text-green-600' },
  quotes_total: { icon: <FileText size={18} />, bg: 'bg-amber-100 text-amber-600' },
  quotes_open: { icon: <Clock size={18} />, bg: 'bg-amber-100 text-amber-600' },
  quotes_closed: { icon: <CheckCircle size={18} />, bg: 'bg-amber-100 text-amber-600' },
  my_quotes_pending: { icon: <Clock size={18} />, bg: 'bg-amber-100 text-amber-600' },
  listings_total: { icon: <ShoppingBag size={18} />, bg: 'bg-purple-100 text-purple-600' },
  listings_active: { icon: <CheckCircle size={18} />, bg: 'bg-purple-100 text-purple-600' },
  my_listings: { icon: <ShoppingBag size={18} />, bg: 'bg-purple-100 text-purple-600' },
  ads_revenue: { icon: <Megaphone size={18} />, bg: 'bg-pink-100 text-pink-600' },
  ads_impressions: { icon: <Users size={18} />, bg: 'bg-pink-100 text-pink-600' },
  ads_clicks: { icon: <Users size={18} />, bg: 'bg-pink-100 text-pink-600' },
  ads_ctr: { icon: <TrendingUp size={18} />, bg: 'bg-pink-100 text-pink-600' },
  tickets_open: { icon: <Headphones size={18} />, bg: 'bg-red-100 text-red-600' },
  tickets_closed: { icon: <CheckCircle size={18} />, bg: 'bg-red-100 text-red-600' },
  tickets_response_time: { icon: <Clock size={18} />, bg: 'bg-red-100 text-red-600' },
  groups_total: { icon: <Users size={18} />, bg: 'bg-cyan-100 text-cyan-600' },
  groups_members: { icon: <UserPlus size={18} />, bg: 'bg-cyan-100 text-cyan-600' },
  articles_total: { icon: <FileText size={18} />, bg: 'bg-indigo-100 text-indigo-600' },
  articles_views: { icon: <Users size={18} />, bg: 'bg-indigo-100 text-indigo-600' },
  authors_active: { icon: <PenTool size={18} />, bg: 'bg-indigo-100 text-indigo-600' },
  plans_active: { icon: <Shield size={18} />, bg: 'bg-violet-100 text-violet-600' },
  plans_revenue: { icon: <CreditCard size={18} />, bg: 'bg-violet-100 text-violet-600' },
  top_cities: { icon: <MapPin size={18} />, bg: 'bg-emerald-100 text-emerald-600' },
  top_categories: { icon: <Tag size={18} />, bg: 'bg-emerald-100 text-emerald-600' },
  top_drivers: { icon: <Award size={18} />, bg: 'bg-emerald-100 text-emerald-600' },
};

interface WidgetRendererProps {
  widgetKey: string;
  data: any;
  loading?: boolean;
}

export function WidgetRenderer({ widgetKey, data, loading = false }: WidgetRendererProps) {
  const iconConfig = iconMap[widgetKey] || { icon: <BarChart3 size={18} />, bg: 'bg-slate-100 text-slate-600' };

  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toString();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return <KPICard value="..." label="Carregando..." loading />;
  }

  if (!data) {
    return <KPICard value="0" label={widgetKey} icon={iconConfig.icon} iconBg={iconConfig.bg} />;
  }

  switch (widgetKey) {
    case 'revenue_total':
    case 'my_revenue':
    case 'plans_revenue':
    case 'ads_revenue':
      return (
        <KPICard
          value={formatCurrency(data.current || 0)}
          label={data.label || widgetKey}
          growth={data.growth}
          icon={iconConfig.icon}
          iconBg={iconConfig.bg}
          variant="success"
        />
      );

    case 'freights_chart':
    case 'users_chart':
    case 'revenue_chart':
    case 'ads_chart':
    case 'tickets_chart':
    case 'my_freights_chart':
      return (
        <BarChartWidget
          data={(data.chart || []).map((item: any) => ({
            label: item.label || item.date,
            value: item.value || item.total
          }))}
          color={iconConfig.bg.split(' ')[0].replace('bg-', 'bg-')}
        />
      );

    case 'top_cities':
    case 'top_categories':
    case 'top_drivers':
      return (
        <RankingWidget
          data={(data.ranking || []).map((item: any, idx: number) => ({
            rank: idx + 1,
            label: item.label || item.name || item.city,
            value: item.value || item.total,
            subtitle: item.subtitle
          }))}
          maxItems={5}
        />
      );

    default:
      return (
        <KPICard
          value={formatValue(data.current || data.total || 0)}
          label={data.label || widgetKey}
          growth={data.growth}
          icon={iconConfig.icon}
          iconBg={iconConfig.bg}
        />
      );
  }
}