import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import { 
  FileText, Plus, Pencil, Trash2, 
  Loader2, Eye, AlertCircle, CheckCircle, XCircle,
  Clock, Send
} from 'lucide-react';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category_id: number;
  category_name: string;
  status: 'pending' | 'published' | 'rejected' | 'draft';
  featured: boolean;
  is_paid: boolean;
  paid_plan: string;
  rejection_reason: string;
  rejection_count: number;
  views_count: number;
  created_at: string;
  published_at: string;
}

export default function MyArticlesPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'published' | 'rejected' | 'draft'>('all');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [authorStatus, setAuthorStatus] = useState<{is_author: boolean; has_pending_request: boolean} | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/dashboard/meus-artigos');
    } else if (user) {
      checkAuthorStatus();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (authorStatus?.is_author) {
      fetchArticles();
    }
  }, [filter, authorStatus?.is_author, fetchArticles]);

  const checkAuthorStatus = async () => {
    try {
      const res = await api.get('/article-author-status');
      if (res.data?.success) {
        const status = res.data.data;
        setAuthorStatus(status);
        
        if (status.is_author) {
          fetchArticles();
        }
      }
    } catch (err) {
      console.error('Error checking author status:', err);
    } finally {
      setCheckingAuth(false);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/articles/me';
      if (filter !== 'all') {
        url += `?status=${filter}`;
      }
      
      const res = await api.get(url);
      
      if (res.data?.success) {
        setArticles(res.data.data.articles || []);
      } else {
        setError(res.data?.message || 'Erro ao carregar artigos');
      }
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'response' in e) {
        const err = e as { response?: { data?: { message?: string } } };
        setError(err.response?.data?.message || 'Erro ao carregar artigos');
      } else {
        setError('Erro ao carregar artigos');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) {
      return;
    }

    try {
      setDeleteLoading(id);
      const res = await api.delete(`/articles/${id}`);
      
      if (res.data?.success) {
        alert('Artigo excluído');
        fetchArticles();
      } else {
        alert(res.data?.message || 'Erro ao excluir artigo');
      }
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'response' in e) {
        const err = e as { response?: { data?: { message?: string } } };
        alert(err.response?.data?.message || 'Erro ao excluir artigo');
      } else {
        alert('Erro ao excluir artigo');
      }
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      published: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      draft: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    };
    const labels = {
      pending: 'Pendente',
      published: 'Publicado',
      rejected: 'Rejeitado',
      draft: 'Rascunho',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (authLoading || checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#1f4ead]" size={32} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Se não é autor aprovado, mostra mensagem de bloqueio
  if (!authorStatus?.is_author) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-4">
              Acesso Restrito
            </h2>
            <p className="text-yellow-700 dark:text-yellow-400 mb-4">
              Você precisa ser um autor aprovado para acessar esta página.
            </p>
            {authorStatus?.has_pending_request ? (
              <p className="text-yellow-600 dark:text-yellow-400">
                Sua solicitação está pendente. Aguarde a aprovação da equipe.
              </p>
            ) : (
              <Link 
                to="/artigos/ser-autor" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1f4ead] text-white rounded-xl font-bold hover:bg-[#1a3d8a]"
              >
                Solicitar Acesso de Autor
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <FileText className="text-[#1f4ead]" size={28} />
            Meus Artigos
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Gerencie seus artigos submetidos
          </p>
        </div>
        <Link
          to="/artigos/submeter"
          className="flex items-center gap-2 px-4 py-2 bg-[#1f4ead] text-white rounded-xl font-bold hover:bg-[#1a3d8a] transition-colors"
        >
          <Plus size={20} />
          Novo Artigo
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 mb-6 border border-slate-200 dark:border-slate-800">
        <div className="flex gap-2 overflow-x-auto">
          {(['all', 'pending', 'published', 'rejected', 'draft'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-[#1f4ead] text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendente' : f === 'published' ? 'Publicado' : f === 'rejected' ? 'Rejeitado' : 'Rascunho'}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-[#1f4ead]" size={32} />
        </div>
      )}

      {/* Articles List */}
      {!loading && (
        <div className="space-y-4">
          {filteredArticles.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-800">
              <FileText className="mx-auto text-slate-400 mb-4" size={48} />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Nenhum artigo encontrado
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Você ainda não submeteu nenhum artigo.
              </p>
              <Link
                to="/artigos/submeter"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1f4ead] text-white rounded-xl font-bold hover:bg-[#1a3d8a] transition-colors"
              >
                <Plus size={20} />
                Submitter Primeiro Artigo
              </Link>
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div 
                key={article.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 hover:border-[#1f4ead]/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(article.status)}
                      {article.is_paid && (
                        <span className="text-xs text-purple-600 font-bold">
                          Patrocinado ({article.paid_plan})
                        </span>
                      )}
                      {article.featured && article.status === 'published' && (
                        <span className="text-xs text-amber-600 font-bold">
                          ★ Destaque
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">
                      {article.title}
                    </h3>
                    
                    {article.excerpt && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                        {article.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(article.created_at)}
                      </span>
                      {article.category_name && (
                        <span>{article.category_name}</span>
                      )}
                      {article.status === 'published' && (
                        <span>{article.views_count} visualizações</span>
                      )}
                    </div>

                    {/* Rejection reason */}
                    {article.status === 'rejected' && article.rejection_reason && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">
                          Motivo da rejeição:
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-300">
                          {article.rejection_reason}
                        </p>
                        {article.rejection_count < 3 && (
                          <p className="text-xs text-slate-500 mt-2">
                            Você pode reenviar até {3 - article.rejection_count} vezes.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {article.status === 'published' && (
                      <a
                        href={`/artigos/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-500 hover:text-[#1f4ead] transition-colors"
                        title="Visualizar"
                      >
                        <Eye size={18} />
                      </a>
                    )}
                    
                    {article.status === 'draft' && (
                      <Link
                        to={`/artigos/submeter?edit=${article.id}`}
                        className="p-2 text-slate-500 hover:text-[#1f4ead] transition-colors"
                        title="Editar"
                      >
                        <Pencil size={18} />
                      </Link>
                    )}

                    {article.status === 'rejected' && article.rejection_count < 3 && (
                      <Link
                        to={`/artigos/submeter?edit=${article.id}`}
                        className="p-2 text-slate-500 hover:text-[#1f4ead] transition-colors"
                        title="Reenviar"
                      >
                        <Send size={18} />
                      </Link>
                    )}

                    <button
                      onClick={() => handleDeleteArticle(article.id)}
                      disabled={deleteLoading === article.id}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Excluir"
                    >
                      {deleteLoading === article.id ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}