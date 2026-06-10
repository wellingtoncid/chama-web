import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/api';
import { 
  FileText, Eye, X, AlertCircle, ChevronLeft, ChevronRight,
  Loader2, CheckCircle, XCircle, Trash2, Star, Search, Pencil,
  DollarSign, Bot, Flag
} from 'lucide-react';
import { 
  PageShell, StatsGrid, StatCard,
} from '@/components/admin';
import { getImageUrl } from '@/lib/utils';

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url?: string;
  author_id: number;
  author_name: string;
  author_email: string;
  category_id: number;
  category_name: string;
  status: 'pending' | 'published' | 'rejected' | 'draft';
  featured: boolean;
  featured_at: string | null;
  is_paid: boolean;
  paid_plan: string;
  paid_until: string;
  is_ai_generated: boolean | number;
  rejection_reason: string;
  rejection_count: number;
  plagiarism_strikes?: number;
  views_count: number;
  clicks_count: number;
  created_at: string;
  published_at: string;
}

export default function ArticlesAdminPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'published' | 'rejected' | 'draft' | 'paid'>('all');
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectType, setRejectType] = useState<'other' | 'plagiarism' | 'ai_generic'>('other');
  const [showViewModal, setShowViewModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, published: 0, rejected: 0, paid_pending: 0 });
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

      const params: Record<string, string> = {};
      if (filter !== 'all') {
        if (filter === 'paid') {
          params.is_paid = '1';
        } else {
          params.status = filter;
        }
      }

      const res = await api.get('/articles/admin/all', { params });
      
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
        reason: rejectReason.trim(),
        rejection_type: rejectType
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

  const handleToggleAi = async (id: number, current: boolean | number) => {
    try {
      setActionLoading(true);
      const res = await api.put(`/articles/${id}`, {
        is_ai_generated: !current
      });
      if (res.data?.success) {
        fetchArticles();
      } else {
        alert(res.data?.message || 'Erro ao atualizar');
      }
    } catch {
      alert('Erro ao atualizar flag IA');
    } finally {
      setActionLoading(false);
    }
  };

  const rejectionPresets: { type: 'plagiarism' | 'ai_generic' | 'other'; label: string; reason: string }[] = [
    { type: 'plagiarism', label: 'Plágio detectado', reason: 'Artigo contém conteúdo plagiado de terceiros' },
    { type: 'ai_generic', label: 'Conteúdo IA genérico', reason: 'Artigo parece ser genérico, superficial ou sem valor real, possivelmente gerado por IA sem curadoria adequada' },
    { type: 'other', label: 'Outro motivo', reason: '' },
  ];

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
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
          <StatCard label="Pendentes" value={stats.pending} variant="yellow" icon={AlertCircle} />
          <StatCard label="Publicados" value={stats.published} variant="green" icon={CheckCircle} />
          <StatCard label="Publieditorial" value={stats.paid_pending} variant="purple" icon={DollarSign} />
          <StatCard label="Rejeitados" value={stats.rejected} variant="red" icon={XCircle} />
        </StatsGrid>
      </div>

      <div className="flex flex-wrap gap-3 items-center mb-4 mt-6">
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as 'all' | 'pending' | 'published' | 'rejected' | 'draft' | 'paid')}
          className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os Status</option>
          <option value="pending">Pendentes</option>
          <option value="published">Publicados</option>
          <option value="paid">Publieditorial</option>
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
                <th className="px-5 py-4 w-14"></th>
                <th className="px-5 py-4">Artigo</th>
                <th className="px-5 py-4">Autor</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Views</th>
                <th className="px-5 py-4">Criado</th>
                <th className="px-5 py-4">Publicado</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={8} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={32} /></td></tr>
              ) : paginatedArticles.length === 0 ? (
                <tr><td colSpan={8} className="py-20 text-center"><FileText size={40} className="mx-auto text-slate-200 dark:text-slate-600 mb-4" /><p className="text-slate-400 font-bold text-sm uppercase">Nenhum artigo encontrado</p></td></tr>
              ) : paginatedArticles.map((row) => (
                <tr key={row.id} className={`hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${row.is_paid ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''}`}>
                  <td className="px-5 py-4 w-14">
                    <div className="flex items-center gap-2">
                      {!!row.is_paid && <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" title="Publieditorial" />}
                      {row.image_url ? (
                        <img src={getImageUrl(row.image_url)} alt="" className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <FileText size={14} className="text-slate-400" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-slate-800 dark:text-white text-sm uppercase line-clamp-1">{row.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {!!row.is_paid && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                              <DollarSign size={10} /> Publieditorial {row.paid_plan === 'premium' ? 'Premium' : 'Standard'}
                            </span>
                          )}
                          {!!row.featured && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                              <Star size={10} className="fill-current" /> Destaque{row.featured_at ? ` ${new Date(row.featured_at).toLocaleDateString('pt-BR')}` : ''}
                            </span>
                          )}
                          {!!row.is_ai_generated && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                              <Bot size={10} /> IA
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{row.author_name}</p>
                      {row.plagiarism_strikes !== undefined && row.plagiarism_strikes > 0 && (
                        <span className={`text-[10px] font-bold mt-0.5 inline-flex items-center gap-0.5 ${
                          row.plagiarism_strikes >= 3 ? 'text-red-500' : 'text-amber-500'
                        }`}>
                          <Flag size={10} /> {row.plagiarism_strikes}/3 strikes
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${statusColors[row.status]}`}>
                        {statusLabels[row.status]}
                      </span>
                      {row.status === 'rejected' && row.rejection_count > 0 && (
                        <span className="text-[10px] font-bold text-red-400" title={`Rejeitado ${row.rejection_count}x`}>
                          ({row.rejection_count}x)
                        </span>
                      )}
                    </div>
                    {row.status === 'rejected' && row.rejection_reason && (
                      <p className="text-[10px] text-red-400 mt-0.5 line-clamp-1 max-w-[160px]" title={row.rejection_reason}>
                        {row.rejection_reason}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{row.views_count}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold text-slate-400">{formatDate(row.created_at)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-bold text-slate-400">{formatDate(row.published_at)}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setSelectedArticle(row); setShowViewModal(true); }}
                        className="py-2 px-4 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold uppercase hover:bg-slate-100 dark:hover:bg-slate-600"
                        title="Visualizar"
                      >
                        <Eye size={14} />
                      </button>
                      <Link
                        to={`/artigos/submeter?edit=${row.id}`}
                        className="py-2 px-4 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-lg text-xs font-bold uppercase hover:bg-sky-100 dark:hover:bg-sky-900/50"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => handleToggleAi(row.id, row.is_ai_generated)}
                        disabled={actionLoading}
                        title={row.is_ai_generated ? 'Remover marcação IA' : 'Marcar como gerado por IA'}
                        className={`py-2 px-4 rounded-lg text-xs font-bold uppercase disabled:opacity-50 ${
                          row.is_ai_generated ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50' : 'bg-slate-50 dark:bg-slate-700 text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                      >
                        <Bot size={14} className={row.is_ai_generated ? '' : ''} />
                      </button>
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
                          title={row.featured ? 'Remover destaque' : 'Destacar artigo'}
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

      {showViewModal && selectedArticle && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-start justify-center p-4 pt-12 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="sticky top-0 bg-white dark:bg-slate-800 z-10 flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white line-clamp-1">{selectedArticle.title}</h3>
              <button onClick={() => { setShowViewModal(false); setSelectedArticle(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl shrink-0">
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {selectedArticle.image_url && (
                <img src={getImageUrl(selectedArticle.image_url)} alt={selectedArticle.title} className="w-full h-56 object-cover rounded-xl" />
              )}

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {selectedArticle.category_name && (
                  <span className="px-2 py-1 rounded-lg bg-[#1f4ead]/10 text-[#1f4ead] font-bold">{selectedArticle.category_name}</span>
                )}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold ${statusColors[selectedArticle.status]}`}>
                  {statusLabels[selectedArticle.status]}
                </span>
                {!!selectedArticle.featured && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-bold">
                    <Star size={12} className="fill-current" /> Destaque
                  </span>
                )}
                {!!selectedArticle.is_ai_generated && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold">
                    <Bot size={12} /> IA
                  </span>
                )}
                {!!selectedArticle.is_paid && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                      <DollarSign size={18} />
                      <span className="font-bold text-sm">Publieditorial</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs text-purple-600 dark:text-purple-400">
                      <div>
                        <span className="font-bold">Plano:</span> {selectedArticle.paid_plan === 'premium' ? 'Premium - R$ 497' : 'Standard - R$ 297'}
                      </div>
                      {selectedArticle.paid_until && (
                        <div>
                          <span className="font-bold">Válido até:</span> {formatDate(selectedArticle.paid_until)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-700">
                <span className="font-bold">{selectedArticle.author_name}</span>
                <span>•</span>
                <span>Criado {formatDate(selectedArticle.created_at)}</span>
                {selectedArticle.published_at && (
                  <>
                    <span>•</span>
                    <span>Publicado {formatDate(selectedArticle.published_at)}</span>
                  </>
                )}
                <span>•</span>
                <span>{selectedArticle.views_count} visualizações</span>
              </div>

              {selectedArticle.excerpt && (
                <p className="text-sm text-slate-600 dark:text-slate-300 italic">{selectedArticle.excerpt}</p>
              )}

              {selectedArticle.rejection_reason && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">Motivo da rejeição ({selectedArticle.rejection_count}x):</p>
                  <p className="text-xs text-red-600 dark:text-red-300">{selectedArticle.rejection_reason}</p>
                </div>
              )}

              <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-a:text-[#1f4ead] prose-img:rounded-lg max-h-80 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 flex justify-end gap-3">
              {selectedArticle.status === 'pending' && (
                <>
                  <button
                    onClick={() => { setShowViewModal(false); setSelectedArticle(selectedArticle); setShowRejectModal(true); }}
                    disabled={actionLoading}
                    className="py-2.5 px-5 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-bold uppercase hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    <XCircle size={16} />
                    Rejeitar
                  </button>
                  <button
                    onClick={() => { handleApprove(selectedArticle.id); setShowViewModal(false); }}
                    disabled={actionLoading}
                    className="py-2.5 px-5 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <><CheckCircle size={16} /> Aprovar</>}
                  </button>
                </>
              )}
              {selectedArticle.status === 'published' && (
                <>
                  <button
                    onClick={() => { handleToggleAi(selectedArticle.id, selectedArticle.is_ai_generated); setShowViewModal(false); }}
                    disabled={actionLoading}
                    className={`py-2.5 px-5 rounded-xl text-xs font-bold uppercase disabled:opacity-50 flex items-center gap-2 ${
                      selectedArticle.is_ai_generated ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <Bot size={16} />
                    {selectedArticle.is_ai_generated ? 'Remover IA' : 'Marcar IA'}
                  </button>
                  <button
                    onClick={() => { handleToggleFeatured(selectedArticle.id, selectedArticle.featured); setShowViewModal(false); }}
                    disabled={actionLoading}
                    className={`py-2.5 px-5 rounded-xl text-xs font-bold uppercase disabled:opacity-50 flex items-center gap-2 ${
                      selectedArticle.featured ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <Star size={16} className={selectedArticle.featured ? 'fill-current' : ''} />
                    {selectedArticle.featured ? 'Remover Destaque' : 'Destacar'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showRejectModal && selectedArticle && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Rejeitar Artigo</h3>
              <button onClick={() => { setShowRejectModal(false); setSelectedArticle(null); setRejectReason(''); setRejectType('other'); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4">
              Você está prestes a rejeitar o artigo <span className="text-slate-800 dark:text-white">"{selectedArticle.title}"</span>.
            </p>
            <div className="mb-4">
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-2 block">Motivo da Rejeição *</label>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {rejectionPresets.map(p => (
                  <button
                    key={p.type}
                    type="button"
                    onClick={() => {
                      setRejectType(p.type);
                      setRejectReason(p.reason);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-colors ${
                      rejectType === p.type
                        ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'
                        : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
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
                onClick={() => { setShowRejectModal(false); setSelectedArticle(null); setRejectReason(''); setRejectType('other'); }}
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
