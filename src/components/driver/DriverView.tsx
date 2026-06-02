import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/api';
import FreightCard from '@/components/shared/FreightCard';
import { ProfileCompletenessAlert } from '@/components/driver';
import { 
  Search, Heart, List, Activity, Truck, X, 
  Zap, ChevronRight, BellRing, Check, ShieldCheck, LayoutGrid,
  Box, Calculator, Table2, ChevronLeft, Eye
} from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/Button';
import { StatsGrid, StatCard } from '@/components/admin';
import Swal from 'sweetalert2';

interface DriverViewProps {
  user?: any;
  forceTab?: string;
}

export default function DriverView({ user: userProp, forceTab }: DriverViewProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [search, setSearch] = useState('');
  const [allFreights, setAllFreights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFreight, setSelectedFreight] = useState<any>(null);
  const [radarOn, setRadarOn] = useState(true);
  const [stats, setStats] = useState({ total_open: 0, total_favs: 0, total_invitations: 0 });
  
  const [invitations, setInvitations] = useState<any[]>([]);
  const [activeFreight, setActiveFreight] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [interestLoadingId, setInterestLoadingId] = useState<number | null>(null);
  const [invitationSubFilter, setInvitationSubFilter] = useState<'all' | 'pending' | 'accepted' | 'history'>('all');

  const user = useMemo(() => {
    const base = userProp || { id: 0, name: 'Motorista' };
    const extras = base.extended_attributes 
      ? (typeof base.extended_attributes === 'string' 
          ? JSON.parse(base.extended_attributes) 
          : base.extended_attributes) 
      : {};

    return { 
      ...base, 
      ...extras,
      display_name: base.name || base.full_name || extras.name || 'Motorista',
      vehicle_type: base.vehicle_type || extras.vehicle_type || null,
      body_type: base.body_type || extras.body_type || null 
    };
  }, [userProp]);

  useEffect(() => {
    if (forceTab) setFilter(forceTab);
  }, [forceTab]);

  const loadOperationalData = useCallback(async () => {
    if (!user.id) return;
    try {
      const [resInv, resActive] = await Promise.all([
        api.get('/my-invitations'),
        api.get('my-active-freight', { 
          params: { user_id: user.id } 
        })
      ]);

      const invData = resInv.data?.success ? resInv.data.data : [];
      setInvitations(invData);
      
      const activeData = resActive.data.success ? resActive.data.data : resActive.data;
      setActiveFreight(activeData?.id ? activeData : null);
    } catch (e) {
      console.error("Erro operacional:", e);
    }
  }, [user.id]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let route = 'freights';
      let params: any = { 
        viewer_id: user.id,
        smart_match: (radarOn && filter === 'all' && user.vehicle_type) ? 1 : 0,
        vehicle_type: user.vehicle_type || null,
        body_type: user.body_type || null
      }; 

      if (filter === 'favs') {
        route = 'my-favorites';
        params = { user_id: user.id };
      } 
      else if (filter === 'invitations') {
        route = 'my-invitations';
        params = {};
      }

      const [resData, resStats] = await Promise.all([
        api.get(route, { params }),
        api.get('driver-stats', { params: { user_id: user.id } })
      ]);

      const responseContent = resData.data;
      let finalArray = [];

      if (responseContent.success && Array.isArray(responseContent.data)) {
        finalArray = responseContent.data;
      } else if (Array.isArray(responseContent)) {
        finalArray = responseContent;
      } else if (responseContent.data && Array.isArray(responseContent.data.data)) {
        finalArray = responseContent.data.data;
      }

      if (resStats.data) {
        setStats(resStats.data.data || resStats.data);
      }
      
      const processedData = finalArray.map((item: any) => ({
        ...item,
        id: filter === 'invitations' ? item.id : (item.freight_id || item.target_id || item.id),
        is_favorite: filter === 'favs' ? true : !!item.is_favorite
      }));

      setAllFreights(processedData);
      loadOperationalData();
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
      setAllFreights([]);
    } finally {
      setLoading(false);
    }
  }, [filter, radarOn, user.id, loadOperationalData]);

  useEffect(() => {
    loadData();
  }, [filter, loadData]);

  useEffect(() => { setCurrentPage(1); }, [search, filter]);

  const filteredFreights = useMemo(() => {
    if (!search.trim()) return allFreights;
    const normalize = (t: any) => t?.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || "";
    const searchWords = normalize(search).split(/\s+/);

    return allFreights.filter(f => {
      const content = normalize(`${f.origin_city} ${f.dest_city} ${f.product} ${f.company_name} ${f.vehicle_type} ${f.body_type}`);
      return searchWords.every((word: any) => content.includes(word));
    });
  }, [search, allFreights]);

  const handleInterest = async (freightId: number) => {
    setInterestLoadingId(freightId);
    try {
      await api.post('/freight-invitations/interest', { freight_id: freightId });
      Swal.fire({ icon: 'success', title: 'Interesse registrado!', text: 'A empresa será notificada.', timer: 2000, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao registrar interesse.' });
    } finally {
      setInterestLoadingId(null);
    }
  };

  const totalPages = Math.ceil(filteredFreights.length / pageSize);
  const paginatedFreights = filteredFreights.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleCancelAcceptedMatch = async (invitationId: number) => {
    try {
      const result = await Swal.fire({
        title: 'Cancelar match?',
        text: 'A empresa será notificada e o frete voltará a ficar disponível.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sim, cancelar',
        cancelButtonText: 'Voltar',
      });
      if (!result.isConfirmed) return;
      const res = await api.put(`/freight-invitations/${invitationId}/cancel-match`);
      if (res.data?.success) {
        Swal.fire({ icon: 'success', title: 'Match cancelado!', timer: 1500, showConfirmButton: false });
        loadData();
      } else {
        Swal.fire({ icon: 'error', title: 'Erro', text: res.data?.message || 'Erro ao cancelar match' });
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao cancelar match. Tente novamente.' });
    }
  };

  const handleRespondInvitation = async (invitationId: number, action: 'accepted' | 'declined') => {
    try {
      await api.put(`/freight-invitations/${invitationId}/respond`, { action });
      loadData();
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Erro ao responder convite.';
      Swal.fire({ icon: 'error', title: 'Erro', text: msg });
    }
  };

  return (
    <DashboardShell
      title={
        <span>
          Olá, <span className="text-orange-500">{user.display_name.split(' ')[0]}</span>
        </span>
      }
      description={
        <div className="flex flex-wrap gap-2 mt-1">
          {user.vehicle_type ? (
            <span className="bg-slate-900 text-white dark:bg-slate-800 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-2">
              <Truck size={12} className="text-orange-500" /> {user.vehicle_type}
            </span>
          ) : (
            <span className="bg-red-50 text-red-500 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider italic">
              Veículo não definido
            </span>
          )}
          
          {user.body_type && (
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-2">
              <Box size={12} /> {user.body_type}
            </span>
          )}
        </div>
      }
      actions={
        <div className="text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status do Radar</p>
          <div className={`text-[10px] font-black uppercase italic ${radarOn ? 'text-emerald-500' : 'text-slate-300'}`}>
            {radarOn ? 'Rastreando cargas compatíveis' : 'Radar desligado'}
          </div>
        </div>
      }
    >
      {/* Profile Completeness Alert */}
      <ProfileCompletenessAlert variant="banner" />
      
      {/* SEÇÃO URGENTE: Carga em Andamento */}
      {filter === 'all' && activeFreight && (
        <div className="bg-slate-900 rounded-[2.5rem] p-6 border-b-8 border-emerald-500 shadow-2xl text-white animate-in slide-in-from-top-4 duration-500">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-emerald-500 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck size={10} /> Carga em Andamento
            </div>
            <span className="text-white/30 text-[10px] font-bold uppercase italic">ID #{activeFreight.id}</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h4 className="font-black italic uppercase text-lg leading-tight flex items-center gap-2">
                {activeFreight.origin_city} <ChevronRight className="text-emerald-500" size={16} /> {activeFreight.dest_city}
              </h4>
              <p className="text-white/50 text-[10px] font-bold uppercase mt-1">{activeFreight.product}</p>
            </div>
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
              Finalizar Entrega
            </Button>
          </div>
        </div>
      )}

      {/* BANNER DE CONVITES */}
      {filter === 'all' && invitations.filter((i: any) => i.status === 'pending').length > 0 && (
        <div className="bg-orange-500 text-white p-5 rounded-[2rem] flex items-center justify-between shadow-lg shadow-orange-500/20">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-xl animate-bounce">
              <BellRing size={20} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase italic leading-none">Você tem {invitations.filter((i: any) => i.status === 'pending').length} convite(s)!</p>
              <p className="text-[9px] font-bold opacity-80 uppercase mt-1">Empresas aguardando sua resposta</p>
            </div>
          </div>
          <Button onClick={() => setFilter('invitations')} variant="hero-outline" size="sm">
            Ver Agora
          </Button>
        </div>
      )}

      {/* KPIS */}
      <StatsGrid className="relative z-10">
        <StatCard label="Disponíveis" value={stats.total_open} icon={List} variant="orange" />
        <StatCard label="Favoritos" value={stats.total_favs} icon={Heart} variant="red" />
        <StatCard label="Convites" value={invitations.filter((i: any) => i.status === 'pending').length} icon={Zap} variant="orange" />
        
        {/* Radar Smart Interativo */}
        <button 
          onClick={() => setRadarOn(!radarOn)}
          className={`bg-white dark:bg-slate-800 p-4 rounded-2xl border transition-all flex items-center gap-3 ${
              radarOn 
              ? 'border-emerald-200 dark:border-emerald-800 hover:shadow-md' 
              : 'border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className={`p-2 rounded-xl ${radarOn ? 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' : 'text-slate-400 bg-slate-100 dark:bg-slate-700'}`}>
              <Activity size={20} className={radarOn ? "animate-pulse" : ""} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Radar Smart</p>
            <p className={`text-xl lg:text-2xl font-black leading-none ${radarOn ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              {radarOn ? 'ON' : 'OFF'}
            </p>
          </div>
        </button>
      </StatsGrid>

      {/* CALCULADORA DE CUSTOS */}
      <button
        onClick={() => navigate('/calculadora-de-custos')}
        className="w-full bg-white dark:bg-slate-900 p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4 hover:shadow-md hover:border-orange-200 dark:hover:border-orange-800 transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl text-orange-500 bg-orange-50 dark:bg-orange-900/20">
            <Calculator size={20} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-tight">Calculadora de Custos</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none mt-0.5">
              Simule custos e precifique seu frete
            </p>
          </div>
        </div>
        <ChevronRight size={18} className="text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all shrink-0" />
      </button>

      {/* BUSCA E FILTROS */}
      <div className="bg-white dark:bg-slate-900 p-5 lg:p-7 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 dark:border-slate-800 relative z-20">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" size={22} />
            <input 
              type="text" 
              placeholder="Origem, destino ou produto..."
              className="w-full bg-slate-50 dark:bg-slate-800 border-none h-16 pl-14 pr-14 rounded-2xl text-slate-700 dark:text-slate-200 font-bold focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => setViewMode(v => v === 'grid' ? 'table' : 'grid')}
            variant="secondary"
            size="icon"
            className="hidden md:flex w-16 h-16 rounded-2xl"
          >
            {viewMode === 'grid' ? <Table2 size={24} /> : <LayoutGrid size={24} />}
          </Button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar pt-2">
          <TabButton active={filter === 'all'} onClick={() => setFilter('all')} icon={<List size={16}/>} label="Cargas" />
          <TabButton active={filter === 'invitations'} onClick={() => setFilter('invitations')} icon={<Zap size={16}/>} label="Convites" color="orange" count={invitations.filter((i: any) => i.status === 'pending').length} />
          <TabButton active={filter === 'favs'} onClick={() => setFilter('favs')} icon={<Heart size={16}/>} label="Favoritos" color="red" />
        </div>
      </div>

      {/* LISTA DE RESULTADOS */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center">
          <Activity className="animate-spin text-orange-500 mb-4" size={40} />
          <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic">Sincronizando...</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' && filter !== 'invitations' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6" : "flex flex-col gap-4"}>
          
          {filter === 'invitations' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 lg:px-6 py-3.5 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
                  Convites ({filteredFreights.length})
                </h3>
              </div>
              <div className="px-4 lg:px-6 py-2 border-b border-slate-100 dark:border-slate-700 flex gap-1">
                {[
                  { key: 'all' as const, label: 'Todos', count: filteredFreights.length },
                  { key: 'pending' as const, label: 'Pendentes', count: filteredFreights.filter((i: any) => i.status === 'pending').length },
                  { key: 'accepted' as const, label: 'Aceitos', count: filteredFreights.filter((i: any) => i.status === 'accepted').length },
                  { key: 'history' as const, label: 'Recusados/Cancelados', count: filteredFreights.filter((i: any) => i.status === 'declined' || i.status === 'cancelled').length },
                ].map((sub) => (
                  <button
                    key={sub.key}
                    onClick={() => setInvitationSubFilter(sub.key)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      invitationSubFilter === sub.key
                        ? 'bg-orange-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {sub.label} ({sub.count})
                  </button>
                ))}
              </div>
              {filteredFreights.length === 0 ? (
                <div className="px-4 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">Nenhum convite recebido</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Rota</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase w-[1%] whitespace-nowrap">Empresa</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase w-[1%] whitespace-nowrap">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase w-[1%] whitespace-nowrap">Data</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase w-[1%] whitespace-nowrap">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {filteredFreights
                        .filter((inv: any) => {
                          if (invitationSubFilter === 'pending') return inv.status === 'pending';
                          if (invitationSubFilter === 'accepted') return inv.status === 'accepted';
                          if (invitationSubFilter === 'history') return inv.status === 'declined' || inv.status === 'cancelled';
                          return true;
                        })
                        .map((inv: any) => (
                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3">
                            <div className="text-sm font-bold text-slate-800 dark:text-white whitespace-nowrap">
                              {inv.origin_city}-{inv.origin_state} <span className="text-orange-500 mx-0.5">→</span> {inv.dest_city}-{inv.dest_state}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-px">{inv.product || 'Carga Geral'}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{inv.company_name || '—'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              inv.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              inv.status === 'declined' ? 'bg-red-100 text-red-700' :
                              inv.status === 'cancelled' ? 'bg-slate-100 text-slate-500' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {inv.status === 'accepted' ? 'Aceito' :
                               inv.status === 'declined' ? 'Recusado' :
                               inv.status === 'cancelled' ? 'Cancelado' :
                               'Pendente'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                            {inv.created_at ? new Date(inv.created_at).toLocaleString('pt-BR') : ''}
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            {inv.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button onClick={() => handleRespondInvitation(inv.id, 'accepted')}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-emerald-500 text-white hover:bg-emerald-600 transition-all">
                                  <Check size={10} /> Aceitar
                                </button>
                                <button onClick={() => handleRespondInvitation(inv.id, 'declined')}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-red-500 text-white hover:bg-red-600 transition-all">
                                  <X size={10} /> Recusar
                                </button>
                              </div>
                            ) : inv.status === 'accepted' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <span className="text-[10px] font-bold uppercase text-emerald-600 mr-1">✓ Aceito</span>
                                <button onClick={() => handleCancelAcceptedMatch(inv.id)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-red-500 text-white hover:bg-red-600 transition-all">
                                  <X size={10} /> Cancelar
                                </button>
                              </div>
                            ) : (
                              <span className={`text-[10px] font-bold uppercase ${
                                inv.status === 'cancelled' ? 'text-slate-500' : 'text-red-500'
                              }`}>{inv.status === 'cancelled' ? '✗ Cancelado' : '✗ Recusado'}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {filter !== 'invitations' && viewMode === 'table' && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {filteredFreights.length > 0 && (
                <>
                  <div className="px-4 lg:px-6 py-3.5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3">
                    <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
                      Cargas ({filteredFreights.length})
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Mostrar</span>
                      <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                        className="px-2 py-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300">
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Rota</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Produto</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase w-[1%] whitespace-nowrap">Empresa</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase w-[1%] whitespace-nowrap hidden md:table-cell">Peso</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase w-[1%] whitespace-nowrap hidden lg:table-cell">Tipo</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase w-[1%] whitespace-nowrap hidden lg:table-cell">Distância</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase w-[1%] whitespace-nowrap">Valor</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase w-[1%] whitespace-nowrap">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {paginatedFreights.map((f: any) => (
                          <tr key={`${filter}-${f.id}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="px-4 py-3">
                              <div className="text-sm font-bold text-slate-800 dark:text-white whitespace-nowrap">
                                {f.origin_city}/{f.origin_state || ''} <span className="text-orange-500 mx-0.5">→</span> {f.dest_city}/{f.dest_state || ''}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{f.product || 'Carga Geral'}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{f.company_name || f.user_name || '—'}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                              <span className="text-sm text-slate-600 dark:text-slate-400">{f.weight ? `${Number(f.weight).toLocaleString('pt-BR')} kg` : '—'}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                              <span className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500 uppercase">{f.cargo_type_name || (f.cargo_type_id ? 'Geral' : '—')}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                              <span className="text-sm text-slate-600 dark:text-slate-400">{f.distance_km ? `${Number(f.distance_km).toLocaleString('pt-BR')} km` : '—'}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                {(() => { const n = parseFloat(String(f.price)); return isNaN(n) || n <= 0 ? 'A Combinar' : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); })()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {(() => {
                                  const invStatus = f.invitation_status;
                                  const invBy = f.invitation_invited_by;
                                  if (!invStatus) {
                                    return (
                                      <button onClick={() => handleInterest(f.freight_id || f.id)}
                                        disabled={interestLoadingId === (f.freight_id || f.id)}
                                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-orange-500 text-white hover:bg-orange-600 transition-all disabled:opacity-50">
                                        {interestLoadingId === (f.freight_id || f.id) ? '...' : 'Quero Frete'}
                                      </button>
                                    );
                                  }
                                  if (invStatus === 'pending' && invBy === 'driver') {
                                    return <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-blue-100 text-blue-700 cursor-default">Interesse Registrado</span>;
                                  }
                                  if (invStatus === 'pending') {
                                    return <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-yellow-100 text-yellow-700 cursor-default">Convite Pendente</span>;
                                  }
                                  if (invStatus === 'accepted') {
                                    return <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-green-100 text-green-700 cursor-default">Aceito</span>;
                                  }
                                  return <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-slate-100 text-slate-400 cursor-default">{invStatus === 'declined' ? 'Recusado' : 'Cancelado'}</span>;
                                })()}
                                <button onClick={() => setSelectedFreight(f)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-all">
                                  <Eye size={10} /> Ver
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {totalPages > 1 && (
                    <div className="px-4 lg:px-6 py-3.5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredFreights.length)} de {filteredFreights.length}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">
                          <ChevronLeft size={16} className="text-slate-600 dark:text-slate-300" />
                        </button>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{currentPage} / {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed">
                          <ChevronRight size={16} className="text-slate-600 dark:text-slate-300" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
              {filteredFreights.length === 0 && (
                <div className="px-4 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">Nenhuma carga encontrada</div>
              )}
            </div>
          )}

          {filter !== 'invitations' && !(viewMode === 'table') && filteredFreights.map((f: any) => (
            <div key={`${filter}-${f.id}`}>
              <FreightCard data={f} aba={filter} onToggle={loadData} />
            </div>
          ))}

          {!loading && filteredFreights.length === 0 && (
            <div className="col-span-full py-24 bg-white dark:bg-slate-900 rounded-[3rem] text-center border-2 border-dashed border-slate-100 dark:border-slate-800">
               <Truck size={40} className="mx-auto text-slate-200 mb-4" />
               <p className="text-slate-400 font-black uppercase text-xs tracking-widest px-10">Nada por aqui no momento.</p>
               {radarOn && filter === 'all' && (
                  <p className="text-[9px] text-orange-500 font-bold mt-2">
                    DICA: O RADAR SMART ESTÁ ATIVO. <br/>
                    SÓ APARECEM CARGAS COMPATÍVEIS COM SEU VEÍCULO.
                  </p>
                )}
            </div>
          )}
        </div>
      )}

      {/* MODAL DETALHES */}
      {selectedFreight && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="relative w-full max-w-xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedFreight(null)} 
              className="absolute -top-12 right-0 bg-white p-2 rounded-full shadow-lg hover:rotate-90 transition-all"
            >
              <X size={20} />
            </button>
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl">
              <FreightCard data={selectedFreight} aba="details" onToggle={() => { loadData(); setSelectedFreight(null); }} />
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function TabButton({ active, onClick, icon, label, color = "orange", count }: any) {
  const activeStyles: any = {
    orange: "bg-orange-500 text-white shadow-orange-100",
    red: "bg-red-500 text-white shadow-red-100",
    blue: "bg-blue-600 text-white shadow-blue-100",
  };
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shrink-0 border ${
        active 
        ? `${activeStyles[color]} border-transparent shadow-lg -translate-y-0.5` 
        : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 hover:bg-slate-50'
      }`}
    >
      {icon} {label}
      {count !== undefined && count > 0 && (
        <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
          {count}
        </span>
      )}
    </button>
  );
}
