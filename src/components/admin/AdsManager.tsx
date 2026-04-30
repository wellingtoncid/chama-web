import { useState, useEffect, useRef } from 'react';
import { api } from '../../api/api';
import {
  Trash2, Loader2, Plus, Pencil,
  Search, BarChart3,
  Play, Pause, RotateCcw, AlertTriangle
} from 'lucide-react';
import { useAdPositions } from '../../hooks/useAdPositions';
import { StatsGrid, StatCard, TimeFilter, PageShell } from '@/components/admin';

export default function AdsManager() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | '30days' | 'thisMonth' | 'custom' | 'all'>('all');
  
  const handleTimeFilterChange = (value: 'today' | '7days' | '30days' | 'thisMonth' | 'custom' | 'all', _customRange?: { start: string; end: string }) => {
    setTimeFilter(value);
    // TODO: integrar com loadAds passando o período
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Estados do Formulário
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [externalImageUrl, setExternalImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState('PROMOÇÃO');
  const [position, setPosition] = useState('sidebar');
  const [whatsapp, setWhatsapp] = useState('');
  const [description, setDescription] = useState('');
  const [locationCity, setLocationCity] = useState('Brasil');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_viewLimit, _setViewLimit] = useState<number | ''>('');
  const [targetUserId, setTargetUserId] = useState<number | ''>('');
  const [users, setUsers] = useState<{id: number; name: string; email: string}[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const { positions, loading: positionsLoading } = useAdPositions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cálculos de Métricas
  const allAds = ads;
  const activeAds = allAds.filter(a => a.computed_status === 'active' || a.computed_status === 'expiring_soon');
  const expiredAds = allAds.filter(a => a.computed_status === 'expired');
  const pausedAds = allAds.filter(a => a.computed_status === 'paused');
  
  const totalViews = allAds.reduce((acc, curr) => acc + (Number(curr.views_count) || 0), 0);
  const totalClicks = allAds.reduce((acc, curr) => acc + (Number(curr.clicks_count) || 0), 0);
  const averageCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : "0.00";

  // Filtro lógico
  const filteredAds = ads.filter(ad => {
    const matchesSearch = 
      ad.title?.toLowerCase().includes(filter.toLowerCase()) || 
      ad.location_city?.toLowerCase().includes(filter.toLowerCase()) ||
      ad.category?.toLowerCase().includes(filter.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ad.computed_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getFullImageUrl = (path: string) => {
    if (!path || path.trim() === "") return 'https://placehold.co/800x400/f1f5f9/64748b?text=Sem+Imagem';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\//, '').replace(/^api\//, '');
    return `http://127.0.0.1:8000/${cleanPath}`;
  };

  // --- CARREGAMENTO DE DADOS ---

  const loadAds = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin-ads');
      const adsData = res.data?.data || res.data || [];
      setAds(Array.isArray(adsData) ? adsData : []);
    } catch (error) {
      console.error("Erro ao carregar anúncios", error);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get('/companies');
      const companiesData = res.data?.companies || res.data?.data || res.data || [];
      setUsers(companiesData);
    } catch (error) {
      try {
        const res = await api.get('/list-all-users');
        const usersData = res.data?.users || res.data?.data || res.data || [];
        const companies = usersData.filter((u: any) => u.type === 'COMPANY' || u.user_type === 'COMPANY');
        setUsers(companies);
      } catch {
        setUsers([]); 
      }
    }
  };

  const loadCurrentUser = async () => {
    try {
      const userData = localStorage.getItem('@ChamaFrete:user');
      if (userData) setCurrentUser(JSON.parse(userData));
    } catch (error) {
      console.error("Erro ao carregar usuário atual", error);
    }
  };

  useEffect(() => { 
    loadAds(); 
    loadUsers();
    loadCurrentUser();
  }, []);

  // --- HANDLES DE AÇÃO ---

  const pauseAd = async (id: number) => {
    try {
      await api.post('/admin-manage-ads', { action: 'pause', id });
      loadAds();
    } catch {
      alert("Erro ao pausar anúncio");
    }
  };

  const activateAd = async (id: number) => {
    try {
      await api.post('/admin-manage-ads', { action: 'activate', id });
      loadAds();
    } catch {
      alert("Erro ao ativar anúncio");
    }
  };

  const renewAd = async (id: number, days: number = 30) => {
    try {
      await api.post('/admin-manage-ads', { action: 'renew', id, days });
      loadAds();
    } catch {
      alert("Erro ao renovar anúncio");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja remover este anúncio definitivamente?")) return;
    try {
      await api.post('/admin-manage-ads', { id, action: 'delete' });
      setAds(prev => prev.filter(ad => ad.id !== id));
    } catch {
      alert("Erro ao excluir anúncio.");
    }
  };

  const handleEdit = (ad: any) => {
      resetForm();
      setEditingId(ad.id);
      setTitle(ad.title || '');
      setLink(ad.destination_url || ad.link || ''); 
      setWhatsapp(ad.link_whatsapp || '');
      setDescription(ad.description || '');
      setCategory(ad.category || 'PROMOÇÃO');
      setPosition(ad.position || 'sidebar');
      setLocationCity(ad.location_city || 'Brasil');
      setTargetUserId(ad.user_id || '');
      
      if (ad.image_url) {
          if (ad.image_url.startsWith('http')) {
              setImageMode('url');
              setExternalImageUrl(ad.image_url);
              setPreviewUrl(ad.image_url);
          } else {
              setImageMode('upload');
              setPreviewUrl(getFullImageUrl(ad.image_url));
          }
      }
      setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle(''); setLink(''); setDescription(''); setWhatsapp('');
    setCategory('PROMOÇÃO'); setSelectedFile(null); setPreviewUrl(null);
    setExternalImageUrl(''); setPosition('sidebar'); setLocationCity('Brasil');
    setTargetUserId(''); setImageMode('upload');
  };

  return (
    <PageShell
      title="Publicidade"
      description="Gerencie anúncios publicitários do sistema"
      actions={
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase italic tracking-wider transition-all shadow-lg hover:bg-orange-500"
        >
          <Plus size={18} /> Novo Anúncio
        </button>
      }
    >

      <StatsGrid>
        <StatCard label="Ativos" value={activeAds.length} variant="green" icon={Play} />
        <StatCard label="Expirando" value={expiredAds.length} variant="yellow" icon={AlertTriangle} />
        <StatCard label="Pausados" value={pausedAds.length} variant="default" icon={Pause} />
        <StatCard label="Total" value={allAds.length} icon={BarChart3} />
      </StatsGrid>

      <div className="flex flex-col md:flex-row gap-3 mt-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por campanha, cidade ou categoria..."
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 font-bold text-xs text-slate-900 placeholder:text-slate-400 shadow-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'active', 'expiring_soon', 'paused', 'expired'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                statusFilter === status
                  ? status === 'all' ? 'bg-slate-900 text-white' :
                    status === 'active' || status === 'expiring_soon' ? 'bg-emerald-500 text-white' :
                    status === 'paused' ? 'bg-slate-400 text-white' :
                    'bg-red-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'all' ? 'Todos' :
               status === 'active' ? 'Ativos' :
               status === 'expiring_soon' ? 'Expirando' :
               status === 'paused' ? 'Pausados' : 'Expirados'}
            </button>
          ))}
        </div>

        <TimeFilter value={timeFilter} onChange={handleTimeFilterChange} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Preview</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Campanha</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Anunciante</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest text-center">Performance</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={32} /></td></tr>
              ) : filteredAds.length === 0 ? (
                <tr><td colSpan={6} className="py-20 text-center font-bold text-slate-400 uppercase italic">Nenhum anúncio encontrado</td></tr>
              ) : filteredAds.map((ad: any) => {
                const statusConfig: Record<string, {color: string; bg: string; label: string}> = {
                  active: { color: 'text-emerald-600', bg: 'bg-emerald-100', label: '● ATIVO' },
                  expiring_soon: { color: 'text-amber-600', bg: 'bg-amber-100', label: '● EXPIRANDO' },
                  paused: { color: 'text-slate-500', bg: 'bg-slate-100', label: '○ PAUSADO' },
                  expired: { color: 'text-red-600', bg: 'bg-red-100', label: '● EXPIRADO' }
                };
                const status = statusConfig[ad.computed_status] || statusConfig.active;
                
                return (
                  <tr key={ad.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-20 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative">
                        <img src={getFullImageUrl(ad.image_url)} alt="" className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-800 uppercase italic text-xs">{ad.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] bg-slate-100 px-2 py-0.5 rounded font-black text-slate-500 uppercase">{ad.position}</span>
                        <span className="text-[8px] text-slate-400 font-bold">{ad.location_city}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-slate-700">{ad.user_name || 'Desconhecido'}</p>
                      <p className="text-[9px] text-slate-400 truncate max-w-[150px]">{ad.location_city || 'Nacional'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`${status.bg} ${status.color} text-[9px] font-black px-3 py-1.5 rounded-full uppercase`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-4">
                          <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-800 leading-none">{ad.clicks_count || 0}</span>
                              <span className="text-[7px] font-black text-orange-500 uppercase mt-0.5">Cliques</span>
                          </div>
                          <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-800 leading-none">{ad.views_count || 0}</span>
                              <span className="text-[7px] font-black text-blue-500 uppercase mt-0.5">Views</span>
                          </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {ad.computed_status === 'active' || ad.computed_status === 'expiring_soon' ? (
                          <button onClick={() => pauseAd(ad.id)} className="p-2 bg-amber-100 text-amber-600 rounded-xl hover:bg-amber-500 hover:text-white transition-all">
                            <Pause size={14}/>
                          </button>
                        ) : (
                          <button onClick={() => activateAd(ad.id)} className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all">
                            <Play size={14}/>
                          </button>
                        )}
                        {(ad.computed_status === 'expired' || ad.computed_status === 'paused') && (
                          <button onClick={() => renewAd(ad.id, 30)} className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-500 hover:text-white transition-all">
                            <RotateCcw size={14}/>
                          </button>
                        )}
                        <button onClick={() => handleEdit(ad)} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                          <Pencil size={14}/>
                        </button>
                        <button onClick={() => handleDelete(ad.id)} className="p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  );
}