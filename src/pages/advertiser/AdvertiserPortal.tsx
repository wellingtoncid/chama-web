import { useState, useEffect } from 'react';
import { 
  Megaphone, LayoutDashboard, BarChart3, CreditCard,
  PlusCircle, Eye, MousePointer2, Loader2, Check, X,
  Layout, Home, Tv, FileText, Instagram, Bell, AlertTriangle,
  Image as ImageIcon, Link as LinkIcon, Type, Pencil, Trash2, Star as StarIcon
} from 'lucide-react';
import { api, BASE_URL_API } from '../../api/api';
import Swal from 'sweetalert2';
import AdvertiserReports from '../../components/advertiser/AdvertiserReports';
import { getStates, getCitiesByState } from '../../services/location';

interface AdPricingRule {
  module_key: string;
  id: number;
  feature_key: string;
  feature_name: string;
  pricing_type: string;
  free_limit: number;
  price_per_use: number;
  price_monthly: number;
  price_daily: number;
  is_active: number;
}

// Posições reais do banco
const AD_POSITIONS = [
  { key: 'sidebar', name: 'Barra Lateral', icon: Layout, description: 'Exibido na barra lateral das páginas', size: '300x250' },
  { key: 'freight_list', name: 'Lista de Fretes', icon: Megaphone, description: 'Publicado entre os fretes', size: '728x90' },
  { key: 'home_hero', name: 'Banner Home', icon: Home, description: 'Destaque no topo da página inicial', size: '1200x400' },
  { key: 'footer', name: 'Rodapé', icon: FileText, description: 'Exibido no rodapé do site', size: '728x90' },
  { key: 'popup', name: 'Popup', icon: AlertTriangle, description: 'Popup entre navegações', size: '500x500' },
  { key: 'spotlight', name: 'Destaque', icon: Star, description: 'Banner em destaque', size: '300x600' },
  { key: 'header', name: 'Cabeçalho', icon: Bell, description: 'No topo do site', size: '728x90' },
  { key: 'in-feed', name: 'No Feed', icon: Instagram, description: 'Entre conteúdos do feed', size: '600x300' },
  { key: 'details_page', name: 'Página de Detalhes', icon: FileText, description: 'Páginas de detalhes', size: '728x90' },
];

function Star({ size, className }: { size: number; className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
}

const getImageUrl = (imageUrl: string) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  
  // Remove o '/api' da URL caso ele exista, pois imagens ficam na raiz pública
  const base = BASE_URL_API.replace(/\/api$/, '').endsWith('/') 
               ? BASE_URL_API.replace(/\/api$/, '').slice(0, -1) 
               : BASE_URL_API.replace(/\/api$/, '');
               
  // Garante que não haja barra dupla se imageUrl já começar com /
  const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  
  return `${base}${path}`;
};

export default function AdvertiserPortal({ user: propUser }: { user?: any }) {
  const [activeTab, setActiveTab] = useState<'home' | 'create' | 'reports'>('home');
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);
  const [stats, setStats] = useState({ views: 0, clicks: 0, ctr: '0%' });
  const [adRules, setAdRules] = useState<AdPricingRule[]>([]);
  const [myAds, setMyAds] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [states, setStates] = useState<{sigla: string, nome: string}[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  
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
      
      // Load ads
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

      // Load pricing rules
      const rulesRes = await api.get('/pricing/rules');
      const allRules = rulesRes.data?.data || [];
      const advertiserRules = allRules.filter((r: AdPricingRule) => r.module_key === 'advertiser');
      setAdRules(advertiserRules);

    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  };

  // Buscar estados ao montar o componente
useEffect(() => {
  const fetchStates = async () => {
    const data = await getStates();
    setStates(data);
  };
  fetchStates();
}, []);

  // Buscar cidades quando o estado selecionado mudar
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

  const getRuleForPosition = (position: string): AdPricingRule | undefined => {
    const map: Record<string, string> = {
      'sidebar': 'sidebar_banner',
      'home_hero': 'home_banner',
      'freight_list': 'sponsored',
      'footer': 'footer_banner',
      'header': 'header_banner',
      'popup': 'video_ad',
      'spotlight': 'spotlight_ad',
      'in-feed': 'infeed_ad',
      'details_page': 'details_ad'
    };
    const featureKey = map[position] || position;
    return adRules.find(r => r.feature_key === featureKey);
  };

  const formatPrice = (value: number | string) => {
    const num = parseFloat(String(value));
    return num > 0 ? `R$ ${num.toFixed(2).replace('.', ',')}` : 'Grátis';
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
        
        // Se precisa pagar
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
              // Redirecionar para assinatura
              const featureKey = formData.position === 'sidebar' ? 'sidebar_banner' : 
                               formData.position === 'home_hero' ? 'home_banner' : 'publish_ad';
              api.post('/module/subscribe-monthly', { module_key: 'advertiser', feature_key: featureKey });
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

  const getPositionInfo = (position: string) => AD_POSITIONS.find(p => p.key === position) || { name: position, icon: Layout, description: '', size: '' };

  const handleDeleteAd = async (adId: number) => {
    const result = await Swal.fire({
      title: 'Excluir Anúncio?',
      text: 'Esta ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await api.post('/ads/save', { action: 'delete', id: adId });
        Swal.fire({ icon: 'success', title: 'Sucesso', text: 'Anúncio excluído!' });
        loadData();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Erro', text: 'Falha ao excluir' });
      }
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

  // Sem acesso ao módulo
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
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black uppercase text-sm"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic text-slate-800">Publicidade</h1>
          <p className="text-slate-400 text-xs font-bold uppercase">Anunciante #{user.id}</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2"
        >
          <PlusCircle size={18} /> Criar Anúncio
        </button>
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        {[
          { id: 'home', label: 'Visão Geral', icon: LayoutDashboard },
          { id: 'create', label: 'Meus Anúncios', icon: Megaphone },
          { id: 'reports', label: 'Relatórios', icon: BarChart3 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl font-bold text-xs uppercase flex items-center gap-2 ${
              activeTab === tab.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" size={32} /></div>
      ) : activeTab === 'home' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100">
            <Eye className="text-blue-500 mb-2" size={24} />
            <p className="text-2xl font-black text-slate-800">{stats.views.toLocaleString()}</p>
            <p className="text-xs text-slate-400 font-bold uppercase">Visualizações</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100">
            <MousePointer2 className="text-emerald-500 mb-2" size={24} />
            <p className="text-2xl font-black text-slate-800">{stats.clicks.toLocaleString()}</p>
            <p className="text-xs text-slate-400 font-bold uppercase">Cliques</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100">
            <Megaphone className="text-orange-500 mb-2" size={24} />
            <p className="text-2xl font-black text-slate-800">{stats.ctr}</p>
            <p className="text-xs text-slate-400 font-bold uppercase">Taxa de Clique</p>
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
          {myAds.length === 0 ? (
            <div className="p-12 text-center">
              <Megaphone size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold">Nenhum anúncio criado</p>
              <button onClick={() => setShowCreateModal(true)} className="mt-4 text-orange-500 font-bold text-sm">
                Criar primeiro anúncio
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {myAds.map(ad => {
                const posInfo = getPositionInfo(ad.position);
                return (
                  <div key={ad.id} className="border border-slate-100 rounded-2xl p-4 flex gap-4">
                    <div className="w-24 h-24 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                      {ad.image_url ? (
                         <img src={getImageUrl(ad.image_url) || undefined} alt={ad.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="text-slate-300" /></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800">{ad.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{posInfo.name}</p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        ad.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {ad.status === 'active' ? 'Ativo' : 'Pendente'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => handleEditAd(ad)} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200" title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDeleteAd(ad.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <p>{ad.views_count || 0} views</p>
                      <p>{ad.clicks_count || 0} cliques</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && <AdvertiserReports userId={user.id} />}

      {/* Modal de Criar Anúncio */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black uppercase italic">{editingId ? 'Editar Anúncio' : 'Novo Anúncio'}</h2>
              <button onClick={() => { setShowCreateModal(false); setEditingId(null); setFormData({ title: '', description: '', image_url: '', destination_url: '', position: 'sidebar',  location_city: '', location_state: '', image: null }); setPreview(null); }}><X size={24} className="text-slate-400" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Preview Upload */}
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

              {/* Posição */}
              <div>
                <label className="text-xs font-black uppercase text-slate-400 block mb-2">Espaço Publicitário</label>
                <select 
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm"
                >
                  {AD_POSITIONS.map(pos => {
                    const rule = getRuleForPosition(pos.key);
                    return (
                      <option key={pos.key} value={pos.key}>
                        {pos.name} - {rule ? formatPrice(rule.price_monthly) + '/mês' : 'Grátis'} ({pos.size})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Título */}
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

              {/* Localização (Estado e Cidade) */}
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

              {/* Link */}
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

              {/* Descrição */}
              <div>
                <label className="text-xs font-black uppercase text-slate-400 block mb-2">Descrição (opicional)</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes do anúncio..."
                  className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm h-20"
                />
              </div>

              <button 
                type="submit" 
                disabled={creating}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-black uppercase flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 className="animate-spin" size={20} /> : (editingId ? 'Salvar Alterações' : 'Criar Anúncio')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
