import { Link } from 'react-router-dom';
import { getImageUrl, timeAgo } from '@/lib/utils';

interface Article {
  id: number;
  title: string;
  slug: string;
  author_id: number;
  author_name: string;
  author_avatar: string;
  author_slug?: string;
  author_headline?: string;
  published_at: string;
}

interface Props {
  articles: Article[];
}

export const ColunistasSection = ({ articles }: Props) => {
  if (articles.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
        Colunistas
      </h3>
      <div className="space-y-4">
        {articles.map((article) => (
          <Link
            key={article.id}
            to={`/artigos/${article.slug}`}
            className="group flex gap-3"
          >
            <div className="w-10 h-10 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              {article.author_avatar ? (
                <img
                  src={getImageUrl(article.author_avatar)}
                  alt={article.author_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-500 bg-slate-300 dark:bg-slate-700">
                  {article.author_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#1f4ead] transition-colors line-clamp-2 leading-snug">
                {article.title}
              </h4>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  {article.author_name}
                </span>
                {article.author_headline && (
                  <span className="truncate text-slate-400">
                    {article.author_headline}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
