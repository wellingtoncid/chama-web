import React, { useState, useEffect, useCallback } from 'react';
import { Search, Zap, MapPin, ChevronDown, Loader2, Globe, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import FreightCard from '../components/shared/FreightCard';

const ESTADOS_BR = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

const FreightPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allFreights, setAllFreights] = useState<any[]>([]);
  const [filteredFreights, setFilteredFreights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedUF, setSelectedUF] = useState(searchParams.get("uf") || "");

  // 1. Carregamento dos dados com injeção de ID de usuário (se logado)
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('@ChamaFrete:user');
      const user = userData ? JSON.parse(userData) : null;

      const response = await api.get('freights', { 
        params: { 
          user_id: user?.id // Importante para verificar favoritos na listagem geral
        } 
      });
      
      setAllFreights(Array.isArray(response.data) ? response.data : []);
    } catch (error) { 
      console.error("Erro ao buscar fretes:", error); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    fetchItems(); 
  }, [fetchItems]);

  // 2. MOTOR DE BUSCA INTELIGENTE (Normalização de acentos + Múltiplas palavras)
  useEffect(() => {
    const normalize = (text: string) => 
      text?.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() || "";

    const searchWords = normalize(searchTerm).trim().split(/\s+/);
    
    const results = allFreights.filter(f => {
      // Filtro de UF
      const matchUF = !selectedUF || (
        normalize(f.origin).includes(normalize(selectedUF)) || 
        normalize(f.destination).includes(normalize(selectedUF))
      );

      // Super String de busca (inclui campos principais)
      const dataText = `${f.origin} ${f.destination} ${f.product} ${f.company_name} ${f.vehicleType} ${f.bodyType}`;
      const searchBase = normalize(dataText);

      // Match se todas as palavras digitadas existirem no frete
      const matchText = !searchTerm || searchWords.every(word => searchBase.includes(word));

      return matchText && matchUF;
    });

    setFilteredFreights(results);
    
    // Atualiza URL sem recarregar a página
    const params: any = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedUF) params.uf = selectedUF;
    setSearchParams(params, { replace: true });

  }, [searchTerm, selectedUF, allFreights, setSearchParams]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Header />
      
      <main className="flex-grow pt-24 md:pt-32">
        <div className="max-w-6xl mx-auto px-4">
          
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-[1000] text-slate-900 tracking-tighter uppercase italic leading-none">
              Portal de <span className="text-blue-600">Cargas</span>
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <p className="text-slate-600 font-black uppercase text-[9px] tracking-widest">
                   {filteredFreights.length} Cargas Ativas
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                <Globe size={12} className="text-blue-500" />
                <p className="text-[9px] font-bold uppercase italic">Busca Inteligente Ativada</p>
              </div>
            </div>
          </div>

          {/* BARRA DE BUSCA GOOGLE STYLE */}
          <div className="flex flex-col md:flex-row items-stretch gap-2 bg-white p-2 rounded-[2.5rem] shadow-[0_30px_60px_rgba(31,78,173,0.08)] border border-slate-100 mb-12">
            
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-6 text-blue-600" size={24} />
              <input 
                type="text"
                placeholder="O que você quer carregar hoje?"
                className="w-full bg-transparent border-none pl-16 pr-12 py-6 text-lg font-bold text-slate-700 outline-none placeholder:text-slate-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 text-slate-300 hover:text-slate-500">
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="hidden md:block w-px h-10 bg-slate-100 self-center" />

            <div className="relative flex items-center min-w-[180px]">
              <MapPin className="absolute left-4 text-blue-500" size={20} />
              <select 
                className="w-full bg-slate-50 md:bg-transparent border-none pl-12 pr-10 py-6 text-sm font-black uppercase text-slate-600 appearance-none cursor-pointer outline-none rounded-2xl md:rounded-none"
                value={selectedUF}
                onChange={(e) => setSelectedUF(e.target.value)}
              >
                <option value="">Todos os Estados</option>
                {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
              <ChevronDown className="absolute right-4 text-slate-300 pointer-events-none" size={18} />
            </div>
          </div>

          {/* LISTAGEM */}
          <div className="pb-20">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-[400px] bg-white border border-slate-100 rounded-[3rem] p-8 space-y-4">
                      <div className="h-6 w-24 bg-slate-100 animate-pulse rounded-full" />
                      <div className="h-12 w-full bg-slate-50 animate-pulse rounded-2xl" />
                      <div className="h-24 w-full bg-slate-50 animate-pulse rounded-2xl" />
                    </div>
                  ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredFreights.length > 0 ? (
                  filteredFreights.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <FreightCard 
                        data={item} 
                        onToggle={fetchItems} // Recarrega para atualizar contadores de clique/view
                      />
                      
                      {/* Banner de Monetização / Destaque */}
                      {(index + 1) % 6 === 0 && (
                        <div className="bg-blue-600 rounded-[3rem] p-10 text-white flex flex-col justify-between h-full relative overflow-hidden shadow-xl shadow-blue-100">
                          <Zap className="absolute -right-6 -top-6 text-white/10" size={180} />
                          <div className="relative z-10">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Patrocinado</span>
                            <h3 className="text-3xl font-[1000] uppercase italic tracking-tighter leading-none mt-6 mb-4">Anuncie<br/>Sua Carga</h3>
                            <p className="text-blue-100 text-xs font-bold leading-relaxed">Sua empresa em destaque para milhares de motoristas qualificados todos os dias.</p>
                          </div>
                          <button className="w-full bg-white text-blue-600 py-4 rounded-2xl font-black text-[10px] uppercase mt-8 hover:scale-105 transition-all relative z-10 shadow-lg">
                            Destaque Agora
                          </button>
                        </div>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100 shadow-inner">
                    <Search className="text-slate-200 mx-auto mb-6" size={60} />
                    <p className="text-slate-400 font-[1000] uppercase tracking-tighter text-xl">Nenhuma carga encontrada</p>
                    <p className="text-slate-300 text-xs font-bold mt-2">Tente buscar por termos mais simples como "Truck" ou "SP".</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FreightPage;