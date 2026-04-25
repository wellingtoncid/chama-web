import { useState, useEffect } from 'react';
import { api } from '@/api/api';
import { 
  FileText, Eye, Check, X, AlertCircle,
  Loader2, CheckCircle, XCircle, Trash2, Star
} from 'lucide-react';
import { 
  AdminLayout, StatsGrid, StatCard, FilterBar, DataTable, StatusBadge, 
  type TableColumn 
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

  useEffect(() => {
    fetchArticles();
  }, [filter]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/articles/admin/all';
      if (filter !== 'all') {
        url = `/articles/admin/${filter}`;
      }
      
      const res = await api.get(url);
      
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
    if (!confirm('Tem certeza que deseja excluir este artigo?')) {
      return;
    }

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

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.author_name.toLowerCase().includes(search.toLowerCase()) ||
    (a.excerpt && a.excerpt.toLowerCase().includes(search.toLowerCase()))
  );

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const columns: TableColumn<Article>[] = [
    {
      key: 'title',
      label: 'Artigo',
      render: (_, row) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white line-clamp-1">{row.title}</p>
          {row.is_paid && (
            <span className="text-xs text-purple-600 font-medium">Patrocinado ({row.paid_plan})</span>
          )}
        </div>
      )
    },
    {
      key: 'author',
      label: 'Autor',
      render: (_, row) => (
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">{row.author_name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{row.author_email}</p>
        </div>
      )
    },
    { key: 'category_name', label: 'Categoria' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value as 'pending' | 'published' | 'rejected' | 'draft'} />
    },
    {
      key: 'views',
      label: 'Visualizações',
      render: (_, row) => <span className="text-sm text-slate-500">{row.views_count}</span>
    },
    {
      key: 'created_at',
      label: 'Data',
      render: (_, row) => <span className="text-sm text-slate-500">{formatDate(row.created_at)}</span>
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <a
            href={`/artigos/${row.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-500 hover:text-blue-600 transition-colors"
            title="Visualizar"
          >
            <Eye size={16} />
          </a>
          
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(row.id)}
                disabled={actionLoading}
                className="p-1.5 text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
                title="Aprovar"
              >
                <CheckCircle size={16} />
              </button>
              <button
                onClick={() => {
                  setSelectedArticle(row);
                  setShowRejectModal(true);
                }}
                disabled={actionLoading}
                className="p-1.5 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                title="Rejeitar"
              >
                <XCircle size={16} />
              </button>
            </>
          )}

          {row.status === 'published' && (
            <button
              onClick={() => handleToggleFeatured(row.id, row.featured)}
              disabled={actionLoading}
              className={`p-1.5 transition-colors disabled:opacity-50 ${
                row.featured ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'
              }`}
              title={row.featured ? 'Remover destaque' : 'Destacar'}
            >
              <Star size={16} className={row.featured ? 'fill-amber-500' : ''} />
            </button>
          )}

          <button
            onClick={() => handleDelete(row.id)}
            disabled={actionLoading}
            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
];

  return (
    <AdminLayout
      title="Artigos"
      description="Gerencie artigos submetidos por autores"
      icon={FileText}
    >
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <StatsGrid>
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Pendentes" value={stats.pending} variant="yellow" />
        <StatCard label="Publicados" value={stats.published} variant="green" />
        <StatCard label="Rejeitados" value={stats.rejected} variant="red" />
      </StatsGrid>

      <FilterBar
        search={{
          placeholder: 'Buscar por título, autor...',
          value: search,
          onChange: setSearch
        }}
        tabs={[
          { key: 'all', label: 'Todos' },
          { key: 'pending', label: 'Pendente' },
          { key: 'published', label: 'Publicado' },
          { key: 'rejected', label: 'Rejeitado' },
          { key: 'draft', label: 'Rascunho' },
        ]}
        activeTab={filter}
        onTabChange={setFilter}
      />

      <DataTable
        columns={columns}
        data={filteredArticles}
        loading={loading}
        emptyMessage="Nenhum artigo encontrado"
      />

      {showRejectModal && selectedArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Rejeitar Artigo
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
              Você está prestes a rejeitar o artigo <strong>"{selectedArticle.title}"</strong>.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Motivo da rejeição *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explique o motivo da rejeição..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedArticle(null);
                  setRejectReason('');
                }}
                className="flex-1 px-4 py-2 rounded-lg font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="flex-1 px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={20} /> : 'Rejeitar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}