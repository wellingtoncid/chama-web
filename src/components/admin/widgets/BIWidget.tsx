import { useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { 
  Truck, Users, Building2, DollarSign, FileText, 
  Headphones, Users as UsersIcon, ShoppingBag,
  TrendingUp, TrendingDown, Package, CheckCircle,
  Clock, AlertCircle, XCircle, Wallet, Shield,
  Megaphone, Eye, MousePointer, BarChart3, Activity
} from 'lucide-react';

interface BIWidgetProps {
  widgetKey: string;
  data: any;
  loading?: boolean;
}

const iconMap: Record<string, { icon: React.ReactNode; bg: string; color: string; darkBg: string; darkColor: string }> = {
  freights_total: { icon: <Truck size={20} />, bg: 'bg-orange-100', color: 'text-orange-600', darkBg: 'bg-orange-900/30', darkColor: 'text-orange-400' },
  freights_growth: { icon: <TrendingUp size={20} />, bg: 'bg-orange-100', color: 'text-orange-600', darkBg: 'bg-orange-900/30', darkColor: 'text-orange-400' },
  freights_open: { icon: <Package size={20} />, bg: 'bg-orange-100', color: 'text-orange-600', darkBg: 'bg-orange-900/30', darkColor: 'text-orange-400' },
  freights_in_progress: { icon: <Truck size={20} />, bg: 'bg-blue-100', color: 'text-blue-600', darkBg: 'bg-blue-900/30', darkColor: 'text-blue-400' },
  freights_completed: { icon: <CheckCircle size={20} />, bg: 'bg-green-100', color: 'text-green-600', darkBg: 'bg-green-900/30', darkColor: 'text-green-400' },
  users_total: { icon: <Users size={20} />, bg: 'bg-blue-100', color: 'text-blue-600', darkBg: 'bg-blue-900/30', darkColor: 'text-blue-400' },
  users_growth: { icon: <TrendingUp size={20} />, bg: 'bg-blue-100', color: 'text-blue-600', darkBg: 'bg-blue-900/30', darkColor: 'text-blue-400' },
  users_active: { icon: <Users size={20} />, bg: 'bg-green-100', color: 'text-green-600', darkBg: 'bg-green-900/30', darkColor: 'text-green-400' },
  users_inactive: { icon: <Users size={20} />, bg: 'bg-red-100', color: 'text-red-600', darkBg: 'bg-red-900/30', darkColor: 'text-red-400' },
  drivers_total: { icon: <Truck size={20} />, bg: 'bg-purple-100', color: 'text-purple-600', darkBg: 'bg-purple-900/30', darkColor: 'text-purple-400' },
  drivers_verified: { icon: <CheckCircle size={20} />, bg: 'bg-green-100', color: 'text-green-600', darkBg: 'bg-green-900/30', darkColor: 'text-green-400' },
  companies_total: { icon: <Building2 size={20} />, bg: 'bg-indigo-100', color: 'text-indigo-600', darkBg: 'bg-indigo-900/30', darkColor: 'text-indigo-400' },
  companies_verified: { icon: <CheckCircle size={20} />, bg: 'bg-green-100', color: 'text-green-600', darkBg: 'bg-green-900/30', darkColor: 'text-green-400' },
  wallet_revenue: { icon: <DollarSign size={20} />, bg: 'bg-green-100', color: 'text-green-600', darkBg: 'bg-green-900/30', darkColor: 'text-green-400' },
  wallet_revenue_growth: { icon: <TrendingUp size={20} />, bg: 'bg-green-100', color: 'text-green-600', darkBg: 'bg-green-900/30', darkColor: 'text-green-400' },
  wallet_all_time: { icon: <Wallet size={20} />, bg: 'bg-emerald-100', color: 'text-emerald-600', darkBg: 'bg-emerald-900/30', darkColor: 'text-emerald-400' },
  avg_ticket: { icon: <DollarSign size={20} />, bg: 'bg-green-100', color: 'text-green-600', darkBg: 'bg-green-900/30', darkColor: 'text-green-400' },
  plans_active: { icon: <Shield size={20} />, bg: 'bg-violet-100', color: 'text-violet-600', darkBg: 'bg-violet-900/30', darkColor: 'text-violet-400' },
  plans_revenue: { icon: <DollarSign size={20} />, bg: 'bg-violet-100', color: 'text-violet-600', darkBg: 'bg-violet-900/30', darkColor: 'text-violet-400' },
  ads_revenue: { icon: <Megaphone size={20} />, bg: 'bg-pink-100', color: 'text-pink-600', darkBg: 'bg-pink-900/30', darkColor: 'text-pink-400' },
  ads_impressions: { icon: <Eye size={20} />, bg: 'bg-pink-100', color: 'text-pink-600', darkBg: 'bg-pink-900/30', darkColor: 'text-pink-400' },
  ads_ctr: { icon: <MousePointer size={20} />, bg: 'bg-pink-100', color: 'text-pink-600', darkBg: 'bg-pink-900/30', darkColor: 'text-pink-400' },
  quotes_total: { icon: <FileText size={20} />, bg: 'bg-amber-100', color: 'text-amber-600', darkBg: 'bg-amber-900/30', darkColor: 'text-amber-400' },
  quotes_growth: { icon: <TrendingUp size={20} />, bg: 'bg-amber-100', color: 'text-amber-600', darkBg: 'bg-amber-900/30', darkColor: 'text-amber-400' },
  quotes_open: { icon: <Clock size={20} />, bg: 'bg-amber-100', color: 'text-amber-600', darkBg: 'bg-amber-900/30', darkColor: 'text-amber-400' },
  quotes_accepted: { icon: <CheckCircle size={20} />, bg: 'bg-green-100', color: 'text-green-600', darkBg: 'bg-green-900/30', darkColor: 'text-green-400' },
  quotes_rejected: { icon: <XCircle size={20} />, bg: 'bg-red-100', color: 'text-red-600', darkBg: 'bg-red-900/30', darkColor: 'text-red-400' },
  tickets_open: { icon: <AlertCircle size={20} />, bg: 'bg-red-100', color: 'text-red-600', darkBg: 'bg-red-900/30', darkColor: 'text-red-400' },
  tickets_closed: { icon: <CheckCircle size={20} />, bg: 'bg-green-100', color: 'text-green-600', darkBg: 'bg-green-900/30', darkColor: 'text-green-400' },
  tickets_new: { icon: <Headphones size={20} />, bg: 'bg-red-100', color: 'text-red-600', darkBg: 'bg-red-900/30', darkColor: 'text-red-400' },
  groups_total: { icon: <UsersIcon size={20} />, bg: 'bg-cyan-100', color: 'text-cyan-600', darkBg: 'bg-cyan-900/30', darkColor: 'text-cyan-400' },
  groups_members: { icon: <UsersIcon size={20} />, bg: 'bg-cyan-100', color: 'text-cyan-600', darkBg: 'bg-cyan-900/30', darkColor: 'text-cyan-400' },
  listings_active: { icon: <ShoppingBag size={20} />, bg: 'bg-purple-100', color: 'text-purple-600', darkBg: 'bg-purple-900/30', darkColor: 'text-purple-400' },
  listings_new: { icon: <ShoppingBag size={20} />, bg: 'bg-purple-100', color: 'text-purple-600', darkBg: 'bg-purple-900/30', darkColor: 'text-purple-400' },
};

export function BIWidget({ widgetKey, data, loading }: BIWidgetProps) {
  const { isDark } = useTheme();
  
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className={`h-10 w-10 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded-xl mb-3`}></div>
        <div className={`h-3 w-20 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded mb-1`}></div>
        <div className={`h-8 w-24 ${isDark ? 'bg-slate-700' : 'bg-slate-200'} rounded`}></div>
      </div>
    );
  }

  const iconConfig = iconMap[widgetKey] || { icon: <Activity size={20} />, bg: 'bg-slate-100', color: 'text-slate-600', darkBg: 'bg-slate-800', darkColor: 'text-slate-400' };
  const { icon, bg, color, darkBg, darkColor } = iconConfig;
  const iconBg = isDark ? darkBg : bg;
  const iconColor = isDark ? darkColor : color;

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '0';
    if (typeof value === 'object') return JSON.stringify(value);
    const num = Number(value);
    if (isNaN(num)) return String(value);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    if (num % 1 !== 0) return num.toFixed(2);
    return num.toLocaleString('pt-BR');
  };

  const formatCurrency = (value: any): string => {
    if (value === null || value === undefined) return 'R$ 0';
    if (typeof value === 'object') return 'R$ 0';
    const num = Number(value);
    if (isNaN(num)) return 'R$ 0';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(num);
  };

  const getValue = (): { value: string; growth?: number } => {
    const freightsData = data?.freights;
    const usersData = data?.users;
    const driversData = data?.drivers;
    const companiesData = data?.companies;
    const financeData = data?.finance;
    const quotesData = data?.quotes;
    const ticketsData = data?.tickets;
    const marketplaceData = data?.marketplace;
    const groupsData = data?.groups;
    const plansData = data?.plans;

    switch (widgetKey) {
      case 'freights_total': return { value: formatValue(freightsData?.current ?? freightsData?.all_time ?? 0), growth: freightsData?.growth };
      case 'users_total': return { value: formatValue(usersData?.all_time ?? 0), growth: usersData?.growth };
      case 'drivers_total': return { value: formatValue(driversData?.total ?? 0) };
      case 'companies_total': return { value: formatValue(companiesData?.total ?? 0) };
      case 'quotes_total': return { value: formatValue(quotesData?.all_time ?? 0) };
      case 'groups_total': return { value: formatValue(groupsData?.total ?? 0) };
      case 'groups_members': return { value: formatValue(groupsData?.members ?? 0) };
      case 'listings_active': return { value: formatValue(marketplaceData?.active ?? 0) };
      case 'tickets_open': return { value: formatValue(ticketsData?.open ?? 0) };
      case 'tickets_closed': return { value: formatValue(ticketsData?.closed ?? 0) };
      case 'plans_active': return { value: formatValue(plansData?.current ?? 0) };
      case 'freights_growth': return { value: formatValue(freightsData?.growth ?? 0), growth: freightsData?.growth };
      case 'wallet_revenue': 
      case 'wallet_all_time':
      case 'plans_revenue':
      case 'ads_revenue': return { value: formatCurrency(financeData?.all_time ?? financeData?.revenue ?? 0) };
      case 'avg_ticket': return { value: formatCurrency(financeData?.avg_ticket ?? 0) };
      case 'users_active': return { value: formatValue(usersData?.active ?? 0) };
      case 'users_inactive': return { value: formatValue(usersData?.inactive ?? 0) };
      case 'drivers_verified': return { value: formatValue(driversData?.verified ?? 0) };
      case 'companies_verified': return { value: formatValue(companiesData?.verified ?? 0) };
      default: return { value: formatValue(0) };
    }
  };

  const getLabel = (): string => {
    const labels: Record<string, string> = {
      freights_total: 'Total de Fretes', freights_growth: 'Crescimento', users_total: 'Usuários', drivers_total: 'Motoristas',
      companies_total: 'Empresas', quotes_total: 'Cotações', groups_total: 'Grupos', groups_members: 'Membros',
      listings_active: 'Anúncios', tickets_open: 'Tickets Abertos', tickets_closed: 'Fechados', plans_active: 'Planos Ativos',
      wallet_revenue: 'Receita', wallet_all_time: 'Receita Total', avg_ticket: 'Ticket Médio', plans_revenue: 'Receita Planos',
      ads_revenue: 'Receita Ads', users_active: 'Ativos', users_inactive: 'Inativos', drivers_verified: 'Verificados',
      companies_verified: 'Verificadas',
    };
    return labels[widgetKey] || widgetKey.replace(/_/g, ' ');
  };

  const info = getValue();
  const isPositive = (info.growth ?? 0) >= 0;
  const isCurrency = info.value.startsWith('R$');

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        {info.growth !== undefined && info.growth !== 0 && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
            isPositive ? (isDark ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
              : (isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700')
          }`}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{info.growth > 0 ? '+' : ''}{info.growth}%</span>
          </div>
        )}
      </div>
      
      <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'} mb-1 uppercase tracking-wide truncate`}>
        {getLabel()}
      </p>
      
      <p className={`text-2xl font-extrabold truncate ${
        isCurrency ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-white' : 'text-slate-900')
      }`}>
        {info.value}
      </p>
    </div>
  );
}