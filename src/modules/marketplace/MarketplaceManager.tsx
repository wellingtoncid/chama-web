import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, MapPin, Trash2, Edit3, Loader2, Eye, Zap, Clock, AlertTriangle, Star, CheckCircle } from 'lucide-react';
import { api } from '../../api/api';
import Swal from 'sweetalert2';
import { getImageUrl } from '../../lib/utils';
import AffiliateInterestModal from './components/AffiliateInterestModal';

const MarketplaceManager = ({ user }: { user: any }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pricingRules, setPricingRules] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showAffiliateInterest, setShowAffiliateInterest] = useState(false);
  const [hasAffiliateAccess, setHasAffiliateAccess] = useState(false);
  const [affiliateLoading, setAffiliateLoading] = useState(true);

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
        const mpRules = res.data.data.filter((r: any) => r.module_key === 'marketplace');
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
  }, [user.id]);

  const checkAffiliateAccess = async () => {
    try {
      const res = await api.get('/affiliate/access');
      if (res.data?.success) {
        setHasAffiliateAccess(res.data.has_access);
      }
    } catch (error) {
      console.error('Erro ao verificar acesso de afiliado:', error);
    } finally {
      setAffiliateLoading(false);
    }
  };

  const getDaysUntilExpiry = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const handlePromote = async (item: any) => {
    const boostRule = pricingRules.find((r: any) => r.feature_key === 'featured_listing');
    const price = Number(boostRule?.price_per_use) || 9.90;
    const days = boostRule?.duration_days || 7;

    const result = await Swal.fire({
      title: 'Impulsionar Anúncio',
      html: `
        <div class="text-left space-y-3">
          <p>Destaque seu anúncio no topo do marketplace por ${days} dias!</p>
          <div class="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-xl">
            <p class="font-bold text-2xl text-amber-600">R$ ${price.toFixed(2).replace('.', ',')}</p>
            <p class="text-xs text-slate-500">por ${days} dias de destaque</p>
          </div>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Impulsionar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#F59E0B',
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
      color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
    });

    if (result.isConfirmed) {
      setProcessingId(`boost-${item.id}`);
      try {
        const res = await api.post('/listing/boost', {
          listing_id: item.id,
        });

        if (res.data?.success) {
          Swal.fire({
            title: 'Sucesso!',
            text: res.data.message || 'Anúncio impulsionado com sucesso!',
            icon: 'success',
            background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
            color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
          });
          fetchMyItems();
        }
      } catch (error: any) {
        const status = error.response?.status;
        const resData = error.response?.data;

        if (status === 402) {
          const balance = resData?.balance || 0;
          const required = resData?.required || price;

          Swal.fire({
            title: 'Saldo Insuficiente',
            html: `
              <div class="text-left space-y-2">
                <p>Você precisa de <strong>R$ ${required.toFixed(2).replace('.', ',')}</strong> para impulsionar.</p>
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
              handleMercadoPagoBoost(item.id, price);
            }
          });
        } else {
          Swal.fire({
            title: 'Erro',
            text: resData?.message || 'Erro ao impulsionar.',
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
    } catch (error: any) {
      Swal.fire({
        title: 'Erro',
        text: error.response?.data?.message || 'Erro ao processar pagamento.',
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
    } catch (error: any) {
      Swal.fire({
        title: 'Erro',
        text: error.response?.data?.message || 'Erro ao processar pagamento.',
        icon: 'error',
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
        color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
      });
    }
  };

  const handleExtend = async (item: any) => {
    const bumpRule = pricingRules.find((r: any) => r.feature_key === 'bump');
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
      } catch (error: any) {
        const status = error.response?.status;
        const resData = error.response?.data;

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

  const handleView = (item: any) => {
    navigate(`/anuncio/${item.slug}`);
  };

  const handleEdit = (item: any) => {
    navigate(`/editar-anuncio/${item.id}`);
  };

  const handleDelete = async (item: any) => {
    const result = await Swal.fire({
      title: 'Excluir Anúncio?',
      text: `Tem certeza que deseja excluir "${item.title}"? Esta ação não pode ser desfeita.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#DC2626',
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
      color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post('/delete-listing', { id: item.id });
        if (res.data?.success) {
          Swal.fire({
            title: 'Excluído!',
            text: 'Anúncio excluído com sucesso.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
            color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
          });
          fetchMyItems();
        }
      } catch (error) {
        Swal.fire({
          title: 'Erro',
          text: 'Erro ao excluir anúncio.',
          icon: 'error',
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
        });
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header com Ações */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-[1000] text-slate-800 dark:text-slate-100 tracking-tighter uppercase italic leading-none">
            Classificados
          </h1>
          <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            Gerencie seus itens à venda no ecossistema
          </p>
        </div>

        <button 
          onClick={() => navigate('/novo-anuncio')}
          className="bg-emerald-600 dark:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs flex items-center gap-2 hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-200 dark:shadow-emerald-900/30 active:scale-95"
        >
          <Plus size={18} /> Vender Novo Item
        </button>
      </div>

      {/* Affiliate Section */}
      {!affiliateLoading && (
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

      {/* Grid de Itens */}
      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-emerald-600" size={40} />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[3rem] p-20 text-center">
          <div className="bg-slate-50 dark:bg-slate-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="text-slate-300 dark:text-slate-500" size={32} />
          </div>
          <h3 className="text-xl font-black uppercase italic text-slate-400 dark:text-slate-500">Nenhum item anunciado</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Que tal desapegar de algo relacionado a transporte e logística?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item: any) => {
            const daysLeft = getDaysUntilExpiry(item.expires_at);
            const expired = isExpired(item.expires_at);
            const isProcessing = processingId === `boost-${item.id}` || processingId === `extend-${item.id}`;

            return (
              <div key={item.id} className={`bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden border shadow-sm group hover:shadow-xl transition-all ${
                item.is_featured ? 'border-amber-400 dark:border-amber-600 ring-2 ring-amber-200 dark:ring-amber-800' : 'border-slate-100 dark:border-slate-700'
              }`}>
                <div className="h-48 bg-slate-200 dark:bg-slate-700 relative">
                  <img 
                    src={getImageUrl(item.main_image || item.images?.[0])} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    alt={item.title} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-item.jpg';
                    }}
                  />
                  {item.is_featured === 1 && (
                    <div className="absolute top-3 left-3 bg-amber-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase italic shadow-lg flex items-center gap-1">
                      <Zap size={10} /> Destaque
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white px-2 py-1 rounded-full text-[8px] font-black uppercase">
                    {item.category}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className={`px-3 py-2 rounded-xl text-center text-xs font-black uppercase ${
                      expired ? 'bg-red-500 text-white' : 
                      daysLeft !== null && daysLeft <= 3 ? 'bg-amber-500 text-white' : 
                      'bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {expired ? (
                        <span className="flex items-center justify-center gap-1">
                          <AlertTriangle size={12} /> Expirado
                        </span>
                      ) : daysLeft !== null ? (
                        <span className="flex items-center justify-center gap-1">
                          <Clock size={12} /> {daysLeft} dia(s)
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1">
                          <Clock size={12} /> Sem prazo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">{item.status}</span>
                    <span className="text-lg font-[1000] text-emerald-600 dark:text-emerald-400">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-800 dark:text-slate-100 uppercase italic truncate text-lg">{item.title}</h4>
                  
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mt-4 text-[10px] font-bold">
                    <MapPin size={12} className="text-emerald-500" /> {item.location_city || 'N/I'}, {item.location_state || ''}
                  </div>

                  {/* Botões de Ação */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <button 
                      onClick={() => handleView(item)}
                      className="flex items-center justify-center gap-1 p-2 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-bold text-[8px] uppercase"
                    >
                      <Eye size={10} /> Ver
                    </button>
                    <button 
                      onClick={() => handleEdit(item)}
                      className="flex items-center justify-center gap-1 p-2 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-bold text-[8px] uppercase"
                    >
                      <Edit3 size={10} /> Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(item)}
                      className="flex items-center justify-center gap-1 p-2 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all font-bold text-[8px] uppercase"
                    >
                      <Trash2 size={10} /> Excluir
                    </button>
                  </div>

                  {/* Botões de Impulsionar/Prorrogar */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {item.is_featured !== 1 && (
                      <button
                        onClick={() => handlePromote(item)}
                        disabled={isProcessing}
                        className="flex items-center justify-center gap-1 p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all font-bold text-[8px] uppercase disabled:opacity-50"
                      >
                        {processingId === `boost-${item.id}` ? (
                          <Loader2 size={10} className="animate-spin" />
                        ) : (
                          <Zap size={10} />
                        )} Impulsionar
                      </button>
                    )}
                    <button
                      onClick={() => handleExtend(item)}
                      disabled={isProcessing}
                      className={`flex items-center justify-center gap-1 p-2 rounded-xl transition-all font-bold text-[8px] uppercase disabled:opacity-50 ${
                        expired 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50' 
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {processingId === `extend-${item.id}` ? (
                        <Loader2 size={10} className="animate-spin" />
                      ) : (
                        <Clock size={10} />
                      )} Prorrogar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Affiliate Interest Modal */}
      {showAffiliateInterest && (
        <AffiliateInterestModal 
          onClose={() => setShowAffiliateInterest(false)}
          onSuccess={() => setShowAffiliateInterest(false)}
        />
      )}
    </div>
  );
};

export default MarketplaceManager;