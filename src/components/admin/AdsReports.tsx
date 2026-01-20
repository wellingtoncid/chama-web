import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { BarChart3, Users, Download, Loader2, Search } from 'lucide-react';

export function AdsReports() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<string>('todos');

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get('/ads');
        setAds(Array.isArray(res.data) ? res.data : []);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    loadData();
  }, []);

  // Agrupamento por cliente para o Filtro e Lista
  const clientsData = ads.reduce((acc: any, ad) => {
    const clientName = ad.title.includes('-') ? ad.title.split('-')[0].trim() : ad.title;
    if (!acc[clientName]) acc[clientName] = { views: 0, clicks: 0, campaigns: 0, ads: [] };
    acc[clientName].views += Number(ad.views_count || 0);
    acc[clientName].clicks += Number(ad.clicks_count || 0);
    acc[clientName].campaigns += 1;
    acc[clientName].ads.push(ad);
    return acc;
  }, {});

  const filteredClients = selectedClient === 'todos' 
    ? Object.entries(clientsData)
    : Object.entries(clientsData).filter(([name]) => name === selectedClient);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Search className="text-slate-400" size={20} />
          <select 
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="bg-slate-50 border-none rounded-xl text-sm font-bold p-3 w-full md:w-64 focus:ring-2 focus:ring-orange-500"
          >
            <option value="todos">Todos os Clientes</option>
            {Object.keys(clientsData).map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">
          <Download size={16} /> Exportar Relatório
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredClients.map(([name, stat]: any) => (
          <div key={name} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center font-black italic">
                {name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-black text-slate-800 uppercase italic">{name}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{stat.campaigns} Banners Ativos</p>
              </div>
            </div>
            <div className="flex gap-10">
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase">Views</p>
                <p className="text-xl font-black italic">{stat.views.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-orange-500 uppercase">Clicks</p>
                <p className="text-xl font-black italic">{stat.clicks.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}