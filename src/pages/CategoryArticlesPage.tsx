import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '@/api/api';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AdCard from '@/components/shared/AdCard';
import { getImageUrl, timeAgo } from '@/lib/utils';
import { Clock, User } from 'lucide-react';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { MaisLidosSection } from '@/components/articles/MaisLidosSection';
import { MaisRecentesSection } from '@/components/articles/MaisRecentesSection';
import { ColunistasSection } from '@/components/articles/ColunistasSection';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  image_url?: string;
  author_id: number;
  author_name: string;
  author_headline?: string;
  author_avatar: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  featured: boolean;
  is_paid: boolean;
  is_ai_generated: boolean | number;
  tags?: any[];
  views_count: number;
  clicks_count: number;
  published_at: string;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
}

const CategoryArticlesPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryName = allArticles.length > 0 ? allArticles[0].category_name : '';

  const mostRead = useMemo(() =>
    [...allArticles].sort((a, b) => b.views_count - a.views_count).slice(0, 5),
    [allArticles]
  );

  const latest = useMemo(() =>
    [...allArticles].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()).slice(0, 5),
    [allArticles]
  );

  const colunistas = useMemo(() => {
    const seen = new Set<number>();
    return allArticles
      .filter(a => {
        if (seen.has(a.author_id)) return false;
        seen.add(a.author_id);
        return true;
      })
      .slice(0, 5);
  }, [allArticles]);

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const query = slug === 'publieditorial' ? '/articles?paid=1&limit=50' : `/articles?category_slug=${slug}&limit=50`;
      const articlesRes = await api.get(query);
      if (articlesRes.data?.success) {
        setAllArticles(articlesRes.data.data.articles || []);
      }
    } catch (error) {
      console.error('Error fetching category articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const capaDoDia = allArticles[0] || null;
  const heroSecondary = allArticles.slice(1, 3);
  const heroCompact = allArticles.slice(3, 8);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const ArticleCategoryBadge = ({ name }: { name: string; slug: string }) => (
    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
      {name}
    </span>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col font-sans transition-colors duration-300">
      <Header />

      <main className="flex-grow pt-32">
        <div className="max-w-7xl mx-auto px-4">

          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Artigos', href: '/artigos' },
            { label: categoryName || slug || '' },
          ]} linkClassName="hover:text-[#1f4ead]" className="mb-6" />

          <header className="mb-10">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-[0.85] mb-4">
              {categoryName || slug}
            </h1>
          </header>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden animate-pulse">
                  <div className="h-36 bg-slate-200 dark:bg-slate-800"></div>
                  <div className="p-3">
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : allArticles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Nenhum artigo encontrado nesta categoria.
              </p>
              <Link
                to="/artigos"
                className="text-sm font-bold text-[#1f4ead] hover:underline"
              >
                Ver todos os artigos →
              </Link>
            </div>
          ) : (
            <>
              <section className="mb-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                  <div className="lg:col-span-2">
                    {capaDoDia && (
                      <Link to={`/artigos/${capaDoDia.slug}`} className="group block h-full">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all h-full flex flex-col">
                          <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            {capaDoDia.image_url ? (
                              <img src={getImageUrl(capaDoDia.image_url)} alt={capaDoDia.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-6xl">📰</span>
                              </div>
                            )}
                          </div>
                          <div className="p-5 md:p-6 flex-1 flex flex-col">
                            <ArticleCategoryBadge name={capaDoDia.category_name} slug={capaDoDia.category_slug} />
                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-2 mb-2 group-hover:text-[#1f4ead] transition-colors leading-tight">
                              {capaDoDia.title}
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
                              {capaDoDia.excerpt}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <User size={14} />
                              <span className="font-medium">{capaDoDia.author_name}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )}
                  </div>

                  <div className="lg:col-span-1 flex flex-col gap-6">
                    {heroSecondary.map(article => (
                      <Link key={article.id} to={`/artigos/${article.slug}`} className="group flex-1">
                        <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all h-full">
                          <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            {article.image_url ? (
                              <img src={getImageUrl(article.image_url)} alt={article.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-3xl">📄</span>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <ArticleCategoryBadge name={article.category_name} slug={article.category_slug} />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 mb-2 group-hover:text-[#1f4ead] transition-colors line-clamp-2 leading-snug">
                              {article.title}
                            </h3>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <User size={12} />
                              <span>{article.author_name}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="lg:col-span-1">
                    {heroCompact.length > 0 && (
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                          <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Últimas
                          </h3>
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {heroCompact.map(article => (
                            <Link key={article.id} to={`/artigos/${article.slug}`} className="group block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-0.5">
                                {article.category_name}
                              </div>
                              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#1f4ead] transition-colors line-clamp-2 leading-snug">
                                {article.title}
                              </h4>
                              <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                                <Clock size={11} />
                                <span>{timeAgo(article.published_at)}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </section>

              <div className="mb-8 max-w-4xl mx-auto">
                <AdCard position="infeed_wide" variant="ecommerce" />
              </div>

              <section className="mb-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-1">
                    <MaisLidosSection articles={mostRead} />
                  </div>
                  <div className="md:col-span-1">
                    <MaisRecentesSection articles={latest} />
                  </div>
                  <div className="md:col-span-1">
                    <ColunistasSection articles={colunistas} />
                  </div>
                </div>
              </section>

              <div className="mb-8 max-w-4xl mx-auto">
                <AdCard position="infeed_wide" variant="ecommerce" />
              </div>
            </>
          )}

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-center text-white max-w-4xl mx-auto mb-8">
            <h3 className="text-2xl font-bold mb-2">Quer escrever para o Chama Frete?</h3>
            <p className="text-white/80 mb-4">
              Compartilhe seu conhecimento com a comunidade de transporte e logística.
            </p>
            <Link
              to="/artigos/ser-autor"
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors"
            >
              Tornar-se Autor
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryArticlesPage;
