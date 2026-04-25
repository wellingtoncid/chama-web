import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/api';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AdCard from '@/components/shared/AdCard';
import { ArrowRight, Clock, Eye, User, BookOpen, Send } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_id: number;
  author_name: string;
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
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
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
        const allArticles = articlesRes.data.data.articles || [];
        const featured = allArticles.find((a: Article) => a.featured);
        const others = allArticles.filter((a: Article) => a.id !== featured?.id);
        
        setFeaturedArticle(featured || null);
        setArticles(others);
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

  const filteredArticles = activeCategory === 'all' 
    ? articles 
    : articles.filter(a => a.category_slug === activeCategory);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617]">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#1f4ead] to-blue-600 text-white pt-36 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-black text-center mb-4">
            Artigos & Conteúdo
          </h1>
          <p className="text-center text-white/80 max-w-2xl mx-auto">
            Dicas, notícias e insights sobre o mercado de transporte e logística
          </p>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === 'all'
                  ? 'bg-[#1f4ead] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Featured Article */}
        {featuredArticle && (
          <div className="mb-12">
            <h2 className="text-lg font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
              Destaque
            </h2>
            <Link 
              to={`/artigos/${featuredArticle.slug}`}
              className="block group"
            >
              <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
                <div className="md:flex">
                  <div className="md:w-1/2 h-64 md:h-80 bg-slate-200 dark:bg-slate-800">
                    {/* Placeholder for featured image */}
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl">📰</span>
                    </div>
                  </div>
                  <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <span 
                        className="px-2 py-1 rounded text-xs font-bold text-white"
                        style={{ backgroundColor: '#1f4ead' }}
                      >
                        {featuredArticle.category_name}
                      </span>
                      {featuredArticle.is_paid && (
                        <span className="px-2 py-1 rounded text-xs font-bold bg-purple-600 text-white">
                          Patrocinado
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-[#1f4ead] transition-colors">
                      {featuredArticle.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        {featuredArticle.author_avatar ? (
                          <img src={featuredArticle.author_avatar} alt={featuredArticle.author_name} className="w-6 h-6 rounded-full" />
                        ) : (
                          <User size={16} />
                        )}
                        <span>{featuredArticle.author_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{formatDate(featuredArticle.published_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span>{featuredArticle.views_count} visualizações</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Publicidade - Antes da lista */}
        <div className="mb-8 max-w-4xl mx-auto">
          <AdCard position="infeed_wide" variant="ecommerce" />
        </div>

        {/* Articles Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Últimos Artigos
          </h2>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-4 animate-pulse">
                  <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-lg mb-4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map(article => (
                <Link 
                  key={article.id} 
                  to={`/artigos/${article.slug}`}
                  className="group"
                >
                  <article className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all h-full flex flex-col">
                    <div className="h-40 bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                      <span className="text-4xl">📄</span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <span 
                          className="px-2 py-0.5 rounded text-xs font-bold text-white"
                          style={{ backgroundColor: article.category_id ? '#1f4ead' : '#64748b' }}
                        >
                          {article.category_name || 'Artigo'}
                        </span>
                        {article.is_paid && (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-600 text-white">
                            Patrocinado
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[#1f4ead] transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 flex-1">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <User size={12} />
                          <span>{article.author_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{formatDate(article.published_at)}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">
                Nenhum artigo encontrado nesta categoria.
              </p>
            </div>
          )}
        </div>

        {/* Publicidade - Depois da lista */}
        <div className="mb-8 max-w-4xl mx-auto">
          <AdCard position="infeed_wide" variant="ecommerce" />
        </div>

        {/* CTA paraSubmitter */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-center text-white max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold mb-2">Quer escrever para o Chama Frete?</h3>
          <p className="text-white/80 mb-4">
            Compartilhe seu conhecimento com a comunidade de transporte e logística.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/artigos/ser-autor"
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors"
            >
              <BookOpen size={20} />
              Tornar-se Autor
            </Link>
            <Link 
              to="/artigos/submeter"
              className="inline-flex items-center gap-2 bg-orange-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-800 transition-colors"
            >
              <Send size={20} />
              Enviar Artigo
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ArticlesPage;