import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { Loader2, Star, Check, X, User, Calendar, DollarSign, MessageSquare, RefreshCcw } from 'lucide-react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

type InterestStatus = 'pending' | 'approved' | 'rejected';

const STATUS_LABELS: Record<InterestStatus, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado'
};

const STATUS_COLORS: Record<InterestStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
};

interface Stats {
  interests: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    avg_willing_to_pay: number;
  };
  users_with_access: number;
}

export default function AffiliateManager() {
  const [activeTab, setActiveTab] = useState<InterestStatus | 'all'>('pending');
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState<any[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadStats();
    loadInterests();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const res = await api.get('admin/affiliate/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  };

  const loadInterests = async () => {
    setLoading(true);
    try {
      const params: any = { limit: 50 };
      if (activeTab !== 'all') params.status = activeTab;
      
      const res = await api.get('admin/affiliate/interests', { params });
      if (res.data?.success) {
        setInterests(res.data.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar interesses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    const result = await Swal.fire({
      title: 'Aprovar Acesso?',
      text: 'Este usuário terá acesso ao recurso de afiliados.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Aprovar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10B981',
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
      color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
    });

    if (!result.isConfirmed) return;

    setProcessingId(id);
    try {
      const res = await api.post(`admin/affiliate/interests/${id}/approve`);
      if (res.data?.success) {
        Swal.fire({
          title: 'Aprovado!',
          text: 'Acesso ao recurso de afiliados liberado.',
          icon: 'success',
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
        });
        loadInterests();
        loadStats();
      }
    } catch (err: any) {
      Swal.fire('Erro', err.response?.data?.message || 'Erro ao aprovar.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    const { value: notes } = await Swal.fire({
      title: 'Rejeitar Solicitação',
      text: 'Informe o motivo da rejeição (opcional):',
      input: 'textarea',
      inputPlaceholder: 'Ex: Não se enquadra nos critérios...',
      showCancelButton: true,
      confirmButtonText: 'Rejeitar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
      color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
    });

    setProcessingId(id);
    try {
      const res = await api.post(`admin/affiliate/interests/${id}/reject`, {
        admin_notes: notes || 'Rejeitado'
      });
      if (res.data?.success) {
        Swal.fire('Rejeitado', 'Solicitação rejeitada.', 'info');
        loadInterests();
        loadStats();
      }
    } catch (err: any) {
      Swal.fire('Erro', err.response?.data?.message || 'Erro ao rejeitar.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRevoke = async (id: number) => {
    const result = await Swal.fire({
      title: 'Revogar Acesso?',
      text: 'Este usuário perderá o acesso ao recurso de afiliados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Revogar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#EF4444',
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
      color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
    });

    if (!result.isConfirmed) return;

    setProcessingId(id);
    try {
      const res = await api.post(`admin/affiliate/interests/${id}/revoke`);
      if (res.data?.success) {
        Swal.fire({
          title: 'Revogado!',
          text: 'Acesso ao recurso de afiliados foi revogado.',
          icon: 'success',
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
        });
        loadInterests();
        loadStats();
      }
    } catch (err: any) {
      Swal.fire('Erro', err.response?.data?.message || 'Erro ao revogar.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    if (!value) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 rounded-2xl">
            <Star size={24} className="text-white fill-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">
              Interesses de Afiliados
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Gerencie solicitações de acesso ao recurso
            </p>
          </div>
        </div>
        <button
          onClick={loadInterests}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
        >
          <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-xl">
                <Star size={20} className="text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Total</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.interests.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl">
                <Calendar size={20} className="text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Pendentes</p>
                <p className="text-2xl font-black text-amber-600">{stats.interests.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl">
                <Check size={20} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Aprovados</p>
                <p className="text-2xl font-black text-emerald-600">{stats.interests.approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-xl">
                <User size={20} className="text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Com Acesso</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.users_with_access}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab
                ? 'bg-amber-500 text-white'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {STATUS_LABELS[tab as InterestStatus] || 'Todos'}
            {tab === 'pending' && stats?.interests.pending ? ` (${stats.interests.pending})` : ''}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-amber-500" size={32} />
        </div>
      ) : interests.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
          <Star size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 font-bold">
            Nenhuma solicitação encontrada
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {interests.map((interest) => (
            <div
              key={interest.id}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                onClick={() => setExpandedId(expandedId === interest.id ? null : interest.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
                      {interest.user_avatar ? (
                        <img src={interest.user_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} className="text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 dark:text-white">{interest.user_name || 'Usuário'}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${STATUS_COLORS[interest.status as InterestStatus]}`}>
                          {STATUS_LABELS[interest.status as InterestStatus]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {interest.user_email} • {interest.user_role}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Disposto a pagar</p>
                      <p className="font-black text-emerald-600">
                        {formatCurrency(interest.willing_to_pay)}
                      </p>
                    </div>
                    
                    {interest.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleApprove(interest.id); }}
                          disabled={processingId === interest.id}
                          className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors disabled:opacity-50"
                          title="Aprovar"
                        >
                          {processingId === interest.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Check size={16} />
                          )}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleReject(interest.id); }}
                          disabled={processingId === interest.id}
                          className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                          title="Rejeitar"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    
                    {interest.status === 'approved' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRevoke(interest.id); }}
                        disabled={processingId === interest.id}
                        className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors disabled:opacity-50"
                        title="Revogar acesso"
                      >
                        <RefreshCcw size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {expandedId === interest.id && (
                <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase mb-1">Uso pretendido</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {interest.intended_use || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase mb-1">Data da solicitação</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {formatDate(interest.created_at)}
                      </p>
                    </div>
                    {interest.admin_notes && (
                      <div className="md:col-span-2">
                        <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase mb-1">Notas do admin</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{interest.admin_notes}</p>
                      </div>
                    )}
                    {interest.approved_at && (
                      <div className="md:col-span-2">
                        <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase mb-1">Aprovado em</p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">{formatDate(interest.approved_at)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
