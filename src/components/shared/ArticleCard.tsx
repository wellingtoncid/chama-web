import { Link } from 'react-router-dom';
import { Calendar, BookOpen } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

interface ArticleCardProps {
  article: {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    image_url?: string;
    author_name?: string;
    author_avatar?: string;
    author_slug?: string;
    category_name?: string;
    category_slug?: string;
    published_at?: string;
    views_count?: number;
  };
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  };

  return (
    <Link
      to={`/artigos/${article.slug}`}
      className="group block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:border-orange-500/30 transition-all"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="flex-1 p-5 flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 flex-wrap">
            {article.author_avatar ? (
              <img
                src={article.author_avatar}
                alt=""
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-[8px] font-black text-orange-500">
                {(article.author_name || 'U')[0]}
              </div>
            )}
            <span className="font-semibold">
              Por {article.author_name || 'Autor'}
            </span>
            {article.category_name && (
              <>
                <span className="text-slate-300">, em</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {article.category_name}
                </span>
              </>
            )}
            <span className="bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
              Artigo
            </span>
          </div>

          {article.published_at && (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium mb-2">
              <Calendar size={12} />
              {formatDate(article.published_at)}
            </div>
          )}

          <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors mb-1">
            {article.title}
          </h3>

          {article.excerpt && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          {article.views_count !== undefined && (
            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2">
              <BookOpen size={11} />
              {article.views_count} visualizações
            </div>
          )}
        </div>

        {article.image_url && (
          <div className="sm:w-48 shrink-0">
            <img
              src={getImageUrl(article.image_url)}
              alt={article.title}
              className="w-full h-40 sm:h-full object-cover"
            />
          </div>
        )}
      </div>
    </Link>
  );
}
