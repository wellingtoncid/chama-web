import { useState, useEffect, useRef } from 'react';
import { api } from '../../api/api';
import { 
  Megaphone, Upload, X, 
  Trash2, Loader2, Plus, Pencil, 
  Link as LinkIcon, Search, TrendingUp, BarChart3,
  Play, Pause, RotateCcw, AlertTriangle
} from 'lucide-react';
import { useAdPositions } from '../../hooks/useAdPositions';
import { AdminLayout, StatsGrid, StatCard, FilterBar } from '@/components/admin';

export default function AdsManager() {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
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
  const [_viewLimit, _setViewLimit] = useState<number | ''>('');
  const [targetUserId, setTargetUserId] = useState<number | ''>('');
  const [users, setUsers] = useState<{id: number; name: string; email: string}[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const { positions, loading: positionsLoading } = useAdPositions();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cálculos de Métricas - todos os ads
  const allAds = ads;
  const activeAds = allAds.filter(a => a.computed_status === 'active' || a.computed_status === 'expiring_soon');
  const expiredAds = allAds.filter(a => a.computed_status === 'expired');
  const pausedAds = allAds.filter(a => a.computed_status === 'paused');
  
  const totalViews = allAds.reduce((acc, curr) => acc + (Number(curr.views_count) || 0), 0);
  const totalClicks = allAds.reduce((acc, curr) => acc + (Number(curr.clicks_count) || 0), 0);
  const averageCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : "0.00";

  // Filtro lógico inteligente
  const filteredAds = ads.filter(ad => {
    const matchesSearch = 
      ad.title?.toLowerCase().includes(filter.toLowerCase()) || 
      ad.location_city?.toLowerCase().includes(filter.toLowerCase()) ||
      ad.category?.toLowerCase().includes(filter.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ad.computed_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Unificação da lógica de Imagem 
  const getFullImageUrl = (path: string) => {
    if (!path || path.trim() === "") return 'https://placehold.co/800x400/f1f5f9/64748b?text=Sem+Imagem';
    if (path.startsWith('http')) return path;
    
    // Remove any leading slashes and api/ prefix
    const cleanPath = path.replace(/^\//, '').replace(/^api\//, '');
    
    // For ads, the path is already uploads/ads/filename
    return `http://127.0.0.1:8000/${cleanPath}`;
  };

  // Carregar anúncios do admin endpoint
  const loadAds = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin-ads');
      console.log('API Response:', res.data);
      const adsData = res.data?.data || res.data || [];
      setAds(Array.isArray(adsData) ? adsData : []);
      console.log('Ads loaded:', adsData.length);
    } catch (error: any) {
      console.error("Erro ao carregar anúncios", error);
      console.error("Response:", error.response?.data);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadAds(); 
    loadUsers();
    loadCurrentUser();
  }, []);

  // Ações de gerenciamento de anúncios
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

  const loadUsers = async () => {
    try {
      const res = await api.get('/companies');
      const companiesData = res.data?.companies || res.data?.data || res.data || [];
      setUsers(companiesData);
    } catch {
      console.warn("Erro ao carregar empresas - tentando método alternativo", error);
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
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch {
      console.error("Erro ao carregar usuário atual", e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setExternalImageUrl('');
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

  const handleUpload = async () => {
    if (!title) return alert("Preencha o título");
    if (!link) return alert("Preencha o link de destino");
    if (imageMode === 'upload' && !selectedFile && !editingId) return alert("Carregue uma imagem");
    if (imageMode === 'url' && !externalImageUrl && !editingId) return alert("Informe a URL da imagem");
    setUploading(true);
    try {
      if (imageMode === 'upload' && selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        if (editingId) formData.append('id', editingId.toString());
        formData.append('title', title);
        formData.append('link', link);
        formData.append('category', category);
        formData.append('position', position);
        formData.append('link_whatsapp', whatsapp);
        formData.append('description', description);
        formData.append('location_city', locationCity);
        if (targetUserId) formData.append('target_user_id', targetUserId.toString());

        await api.post('/upload-ad', formData, { 
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        const payload = {
          id: editingId,
          title, 
          link,
          image_url: imageMode === 'url' ? externalImageUrl : undefined,
          category, 
          position,
          link_whatsapp: whatsapp,
          description,
          location_city: locationCity,
          target_user_id: targetUserId || undefined,
          action: editingId ? 'update' : 'create'
        };
        await api.post('/upload-ad', payload);
      }
      setIsModalOpen(false);
      resetForm();
      loadAds();
    } catch {
      alert("Erro ao salvar anúncio. Verifique o console.");
    } finally {
      setUploading(false);
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

  const resetForm = () => {
    setEditingId(null);
    setTitle(''); setLink(''); setDescription(''); setWhatsapp('');
    setCategory('PROMOÇÃO'); setSelectedFile(null); setPreviewUrl(null);
    setExternalImageUrl(''); setPosition('sidebar'); setLocationCity('Brasil');
    setTargetUserId(''); setImageMode('upload');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* MÉTRICAS GERAIS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-emerald-500 p-4 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[9px] font-black uppercase opacity-70 italic mb-1">Ativos</p>
            <h3 className="text-2xl font-black italic">{activeAds.length}</h3>
          </div>
          <Play className="absolute -right-2 -bottom-2 text-white/20" size={50} />
        </div>

        <div className="bg-amber-500 p-4 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[9px] font-black uppercase opacity-70 italic mb-1">Expirando</p>
            <h3 className="text-2xl font-black italic">{expiredAds.length}</h3>
          </div>
          <AlertTriangle className="absolute -right-2 -bottom-2 text-white/20" size={50} />
        </div>

        <div className="bg-slate-400 p-4 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[9px] font-black uppercase opacity-70 italic mb-1">Pausados</p>
            <h3 className="text-2xl font-black italic">{pausedAds.length}</h3>
          </div>
          <Pause className="absolute -right-2 -bottom-2 text-white/20" size={50} />
        </div>

        <div className="bg-slate-900 p-4 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[9px] font-black uppercase opacity-50 italic mb-1">Total</p>
            <h3 className="text-2xl font-black italic">{allAds.length}</h3>
          </div>
          <BarChart3 className="absolute -right-2 -bottom-2 text-white/20" size={50} />
        </div>

        <div className="bg-orange-500 p-4 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[9px] font-black uppercase opacity-50 italic mb-1">CTR Médio</p>
            <h3 className="text-2xl font-black italic">{averageCTR}%</h3>
          </div>
          <TrendingUp className="absolute -right-2 -bottom-2 text-white/20" size={50} />
        </div>
      </div>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase italic text-slate-800 leading-tight">Publicidade</h2>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Painel de Controle</p>
            </div>
          </div>
          
          {/* Filtro de Status */}
          <div className="flex gap-2 ml-0 md:ml-4">
            {['all', 'active', 'expiring_soon', 'paused', 'expired'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                  statusFilter === status 
                    ? status === 'all' ? 'bg-slate-900 text-white' :
                      status === 'active' ? 'bg-emerald-500 text-white' :
                      status === 'expiring_soon' ? 'bg-amber-500 text-white' :
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
          
          <div className="relative w-full md:w-56 ml-0 md:ml-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 transition-all rounded-xl py-2 pl-10 pr-4 text-[10px] font-bold outline-none"
            />
          </div>
        </div>

        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="w-full md:w-auto bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase italic shadow-lg hover:bg-orange-500 transition-all flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Novo
        </button>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
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
                    {ad.expires_at && (
                      <p className="text-[8px] text-slate-400 mt-1">
                        Expira: {new Date(ad.expires_at).toLocaleDateString('pt-BR')}
                        {ad.days_until_expiry !== null && ad.days_until_expiry >= 0 && ad.computed_status !== 'expired' && (
                          <span className={ad.days_until_expiry <= 3 ? 'text-amber-600 font-bold' : ''}>
                            {' '} ({ad.days_until_expiry}d)
                          </span>
                        )}
                        {ad.days_until_expiry !== null && ad.days_until_expiry < 0 && (
                          <span className="text-red-600 font-bold"> expirado há {Math.abs(ad.days_until_expiry)}d</span>
                        )}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-black text-slate-700">{ad.user_name || 'Desconhecido'}</p>
                    <p className="text-[9px] text-slate-400 truncate max-w-[150px]">{ad.location_city || 'Nacional'}{ad.location_state ? `, ${ad.location_state}` : ''}</p>
                    {ad.destination_url && <p className="text-[8px] text-blue-500 truncate max-w-[150px]" title={ad.destination_url}>Link: {ad.destination_url}</p>}
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
                        <div className="flex flex-col">
                            <span className="text-sm font-black text-emerald-600 leading-none">
                              {ad.views_count > 0 ? ((ad.clicks_count / ad.views_count) * 100).toFixed(1) : 0}%
                            </span>
                            <span className="text-[7px] font-black text-slate-400 uppercase mt-0.5">CTR</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Pausar / Ativar */}
                      {ad.computed_status === 'active' || ad.computed_status === 'expiring_soon' ? (
                        <button 
                          onClick={() => pauseAd(ad.id)} 
                          className="p-2 bg-amber-100 text-amber-600 rounded-xl hover:bg-amber-500 hover:text-white transition-all"
                          title="Pausar"
                        >
                          <Pause size={14}/>
                        </button>
                      ) : (
                        <button 
                          onClick={() => activateAd(ad.id)} 
                          className="p-2 bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                          title="Ativar"
                        >
                          <Play size={14}/>
                        </button>
                      )}
                      
                      {/* Renovar */}
                      {(ad.computed_status === 'expired' || ad.computed_status === 'paused') && (
                        <button 
                          onClick={() => renewAd(ad.id, 30)} 
                          className="p-2 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                          title="Renovar por 30 dias"
                        >
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

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="font-black italic uppercase text-slate-800 text-xl leading-none">Configurar Anúncio</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{editingId ? 'Editar Campanha' : 'Nova Campanha'}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-slate-100 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all"><X size={20}/></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                    <button 
                        onClick={() => setImageMode('upload')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${imageMode === 'upload' ? 'bg-white shadow-sm text-orange-500' : 'text-slate-400'}`}
                    >
                        <Upload size={14}/> Arquivo
                    </button>
                    <button 
                        onClick={() => setImageMode('url')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${imageMode === 'url' ? 'bg-white shadow-sm text-orange-500' : 'text-slate-400'}`}
                    >
                        <LinkIcon size={14}/> URL Externa
                    </button>
                </div>

                {imageMode === 'upload' ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-4 border-dashed rounded-[2.5rem] p-4 flex flex-col items-center justify-center cursor-pointer h-48 relative overflow-hidden transition-all hover:border-orange-300 ${previewUrl ? 'border-orange-500' : 'border-slate-100'}`}
                    >
                        {previewUrl ? <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover" /> : (
                          <div className="text-center">
                            <Upload className="text-slate-300 mx-auto mb-2" size={32} />
                            <p className="text-[8px] font-black text-slate-400 uppercase">Clique para selecionar</p>
                          </div>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Link da Imagem (Unsplash/Pexels)</label>
                        <input 
                            type="text" 
                            placeholder="https://..." 
                            value={externalImageUrl} 
                            onChange={(e) => {setExternalImageUrl(e.target.value); setPreviewUrl(e.target.value);}} 
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none focus:ring-2 ring-orange-500/20" 
                        />
                        {previewUrl && <img src={previewUrl} className="w-full h-24 object-cover rounded-2xl mt-2 border border-slate-100" />}
                    </div>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Local de Exibição (onde vai aparecer no site)</label>
                  {positionsLoading ? (
                    <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-400">Carregando...</div>
                  ) : (
                    <select value={position} onChange={(e) => setPosition(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none">
                      <option value="">Selecione uma posição...</option>
                      {positions.map(pos => (
                        <option key={pos.feature_key} value={pos.feature_key}>
                          {pos.feature_name} - R$ {Number(pos.price_monthly).toFixed(2).replace('.', ',')}/mês
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {/* Selecionar Usuário/Empresa */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Criar em nome de (Empresa)</label>
                  <select 
                    value={targetUserId} 
                    onChange={(e) => setTargetUserId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none"
                  >
                    <option value="">Selecione uma empresa...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Título do Cliente/Campanha</label>
                  <input type="text" placeholder="Ex: Olist - Marketplace" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Link de Destino (URL)</label>
                  <input type="text" placeholder="https://..." value={link} onChange={(e) => setLink(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">WhatsApp (opicional)</label>
                  <input type="text" placeholder="https://wa.me/..." value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Cidade (Filtro)</label>
                  <input type="text" placeholder="Ex: Curitiba ou Brasil" value={locationCity} onChange={(e)=>setLocationCity(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none" />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Descrição Curta</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none h-20 resize-none" placeholder="Texto descritivo do anúncio..." />
                </div>
              </div>
            </div>

            <button 
              disabled={uploading}
              onClick={handleUpload}
              className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs mt-8 hover:bg-orange-500 transition-all shadow-xl flex items-center justify-center gap-2"
            >
              {uploading ? <Loader2 className="animate-spin" size={18} /> : (editingId ? "SALVAR ALTERAÇÕES" : "PUBLICAR AGORA")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}