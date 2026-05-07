import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../api/api';
import { Loader2, Star, Check, X, Clock, Eye, User, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';
import PageShell, { StatsGrid, StatCard } from '@/components/admin';

interface Review {
  id: number;
  reviewer_id: number;
  reviewer_name: string;
  reviewer_role: string;
  reviewer_avatar?: string;
  target_id: number;
  target_name: string;
  target_role: string;
  rating: number;
  comment: string;
  status: string;
  created_at: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'Aguardando', color: 'bg-amber-100 text-amber-600' },
  published: { label: 'Aprovada', color: 'bg-emerald-100 text-emerald-600' },
  rejected: { label: 'Rejeitada', color: 'bg-red-100 text-red-600' },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function ReviewsManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | '7days' | '30days' | 'thisMonth'>('all');
  const [counts, setCounts] = useState<Record<string, number>>({ pending: 0, published: 0, rejected: 0 });
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, timeFilter, pageSize]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('admin-reviews', {
        params: {
          status: statusFilter,
          period: timeFilter !== 'all' ? timeFilter : undefined,
          limit: 50
        }
      });
      if (res.data?.success) {
        setReviews(res.data.data || []);
        setCounts(res.data.counts || { pending: 0, published: 0, rejected: 0 });
      }
    } catch (err) {
      console.error('Erro ao carregar avaliações:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, timeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredReviews = useMemo(() => {
    return reviews;
  }, [reviews]);

  const totalPages = Math.ceil(filteredReviews.length / pageSize);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAction = async (reviewId: number, action: 'approve' | 'reject' | 'delete', extraData?: object) => {
    setProcessingId(reviewId);
    try {
      const res = await api.post(`admin-review/${action}`, { review_id: reviewId, ...extraData });
      if (res.data?.success) {
        loadData();
        return true;
      }
    } catch (err: any) {
      Swal.fire('Erro', err.response?.data?.message || 'Erro na operação.', 'error');
    } finally {
      setProcessingId(null);
    }
    return false;
  };

  const handleApprove = async (id: number) => {
    const result = await Swal.fire({
      title: 'Aprovar Avaliação?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, aprovar',
      confirmButtonColor: '#10b981',
    });
    if (result.isConfirmed) {
      if (await handleAction(id, 'approve')) {
        Swal.fire('Aprovada!', 'Publicada com sucesso.', 'success');
      }
    }
  };

  const handleReject = async (id: number) => {
    const { value: reason } = await Swal.fire({
      title: 'Rejeitar Avaliação',
      input: 'textarea',
      inputPlaceholder: 'Motivo da rejeição...',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
    });
    if (reason) {
      if (await handleAction(id, 'reject', { reason })) {
        Swal.fire('Rejeitada!', 'Avaliação removida.', 'success');
      }
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Excluir permanentemente?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sim, excluir',
    });
    if (result.isConfirmed) {
      if (await handleAction(id, 'delete')) {
        Swal.fire('Excluída!', 'Removida do banco de dados.', 'success');
      }
    }
  };

  const toggleCard = (id: number) => {
    const newExpanded = new Set(expandedCards);
    newExpanded.has(id) ? newExpanded.delete(id) : newExpanded.add(id);
    setExpandedCards(newExpanded);
  };

  return (
    <PageShell title="Avaliações" description="Modere avaliações dos usuários na plataforma">
      <div className="mt-6">
        <StatsGrid>
          <StatCard label="Total" value={counts.pending + counts.published + counts.rejected} icon={Star} />
          <StatCard label="Aguardando" value={counts.pending} variant="yellow" icon={Clock} />
          <StatCard label="Aprovadas" value={counts.published} variant="green" icon={Check} />
          <StatCard label="Rejeitadas" value={counts.rejected} variant="red" icon={X} />
        </StatsGrid>
      </div>

      <div className="flex flex-wrap gap-3 mt-4 items-center">
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value)} 
          className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="pending">Aguardando ({counts.pending})</option>
          <option value="published">Aprovadas ({counts.published})</option>
          <option value="rejected">Rejeitadas ({counts.rejected})</option>
        </select>

        <select 
          value={timeFilter} 
          onChange={e => setTimeFilter(e.target.value as typeof timeFilter)} 
          className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">Qualquer período</option>
          <option value="today">Hoje</option>
          <option value="7days">Últimos 7 dias</option>
          <option value="30days">Últimos 30 dias</option>
          <option value="thisMonth">Este mês</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-slate-400" /></div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Star size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold">Nenhuma avaliação encontrada.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mt-4">
          <div className="p-4 lg:p-5 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
            <h3 className="font-bold text-slate-900">
              Avaliações ({filteredReviews.length})
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Mostrar</span>
              <select 
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-xs text-slate-500">por página</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {paginatedReviews.length > 0 ? paginatedReviews.map(review => (
              <div key={review.id} className={`p-5 ${expandedCards.has(review.id) ? 'ring-2 ring-inset ring-orange-500/20' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    {review.reviewer_avatar ? <img src={review.reviewer_avatar} className="w-full h-full object-cover rounded-xl" alt="" /> : <User size={20} className="text-slate-400" />}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{review.reviewer_name}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${review.reviewer_role === 'driver' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                            {review.reviewer_role === 'driver' ? 'Motorista' : 'Empresa'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">avaliou {review.target_name}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />)}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{formatDate(review.created_at)}</p>
                      </div>
                    </div>
                    {review.comment && <p className="mt-3 text-sm text-slate-600 italic">"{review.comment}"</p>}
                    
                    <div className="flex gap-2 mt-4">
                      {statusFilter === 'pending' ? (
                        <>
                          <button onClick={() => handleApprove(review.id)} disabled={processingId === review.id} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase disabled:opacity-50">Aprovar</button>
                          <button onClick={() => handleReject(review.id)} disabled={processingId === review.id} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold uppercase disabled:opacity-50">Rejeitar</button>
                        </>
                      ) : (
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${STATUS_MAP[review.status]?.color || 'bg-slate-100 text-slate-500'}`}>
                          {STATUS_MAP[review.status]?.label || review.status}
                        </span>
                      )}
                      <button onClick={() => toggleCard(review.id)} className="px-3 py-2 bg-slate-100 rounded-lg hover:bg-slate-200"><Eye size={14} /></button>
                      <button onClick={() => handleDelete(review.id)} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>

                {expandedCards.has(review.id) && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl grid grid-cols-2 gap-4 text-xs">
                    <div><span className="text-slate-400 font-bold uppercase">ID Avaliação:</span> <span className="ml-2 font-mono">{review.id}</span></div>
                    <div><span className="text-slate-400 font-bold uppercase">Avaliador ID:</span> <span className="ml-2">{review.reviewer_id}</span></div>
                    <div><span className="text-slate-400 font-bold uppercase">Alvo ID:</span> <span className="ml-2">{review.target_id}</span></div>
                    <div><span className="text-slate-400 font-bold uppercase">Nota:</span> <span className="ml-2">{review.rating}/5</span></div>
                  </div>
                )}
              </div>
            )) : (
              <div className="p-12 text-center text-slate-400 font-medium">
                Nenhuma avaliação encontrada
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredReviews.length)} de {filteredReviews.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-medium text-slate-600">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}