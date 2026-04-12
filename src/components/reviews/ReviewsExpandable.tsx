import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ReviewCard from './ReviewCard';
import { api } from '../../api/api';
import { Loader2, ChevronDown, ChevronUp, ExternalLink, Star } from 'lucide-react';

interface ReviewsExpandableProps {
  targetId: number;
  targetSlug: string;
  theme?: 'orange' | 'blue';
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
}

export default function ReviewsExpandable({
  targetId,
  targetSlug,
  theme = 'orange'
}: ReviewsExpandableProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [stats, setStats] = useState<{ avg_rating: number; total: number } | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);

  const themeColors = theme === 'orange'
    ? { accent: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' }
    : { accent: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' };

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('get-user-reviews', {
        params: {
          target_id: targetId,
          limit: 5,
          offset: 0,
          months: 3
        }
      });

      if (res.data?.success) {
        setReviews(res.data.data || []);
        setStats({
          avg_rating: res.data.stats?.avg_rating || 0,
          total: res.data.count || 0
        });
      }
    } catch (err) {
      console.error('Erro ao buscar avaliações:', err);
    } finally {
      setLoading(false);
    }
  }, [targetId]);

  useEffect(() => {
    if (!initialLoaded) {
      fetchReviews();
      setInitialLoaded(true);
    }
  }, [fetchReviews, initialLoaded]);

  useEffect(() => {
    if (expanded && reviews.length === 0) {
      fetchReviews();
    }
  }, [expanded, reviews.length, fetchReviews]);

  if (!stats && !expanded) {
    return null;
  }

  return (
    <div className={`${themeColors.bg} rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Star size={18} className="text-amber-400 fill-amber-400" />
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-slate-900 dark:text-white">
              {(!stats?.total ? '5.0' : Number(stats?.avg_rating || 0).toFixed(1))}
            </span>
            <span className="text-sm text-slate-500 font-bold">
              ({stats?.total || 0} avaliações)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/avaliacoes/${targetSlug}`}
            onClick={(e) => e.stopPropagation()}
            className={`text-xs font-black uppercase tracking-wider ${themeColors.accent} hover:underline flex items-center gap-1`}
          >
            Ver todas <ExternalLink size={12} />
          </Link>
          {expanded ? (
            <ChevronUp size={20} className="text-slate-400" />
          ) : (
            <ChevronDown size={20} className="text-slate-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-slate-500 font-bold">
                Nenhuma avaliação nos últimos 3 meses.
              </p>
            </div>
          ) : (
            <div className="pt-5 space-y-3">
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} theme={theme} />
              ))}
              
              {stats && stats.total > 5 && (
                <Link
                  to={`/avaliacoes/${targetSlug}`}
                  className={`flex items-center justify-center gap-2 py-3 ${theme === 'orange' ? 'bg-orange-100 dark:bg-orange-500/20' : 'bg-blue-100 dark:bg-blue-500/20'} rounded-xl text-sm font-black uppercase tracking-wider ${themeColors.accent} hover:opacity-80 transition-opacity`}
                >
                  Ver todas as {stats.total} avaliações <ExternalLink size={14} />
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
