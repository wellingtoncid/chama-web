import { useState, useEffect } from 'react';
import { api } from '@/api/api';
import { 
  UserPlus, Loader2, AlertCircle,
  UserCheck, UserX
} from 'lucide-react';
import { 
  AdminLayout, StatsGrid, StatCard, FilterBar, DataTable, StatusBadge, 
  type TableColumn 
} from '@/components/admin';

interface AuthorRequest {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  user_avatar: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string;
  references_links: string;
  requested_at: string;
  reviewed_at: string;
}

export default function AuthorRequestsAdminPage() {
  const [requests, setRequests] = useState<AuthorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<AuthorRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/admin/article-author-requests';
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }
      
      const res = await api.get(url);
      
      if (res.data?.success) {
        setRequests(res.data.data.requests || []);
        if (res.data.data.stats) {
          setStats(res.data.data.stats);
        }
      } else {
        setError(res.data?.message || 'Erro ao carregar solicitações');
      }
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'response' in e) {
        const err = e as { response?: { data?: { message?: string } } };
        setError(err.response?.data?.message || 'Erro ao carregar solicitações');
      } else {
        setError('Erro ao carregar solicitações');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Aprovar este usuário como autor?')) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.put(`/admin/article-author-requests/${id}/approve`);
      
      if (res.data?.success) {
        alert('Autor aprovado com sucesso!');
        fetchRequests();
      } else {
        alert(res.data?.message || 'Erro ao aprovar autor');
      }
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'response' in e) {
        const err = e as { response?: { data?: { message?: string } } };
        alert(err.response?.data?.message || 'Erro ao aprovar autor');
      } else {
        alert('Erro ao aprovar autor');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      alert('Motivo da rejeição é obrigatório');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.put(`/admin/article-author-requests/${selectedRequest.id}/reject`, {
        reason: rejectReason.trim()
      });
      
      if (res.data?.success) {
        alert('Solicitação rejeitada');
        setShowRejectModal(false);
        setSelectedRequest(null);
        setRejectReason('');
        fetchRequests();
      } else {
        alert(res.data?.message || 'Erro ao rejeitar solicitação');
      }
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'response' in e) {
        const err = e as { response?: { data?: { message?: string } } };
        alert(err.response?.data?.message || 'Erro ao rejeitar solicitação');
      } else {
        alert('Erro ao rejeitar solicitação');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRequests = requests.filter(r => 
    r.user_name.toLowerCase().includes(search.toLowerCase()) ||
    r.user_email.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const columns: TableColumn<AuthorRequest>[] = [
    {
      key: 'user',
      label: 'Usuário',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          {row.user_avatar ? (
            <img src={row.user_avatar} alt={row.user_name} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <UserCheck size={16} className="text-slate-500" />
            </div>
          )}
          <span className="font-medium text-slate-900 dark:text-white">{row.user_name}</span>
        </div>
      )
    },
    { key: 'user_email', label: 'Email' },
    {
      key: 'references',
      label: 'Referências',
      render: (_, row) => row.references_links ? (
        <a 
          href={row.references_links.split('\n')[0]} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline line-clamp-1"
        >
          Ver links
        </a>
      ) : <span className="text-sm text-slate-400">-</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value as 'pending' | 'approved' | 'rejected'} />
    },
    {
      key: 'requested_at',
      label: 'Data',
      render: (_, row) => <span className="text-sm text-slate-500">{formatDate(row.requested_at)}</span>
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(row.id)}
                disabled={actionLoading}
                className="p-1.5 text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
                title="Aprovar"
              >
                <UserCheck size={16} />
              </button>
              <button
                onClick={() => {
                  setSelectedRequest(row);
                  setShowRejectModal(true);
                }}
                disabled={actionLoading}
                className="p-1.5 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                title="Rejeitar"
              >
                <UserX size={16} />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <AdminLayout
      title="Solicitações de Autores"
      description="Gerencie solicitações de usuários para se tornarem autores"
      icon={UserPlus}
    >
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <StatsGrid>
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Pendentes" value={stats.pending} variant="yellow" />
        <StatCard label="Aprovados" value={stats.approved} variant="green" />
        <StatCard label="Rejeitados" value={stats.rejected} variant="red" />
      </StatsGrid>

      <FilterBar
        search={{
          placeholder: 'Buscar por nome ou email...',
          value: search,
          onChange: setSearch
        }}
        tabs={[
          { key: 'all', label: 'Todos' },
          { key: 'pending', label: 'Pendente' },
          { key: 'approved', label: 'Aprovado' },
          { key: 'rejected', label: 'Rejeitado' },
        ]}
        activeTab={filter}
        onTabChange={setFilter}
      />

      <DataTable
        columns={columns}
        data={filteredRequests}
        loading={loading}
        emptyMessage="Nenhuma solicitação encontrada"
      />

      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Rejeitar Solicitação
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
              Você está prestes a rejeitar a solicitação de <strong>"{selectedRequest.user_name}"</strong>.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Motivo da rejeição *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explique o motivo da rejeição..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 rounded-lg font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="flex-1 px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={20} /> : 'Rejeitar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}