import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Zap, MapPin, Globe, X, ArrowRight, Users, Building2, CheckCircle2, Truck } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import FreightCard from '../components/shared/FreightCard';
import AdCarousel from '../components/shared/AdCarousel';
import { AdCard } from '../components/shared/AdCard';

const ESTADOS_BR = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

export default function FreightPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredFreights, setFilteredFreights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', contact: '', description: '' });
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  // Estados de busca inicializados pela URL (Persistência)
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedUF, setSelectedUF] = useState(searchParams.get("uf") || "");

  // --- BUSCA DE DADOS VIA BACKEND (Nova Lógica) ---
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      // Enviamos os parâmetros para o FreightController.php processar a busca global
      const response = await api.get('freights', {
        params: {
          search: searchTerm,
          state: selectedUF
        }
      });
      const data = Array.isArray(response.data) ? response.data : [];
      setFilteredFreights(data);
    } catch (error) { 
      console.error("Erro ao buscar fretes:", error); 
    } finally { 
      setLoading(false); 
    }
  }, [searchTerm, selectedUF]);

  // Atualiza a URL e busca os dados quando os filtros mudam
  useEffect(() => {
    const params: any = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedUF) params.uf = selectedUF;
    setSearchParams(params);

    // Debounce simples para não sobrecarregar a API enquanto digita
    const delayDebounce = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedUF, setSearchParams, fetchItems]);

  // --- LÓGICA DE TRACKING DE VIEWS ---
  const observer = useRef<IntersectionObserver | null>(null);
  const trackedItems = useRef(new Set());

  const trackViewRef = useCallback((node: HTMLDivElement | null, id: string, type: 'freight' | 'ad' | 'community') => {
    if (loading || !node || trackedItems.current.has(id)) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        // Envia log para o AdController ou FreightController (conforme o tipo)
        const endpoint = type === 'freight' ? '/register-freight-view' : '/register-ad-event';
        api.post(endpoint, { id, type: 'view' }).catch(() => {});
        trackedItems.current.add(id);
        if (node) observer.current?.unobserve(node);
      }
    }, { threshold: 0.5 });

    if (node) observer.current.observe(node);
  }, [loading]);

  // --- COMPONENTES NATIVOS ---
  const CommunityCard = () => (
    <div 
      ref={(el) => trackViewRef(el, 'internal_community_card', 'community')}
      onClick={() => navigate('/comunidade')} 
      className="cursor-pointer bg-blue-600 rounded-[3rem] p-10 text-white flex flex-col justify-between h-full relative overflow-hidden group shadow-xl hover:scale-[1.02] transition-all border-4 border-blue-500"
    >
      <Users className="absolute -right-6 -bottom-6 text-white/10 group-hover:scale-110 transition-transform duration-700" size={200} />
      <div className="relative z-10">
        <div className="bg-white/20 w-fit p-3 rounded-2xl mb-6 backdrop-blur-md"><Globe size={24} /></div>
        <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-[0.9] mb-4">Grupos de <br/><span className="text-blue-200">WhatsApp</span></h3>
        <p className="text-blue-100 text-[11px] font-bold italic">Receba fretes regionais direto no celular.</p>
      </div>
      <button className="w-full bg-white text-blue-600 py-4 rounded-2xl font-black text-[10px] uppercase mt-8 flex items-center justify-center gap-2 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-lg relative z-10">
        Ver Comunidades <ArrowRight size={14} />
      </button>
    </div>
  );

  const BusinessCard = () => (
    <div 
      ref={(el) => trackViewRef(el, 'internal_business_card', 'ad')}
      onClick={() => setIsBusinessModalOpen(true)} 
      className="cursor-pointer bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col justify-between h-full relative overflow-hidden group border-4 border-slate-800 shadow-xl hover:scale-[1.02] transition-all"
    >
      <Building2 className="absolute -right-6 -bottom-6 text-amber-500/10 group-hover:scale-110 transition-transform duration-700" size={200} />
      <div className="relative z-10">
        <div className="bg-amber-500 w-fit p-3 rounded-2xl mb-6 shadow-lg shadow-amber-500/20"><Zap size={24} className="text-slate-900" /></div>
        <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-[0.9] mb-4 text-amber-500">Sua Empresa <br/><span className="text-white">Aqui</span></h3>
        <p className="text-slate-400 text-[11px] font-bold italic">Anuncie para milhares de motoristas qualificados.</p>
      </div>
      <button className="w-full bg-amber-500 text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase mt-8 flex items-center justify-center gap-2 group-hover:bg-white transition-all shadow-lg relative z-10">
        Divulgar Agora <ArrowRight size={14} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow pt-24 md:pt-32">
        <div className="max-w-6xl mx-auto px-4">
          
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              Portal de <span className="text-blue-600">Cargas</span>
            </h1>
          </div>

          {/* Barra de Busca que Alimenta o Backend */}
          <div className="flex flex-col md:flex-row items-stretch gap-2 bg-white p-2 rounded-[2.5rem] shadow-xl mb-12 border border-slate-100">
             <div className="flex-1 relative flex items-center">
              <Search className="absolute left-6 text-blue-600" size={24} />
              <input 
                type="text" 
                placeholder="Buscar por produto, empresa, cidade ou carroceria..." 
                className="w-full bg-transparent border-none pl-16 pr-12 py-6 text-lg font-bold text-slate-700 outline-none" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-4 p-2 text-slate-300 hover:text-slate-600">
                  <X size={20} />
                </button>
              )}
            </div>
            <div className="relative flex items-center min-w-[180px]">
              <MapPin className="absolute left-4 text-blue-500" size={20} />
              <select 
                className="w-full bg-slate-50 md:bg-transparent border-none pl-12 pr-10 py-6 text-sm font-black uppercase text-slate-600 appearance-none outline-none cursor-pointer" 
                value={selectedUF} 
                onChange={(e) => setSelectedUF(e.target.value)}
              >
                <option value="">Brasil (Todos)</option>
                {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center mb-8 px-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-xl"><Truck size={20} /></div>
              <p className="text-sm font-bold text-slate-500 italic">
                Encontrados <span className="text-blue-600 font-black">{filteredFreights.length} fretes</span> para sua busca
              </p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full border border-emerald-100">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Tempo Real</span>
            </div>
          </div>

          {/* Banner Rotativo (Agora filtrável por palavra-chave) */}
          <div className="mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/10">
              <AdCarousel searchTerm={searchTerm} state={selectedUF} />
          </div>

          <div className="pb-20">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-[400px] bg-white rounded-[3rem] animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredFreights.length > 0 ? (
                  filteredFreights.map((item, index) => (
                    <React.Fragment key={item.id}>
                      {index === 0 && <CommunityCard />}

                      <div ref={(el) => trackViewRef(el, item.id, 'freight')}>
                         <FreightCard data={item} onToggle={fetchItems} />
                      </div>
                      
                      {index === 2 && <BusinessCard />}

                      {/* Injeção de Anúncios Dinâmicos a cada 6 itens */}
                      {(index + 1) % 6 === 0 && (
                        <div className="h-full">
                           <AdCard position="freight_list" variant="vertical" search={searchTerm} state={selectedUF} />
                        </div>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <div className="col-span-full py-20 flex flex-col items-center">
                    <div className="bg-slate-100 p-10 rounded-[3rem] text-center max-w-lg">
                      <Search size={48} className="text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500 font-bold mb-8 italic">Não encontramos resultados exatos, mas confira estas opções:</p>
                      <div className="grid grid-cols-1 gap-6">
                        <CommunityCard />
                        <BusinessCard />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal Business mantido conforme original */}
      {isBusinessModalOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-10 relative">
            <button onClick={() => setIsBusinessModalOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-red-500"><X size={28} /></button>
            {success ? (
               <div className="text-center py-10">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
                  <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tighter">Solicitação Enviada!</h3>
                  <p className="text-slate-500 font-medium italic text-sm">Entraremos em contato em breve.</p>
               </div>
            ) : (
              <div className="animate-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl"><Building2 size={32} /></div>
                  <h2 className="text-2xl font-black uppercase italic leading-none tracking-tighter">Anunciar minha Empresa</h2>
                </div>
                <div className="space-y-4">
                  <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold uppercase text-xs outline-none focus:border-amber-500" placeholder="Nome da Empresa" />
                  <input value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-xs outline-none focus:border-amber-500" placeholder="WhatsApp (DDD)" />
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-medium text-xs h-32 resize-none outline-none focus:border-amber-500" placeholder="Fale brevemente sobre o que deseja anunciar..." />
                  <button 
                    onClick={async () => {
                      setIsSending(true);
                      try {
                        await api.post('/portal-request', { type: 'business_ad', ...formData });
                        setSuccess(true);
                        setTimeout(() => { setIsBusinessModalOpen(false); setSuccess(false); }, 3000);
                      } catch (e) { alert("Erro ao enviar solicitação."); } finally { setIsSending(false); }
                    }} 
                    disabled={isSending || !formData.title || !formData.contact} 
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-amber-500 transition-all shadow-xl disabled:opacity-50"
                  >
                    {isSending ? 'Enviando...' : 'Solicitar Orçamento'}
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