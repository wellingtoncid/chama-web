import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Zap, Globe, X, ArrowRight, Users, Building2, CheckCircle2, Truck, Loader2 } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/api';

// Componentes
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import FreightCard from '../components/shared/FreightCard';
import AdCarousel from '../components/shared/AdCarousel';
import AdCard from '../components/shared/AdCard';
import { BusinessModal } from "../components/modals/BusinessModal";

export default function FreightPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Estados da Listagem
  const [filteredFreights, setFilteredFreights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Busca
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  // Estados do Modal
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', contact: '', description: '' });
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  /**
   * Função de Busca Principal
   */
  const fetchItems = useCallback(async (currentSearch: string, currentPage: number, isNewSearch: boolean) => {
    try {
      if (isNewSearch) setLoading(true);
      else setLoadingMore(true);

      const response = await api.get('/freights', {
        params: { 
          search: currentSearch || undefined,
          page: currentPage,
          perPage: 15
        }
      });

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
  }, []);

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
  const trackViewRef = useCallback((node: HTMLDivElement | null, id: string, type: string) => {
  if (!node || trackedItems.current.has(`${type}-${id}`)) return;
  
  const viewObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
        api.post('log-event', { 
          target_id: id, 
          target_type: type, 
          event_type: 'VIEW' 
        }).catch(() => {});

        trackedItems.current.add(`${type}-${id}`);
        viewObserver.unobserve(node);
      }
    }, { threshold: 0.2 });
    viewObserver.observe(node);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      <Header />
      
      <main className="flex-grow pt-32">
        <div className="max-w-7xl mx-auto px-4">
          
          <header className="mb-12">
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-[0.8] mb-10">
              Portal de <span className="text-blue-600">Cargas</span>
            </h1>

            <div className="max-w-4xl relative group">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-blue-600" size={30} />
              <input 
                id="search-freight" 
                name="search-freight"
                type="text" 
                placeholder="O que você busca? (ex: Frutas, Curitiba, SC, Carreta...)" 
                className="w-full bg-white dark:bg-slate-900 border-4 border-transparent dark:border-slate-800 shadow-2xl rounded-[3rem] pl-20 pr-16 py-8 text-xl font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-blue-100 dark:focus:border-blue-900/30 placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-all" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-8 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-red-500 transition-colors">
                  <X size={28} />
                </button>
              )}
            </div>
          </header>

          {/* SECTION DO CARROSSEL - Corrigido para não bloquear cliques */}
          <section className="mb-16 relative">
            <div className="rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white dark:border-slate-900 bg-white dark:bg-slate-900 transition-colors">
              <AdCarousel searchTerm={searchTerm} />
            </div>
          </section>

          <section className="pb-24">
            {loading && page === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {[...Array(6)].map((_, i) => <div key={i} className="h-[450px] bg-white dark:bg-slate-900 rounded-[4rem] animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                
                {/* CARD COMUNIDADE */}
                <div onClick={() => navigate('/comunidade')} className="group cursor-pointer bg-blue-600 rounded-[3rem] p-10 text-white flex flex-col justify-between h-full relative overflow-hidden shadow-2xl hover:translate-y-[-4px] transition-all min-h-[420px]">
                  <Users className="absolute -right-8 -bottom-8 text-white/10 group-hover:scale-110 transition-transform duration-700" size={240} />
                  <div className="relative z-10">
                    <div className="bg-white/20 w-fit p-4 rounded-2xl mb-6 backdrop-blur-xl border border-white/10"><Globe size={28} /></div>
                    <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-[0.85] mb-4">Grupos de <br/><span className="text-blue-200">WhatsApp</span></h3>
                    <p className="text-blue-100 text-xs font-bold italic uppercase tracking-wider">Cargas em tempo real.</p>
                  </div>
                  <button className="w-full bg-white text-blue-600 py-5 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 hover:bg-slate-900 hover:text-white transition-all shadow-xl relative z-10">
                    Ver Grupos <ArrowRight size={18} />
                  </button>
                </div>

                {filteredFreights.length > 0 ? (
                  <>
                    {filteredFreights.map((item, index) => (
                      <React.Fragment key={`${item.id}-${index}`}>
                        <div ref={(el) => trackViewRef(el, item.id, 'freight')}>
                          <FreightCard data={item} />
                        </div>
                        
                        {index === 0 && (
                          <div 
                            onClick={() => setIsBusinessModalOpen(true)} 
                            className="group cursor-pointer bg-slate-900 dark:bg-slate-800 rounded-[3rem] p-10 text-white flex flex-col justify-between h-full relative overflow-hidden shadow-2xl hover:translate-y-[-4px] transition-all min-h-[420px] border border-transparent dark:border-slate-700"
                          >
                            <Building2 className="absolute -right-8 -bottom-8 text-amber-500/5 group-hover:scale-110 transition-transform duration-700" size={240} />
                            <div className="relative z-10">
                              <div className="bg-amber-500 w-fit p-4 rounded-2xl mb-6"><Zap size={28} className="text-slate-900" /></div>
                              <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-[0.85] mb-4 text-amber-500">
                                Anuncie <br/><span className="text-white">Sua Empresa</span>
                              </h3>
                              <p className="text-slate-400 text-xs font-bold italic uppercase tracking-wider">Destaque sua marca no portal.</p>
                            </div>
                            <button className="w-full bg-amber-500 text-slate-900 py-5 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 hover:bg-white transition-all shadow-xl relative z-10">
                              Quero Anunciar <ArrowRight size={18} />
                            </button>
                          </div>
                        )}
                        
                        {(index + 1) % 6 === 0 && (
                          <div className="h-full">
                            <AdCard 
                              position="in-feed" 
                              variant="vertical" 
                              search={searchTerm} 
                              city={item.origin_city} 
                            />
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
                  <div className="col-span-full py-32 bg-white dark:bg-slate-900 rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-slate-800 text-center">
                    <Truck size={60} className="text-slate-200 dark:text-slate-700 mx-auto mb-6" />
                    <p className="text-slate-400 dark:text-slate-500 font-black italic text-2xl uppercase tracking-tighter">Nenhum resultado para "{searchTerm}"</p>
                    <button onClick={() => setSearchTerm("")} className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-full font-black uppercase text-xs active:scale-95 transition-all">Limpar Filtros</button>
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