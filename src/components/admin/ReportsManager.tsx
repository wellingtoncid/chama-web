import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { Loader2, Flag, User, MessageSquare, Check, X, Eye, Trash2, AlertTriangle } from 'lucide-react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

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
  const [reports, setReports] = useState<any[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadReports();
  }, [activeTab]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
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
  };

  const handleAssign = async (reportId: number) => {
    setProcessingId(reportId);
    try {
      const res = await api.post(`admin/reports/${reportId}/assign`);
      if (res.data?.success) {
        Swal.fire('Atribuído!', 'Denúncia atribuída a você.', 'success');
        loadReports();
      }
    } catch (err: any) {
      Swal.fire('Erro', err.response?.data?.message || 'Erro ao atribuir.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleResolve = async (reportId: number) => {
    const { value: notes } = await Swal.fire({
      title: 'Resolver Denúncia',
      text: 'Adicione uma nota sobre a resolução:',
      input: 'textarea',
      inputPlaceholder: 'Descreva como a denúncia foi resolvida...',
      showCancelButton: true,
      confirmButtonText: 'Resolver',
      cancelButtonText: 'Cancelar'
    });

    if (notes !== undefined) {
      setProcessingId(reportId);
      try {
        const res = await api.post(`admin/reports/${reportId}/resolve`, { notes });
        if (res.data?.success) {
          Swal.fire('Resolvida!', 'Denúncia marcada como resolvida.', 'success');
          loadReports();
        }
      } catch (err: any) {
        Swal.fire('Erro', err.response?.data?.message || 'Erro ao resolver.', 'error');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleDismiss = async (reportId: number) => {
    const { value: notes } = await Swal.fire({
      title: 'Descartar Denúncia',
      text: 'Informe o motivo:',
      input: 'textarea',
      inputPlaceholder: 'Motivo do descarte...',
      showCancelButton: true,
      confirmButtonText: 'Descartar',
      cancelButtonText: 'Cancelar'
    });

    if (notes !== undefined) {
      setProcessingId(reportId);
      try {
        const res = await api.post(`admin/reports/${reportId}/dismiss`, { notes });
        if (res.data?.success) {
          Swal.fire('Descartada!', 'Denúncia descartada.', 'success');
          loadReports();
        }
      } catch (err: any) {
        Swal.fire('Erro', err.response?.data?.message || 'Erro ao descartar.', 'error');
      } finally {
        setProcessingId(null);
      }
    }
  };

  const handleDelete = async (reportId: number) => {
    const result = await Swal.fire({
      title: 'Excluir Denúncia?',
      text: 'Esta ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setProcessingId(reportId);
      try {
        const res = await api.post(`admin/reports/${reportId}/delete`);
        if (res.data?.success) {
          Swal.fire('Excluída!', 'Denúncia excluída.', 'success');
          loadReports();
        }
      } catch (err: any) {
        Swal.fire('Erro', err.response?.data?.message || 'Erro ao excluir.', 'error');
      } finally {
        setProcessingId(null);
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">
          <Flag size={28} className="inline mr-2 text-red-500" />
          Gestão de Denúncias
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gerencie denúncias de usuários sobre conteúdos inadequados
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Loading */}
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
              {/* Header */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl ${STATUS_COLORS[report.status as ReportStatus]}`}>
                      <Flag size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 dark:text-white">
                          #{report.id}
                        </span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[report.status as ReportStatus]}`}>
                          {STATUS_LABELS[report.status as ReportStatus]}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {TARGET_LABELS[report.target_type as TargetType] || report.target_type}
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

                {/* Expanded Content */}
                {expandedId === report.id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
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

                    {/* Actions */}
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
                            {processingId === report.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            Resolver
                          </button>
                          <button
                            onClick={() => handleDismiss(report.id)}
                            disabled={processingId === report.id}
                            className="flex items-center gap-1 px-4 py-2 bg-slate-500 text-white rounded-xl text-xs font-bold hover:bg-slate-600 disabled:opacity-50"
                          >
                            {processingId === report.id ? <Loader2 size={12} className="animate-spin" /> : <X size={12} />}
                            Descartar
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(report.id)}
                        disabled={processingId === report.id}
                        className="flex items-center gap-1 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-500/20 disabled:opacity-50"
                      >
                        {processingId === report.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        Excluir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
