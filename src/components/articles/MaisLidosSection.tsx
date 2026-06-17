import { Link } from 'react-router-dom';
import { getImageUrl } from '@/lib/utils';
import { Eye } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string;
  image_url?: string;
  author_name: string;
  category_name: string;
  category_slug: string;
  views_count: number;
  published_at: string;
}

interface Props {
  articles: Article[];
}

export const MaisLidosSection = ({ articles }: Props) => {
  if (articles.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
        Mais Lidos
      </h3>
      <div className="space-y-4">
        {articles.map((article, index) => (
          <Link
            key={article.id}
            to={`/artigos/${article.slug}`}
            className="group flex gap-3"
          >
            <div className="relative w-16 h-16 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden">
              {article.image_url ? (
                <img
                  src={getImageUrl(article.image_url)}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg">
                  📄
                </div>
              )}
              <span className="absolute top-0 left-0 bg-[#1f4ead] text-white text-[10px] font-bold px-1.5 py-0.5 leading-none">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {article.category_name}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#1f4ead] transition-colors line-clamp-2 leading-snug mt-0.5">
                {article.title}
              </h4>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                <span>{article.author_name}</span>
                <span className="flex items-center gap-0.5">
                  <Eye size={11} />
                  {article.views_count}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
