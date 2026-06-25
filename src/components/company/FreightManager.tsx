import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  PlusCircle, Package, Loader2, Zap, Trash2, Edit3,
  CheckCircle2, Search,
  Eye, MessageCircle, Users, ExternalLink,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { api } from '../../api/api';
import CheckoutModal from './CheckoutModal';
import Swal from 'sweetalert2';
import { UpgradeModal, useUsageCheck } from '../shared/UpgradeModal';
import { UsageMeter } from '../shared/UsageMeter';
import { StatsGrid, StatCard, StatusBadge, TimeFilter } from '@/components/admin';
import DashboardShell from '@/components/layout/DashboardShell';
import { PromotionModal } from '@/components/shared/PromotionModal';


export default function FreightManager({ user }: any) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [myFreights, setMyFreights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedFreightId, setSelectedFreightId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [modules, setModules] = useState<any>({});
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [pricingData, setPricingData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | '30days' | 'thisMonth' | 'custom' | 'all'>('all');
  const [promoteData, setPromoteData] = useState<{ type: 'freight' | 'listing'; id: number; price?: number } | null>(null);
  
  // Estado para métricas específicas deste módulo
  const [stats, setStats] = useState({
    totalViews: 0,
    totalInterests: 0,
    activeFreights: 0
  });

  // Hook de verificação de uso
  const freightUsage = useUsageCheck('freights', 'publish');

  useEffect(() => {
    const promote = searchParams.get('promote');
    if (promote) {
      const [type, idStr] = promote.split(':');
      if (type === 'freight' && idStr) {
        setPromoteData({ type: 'freight', id: parseInt(idStr) });
      }
      setSearchParams({}, { replace: true });
    }
  }, []);

  // Carrega módulos do usuário
  useEffect(() => {
    async function loadModules() {
      try {
        const res = await api.get('/user/modules');
        if (res.data?.success) {
          const modulesMap: any = {};
          res.data.data.modules.forEach((m: any) => {
            modulesMap[m.key] = m;
          });
          setModules(modulesMap);
        }
      } catch (e) {
        console.error('Erro ao carregar módulos:', e);
      }
    }
    loadModules();
  }, []);

  const checkAccessAndRun = (callback: () => void, isEdit = false) => {
    const isAdmin = user?.role === 'ADMIN';
    const isApproved = isAdmin || user?.verification_status === 'verified';
    const hasProfile = !!user?.company_name && !!user?.document;
    const hasFreightsModule = modules?.freights?.is_active ?? false;
    const canAccessFreights = isAdmin || hasFreightsModule;

    if (!canAccessFreights) {
      Swal.fire({
        title: '<span class="italic font-black">MÓDULO INATIVO</span>',
        html: `
          <div class="flex flex-col items-center gap-4">
            <div class="text-orange-500 animate-bounce mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m12 8-4 4"/><path d="m8 8 4 4"/></svg>
            </div>
            <p class="text-slate-500 font-medium">
              O módulo de Fretes está inativo. Ative-o no painel da sua empresa para publicar cargas.
            </p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'ATIVAR MÓDULO',
        cancelButtonText: 'FECHAR',
        confirmButtonColor: '#f97316',
        cancelButtonColor: '#cbd5e1',
        customClass: {
          popup: 'rounded-[2.5rem] p-10',
          confirmButton: 'rounded-xl font-black uppercase text-xs px-6 py-4',
          cancelButton: 'rounded-xl font-black uppercase text-xs px-6 py-4'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/dashboard');
        }
      });
      return;
    }

    if (!isApproved) {
      Swal.fire({
        title: '<span class="italic font-black">ACESSO RESTRITO</span>',
        html: ` 
          <div class="flex flex-col items-center gap-4">
            <div class="text-orange-500 animate-bounce mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m12 8-4 4"/><path d="m8 8 4 4"/></svg>
            </div>
            <p class="text-slate-500 font-medium">
              ${!hasProfile 
                ? "Você precisa completar os dados da sua empresa antes de publicar ou editar cargas." 
                : "Complete pelo menos 60% do seu perfil para publicar cargas automaticamente."}
            </p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'IR PARA MEU PERFIL',
        cancelButtonText: 'FECHAR',
        confirmButtonColor: '#f97316',
        cancelButtonColor: '#cbd5e1',
        customClass: {
          popup: 'rounded-[2.5rem] p-10',
          confirmButton: 'rounded-xl font-black uppercase text-xs px-6 py-4',
          cancelButton: 'rounded-xl font-black uppercase text-xs px-6 py-4'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/dashboard/profile');
        }
      });
      return;
    }

    // Verifica limite de uso gratuito (só para novos, editar sempre permite)
    if (!isEdit && !freightUsage.canUse && freightUsage.pricing) {
      setPricingData({
        moduleKey: 'freights',
        featureKey: 'publish',
        featureName: 'Publicar Frete',
        currentUsage: freightUsage.usage,
        limit: freightUsage.limit,
        pricePerUse: freightUsage.pricing.price_per_use,
        priceMonthly: freightUsage.pricing.price_monthly
      });
      setShowUpgradeModal(true);
      return;
    }

    callback();
  };

  const fetchFreights = async () => {
    try {
      setLoading(true);
      const res = await api.get('/list-my-freights');
      const data = res.data.data || [];
      setMyFreights(data);

      // Calculando métricas rápidas a partir dos dados recebidos
      // No futuro, você pode trazer isso direto de uma rota de stats se preferir
      const views = data.reduce((acc: number, curr: any) => acc + (Number(curr.views_count) || 0), 0);
      const clicks = data.reduce((acc: number, curr: any) => acc + (Number(curr.clicks_count) || 0), 0);
      
      const activeCount = data.filter((f: any) => f.expires_at && new Date(f.expires_at).getTime() > Date.now()).length;
      setStats({
        totalViews: views,
        totalInterests: clicks,
        activeFreights: activeCount
      });

    } catch (e) {
      console.error("Erro ao carregar cargas:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: '<span class="font-black italic">EXCLUIR FRETE</span>',
      html: `
        <div class="text-left">
          <p class="text-slate-600 mb-2">
            Tem certeza que deseja <strong>excluir</strong> esta publicação?
          </p>
          <p class="text-slate-400 text-sm">
            Esta ação não pode ser desfeita.
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'EXCLUIR',
      cancelButtonText: 'CANCELAR',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#cbd5e1',
      customClass: {
        popup: 'rounded-[2.5rem] p-8',
        confirmButton: 'rounded-xl font-black uppercase text-xs px-6 py-3',
        cancelButton: 'rounded-xl font-black uppercase text-xs px-6 py-3'
      }
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/delete-freight/${id}`);
      setMyFreights(prev => prev.filter(f => f.id !== id));
      setStats(prev => ({ ...prev, activeFreights: prev.activeFreights - 1 }));
      Swal.fire({
        title: '<span class="font-black italic text-green-600">EXCLUÍDO!</span>',
        text: 'Frete excluído com sucesso.',
        icon: 'success',
        confirmButtonColor: '#22c55e',
        customClass: {
          popup: 'rounded-[2.5rem] p-8',
          confirmButton: 'rounded-xl font-black uppercase text-xs px-6 py-3'
        }
      });
    } catch (e) {
      Swal.fire({
        title: '<span class="font-black italic text-red-600">ERRO!</span>',
        text: 'Não foi possível excluir o frete.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'rounded-[2.5rem] p-8',
          confirmButton: 'rounded-xl font-black uppercase text-xs px-6 py-3'
        }
      });
    }
  };

  useEffect(() => { 
    if (user?.id) fetchFreights(); 
  }, [user?.id]);

  const statusMap: Record<string, string[]> = {
    active: ['OPEN', 'PENDING'],
    completed: ['FINISHED', 'CLOSED'],
    cancelled: ['CANCELLED'],
    expired: ['OPEN', 'PENDING', 'FINISHED', 'CLOSED', 'CANCELLED'],
  };

  const isExpired = (dateStr: string) => {
    if (!dateStr) return false;
    return new Date(dateStr).getTime() <= Date.now();
  };

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  const filteredFreights = myFreights.filter(f => {
    const expired = isExpired(f.expires_at);

    const matchesSearch =
      !searchTerm ||
      f.origin_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.dest_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `cf-${f.id}`.includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'expired' && expired) ||
      (statusFilter !== 'expired' && !expired && (statusMap[statusFilter] ?? []).includes(f.status));

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatPrice = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const timeRemaining = (dateStr: string) => {
    if (!dateStr) return '';
    const now = Date.now();
    const target = new Date(dateStr).getTime();
    const diff = target - now;
    if (diff <= 0) return 'Expirado';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const featuredCount = myFreights.filter(f => Number(f.is_featured) === 1 && !isExpired(f.featured_until)).length;
  const hasAnyFreights = myFreights.length > 0;
  const hasFilterResults = filteredFreights.length > 0;
  const totalPages = Math.ceil(filteredFreights.length / pageSize);
  const paginatedFreights = filteredFreights.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleTimeFilterChange = (value: 'today' | '7days' | '30days' | 'thisMonth' | 'custom' | 'all', _customRange?: { start: string; end: string }) => {
    setTimeFilter(value);
  };

  const statusBadgeMap: Record<string, 'active' | 'pending' | 'completed' | 'cancelled'> = {
    OPEN: 'active',
    PENDING: 'pending',
    FINISHED: 'completed',
    CLOSED: 'completed',
    CANCELLED: 'cancelled',
  };

return (
  <DashboardShell
    title="Gestão de Cargas"
    description="Controle operacional da sua frota e fretes"
    actions={
      <div className="flex items-center gap-3">
        <UsageMeter moduleKey="freights" hideCreateButton />
        <button 
          onClick={() => checkAccessAndRun(() => navigate('/novo-frete'))}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl font-bold uppercase flex items-center gap-3 transition-all text-xs tracking-wide"
        >
          <PlusCircle size={16} /> 
          Nova Publicação
        </button>
      </div>
    }
  >
    <StatsGrid>
      <StatCard label="Visualizações" value={stats.totalViews} icon={<Eye size={16} />} />
      <StatCard label="Cargas Ativas" value={stats.activeFreights} variant="blue" icon={<Package size={16} />} />
      <StatCard label="Interesses" value={stats.totalInterests} variant="purple" icon={<MessageCircle size={16} />} />
      <StatCard label="Destaques" value={featuredCount} variant="orange" icon={<Zap size={16} fill="currentColor" />} />
    </StatsGrid>

    <div className="flex flex-col md:flex-row gap-3">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Buscar por rota, produto ou código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativos</option>
          <option value="completed">Concluídos</option>
          <option value="cancelled">Cancelados</option>
          <option value="expired">Expirados</option>
        </select>
        <TimeFilter value={timeFilter} onChange={handleTimeFilterChange} />
      </div>
    </div>

    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-4 lg:px-6 py-3.5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3">
        <h3 className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">
          Cargas ({filteredFreights.length})
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Mostrar</span>
          <select
            value={pageSize}
            onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="px-2 py-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-xs text-slate-500 dark:text-slate-400">por página</span>
        </div>
      </div>
      {loading ? (
        <div className="p-12 text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto" size={32} />
        </div>
      ) : !hasAnyFreights ? (
        <div className="px-4 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">Nenhuma carga encontrada</div>
      ) : !hasFilterResults ? (
        <div className="px-4 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">Nenhuma carga encontrada para este filtro</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Rota</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Produto</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase w-[1%] whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase w-[1%] whitespace-nowrap">Valor</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase w-[1%] whitespace-nowrap">Data</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase w-[1%] whitespace-nowrap">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {paginatedFreights.map((f: any) => {
                  const isFeatured = Number(f.is_featured) === 1 && !isExpired(f.featured_until);
                  return (
                    <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isFeatured ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                            {isFeatured ? <Zap size={14} fill="currentColor" /> : <Package size={14} />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-800 dark:text-white whitespace-nowrap">
                              {f.origin_city}/{f.origin_state} <span className="text-orange-500 mx-0.5">→</span> {f.dest_city}/{f.dest_state}
                            </div>
                            <div className="flex items-center gap-1.5 mt-px">
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">CF-{f.id}</span>
                              {isFeatured && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-orange-500 dark:text-orange-400" title={f.featured_until ? `Até ${formatDate(f.featured_until)}` : ''}>
                                  ⚡{f.featured_until && timeRemaining(f.featured_until)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{f.product || 'Carga Geral'}</div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 mt-px">
                            <span>{Math.round(Number(f.weight)).toLocaleString('pt-BR')} kg</span>
                            {f.distance_km && <span>• {Math.round(Number(f.distance_km)).toLocaleString('pt-BR')} km</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                        <StatusBadge status={isExpired(f.expires_at) ? 'expired' : (statusBadgeMap[f.status] ?? 'active')} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {f.price ? formatPrice(f.price) : 'A Combinar'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-slate-600 dark:text-slate-300 leading-tight">{formatDate(f.created_at)}</div>
                        {f.expires_at && (
                          <div className={`text-[10px] mt-px ${isExpired(f.expires_at) ? 'text-red-500' : 'text-orange-500'}`}>
                            {isExpired(f.expires_at) ? `Expirou ${formatDate(f.expires_at)}` : `${timeRemaining(f.expires_at)}`}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <ActionButton icon={<Users size={12} />} label="Matching" onClick={() => navigate(`/encontrar-motoristas/${f.id}`)} variant="orange" />
                          {!isFeatured ? (
                            <ActionButton icon={<Zap size={12} />} label="Impulsionar" onClick={() => { setSelectedFreightId(f.id); setShowCheckout(true); }} variant="outline" />
                          ) : (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-[9px] font-black uppercase italic border border-green-100 dark:border-green-800">
                              <CheckCircle2 size={10} /> Ativo
                            </div>
                          )}
                          <span className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                          {f.slug && (
                            <IconButton icon={<ExternalLink size={14} />} label="Ver" href={`/frete/${f.slug}`} />
                          )}
                          <IconButton icon={<Edit3 size={14} />} label="Editar" onClick={() => checkAccessAndRun(() => navigate('/novo-frete', { state: { editData: f } }), true)} />
                          <IconButton icon={<Trash2 size={14} />} label="Excluir" onClick={() => handleDelete(f.id)} variant="danger" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredFreights.length)} de {filteredFreights.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} className="text-slate-600 dark:text-slate-300" />
                </button>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} className="text-slate-600 dark:text-slate-300" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>

      {/* MODAL DE CHECKOUT */}
      {showCheckout && selectedFreightId !== null && (
        <CheckoutModal 
          freightId={selectedFreightId}
          onClose={() => { setShowCheckout(false); setSelectedFreightId(null); }}
          onSuccess={() => { setShowCheckout(false); setSelectedFreightId(null); fetchFreights(); }} 
        />
      )}

       {/* MODAL DE UPGRADE (Limite atingido) */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        moduleKey={pricingData?.moduleKey || 'freights'}
        featureKey={pricingData?.featureKey || 'publish'}
        featureName={pricingData?.featureName || 'Publicar Frete'}
        currentUsage={pricingData?.currentUsage || 0}
        limit={pricingData?.limit || 0}
        pricePerUse={pricingData?.pricePerUse || 0}
        priceMonthly={pricingData?.priceMonthly || 0}
      />

      {/* MODAL DE PROMOÇÃO WHATSAPP */}
      <PromotionModal
        isOpen={promoteData !== null}
        onClose={() => setPromoteData(null)}
        referenceType="freight"
        referenceId={promoteData?.id || 0}
      />
    </DashboardShell>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'orange' | 'gray' | 'outline' | 'danger';
}

function ActionButton({ icon, label, onClick, href, variant = 'gray' }: ActionButtonProps) {
  const baseClasses = "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all dark:text-white";
  
  const variantClasses = {
    orange: "bg-orange-500 text-white hover:bg-orange-600 shadow-sm",
    gray: "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600",
    outline: "bg-white border border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white dark:bg-slate-800 dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-slate-900",
    danger: "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white"
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]}`;
  
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {icon}
        <span>{label}</span>
      </a>
    );
  }
  
  return (
    <button onClick={onClick} className={classes}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'danger';
}

function IconButton({ icon, label, onClick, href, variant = 'default' }: IconButtonProps) {
  const classes = `p-1.5 rounded-lg transition-all ${
    variant === 'danger'
      ? 'text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
      : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700'
  }`;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} title={label}>
        {icon}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={classes} title={label}>
      {icon}
    </button>
  );
}