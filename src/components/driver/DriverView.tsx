import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '../../api/api';
import FreightCard from '../../components/shared/FreightCard';
import FreightRow from '../../components/shared/FreightRow';
import { 
  Search, Heart, List, History, Activity, Truck, X, 
  Zap, ChevronRight, BellRing, Check, ShieldCheck, LayoutGrid,
  Box
} from 'lucide-react';

interface DriverViewProps {
  forceTab?: string;
}

export default function DriverView({ forceTab }: DriverViewProps) {
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); // Alternador de visual
  const [search, setSearch] = useState('');
  const [allFreights, setAllFreights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFreight, setSelectedFreight] = useState<any>(null);
  const [radarOn, setRadarOn] = useState(true); // Estado para o Radar
  const [stats, setStats] = useState({ total_open: 0, total_favs: 0, total_invitations: 0 });
  
  const [invitations, setInvitations] = useState<any[]>([]);
  const [activeFreight, setActiveFreight] = useState<any>(null);

  // Recuperação segura do usuário
  const user = useMemo(() => {
    const userData = localStorage.getItem('@ChamaFrete:user');
    if (!userData) return { id: 0, name: 'Motorista' };

    const parsed = JSON.parse(userData);

    const extras = parsed.extended_attributes 
      ? (typeof parsed.extended_attributes === 'string' 
          ? JSON.parse(parsed.extended_attributes) 
          : parsed.extended_attributes) 
      : {};

    return { 
      ...parsed, 
      ...extras,
      display_name: parsed.name || parsed.full_name || extras.name || 'Motorista',
      vehicle_type: parsed.vehicle_type || extras.vehicle_type || null,
      body_type: parsed.body_type || extras.body_type || null 
    };
  }, []);

  useEffect(() => {
    if (forceTab) setFilter(forceTab);
  }, [forceTab]);

  // 1. Carrega dados operacionais (Convites e Frete Ativo)
  const loadOperationalData = useCallback(async () => {
    if (!user.id) return;
    try {
      const [resInv, resActive] = await Promise.all([
        api.get('user-alerts', { 
          params: { user_id: user.id, type: 'INVITATION', status: 'unread' } 
        }),
        api.get('my-active-freight', { 
          params: { user_id: user.id } 
        })
      ]);

      setInvitations(resInv.data.success ? resInv.data.data : []);
      
      // Correção "Carga Fantasma": Só ativa se houver dados reais e um ID
      const activeData = resActive.data.success ? resActive.data.data : resActive.data;
      setActiveFreight(activeData?.id ? activeData : null);
    } catch (e) {
      console.error("Erro operacional:", e);
    }
  }, [user.id]);

  // 2. Carrega a lista de fretes principal
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
      else if (filter === 'history') {
        route = 'admin-click-logs';
        params = { user_id: user.id };
      } 
      else if (filter === 'invitations') {
        route = 'user-alerts';
        params = { user_id: user.id, type: 'INVITATION' };
      }

      // Chamada paralela otimizada
      const [resData, resStats] = await Promise.all([
        api.get(route, { params }),
        api.get('driver-stats', { params: { user_id: user.id } })
      ]);

      // 1. Extração Ultra Segura
      const responseContent = resData.data;
      let finalArray = [];

      if (responseContent.success && Array.isArray(responseContent.data)) {
        // Formato do Radar Smart ou Resposta padrão com .data
        finalArray = responseContent.data;
      } else if (Array.isArray(responseContent)) {
        // Formato array simples
        finalArray = responseContent;
      } else if (responseContent.data && Array.isArray(responseContent.data.data)) {
        // Formato do listPaginated (data.data)
        finalArray = responseContent.data.data;
      }

      // 2. Atualiza Stats
      if (resStats.data) {
        setStats(resStats.data.data || resStats.data);
      }
      
      // 3. Normalização usando o finalArray (O ERRO ESTAVA AQUI, USANDO RAWDATA)
      const processedData = finalArray.map((item: any) => ({
        ...item,
        id: item.freight_id || item.target_id || item.id,
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

  // 3. Filtro visual inteligente
  const filteredFreights = useMemo(() => {
    if (!search.trim()) return allFreights;
    const normalize = (t: any) => t?.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || "";
    const searchWords = normalize(search).split(/\s+/);

    return allFreights.filter(f => {
      const content = normalize(`${f.origin_city} ${f.dest_city} ${f.product} ${f.company_name} ${f.vehicle_type} ${f.body_type}`);
      return searchWords.every((word: any) => content.includes(word));
    });
  }, [search, allFreights]);

  const handleRespondInvitation = async (alertId: number, action: 'accept' | 'decline') => {
    try {
      await api.post('/respond-invitation', { alert_id: alertId, action }, { params: { endpoint: 'respond-invitation' } });
      loadData();
    } catch (e) {
      alert("Erro ao responder convite.");
    }
  };

  return (
    <div className="space-y-6 pb-20">

      {/* NOVO: HEADER DE IDENTIFICAÇÃO (Para você ver se os dados entraram) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div>
          <h1 className="text-3xl font-black uppercase italic dark:text-white leading-none">
            Olá, <span className="text-orange-500">{user.display_name.split(' ')[0]}</span>
          </h1>
          <div className="flex flex-wrap gap-2 mt-3">
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
        </div>
        
        {/* Radar Status Badge */}
        <div className="hidden md:block text-right">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status do Radar</p>
          <div className={`text-[10px] font-black uppercase italic ${radarOn ? 'text-emerald-500' : 'text-slate-300'}`}>
            {radarOn ? 'Rastreando cargas compatíveis' : 'Radar desligado'}
          </div>
        </div>
      </div>
      
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
            <button className="bg-emerald-500 hover:bg-emerald-600 px-8 py-4 rounded-2xl font-black uppercase italic text-xs transition-all shadow-lg shadow-emerald-500/20">
              Finalizar Entrega
            </button>
          </div>
        </div>
      )}

      {/* BANNER DE CONVITES (APENAS NOTIFICAÇÃO) */}
      {filter === 'all' && invitations.length > 0 && (
        <div className="bg-orange-500 text-white p-5 rounded-[2rem] flex items-center justify-between shadow-lg shadow-orange-500/20">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-xl animate-bounce">
              <BellRing size={20} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase italic leading-none">Você tem {invitations.length} convite(s)!</p>
              <p className="text-[9px] font-bold opacity-80 uppercase mt-1">Empresas aguardando sua resposta</p>
            </div>
          </div>
          <button onClick={() => setFilter('invitations')} className="bg-white text-orange-500 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-transform">
            Ver Agora
          </button>
        </div>
      )}

      {/* KPIS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <StatCard label="Disponíveis" value={stats.total_open} icon={<List size={18}/>} color="orange" />
        <StatCard label="Favoritos" value={stats.total_favs} icon={<Heart size={18}/>} color="red" />
        <StatCard label="Convites" value={invitations.length} icon={<Zap size={18}/>} color="orange" />
        
        {/* Radar Smart Interativo */}
        <button 
          onClick={() => setRadarOn(!radarOn)}
          className={`p-4 rounded-3xl border transition-all flex items-center gap-3 ${
              radarOn 
              ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20' 
              : 'bg-slate-50 border-slate-100 dark:bg-slate-800'
          }`}
        >
          <div className={`p-2.5 rounded-xl ${radarOn ? 'text-emerald-500 bg-white' : 'text-slate-400 bg-white'}`}>
              <Activity size={18} className={radarOn ? "animate-pulse" : ""} />
          </div>
          <div className="text-left">
            <p className="text-[8px] font-black uppercase text-slate-400 tracking-tight">Radar Smart</p>
            <p className={`text-lg font-black leading-none ${radarOn ? 'text-emerald-600' : 'text-slate-400'}`}>
              {radarOn ? 'ON' : 'OFF'}
            </p>
          </div>
        </button>
      </div>

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
          {/* Botão de Alternar Visual (Grid/List) */}
          <button 
            onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
            className="hidden md:flex items-center justify-center bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-2xl text-slate-400 hover:text-orange-500 transition-colors"
          >
            {viewMode === 'grid' ? <List size={24} /> : <LayoutGrid size={24} />}
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar pt-2">
          <TabButton active={filter === 'all'} onClick={() => setFilter('all')} icon={<List size={16}/>} label="Cargas" />
          <TabButton active={filter === 'invitations'} onClick={() => setFilter('invitations')} icon={<Zap size={16}/>} label="Convites" color="orange" count={invitations.length} />
          <TabButton active={filter === 'favs'} onClick={() => setFilter('favs')} icon={<Heart size={16}/>} label="Favoritos" color="red" />
          <TabButton active={filter === 'history'} onClick={() => setFilter('history')} icon={<History size={16}/>} label="Histórico" color="blue" />
        </div>
      </div>

      {/* LISTA DE RESULTADOS */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center">
          <Activity className="animate-spin text-orange-500 mb-4" size={40} />
          <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic">Sincronizando...</p>
        </div>
      ) : (
        <div className={viewMode === 'list' || filter === 'history' || filter === 'invitations' ? "flex flex-col gap-4" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"}>
          
          {filter === 'invitations' && filteredFreights.map((inv: any) => (
            <div key={inv.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-6 hover:shadow-lg transition-all">
              <div className="bg-orange-50 p-4 rounded-2xl text-orange-500"><BellRing /></div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-slate-600 dark:text-slate-300 font-bold italic text-sm">"{inv.message}"</p>
                <p className="text-[10px] font-black text-slate-300 uppercase mt-1">{new Date(inv.created_at).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button onClick={() => handleRespondInvitation(inv.id, 'accept')} className="flex-1 bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase italic text-[10px] flex items-center justify-center gap-2">
                  <Check size={14} /> Aceitar
                </button>
                <button onClick={() => handleRespondInvitation(inv.id, 'decline')} className="px-6 py-3 rounded-xl font-black uppercase italic text-[10px] text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                  Recusar
                </button>
              </div>
            </div>
          ))}

          {filter !== 'invitations' && filteredFreights.map((f: any) => (
            <div key={`${filter}-${f.id}`}>
               {viewMode === 'list' || filter === 'history' ? (
                 <FreightRow 
                    data={f} 
                    onClick={() => setSelectedFreight(f)} 
                 />
               ) : (
                 <FreightCard data={f} aba={filter} onToggle={loadData} />
               )}
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

      {/* MODAL DETALHES (Agora no Painel) */}
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
    </div>
  );
}

// COMPONENTES AUXILIARES MANTIDOS
function StatCard({ label, value, icon, color }: any) {
  const colors: any = {
    red: "text-red-500 bg-red-50 dark:bg-red-900/20",
    blue: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
    green: "text-green-500 bg-green-50 dark:bg-green-900/20",
    orange: "text-orange-500 bg-orange-50 dark:bg-orange-900/20",
  };
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-50 dark:border-slate-800 shadow-sm flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-[8px] font-black uppercase text-slate-400 tracking-tight">{label}</p>
        <p className="text-lg font-black text-slate-800 dark:text-slate-100 leading-none">{value ?? 0}</p>
      </div>
    </div>
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