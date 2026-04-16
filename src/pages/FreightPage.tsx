import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Zap, Globe, X, ArrowRight, Users, Building2, Truck, Loader2, SlidersHorizontal } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import { getStates } from '../services/location';
import { useTracker } from '../services/useTracker';

// Componentes
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import FreightCard from '../components/shared/FreightCard';
import AdCarousel from '../components/shared/AdCarousel';
import AdCard from '../components/shared/AdCard';
import { BusinessModal } from "../components/modals/BusinessModal";
import { VEHICLE_TYPES, BODY_TYPES } from '../constants/freightOptions';

interface FreightItem {
  id: number;
  product: string;
  origin_city: string;
  origin_state: string;
  dest_city: string;
  dest_state: string;
  price: number;
  vehicle_type: string;
  body_type: string;
  weight: string;
  created_at: string;
  slug: string;
}

export default function FreightPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estados da Listagem
  const [filteredFreights, setFilteredFreights] = useState<FreightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Busca
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  
  // Filtros
  const [selectedState, setSelectedState] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedBody, setSelectedBody] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // Lista de estados
  const [states, setStates] = useState<{ sigla: string; nome: string }[]>([]);

  // Estados do Modal
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);

  // Carregar estados
  useEffect(() => {
    const loadStates = async () => {
      const statesData = await getStates();
      setStates(statesData);
    };
    loadStates();
  }, []);

  const hasActiveFilters = selectedState || selectedVehicle || selectedBody || minPrice || maxPrice;

  const clearFilters = () => {
    setSelectedState('');
    setSelectedVehicle('');
    setSelectedBody('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
    fetchItems(searchTerm, 1, true);
  };

  /**
   * Função de Busca Principal
   */
  const fetchItems = useCallback(async (currentSearch: string, currentPage: number, isNewSearch: boolean) => {
    try {
      if (isNewSearch) setLoading(true);
      else setLoadingMore(true);

      const params: Record<string, unknown> = { 
        search: currentSearch || undefined,
        page: currentPage,
        perPage: 15
      };
      
      if (selectedState) params['origin_state'] = selectedState;
      if (selectedVehicle) params['vehicle_type'] = selectedVehicle;
      if (selectedBody) params['body_type'] = selectedBody;
      if (minPrice) params['min_price'] = parseFloat(minPrice);
      if (maxPrice) params['max_price'] = parseFloat(maxPrice);

      const response = await api.get('/freights', { params });

      if (response.data.success) {
        const newData = response.data.data;
        setFilteredFreights(prev => isNewSearch ? newData : [...prev, ...newData]);
        setHasMore(newData.length >= 15);
      }
    } catch (error) {
      console.error("❌ Erro na API:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedState, selectedVehicle, selectedBody, minPrice, maxPrice]);

  // Efeito para Busca (com Debounce)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      fetchItems(searchTerm, 1, true);
      
      if (searchTerm) setSearchParams({ search: searchTerm });
      else setSearchParams({});
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchItems, setSearchParams]);

  /**
   * Observer para Paginação Infinita
   */
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => {
          const nextPage = prevPage + 1;
          fetchItems(searchTerm, nextPage, false);
          return nextPage;
        });
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, searchTerm, fetchItems]);

   // Tracking de Visualização
   const trackedItems = useRef(new Set());
   const { trackEvent } = useTracker();
   
   const handleViewTracking = useCallback((id: number | string, type: string) => {
     const key = `${type}-${id}`;
     if (!trackedItems.current.has(key)) {
       trackedItems.current.add(key);
       trackEvent(id, type as 'FREIGHT' | 'AD' | 'GROUP' | 'LISTING', 'VIEW');
     }
   }, [trackEvent]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      <Header />
      
      <main className="flex-grow pt-32">
        <div className="max-w-7xl mx-auto px-4">
          
          <header className="mb-10">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-[0.85] mb-8">
              Portal de <span className="text-blue-600">Cargas</span>
            </h1>

            <div className="relative group">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-blue-600" size={28} />
              <input 
                id="search-freight" 
                name="search-freight"
                type="text" 
                placeholder="O que você busca? (ex: Frutas, Curitiba, SC, Carreta...)" 
                className="w-full bg-white dark:bg-slate-900 border-4 border-transparent dark:border-slate-800 shadow-2xl rounded-[3rem] pl-20 pr-16 py-6 text-lg font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-blue-100 dark:focus:border-blue-900/30 placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-all" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-32 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-red-500 transition-colors">
                  <X size={24} />
                </button>
              )}
            </div>
            
            {/* Filtros */}
            <div className="flex items-center gap-4 mt-6 mb-8">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-3 rounded-xl font-bold text-sm uppercase flex items-center gap-2 transition-all ${
                  showFilters || hasActiveFilters
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <SlidersHorizontal size={18} />
                Filtros
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <X size={14} /> Limpar filtros
                </button>
              )}
            </div>

            {/* Painel de Filtros */}
            {showFilters && (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Estado */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Estado Origem</label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl outline-none font-bold text-sm text-slate-800 dark:text-slate-100 appearance-none"
                    >
                      <option value="">Todos</option>
                      {states.map((state) => (
                        <option key={state.sigla} value={state.sigla}>{state.nome} ({state.sigla})</option>
                      ))}
                    </select>
                  </div>

                  {/* Tipo Veículo */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Tipo Veículo</label>
                    <select
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl outline-none font-bold text-sm text-slate-800 dark:text-slate-100 appearance-none"
                    >
                      <option value="">Todos</option>
                      {VEHICLE_TYPES.map((v) => (
                        <option key={v.value} value={v.value}>{v.value}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tipo Carroceria */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Carroceria</label>
                    <select
                      value={selectedBody}
                      onChange={(e) => setSelectedBody(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl outline-none font-bold text-sm text-slate-800 dark:text-slate-100 appearance-none"
                    >
                      <option value="">Todas</option>
                      {BODY_TYPES.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Preço Mín */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Preço Mín.</label>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="R$ 0"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl outline-none font-bold text-sm text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {/* Preço Máx */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Preço Máx.</label>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="R$ 999999"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl outline-none font-bold text-sm text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <button
                  onClick={() => { setPage(1); fetchItems(searchTerm, 1, true); }}
                  className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm uppercase hover:bg-blue-700 transition-all"
                >
                  Aplicar Filtros
                </button>
              </div>
            )}
          </header>

          {/* SECTION DO CARROSSEL */}
          <section className="mb-10 relative">
            <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-white dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
              <AdCarousel searchTerm={searchTerm} />
            </div>
          </section>

          <section className="pb-24">
            {loading && page === 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => <div key={i} className="h-[420px] bg-white dark:bg-slate-800 rounded-2xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                
                {/* CARD COMUNIDADE */}
                <div onClick={() => navigate('/comunidade')} className="group cursor-pointer bg-blue-600 rounded-[2rem] p-8 text-white flex flex-col justify-between h-[420px] relative overflow-hidden shadow-xl hover:translate-y-[-4px] transition-all">
                  <Users className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform duration-700" size={180} />
                  <div className="relative z-10">
                    <div className="bg-white/20 w-fit p-3 rounded-xl mb-4 backdrop-blur-xl border border-white/10"><Users size={24} /></div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-[0.9] mb-2">Grupos de <br/><span className="text-blue-200">WhatsApp</span></h3>
                    <p className="text-blue-100 text-[10px] font-bold italic uppercase tracking-wider">Cargas em tempo real.</p>
                  </div>
                  <button className="w-full bg-white text-blue-600 py-4 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-blue-50 transition-all shadow-lg relative z-10">
                    Ver Grupos <ArrowRight size={16} />
                  </button>
                </div>

                {filteredFreights.length > 0 ? (
                  <>
                    {filteredFreights.map((item, index) => (
                      <React.Fragment key={`${item.id}-${index}`}>
                        <FreightCard data={item} onView={() => handleViewTracking(item.id, 'freight')} />
                        {index === 3 && (
                          <div 
                            onClick={() => setIsBusinessModalOpen(true)} 
                            className="group cursor-pointer bg-slate-900 dark:bg-slate-800 rounded-[2rem] p-8 text-white flex flex-col justify-between h-[420px] relative overflow-hidden shadow-xl hover:translate-y-[-4px] transition-all border border-slate-700"
                          >
                            <Building2 className="absolute -right-4 -bottom-4 text-amber-500/10 group-hover:scale-110 transition-transform duration-700" size={180} />
                            <div className="relative z-10">
                              <div className="bg-amber-500 w-fit p-3 rounded-xl mb-4"><Zap size={24} className="text-slate-900" /></div>
                              <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-[0.9] mb-2 text-amber-500">
                                Anuncie <br/><span className="text-white">Sua Empresa</span>
                              </h3>
                              <p className="text-slate-400 text-[10px] font-bold italic uppercase tracking-wider">Destaque sua marca no portal.</p>
                            </div>
                            <button className="w-full bg-amber-500 text-slate-900 py-4 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-3 hover:bg-white transition-all shadow-xl relative z-10">
                              Quero Anunciar <ArrowRight size={16} />
                            </button>
                          </div>
                        )}
                        {index >= 4 && (index + 1) % 8 === 0 && (
                          <div className="h-[420px]">
                            <AdCard position="infeed" variant="vertical" search={searchTerm} city={item.origin_city} />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                    {hasMore && (
                      <div ref={lastElementRef} className="col-span-full flex justify-center py-12">
                        <Loader2 className="text-blue-600 animate-spin" size={40} />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                    <Truck size={48} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-lg mb-4">Nenhum resultado para "{searchTerm}"</p>
                    <button onClick={() => setSearchTerm("")} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all">Limpar Filtros</button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <BusinessModal 
        isOpen={isBusinessModalOpen} 
        onClose={() => setIsBusinessModalOpen(false)} 
        initialSubject="Interesse em anunciar no Portal de Cargas"
      />
      
      <Footer />
    </div>
  );
}
