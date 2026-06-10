import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Plus, MapPin, Trash2, Edit3, Loader2, Zap, TrendingUp, CheckCircle, Star, Search, Share2, Eye, EyeOff, Calendar } from 'lucide-react';
import { api } from '../../api/api';
import Swal from 'sweetalert2';
import { AdImage } from '../../components/AdImage';
import AffiliateInterestModal from './components/AffiliateInterestModal';
import CheckoutModalMarketplace from '../../components/company/CheckoutModalMarketplace';
import { UsageMeter } from '../../components/shared/UsageMeter';
import DashboardShell from '../../components/layout/DashboardShell';
import { StatsGrid, StatCard } from '../../components/admin';


interface ListingItem {
  id: number;
  slug: string;
  title: string;
  main_image?: string;
  images?: string[];
  is_featured?: number;
  category?: string;
  status?: string;
  location_state?: string;
  price: number;
  item_condition?: string;
  expires_at?: string;
  created_at?: string;
  views_count?: number;
  clicks_count?: number;
  contact_requests_count?: number;
}

interface PricingRule {
  feature_key: string;
  price_per_use?: number;
  duration_days?: number;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: 'Ativo', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  sold: { label: 'Vendido', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  paused: { label: 'Pausado', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  expired: { label: 'Expirado', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  deleted: { label: 'Excluído', color: 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400' },
  inactive: { label: 'Inativo', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' },
  pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
};

const STATUS_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'active', label: 'Ativos' },
  { key: 'paused', label: 'Pausados' },
  { key: 'sold', label: 'Vendidos' },
  { key: 'expired', label: 'Expirados' },
];

const getDaysUntilExpiry = (expiresAt: string | null) => {
  if (!expiresAt) return null;
  const expires = new Date(expiresAt);
  const now = new Date();
  const diff = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

const MarketplaceManager = ({ user }: { user: { id: number } }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showAffiliateInterest, setShowAffiliateInterest] = useState(false);
  const [hasAffiliateAccess, setHasAffiliateAccess] = useState(false);
  const [requestsEnabled, setRequestsEnabled] = useState(true);
  const [affiliateLoading, setAffiliateLoading] = useState(true);

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMyItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/my-listings');
      setItems(response.data?.data || response.data || []);
    } catch (error) {
      console.error("Erro ao carregar seus anúncios", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricingRules = async () => {
    try {
      const res = await api.get('/pricing/rules');
      if (res.data?.success) {
        const mpRules = res.data.data.filter((r: { module_key: string }) => r.module_key === 'marketplace');
        setPricingRules(mpRules);
      }
    } catch (error) {
      console.error("Erro ao carregar regras de preço:", error);
    }
  };

  useEffect(() => {
    fetchMyItems();
    fetchPricingRules();
    checkAffiliateAccess();

    if (searchParams.get('showAffiliateModal') === 'true') {
      setShowAffiliateInterest(true);
      navigate('/dashboard/vendas', { replace: true });
    }
  }, [user.id]);

  const checkAffiliateAccess = async () => {
    try {
      const res = await api.get('/affiliate/access');
      if (res.data?.success) {
        setHasAffiliateAccess(res.data.data?.has_access ?? res.data.has_access ?? false);
        setRequestsEnabled(res.data.data?.requests_enabled ?? res.data.requests_enabled ?? true);
      }
    } catch (error) {
      console.error('Erro ao verificar acesso de afiliado:', error);
      setRequestsEnabled(false);
    } finally {
      setAffiliateLoading(false);
    }
  };

  const getEffectiveStatus = (item: ListingItem) => item.expires_at && new Date(item.expires_at) < new Date() ? 'expired' : item.status;

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter(i => getEffectiveStatus(i) === 'active').length;
    const sold = items.filter(i => i.status === 'sold').length;
    const paused = items.filter(i => getEffectiveStatus(i) === 'paused').length;
    const expired = items.filter(i => getEffectiveStatus(i) === 'expired').length;
    const totalViews = items.reduce((acc, i) => acc + (i.views_count || 0), 0);
    const totalLeads = items.reduce((acc, i) => acc + (i.contact_requests_count || 0), 0);
    return { total, active, sold, paused, expired, totalViews, totalLeads };
  }, [items]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (activeTab !== 'all') {
      result = result.filter(i => getEffectiveStatus(i) === activeTab);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(i => i.title.toLowerCase().includes(term));
    }
    return result;
  }, [items, activeTab, searchTerm]);

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const handlePromote = async (item: ListingItem) => {
    setSelectedListingId(item.id);
    setShowCheckoutModal(true);
  };

  const handleMercadoPagoBoost = async (listingId: number, amount: number) => {
    try {
      const res = await api.post('/module/purchase-per-use', {
        module_key: 'marketplace',
        feature_key: 'featured_listing',
        listing_id: listingId,
        payment_method: 'mercadopago',
        amount: amount,
      });

      if (res.data?.success && res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch {
      Swal.fire({
        title: 'Erro',
        text: 'Erro ao processar pagamento.',
        icon: 'error',
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
        color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
      });
    }
  };

  const handleMercadoPagoExtend = async (listingId: number, amount: number) => {
    try {
      const res = await api.post('/module/purchase-per-use', {
        module_key: 'marketplace',
        feature_key: 'bump',
        listing_id: listingId,
        payment_method: 'mercadopago',
        amount: amount,
      });

      if (res.data?.success && res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch {
      Swal.fire({
        title: 'Erro',
        text: 'Erro ao processar pagamento.',
        icon: 'error',
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
        color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
      });
    }
  };

  const handleExtend = async (item: ListingItem) => {
    const bumpRule = pricingRules.find((r) => r.feature_key === 'bump');
    const price = Number(bumpRule?.price_per_use) || 6.90;
    const days = bumpRule?.duration_days || 7;

    const result = await Swal.fire({
      title: 'Prorrogar Anúncio',
      html: `
        <div class="text-left space-y-3">
          <p>Adicione mais ${days} dias ao seu anúncio!</p>
          <div class="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl">
            <p class="font-bold text-2xl text-blue-600">R$ ${price.toFixed(2).replace('.', ',')}</p>
            <p class="text-xs text-slate-500">por +${days} dias</p>
          </div>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Prorrogar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3B82F6',
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
      color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
    });

    if (result.isConfirmed) {
      setProcessingId(`extend-${item.id}`);
      try {
        const res = await api.post('/listing/extend', {
          listing_id: item.id,
        });

        if (res.data?.success) {
          Swal.fire({
            title: 'Sucesso!',
            text: res.data.message || `Anúncio prorrogado por mais ${days} dias!`,
            icon: 'success',
            background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
            color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
          });
          fetchMyItems();
        }
      } catch (error: unknown) {
        const err = error as { response?: { status?: number; data?: { message?: string; balance?: number; required?: number } } };
        const status = err.response?.status;
        const resData = err.response?.data;

        if (status === 402) {
          const balance = resData?.balance || 0;
          const required = resData?.required || price;

          Swal.fire({
            title: 'Saldo Insuficiente',
            html: `
              <div class="text-left space-y-2">
                <p>Você precisa de <strong>R$ ${required.toFixed(2).replace('.', ',')}</strong> para prorrogar.</p>
                <p class="text-slate-500">Saldo atual: <strong>R$ ${balance.toFixed(2).replace('.', ',')}</strong></p>
              </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Recarregar Carteira',
            cancelButtonText: 'Pagar com Mercado Pago',
            confirmButtonColor: '#059669',
            cancelButtonColor: '#3B82F6',
            reverseButtons: true,
            background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
            color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
          }).then((swalResult) => {
            if (swalResult.isConfirmed) {
              navigate('/dashboard/financeiro');
            } else if (swalResult.isDismissed) {
              handleMercadoPagoExtend(item.id, price);
            }
          });
        } else {
          Swal.fire({
            title: 'Erro',
            text: resData?.message || 'Erro ao prorrogar.',
            icon: 'error',
            background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
            color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
          });
        }
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleTogglePause = async (item: ListingItem) => {
    if (item.status === 'paused' && item.expires_at && new Date(item.expires_at) < new Date()) {
      Swal.fire({ icon: 'warning', title: 'Anúncio Expirado', text: 'Este anúncio venceu. Renove antes de reativar.', confirmButtonText: 'Renovar Agora' }).then(() => handleExtend(item));
      return;
    }
    const newStatus = item.status === 'paused' ? 'active' : 'paused';
    const label = newStatus === 'paused' ? 'Pausar' : 'Reativar';
    try {
      await api.put(`/listings/${item.id}`, { status: newStatus });
      Swal.fire({ icon: 'success', title: `${label}do!`, timer: 1200, showConfirmButton: false });
      fetchMyItems();
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro', text: `Erro ao ${label.toLowerCase()} anúncio.` });
    }
  };

  const handleMarkAsSold = async (item: ListingItem) => {
    const result = await Swal.fire({
      title: 'Marcar como Vendido?',
      text: `Confirmar que "${item.title}" foi vendido?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, vendido!',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3B82F6',
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
      color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
    });
    if (!result.isConfirmed) return;
    try {
      await api.put(`/listings/${item.id}`, { status: 'sold' });
      Swal.fire({ icon: 'success', title: 'Vendido!', timer: 1200, showConfirmButton: false });
      fetchMyItems();
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao marcar como vendido.' });
    }
  };

  const handleShare = async (item: ListingItem) => {
    const url = `${window.location.origin}/anuncio/${item.slug}`;
    const result = await Swal.fire({
      title: 'Compartilhar Anúncio',
      html: `
        <div class="text-left space-y-3">
          <div class="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <input type="text" value="${url}" readonly id="share-url"
              class="flex-1 bg-transparent text-sm font-bold text-slate-600 dark:text-slate-300 outline-none" />
            <button onclick="navigator.clipboard.writeText('${url}')"
              class="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-bold">Copiar</button>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Compartilhar no WhatsApp',
      cancelButtonText: 'Fechar',
      confirmButtonColor: '#25D366',
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
      color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
    });
    if (result.isConfirmed) {
      const text = `Olá! Confira este anúncio no Chama Frete: ${item.title} - ${url}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleView = (item: ListingItem) => {
    navigate(`/anuncio/${item.slug}`);
  };

  const handleEdit = (item: ListingItem) => {
    navigate(`/editar-anuncio/${item.id}`);
  };

  const handleDelete = async (item: ListingItem) => {
    const result = await Swal.fire({
      title: 'Excluir Anúncio?',
      html: `
        <p class="text-sm text-slate-500 mb-4">Conte-nos o motivo da exclusão (opcional):</p>
        <select id="swal-delete-reason" class="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">Selecione um motivo...</option>
          <option value="Vendi por outro canal">Vendi por outro canal</option>
          <option value="Desisti de vender">Desisti de vender</option>
          <option value="Anúncio duplicado">Anúncio duplicado</option>
          <option value="Produto não está mais disponível">Produto não está mais disponível</option>
          <option value="Outro">Outro</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#DC2626',
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
      color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
      preConfirm: () => {
        const select = document.getElementById('swal-delete-reason') as HTMLSelectElement;
        return select?.value || '';
      },
    });

    if (!result.isConfirmed) return;

    const reason = result.value;
    try {
      const payload: any = { id: item.id };
      if (reason) payload.reason = reason;
      const res = await api.post('/delete-listing', payload);
      if (res.data?.success) {
        Swal.fire({ icon: 'success', title: 'Excluído!', timer: 1200, showConfirmButton: false });
        fetchMyItems();
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao excluir anúncio.' });
    }
  };

  return (
    <DashboardShell
      title="Marketplace"
      description="Gerencie seus itens à venda no ecossistema"
      actions={
        <div className="flex items-center gap-3">
          <UsageMeter moduleKey="marketplace" hideCreateButton />
          <button
            onClick={() => navigate('/novo-anuncio')}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-4 py-2.5 rounded-xl font-bold uppercase flex items-center gap-3 transition-all text-xs tracking-wide shadow-lg shadow-sky-200 dark:shadow-sky-900/30"
          >
            <ShoppingBag size={16} />
            Novo Anúncio
          </button>
        </div>
      }
    >
      {/* Affiliate Section */}
      {!affiliateLoading && (requestsEnabled || hasAffiliateAccess) && (
        <div className={`rounded-3xl border-2 overflow-hidden ${
          hasAffiliateAccess
            ? 'border-amber-300 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10'
            : 'border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${
                  hasAffiliateAccess
                    ? 'bg-amber-100 dark:bg-amber-900/30'
                    : 'bg-slate-100 dark:bg-slate-700'
                }`}>
                  <Star size={24} className={hasAffiliateAccess ? 'text-amber-500 fill-amber-500' : 'text-slate-400'} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic">
                      Anúncios de Afiliado
                    </h3>
                    {hasAffiliateAccess && (
                      <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase flex items-center gap-1">
                        <CheckCircle size={12} /> Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {hasAffiliateAccess
                      ? 'Anuncie produtos do Mercado Livre e ganhe comissões'
                      : 'Anuncie produtos do Mercado Livre no Chama Frete'
                    }
                  </p>
                </div>
              </div>

              {hasAffiliateAccess ? (
                <button
                  onClick={() => navigate('/novo-anuncio?affiliate=true')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all"
                >
                  <Plus size={18} /> Criar Anúncio ML
                </button>
              ) : (
                <button
                  onClick={() => setShowAffiliateInterest(true)}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-slate-100 transition-all"
                >
                  <Star size={18} className="fill-current" /> Solicitar Acesso
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {!loading && items.length > 0 && (
        <StatsGrid>
          <StatCard label="Ativos" value={stats.active} icon={ShoppingBag} variant="green" />
          <StatCard label="Pausados" value={stats.paused} icon={EyeOff} variant="yellow" />
          <StatCard label="Vendidos" value={stats.sold} icon={CheckCircle} variant="blue" />
          <StatCard label="Visualizações" value={stats.totalViews} icon={Eye} variant="orange" />
        </StatsGrid>
      )}

      {/* Search + Status Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 lg:p-5 border-b border-slate-100 dark:border-slate-700 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar nos seus anúncios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {STATUS_TABS.map((tab) => {
              const count = tab.key === 'all' ? items.length : items.filter(i => getEffectiveStatus(i) === tab.key).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[3rem] p-20 text-center">
            <div className="bg-slate-50 dark:bg-slate-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="text-slate-300 dark:text-slate-500" size={32} />
            </div>
            <h3 className="text-xl font-black uppercase italic text-slate-400 dark:text-slate-500">
              {searchTerm ? 'Nenhum resultado encontrado' : activeTab === 'all' ? 'Nenhum item anunciado' : 'Nenhum anúncio com este status'}
            </h3>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
              {searchTerm ? 'Tente outros termos de busca.' : 'Que tal desapegar de algo relacionado a transporte e logística?'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 lg:p-5">
            {filteredItems.map((item) => {
              const imageUrl = item.main_image || item.images?.[0];
              const isProcessing = processingId === `boost-${item.id}`;
              const daysLeft = getDaysUntilExpiry(item.expires_at);
              const effectiveStatus = getEffectiveStatus(item);

              return (
                <div key={item.id} className={`bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border shadow-sm group hover:shadow-lg transition-all flex flex-col ${
                  item.is_featured ? 'border-amber-400 dark:border-amber-600 ring-2 ring-amber-200 dark:ring-amber-800' : 'border-slate-200 dark:border-slate-700'
                }`}>
                  {/* Imagem */}
                  <div className="h-44 bg-slate-100 dark:bg-slate-700 relative overflow-hidden cursor-pointer" onClick={() => handleView(item)}>
                    {imageUrl ? (
                      <AdImage url={imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={item.title} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30">
                          <rect width="18" height="18" x="3" y="3" rx="2"/>
                          <circle cx="9" cy="9" r="2"/>
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                        </svg>
                      </div>
                    )}

                    {item.is_featured === 1 && (
                      <div className="absolute top-3 left-3 bg-orange-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <TrendingUp size={10} /> DESTAQUE
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[9px] font-bold uppercase">
                      {item.category}
                    </div>
                    {item.item_condition && (
                      <div className="absolute bottom-3 left-3 bg-black/70 text-white text-[10px] px-2.5 py-1 rounded-lg font-bold">
                        {item.item_condition}
                      </div>
                    )}
                    {Number((item as any).accepting_offers) === 1 && (
                      <div className="absolute bottom-3 right-3 bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full text-[7px] font-bold leading-tight">
                        Aceito ofertas
                      </div>
                    )}
                    {Number((item as any).accepting_trade) === 1 && (
                      <div className="absolute bottom-9 right-3 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full text-[7px] font-bold leading-tight">
                        Aceito troca
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="p-4 pt-3 flex flex-col flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${STATUS_MAP[effectiveStatus]?.color || 'bg-slate-100 text-slate-500'}`}>
                        {STATUS_MAP[effectiveStatus]?.label || effectiveStatus}
                      </span>
                      <span className="text-[9px] text-slate-400 flex items-center gap-1">
                        <Calendar size={9} />
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : '—'}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-snug mb-2 uppercase cursor-pointer hover:text-orange-500 transition-colors flex-1" onClick={() => handleView(item)}>
                      {item.title}
                    </h4>

                    {/* Performance row */}
                    <div className="flex items-center gap-3 mb-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1"><Eye size={10} /> {item.views_count || 0}</span>
                      {daysLeft !== null && (
                        <span className={`flex items-center gap-1 ${daysLeft <= 3 ? 'text-red-500 font-bold' : ''}`}>
                          <Calendar size={10} /> {daysLeft <= 0 ? 'Venceu' : `${daysLeft}d`}
                        </span>
                      )}
                      {item.location_state && (
                        <span className="flex items-center gap-0.5 ml-auto">
                          <MapPin size={10} /> {item.location_state}
                        </span>
                      )}
                    </div>

                    {/* Preço */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                      </p>
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(item); }}
                        className="flex-1 flex items-center justify-center gap-1 p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-all text-[9px] font-bold uppercase"
                        title="Editar"
                      >
                        <Edit3 size={12} /> Editar
                      </button>
                      {effectiveStatus === 'active' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkAsSold(item); }}
                          className="flex-1 flex items-center justify-center gap-1 p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all font-bold text-[9px] uppercase"
                          title="Marcar como Vendido"
                        >
                          <CheckCircle size={12} /> Vendido
                        </button>
                      )}
                      {((effectiveStatus === 'active') || (effectiveStatus === 'paused' && (!item.expires_at || new Date(item.expires_at) >= new Date()))) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleTogglePause(item); }}
                          className="flex items-center justify-center p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-yellow-100 dark:hover:bg-yellow-900/30 hover:text-yellow-600 transition-all"
                          title={item.status === 'paused' ? 'Reativar' : 'Pausar'}
                        >
                          {item.status === 'paused' ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                      )}
                      {effectiveStatus !== 'expired' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleShare(item); }}
                          className="flex items-center justify-center p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-600 transition-all"
                          title="Compartilhar"
                        >
                          <Share2 size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                        className="flex items-center justify-center p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Actions extras */}
                    <div className="flex gap-1.5 mt-2">
                      {item.is_featured !== 1 && effectiveStatus === 'active' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePromote(item); }}
                          disabled={isProcessing}
                          className="flex-1 flex items-center justify-center gap-1 p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all font-bold text-[10px] uppercase disabled:opacity-50"
                        >
                          {processingId === `boost-${item.id}` ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Zap size={12} />
                          )} Destacar
                        </button>
                      )}
                      {(effectiveStatus === 'active' || effectiveStatus === 'paused' || effectiveStatus === 'expired') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleExtend(item); }}
                          disabled={processingId === `extend-${item.id}`}
                          className="flex-1 flex items-center justify-center gap-1 p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all font-bold text-[10px] uppercase disabled:opacity-50"
                        >
                          {processingId === `extend-${item.id}` ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Calendar size={12} />
                          )} Renovar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Affiliate Interest Modal */}
      {showAffiliateInterest && (
        <AffiliateInterestModal
          onClose={() => setShowAffiliateInterest(false)}
          onSuccess={() => setShowAffiliateInterest(false)}
        />
      )}

      {/* Checkout Modal Marketplace */}
      {showCheckoutModal && selectedListingId && (
        <CheckoutModalMarketplace
          listingId={selectedListingId}
          onClose={() => {
            setShowCheckoutModal(false);
            setSelectedListingId(null);
          }}
          onSuccess={() => {
            setShowCheckoutModal(false);
            setSelectedListingId(null);
            fetchMyItems();
          }}
        />
      )}

    </DashboardShell>
  );
};

export default MarketplaceManager;
