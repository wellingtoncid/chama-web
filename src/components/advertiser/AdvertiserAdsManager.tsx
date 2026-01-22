import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../api/api';
import AdEditorModal from './AdEditorModal';

export default function AdvertiserAdsManager({ user }: { user: any }) {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Função auxiliar para tratar a URL da imagem vinda do PHP
  const getFullImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    // Remove a barra inicial se existir para evitar barra dupla na concatenação
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    // Ajuste aqui para a URL base do seu servidor/projeto
    return `${import.meta.env.VITE_API_URL || 'http://localhost/seu-projeto'}/${cleanPath}`;
  };

  const fetchMyAds = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      // Usando a estrutura de query params que o seu AdController espera
      const response = await api.get(`?endpoint=get-user-ads&user_id=${user.id}`);
      
      // Garante que ads seja sempre um array, mesmo que o PHP retorne erro ou vazio
      setAds(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Erro ao carregar anúncios:", error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMyAds();
  }, [fetchMyAds]);

  return (
    <div className="bg-white rounded-[3rem] p-8 lg:p-12 shadow-sm border border-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-[1000] text-slate-900 uppercase italic leading-none">Meus Banners</h2>
          <p className="text-slate-400 text-xs font-bold uppercase mt-2 italic">Gerencie sua visibilidade no portal</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1f4ead] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-blue-100"
        >
          <Plus size={20} /> Criar Novo Anúncio
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#1f4ead]" size={40} />
        </div>
      ) : ads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className="border border-slate-100 rounded-[2rem] p-6 hover:shadow-xl transition-all flex flex-col h-full">
              <div className="aspect-video bg-slate-50 rounded-2xl mb-4 overflow-hidden flex items-center justify-center border border-slate-50">
                <img 
                  src={getFullImageUrl(ad.image_url)} 
                  alt={ad.title} 
                  className="max-h-full w-full object-contain"
                  onError={(e) => {
                    // Fallback caso a imagem falhe
                    (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/600x400?text=Erro+na+Imagem';
                  }}
                />
              </div>
              
              <div className="flex justify-between items-start mt-auto">
                <div className="flex-1 mr-2">
                  <h4 className="font-black text-slate-800 uppercase italic text-sm truncate">{ad.title}</h4>
                  <p className="text-[10px] text-slate-400 font-bold truncate max-w-[180px]">
                    {ad.destination_url || 'Sem link informado'}
                  </p>
                </div>
                
                <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase whitespace-nowrap ${
                  ad.status === 'active' || ad.is_active == 1 ? 'bg-emerald-100 text-emerald-600' : 
                  ad.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                }`}>
                  {(ad.status === 'active' || ad.is_active == 1) ? <CheckCircle2 size={10}/> : ad.status === 'pending' ? <Clock size={10}/> : <XCircle size={10}/>}
                  {ad.status === 'active' || ad.is_active == 1 ? 'Ativo' : ad.status === 'pending' ? 'Análise' : 'Inativo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
          <AlertCircle className="mx-auto text-slate-300 mb-4" size={48} />
          <p className="text-slate-500 font-bold uppercase text-xs">Você ainda não possui anúncios criados.</p>
        </div>
      )}

      {isModalOpen && (
        <AdEditorModal 
          userId={user.id} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchMyAds} 
        />
      )}
    </div>
  );
}