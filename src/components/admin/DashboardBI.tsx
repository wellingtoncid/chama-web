import { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/api';
import { useTheme } from '@/context/ThemeContext';
import { RefreshCw, RotateCcw, Plus, LayoutGrid, Settings, Truck, BarChart3, Users, DollarSign, FileText, Headphones, ShoppingBag } from 'lucide-react';
import { WidgetContainer } from './widgets/WidgetContainer';
import { WidgetSelector } from './widgets/WidgetSelector';
import { BIWidget } from './widgets/BIWidget';
import { BarChartWidget } from './widgets/BarChartWidget';
import { PageShell } from '@/components/admin';

interface BIStats {
  freights?: { current: number; growth: number; all_time: number; by_status?: any[]; by_day?: any[] };
  users?: { current: number; growth: number; all_time: number; by_role?: any[]; active?: number; inactive?: number };
  companies?: { current: number; total: number; verified: number };
  drivers?: { current: number; total: number; verified: number };
  finance?: { current: number; growth: number; all_time: number; avg_ticket: number };
  quotes?: { total: number; growth: number; all_time: number; by_status?: any[] };
  tickets?: { open: number; closed: number; total: number; new_this_period: number };
  groups?: { total: number; members: number };
  marketplace?: { active: number; new_this_period: number };
  ads?: { revenue: number; impressions: number; ctr: number };
  plans?: { current: number; revenue: number };
}

interface UserWidget {
  widget_key: string;
  widget_type: string;
  position_order: number;
  col_span: number;
}

interface AvailableWidget {
  widget_key: string;
  widget_type: string;
  label: string;
  description: string;
  icon: string;
  category: string;
}

const periodOptions = [
  { value: 'today', label: 'Hoje' },
  { value: 'last_7_days', label: 'Últimos 7 dias' },
  { value: 'last_15_days', label: 'Últimos 15 dias' },
  { value: 'last_30_days', label: 'Últimos 30 dias' },
  { value: 'this_month', label: 'Este Mês' },
  { value: 'custom', label: 'Personalizado' },
];

export default function DashboardBI({ user }: { user: any }) {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [stats, setStats] = useState<BIStats | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [userWidgets, setUserWidgets] = useState<UserWidget[]>([]);
  const [availableWidgets, setAvailableWidgets] = useState<AvailableWidget[]>([]);

  const loadData = async (selectedPeriod?: string) => {
    try {
      setLoading(true);
      const res = await api.get('/admin/bi', { 
        params: { period: selectedPeriod || period } 
      });
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadWidgets = async () => {
    try {
      const res = await api.get('/admin/dashboard/widgets');
      if (res.data?.success) {
        const widgets = res.data.data?.user_widgets || [];
        if (widgets.length > 0) {
          setUserWidgets(widgets.map((w: any) => ({
            widget_key: w.widget_key,
            widget_type: w.widget_type,
            position_order: w.position_order,
            col_span: w.col_span
          })));
        }
        setAvailableWidgets(res.data.data?.available_widgets || []);
      }
    } catch (e) {
      console.error("Erro ao carregar widgets:", e);
    }
  };

  useEffect(() => {
    loadData();
    loadWidgets();
  }, []);

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    if (newPeriod === 'custom' && customStart && customEnd) {
      loadData(`custom:${customStart}:${customEnd}`);
    } else if (newPeriod !== 'custom') {
      loadData(newPeriod);
    }
  };

  const handleCustomApply = () => {
    if (customStart && customEnd) {
      setPeriod('custom');
      loadData(`custom:${customStart}:${customEnd}`);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSaveWidgets = async () => {
    try {
      await api.put('/admin/dashboard/widgets', {
        widgets: userWidgets.map((w, idx) => ({
          widget_key: w.widget_key,
          widget_type: w.widget_type,
          col_span: w.col_span
        }))
      });
      setIsEditing(false);
      setShowSelector(false);
    } catch (e) {
      console.error("Erro ao salvar widgets:", e);
    }
  };

  const handleResetWidgets = async () => {
    try {
      await api.post('/admin/dashboard/widgets/reset');
      setIsEditing(false);
    } catch (e) {
      console.error("Erro ao resetar widgets:", e);
    }
  };

  const handleToggleWidget = (widgetKey: string) => {
    const existing = userWidgets.find(w => w.widget_key === widgetKey);
    if (existing) {
      setUserWidgets(userWidgets.filter(w => w.widget_key !== widgetKey));
    } else {
      const available = availableWidgets.find(w => w.widget_key === widgetKey);
      if (available) {
        setUserWidgets([...userWidgets, {
          widget_key: widgetKey,
          widget_type: available.widget_type,
          position_order: userWidgets.length + 1,
          col_span: available.widget_type === 'kpi' ? 1 : 2
        }]);
      }
    }
  };

  const selectedWidgetKeys = useMemo(() => userWidgets.map(w => w.widget_key), [userWidgets]);

  const getWidgetTitle = (widgetKey: string) => {
    const titles: Record<string, string> = {
      freights_total: 'Total de Fretes',
      freights_growth: 'Crescimento Fretes',
      freights_open: 'Fretes Abertos',
      freights_in_progress: 'Em Andamento',
      freights_completed: 'Concluídos',
      freights_chart: 'Fretes por Dia',
      users_total: 'Total de Usuários',
      users_growth: 'Novos Usuários',
      users_active: 'Usuários Ativos',
      users_inactive: 'Inativos',
      drivers_total: 'Motoristas',
      drivers_verified: 'Verificados',
      companies_total: 'Empresas',
      companies_verified: 'Verificadas',
      wallet_revenue: 'Receita do Período',
      wallet_revenue_growth: 'Crescimento',
      wallet_all_time: 'Receita Total',
      avg_ticket: 'Ticket Médio',
      plans_active: 'Planos Ativos',
      plans_revenue: 'Receita Planos',
      ads_revenue: 'Receita Ads',
      ads_impressions: 'Impressões',
      ads_ctr: 'Taxa de Clique',
      quotes_total: 'Total Cotações',
      quotes_growth: 'Crescimento',
      quotes_open: 'Abertas',
      quotes_accepted: 'Aceitas',
      quotes_rejected: 'Rejeitadas',
      tickets_open: 'Tickets Abertos',
      tickets_closed: 'Fechados',
      tickets_new: 'Novos Tickets',
      groups_total: 'Total Grupos',
      groups_members: 'Membros',
      listings_active: 'Anúncios Ativos',
      listings_new: 'Novos Anúncios',
    };
    return titles[widgetKey] || widgetKey.replace(/_/g, ' ');
  };

  const iconMap: Record<string, React.ReactNode> = {
    freights_total: <Truck size={20} />,
    freights_chart: <BarChart3 size={20} />,
    users_total: <Users size={20} />,
    wallet_revenue: <DollarSign size={20} />,
    quotes_total: <FileText size={20} />,
    tickets_open: <Headphones size={20} />,
    listings_active: <ShoppingBag size={20} />,
  };

  if (loading) {
    return (
      <div className={`p-6 flex flex-col items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className={`w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4`}></div>
        <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Carregando...</span>
      </div>
    );
}

  const renderWidget = (widget: UserWidget) => {
    if (widget.widget_type === 'chart_bar' || widget.widget_type === 'chart_line') {
      const chartData = stats?.freights?.by_day?.map((d: any) => ({
        label: d.date?.slice(5),
        value: parseInt(d.total)
      })) || [];
      
      return (
        <BarChartWidget
          data={chartData}
          color="bg-indigo-500"
          emptyMessage="Sem dados para exibir"
        />
      );
    }
    
    if (widget.widget_type === 'ranking') {
      return (
        <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Widget não disponível no momento
        </div>
      );
    }
    
    return (
      <BIWidget
        widgetKey={widget.widget_key}
        data={stats}
      />
    );
  };

return (
  <PageShell
    title="Dashboard BI"
    description="Business Intelligence Dashboard"
    actions={
      <div className="flex items-center gap-3">
        {/* Period Select (SaaS Standard) */}
        <select
          value={period}
          onChange={(e) => handlePeriodChange(e.target.value)}
          className={`rounded-xl px-4 py-2.5 text-sm font-medium border-none outline-none transition-all ${
            isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {periodOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Custom Date Picker (Show only if 'custom' is selected) */}
        {period === 'custom' && (
          <div className={`flex items-center gap-2 ${isDark ? 'bg-slate-800' : 'bg-slate-100'} rounded-xl px-4 py-2.5`}>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'} bg-transparent border-none outline-none w-24`}
            />
            <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>-</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'} bg-transparent border-none outline-none w-24`}
            />
            <button
              onClick={handleCustomApply}
              disabled={!customStart || !customEnd}
              className={`${isDark ? 'bg-slate-600 disabled:bg-slate-700' : 'bg-slate-900 disabled:bg-slate-400'} text-white px-4 py-1 rounded-lg text-sm font-medium`}
            >
              OK
            </button>
          </div>
        )}

        {/* Actions */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`p-2.5 rounded-xl ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'} transition-all`}
          title={isEditing ? 'Fechar' : 'Personalizar'}
        >
          <LayoutGrid size={18} />
        </button>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`p-2.5 rounded-xl ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'} transition-all`}
          title="Atualizar"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>
    }
  >

    {/* Add spacing between header and content */}
    <div className="mt-4">
      {/* Editing Toolbar */}
      {isEditing && (
        <div className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-4`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSelector(!showSelector)}
              className={`${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'} px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 transition-all`}
            >
              <Plus size={16} />
              Adicionar
            </button>
            <button
              onClick={handleResetWidgets}
              className={`${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'} px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 transition-all border`}
            >
              <RotateCcw size={16} />
              Resetar
            </button>
          </div>
          <button
            onClick={handleSaveWidgets}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-xl font-bold text-sm text-white flex items-center gap-2 transition-all"
          >
            <Settings size={16} />
            Salvar Layout
          </button>
        </div>

        {showSelector && (
          <div className="mt-4 pt-4 border-t border-indigo-200">
            <WidgetSelector
              availableWidgets={availableWidgets.map(w => ({
                widget_key: w.widget_key,
                widget_type: w.widget_type,
                label: w.label,
                description: w.description,
                icon: w.icon,
                category: w.category
              }))}
              selectedWidgets={selectedWidgetKeys}
              onToggle={handleToggleWidget}
            />
          </div>
        )}
      </div>
    )}

    {/* Widgets Grid */}
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6 ${isEditing ? 'opacity-75' : ''}`}>
      {userWidgets.map((widget) => (
        <WidgetContainer
          key={widget.widget_key}
          colSpan={widget.col_span}
          isEditing={isEditing}
          onRemove={isEditing ? () => handleToggleWidget(widget.widget_key) : undefined}
        >
          {renderWidget(widget)}
        </WidgetContainer>
      ))}
    </div>

    {userWidgets.length === 0 && !isEditing && (
      <div className={`text-center py-16 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} rounded-2xl border p-12`}>
        <LayoutGrid size={48} className={`mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
        <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium mb-4`}>Nenhum widget configurado</p>
        <button
          onClick={() => setIsEditing(true)}
          className="text-indigo-600 font-bold text-sm hover:underline"
        >
          Adicionar widgets
        </button>
       </div>
     )}
     </div>
   </PageShell>
);
}