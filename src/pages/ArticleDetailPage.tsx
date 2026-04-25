import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '@/api/api';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AdCard from '@/components/shared/AdCard';
import { Clock, Eye, User, ArrowLeft, Share2, Calendar } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_id: number;
  author_name: string;
  author_avatar: string;
  author_bio: string;
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

interface RelatedArticle {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category_name: string;
  published_at: string;
}

const ArticleDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<RelatedArticle[]>([]);
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
      } else {
        setError(res.data?.message || 'Artigo não encontrado');
      }
    } catch (err) {
      setError('Erro ao carregar artigo');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
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
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copiado para a área de transferência!');
    }
  };

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
      {article.is_paid && article.paid_banner_image && (
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

      {/* Main Content */}
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Link */}
        <Link 
          to="/artigos" 
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-[#1f4ead] mb-6"
        >
          <ArrowLeft size={20} />
          Voltar para artigos
        </Link>

        {/* Article Header */}
        <header className="max-w-4xl mx-auto mb-8">
          {/* Category & Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {article.category_name && (
              <Link
                to={`/artigos?categoria=${article.category_slug}`}
                className="px-3 py-1 rounded text-sm font-bold text-white bg-[#1f4ead] hover:bg-[#1a3d8a] transition-colors"
              >
                {article.category_name}
              </Link>
            )}
            {article.is_paid && (
              <span className="px-3 py-1 rounded text-sm font-bold bg-purple-600 text-white">
                {article.paid_plan === 'premium' ? 'Patrocínio Premium' : 'Patrocínio'}
              </span>
            )}
            {article.featured && (
              <span className="px-3 py-1 rounded text-sm font-bold bg-amber-500 text-white">
                Destaque
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-6">
              {article.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-6">
            {/* Author */}
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
                {article.author_bio && (
                  <p className="text-xs text-slate-500">{article.author_bio}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{formatDate(article.published_at)}</span>
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

        {/* Publicidade - Início */}
        <div className="max-w-4xl mx-auto mb-8">
          <AdCard position="infeed_wide" variant="ecommerce" />
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto">
          <div 
            className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-black prose-headings:text-slate-900 dark:prose-headings:text-white
              prose-p:text-slate-700 dark:prose-p:text-slate-300
              prose-a:text-[#1f4ead] prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-lg prose-img:shadow-lg"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Publicidade - Fim */}
        <div className="max-w-4xl mx-auto mt-8 mb-12">
          <AdCard position="infeed_wide" variant="ecommerce" />
        </div>

        {/* CTA para Submitter */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-2">Quer escrever para o Chama Frete?</h3>
            <p className="text-white/80 mb-4">
              Compartilhe seu conhecimento com a comunidade de transporte e logística.
            </p>
            <Link 
              to="/artigos/submeter"
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors"
            >
              Submitter Artigo
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <div className="max-w-4xl mx-auto border-t border-slate-200 dark:border-slate-800 pt-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Artigos Relacionados
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map(item => (
                <Link 
                  key={item.id}
                  to={`/artigos/${item.slug}`}
                  className="block group"
                >
                  <article className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
                    <div className="p-4">
                      <span className="text-xs font-bold text-[#1f4ead]">
                        {item.category_name}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white mt-2 group-hover:text-[#1f4ead] transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                        {item.excerpt}
                      </p>
                      <div className="flex items-center gap-1 mt-3 text-xs text-slate-400">
                        <Clock size={12} />
                        <span>{formatDate(item.published_at)}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <Footer />
    </div>
  );
};

export default ArticleDetailPage;