import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  Users, Truck, ShoppingBag, FileText, CreditCard, 
  Package, Headphones, TrendingUp, RefreshCw, DollarSign
} from 'lucide-react';
import Swal from 'sweetalert2';

interface HomeStats {
  users: { total: number; new_30d: number };
  companies: { total: number };
  freights: { total: number; new_7d: number };
  listings: { total: number };
  quotes: { total: number; open: number; closed: number };
  modules: Record<string, number>;
  active_plans: { total: number };
  support_tickets: { total: number; open: number; closed: number };
  revenue: { month: number };
}

interface Activity {
  id: number;
  type: string;
  user: string;
  action: string;
  time: string;
}

export default function DashboardHome({ user }: { user: any }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const role = user?.role?.toUpperCase() || '';

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/home-stats');
      console.log('Response:', res.data);
      if (res.data?.success) {
        setStats(res.data.data);
        setActivities(res.data.recent_activities || []);
      } else {
        console.error('Error:', res.data?.message);
      }
    } catch (e: any) {
      console.error("Erro ao carregar dados:", e.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateStr: string | undefined | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'freight_created': return <Truck size={14} />;
      case 'user_registered': return <Users size={14} />;
      case 'quote_created': return <FileText size={14} />;
      case 'listing_created': return <ShoppingBag size={14} />;
      case 'payment_received': return <DollarSign size={14} />;
      default: return <Package size={14} />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'freight_created': return 'Frete criado';
      case 'user_registered': return 'Usuário cadastrado';
      case 'quote_created': return 'Cotação criada';
      case 'listing_created': return 'Anúncio criado';
      case 'payment_received': return 'Pagamento recebido';
      default: return 'Atividade';
    }
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
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-[3rem] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black uppercase italic">Início</h2>
            <p className="text-slate-300 text-sm font-medium mt-1">
              Bem-vindo de volta{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {/* Usuários */}
        <div className="bg-white rounded-[2rem] p-5 border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-50 p-2.5 rounded-xl">
              <Users size={20} className="text-blue-500" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">Usuários</p>
          <p className="text-2xl font-black text-slate-800">{stats?.users?.total || 0}</p>
          <p className="text-[10px] text-green-600 font-bold mt-1">+{stats?.users?.new_30d || 0} este mês</p>
        </div>

        {/* Empresas */}
        <div className="bg-white rounded-[2rem] p-5 border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-50 p-2.5 rounded-xl">
              <ShoppingBag size={20} className="text-purple-500" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">Empresas</p>
          <p className="text-2xl font-black text-slate-800">{stats?.companies?.total || 0}</p>
        </div>

        {/* Fretes */}
        <div className="bg-white rounded-[2rem] p-5 border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-orange-50 p-2.5 rounded-xl">
              <Truck size={20} className="text-orange-500" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">Fretes</p>
          <p className="text-2xl font-black text-slate-800">{stats?.freights?.total || 0}</p>
          <p className="text-[10px] text-green-600 font-bold mt-1">+{stats?.freights?.new_7d || 0} esta semana</p>
        </div>

        {/* Anúncios */}
        <div className="bg-white rounded-[2rem] p-5 border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-emerald-50 p-2.5 rounded-xl">
              <ShoppingBag size={20} className="text-emerald-500" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">Anúncios</p>
          <p className="text-2xl font-black text-slate-800">{stats?.listings?.total || 0}</p>
        </div>

        {/* Cotações */}
        <div className="bg-white rounded-[2rem] p-5 border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-amber-50 p-2.5 rounded-xl">
              <FileText size={20} className="text-amber-500" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">Cotações</p>
          <p className="text-2xl font-black text-slate-800">{stats?.quotes?.total || 0}</p>
          <p className="text-[10px] text-slate-400 font-bold mt-1">
            {stats?.quotes?.open || 0} abertas
          </p>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita do Mês */}
        <div className="bg-white rounded-[2rem] p-5 border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-50 p-2.5 rounded-xl">
              <TrendingUp size={20} className="text-green-500" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">Receita do Mês</p>
          <p className="text-2xl font-black text-green-600">{formatCurrency(stats?.revenue?.month || 0)}</p>
        </div>

        {/* Planos Ativos */}
        <div className="bg-white rounded-[2rem] p-5 border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-indigo-50 p-2.5 rounded-xl">
              <CreditCard size={20} className="text-indigo-500" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">Planos Ativos</p>
          <p className="text-2xl font-black text-slate-800">{stats?.active_plans?.total || 0}</p>
        </div>

        {/* Tickets Abertos */}
        <div className="bg-white rounded-[2rem] p-5 border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-red-50 p-2.5 rounded-xl">
              <Headphones size={20} className="text-red-500" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">Tickets Abertos</p>
          <p className="text-2xl font-black text-slate-800">{stats?.support_tickets?.open || 0}</p>
          <p className="text-[10px] text-slate-400 font-bold mt-1">
            {stats?.support_tickets?.closed || 0} fechados
          </p>
        </div>

        {/* Módulos Ativos */}
        <div className="bg-white rounded-[2rem] p-5 border border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-cyan-50 p-2.5 rounded-xl">
              <Package size={20} className="text-cyan-500" />
            </div>
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">Módulos Ativos</p>
          <p className="text-2xl font-black text-slate-800">
            {Object.values(stats?.modules || {}).reduce((a: number, b: any) => a + b, 0)}
          </p>
        </div>
      </div>

      {/* Atividades Recentes */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-black uppercase italic text-slate-800">Atividades Recentes</h3>
        </div>
        
        {activities.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium">Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {activities.slice(0, 10).map((activity, idx) => (
              <div key={activity.id || idx} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                <div className="bg-slate-100 p-2 rounded-xl text-slate-500">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-800 truncate">
                    {activity.user || 'Usuário'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {activity.action || getActivityLabel(activity.type)}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap">
                  {formatDate(activity.time)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
