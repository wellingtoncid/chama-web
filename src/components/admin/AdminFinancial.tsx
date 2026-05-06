import { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/api';
import { TrendingUp, Wallet, ArrowDownCircle, Download, CreditCard, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { PageShell, StatsGrid, StatCard } from '@/components/admin';

const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num || 0);
};

const formatNumber = (value: number | string) => {
  return new Intl.NumberFormat('pt-BR').format(typeof value === 'string' ? parseInt(value) : value);
};

export default function AdminFinancial() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        const res = await api.get('/admin-financial-stats');
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchFinance();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, dateFilter, searchTerm, customDateStart, customDateEnd, pageSize]);

  const getDateRange = () => {
    if (dateFilter === 'all') return { startDate: null, endDate: null };
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    let startDate = null;
    let endDate = null;
    
    switch (dateFilter) {
      case 'today':
        startDate = today;
        endDate = now;
        break;
      case 'week':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        break;
      case 'month':
        startDate = startOfMonth;
        endDate = now;
        break;
      case 'lastmonth':
        startDate = startOfLastMonth;
        endDate = endOfLastMonth;
        break;
      case 'custom':
        if (customDateStart) startDate = new Date(customDateStart);
        if (customDateEnd) endDate = new Date(customDateEnd + 'T23:59:59');
        break;
    }
    
    return { startDate, endDate };
  };

  const hasDateFilter = dateFilter !== 'all';

  const filteredTransactions = useMemo(() => {
    if (!stats?.latest_transactions) return [];
    
    const { startDate, endDate } = getDateRange();
    
    return stats.latest_transactions.filter((t: any) => {
      if (startDate || endDate) {
        const txDate = new Date(t.created_at);
        if (startDate && txDate < startDate) return false;
        if (endDate && txDate > endDate) return false;
      }
      
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending' && ['approved', 'completed'].includes(t.status)) return false;
        if (statusFilter === 'approved' && !['approved', 'completed'].includes(t.status)) return false;
        if (statusFilter === 'cancelled' && t.status !== 'cancelled') return false;
      }
      
      if (searchTerm) {
        const matchUser = t.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchId = t.id?.toString().includes(searchTerm);
        if (!matchUser && !matchId) return false;
      }
      
      return true;
    });
  }, [stats?.latest_transactions, statusFilter, dateFilter, customDateStart, customDateEnd, searchTerm]);

  const filteredStats = useMemo(() => {
    const txs = filteredTransactions;
    
    const total = txs.reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
    const pending = txs.filter((t: any) => !['approved', 'completed'].includes(t.status))
      .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
    const approved = txs.filter((t: any) => ['approved', 'completed'].includes(t.status))
      .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
    const cancelled = txs.filter((t: any) => t.status === 'cancelled')
      .reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0);
    
    return { total, pending, approved, cancelled, count: txs.length };
  }, [filteredTransactions]);

  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const exportToCSV = () => {
    if (!filteredTransactions.length) return;
    
    const headers = ['ID', 'Usuário', 'Plano', 'Valor', 'Data', 'Status'];
    const rows = filteredTransactions.map((t: any) => [
      t.id,
      t.user_name || 'N/A',
      t.plan_name || t.feature_key || 'N/A',
      t.amount,
      new Date(t.created_at).toLocaleDateString('pt-BR'),
      t.status
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transacoes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black italic uppercase text-slate-400">Consolidando Caixa...</div>;

  return (
    <PageShell
      title="Gestão Financeira"
      description="Controle de receitas e transações"
      actions={
        <button onClick={exportToCSV} className="flex items-center gap-2 text-xs font-bold uppercase bg-indigo-600 text-white px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition-all">
          <Download size={16} /> Exportar
        </button>
      }
    >
      <div className="mt-6">
        <StatsGrid>
        <StatCard label="Receita Total" value={formatCurrency(filteredStats.total)} icon={<TrendingUp size={16} />} />
        <StatCard label="Pendente" value={formatCurrency(filteredStats.pending)} variant="blue" icon={<ArrowDownCircle size={16} />} />
        <StatCard label="Aprovado" value={formatCurrency(filteredStats.approved)} variant="purple" icon={<Wallet size={16} />} />
          <StatCard label="Cancelado" value={formatCurrency(filteredStats.cancelled)} variant="red" icon={<CreditCard size={16} />} />
        </StatsGrid>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mt-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar transação..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="cancelled">Cancelado</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setShowCustomDate(e.target.value === 'custom'); }}
            className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Todos os Períodos</option>
            <option value="today">Hoje</option>
            <option value="week">Últimos 7 dias</option>
            <option value="month">Este Mês</option>
            <option value="lastmonth">Mês Passado</option>
            <option value="custom">Personalizado</option>
          </select>

          {showCustomDate && (
            <div className="flex items-center gap-2">
              <input 
                type="date"
                value={customDateStart}
                onChange={(e) => setCustomDateStart(e.target.value)}
                className="px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input 
                type="date"
                value={customDateEnd}
                onChange={(e) => setCustomDateEnd(e.target.value)}
                className="px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {(customDateStart || customDateEnd) && (
                <button onClick={() => { setCustomDateStart(''); setCustomDateEnd(''); }} className="p-2.5 hover:bg-slate-100 rounded-xl border border-slate-200">
                  <X size={14} className="text-slate-400" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 lg:p-5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3">
          <h3 className="font-bold text-slate-900 dark:text-white">
            Transações ({filteredTransactions.length})
          </h3>
          
          {!hasDateFilter && (
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
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                <th className="px-5 py-4">ID</th>
                <th className="px-5 py-4">Usuário</th>
                <th className="px-5 py-4">Plano</th>
                <th className="px-5 py-4">Valor</th>
                <th className="px-5 py-4">Data</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {(hasDateFilter ? filteredTransactions : paginatedTransactions).length > 0 ? (
              (hasDateFilter ? filteredTransactions : paginatedTransactions).map((t: any) => (
                <tr key={t.id} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all">
                  <td className="px-5 py-4 font-bold text-slate-400">#{t.id}</td>
                  <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{t.user_name || 'N/A'}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{t.plan_name || t.feature_key || 'N/A'}</td>
                  <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">{formatCurrency(t.amount)}</td>
                  <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                    {new Date(t.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-5 py-4">
                    {['approved', 'completed'].includes(t.status) ? (
                      <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Aprovado
                      </span>
                    ) : t.status === 'cancelled' ? (
                      <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        Cancelado
                      </span>
                    ) : (
                      <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        Pendente
                      </span>
                    )}
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 font-medium">
                    Nenhuma transação registrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!hasDateFilter && totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredTransactions.length)} de {filteredTransactions.length}
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
    </PageShell>
  );
}