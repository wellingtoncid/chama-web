import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { Loader2, Star, Check, X, Clock, Eye, ExternalLink, User, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';


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
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
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

  useEffect(() => {
    loadCounts();
    loadReviews();
  }, [activeTab]);

  const loadCounts = async () => {
    try {
      const res = await api.get('admin-reviews', { params: { limit: 1 } });
      if (res.data?.success) {
        setCounts(res.data.counts || { pending: 0, published: 0, rejected: 0 });
      }
    } catch (err) {
      console.error('Erro ao carregar contagens:', err);
    }
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('admin-reviews', {
        params: {
          status: activeTab,
          limit: 50
        }
      });
      if (res.data?.success) {
        setReviews(res.data.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar avaliações:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: number) => {
    const result = await Swal.fire({
      title: 'Aprovar Avaliação?',
      text: 'Esta avaliação será publicada no perfil do usuário.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sim, aprovar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setProcessingId(reviewId);
      try {
        const res = await api.post('admin-review/approve', { review_id: reviewId });
        if (res.data?.success) {
          Swal.fire('Aprovada!', 'A avaliação foi aprovada e publicada.', 'success');
          loadCounts();
          loadReviews();
        } else {
          Swal.fire('Erro', res.data?.message || 'Erro ao aprovar avaliação.', 'error');
        }
      } catch (err: any) {
        Swal.fire('Erro', err.response?.data?.message || 'Erro ao aprovar avaliação.', 'error');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleReject = async (reviewId: number) => {
    const { value: reason } = await Swal.fire({
      title: 'Rejeitar Avaliação',
      text: 'Informe o motivo da rejeição:',
      input: 'textarea',
      inputPlaceholder: 'Motivo da rejeição...',
      inputValidator: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Você precisa informar um motivo!';
        }
      },
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Rejeitar',
      cancelButtonText: 'Cancelar'
    });

    if (reason) {
      setProcessingId(reviewId);
      try {
        const res = await api.post('admin-review/reject', { review_id: reviewId, reason });
        if (res.data?.success) {
          Swal.fire('Rejeitada!', 'A avaliação foi rejeitada.', 'success');
          loadCounts();
          loadReviews();
        } else {
          Swal.fire('Erro', res.data?.message || 'Erro ao rejeitar avaliação.', 'error');
        }
      } catch (err: any) {
        Swal.fire('Erro', err.response?.data?.message || 'Erro ao rejeitar avaliação.', 'error');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleDelete = async (reviewId: number) => {
    const result = await Swal.fire({
      title: 'Excluir Avaliação?',
      text: 'Esta ação não pode ser desfeita. A avaliação será removida permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setProcessingId(reviewId);
      try {
        const res = await api.post('admin-review/delete', { review_id: reviewId });
        if (res.data?.success) {
          Swal.fire('Excluída!', 'A avaliação foi excluída permanentemente.', 'success');
          loadCounts();
          loadReviews();
        } else {
          Swal.fire('Erro', res.data?.message || 'Erro ao excluir avaliação.', 'error');
        }
      } catch (err: any) {
        Swal.fire('Erro', err.response?.data?.message || 'Erro ao excluir avaliação.', 'error');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const toggleCard = (id: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">
            Avaliações
          </h1>
          <p className="text-sm text-slate-500 font-bold mt-1">
            Modere avaliações dos usuários na plataforma
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl font-black uppercase text-xs tracking-wider transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? `${tab.bgColor} ${tab.color} border ${tab.borderColor}`
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab.key === 'pending' && <Clock size={14} />}
            {tab.key === 'published' && <Check size={14} />}
            {tab.key === 'rejected' && <X size={14} />}
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.key ? 'bg-white/50' : 'bg-slate-200 dark:bg-slate-700'}`}>
              {counts[tab.key] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-slate-400" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
          <Star size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
          <p className="text-slate-500 font-bold">
            {activeTab === 'pending' 
              ? 'Nenhuma avaliação pendente de análise.'
              : activeTab === 'published'
              ? 'Nenhuma avaliação aprovada.'
              : 'Nenhuma avaliação rejeitada.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div
              key={review.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all ${
                expandedCards.has(review.id) ? 'ring-2 ring-orange-500/20' : ''
              }`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {review.reviewer_avatar ? (
                      <img src={review.reviewer_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-slate-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {review.reviewer_name}
                          </span>
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            review.reviewer_role === 'driver' 
                              ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400'
                              : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                          }`}>
                            {review.reviewer_role === 'driver' ? 'Motorista' : 'Empresa'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          avaliou {review.target_name} ({review.target_role === 'driver' ? 'Motorista' : 'Empresa'})
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(star => (
                            <Star
                              key={star}
                              size={14}
                              className={star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}
                            />
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
                        "{review.comment}"
                      </p>
                    )}

                    {/* Actions */}
                    {activeTab === 'pending' && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleApprove(review.id)}
                          disabled={processingId === review.id}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-black uppercase text-xs hover:bg-emerald-600 transition-all disabled:opacity-50"
                        >
                          {processingId === review.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          Aprovar
                        </button>
                        <button
                          onClick={() => handleReject(review.id)}
                          disabled={processingId === review.id}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl font-black uppercase text-xs hover:bg-red-600 transition-all disabled:opacity-50"
                        >
                          {processingId === review.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <X size={14} />
                          )}
                          Rejeitar
                        </button>
                        <button
                          onClick={() => toggleCard(review.id)}
                          className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    )}

                    {/* Links */}
                    {activeTab !== 'pending' && (
                      <div className="flex gap-2 mt-4">
                        <Link
                          to={`/perfil/${review.target_id}`}
                          target="_blank"
                          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                          Ver Perfil <ExternalLink size={12} />
                        </Link>
                        {activeTab === 'published' && (
                          <button
                            onClick={() => handleReject(review.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl font-bold text-xs hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                          >
                            <X size={12} /> Bloquear
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review.id)}
                          disabled={processingId === review.id}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl font-bold text-xs hover:bg-red-100 dark:hover:bg-red-500/20 transition-all disabled:opacity-50"
                        >
                          {processingId === review.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )} Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedCards.has(review.id) && (
                <div className="px-5 pb-5 pt-0 border-t border-slate-100 dark:border-slate-800">
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">
                      Detalhes da Avaliação
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400 font-bold">ID:</span>
                        <span className="ml-2 text-slate-900 dark:text-white font-mono">{review.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold">Avaliador:</span>
                        <span className="ml-2 text-slate-900 dark:text-white">
                          {review.reviewer_name} (ID: {review.reviewer_id})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold">Avaliado:</span>
                        <span className="ml-2 text-slate-900 dark:text-white">
                          {review.target_name} (ID: {review.target_id})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold">Nota:</span>
                        <span className="ml-2 text-slate-900 dark:text-white font-bold">{review.rating}/5</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 font-bold">Data:</span>
                        <span className="ml-2 text-slate-900 dark:text-white">{formatDate(review.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
