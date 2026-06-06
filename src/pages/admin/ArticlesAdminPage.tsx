import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/api';
import { 
  FileText, Eye, Check, X, AlertCircle, ChevronLeft, ChevronRight,
  Loader2, CheckCircle, XCircle, Trash2, Star, Search, Pencil
} from 'lucide-react';
import { 
  PageShell, StatsGrid, StatCard,
} from '@/components/admin';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  author_id: number;
  author_name: string;
  author_email: string;
  category_id: number;
  category_name: string;
  status: 'pending' | 'published' | 'rejected' | 'draft';
  featured: boolean;
  is_paid: boolean;
  paid_plan: string;
  rejection_reason: string;
  rejection_count: number;
  views_count: number;
  clicks_count: number;
  created_at: string;
  published_at: string;
}

export default function ArticlesAdminPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'published' | 'rejected' | 'draft'>('all');
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, published: 0, rejected: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchArticles();
  }, [filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search, pageSize]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.get('/articles/admin/all');
      
      if (res.data?.success) {
        setArticles(res.data.data.articles || []);
        if (res.data.data.stats) {
          setStats(res.data.data.stats);
        }
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

  const handleApprove = async (id: number) => {
    try {
      setActionLoading(true);
      const res = await api.put(`/articles/${id}/approve`);
      
      if (res.data?.success) {
        alert('Artigo aprovado com sucesso!');
        fetchArticles();
      } else {
        alert(res.data?.message || 'Erro ao aprovar artigo');
      }
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'response' in e) {
        const err = e as { response?: { data?: { message?: string } } };
        alert(err.response?.data?.message || 'Erro ao aprovar artigo');
      } else {
        alert('Erro ao aprovar artigo');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedArticle || !rejectReason.trim()) {
      alert('Motivo da rejeição é obrigatório');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.put(`/articles/${selectedArticle.id}/reject`, {
        reason: rejectReason.trim()
      });
      
      if (res.data?.success) {
        alert('Artigo rejeitado');
        setShowRejectModal(false);
        setSelectedArticle(null);
        setRejectReason('');
        fetchArticles();
      } else {
        alert(res.data?.message || 'Erro ao rejeitar artigo');
      }
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'response' in e) {
        const err = e as { response?: { data?: { message?: string } } };
        alert(err.response?.data?.message || 'Erro ao rejeitar artigo');
      } else {
        alert('Erro ao rejeitar artigo');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este artigo?')) return;

    try {
      setActionLoading(true);
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
      setActionLoading(false);
    }
  };

  const handleToggleFeatured = async (id: number, currentFeatured: boolean) => {
    try {
      setActionLoading(true);
      const res = await api.put(`/articles/${id}`, {
        featured: !currentFeatured
      });
      
      if (res.data?.success) {
        fetchArticles();
      } else {
        alert(res.data?.message || 'Erro ao atualizar artigo');
      }
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'response' in e) {
        const err = e as { response?: { data?: { message?: string } } };
        alert(err.response?.data?.message || 'Erro ao atualizar artigo');
      } else {
        alert('Erro ao atualizar artigo');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const filteredArticles = useMemo(() => {
    return articles.filter(a =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.author_name.toLowerCase().includes(search.toLowerCase()) ||
      (a.excerpt && a.excerpt.toLowerCase().includes(search.toLowerCase()))
    );
  }, [articles, search]);

  const totalPages = Math.ceil(filteredArticles.length / pageSize);
  const paginatedArticles = useMemo(() => {
    return filteredArticles.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredArticles, currentPage, pageSize]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    published: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    rejected: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    draft: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    published: 'Publicado',
    rejected: 'Rejeitado',
    draft: 'Rascunho',
  };

  if (error) {
    return (
      <PageShell title="Artigos" description="Gerencie artigos submetidos por autores">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mt-6 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-600 dark:text-red-400 font-bold text-sm">{error}</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Artigos"
      description="Gerencie artigos submetidos por autores"
    >
      <div className="mt-6">
        <StatsGrid>
          <StatCard label="Total" value={stats.total} icon={FileText} />
          <StatCard label="Pendentes" value={stats.pending} variant="yellow" icon={AlertCircle} />
          <StatCard label="Publicados" value={stats.published} variant="green" icon={CheckCircle} />
          <StatCard label="Rejeitados" value={stats.rejected} variant="red" icon={XCircle} />
        </StatsGrid>
      </div>

      <div className="flex flex-wrap gap-3 mt-4 items-center">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as 'all' | 'pending' | 'published' | 'rejected' | 'draft')}
          className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os Status</option>
          <option value="pending">Pendentes</option>
          <option value="published">Publicados</option>
          <option value="rejected">Rejeitados</option>
          <option value="draft">Rascunhos</option>
        </select>

        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título ou autor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mt-4">
        <div className="p-4 lg:p-5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3">
          <h3 className="font-bold text-slate-900 dark:text-white">
            Artigos ({filteredArticles.length})
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Mostrar</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-xs text-slate-500 dark:text-slate-400">por página</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="px-5 py-4">Artigo</th>
                <th className="px-5 py-4">Autor</th>
                <th className="px-5 py-4">Categoria</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Views</th>
                <th className="px-5 py-4">Data</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={7} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={32} /></td></tr>
              ) : paginatedArticles.length === 0 ? (
                <tr><td colSpan={7} className="py-20 text-center"><FileText size={40} className="mx-auto text-slate-200 dark:text-slate-600 mb-4" /><p className="text-slate-400 font-bold text-sm uppercase">Nenhum artigo encontrado</p></td></tr>
              ) : paginatedArticles.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-black text-slate-800 dark:text-white text-sm uppercase italic line-clamp-1">{row.title}</p>
                      {!!row.is_paid && (
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">Patrocinado ({row.paid_plan})</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{row.author_name}</p>
                    <p className="text-[10px] font-bold text-slate-400">{row.author_email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{row.category_name}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusColors[row.status]}`}>
                      {statusLabels[row.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{row.views_count}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold text-slate-400">{formatDate(row.created_at)}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <a
                        href={`/artigos/${row.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-4 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase hover:bg-slate-100 dark:hover:bg-slate-600"
                        title="Visualizar"
                      >
                        <Eye size={14} />
                      </a>
                      <Link
                        to={`/artigos/submeter?edit=${row.id}`}
                        className="py-2 px-4 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-lg text-xs font-bold uppercase hover:bg-sky-100 dark:hover:bg-sky-900/50"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </Link>
                      {row.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(row.id)}
                            disabled={actionLoading}
                            className="py-2 px-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold uppercase hover:bg-emerald-100 dark:hover:bg-emerald-900/50 disabled:opacity-50"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            onClick={() => { setSelectedArticle(row); setShowRejectModal(true); }}
                            disabled={actionLoading}
                            className="py-2 px-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold uppercase hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      {row.status === 'published' && (
                        <button
                          onClick={() => handleToggleFeatured(row.id, row.featured)}
                          disabled={actionLoading}
                          className={`py-2 px-4 rounded-lg text-xs font-bold uppercase disabled:opacity-50 ${
                            row.featured ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50' : 'bg-slate-50 dark:bg-slate-700 text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400'
                          }`}
                        >
                          <Star size={14} className={row.featured ? 'fill-current' : ''} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(row.id)}
                        disabled={actionLoading}
                        className="py-2 px-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold uppercase hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredArticles.length)} de {filteredArticles.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showRejectModal && selectedArticle && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Rejeitar Artigo</h3>
              <button onClick={() => { setShowRejectModal(false); setSelectedArticle(null); setRejectReason(''); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4">
              Você está prestes a rejeitar o artigo <span className="text-slate-800 dark:text-white">"{selectedArticle.title}"</span>.
            </p>
            <div className="mb-4">
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-2 block">Motivo da Rejeição *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explique o motivo da rejeição..."
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowRejectModal(false); setSelectedArticle(null); setRejectReason(''); }}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white text-xs font-bold uppercase hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={16} /> : 'Rejeitar'}
              </button>
            </div>
          </div>
        </div>
       )}
    </PageShell>
   );
}
