import React, { useEffect, useState } from "react";
import { ChevronDown, ArrowRight, TrendingUp, ShieldCheck, BarChart3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; 
import FreightCard from "../../components/shared/FreightCard";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { api } from "../../api/api";
import AdCard from "../shared/AdCard"; 

const FreightList = () => {
  const navigate = useNavigate();
  const [freights, setFreights] = useState<any[]>([]);
  const [totalFreights, setTotalFreights] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("recent");
  const [searchTerm, setSearchTerm] = useState("");
  
  const user = JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}');
  const isLoggedIn = !!user.id;

  const loadFreights = async (sortBy = "recent", search = "") => {
    try {
      setLoading(true);
      const response = await api.get('/freights', { 
        params: { sort: sortBy, search: search } 
      });
      
      const data = Array.isArray(response.data) ? response.data : response.data.data || [];
      setTotalFreights(data.length);
      
      // Pegamos apenas 4 fretes para a Home. 
      // Com +1 AdCard e +1 Card "Ver Mais", fechamos a grade perfeita de 6.
      setFreights(data.slice(0, 4));
    } catch (error) {
      console.error("Erro ao carregar fretes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleFilter = (e: any) => {
      const term = e.detail;
      setSearchTerm(term);
      loadFreights(sortOrder, term);
    };

    window.addEventListener("filter-freights", handleFilter);
    loadFreights(sortOrder, searchTerm); 

    return () => window.removeEventListener("filter-freights", handleFilter);
  }, [sortOrder]);

  const remainingCount = totalFreights - freights.length;

  return (
    /* Ajustado: bg-[#F8FAFC] para dark:bg-slate-900 (azul marinho profundo em vez de preto total) */
    <section id="fretes" className="py-16 lg:py-24 bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-500">
      <div className="container mx-auto px-4">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="bg-orange-500 w-2 h-2 rounded-full animate-ping" />
                <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-[0.2em]">Cargas em tempo real</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-[1000] text-slate-900 dark:text-white mb-2 uppercase italic tracking-tighter text-balance">
              Cargas <span className="text-[#1f4ead] dark:text-blue-500">Recentes</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium italic">
              {searchTerm ? `Resultados para: ${searchTerm}` : "As melhores oportunidades para o seu caminhão"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* Ajustado: bg-white para dark:bg-slate-800 e bordas dark:border-slate-700 */}
                <Button variant="outline" size="sm" className="font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  {sortOrder === "recent" ? "Mais recentes" : "Maior Valor"}
                  <ChevronDown className="w-4 h-4 ml-1 text-[#1f4ead] dark:text-blue-400" />
                </Button>
              </DropdownMenuTrigger>
              {/* Ajustado: Dropdown dark theme */}
              <DropdownMenuContent align="end" className="rounded-xl z-[60] bg-white dark:bg-slate-800 shadow-xl border-slate-100 dark:border-slate-700 p-2">
                <DropdownMenuItem onClick={() => setSortOrder("recent")} className="font-bold text-slate-600 dark:text-slate-300 cursor-pointer focus:bg-blue-50 dark:focus:bg-blue-900/30 focus:text-[#1f4ead] dark:focus:text-blue-400 rounded-lg">
                  Mais recentes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("price")} className="font-bold text-slate-600 dark:text-slate-300 cursor-pointer focus:bg-blue-50 dark:focus:bg-blue-900/30 focus:text-[#1f4ead] dark:focus:text-blue-400 rounded-lg">
                  Maior valor
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-8">
          <div className="flex-1">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2.5rem]" />)}
              </div>
            ) : (
              <div className="flex flex-col gap-12">
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {freights.length > 0 ? (
                    <>
                      {freights.map((freight: any, index: number) => (
                        <React.Fragment key={freight.id}>
                          
                          {/* 1. CARD DE FRETE NORMAL */}
                          <div className="group transition-all duration-300 hover:-translate-y-2">
                              <FreightCard data={freight} />
                          </div>

                          {/* 2. ANÚNCIO VERTICAL */}
                          {index === 0 && (
                            <div className="relative h-full">
                               <div className="absolute -top-3 left-8 z-20 bg-[#1f4ead] dark:bg-blue-600 text-white text-[7px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                 Parceiro Recomendado
                               </div>
                               <AdCard position="sidebar" variant="vertical" search={searchTerm} city={freight.origin_city} />
                            </div>
                          )}

                          {/* 3. CARD "VER MAIS" */}
                          {index === freights.length - 1 && remainingCount > 0 && (
                            <Link 
                              to={`/fretes?search=${encodeURIComponent(searchTerm)}`}
                              /* Ajustado: Border slate-800 para dark:border-slate-700 */
                              className="relative overflow-hidden bg-slate-900 dark:bg-slate-950 border-4 border-slate-800 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center group hover:bg-slate-800 dark:hover:bg-slate-900 transition-all shadow-2xl"
                            >
                              <div className="relative z-10">
                                <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-orange-500/40">
                                   <TrendingUp size={32} className="text-white" />
                                </div>
                                <span className="block text-4xl font-[1000] text-white tracking-tighter">
                                  +{remainingCount}
                                </span>
                                <h4 className="font-black text-slate-400 uppercase italic text-xs mt-1 leading-tight tracking-widest">
                                  Cargas Disponíveis
                                </h4>
                                <div className="mt-8 flex items-center gap-2 text-white font-black text-[10px] uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                                  Ver Tudo <ArrowRight size={14} className="text-orange-500" />
                                </div>
                              </div>
                            </Link>
                          )}
                        </React.Fragment>
                      ))}
                    </>
                  ) : (
                    /* Estado vazio: Ajustado bg e bordas */
                    <div className="col-span-full text-center py-20 bg-white dark:bg-slate-950 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                      <p className="text-slate-400 dark:text-slate-600 font-black uppercase tracking-widest italic">Nenhuma carga encontrada</p>
                    </div>
                  )}
                </div>

                {/* DIVISOR DE PUBLICIDADE */}
                <div className="pt-4">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">Publicidade Recomendada</span>
                      <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
                   </div>
                   <AdCard position="freight_list" variant="horizontal" search={searchTerm} city={freights.length > 0 ? freights[0].origin_city : undefined} />
                </div>
              </div>
            )}
          </div>
          
          {/* SIDEBAR */}
          <aside className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-28 space-y-6">
              <div className="min-h-[420px]">
                <AdCard position="sidebar" variant="vertical" search={searchTerm} />
              </div>

              {/* Banner CTA Interno - Adaptado */}
              <div className="bg-white dark:bg-slate-950 p-8 rounded-[3rem] text-slate-900 shadow-xl relative overflow-hidden group border border-slate-100 dark:border-slate-800">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-700" />
                  
                  <div className="relative z-10">
                    <div className="bg-slate-900 dark:bg-slate-800 w-fit p-2 rounded-xl mb-4">
                        <BarChart3 size={20} className="text-orange-500" />
                    </div>

                    <h4 className="font-[1000] italic uppercase leading-none mb-4 text-3xl tracking-tighter text-slate-900 dark:text-white">
                      Sua Empresa<br/><span className="text-orange-500">em Destaque</span>
                    </h4>
                    
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-8 leading-relaxed">
                        Apareça para milhares de motoristas qualificados todos os dias.
                    </p>

                    <button 
                      onClick={() => navigate(isLoggedIn ? "/novo-frete" : "/cadastro")}
                      className="w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-5 rounded-[1.5rem] font-[1000] uppercase text-[11px] tracking-[0.1em] hover:bg-orange-500 dark:hover:bg-orange-500 dark:hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 group/btn"
                    >
                      Anunciar Agora
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Botão Inferior Final */}
        <div className="text-center mt-16">
          <Link to={`/fretes?search=${encodeURIComponent(searchTerm)}`} className="inline-block">
            {/* Ajustado: bg-slate-900 vira branco no dark para dar alto contraste */}
            <Button className="h-16 rounded-2xl px-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-[#1f4ead] dark:hover:bg-blue-500 dark:hover:text-white font-[1000] uppercase italic tracking-widest transition-all shadow-2xl group flex flex-col items-center justify-center">
              <span className="flex items-center gap-3">
                Explorar Todas as Cargas
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FreightList;