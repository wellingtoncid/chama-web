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
   * Função de Busca Principal (Unificada para nova busca e carregar mais)
   */
  const fetchItems = useCallback(async (currentSearch: string, currentPage: number, isNewSearch: boolean) => {
    try {
      if (isNewSearch) setLoading(true);
      else setLoadingMore(true);

      console.log(`📡 API: "${currentSearch}" | Página: ${currentPage}`);

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
        
        // Se vier menos itens que o perPage, significa que acabou
        if (newData.length < 15) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
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
      // Sempre que o termo mudar, reseta para página 1
      setPage(1);
      fetchItems(searchTerm, 1, true);
      
      // Atualiza URL
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
        api.post('/log-event', { id, type, action: 'view' }).catch(() => {});
        trackedItems.current.add(`${type}-${id}`);
        viewObserver.unobserve(node);
      }
    }, { threshold: 0.2 });
    viewObserver.observe(node);
  }, []);

  const handleBusinessSubmit = async () => {
    setIsSending(true);
    try {
      await api.post('/portal-request', { type: 'business_ad', ...formData });
      setSuccess(true);
      setTimeout(() => { 
        setIsBusinessModalOpen(false); 
        setSuccess(false); 
        setFormData({title: '', contact: '', description: ''}); 
      }, 3000);
    } catch (e) { 
      alert("Erro ao enviar. Tente novamente."); 
    } finally { 
      setIsSending(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow pt-32">
        <div className="max-w-7xl mx-auto px-4">
          
          <header className="mb-12">
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.8] mb-10">
              Portal de <span className="text-blue-600">Cargas</span>
            </h1>

            <div className="max-w-4xl relative group">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-blue-600" size={30} />
              <input 
                type="text" 
                placeholder="O que você busca? (ex: Frutas, Curitiba, SC, Carreta...)" 
                className="w-full bg-white border-4 border-transparent shadow-2xl rounded-[3rem] pl-20 pr-16 py-8 text-xl font-bold text-slate-700 outline-none focus:border-blue-100 placeholder:text-slate-300 transition-all" 
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

          <section className="mb-16 rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white bg-white">
            <AdCarousel searchTerm={searchTerm} />
          </section>

          <section className="pb-24">
            {loading && page === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {[...Array(6)].map((_, i) => <div key={i} className="h-[450px] bg-white rounded-[4rem] animate-pulse" />)}
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
                        
                        {/* CARD ANUNCIE EMPRESA */}
                        {index === 0 && (
                          <div onClick={() => setIsBusinessModalOpen(true)} className="group cursor-pointer bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col justify-between h-full relative overflow-hidden shadow-2xl hover:translate-y-[-4px] transition-all min-h-[420px]">
                            <Building2 className="absolute -right-8 -bottom-8 text-amber-500/5 group-hover:scale-110 transition-transform duration-700" size={240} />
                            <div className="relative z-10">
                              <div className="bg-amber-500 w-fit p-4 rounded-2xl mb-6"><Zap size={28} className="text-slate-900" /></div>
                              <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-[0.85] mb-4 text-amber-500">Anuncie <br/><span className="text-white">Sua Empresa</span></h3>
                              <p className="text-slate-400 text-xs font-bold italic uppercase tracking-wider">Destaque sua marca no portal.</p>
                            </div>
                            <button className="w-full bg-amber-500 text-slate-900 py-5 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 hover:bg-white transition-all shadow-xl relative z-10">
                              Quero Anunciar <ArrowRight size={18} />
                            </button>
                          </div>
                        )}
                        
                        {/* ADS DINÂMICOS */}
                        {(index + 1) % 6 === 0 && (
                          <div className="h-full">
                             <AdCard position="in-feed" variant="vertical" search={searchTerm} />
                          </div>
                        )}
                      </React.Fragment>
                    ))}
                    
                    {/* ELEMENTO SENTINELA PARA PAGINAÇÃO */}
                    {hasMore && (
                      <div ref={lastElementRef} className="col-span-full flex justify-center py-12">
                        <Loader2 className="text-blue-600 animate-spin" size={40} />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="col-span-full py-32 bg-white rounded-[4rem] border-4 border-dashed border-slate-200 text-center">
                    <Truck size={60} className="text-slate-200 mx-auto mb-6" />
                    <p className="text-slate-400 font-black italic text-2xl uppercase tracking-tighter">Nenhum resultado para "{searchTerm}"</p>
                    <button onClick={() => setSearchTerm("")} className="mt-8 px-10 py-4 bg-blue-600 text-white rounded-full font-black uppercase text-xs active:scale-95 transition-all">Limpar Filtros</button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* MODAL BUSINESS */}
      {isBusinessModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[200] flex items-center justify-center p-6 transition-all">
          <div className="bg-white w-full max-w-xl rounded-[4rem] p-12 relative shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-300">
            <button onClick={() => setIsBusinessModalOpen(false)} className="absolute top-10 right-10 text-slate-300 hover:text-red-500 transition-colors"><X size={32} /></button>
            
            {success ? (
               <div className="text-center py-12">
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><CheckCircle2 size={48} /></div>
                  <h3 className="text-3xl font-black uppercase italic mb-3 tracking-tighter">Recebido!</h3>
                  <p className="text-slate-500 font-bold italic text-base">Entraremos em contato em breve.</p>
               </div>
            ) : (
              <div>
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-4 bg-amber-100 text-amber-600 rounded-[1.5rem]"><Building2 size={40} /></div>
                  <div>
                    <h2 className="text-3xl font-black uppercase italic leading-none tracking-tighter">Divulgar Marca</h2>
                    <p className="text-slate-400 font-bold text-xs uppercase mt-1 italic">Anuncie para milhares de motoristas</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[1.8rem] font-bold uppercase text-sm outline-none focus:border-amber-500 focus:bg-white transition-all" placeholder="Nome da Empresa" />
                  <input value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[1.8rem] font-bold text-sm outline-none focus:border-amber-500 focus:bg-white transition-all" placeholder="WhatsApp (00) 00000-0000" />
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[1.8rem] font-medium text-sm h-32 resize-none outline-none focus:border-amber-500 focus:bg-white transition-all" placeholder="O que você deseja anunciar?" />

                  <button 
                    onClick={handleBusinessSubmit}
                    disabled={isSending || !formData.title || !formData.contact} 
                    className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] mt-6 hover:bg-amber-500 hover:text-slate-900 transition-all disabled:opacity-50"
                  >
                    {isSending ? 'Processando...' : 'Solicitar Orçamento'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}