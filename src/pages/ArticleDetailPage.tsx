import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '@/api/api';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AdCard from '@/components/shared/AdCard';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { UserHeadline } from '@/components/shared/UserHeadline';
import { Clock, Eye, User, ArrowLeft, Share2, Calendar, PenLine, Puzzle, Trophy } from 'lucide-react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { getImageUrl, nl2br } from '@/lib/utils';

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
  author_bio: string;
  author_slug?: string;
  category_id: number;
  category_name: string;
  category_slug: string;
  featured: boolean;
  is_paid: boolean;
  paid_plan: string;
  paid_banner_image: string;
  paid_banner_url: string;
  views_count: number;
  clicks_count: number;
  published_at: string;
  created_at: string;
}

interface SidebarArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category_name: string;
  category_slug?: string;
  author_name?: string;
  author_headline?: string;
  author_avatar?: string;
  published_at: string;
  views_count?: number;
  image_url?: string;
  content?: string;
}

const ArticleDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<SidebarArticle[]>([]);
  const [popular, setPopular] = useState<SidebarArticle[]>([]);
  const [authorArticles, setAuthorArticles] = useState<SidebarArticle[]>([]);
  const [bottomTab, setBottomTab] = useState<'related' | 'popular' | 'author'>('related');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchArticle(slug);
    }
  }, [slug]);

  const fetchArticle = async (articleSlug: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/articles/${articleSlug}`);

      if (res.data?.success) {
        setArticle(res.data.data.article);
        setRelated(res.data.data.related || []);
        setPopular(res.data.data.popular || []);
        setAuthorArticles(res.data.data.author_articles || []);
      } else {
        setError(res.data?.message || 'Artigo não encontrado');
      }
    } catch (err) {
      setError('Erro ao carregar artigo');
    } finally {
      setLoading(false);
    }
  };

  const readingTime = (text: string) => {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} min`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const timeAgo = (dateStr: string) => {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `Há ${days} dias`;
    if (days < 30) return `Há ${Math.floor(days / 7)} semanas`;
    return `Há ${Math.floor(days / 30)} meses`;
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          url
        });
      } catch (err) {
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copiado para a área de transferência!');
    }
  };

  const articleTitle = article?.title;
  const articleDesc = article?.excerpt || `Leia o artigo: ${article?.title}`;

  usePageMeta(article ? {
    title: articleTitle,
    description: articleDesc,
    image: article.image_url || undefined,
    url: window.location.href,
    type: 'article',
  } : {});

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617]">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-4"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-lg mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617]">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Artigo não encontrado
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error || 'O artigo que você procura não existe ou foi removido.'}
          </p>
          <Link
            to="/artigos"
            className="inline-flex items-center gap-2 text-[#1f4ead] hover:underline"
          >
            <ArrowLeft size={20} />
            Voltar para artigos
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617]">
      <Header />

      {/* Paid Banner */}
      {!!article.is_paid && article.paid_banner_image && (
        <div className="bg-slate-100 dark:bg-slate-900 py-4">
          <div className="container mx-auto px-4 max-w-7xl">
            <a
              href={article.paid_banner_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src={article.paid_banner_image}
                alt="Patrocínio"
                className="max-h-20 w-auto mx-auto rounded-lg"
              />
            </a>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto pt-36 lg:pt-40 pb-20 px-4">
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Artigos', href: '/artigos' },
          { label: article.title },
        ]} linkClassName="hover:text-[#1f4ead]" className="mb-6" />

        <article>
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {article.category_name && (
                <Link
                  to={`/artigos?categoria=${article.category_slug}`}
                  className="px-3 py-1 rounded text-sm font-bold text-white bg-[#1f4ead] hover:bg-[#1a3d8a] transition-colors"
                >
                  {article.category_name}
                </Link>
              )}
              {!!article.is_paid && (
                <span className="px-3 py-1 rounded text-sm font-bold bg-purple-600 text-white">
                  {article.paid_plan === 'premium' ? 'Patrocínio Premium' : 'Patrocínio'}
                </span>
              )}
              {!!article.featured && (
                <span className="px-3 py-1 rounded text-sm font-bold bg-amber-500 text-white">
                  Destaque
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-6">
                {article.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div className="flex items-center gap-2">
                {article.author_avatar ? (
                  <img
                    src={article.author_avatar}
                    alt={article.author_name}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                    <User size={20} className="text-slate-500" />
                  </div>
                )}
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{article.author_name}</span>
                  <UserHeadline headline={article.author_headline} />
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{formatDate(article.published_at)}</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{readingTime(article.content)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={16} />
                <span>{article.views_count} visualizações</span>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-1 text-[#1f4ead] hover:underline ml-auto"
              >
                <Share2 size={16} />
                Compartilhar
              </button>
            </div>
          </header>

          {article.image_url && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={getImageUrl(article.image_url)}
                alt={article.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          )}

          <div className="mb-8">
            <AdCard position="infeed_wide" variant="ecommerce" />
          </div>

          <div
            className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-black prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-5
              prose-a:text-[#1f4ead] prose-a:no-underline hover:prose-a:underline prose-a:font-semibold
              prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8 prose-img:w-full
              prose-blockquote:border-l-4 prose-blockquote:border-[#1f4ead] prose-blockquote:pl-5 prose-blockquote:py-2 prose-blockquote:my-6 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-800/50 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400
              prose-strong:text-slate-900 dark:prose-strong:text-white prose-strong:font-bold
              prose-ul:list-disc prose-ul:pl-6 prose-ul:my-5 prose-ul:space-y-1.5
              prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-5 prose-ol:space-y-1.5
              prose-li:text-slate-700 dark:prose-li:text-slate-300
              prose-hr:my-10 prose-hr:border-slate-200 dark:prose-hr:border-slate-700
              prose-table:w-full prose-table:border-collapse prose-table:my-8
              prose-th:bg-slate-50 dark:prose-th:bg-slate-800/50 prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:text-xs prose-th:font-bold prose-th:text-slate-600 dark:prose-th:text-slate-400 prose-th:uppercase
              prose-td:px-4 prose-td:py-3 prose-td:text-sm prose-td:border-b prose-td:border-slate-200 dark:prose-td:border-slate-700
              prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:text-rose-600 dark:prose-code:text-rose-400 prose-code:font-mono
              prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:rounded-xl prose-pre:p-5 prose-pre:my-6 prose-pre:overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: nl2br(article.content) }}
          />

          {/* ── Tabs: Relacionados | Top 3 | Do Autor ── */}
          {(related.length > 0 || popular.length > 0 || authorArticles.length > 0) && (
            <section className="mt-14 pt-10 border-t border-slate-200 dark:border-slate-800">
              {/* Tab Nav */}
              <div className="flex gap-6 mb-8">
                <button
                  onClick={() => setBottomTab('related')}
                  className={`flex items-center gap-1.5 text-sm font-bold pb-2 border-b-2 transition-colors ${
                    bottomTab === 'related'
                      ? 'text-[#1f4ead] border-[#1f4ead]'
                      : 'text-slate-400 border-transparent hover:text-slate-600'
                  }`}
                >
                  <Puzzle size={16} />
                  Conteúdos relacionados
                </button>
                <button
                  onClick={() => setBottomTab('popular')}
                  className={`flex items-center gap-1.5 text-sm font-bold pb-2 border-b-2 transition-colors ${
                    bottomTab === 'popular'
                      ? 'text-[#1f4ead] border-[#1f4ead]'
                      : 'text-slate-400 border-transparent hover:text-slate-600'
                  }`}
                >
                  <Trophy size={16} />
                  Top 3 de hoje
                </button>
                <button
                  onClick={() => setBottomTab('author')}
                  className={`flex items-center gap-1.5 text-sm font-bold pb-2 border-b-2 transition-colors ${
                    bottomTab === 'author'
                      ? 'text-[#1f4ead] border-[#1f4ead]'
                      : 'text-slate-400 border-transparent hover:text-slate-600'
                  }`}
                >
                  <User size={16} />
                  Conteúdos do autor
                </button>
              </div>

              {/* Tab Content */}
              {bottomTab === 'related' && related.length === 0 && (
                <p className="text-sm text-slate-400">Nenhum conteúdo relacionado</p>
              )}
              {bottomTab === 'popular' && popular.length === 0 && (
                <p className="text-sm text-slate-400">Nenhum conteúdo popular</p>
              )}
              {bottomTab === 'author' && authorArticles.length === 0 && (
                <p className="text-sm text-slate-400">Nenhum outro conteúdo deste autor</p>
              )}

              <div className="space-y-6">
                {(bottomTab === 'related' ? related : bottomTab === 'popular' ? popular : authorArticles).map(item => (
                  <Link
                    key={item.id}
                    to={`/artigos/${item.slug}`}
                    className="block group"
                  >
                    <div className="flex gap-4">
                      <div className="flex-1 min-w-0">
                        <span className="inline-block text-xs font-bold text-[#1f4ead] bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded mb-2">
                          {item.category_name}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#1f4ead] transition-colors leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                          {item.excerpt}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span>{timeAgo(item.published_at)}</span>
                          <Clock size={12} />
                          <span>{readingTime(item.content)}</span>
                        </div>
                      </div>
                      {item.image_url && (
                        <div className="hidden sm:block flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden">
                          <img src={getImageUrl(item.image_url)} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="mt-12 mb-12">
            <AdCard position="infeed_wide" variant="ecommerce" />
          </div>

          <div className="mb-12">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-center text-white">
              <div className="flex items-center justify-center gap-2 mb-2">
                <PenLine size={24} />
                <h3 className="text-2xl font-bold">Quer escrever para o Chama Frete?</h3>
              </div>
              <p className="text-white/80 mb-4">
                Sua experiência move o setor. Compartilhe seu conhecimento com a comunidade!
              </p>
              <Link
                to="/artigos/submeter"
                className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors"
              >
                Enviar Artigo
              </Link>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default ArticleDetailPage;
