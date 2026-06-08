import { useState, useEffect, useMemo } from 'react';
import { Search, Megaphone, PlusCircle, Loader2, Image as ImageIcon, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/api/api';
import { getImageUrl } from '@/lib/utils';
import Swal from 'sweetalert2';
import DashboardShell from '@/components/layout/DashboardShell';
import { Button } from '@/components/ui/Button';
import { StatsGrid, StatCard, StatusBadge, TimeFilter } from '@/components/admin';
import type { TimeFilterValue } from '@/components/admin/TimeFilter';
import DataTable, { type TableColumn, type TableAction } from '@/components/admin/DataTable';
import ConfirmModal from '@/components/shared/ConfirmModal';
import { AD_POSITION_SIZE, ADMIN_ONLY_KEYS } from '@/constants/adPositions';
import { useAdPositions } from '@/hooks/useAdPositions';
import AdvertiserPlanCard from '@/components/advertiser/AdvertiserPlanCard';
import AdvertiserFormModal from '@/components/advertiser/AdvertiserFormModal';

const fmtDate = (d: string) => {
  if (!d) return '-';
  const parts = d.split(' ')[0].split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

export default function AdvertiserPortal({ user: propUser }: { user?: any }) {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(true);
  const [stats, setStats] = useState({ views: 0, clicks: 0 });
  const [myAds, setMyAds] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const { positions, loading: positionsLoading } = useAdPositions();

  const [activePlan, setActivePlan] = useState<any>(null);
  const [includedPositions, setIncludedPositions] = useState<string[]>([]);
  const [positionLimits, setPositionLimits] = useState<Record<string, number>>({});
  const [periodStart, setPeriodStart] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>('all');

  const isAdExpired = (ad: any) => ad.expires_at && new Date(ad.expires_at) < new Date();

  const filteredAds = useMemo(() => {
    let ads = myAds;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      ads = ads.filter(a => a.title?.toLowerCase().includes(term));
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'expired') {
        ads = ads.filter(isAdExpired);
      } else {
        ads = ads.filter(a => !isAdExpired(a) && a.status === statusFilter);
      }
    }

    if (timeFilter !== 'all') {
      const now = new Date();
      ads = ads.filter(a => {
        if (!a.created_at) return false;
        const created = new Date(a.created_at);
        switch (timeFilter) {
          case 'today': return created.toDateString() === now.toDateString();
          case '7days': return (now.getTime() - created.getTime()) <= 7 * 86400000;
          case '30days': return (now.getTime() - created.getTime()) <= 30 * 86400000;
          case 'thisMonth': return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
          default: return true;
        }
      });
    }

    return ads;
  }, [myAds, searchTerm, statusFilter, timeFilter]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter, timeFilter]);

  const totalPages = Math.ceil(filteredAds.length / pageSize);
  const pagedAds = filteredAds.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const user = propUser || JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}');

  useEffect(() => {
    const checkModuleAccess = async () => {
      try {
        const res = await api.get('/user/modules');
        if (res.data?.success) {
          const modules = res.data.data.modules || [];
          const advertiserModule = modules.find((m: any) => m.key === 'advertiser');
          if (!advertiserModule?.is_active) setHasAccess(false);
        }
      } catch (e) {
        setHasAccess(false);
      }
    };
    checkModuleAccess();
  }, []);

  useEffect(() => {
    if (hasAccess) loadData();
  }, [hasAccess]);

  const loadData = async () => {
    try {
      setLoading(true);
      const adsRes = await api.get('/my-ads');
      const ads = adsRes.data?.data || [];
      setMyAds(ads);
      const totalViews = ads.reduce((acc: number, ad: any) => acc + Number(ad.views_count || 0), 0);
      const totalClicks = ads.reduce((acc: number, ad: any) => acc + Number(ad.clicks_count || 0), 0);
      setStats({ views: totalViews, clicks: totalClicks });
    } catch (err) {
      console.error('Erro ao carregar:', err);
    } finally {
      setLoading(false);
    }
  };

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
            const filtered = (Array.isArray(pos) && pos.length > 0 ? pos : [])
              .filter((p: string) => !ADMIN_ONLY_KEYS.includes(p));
            setIncludedPositions(filtered);
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

  const getPositionInfo = (position: string) => {
    const pos = positions.find(p => p.feature_key === position);
    if (!pos) return { name: position, ad_size: '' };
    return { name: pos.feature_name, ad_size: pos.ad_size || '' };
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
          O módulo de Publicidade requer aprovação da equipe Chama Frete. Solicite acesso pelo painel da sua empresa.
        </p>
        <Button onClick={() => window.location.href = '/dashboard'} variant="hero" size="lg">
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }

  const activeCount = myAds.filter(a => a.status === 'active' && (!a.expires_at || new Date(a.expires_at) >= new Date())).length;
  const expiredCount = myAds.filter(a => a.expires_at && new Date(a.expires_at) < new Date()).length;
  const avgCtr = stats.views > 0 ? ((stats.clicks / stats.views) * 100).toFixed(1).replace('.', ',') + '%' : '0%';

  const adColumns: TableColumn<any>[] = [
    {
      key: 'image_url',
      label: 'Preview',
      render: (val, row) => (
        <div className="w-16 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
          {val ? (
            <img src={getImageUrl(val as string) || ''} alt={row.title} className="w-full h-full object-cover" />
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
        const size = AD_POSITION_SIZE[val as string] || info.ad_size;
        return (
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-bold text-slate-600 dark:text-slate-300 uppercase">
            {info.name}{size ? ` (${size})` : ''}
          </span>
        );
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
      render: (val) => {
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
        return (
          <StatusBadge
            status={effective as any}
            labels={{ active: 'Ativo', paused: 'Pausado', expired: 'Expirado' } as any}
          />
        );
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
      onClick: (row: any) => { setEditingAd(row); setShowCreateModal(true); },
    },
    {
      icon: <Trash2 size={14} />,
      label: 'Excluir',
      variant: 'danger',
      onClick: (row: any) => setDeleteTarget(row),
    },
  ];

  return (
    <DashboardShell
      title="Publicidade"
      description="Painel do Anunciante"
      actions={
        <Button onClick={() => { setEditingAd(null); setShowCreateModal(true); }} size="lg">
          <PlusCircle size={18} /> Novo Anúncio
        </Button>
      }
    >
      <StatsGrid>
        <StatCard label="Anúncios Ativos" value={activeCount} variant="green" icon={Megaphone} />
        <StatCard label="CTR Médio" value={avgCtr} variant="blue" icon={ImageIcon} />
        <StatCard label="Expirados" value={expiredCount} variant="red" icon={ImageIcon} />
        <StatCard label="Total" value={myAds.length} icon={ImageIcon} />
      </StatsGrid>

      <AdvertiserPlanCard
        activePlan={activePlan}
        includedPositions={includedPositions}
        positionLimits={positionLimits}
        periodStart={periodStart}
        myAds={myAds}
      />

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar anúncio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="paused">Pausados</option>
            <option value="expired">Expirados</option>
          </select>
          <TimeFilter value={timeFilter} onChange={(v) => setTimeFilter(v)} />
        </div>
      </div>

      {loading || positionsLoading ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-orange-500" size={32} />
          </div>
        </div>
      ) : (
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
                {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredAds.length)} de {filteredAds.length}
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
      )}

      <AdvertiserFormModal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setEditingAd(null); }}
        onSaved={() => { setShowCreateModal(false); setEditingAd(null); loadData(); }}
        editingAd={editingAd}
        includedPositions={includedPositions}
        positionLimits={positionLimits}
        periodStart={periodStart}
        myAds={myAds}
      />

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
