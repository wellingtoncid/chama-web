import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import {
  Users, Truck, ShoppingBag, FileText, CreditCard,
  Package, Headphones, TrendingUp, RefreshCw, DollarSign,
  UserPlus, Building2, Megaphone, UserCheck, MessageSquare,
  Flag, Mail, ArrowRight, Wallet, Loader2
} from 'lucide-react';
import { AdminHeader, StatsGrid, StatCard } from '@/components/admin';
import Swal from 'sweetalert2';

interface HomeStats {
  users: { total: number; new_30d: number; pending: number };
  companies: { total: number };
  freights: { total: number; new_7d: number };
  listings: { total: number };
  quotes: { total: number; open: number; closed: number };
  modules: Record<string, number>;
  active_plans: { total: number };
  support_tickets: { total: number; open: number; closed: number };
  revenue: { month: number };
  reports: { pending: number };
  leads: { total: number };
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
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/home-stats');
      if (res.data?.success) {
        setStats(res.data.data);
        setActivities(res.data.recent_activities || []);
      }
    } catch (e: any) {
      console.error("Erro ao carregar dados:", e.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

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
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

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

  const quickActions = [
    { label: 'Novo Usuário', icon: UserPlus, path: '/dashboard/admin/usuarios/novo', color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' },
    { label: 'Nova Carga', icon: Truck, path: '/dashboard/admin/cargas', color: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
    { label: 'Nova Empresa', icon: Building2, path: '/dashboard/admin/usuarios/novo', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
    { label: 'Novo Anúncio', icon: Megaphone, path: '/dashboard/admin/publicidade', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
  ];

  if (loading) {
    return (
      <div className="p-5 lg:p-8 max-w-[1440px] mx-auto space-y-5 lg:space-y-6 animate-in fade-in duration-500 pb-20">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 lg:p-8 max-w-[1440px] mx-auto space-y-5 lg:space-y-6 animate-in fade-in duration-500 pb-20">
      {/* HEADER */}
      <AdminHeader
        title="Início"
        description={`Bem-vindo de volta${user?.name ? `, ${user.name.split(' ')[0]}` : ''}!`}
        actions={
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Atualizar
          </button>
        }
      />

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.path)}
            className={`flex items-center gap-3 p-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all ${action.color}`}
          >
            <action.icon size={20} />
            {action.label}
          </button>
        ))}
      </div>

      {/* KPI ROW 1 */}
      <StatsGrid className="xl:grid-cols-5">
        <StatCard
          label="Usuários"
          value={stats?.users?.total || 0}
          variant="blue"
          icon={Users}
          subtext={`+${stats?.users?.new_30d || 0} este mês`}
          subtextVariant="green"
          onClick={() => navigate('/dashboard/admin/usuarios')}
        />
        <StatCard
          label="Empresas"
          value={stats?.companies?.total || 0}
          variant="purple"
          icon={Building2}
          onClick={() => navigate('/dashboard/admin/usuarios')}
        />
        <StatCard
          label="Fretes"
          value={stats?.freights?.total || 0}
          variant="yellow"
          icon={Truck}
          subtext={`+${stats?.freights?.new_7d || 0} esta semana`}
          subtextVariant="green"
          onClick={() => navigate('/dashboard/admin/cargas')}
        />
        <StatCard
          label="Anúncios"
          value={stats?.listings?.total || 0}
          variant="green"
          icon={Megaphone}
          onClick={() => navigate('/dashboard/admin/publicidade')}
        />
        <StatCard
          label="Cotações"
          value={stats?.quotes?.total || 0}
          variant="yellow"
          icon={FileText}
          subtext={`${stats?.quotes?.open || 0} abertas`}
          onClick={() => navigate('/dashboard/admin/cotacoes')}
        />
      </StatsGrid>

      {/* KPI ROW 2 */}
      <StatsGrid>
        <StatCard
          label="Receita do Mês"
          value={formatCurrency(stats?.revenue?.month || 0)}
          variant="green"
          icon={TrendingUp}
          onClick={() => navigate('/dashboard/admin/financeiro')}
        />
        <StatCard
          label="Planos Ativos"
          value={stats?.active_plans?.total || 0}
          variant="blue"
          icon={CreditCard}
          onClick={() => navigate('/dashboard/admin/planos')}
        />
        <StatCard
          label="Tickets Abertos"
          value={stats?.support_tickets?.open || 0}
          variant="red"
          icon={Headphones}
          subtext={`${stats?.support_tickets?.closed || 0} fechados`}
          onClick={() => navigate('/dashboard/admin/suporte')}
        />
        <StatCard
          label="Leads"
          value={stats?.leads?.total || 0}
          variant="default"
          icon={Mail}
          onClick={() => navigate('/dashboard/admin/leads')}
        />
      </StatsGrid>

      {/* MINHA CARTEIRA */}
      <AdminWalletCard />

      {/* PENDING ITEMS */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-black uppercase italic text-slate-800 dark:text-white text-sm">
            Precisa de Atenção
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-700">
          <button
            onClick={() => navigate('/dashboard/admin/usuarios')}
            className="flex items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
          >
            <div className="bg-amber-50 p-2.5 rounded-xl">
              <UserCheck size={20} className="text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-slate-800 dark:text-white">Usuários Pendentes</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {stats?.users?.pending || 0} pendentes
              </p>
            </div>
            <ArrowRight size={16} className="text-slate-300" />
          </button>
          <button
            onClick={() => navigate('/dashboard/admin/suporte')}
            className="flex items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
          >
            <div className="bg-red-50 p-2.5 rounded-xl">
              <MessageSquare size={20} className="text-red-500" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-slate-800 dark:text-white">Tickets em Aberto</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {stats?.support_tickets?.open || 0} aguardando resposta
              </p>
            </div>
            <ArrowRight size={16} className="text-slate-300" />
          </button>
          <button
            onClick={() => navigate('/dashboard/admin/denuncias')}
            className="flex items-center gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
          >
            <div className="bg-red-50 p-2.5 rounded-xl">
              <Flag size={20} className="text-red-500" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-slate-800 dark:text-white">Denúncias</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {stats?.reports?.pending || 0} pendentes
              </p>
            </div>
            <ArrowRight size={16} className="text-slate-300" />
          </button>
        </div>
      </div>

      {/* ATIVIDADES RECENTES */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-black uppercase italic text-slate-800 dark:text-white text-sm">
            Atividades Recentes
          </h3>
          <button
            onClick={() => navigate('/dashboard/admin/auditoria')}
            className="text-[10px] font-bold uppercase text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            Ver Todas <ArrowRight size={12} />
          </button>
        </div>

        {activities.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium">Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {activities.slice(0, 8).map((activity, idx) => (
              <div key={activity.id || idx} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-xl text-slate-500 dark:text-slate-400">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-800 dark:text-white truncate">
                    {activity.user || 'Usuário'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {activity.action || getActivityLabel(activity.type)}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
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

function AdminWalletCard() {
  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [recharging, setRecharging] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get('/wallet/balance');
        if (res.data?.success) setBalance(res.data.data.balance ?? 0);
      } catch { /* */ }
      finally { setLoading(false); }
    })();
  }, []);

  const handleRecharge = async () => {
    const v = parseFloat(amount.replace(',', '.'));
    if (isNaN(v) || v < 0.01) {
      Swal.fire({ icon: 'warning', title: 'Valor mínimo: R$ 0,01' });
      return;
    }
    setRecharging(true);
    try {
      const res = await api.post('/wallet/recharge', { amount: v });
      if (res.data?.success && res.data?.url) {
        window.location.href = res.data.url;
      } else {
        Swal.fire({ icon: 'error', title: res.data?.message || 'Erro ao gerar PIX' });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro ao processar recarga' });
    } finally { setRecharging(false); }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shrink-0">
            <Wallet size={22} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm text-slate-800 dark:text-white">Minha Carteira</p>
            <p className="text-xs text-slate-400">
              {loading
                ? 'Carregando...'
                : `Saldo: R$ ${(balance ?? 0).toFixed(2).replace('.', ',')}`
              }
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-1 max-w-xs ml-auto">
          <input
            type="text"
            value={amount}
            onChange={e => setAmount(e.target.value.replace(/[^0-9,]/g, ''))}
            placeholder="Valor"
            className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            onClick={handleRecharge}
            disabled={recharging || !amount}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50 shrink-0"
          >
            {recharging ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
            Recarregar
          </button>
        </div>
      </div>
    </div>
  );
}
