import React, { useEffect, useState } from 'react';
import { api } from '@/api/api';
import { Shield, Clock, User, Search, RefreshCw, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

interface AuditLog {
  id: number;
  user_id: number;
  user_name: string;
  action_type: string;
  description: string;
  action_url: string;
  ip_address: string;
  user_agent: string;
  target_id: number | null;
  target_type: string | null;
  old_values: string | null;
  new_values: string | null;
  created_at: string;
}

interface Pagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

interface Stats {
  today: number;
  this_week: number;
  this_month: number;
  total: number;
}

interface FilterOption {
  value: string;
  label: string;
}

export default function AuditLogsView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, per_page: 50, total: 0, total_pages: 0 });
  const [stats, setStats] = useState<Stats>({ today: 0, this_week: 0, this_month: 0, total: 0 });
  const [targetTypes, setTargetTypes] = useState<FilterOption[]>([]);
  const [actionTypes, setActionTypes] = useState<FilterOption[]>([]);
  
  const [filters, setFilters] = useState({
    search: '',
    target_type: '',
    action_type: '',
    date_from: '',
    date_to: ''
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        per_page: String(pagination.per_page)
      };
      
      if (filters.search) params.search = filters.search;
      if (filters.target_type) params.target_type = filters.target_type;
      if (filters.action_type) params.action_type = filters.action_type;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;
      
      console.log('AuditLogView: Fetching logs with params:', params);
      const response = await api.get('admin-audit-logs', { params });
      console.log('AuditLogView: Response:', response.data);
      
      if (response.data?.success) {
        setLogs(response.data.data || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
        if (response.data.stats) {
          setStats(response.data.stats);
        }
        if (response.data.filters) {
          setTargetTypes(response.data.filters.target_types || []);
          setActionTypes(response.data.filters.action_types || []);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  useEffect(() => {
    fetchLogs(1);
  }, [filters.target_type, filters.action_type, filters.date_from, filters.date_to]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const handlePageChange = (newPage: number) => {
    fetchLogs(newPage);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      target_type: '',
      action_type: '',
      date_from: '',
      date_to: ''
    });
  };

  const getActionColor = (action: string) => {
    const actionLower = (action || '').toLowerCase();
    if (actionLower.includes('create') || actionLower.includes('insert')) {
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    }
    if (actionLower.includes('update') || actionLower.includes('edit')) {
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
    if (actionLower.includes('delete') || actionLower.includes('remove')) {
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    }
    return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
  };

  const getTargetIcon = (target: string) => {
    const iconClass = "w-8 h-8 rounded-full flex items-center justify-center";
    const targetLower = (target || '').toLowerCase();
    
    if (targetLower.includes('user')) {
      return <div className={`${iconClass} bg-blue-100 text-blue-600`}><User size={14} /></div>;
    }
    if (targetLower.includes('freight') || targetLower.includes('carga')) {
      return <div className={`${iconClass} bg-orange-100 text-orange-600`}><Shield size={14} /></div>;
    }
    if (targetLower.includes('transaction') || targetLower.includes('pagamento')) {
      return <div className={`${iconClass} bg-emerald-100 text-emerald-600`}><Shield size={14} /></div>;
    }
    return <div className={`${iconClass} bg-slate-100 text-slate-500`}><Shield size={14} /></div>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase italic text-slate-900 leading-none">
              Auditoria do Sistema
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Histórico completo de ações administrativas
            </p>
          </div>
        </div>
        <button 
          onClick={() => fetchLogs(pagination.page)}
          className="p-3 bg-white border border-slate-200 text-slate-400 rounded-2xl hover:text-blue-600 hover:border-blue-200 transition-all"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase">Hoje</p>
          <p className="text-2xl font-black text-slate-900">{stats.today}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-blue-200">
          <p className="text-xs font-bold text-blue-500 uppercase">Esta Semana</p>
          <p className="text-2xl font-black text-blue-600">{stats.this_week}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase">Este Mês</p>
          <p className="text-2xl font-black text-slate-900">{stats.this_month}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase">Total</p>
          <p className="text-2xl font-black text-slate-900">{stats.total}</p>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por usuário, descrição..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Calendar size={18} />
            Filtros
            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
          >
            Buscar
          </button>
        </form>

        {showFilters && (
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100">
            <select
              className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium"
              value={filters.target_type}
              onChange={(e) => setFilters({ ...filters, target_type: e.target.value })}
            >
              <option value="">Todas as Entidades</option>
              {targetTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label || t.value}</option>
              ))}
            </select>
            
            <select
              className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium"
              value={filters.action_type}
              onChange={(e) => setFilters({ ...filters, action_type: e.target.value })}
            >
              <option value="">Todas as Ações</option>
              {actionTypes.map((a) => (
                <option key={a.value} value={a.value}>{a.label || a.value}</option>
              ))}
            </select>
            
            <input
              type="date"
              className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              placeholder="Data Início"
            />
            
            <input
              type="date"
              className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              placeholder="Data Fim"
            />
            
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-red-500 text-sm font-medium hover:underline"
            >
              Limpar
            </button>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-4 text-[10px] font-black uppercase text-slate-400">Usuário</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase text-slate-400">Ação</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase text-slate-400">Entidade</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Data/Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center">
                    <RefreshCw className="animate-spin text-blue-500 mx-auto" size={32} />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400 font-medium">
                    Nenhum registro encontrado
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr 
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {getTargetIcon(log.target_type || undefined)}
                          <div>
                            <p className="font-bold text-sm text-slate-900">{log.user_name || 'Sistema'}</p>
                            <p className="text-xs text-slate-400">ID: {log.user_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${getActionColor(log.action_type)}`}>
                          {log.action_type || 'N/A'}
                        </span>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{log.description}</p>
                      </td>
                      <td className="px-5 py-4">
                        {log.target_type ? (
                          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                            {log.target_type} #{log.target_id}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 text-slate-500 text-xs">
                          <Clock size={12} />
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </div>
                      </td>
                    </tr>
                    {expandedLog === log.id && (
                      <tr className="bg-slate-50">
                        <td colSpan={4} className="px-5 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div>
                              <p className="font-bold text-slate-400 uppercase">IP</p>
                              <p className="text-slate-600 font-medium">{log.ip_address || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="font-bold text-slate-400 uppercase">URL</p>
                              <p className="text-slate-600 font-medium truncate">{log.action_url || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="font-bold text-slate-400 uppercase">User Agent</p>
                              <p className="text-slate-600 font-medium truncate">{log.user_agent || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="font-bold text-slate-400 uppercase">Dados Antigos</p>
                              <p className="text-slate-600 font-medium text-[10px] truncate">
                                {log.old_values ? JSON.parse(log.old_values) : 'Nenhum'}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Mostrando {(pagination.page - 1) * pagination.per_page + 1} - {Math.min(pagination.page * pagination.per_page, pagination.total)} de {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 text-xs font-bold bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-xs font-bold text-slate-600">
                {pagination.page} / {pagination.total_pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.total_pages}
                className="px-3 py-1 text-xs font-bold bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
