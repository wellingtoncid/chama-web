import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { api } from '../../api/api';
import FreightCard from '../../components/shared/FreightCard';
import { Search, Heart, List, History, Activity, Truck, X, Zap, PhoneCall, ChevronRight } from 'lucide-react';

interface DriverViewProps {
  user?: any;
  forceTab?: string;
}

export default function DriverView({ forceTab }: DriverViewProps) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [allFreights, setAllFreights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFreight, setSelectedFreight] = useState<any>(null);

  const userData = localStorage.getItem('@ChamaFrete:user');
  const user = userData ? JSON.parse(userData) : { id: 0 };

  useEffect(() => {
    if (forceTab) setFilter(forceTab);
  }, [forceTab]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = 'freights';
      let params: any = { user_id: user.id };

      if (filter === 'favs') endpoint = 'my-favorites';
      else if (filter === 'history') endpoint = 'admin-click-logs';

      const res = await api.get('', { params: { endpoint, ...params } });
      const data = Array.isArray(res.data) ? res.data : [];
      
      const processedData = data.map(item => ({
        ...item,
        // Garante o ID correto independente da origem (clique ou frete direto)
        id: item.freight_id || item.id,
        is_favorite: filter === 'favs' ? true : !!item.is_favorite
      }));

      setAllFreights(processedData);
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
      setAllFreights([]);
    } finally {
      setLoading(false);
    }
  }, [filter, user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredFreights = useMemo(() => {
    const normalize = (t: string) => t?.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || "";
    const words = normalize(search).trim().split(/\s+/);
    if (!search.trim()) return allFreights;

    return allFreights.filter(f => {
      const base = normalize(`${f.origin_city} ${f.dest_city} ${f.product} ${f.company_name} ${f.vehicleType}`);
      return words.every(w => base.includes(w));
    });
  }, [search, allFreights]);

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. KPIS DE RESUMO */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <StatCard label="Disponíveis" value={filter === 'all' ? filteredFreights.length : '-'} icon={<List size={18}/>} color="orange" />
        <StatCard label="Favoritos" value={filter === 'favs' ? filteredFreights.length : '-'} icon={<Heart size={18}/>} color="red" />
        <StatCard label="Histórico" value={filter === 'history' ? filteredFreights.length : '-'} icon={<PhoneCall size={18}/>} color="blue" />
        <StatCard label="Radar Smart" value="ON" icon={<Zap size={18}/>} color="green" />
      </div>

      {/* 2. AREA DE BUSCA E FILTROS */}
      <div className="bg-white p-5 lg:p-7 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 relative z-20">
        <div className="relative mb-6">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500" size={22} />
          <input 
            type="text" 
            placeholder="Filtrar nesta lista..."
            className="w-full bg-slate-50 border-none h-16 pl-14 pr-14 rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-orange-500 transition-all shadow-inner outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-orange-500">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar pt-2">
          <TabButton active={filter === 'all'} onClick={() => setFilter('all')} icon={<List size={16}/>} label="Cargas" count={filter === 'all' ? filteredFreights.length : null} />
          <TabButton active={filter === 'favs'} onClick={() => setFilter('favs')} icon={<Heart size={16}/>} label="Favoritos" color="red" count={filter === 'favs' ? filteredFreights.length : null} />
          <TabButton active={filter === 'history'} onClick={() => setFilter('history')} icon={<History size={16}/>} label="Histórico" color="blue" count={filter === 'history' ? filteredFreights.length : null} />
        </div>
      </div>

      {/* 3. FEED DE RESULTADOS (LISTA OU CARD) */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center">
          <Activity className="animate-spin text-orange-500 mb-4" size={40} />
          <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic text-center">Sincronizando dados...</p>
        </div>
      ) : (
        <div className={filter === 'history' ? "flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500"}>
          {filteredFreights.map((f: any) => {
            // RENDERIZAÇÃO EM FORMATO DE LISTA PARA O HISTÓRICO
            if (filter === 'history') {
              return (
                <div 
                  key={`hist-${f.id}`} 
                  className="bg-white p-4 rounded-[1.8rem] border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer border-l-4 border-l-blue-500"
                  onClick={() => setSelectedFreight(f)} 
                >
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex flex-col items-center justify-center shrink-0 border border-blue-100">
                    <span className="text-sm font-black leading-none">{f.total_my_contacts || 1}</span>
                    <span className="text-[6px] font-black uppercase tracking-tighter">Cliques</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                       <span className="text-[9px] font-black text-slate-400 uppercase truncate">
                         {f.company_name || 'Particular'}
                       </span>
                       <span className="text-[8px] font-bold text-blue-400 ml-auto">
                         {f.last_contact_at ? new Date(f.last_contact_at).toLocaleDateString('pt-BR') : 'Recentemente'}
                       </span>
                    </div>
                    <h4 className="text-[13px] font-black text-slate-800 uppercase truncate flex items-center gap-1">
                      {f.origin_city} <ChevronRight size={12} className="text-slate-300" /> {f.dest_city}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-500 italic truncate">{f.product}</p>
                  </div>

                  <div className="shrink-0 text-right pr-2">
                    <p className="text-[11px] font-black text-green-600">
                      {parseFloat(f.price) > 0 
                        ? parseFloat(f.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
                        : 'A COMBINAR'}
                    </p>
                    <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Toque para ver</p>
                  </div>
                </div>
              );
            }

            // RENDERIZAÇÃO EM FORMATO CARD (PADRÃO E FAVORITOS)
            return (
              <div key={`${filter}-${f.id}`} className="relative">
                {f.status === 'CLOSED' && (
                  <div className="absolute top-4 right-4 z-30 bg-white/90 backdrop-blur-sm text-red-600 px-3 py-1 rounded-full text-[8px] font-black uppercase border border-red-100 shadow-sm">
                    Carga Finalizada
                  </div>
                )}
                <FreightCard 
                  data={f} 
                  aba={filter} 
                  onToggle={loadData}
                  disabled={f.status === 'CLOSED'} 
                />
              </div>
            );
          })}

          {filteredFreights.length === 0 && (
            <div className="col-span-full py-24 bg-white rounded-[3rem] text-center border-2 border-dashed border-slate-100">
               <Truck size={40} className="mx-auto text-slate-200 mb-4" />
               <p className="text-slate-400 font-black uppercase text-xs tracking-widest px-10">Nenhuma carga encontrada aqui.</p>
               <button onClick={() => setSearch('')} className="mt-4 text-orange-500 font-bold text-[10px] uppercase">Limpar Filtros</button>
            </div>
          )}
        </div>
      )}
      {/* Modal de Detalhes para o Histórico */}
      {selectedFreight && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg">
            <button 
              onClick={() => setSelectedFreight(null)}
              className="absolute -top-12 right-0 bg-white p-2 rounded-full text-slate-900 shadow-lg"
            >
              <X size={20} />
            </button>
            
            {/* Reutilizamos o FreightCard em modo modal */}
            <FreightCard 
              data={selectedFreight} 
              aba="history" 
              onToggle={() => {
                loadData();
                setSelectedFreight(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// COMPONENTES AUXILIARES
function StatCard({ label, value, icon, color }: any) {
  const colors: any = {
    red: "text-red-500 bg-red-50",
    blue: "text-blue-500 bg-blue-50",
    green: "text-green-500 bg-green-50",
    orange: "text-orange-500 bg-orange-50",
  };
  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-50 shadow-sm flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-[8px] font-black uppercase text-slate-400 tracking-tight">{label}</p>
        <p className="text-lg font-black text-slate-800 leading-none">{value}</p>
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
        : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
      }`}
    >
      {icon} 
      {label}
      {count !== null && (
        <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
          {count}
        </span>
      )}
    </button>
  );
}