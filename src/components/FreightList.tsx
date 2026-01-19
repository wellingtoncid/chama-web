import React, { useEffect, useState } from "react";
import { ChevronDown, ArrowRight, TrendingUp, ShieldCheck, BarChart3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; 
import FreightCard from "../components/shared/FreightCard";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { api } from "../api";
import { AdCard } from "./shared/AdCard"; 

const FreightList = () => {
  const navigate = useNavigate();
  const [freights, setFreights] = useState<any[]>([]);
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
      setFreights(data.slice(0, 9));
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

  return (
    <section id="fretes" className="py-16 lg:py-24 bg-[#F8FAFC]">
      <div className="container mx-auto px-4">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="bg-orange-500 w-2 h-2 rounded-full animate-ping" />
                <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em]">Cargas em tempo real</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-[1000] text-slate-900 mb-2 uppercase italic tracking-tighter text-balance">
              Cargas <span className="text-[#1f4ead]">Recentes</span>
            </h2>
            <p className="text-slate-500 font-medium italic">
              {searchTerm ? `Resultados para: ${searchTerm}` : "As melhores oportunidades para o seu caminhão"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="font-bold text-slate-600 bg-white border-slate-200 rounded-xl shadow-sm hover:bg-slate-50">
                  {sortOrder === "recent" ? "Mais recentes" : "Maior Valor"}
                  <ChevronDown className="w-4 h-4 ml-1 text-[#1f4ead]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl z-[60] bg-white shadow-xl border-slate-100 p-2">
                <DropdownMenuItem onClick={() => setSortOrder("recent")} className="font-bold text-slate-600 cursor-pointer focus:bg-blue-50 focus:text-[#1f4ead] rounded-lg">
                  Mais recentes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("price")} className="font-bold text-slate-600 cursor-pointer focus:bg-blue-50 focus:text-[#1f4ead] rounded-lg">
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
                  {[1,2,3].map(i => <div key={i} className="h-72 bg-slate-100 animate-pulse rounded-[2.5rem]" />)}
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                {/* Grid de Fretes */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {freights.length > 0 ? (
                    freights.map((freight: any) => (
                      <FreightCard key={freight.id} data={freight} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                      <p className="text-slate-400 font-black uppercase tracking-widest italic">Nenhuma carga disponível</p>
                    </div>
                  )}
                </div>

                {/* ANÚNCIO HORIZONTAL (Sempre aparece abaixo dos fretes) */}
                <div className="w-full">
                  <AdCard 
                    position="freight_list" 
                    variant="horizontal" 
                    search={searchTerm}
                    // A cidade pode ser extraída do primeiro frete da lista se existir
                    city={freights.length > 0 ? freights[0].origin_city : undefined}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* SIDEBAR */}
          <aside className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-28 space-y-6">
              
              {/* Espaço para Anúncio Vertical de Terceiros */}
              <div className="min-h-[300px]">
                <AdCard position="sidebar" variant="vertical" search={searchTerm} />
              </div>

              {/* Banner Interno (Call to Action) */}
              <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group border-4 border-slate-800">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all duration-700" />
                  
                  <div className="relative z-10">
                    <div className="bg-orange-500 w-fit p-2 rounded-xl mb-4 shadow-lg shadow-orange-500/20">
                        <TrendingUp size={20} className="text-white" />
                    </div>

                    <h4 className="font-[1000] italic uppercase leading-none mb-4 text-3xl tracking-tighter text-white text-balance">
                      Sua Carga<br/><span className="text-orange-500">em Destaque!</span>
                    </h4>
                    
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-start gap-2 text-[10px] font-bold uppercase tracking-wide text-slate-300">
                            <ShieldCheck size={14} className="text-emerald-400 shrink-0" /> Contato Direto
                        </li>
                        <li className="flex items-start gap-2 text-[10px] font-bold uppercase tracking-wide text-slate-300">
                            <BarChart3 size={14} className="text-blue-400 shrink-0" /> Relatório de Cliques
                        </li>
                    </ul>

                    <button 
                      onClick={() => navigate(isLoggedIn ? "/novo-frete" : "/cadastro")}
                      className="w-full bg-white text-slate-900 py-5 rounded-[1.5rem] font-[1000] uppercase text-[11px] tracking-[0.1em] hover:bg-orange-500 hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 group/btn"
                    >
                      {isLoggedIn ? "Anunciar Carga" : "Começar Agora"}
                      <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="text-center mt-16">
          <Link to="/fretes" className="inline-block">
            <Button className="h-16 rounded-2xl px-12 bg-slate-900 hover:bg-[#1f4ead] text-white font-[1000] uppercase italic tracking-widest transition-all shadow-xl group flex items-center gap-3">
              Ver Todas as Cargas
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FreightList;