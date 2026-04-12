import React, { useState, useEffect } from 'react';
import ReviewCard from './ReviewCard';
import { api } from '../../api/api';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReviewsListProps {
  targetId: number;
  initialLimit?: number;
  theme?: 'orange' | 'blue';
  showDistribution?: boolean;
  showPagination?: boolean;
  showFilters?: boolean;
  showReplyButton?: boolean;
  showReportButton?: boolean;
}

interface ReviewData {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_name: string;
  reviewer_avatar?: string;
  reviewer_role?: string;
  origin_city?: string;
  origin_state?: string;
  dest_city?: string;
  dest_state?: string;
  reply_text?: string;
  replied_at?: string;
}

const TIME_FILTERS = [
  { value: 3, label: '3 meses' },
  { value: 6, label: '6 meses' },
  { value: 12, label: '1 ano' },
  { value: null, label: 'Todos' },
];

export default function ReviewsList({
  targetId,
  initialLimit = 10,
  theme = 'orange',
  showDistribution = true,
  showPagination = true,
  showFilters = true,
  showReplyButton = false,
  showReportButton = true
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ avg_rating: number; total: number; distribution: Record<number, number> }>({
    avg_rating: 0,
    total: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [months, setMonths] = useState<number | null>(3);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const themeColors = theme === 'orange'
    ? { accent: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' }
    : { accent: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' };

  useEffect(() => {
    fetchReviews();
  }, [targetId, months, offset]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get('get-user-reviews', {
        params: {
          target_id: targetId,
          limit: initialLimit,
          offset,
          months
        }
      });

      if (res.data?.success) {
        if (offset === 0) {
          setReviews(res.data.data || []);
        } else {
          setReviews(prev => [...prev, ...(res.data.data || [])]);
        }
        setStats({
          avg_rating: res.data.stats?.avg_rating || 0,
          total: res.data.count || 0,
          distribution: res.data.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        });
        setHasMore((res.data.data || []).length >= initialLimit);
      }
    } catch (err) {
      console.error('Erro ao buscar avaliações:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (value: number | null) => {
    setMonths(value);
    setOffset(0);
    setReviews([]);
  };

  const handleLoadMore = () => {
    setOffset(prev => prev + initialLimit);
  };

  const handlePrev = () => {
    if (offset > 0) {
      setOffset(prev => Math.max(0, prev - initialLimit));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-black text-slate-900 dark:text-white">
            ⭐ {(!stats.total ? '5.0' : Number(stats.avg_rating || 0).toFixed(1))}
          </span>
          <div>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
              {stats.total} {stats.total === 1 ? 'avaliação' : 'avaliações'}
            </p>
            <p className="text-xs text-slate-400">últimos {months ? `${months} meses` : 'todos os tempos'}</p>
          </div>
        </div>
      </div>

      {/* Distribution */}
      {showDistribution && stats.total > 0 && (
        <div className={`${themeColors.bg} rounded-2xl p-4 border border-slate-100 dark:border-slate-800`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
            Distribuição
          </p>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(star => {
              const percent = stats.distribution?.[star] || 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 w-3">{star}</span>
                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${theme === 'orange' ? 'bg-orange-500' : 'bg-blue-500'} rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-400 w-8 text-right">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && stats.total > 0 && (
        <div className="flex gap-2 flex-wrap">
          {TIME_FILTERS.map(filter => (
            <button
              key={filter.label}
              onClick={() => handleFilterChange(filter.value)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                months === filter.value
                  ? `${theme === 'orange' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {/* Reviews List */}
      {loading && reviews.length === 0 ? (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      ) : reviews.length === 0 ? (
        <div className={`${themeColors.bg} rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-800`}>
          <p className="text-slate-500 font-bold">Nenhuma avaliação encontrada.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              theme={theme}
              showReplyButton={showReplyButton}
              showReportButton={showReportButton}
              targetUserId={targetId}
            />
          ))}

          {/* Load More */}
          {showPagination && hasMore && (
            <div className="flex justify-center gap-4 pt-4">
              <button
                onClick={handlePrev}
                disabled={offset === 0}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft size={16} /> Anterior
              </button>
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>Próxima <ChevronRight size={16} /></>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
