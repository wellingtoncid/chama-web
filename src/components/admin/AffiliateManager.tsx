import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { Loader2, Star, Check, X, User, Calendar, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import { PageShell, StatsGrid, StatCard } from '@/components/admin';

type InterestStatus = 'pending' | 'approved' | 'rejected';

const STATUS_LABELS: Record<InterestStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado'
};

const STATUS_COLORS: Record<InterestStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
};

interface Stats {
  interests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    avg_willing_to_pay: number;
  };
  users_with_access: number;
}

export default function AffiliateManager() {
  const [filterStatus, setFilterStatus] = useState<InterestStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    loadInterests();
  }, [filterStatus]);

  const loadStats = async () => {
    try {
      const res = await api.get('admin/affiliate/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const loadInterests = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 500 };
      if (filterStatus !== 'all') params.status = filterStatus;
      
      const res = await api.get('admin/affiliate/interests', { params });
      if (res.data?.success) {
        setInterests(res.data.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar interesses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    const result = await Swal.fire({
      title: 'Aprovar Acesso?',
      text: 'Este usuário terá acesso ao recurso de afiliados.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Aprovar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10B981',
    });

    if (!result.isConfirmed) return;

    setProcessingId(id);
    try {
      const res = await api.post(`admin/affiliate/interests/${id}/approve`);
      if (res.data?.success) {
        Swal.fire('Aprovado!', 'Acesso ao recurso de afiliados liberado.', 'success');
        loadInterests();
        loadStats();
      }
    } catch (err: any) {
      Swal.fire('Erro', err.response?.data?.message || 'Erro ao aprovar.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    const { value: notes } = await Swal.fire({
      title: 'Rejeitar Solicitação',
      text: 'Informe o motivo da rejeição (opcional):',
      input: 'textarea',
      inputPlaceholder: 'Ex: Não se enquadra nos critérios...',
      showCancelButton: true,
      confirmButtonText: 'Rejeitar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
    });

    setProcessingId(id);
    try {
      const res = await api.post(`admin/affiliate/interests/${id}/reject`, {
        admin_notes: notes || 'Rejeitado'
      });
      if (res.data?.success) {
        Swal.fire('Rejeitado', 'Solicitação rejeitada.', 'info');
        loadInterests();
        loadStats();
      }
    } catch (err: any) {
      Swal.fire('Erro', err.response?.data?.message || 'Erro ao rejeitar.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRevoke = async (id: number) => {
    const result = await Swal.fire({
      title: 'Revogar Acesso?',
      text: 'Este usuário perderá o acesso ao recurso de afiliados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Revogar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
    });

    if (!result.isConfirmed) return;

    setProcessingId(id);
    try {
      const res = await api.post(`admin/affiliate/interests/${id}/revoke`);
      if (res.data?.success) {
        Swal.fire('Revogado!', 'Acesso ao recurso de afiliados foi revogado.', 'success');
        loadInterests();
        loadStats();
      }
    } catch (err: any) {
      Swal.fire('Erro', err.response?.data?.message || 'Erro ao revogar.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    if (!value) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const totalPages = Math.ceil(interests.length / pageSize);
  const paginatedInterests = interests.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <PageShell
      title="Interesses de Afiliados"
      description="Gerencie solicitações de acesso ao recurso"
    >
      <div className="mt-6">
        <StatsGrid>
          <StatCard label="Total" value={stats?.interests.total ?? 0} icon={Star} />
          <StatCard label="Pendentes" value={stats?.interests.pending ?? 0} variant="yellow" icon={Calendar} />
          <StatCard label="Aprovados" value={stats?.interests.approved ?? 0} variant="green" icon={Check} />
          <StatCard label="Com Acesso" value={stats?.users_with_access ?? 0} icon={UserCheck} />
        </StatsGrid>
      </div>

      <div className="flex flex-wrap gap-3 mt-4 items-center">
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as InterestStatus | 'all')}
          className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">Todos os Status</option>
          <option value="pending">Pendentes</option>
          <option value="approved">Aprovados</option>
          <option value="rejected">Rejeitados</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mt-4">
        <div className="p-4 lg:p-5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3">
          <h3 className="font-bold text-slate-900 dark:text-white">
            Solicitações ({interests.length})
          </h3>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Mostrar</span>
            <select 
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
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

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="px-5 py-4">Usuário</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Disposto a Pagar</th>
                <th className="px-5 py-4">Data</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={32} /></td></tr>
              ) : interests.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center"><Star size={40} className="mx-auto text-slate-200 dark:text-slate-600 mb-4" /><p className="text-slate-400 font-bold text-sm uppercase">Nenhuma solicitação encontrada</p></td></tr>
              ) : paginatedInterests.map((interest) => (
                <>
                  <tr key={interest.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                          {interest.user_avatar ? (
                            <img src={interest.user_avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={20} className="text-slate-400" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-slate-800 dark:text-white text-sm uppercase italic">{interest.user_name || 'Usuário'}</p>
                          <p className="text-[10px] font-bold text-slate-400">{interest.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${STATUS_COLORS[interest.status as InterestStatus]}`}>
                        {STATUS_LABELS[interest.status as InterestStatus]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {formatCurrency(interest.willing_to_pay)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-bold text-slate-400">
                        {interest.created_at ? formatDate(interest.created_at) : '---'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setExpandedId(expandedId === interest.id ? null : interest.id)}
                          className="py-2 px-4 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase hover:bg-slate-100 dark:hover:bg-slate-600"
                        >
                          {expandedId === interest.id ? 'Fechar' : 'Detalhes'}
                        </button>
                        {interest.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(interest.id)}
                              disabled={processingId === interest.id}
                              className="py-2 px-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold uppercase hover:bg-emerald-100 dark:hover:bg-emerald-900/50 disabled:opacity-50"
                            >
                              {processingId === interest.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            </button>
                            <button
                              onClick={() => handleReject(interest.id)}
                              disabled={processingId === interest.id}
                              className="py-2 px-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold uppercase hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        {interest.status === 'approved' && (
                          <button
                            onClick={() => handleRevoke(interest.id)}
                            disabled={processingId === interest.id}
                            className="py-2 px-4 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg text-xs font-bold uppercase hover:bg-orange-100 dark:hover:bg-orange-900/50 disabled:opacity-50"
                          >
                            Revogar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedId === interest.id && (
                    <tr key={`detail-${interest.id}`}>
                      <td colSpan={5} className="px-5 py-6 bg-slate-50 dark:bg-slate-900/50">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Uso Pretendido</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{interest.intended_use || 'Não informado'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Data da Solicitação</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatDate(interest.created_at)}</p>
                          </div>
                          {interest.admin_notes && (
                            <div className="col-span-2">
                              <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Notas do Admin</p>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{interest.admin_notes}</p>
                            </div>
                          )}
                          {interest.approved_at && (
                            <div className="col-span-2">
                              <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Aprovado Em</p>
                              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatDate(interest.approved_at)}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, interests.length)} de {interests.length}
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
      </div>
    </PageShell>
  );
}
