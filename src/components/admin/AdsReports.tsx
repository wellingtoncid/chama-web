import { useState, useEffect } from 'react';
import { api } from '../../api';
import { 
  BarChart3, TrendingUp, Users, Download, 
  Loader2, MousePointer2, Eye, Target 
} from 'lucide-react';

export function AdsReports() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get('/ads');
        setAds(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Erro ao carregar dados para relatório", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Agrupamento Inteligente por Cliente
  const statsByClient = ads.reduce((acc: any, ad) => {
    // Tenta pegar o nome do cliente (antes do hífen) ou o título completo
    const clientName = ad.title.includes('-') ? ad.title.split('-')[0].trim() : ad.title;
    
    if (!acc[clientName]) {
      acc[clientName] = { 
        views: 0, 
        clicks: 0, 
        campaigns: 0,
        locations: new Set(),
        lastUpdate: ad.created_at 
      };
    }
    
    acc[clientName].views += Number(ad.views_count || 0);
    acc[clientName].clicks += Number(ad.clicks_count || 0);
    acc[clientName].campaigns += 1;
    if (ad.location_city) acc[clientName].locations.add(ad.location_city);
    
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-black uppercase italic text-xs tracking-widest">Processando métricas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Cards de Resumo Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Target size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Total de Clientes</p>
            <p className="text-2xl font-black text-slate-800 italic">{Object.keys(statsByClient).length}</p>
          </div>
        </div>
        {/* Adicione mais resumos se necessário */}
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-xl font-black uppercase italic text-slate-800">Performance Consolidada</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resultados agrupados por anunciante</p>
          </div>
          <button 
            onClick={() => window.print()}
            className="bg-slate-900 hover:bg-orange-500 text-white px-6 py-3 rounded-2xl transition-all flex items-center gap-2 text-[10px] font-black uppercase shadow-lg shadow-slate-200"
          >
            <Download size={16} /> Gerar Relatório
          </button>
        </div>

        <div className="space-y-4">
          {Object.entries(statsByClient).length === 0 ? (
             <div className="text-center py-10 text-slate-400 font-bold uppercase italic text-sm">Nenhum dado para exibir</div>
          ) : Object.entries(statsByClient).map(([name, stat]: any) => {
            const ctr = stat.views > 0 ? ((stat.clicks / stat.views) * 100).toFixed(2) : "0.00";
            
            return (
              <div key={name} className="group bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-100 border border-transparent hover:border-slate-100 p-6 rounded-[2.5rem] transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Info do Cliente */}
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white rounded-[1.2rem] flex items-center justify-center text-slate-800 shadow-sm border border-slate-100 group-hover:rotate-6 transition-transform">
                      <Users size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-slate-800 uppercase italic leading-tight">{name}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[8px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded uppercase">
                          {stat.campaigns} Banners
                        </span>
                        <span className="text-[8px] font-black bg-slate-200 text-slate-500 px-2 py-0.5 rounded uppercase">
                          {Array.from(stat.locations).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Métricas Principais */}
                  <div className="flex items-center gap-8 md:gap-16 bg-white md:bg-transparent p-4 md:p-0 rounded-2xl border border-slate-100 md:border-none">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                        <Eye size={12} />
                        <span className="text-[9px] font-black uppercase">Views</span>
                      </div>
                      <p className="text-xl font-black text-slate-800 italic">{stat.views.toLocaleString()}</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                        <MousePointer2 size={12} />
                        <span className="text-[9px] font-black uppercase">Cliques</span>
                      </div>
                      <p className="text-xl font-black text-slate-800 italic">{stat.clicks.toLocaleString()}</p>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
                        <TrendingUp size={12} />
                        <span className="text-[9px] font-black uppercase">CTR</span>
                      </div>
                      <p className="text-xl font-black text-emerald-600 italic">{ctr}%</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}