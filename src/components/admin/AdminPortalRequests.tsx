import { useState, useEffect } from 'react';
import { api } from '../../api';
import { 
  MessageSquare, Globe, Star, CheckCircle, 
  Clock, ExternalLink, Filter, Search 
} from 'lucide-react';

export default function AdminPortalRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin-portal-requests');
      setRequests(response.data);
    } catch (error) {
      console.error("Erro ao carregar solicitações", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.post('/admin-update-portal-request', { id, status });
      fetchRequests(); // Recarrega a lista
    } catch (error) {
      alert("Erro ao atualizar status");
    }
  };

  const filtered = requests.filter(req => 
    activeTab === 'all' ? true : req.type === activeTab
  );

  return (
    <div className="p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
            Solicitações do Portal
          </h2>
          <p className="text-slate-500 text-xs font-medium italic">Gerencie sugestões, grupos externos e leads de anúncios.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'suggestion', label: 'Sugestões' },
            { id: 'external_group', label: 'Grupos Ext.' },
            { id: 'business_ad', label: 'Anúncios' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              <th className="pb-4 px-4">Tipo</th>
              <th className="pb-4 px-4">Título/Região</th>
              <th className="pb-4 px-4">Contato</th>
              <th className="pb-4 px-4">Data</th>
              <th className="pb-4 px-4">Status</th>
              <th className="pb-4 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={6} className="py-10 text-center text-slate-400 animate-pulse font-bold">Carregando solicitações...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-10 text-center text-slate-400 font-bold uppercase italic">Nenhuma solicitação encontrada</td></tr>
            ) : filtered.map((req) => (
              <tr key={req.id} className="group hover:bg-slate-50 transition-colors">
                <td className="py-4 px-4">
                  <span className={`flex items-center gap-2 text-[10px] font-black uppercase px-2 py-1 rounded-md w-fit ${
                    req.type === 'business_ad' ? 'bg-amber-50 text-amber-600' :
                    req.type === 'external_group' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {req.type === 'business_ad' ? <Star size={12} fill="currentColor"/> : 
                     req.type === 'external_group' ? <Globe size={12}/> : <MessageSquare size={12}/>}
                    {req.type}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm font-bold text-slate-800 uppercase italic tracking-tighter">{req.title || 'Sem título'}</p>
                  {req.link && (
                    <a href={req.link} target="_blank" className="text-[10px] text-blue-500 font-bold flex items-center gap-1 hover:underline">
                      Link <ExternalLink size={10} />
                    </a>
                  )}
                </td>
                <td className="py-4 px-4 text-xs font-medium text-slate-500">{req.contact_info}</td>
                <td className="py-4 px-4 text-[10px] text-slate-400 font-bold">{new Date(req.created_at).toLocaleDateString()}</td>
                <td className="py-4 px-4">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${req.status === 'pending' ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {req.status === 'pending' ? 'Pendente' : 'Concluído'}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  {req.status === 'pending' && (
                    <button 
                      onClick={() => handleUpdateStatus(req.id, 'analyzed')}
                      className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      title="Marcar como Analisado"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}