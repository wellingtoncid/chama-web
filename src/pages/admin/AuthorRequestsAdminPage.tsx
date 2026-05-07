import { useState, useEffect, useMemo } from 'react';
import { api } from '@/api/api';
import { 
  UserPlus, Loader2, AlertCircle, Search, ChevronLeft, ChevronRight,
  UserCheck, UserX, X
} from 'lucide-react';
import { 
  PageShell, StatsGrid, StatCard,
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search, pageSize]);

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
    if (!confirm('Aprovar este usuário como autor?')) return;

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

  const filteredRequests = useMemo(() => {
    return requests.filter(r =>
      r.user_name.toLowerCase().includes(search.toLowerCase()) ||
      r.user_email.toLowerCase().includes(search.toLowerCase())
    );
  }, [requests, search]);

  const totalPages = Math.ceil(filteredRequests.length / pageSize);
  const paginatedRequests = useMemo(() => {
    return filteredRequests.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredRequests, currentPage, pageSize]);

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
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <UserCheck size={16} className="text-slate-400 dark:text-slate-500" />
            </div>
          )}
          <span className="font-bold text-slate-800 dark:text-white">{row.user_name}</span>
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
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline line-clamp-1"
        >
          Ver links
        </a>
      ) : <span className="text-xs font-bold text-slate-400">-</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const colors: Record<string, string> = {
          pending: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
          approved: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
          rejected: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
        };
        const labels: Record<string, string> = {
          pending: 'Pendente',
          approved: 'Aprovado',
          rejected: 'Rejeitado',
        };
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${colors[value as string]}`}>
            {labels[value as string]}
          </span>
        );
      }
    },
    {
      key: 'requested_at',
      label: 'Data',
      render: (_, row) => <span className="text-xs font-bold text-slate-400">{formatDate(row.requested_at)}</span>
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(row.id)}
                disabled={actionLoading}
                className="py-2 px-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold uppercase hover:bg-emerald-100 dark:hover:bg-emerald-900/50 disabled:opacity-50"
              >
                Aprovar
              </button>
              <button
                onClick={() => {
                  setSelectedRequest(row);
                  setShowRejectModal(true);
                }}
                disabled={actionLoading}
                className="py-2 px-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold uppercase hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50"
              >
                Rejeitar
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  if (error) {
    return (
      <PageShell title="Solicitações de Autores" description="Gerencie solicitações de usuários para se tornarem autores">
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 mt-6">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-600 dark:text-red-400 font-bold text-sm">{error}</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Solicitações de Autores"
      description="Gerencie solicitações de usuários para se tornarem autores"
    >
      <div className="mt-6">
        <StatsGrid>
          <StatCard label="Total" value={stats.total} icon={UserPlus} />
          <StatCard label="Pendentes" value={stats.pending} variant="yellow" icon={AlertCircle} />
          <StatCard label="Aprovados" value={stats.approved} variant="green" icon={UserCheck} />
          <StatCard label="Rejeitados" value={stats.rejected} variant="red" icon={UserX} />
        </StatsGrid>
      </div>

      <div className="flex flex-wrap gap-3 mt-4 items-center">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as 'all' | 'pending' | 'approved' | 'rejected')}
          className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os Status</option>
          <option value="pending">Pendentes</option>
          <option value="approved">Aprovados</option>
          <option value="rejected">Rejeitados</option>
        </select>

        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mt-4">
        <div className="p-4 lg:p-5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3">
          <h3 className="font-bold text-slate-900 dark:text-white">
            Solicitações ({filteredRequests.length})
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Mostrar</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-xs text-slate-500 dark:text-slate-400">por página</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200 dark:border-slate-700">
                {columns.map(col => (
                  <th key={col.key} className="px-5 py-4">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={columns.length} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={32} /></td></tr>
              ) : paginatedRequests.length === 0 ? (
                <tr><td colSpan={columns.length} className="py-20 text-center"><UserPlus size={40} className="mx-auto text-slate-200 dark:text-slate-600 mb-4" /><p className="text-slate-400 font-bold text-sm uppercase">Nenhuma solicitação encontrada</p></td></tr>
              ) : paginatedRequests.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  {columns.map(col => (
                    <td key={col.key} className="px-5 py-4">
                      {col.render ? col.render('', row, 0) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredRequests.length)} de {filteredRequests.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Rejeitar Solicitação</h3>
              <button onClick={() => { setShowRejectModal(false); setSelectedRequest(null); setRejectReason(''); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4">
              Você está prestes a rejeitar a solicitação de <span className="text-slate-800 dark:text-white">"{selectedRequest.user_name}"</span>.
            </p>
            <div className="mb-4">
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-2 block">Motivo da Rejeição *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explique o motivo da rejeição..."
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowRejectModal(false); setSelectedRequest(null); setRejectReason(''); }}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white text-xs font-bold uppercase hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={16} /> : 'Rejeitar'}
              </button>
            </div>
          </div>
        </div>
       )}
    </PageShell>
   );
}
