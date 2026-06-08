import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/api';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AdCard from '@/components/shared/AdCard';
import { getImageUrl, timeAgo } from '@/lib/utils';
import { Clock, User, BookOpen, Send, TrendingUp, Eye, ArrowRight } from 'lucide-react';
import { Breadcrumb } from '@/components/shared/Breadcrumb';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
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

const ArticlesPage = () => {
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [articlesRes, categoriesRes] = await Promise.all([
        api.get('/articles'),
        api.get('/article-categories')
      ]);
      if (articlesRes.data?.success) {
        setAllArticles(articlesRes.data.data.articles || []);
      }
      if (categoriesRes.data?.success) {
        setCategories(categoriesRes.data.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = activeCategory === 'all'
    ? allArticles
    : allArticles.filter(a => a.category_slug === activeCategory);

  const capaDoDia = filtered[0] || null;
  const heroSecondary = filtered.slice(1, 3);
  const heroCompact = filtered.slice(3, 8);
  const gridArticles = filtered.slice(8);
  const paidArticles = allArticles.filter(a => a.is_paid);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const ArticleCategoryBadge = ({ name, slug: catSlug }: { name: string; slug: string }) => (
    <Link
      to={`/artigos?categoria=${catSlug}`}
      onClick={e => { e.preventDefault(); setActiveCategory(catSlug); }}
      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider hover:underline"
    >
      {name}
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col font-sans transition-colors duration-300">
      <Header />

      <main className="flex-grow pt-32">
        <div className="max-w-7xl mx-auto px-4">

          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Artigos' },
          ]} linkClassName="hover:text-[#1f4ead]" className="mb-6" />

          <header className="mb-10">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-[0.85] mb-4">
              Artigos & <span className="text-[#1f4ead]">Conteúdo</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
              Dicas, notícias e insights sobre o mercado de transporte e logística
            </p>
          </header>

          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  activeCategory === 'all'
                    ? 'bg-[#1f4ead] text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Todos
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    activeCategory === cat.slug
                      ? 'bg-[#1f4ead] text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8 max-w-4xl mx-auto">
            <AdCard position="infeed_wide" variant="ecommerce" />
          </div>

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
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">
                Nenhum artigo encontrado nesta categoria.
              </p>
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

              {gridArticles.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                    Mais Artigos
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {gridArticles.map(article => (
                      <Link key={article.id} to={`/artigos/${article.slug}`} className="group">
                        <article className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all h-full flex flex-col">
                          <div className="h-36 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            {article.image_url ? (
                              <img src={getImageUrl(article.image_url)} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-3xl">📄</span>
                              </div>
                            )}
                          </div>
                          <div className="p-3 flex-1 flex flex-col">
                            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white bg-[#1f4ead]">
                                {article.category_name || 'Artigo'}
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 group-hover:text-[#1f4ead] transition-colors line-clamp-2 leading-snug">
                              {article.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2 flex-1 leading-relaxed">
                              {article.excerpt}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <div className="flex items-center gap-1">
                                <User size={10} />
                                <span>{article.author_name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={10} />
                                <span>{formatDate(article.published_at)}</span>
                              </div>
                            </div>
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-8 max-w-4xl mx-auto">
                <AdCard position="infeed_wide" variant="ecommerce" />
              </div>
            </>
          )}

          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <TrendingUp size={16} className="text-orange-500" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Publieditorial
                </h3>
                <span className="text-[10px] font-bold text-orange-500 ml-auto">Conteúdo Patrocinado</span>
              </div>
              <div className="p-6">
                {paidArticles.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {paidArticles.map(article => (
                      <Link key={article.id} to={`/artigos/${article.slug}`} className="group flex gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="w-20 h-20 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          {article.image_url ? (
                            <img src={getImageUrl(article.image_url)} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Eye size={20} className="text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">
                            {article.category_name}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug mt-0.5">
                            {article.title}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                            {article.excerpt}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <h4 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Sua marca aqui!
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                      O publieditorial é a melhor forma de divulgar seu negócio para milhares de transportadores e empresas.
                    </p>
                    <Link
                      to="/publicidade"
                      className="inline-flex items-center gap-2 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors"
                    >
                      Saiba mais <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-center text-white max-w-4xl mx-auto mb-8">
            <h3 className="text-2xl font-bold mb-2">Quer escrever para o Chama Frete?</h3>
            <p className="text-white/80 mb-4">
              Compartilhe seu conhecimento com a comunidade de transporte e logística.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/artigos/ser-autor" className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors">
                <BookOpen size={20} />
                Tornar-se Autor
              </Link>
              <Link to="/artigos/submeter" className="inline-flex items-center gap-2 bg-orange-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-800 transition-colors">
                <Send size={20} />
                Enviar Artigo
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ArticlesPage;
