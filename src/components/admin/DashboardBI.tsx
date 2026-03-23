import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  BarChart3, TrendingUp, TrendingDown, RefreshCw, 
  Truck, Users, FileText, DollarSign, Calendar,
  ShoppingBag, Headphones, CreditCard, Megaphone
} from 'lucide-react';

interface BIStats {
  freights: { current: number; previous: number; growth: number };
  users: { current: number; previous: number; growth: number };
  companies: { current: number; previous: number; growth: number };
  listings: { current: number; previous: number; growth: number };
  quotes: { total: number; open: number; closed: number; previous: number; growth: number };
  revenue: { current: number; previous: number; growth: number };
  tickets: { total: number; open: number; closed: number; previous: number; growth: number };
  plans: { current: number; previous: number; growth: number };
  ads: { current: number; previous: number; growth: number };
}

interface ChartData {
  date: string;
  total: number;
}

interface TopCity {
  origin_city: string;
  total: number;
}

const periodOptions = [
  { value: 'this_month', label: 'Este Mês' },
  { value: 'last_month', label: 'Mês Passado' },
  { value: 'last_3_months', label: 'Últimos 3 Meses' },
];

export default function DashboardBI({ user }: { user: any }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('this_month');
  const [stats, setStats] = useState<BIStats | null>(null);
  const [freightsChart, setFreightsChart] = useState<ChartData[]>([]);
  const [usersChart, setUsersChart] = useState<ChartData[]>([]);
  const [topCities, setTopCities] = useState<TopCity[]>([]);
  const [periodDates, setPeriodDates] = useState({ start: '', end: '' });

  const loadData = async (selectedPeriod?: string) => {
    try {
      setLoading(true);
      const res = await api.get('/admin/bi-stats', { 
        params: { period: selectedPeriod || period } 
      });
      console.log('BI Response:', res.data);
      if (res.data?.success) {
        setStats(res.data.data);
        setFreightsChart(res.data.charts?.freights_by_day || []);
        setUsersChart(res.data.charts?.users_by_day || []);
        setTopCities(res.data.top_cities || []);
        setPeriodDates(res.data.period || { start: '', end: '' });
      }
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    loadData(newPeriod);
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getMaxValue = (data: ChartData[]) => {
    return Math.max(...data.map(d => d.total), 1);
  };

  // Simple bar chart component
  const BarChart = ({ data, color = 'bg-blue-500' }: { data: ChartData[], color?: string }) => {
    const maxValue = getMaxValue(data);
    
    if (data.length === 0) {
      return (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          Sem dados para o período
        </div>
      );
    }

    return (
      <div className="h-48 flex items-end gap-1">
        {data.map((item, idx) => {
          const height = (item.total / maxValue) * 100;
          return (
            <div 
              key={idx} 
              className={`flex-1 ${color} rounded-t transition-all hover:opacity-80 relative group`}
              style={{ height: `${Math.max(height, 2)}%` }}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {formatDate(item.date)}: {item.total}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Growth indicator component
  const GrowthIndicator = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
    const isPositive = value >= 0;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    const Icon = isPositive ? TrendingUp : TrendingDown;
    
    return (
      <span className={`flex items-center gap-1 text-xs font-bold ${colorClass}`}>
        <Icon size={14} />
        {isPositive ? '+' : ''}{value}%{suffix}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-[3rem] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black uppercase italic">BI & Performance</h2>
            <p className="text-indigo-100 text-sm font-medium mt-1">
              Análises e métricas detalhadas
            </p>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-[2rem] p-4 border border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-600">Período:</span>
          <div className="flex gap-2">
            {periodOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => handlePeriodChange(opt.value)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  period === opt.value 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="text-xs text-slate-400">
          {periodDates.start && periodDates.end && (
            <span>{formatDate(periodDates.start)} - {formatDate(periodDates.end)}</span>
          )}
        </div>
      </div>

      {/* Stats Cards with Growth */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* Fretes */}
        <div className="bg-white rounded-[2rem] p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-orange-50 p-2 rounded-xl">
              <Truck size={16} className="text-orange-500" />
            </div>
            <GrowthIndicator value={stats?.freights?.growth || 0} />
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">Fretes</p>
          <p className="text-2xl font-black text-slate-800">{formatNumber(stats?.freights?.current || 0)}</p>
        </div>

        {/* Usuários */}
        <div className="bg-white rounded-[2rem] p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-blue-50 p-2 rounded-xl">
              <Users size={16} className="text-blue-500" />
            </div>
            <GrowthIndicator value={stats?.users?.growth || 0} />
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">Usuários</p>
          <p className="text-2xl font-black text-slate-800">{formatNumber(stats?.users?.current || 0)}</p>
        </div>

        {/* Empresas */}
        <div className="bg-white rounded-[2rem] p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-purple-50 p-2 rounded-xl">
              <ShoppingBag size={16} className="text-purple-500" />
            </div>
            <GrowthIndicator value={stats?.companies?.growth || 0} />
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">Empresas</p>
          <p className="text-2xl font-black text-slate-800">{formatNumber(stats?.companies?.current || 0)}</p>
        </div>

        {/* Anúncios Marketplace */}
        <div className="bg-white rounded-[2rem] p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-emerald-50 p-2 rounded-xl">
              <ShoppingBag size={16} className="text-emerald-500" />
            </div>
            <GrowthIndicator value={stats?.listings?.growth || 0} />
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">Anúncios</p>
          <p className="text-2xl font-black text-slate-800">{formatNumber(stats?.listings?.current || 0)}</p>
        </div>

        {/* Cotações */}
        <div className="bg-white rounded-[2rem] p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-amber-50 p-2 rounded-xl">
              <FileText size={16} className="text-amber-500" />
            </div>
            <GrowthIndicator value={stats?.quotes?.growth || 0} />
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">Cotações</p>
          <p className="text-2xl font-black text-slate-800">{formatNumber(stats?.quotes?.total || 0)}</p>
        </div>

        {/* Tickets */}
        <div className="bg-white rounded-[2rem] p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-red-50 p-2 rounded-xl">
              <Headphones size={16} className="text-red-500" />
            </div>
            <GrowthIndicator value={stats?.tickets?.growth || 0} />
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">Tickets</p>
          <p className="text-2xl font-black text-slate-800">{formatNumber(stats?.tickets?.total || 0)}</p>
        </div>

        {/* Planos */}
        <div className="bg-white rounded-[2rem] p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-indigo-50 p-2 rounded-xl">
              <CreditCard size={16} className="text-indigo-500" />
            </div>
            <GrowthIndicator value={stats?.plans?.growth || 0} />
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">Planos</p>
          <p className="text-2xl font-black text-slate-800">{formatNumber(stats?.plans?.current || 0)}</p>
        </div>

        {/* Anúncios Publicitários */}
        <div className="bg-white rounded-[2rem] p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-pink-50 p-2 rounded-xl">
              <Megaphone size={16} className="text-pink-500" />
            </div>
            <GrowthIndicator value={stats?.ads?.growth || 0} />
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">Propagandas</p>
          <p className="text-2xl font-black text-slate-800">{formatNumber(stats?.ads?.current || 0)}</p>
        </div>

        {/* Receita */}
        <div className="bg-white rounded-[2rem] p-4 border border-slate-100 col-span-2">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-green-50 p-2 rounded-xl">
              <DollarSign size={16} className="text-green-500" />
            </div>
            <GrowthIndicator value={stats?.revenue?.growth || 0} />
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">Receita</p>
          <p className="text-2xl font-black text-green-600">{formatCurrency(stats?.revenue?.current || 0)}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fretes Chart */}
        <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black uppercase text-slate-800">Fretes por Dia</h3>
            <Truck size={20} className="text-orange-400" />
          </div>
          <BarChart data={freightsChart} color="bg-orange-500" />
        </div>

        {/* Users Chart */}
        <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black uppercase text-slate-800">Novos Usuários por Dia</h3>
            <Users size={20} className="text-blue-400" />
          </div>
          <BarChart data={usersChart} color="bg-blue-500" />
        </div>
      </div>

      {/* Top Cities */}
      <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black uppercase text-slate-800">Top Cidades (Fretes)</h3>
          <BarChart3 size={20} className="text-indigo-400" />
        </div>
        
        {topCities.length === 0 ? (
          <p className="text-center text-slate-400 py-8">Sem dados para o período</p>
        ) : (
          <div className="space-y-3">
            {topCities.map((city, idx) => {
              const maxValue = topCities[0]?.total || 1;
              const width = (city.total / maxValue) * 100;
              
              return (
                <div key={city.origin_city || idx} className="flex items-center gap-3">
                  <span className="w-6 text-xs font-bold text-slate-400">#{idx + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-700">{city.origin_city}</span>
                      <span className="text-xs font-bold text-slate-500">{city.total}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
