import React, { useEffect, useState } from "react";
import { ChevronDown, ArrowRight, TrendingUp } from "lucide-react";
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
    <section id="fretes" className="py-16 lg:py-24 bg-[#F8FAFC] dark:bg-slate-900 transition-colors duration-500">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
        
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
                <Button variant="outline" size="sm" className="font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  {sortOrder === "recent" ? "Mais recentes" : "Maior Valor"}
                  <ChevronDown className="w-4 h-4 ml-1 text-[#1f4ead] dark:text-blue-400" />
                </Button>
              </DropdownMenuTrigger>
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

        <div className="flex flex-col gap-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-72 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2.5rem]" />)}
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {freights.length > 0 ? (
                  <>
                    {freights.map((freight: any, index: number) => (
                      <React.Fragment key={freight.id}>
                        <div className="group transition-all duration-300 hover:-translate-y-2">
                            <FreightCard data={freight} />
                        </div>

                        {index === freights.length - 1 && remainingCount > 0 && (
                          <Link 
                            to={`/fretes?search=${encodeURIComponent(searchTerm)}`}
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
                  <div className="col-span-full text-center py-20 bg-white dark:bg-slate-950 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                    <p className="text-slate-400 dark:text-slate-600 font-black uppercase tracking-widest italic">Nenhuma carga encontrada</p>
                  </div>
                )}
              </div>

</div>
          )}
        </div>

        <div className="text-center mt-16">
          <Link to={`/fretes?search=${encodeURIComponent(searchTerm)}`} className="inline-block">
            <Button className="h-16 rounded-2xl px-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-[#1f4ead] dark:hover:bg-blue-500 dark:hover:text-white font-[1000] uppercase italic tracking-widest transition-all shadow-2xl group flex flex-col items-center justify-center">
              <span className="flex items-center gap-3">
                Explorar Todas as Cargas
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </span>
            </Button>
          </Link>
        </div>
        </div>
      </div>
    </section>
  );
};

export default FreightList;