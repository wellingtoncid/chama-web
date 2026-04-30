import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/api';
import { Loader2, Star, Check, X, Clock, Eye, ExternalLink, User, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import PageShell, { StatsGrid, StatCard, TimeFilter } from '@/components/admin';

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

type TabType = 'pending' | 'published' | 'rejected';

const TABS: { key: TabType; label: string; color: string; bgColor: string; borderColor: string }[] = [
  { key: 'pending', label: 'Aguardando', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { key: 'published', label: 'Aprovadas', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  { key: 'rejected', label: 'Rejeitadas', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
];

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
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [counts, setCounts] = useState<Record<TabType, number>>({ pending: 0, published: 0, rejected: 0 });
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | '30days' | 'thisMonth' | 'custom' | 'all'>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('admin-reviews', {
        params: {
          status: activeTab,
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
  }, [activeTab, timeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      <StatsGrid>
        <StatCard label="Total" value={counts.pending + counts.published + counts.rejected} icon={Star} />
        <StatCard label="Aguardando" value={counts.pending} variant="yellow" icon={Clock} />
        <StatCard label="Aprovadas" value={counts.published} variant="green" icon={Check} />
        <StatCard label="Rejeitadas" value={counts.rejected} variant="red" icon={X} />
      </StatsGrid>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl font-black uppercase text-xs tracking-wider transition-all flex items-center gap-2 ${
                activeTab === tab.key
                  ? `${tab.bgColor} ${tab.color} border ${tab.borderColor}`
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.key ? 'bg-white/50' : 'bg-slate-200 dark:bg-slate-700'}`}>
                {counts[tab.key] || 0}
              </span>
            </button>
          ))}
        </div>
        <TimeFilter value={timeFilter} onChange={(v: any) => setTimeFilter(v)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-slate-400" /></div>
      ) : reviews.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
          <Star size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
          <p className="text-slate-500 font-bold">Nenhuma avaliação encontrada.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden ${expandedCards.has(review.id) ? 'ring-2 ring-orange-500/20' : ''}`}>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    {review.reviewer_avatar ? <img src={review.reviewer_avatar} className="w-full h-full object-cover rounded-xl" alt="" /> : <User size={20} className="text-slate-400" />}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{review.reviewer_name}</span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${review.reviewer_role === 'driver' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
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
                    {review.comment && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 italic">"{review.comment}"</p>}
                    
                    <div className="flex gap-2 mt-4">
                      {activeTab === 'pending' ? (
                        <>
                          <button onClick={() => handleApprove(review.id)} disabled={processingId === review.id} className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase disabled:opacity-50">Aprovar</button>
                          <button onClick={() => handleReject(review.id)} disabled={processingId === review.id} className="flex-1 py-2 bg-red-500 text-white rounded-xl text-xs font-black uppercase disabled:opacity-50">Rejeitar</button>
                        </>
                      ) : (
                        <Link to={`/perfil/${review.target_id}`} target="_blank" className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs">Ver Perfil</Link>
                      )}
                      <button onClick={() => toggleCard(review.id)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl"><Eye size={14} /></button>
                      <button onClick={() => handleDelete(review.id)} className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>

              {expandedCards.has(review.id) && (
                <div className="px-5 pb-5 pt-0 border-t border-slate-100 dark:border-slate-800">
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl grid grid-cols-2 gap-4 text-xs">
                    <div><span className="text-slate-400 font-bold uppercase">ID Avaliação:</span> <span className="ml-2 font-mono">{review.id}</span></div>
                    <div><span className="text-slate-400 font-bold uppercase">Avaliador ID:</span> <span className="ml-2">{review.reviewer_id}</span></div>
                    <div><span className="text-slate-400 font-bold uppercase">Alvo ID:</span> <span className="ml-2">{review.target_id}</span></div>
                    <div><span className="text-slate-400 font-bold uppercase">Nota:</span> <span className="ml-2">{review.rating}/5</span></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}