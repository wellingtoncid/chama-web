import { Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

interface CategorySectionArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  image_url?: string;
  author_name: string;
  published_at: string;
  tags?: any[];
  category_slug: string;
}

interface CategorySectionProps {
  category: { id: number; name: string; slug: string };
  articles: CategorySectionArticle[];
}

const readingTime = (text?: string) => {
  if (!text) return '1 min';
  const words = text.trim().split(/\s+/).length;
  const min = Math.max(1, Math.round(words / 200));
  return `${min} min`;
};

const timeAgo = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} dias atrás`;
  return date.toLocaleDateString('pt-BR');
};

const CategorySection = ({ category, articles }: CategorySectionProps) => {
  if (articles.length === 0) return null;

  const featured = articles[0];
  const mini = articles.slice(1, 4);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch {
      return d;
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          {category.name}
        </h2>
        <Link
          to={`/artigos/${category.slug}`}
          className="text-xs font-bold text-[#1f4ead] hover:underline"
        >
          Ler tudo →
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {featured && (
          <Link to={`/artigos/${featured.slug}`} className="group block">
            <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-800 overflow-hidden">
              {featured.image_url ? (
                <img
                  src={getImageUrl(featured.image_url)}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl">📰</span>
                </div>
              )}
            </div>
          </Link>
        )}

        {featured && (
          <div className="p-5">
            <Link to={`/artigos/${featured.slug}`} className="group">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#1f4ead] transition-colors leading-snug mb-2">
                {featured.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                {featured.excerpt}
              </p>
            </Link>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="font-medium text-slate-600 dark:text-slate-300">{featured.author_name}</span>
              <span>·</span>
              <span>{readingTime(featured.excerpt)}</span>
              <span>·</span>
              <span>{timeAgo(featured.published_at)}</span>
            </div>
          </div>
        )}

        {mini.length > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {mini.map(article => (
              <div key={article.id} className="px-5 py-3.5">
                <Link to={`/artigos/${article.slug}`} className="group block">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#1f4ead] transition-colors leading-snug mb-1.5">
                    {article.title}
                  </h4>
                </Link>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-medium text-slate-500">{article.author_name}</span>
                  <span>·</span>
                  <span>{readingTime(article.excerpt)}</span>
                  <span>·</span>
                  <span>{timeAgo(article.published_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-3">
          <Link
          to={`/artigos/${category.slug}`}
            className="block w-full text-center text-sm font-bold text-[#1f4ead] hover:underline py-1"
          >
            Ver mais →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
