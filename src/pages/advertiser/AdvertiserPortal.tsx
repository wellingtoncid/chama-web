import { useState, useEffect, useMemo } from 'react';
import { 
  Megaphone, PlusCircle, Loader2, X,
  Image as ImageIcon, Pencil, Trash2, Crown, Star, Heart,
  Check, Lock, ChevronLeft, ChevronRight, MapPin
} from 'lucide-react';
import { api, BASE_URL_API } from '../../api/api';
import Swal from 'sweetalert2';
import { getStates, getCitiesByState } from '../../services/location';
import { useAdPositions } from '../../hooks/useAdPositions';
import DashboardShell from '../../components/layout/DashboardShell';
import { Button } from '../../components/ui/Button';
import ConfirmModal from '../../components/shared/ConfirmModal';
import { AD_POSITIONS, AD_POSITION_LABEL, AD_POSITION_SIZE, ADMIN_ONLY_KEYS } from '../../constants/adPositions';
import DataTable, { type TableColumn, type TableAction } from '@/components/admin/DataTable';

const TIER_MAP: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  sponsor_master: { icon: <Crown size={16} />, label: 'Oferecimento Master', color: 'text-yellow-600 dark:text-yellow-400' },
  maintainer_premium: { icon: <Star size={16} />, label: 'Mantenedor Premium', color: 'text-blue-600 dark:text-blue-400' },
  supporter_connect: { icon: <Heart size={16} />, label: 'Apoiador Connect', color: 'text-rose-600 dark:text-rose-400' },
};

const fmtDate = (d: string) => {
  if (!d) return '-';
  const parts = d.split(' ')[0].split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

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
  const [stats, setStats] = useState({ views: 0, clicks: 0 });
  const [myAds, setMyAds] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [states, setStates] = useState<{sigla: string, nome: string}[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  
  const { positions, loading: positionsLoading, getIcon } = useAdPositions();
  
  // Plan info
  const [activePlan, setActivePlan] = useState<any>(null);
  const [includedPositions, setIncludedPositions] = useState<string[]>([]);
  const [positionLimits, setPositionLimits] = useState<Record<string, number>>({});
  const [periodStart, setPeriodStart] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(myAds.length / pageSize);
  const pagedAds = myAds.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => { setCurrentPage(1); }, [myAds.length]);

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
      setStats({ views: totalViews, clicks: totalClicks });

    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar plano ativo e posições incluídas
  useEffect(() => {
    const loadPlanInfo = async () => {
      try {
        const [plansRes, modsRes, pricingRes] = await Promise.all([
          api.get('/plans').catch(() => ({ data: { success: false } })),
          api.get('/user/modules').catch(() => ({ data: { success: false } })),
          api.get('/pricing/rules').catch(() => ({ data: { success: false } })),
        ]);

        if (!plansRes.data?.success || !modsRes.data?.success) return;

        const plans = plansRes.data.plans || plansRes.data.data || [];
        const modules = modsRes.data.data?.modules || [];
        const advertiserMod = modules.find((m: any) => m.key === 'advertiser');

        if (advertiserMod?.plan_id) {
          const plan = plans.find((p: any) => p.id === advertiserMod.plan_id);
          if (plan) {
            setActivePlan(plan);
            const features = plan.features || {};
            setPositionLimits(features.position_limits || {});

            // Compute billing period start
            const durationDays = plan.duration_days || 30;
            if (advertiserMod.expires_at) {
              const expires = new Date(advertiserMod.expires_at);
              const start = new Date(expires.getTime() - durationDays * 86400000);
              setPeriodStart(start.toISOString().split('T')[0]);
            } else if (advertiserMod.activated_at) {
              setPeriodStart(advertiserMod.activated_at.split('T')[0]);
            } else {
              setPeriodStart(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]);
            }

            const pos = features.positions;
            const positions = (Array.isArray(pos) && pos.length > 0 ? pos : [])
              .filter((p: string) => !ADMIN_ONLY_KEYS.includes(p));
            setIncludedPositions(positions);
          }
        }

        if (pricingRes.data?.success) {
          const rules = pricingRes.data.data || [];
          const chatRule = rules.find((r: any) => r.module_key === 'advertiser' && r.feature_key === 'chat_header');
          if (chatRule && Number(chatRule.price_monthly) === 0 && Number(chatRule.price_per_use) === 0) {
            setIncludedPositions(prev => prev.includes('chat_header') ? prev : [...prev, 'chat_header']);
          }
        }
      } catch (e) {
        console.error('Erro ao carregar plano:', e);
      }
    };
    if (hasAccess) loadPlanInfo();
  }, [hasAccess]);

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-emerald-500 p-4 rounded-2xl text-white shadow-lg">
          <p className="text-[9px] font-black uppercase opacity-70 italic mb-1">Anúncios Ativos</p>
          <h3 className="text-2xl font-black italic">{myAds.filter(a => a.status === 'active' && (!a.expires_at || new Date(a.expires_at) >= new Date())).length}</h3>
        </div>
        <div className="bg-blue-500 p-4 rounded-2xl text-white shadow-lg">
          <p className="text-[9px] font-black uppercase opacity-70 italic mb-1">Visualizações</p>
          <h3 className="text-2xl font-black italic">{stats.views.toLocaleString()}</h3>
        </div>
        <div className="bg-purple-500 p-4 rounded-2xl text-white shadow-lg">
          <p className="text-[9px] font-black uppercase opacity-70 italic mb-1">Cliques</p>
          <h3 className="text-2xl font-black italic">{stats.clicks.toLocaleString()}</h3>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl text-white shadow-lg">
          <p className="text-[9px] font-black uppercase opacity-70 italic mb-1">Total</p>
          <h3 className="text-2xl font-black italic">{myAds.length}</h3>
        </div>
      </div>

      {/* Plano Ativo */}
      {activePlan && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-5">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600">
                  <Check size={20} />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">
                    Plano: {activePlan.name}
                  </h3>
                  {(() => {
                    const tier = TIER_MAP[activePlan.advertiser_tier as string];
                    return tier ? (
                      <span className={`inline-flex items-center gap-1 text-xs font-bold ${tier.color}`}>
                        {tier.icon} {tier.label}
                      </span>
                    ) : null;
                  })()}
                </div>
              </div>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                R$ {Number(activePlan.price).toFixed(2).replace('.', ',')}/mês
              </span>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Posições incluídas no seu plano:</p>
              <div className="flex flex-wrap gap-2">
                {includedPositions.map(pos => {
                  const used = myAds.filter((a: any) =>
                    a.position === pos &&
                    (!periodStart || a.created_at?.split(' ')[0] >= periodStart)
                  ).length;
                  const limit = positionLimits[pos] || 1;
                  return (
                    <span key={pos} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      used >= limit
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {used >= limit ? <Lock size={10} /> : <Check size={10} />}
                      {AD_POSITION_LABEL[pos] || pos}
                      <span className="opacity-70">{used}/{limit}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Anúncios */}
      {(() => {
        if (loading || positionsLoading) {
          return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-orange-500" size={32} />
              </div>
            </div>
          );
        }
        if (myAds.length === 0) {
          return (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden p-12 text-center">
              <Megaphone size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold">Nenhum anúncio criado</p>
              <Button onClick={() => setShowCreateModal(true)} variant="link" className="mt-4">
                Criar primeiro anúncio
              </Button>
            </div>
          );
        }
        return null;
      })()}
      {!loading && !positionsLoading && myAds.length > 0 && (() => {
        const adColumns: TableColumn<any>[] = [
          {
            key: 'image_url',
            label: 'Preview',
            render: (val, row) => (
              <div className="w-16 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                {val ? (
                  <img src={getImageUrl(val) || ''} alt={row.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon className="text-slate-300" size={16} /></div>
                )}
              </div>
            ),
          },
          {
            key: 'title',
            label: 'Anúncio',
            render: (val, row) => (
              <>
                <p className="font-bold text-slate-800 text-sm dark:text-slate-200">{val as string}</p>
                <p className="text-[8px] text-slate-400">{row.location_city || 'Brasil'} • {row.position}</p>
              </>
            ),
          },
          {
            key: 'position',
            label: 'Posição',
            render: (val) => {
              const info = getPositionInfo(val as string);
              return <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-bold text-slate-600 dark:text-slate-300 uppercase">{info.name}</span>;
            },
          },
          {
            key: 'created_at',
            label: 'Data',
            render: (val) => <span className="text-xs font-bold text-slate-500">{fmtDate(val as string)}</span>,
          },
          {
            key: 'expires_at',
            label: 'Expira',
            render: (val, row) => {
              const isExpired = val && new Date(val as string) < new Date();
              return <span className={`text-xs font-bold ${isExpired ? 'text-red-400' : 'text-slate-500'}`}>{fmtDate(val as string)}</span>;
            },
          },
          {
            key: 'status',
            label: 'Status',
            render: (val, row) => {
              const expiresAt = row.expires_at ? new Date(row.expires_at as string) : null;
              const isExpired = expiresAt && expiresAt < new Date();
              const effective = isExpired ? 'expired' : val;
              const cfg: Record<string, {color: string; bg: string; label: string}> = {
                active: { color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/40', label: 'Ativo' },
                paused: { color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800', label: 'Pausado' },
                expired: { color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/40', label: 'Expirado' },
              };
              const s = cfg[effective as string];
              if (!s) return <span className="text-xs text-slate-400">{String(val)}</span>;
              return <span className={`${s.bg} ${s.color} text-[10px] font-bold px-2.5 py-1 rounded-full`}>{s.label}</span>;
            },
          },
          {
            key: 'views_count',
            label: 'Métricas',
            className: 'text-center',
            render: (_, row) => {
              const views = Number(row.views_count) || 0;
              const clicks = Number(row.clicks_count) || 0;
              const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) + '%' : '0%';
              return (
                <div className="flex justify-center gap-3 text-xs">
                  <span><b className="text-slate-800 dark:text-slate-200">{views}</b> <span className="text-[8px] text-slate-400">views</span></span>
                  <span><b className="text-slate-800 dark:text-slate-200">{clicks}</b> <span className="text-[8px] text-slate-400">cliques</span></span>
                  <span><b className="text-slate-800 dark:text-slate-200">{ctr}</b> <span className="text-[8px] text-slate-400">CTR</span></span>
                </div>
              );
            },
          },
        ];

        const adActions: TableAction[] = [
          {
            icon: <Pencil size={14} />,
            label: 'Editar',
            onClick: (row: any) => handleEditAd(row),
          },
          {
            icon: <Trash2 size={14} />,
            label: 'Excluir',
            variant: 'danger',
            onClick: (row: any) => setDeleteTarget(row),
          },
        ];

        return (
          <>
            <DataTable
              columns={adColumns}
              data={pagedAds}
              actions={adActions}
              emptyMessage="Nenhum anúncio criado"
              className="dark:bg-slate-900 dark:border-slate-800"
            />
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3">
                <span className="text-xs text-slate-500">
                  {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, myAds.length)} de {myAds.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft size={16} className="text-slate-600 dark:text-slate-300" />
                  </button>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{currentPage} / {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight size={16} className="text-slate-600 dark:text-slate-300" />
                  </button>
                </div>
              </div>
            )}
          </>
        );
      })()}

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
                      {(() => {
                        const size = formData.position ? AD_POSITION_SIZE[formData.position] : null;
                        return size ? (
                          <p className="text-[9px] text-slate-400 mt-0.5">Tamanho recomendado: {size}</p>
                        ) : null;
                      })()}
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
                  {positions.filter(pos => Number(pos.is_public)).map(pos => {
                    const isIncluded = includedPositions.includes(pos.feature_key);
                    const limit = positionLimits[pos.feature_key] || 1;
                    const used = myAds.filter((a: any) =>
                      a.position === pos.feature_key &&
                      (!periodStart || a.created_at?.split(' ')[0] >= periodStart)
                    ).length;
                    const remaining = Math.max(0, limit - used);
                    const full = isIncluded && remaining === 0;
                    return (
                      <option key={pos.feature_key} value={pos.feature_key} disabled={full}>
                        {pos.feature_name} {AD_POSITION_SIZE[pos.feature_key] ? `(${AD_POSITION_SIZE[pos.feature_key]})` : pos.ad_size ? `(${pos.ad_size})` : ''} — {isIncluded ? `INCLUSO (${used}/${limit})` : `${formatPrice(pos.price_monthly)}/mês`}
                      </option>
                    );
                  })}
                </select>

                {/* Info do espaço selecionado */}
                {formData.position && (() => {
                  const posInfo = AD_POSITIONS.find(p => p.key === formData.position);
                  if (!posInfo) return null;
                  return (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl space-y-2">
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{posInfo.description}</p>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} className="text-blue-400 shrink-0" />
                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">{posInfo.pages}</span>
                      </div>
                    </div>
                  );
                })()}

                {formData.position && includedPositions.includes(formData.position) && (() => {
                  const limit = positionLimits[formData.position] || 1;
                  const used = myAds.filter((a: any) =>
                    a.position === formData.position &&
                    (!periodStart || a.created_at?.split(' ')[0] >= periodStart)
                  ).length;
                  return used >= limit ? (
                    <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2">
                      <Lock size={12} className="text-amber-500 shrink-0" />
                      <p className="text-[10px] text-amber-700 dark:text-amber-400">
                        Limite de {limit} anúncio(s) neste período para esta posição. Remova anúncios existentes ou aguarde o próximo ciclo.
                      </p>
                    </div>
                  ) : null;
                })()}
                {formData.position && !includedPositions.includes(formData.position) && (
                  <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2">
                    <Lock size={12} className="text-amber-500 shrink-0" />
                    <p className="text-[10px] text-amber-700 dark:text-amber-400">
                      Esta posição não está incluída no seu plano. Será cobrado valor avulso ao criar o anúncio.
                    </p>
                  </div>
                )}
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
