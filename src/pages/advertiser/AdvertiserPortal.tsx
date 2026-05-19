import { useState, useEffect } from 'react';
import { 
  Megaphone, PlusCircle, Loader2, X,
  Image as ImageIcon, Pencil, Trash2
} from 'lucide-react';
import { api, BASE_URL_API } from '../../api/api';
import Swal from 'sweetalert2';
import { getStates, getCitiesByState } from '../../services/location';
import { useAdPositions } from '../../hooks/useAdPositions';
import DashboardShell from '../../components/layout/DashboardShell';
import { Button } from '../../components/ui/Button';
import ConfirmModal from '../../components/shared/ConfirmModal';

const getImageUrl = (imageUrl: string) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  
  const base = BASE_URL_API.replace(/\/api$/, '').endsWith('/') 
               ? BASE_URL_API.replace(/\/api$/, '').slice(0, -1) 
               : BASE_URL_API.replace(/\/api$/, '');
               
  const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  return `${base}${path}`;
};

export default function AdvertiserPortal({ user: propUser }: { user?: any }) {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);
  const [stats, setStats] = useState({ views: 0, clicks: 0, ctr: '0%' });
  const [myAds, setMyAds] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [states, setStates] = useState<{sigla: string, nome: string}[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  
  const { positions, loading: positionsLoading, getIcon } = useAdPositions();
  
  // Form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    destination_url: '',
    position: 'sidebar',
    location_state: '',
    location_city: '',
    image: null as File | null
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const user = propUser || JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}');

  // Verificar se o módulo está ativo
  useEffect(() => {
    const checkModuleAccess = async () => {
      try {
        const res = await api.get('/user/modules');
        if (res.data?.success) {
          const modules = res.data.data.modules || [];
          const advertiserModule = modules.find((m: any) => m.key === 'advertiser');
          if (!advertiserModule?.is_active) {
            setHasAccess(false);
          }
        }
      } catch (e) {
        console.error('Erro ao verificar acesso:', e);
        setHasAccess(false);
      }
    };
    checkModuleAccess();
  }, []);

  useEffect(() => {
    loadData();
  }, [hasAccess]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const adsRes = await api.get(`/my-ads`);
      const ads = adsRes.data?.data || [];
      setMyAds(ads);
      
      const totalViews = ads.reduce((acc: number, ad: any) => acc + Number(ad.views_count || 0), 0);
      const totalClicks = ads.reduce((acc: number, ad: any) => acc + Number(ad.clicks_count || 0), 0);
      setStats({
        views: totalViews,
        clicks: totalClicks,
        ctr: totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) + '%' : '0%'
      });

    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchStates = async () => {
      const data = await getStates();
      setStates(data);
    };
    fetchStates();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (formData.location_state) {
        setLoadingCities(true);
        try {
          const data = await getCitiesByState(formData.location_state);
          setCities(data);
        } finally {
          setLoadingCities(false);
        }
      } else {
        setCities([]);
      }
    };
    fetchCities();
  }, [formData.location_state]);

  const getPositionInfo = (position: string) => {
    const pos = positions.find(p => p.feature_key === position);
    if (!pos) return { name: position, icon: null, ad_size: '', description: '' };
    const Icon = getIcon(pos.icon_key);
    return { 
      name: pos.feature_name, 
      icon: Icon, 
      ad_size: pos.ad_size || '',
      description: pos.description || ''
    };
  };

  const formatPrice = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num > 0 ? `R$ ${num.toFixed(2).replace('.', ',')}` : 'Grátis';
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.destination_url) {
      return Swal.fire({ icon: 'error', title: 'Erro', text: 'Preencha o título e link de destino' });
    }

    setCreating(true);
    try {
      const data = new FormData();
      if (editingId) {
        data.append('id', editingId.toString());
        data.append('action', 'update');
      }
      data.append('user_id', user.id.toString());
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('destination_url', formData.destination_url);
      data.append('position', formData.position);
      data.append('location_state', formData.location_state);
      data.append('location_city', formData.location_city);
      data.append('status', 'active');
      
      if (formData.image) {
        data.append('image', formData.image);
      }

      const res = await api.post('/ads/save', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        Swal.fire({ icon: 'success', title: 'Sucesso!', text: editingId ? 'Anúncio atualizado!' : 'Anúncio criado com sucesso!' });
        setShowCreateModal(false);
        setFormData({ title: '', description: '', image_url: '', destination_url: '', position: 'sidebar', location_city: '', location_state: '', image: null });
        setPreview(null);
        setEditingId(null);
        loadData();
      } else {
        const msg = res.data?.message || 'Erro ao criar anúncio';
        
        if (res.data?.requires_payment) {
          const price = res.data?.price_monthly || res.data?.price_per_use;
          Swal.fire({
            icon: 'warning',
            title: 'Pagamento Necessário',
            text: `${msg}. Valor: ${formatPrice(price)}`,
            showCancelButton: true,
            confirmButtonText: 'Assinar',
            cancelButtonText: 'Cancelar'
          }).then((result) => {
            if (result.isConfirmed && res.data?.feature_name) {
              api.post('/module/subscribe-monthly', { module_key: 'advertiser', feature_key: formData.position })
                .then(subRes => {
                  if (subRes.data?.success && subRes.data?.url) {
                    window.location.href = subRes.data.url;
                  } else {
                    Swal.fire({ icon: 'error', title: 'Erro', text: subRes.data?.message || 'Erro ao processar pagamento' });
                  }
                });
            }
          });
        } else {
          Swal.fire({ icon: 'error', title: 'Erro', text: msg });
        }
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Erro', text: err.response?.data?.message || 'Erro ao criar anúncio' });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAd = async () => {
    if (!deleteTarget) return;
    try {
      await api.post('/ads/save', { action: 'delete', id: deleteTarget.id });
      Swal.fire({ icon: 'success', title: 'Sucesso', text: 'Anúncio excluído!' });
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Falha ao excluir' });
    }
  };

  const handleEditAd = (ad: any) => {
    setEditingId(ad.id);
    setFormData({
      title: ad.title || '',
      description: ad.description || '',
      image_url: ad.image_url || '',
      destination_url: ad.destination_url || '',
      position: ad.position || 'sidebar',
      location_state: ad.location_state || '',
      location_city: ad.location_city || '',
      image: null
    });
    setPreview(getImageUrl(ad.image_url));
    setShowCreateModal(true);
  };

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6">
          <Megaphone size={40} className="text-amber-500" />
        </div>
        <h2 className="text-2xl font-black uppercase italic text-slate-900 dark:text-white mb-4">
          Módulo Indisponível
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
          O módulo de Publicidade requer aprovação da equipe Chama Frete. 
          Solicite acesso pelo painel da sua empresa.
        </p>
        <Button onClick={() => window.location.href = '/dashboard'} variant="hero" size="lg">
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  return (
    <DashboardShell
      title="Publicidade"
      description="Painel do Anunciante"
      actions={
        <Button onClick={() => setShowCreateModal(true)} size="lg">
          <PlusCircle size={18} /> Novo Anúncio
        </Button>
      }
    >
      {/* Header com métricas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-emerald-500 p-4 rounded-2xl text-white shadow-lg">
          <p className="text-[9px] font-black uppercase opacity-70 italic mb-1">Anúncios Ativos</p>
          <h3 className="text-2xl font-black italic">{myAds.filter(a => a.status === 'active').length}</h3>
        </div>
        <div className="bg-blue-500 p-4 rounded-2xl text-white shadow-lg">
          <p className="text-[9px] font-black uppercase opacity-70 italic mb-1">Visualizações</p>
          <h3 className="text-2xl font-black italic">{stats.views.toLocaleString()}</h3>
        </div>
        <div className="bg-purple-500 p-4 rounded-2xl text-white shadow-lg">
          <p className="text-[9px] font-black uppercase opacity-70 italic mb-1">Cliques</p>
          <h3 className="text-2xl font-black italic">{stats.clicks.toLocaleString()}</h3>
        </div>
        <div className="bg-orange-500 p-4 rounded-2xl text-white shadow-lg">
          <p className="text-[9px] font-black uppercase opacity-70 italic mb-1">CTR</p>
          <h3 className="text-2xl font-black italic">{stats.ctr}</h3>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl text-white shadow-lg">
          <p className="text-[9px] font-black uppercase opacity-70 italic mb-1">Total</p>
          <h3 className="text-2xl font-black italic">{myAds.length}</h3>
        </div>
      </div>

      {/* Lista de Anúncios */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        {loading || positionsLoading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-orange-500" size={32} /></div>
        ) : myAds.length === 0 ? (
          <div className="p-12 text-center">
            <Megaphone size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">Nenhum anúncio criado</p>
            <Button onClick={() => setShowCreateModal(true)} variant="link" className="mt-4">
              Criar primeiro anúncio
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-4 py-3 text-[9px] font-black uppercase text-slate-400">Preview</th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase text-slate-400">Anúncio</th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase text-slate-400">Posição</th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase text-slate-400">Status</th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase text-slate-400 text-center">Métricas</th>
                  <th className="px-4 py-3 text-[9px] font-black uppercase text-slate-400 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myAds.map(ad => {
                  const posInfo = getPositionInfo(ad.position);
                  const statusConfig: Record<string, {color: string; bg: string; label: string}> = {
                    active: { color: 'text-emerald-600', bg: 'bg-emerald-100', label: '● ATIVO' },
                    paused: { color: 'text-slate-500', bg: 'bg-slate-100', label: '○ PAUSADO' },
                    expired: { color: 'text-red-500', bg: 'bg-red-100', label: '● EXPIRADO' }
                  };
                  const status = statusConfig[ad.status] || statusConfig.active;
                  
                  return (
                    <tr key={ad.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="w-16 h-10 bg-slate-100 rounded-lg overflow-hidden">
                          {ad.image_url ? (
                            <img src={getImageUrl(ad.image_url) || ''} alt={ad.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><ImageIcon className="text-slate-300" size={16} /></div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-800 text-sm dark:text-slate-200">{ad.title}</p>
                        <p className="text-[8px] text-slate-400">{ad.location_city || 'Brasil'} • {ad.position}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-600 uppercase">
                          {posInfo.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`${status.bg} ${status.color} text-[9px] font-black px-2 py-1 rounded-full uppercase`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-3 text-xs">
                          <span><b className="text-slate-800">{ad.views_count || 0}</b> <span className="text-[8px] text-slate-400">views</span></span>
                          <span><b className="text-slate-800">{ad.clicks_count || 0}</b> <span className="text-[8px] text-slate-400">cliques</span></span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button onClick={() => handleEditAd(ad)} variant="secondary" size="icon" title="Editar">
                            <Pencil size={14} />
                          </Button>
                          <Button onClick={() => setDeleteTarget(ad)} variant="destructive" size="icon" title="Excluir">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Criar Anúncio */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black uppercase italic">{editingId ? 'Editar Anúncio' : 'Novo Anúncio'}</h2>
              <button onClick={() => { setShowCreateModal(false); setEditingId(null); setFormData({ title: '', description: '', image_url: '', destination_url: '', position: 'sidebar', location_city: '', location_state: '', image: null }); setPreview(null); }}><X size={24} className="text-slate-400" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                <div className={`h-32 rounded-2xl border-2 border-dashed flex items-center justify-center ${preview ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                  {preview ? (
                    <img src={preview} alt="Preview" className="h-full object-contain p-2" />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon className="mx-auto mb-2" size={24} />
                      <p className="text-xs font-bold">Clique para adicionar imagem</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-400 block mb-2">Espaço Publicitário</label>
                <select 
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm"
                >
                  {positions.filter(pos => pos.price_monthly > 0).map(pos => {
                    const Icon = getIcon(pos.icon_key);
                    return (
                      <option key={pos.feature_key} value={pos.feature_key}>
                        {pos.feature_name} - {formatPrice(pos.price_monthly)}/mês ({pos.ad_size || 'variável'})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-400 block mb-2">Título</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Promoção de Pneus"
                  className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 block mb-2">Estado (UF)</label>
                  <select 
                    value={formData.location_state}
                    onChange={(e) => setFormData({ ...formData, location_state: e.target.value, location_city: '' })}
                    className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm"
                  >
                    <option value="">Brasil (Nacional)</option>
                    {states.map(s => (
                      <option key={s.sigla} value={s.sigla}>{s.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-slate-400 block mb-2">
                    Cidade {loadingCities && <Loader2 size={12} className="inline animate-spin" />}
                  </label>
                  <select 
                    value={formData.location_city}
                    onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                    disabled={!formData.location_state || loadingCities}
                    className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm disabled:opacity-50"
                  >
                    <option value="">Todas as cidades</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-400 block mb-2">Link de Destino (URL ou WhatsApp)</label>
                <input 
                  type="url" 
                  value={formData.destination_url}
                  onChange={(e) => setFormData({ ...formData, destination_url: e.target.value })}
                  placeholder="https://wa.me/..."
                  className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-400 block mb-2">Descrição (opcional)</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes do anúncio..."
                  className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm h-20"
                />
              </div>

              <Button 
                type="submit" 
                disabled={creating}
                className="w-full"
                size="xl"
              >
                {creating ? <Loader2 className="animate-spin" size={20} /> : (editingId ? 'Salvar Alterações' : 'Criar Anúncio')}
              </Button>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteAd}
        title="Excluir Anúncio?"
        description={deleteTarget ? `Tem certeza que deseja excluir "${deleteTarget.title}"? Esta ação não pode ser desfeita.` : ''}
        confirmText="Sim, excluir"
        variant="danger"
      />
    </DashboardShell>
  );
}
