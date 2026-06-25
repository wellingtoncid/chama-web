import { useState, useEffect } from 'react';
import { MessageCircle, CheckCircle2, XCircle, Send, RefreshCw, Loader2, ExternalLink, Search, Wallet, AlertTriangle } from 'lucide-react';
import { api } from '@/api/api';
import { PageShell, StatsGrid, StatCard, FilterBar, DataTable, StatusBadge, type TableColumn } from '@/components/admin';
import Swal from 'sweetalert2';

interface Promotion {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  reference_type: 'freight' | 'listing';
  reference_id: number;
  reference_title: string;
  reference_slug: string;
  amount_paid: string;
  status: string;
  approved_by: number | null;
  approved_at: string | null;
  rejection_reason: string | null;
  groups_sent: number;
  total_groups: number;
  error_message: string | null;
  created_at: string;
}

interface SessionData {
  connected: boolean;
  status: any;
  qrCode: any;
}

export default function OpenWAPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<any>({});
  const [session, setSession] = useState<SessionData | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [promoRes, statsRes, sessionRes] = await Promise.all([
        api.get('/admin/promotions'),
        api.get('/admin/promotions/stats'),
        api.get('/admin/openwa/session'),
      ]);
      if (promoRes.data?.success) setPromotions(promoRes.data.data || []);
      if (statsRes.data?.success) setStats(statsRes.data.data || {});
      if (sessionRes.data?.success) setSession(sessionRes.data.data);
    } catch (e) {
      console.error('Erro ao carregar promoções:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id: number) => {
    const result = await Swal.fire({
      title: 'Aprovar divulgação?',
      text: 'A mensagem será enviada para todos os grupos WhatsApp ativos.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, aprovar e enviar!',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#059669',
    });
    if (!result.isConfirmed) return;

    try {
      const res = await api.post(`/admin/promotions/${id}/approve`);
      if (res.data?.success) {
        Swal.fire({ icon: 'success', title: 'Aprovada!', text: 'Mensagem enviada para os grupos.', timer: 2000, showConfirmButton: false });
        fetchData();
      } else {
        Swal.fire({ icon: 'error', title: 'Erro', text: res.data?.message || 'Erro ao aprovar' });
      }
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: 'Erro', text: e.response?.data?.message || 'Erro ao aprovar' });
    }
  };

  const handleReject = async (id: number) => {
    const { value: reason } = await Swal.fire({
      title: 'Rejeitar divulgação?',
      input: 'textarea',
      inputLabel: 'Motivo da rejeição',
      inputPlaceholder: 'Descreva o motivo...',
      showCancelButton: true,
      confirmButtonText: 'Rejeitar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      inputValidator: (value) => { if (!value) return 'Informe o motivo'; return null; },
    });
    if (!reason) return;

    try {
      const res = await api.post(`/admin/promotions/${id}/reject`, { reason });
      if (res.data?.success) {
        Swal.fire({ icon: 'info', title: 'Rejeitada', text: 'Valor estornado para carteira do usuário.', timer: 2000, showConfirmButton: false });
        fetchData();
      }
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: 'Erro', text: e.response?.data?.message || 'Erro ao rejeitar' });
    }
  };

  const handleSyncGroups = async () => {
    Swal.fire({ title: 'Sincronizando...', text: 'Buscando grupos do WhatsApp via OpenWA.', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
      const res = await api.post('/admin/promotions/sync-groups');
      if (res.data?.success) {
        Swal.fire({ icon: 'success', title: 'Sincronizado!', text: res.data.message, timer: 2000, showConfirmButton: false });
        fetchData();
      }
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: 'Erro', text: e.response?.data?.message || 'Erro ao sincronizar' });
    }
  };

  const statusLabels: Record<string, string> = {
    pending_payment: 'Aguardando Pagamento',
    pending_approval: 'Aguardando Aprovação',
    approved: 'Aprovado',
    sent: 'Enviado',
    failed: 'Falhou',
    rejected: 'Rejeitado',
  };

  const columns: TableColumn<Promotion>[] = [
    { key: 'id', label: '#' },
    { key: 'user_name', label: 'Usuário' },
    { key: 'reference_title', label: 'Publicação', render: (value: unknown, row: Promotion) => (
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold">{String(value || '--')}</span>
        {row.reference_slug && (
          <a href={`/${row.reference_type === 'freight' ? 'frete' : 'anuncio'}/${row.reference_slug}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
            <ExternalLink size={14} />
          </a>
        )}
      </div>
    )},
    { key: 'reference_type', label: 'Tipo', render: (value: unknown) => (
      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${value === 'freight' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{value === 'freight' ? 'Frete' : 'Marketplace'}</span>
    )},
    { key: 'amount_paid', label: 'Valor', render: (value: unknown) => `R$ ${parseFloat(String(value || '0')).toFixed(2)}` },
    { key: 'status', label: 'Status', render: (value: unknown) => {
      const v = String(value);
      const colorMap: Record<string, string> = {
        pending_payment: 'bg-amber-100 text-amber-700',
        pending_approval: 'bg-yellow-100 text-yellow-700',
        approved: 'bg-emerald-100 text-emerald-700',
        sent: 'bg-blue-100 text-blue-700',
        rejected: 'bg-red-100 text-red-700',
        failed: 'bg-rose-100 text-rose-700',
      };
      return <span className={`px-2 py-1 rounded-full text-xs font-bold ${colorMap[v] || 'bg-slate-100 text-slate-700'}`}>{statusLabels[v as keyof typeof statusLabels] || v}</span>;
    } },
    { key: 'groups_sent', label: 'Grupos' },
    { key: 'actions', label: 'Ações', render: (_, row) => (
      <div className="flex gap-2">
        {row.status === 'pending_approval' && (
          <>
            <button onClick={() => handleApprove(row.id)} className="p-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-colors" title="Aprovar">
              <CheckCircle2 size={16} />
            </button>
            <button onClick={() => handleReject(row.id)} className="p-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors" title="Rejeitar">
              <XCircle size={16} />
            </button>
          </>
        )}
      </div>
    )},
  ];

  const filteredPromotions = promotions.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (search && !p.user_name?.toLowerCase().includes(search.toLowerCase()) && !p.reference_title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <PageShell
      title="Promoções WhatsApp"
      description="Central de aprovação de divulgações nos grupos WhatsApp"
      actions={
        <div className="flex gap-2">
          <button onClick={handleSyncGroups} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase flex items-center gap-2">
            <RefreshCw size={14} />
            Sincronizar Grupos
          </button>
          <button onClick={fetchData} className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase flex items-center gap-2">
            <Loader2 size={14} />
            Atualizar
          </button>
        </div>
      }
    >
      {session && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${session.connected ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className={`w-3 h-3 rounded-full ${session.connected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
          <span className={`text-sm font-bold ${session.connected ? 'text-emerald-700' : 'text-amber-700'}`}>
            {session.connected ? 'WhatsApp conectado' : 'WhatsApp desconectado'}
          </span>
          {!session.connected && (
            <span className="text-xs text-amber-600 ml-2">Escaneie o QR Code no OpenWA para conectar</span>
          )}
        </div>
      )}

      <StatsGrid>
        <StatCard label="Total" value={stats.total || 0} icon={MessageCircle} />
        <StatCard label="Aguardando" value={stats.pending_approval || 0} icon={AlertTriangle} variant="yellow" />
        <StatCard label="Aprovados" value={stats.approved || 0} icon={CheckCircle2} variant="green" />
        <StatCard label="Enviados" value={stats.sent || 0} icon={Send} variant="blue" />
        <StatCard label="Rejeitados" value={stats.rejected || 0} icon={XCircle} variant="red" />
        <StatCard label="Receita" value={`R$ ${parseFloat(stats.total_revenue || '0').toFixed(2)}`} icon={Wallet} variant="orange" />
      </StatsGrid>

      <FilterBar
        search={{ placeholder: 'Buscar por usuário ou título...', value: search, onChange: setSearch }}
        tabs={[
          { key: 'all', label: 'Todas' },
          { key: 'pending_approval', label: 'Aguardando' },
          { key: 'approved', label: 'Aprovadas' },
          { key: 'sent', label: 'Enviadas' },
          { key: 'rejected', label: 'Rejeitadas' },
        ]}
        activeTab={filter}
        onTabChange={setFilter}
      />

      <DataTable
        columns={columns}
        data={filteredPromotions}
        loading={loading}
        emptyMessage="Nenhuma promoção encontrada"
      />
    </PageShell>
  );
}
