import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/api';
import { Loader2, Flag, Check, X, AlertTriangle, Eye, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import PageShell, { StatsGrid, StatCard, TimeFilter } from '@/components/admin';

// Interfaces para melhor tipagem
interface Report {
  id: number;
  status: ReportStatus;
  target_type: TargetType;
  reason: string;
  description?: string;
  reporter_name: string;
  reporter_role: string;
  target_user_name?: string;
  target_user_role?: string;
  created_at: string;
  assigned_name?: string;
  resolution_notes?: string;
}

type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';
type TargetType = 'user' | 'review' | 'freight' | 'listing' | 'message';

const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: 'Pendente',
  reviewing: 'Em Análise',
  resolved: 'Resolvida',
  dismissed: 'Descartada'
};

const REASON_LABELS: Record<string, string> = {
  spam: 'Spam',
  harassment: 'Assédio',
  fake: 'Perfil/Avaliação Falsa',
  fraud: 'Fraude/Golpe',
  inappropriate: 'Conteúdo Inadequado',
  other: 'Outro'
};

const TARGET_LABELS: Record<TargetType, string> = {
  user: 'Perfil',
  review: 'Avaliação',
  freight: 'Frete',
  listing: 'Anúncio',
  message: 'Mensagem'
};

const STATUS_COLORS: Record<ReportStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  reviewing: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  dismissed: 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400'
};

export default function ReportsManager() {
  const [activeTab, setActiveTab] = useState<ReportStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [timeFilter, setTimeFilter] = useState<'today' | '7days' | '30days' | 'thisMonth' | 'custom' | 'all'>('all');

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { 
        limit: 50,
        period: timeFilter !== 'all' ? timeFilter : undefined 
      };
      if (activeTab !== 'all') params.status = activeTab;
      
      const res = await api.get('admin/reports', { params });
      if (res.data?.success) {
        setReports(res.data.data || []);
        setCounts(res.data.counts || {});
      }
    } catch (err) {
      console.error('Erro ao carregar denúncias:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, timeFilter]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleTimeFilterChange = (value: any) => {
    setTimeFilter(value);
  };

  const handleAction = async (reportId: number, endpoint: string, method: 'post' | 'delete' = 'post', data?: any) => {
    setProcessingId(reportId);
    try {
      const res = await api[method](`admin/reports/${reportId}/${endpoint}`, data);
      if (res.data?.success) {
        loadReports();
        return true;
      }
    } catch (err: any) {
      Swal.fire('Erro', err.response?.data?.message || 'Erro ao processar ação.', 'error');
    } finally {
      setProcessingId(null);
    }
    return false;
  };

  const handleAssign = async (id: number) => {
    if (await handleAction(id, 'assign')) {
      Swal.fire('Atribuído!', 'Denúncia atribuída a você.', 'success');
    }
  };

  const handleResolve = async (id: number) => {
    const { value: notes } = await Swal.fire({
      title: 'Resolver Denúncia',
      input: 'textarea',
      inputPlaceholder: 'Descreva a resolução...',
      showCancelButton: true,
      confirmButtonText: 'Resolver',
    });

    if (notes !== undefined) {
      if (await handleAction(id, 'resolve', 'post', { notes })) {
        Swal.fire('Resolvida!', 'Denúncia marcada como resolvida.', 'success');
      }
    }
  };

  const handleDismiss = async (id: number) => {
    const { value: notes } = await Swal.fire({
      title: 'Descartar Denúncia',
      input: 'textarea',
      inputPlaceholder: 'Motivo do descarte...',
      showCancelButton: true,
      confirmButtonText: 'Descartar',
    });

    if (notes !== undefined) {
      if (await handleAction(id, 'dismiss', 'post', { notes })) {
        Swal.fire('Descartada!', 'Denúncia descartada.', 'success');
      }
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Excluir Denúncia?',
      text: 'Esta ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sim, excluir',
    });

    if (result.isConfirmed) {
      if (await handleAction(id, 'delete', 'post')) {
        Swal.fire('Excluída!', 'Denúncia excluída.', 'success');
      }
    }
  };

  const tabs = [
    { key: 'all', label: 'Todas', count: counts.total || 0 },
    { key: 'pending', label: 'Pendentes', count: counts.pending || 0 },
    { key: 'reviewing', label: 'Em Análise', count: counts.reviewing || 0 },
    { key: 'resolved', label: 'Resolvidas', count: counts.resolved || 0 },
    { key: 'dismissed', label: 'Descartadas', count: counts.dismissed || 0 },
  ];

  return (
    <PageShell
      title="Denúncias"
      description="Gerencie denúncias de usuários sobre conteúdos inadequados"
    >
      <StatsGrid>
        <StatCard label="Total" value={counts.total || 0} icon={Flag} />
        <StatCard label="Pendentes" value={counts.pending || 0} variant="yellow" icon={AlertTriangle} />
        <StatCard label="Em Análise" value={counts.reviewing || 0} variant="blue" icon={Eye} />
        <StatCard label="Resolvidas" value={counts.resolved || 0} variant="green" icon={Check} />
      </StatsGrid>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                activeTab === tab.key
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        <TimeFilter value={timeFilter} onChange={handleTimeFilterChange} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-slate-400" />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-12 text-center">
          <Flag size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-bold">Nenhuma denúncia encontrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <div
              key={report.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden ${
                expandedId === report.id ? 'ring-2 ring-red-500/20' : ''
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl ${STATUS_COLORS[report.status]}`}>
                      <Flag size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white">#{report.id}</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[report.status]}`}>
                          {STATUS_LABELS[report.status]}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {TARGET_LABELS[report.target_type] || report.target_type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                        <strong>{REASON_LABELS[report.reason] || report.reason}</strong>
                        {report.description && <span> - {report.description}</span>}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    <Eye size={18} />
                  </button>
                </div>

                {expandedId === report.id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400 text-xs font-bold uppercase">Denunciante</span>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">
                          {report.reporter_name} ({report.reporter_role})
                        </p>
                      </div>
                      {report.target_user_name && (
                        <div>
                          <span className="text-slate-400 text-xs font-bold uppercase">Denunciado</span>
                          <p className="text-slate-700 dark:text-slate-300 font-medium">
                            {report.target_user_name} ({report.target_user_role})
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-slate-400 text-xs font-bold uppercase">Data</span>
                        <p className="text-slate-700 dark:text-slate-300">
                          {new Date(report.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs font-bold uppercase">Atribuído a</span>
                        <p className="text-slate-700 dark:text-slate-300">
                          {report.assigned_name || 'Ninguém'}
                        </p>
                      </div>
                    </div>

                    {report.resolution_notes && (
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                        <span className="text-slate-400 text-xs font-bold uppercase">Notas de Resolução</span>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{report.resolution_notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 flex-wrap">
                      {report.status === 'pending' && (
                        <button
                          onClick={() => handleAssign(report.id)}
                          disabled={processingId === report.id}
                          className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 disabled:opacity-50"
                        >
                          {processingId === report.id ? <Loader2 size={12} className="animate-spin" /> : <Eye size={12} />}
                          Assumir
                        </button>
                      )}
                      {(report.status === 'pending' || report.status === 'reviewing') && (
                        <>
                          <button
                            onClick={() => handleResolve(report.id)}
                            disabled={processingId === report.id}
                            className="flex items-center gap-1 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 disabled:opacity-50"
                          >
                            <Check size={12} /> Resolver
                          </button>
                          <button
                            onClick={() => handleDismiss(report.id)}
                            disabled={processingId === report.id}
                            className="flex items-center gap-1 px-4 py-2 bg-slate-500 text-white rounded-xl text-xs font-bold hover:bg-slate-600 disabled:opacity-50"
                          >
                            <X size={12} /> Descartar
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(report.id)}
                        disabled={processingId === report.id}
                        className="flex items-center gap-1 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-100 disabled:opacity-50"
                      >
                        <Trash2 size={12} /> Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}