import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  Wallet, TrendingUp, TrendingDown, Loader2, 
  CreditCard, Download, ArrowUpRight, ArrowDownRight,
  Receipt, Calendar, Filter, Eye, X
} from 'lucide-react';

interface Transaction {
  id: number;
  gateway_id: string | null;
  user_id: number;
  plan_id: number | null;
  freight_id: number | null;
  listing_id: number | null;
  amount: string;
  gateway_fee: string;
  net_amount: string;
  status: string;
  payment_method: string | null;
  external_reference: string | null;
  created_at: string;
  approved_at: string | null;
  module_key: string | null;
  feature_key: string | null;
  transaction_type: string | null;
}

interface FinancialStats {
  total_spent: number;
  pending: number;
  approved: number;
  transaction_count: number;
}

export default function FinancialPage() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<FinancialStats>({
    total_spent: 0,
    pending: 0,
    approved: 0,
    transaction_count: 0
  });
  const [filter, setFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payment-history');
      
      if (res.data) {
        const data = res.data.data || res.data.transactions || [];
        setTransactions(Array.isArray(data) ? data : []);
        
        const approved = data.filter((t: Transaction) => t.status === 'approved');
        const pending = data.filter((t: Transaction) => t.status === 'pending');
        
        setStats({
          total_spent: approved.reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount || '0'), 0),
          pending: pending.reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount || '0'), 0),
          approved: approved.reduce((sum: number, t: Transaction) => sum + parseFloat(t.net_amount || t.amount || '0'), 0),
          transaction_count: data.length
        });
      }
    } catch (e) {
      console.error("Erro ao carregar transações:", e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-slate-100 text-slate-600';
      case 'refunded': return 'bg-orange-100 text-orange-700';
      case 'in_dispute': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'approved': return 'Aprovado';
      case 'pending': return 'Pendente';
      case 'rejected': return 'Rejeitado';
      case 'cancelled': return 'Cancelado';
      case 'refunded': return 'Estornado';
      case 'in_dispute': return 'Em Disputa';
      default: return status;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch(method) {
      case 'pix': return 'PIX';
      case 'credit_card': return 'Cartão';
      case 'boleto': return 'Boleto';
      default: method?.toUpperCase() || '-';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `R$ ${num.toFixed(2).replace('.', ',')}`;
  };

  const getTransactionDescription = (t: Transaction) => {
    if (t.module_key && t.feature_key) {
      const moduleNames: Record<string, string> = {
        freights: 'Fretes',
        advertiser: 'Publicidade',
        marketplace: 'Marketplace',
        quotes: 'Cotações'
      };
      const typeNames: Record<string, string> = {
        per_use: 'Uso Avulso',
        monthly: 'Assinatura Mensal',
        daily: 'Plano Diário',
        subscription: 'Assinatura'
      };
      return `${moduleNames[t.module_key] || t.module_key} - ${typeNames[t.transaction_type || ''] || t.feature_key}`;
    }
    if (t.plan_id) {
      return `Plano #${t.plan_id}`;
    }
    if (t.freight_id) {
      return `Frete #${t.freight_id}`;
    }
    if (t.listing_id) {
      return `Anúncio #${t.listing_id}`;
    }
    return 'Transação';
  };

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.status === filter);

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center animate-pulse">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Carregando Financeiro...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-[3rem] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/20 p-3 rounded-2xl">
              <Wallet size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase italic">Financeiro</h2>
              <p className="text-emerald-100 text-sm font-medium">Suas transações e histórico de pagamentos</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
              <p className="text-emerald-200 text-[10px] font-black uppercase">Total Gasto</p>
              <p className="text-2xl font-black italic">{formatPrice(stats.total_spent)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
              <p className="text-emerald-200 text-[10px] font-black uppercase">Aprovado</p>
              <p className="text-2xl font-black italic">{formatPrice(stats.approved)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
              <p className="text-yellow-200 text-[10px] font-black uppercase">Pendente</p>
              <p className="text-2xl font-black italic">{formatPrice(stats.pending)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
              <p className="text-emerald-200 text-[10px] font-black uppercase">Transações</p>
              <p className="text-2xl font-black italic">{stats.transaction_count}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100">
          {['all', 'approved', 'pending', 'rejected', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all ${
                filter === status 
                  ? 'bg-slate-900 text-white' 
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {status === 'all' ? 'Todos' : getStatusLabel(status)}
            </button>
          ))}
        </div>
        
        <button className="ml-auto flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50">
          <Download size={14} /> Exportar
        </button>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500 font-medium">Nenhuma transação encontrada</p>
            <p className="text-slate-400 text-sm mt-1">Suas transações aparecerão aqui</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-slate-400">ID</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-slate-400">Descrição</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-slate-400">Data</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black uppercase text-slate-400">Método</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black uppercase text-slate-400">Valor</th>
                  <th className="text-center px-6 py-4 text-[10px] font-black uppercase text-slate-400">Status</th>
                  <th className="text-right px-6 py-4 text-[10px] font-black uppercase text-slate-400">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-slate-400">#{t.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 text-sm">{getTransactionDescription(t)}</p>
                      {t.external_reference && (
                        <p className="text-[10px] text-slate-400">{t.external_reference}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-500 font-medium">{formatDate(t.created_at)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                        {getPaymentMethodIcon(t.payment_method || '')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-black italic text-slate-900">{formatPrice(t.amount)}</p>
                      {t.gateway_fee && parseFloat(t.gateway_fee) > 0 && (
                        <p className="text-[10px] text-slate-400">Taxa: {formatPrice(t.gateway_fee)}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(t.status)}`}>
                        {getStatusLabel(t.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedTransaction(t)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-black uppercase italic text-slate-900">Detalhes da Transação</h3>
                <p className="text-slate-400 text-sm">#{selectedTransaction.id}</p>
              </div>
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="p-2 hover:bg-slate-100 rounded-xl"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Status</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase ${getStatusColor(selectedTransaction.status)}`}>
                  {getStatusLabel(selectedTransaction.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Valor</p>
                  <p className="font-black italic text-slate-900 text-lg">{formatPrice(selectedTransaction.amount)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Valor Líquido</p>
                  <p className="font-black italic text-emerald-600 text-lg">{formatPrice(selectedTransaction.net_amount || selectedTransaction.amount)}</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Descrição</p>
                <p className="font-bold text-slate-800">{getTransactionDescription(selectedTransaction)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Criado em</p>
                  <p className="text-sm font-medium text-slate-700">{formatDate(selectedTransaction.created_at)}</p>
                </div>
                {selectedTransaction.approved_at && (
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Aprovado em</p>
                    <p className="text-sm font-medium text-slate-700">{formatDate(selectedTransaction.approved_at)}</p>
                  </div>
                )}
              </div>

              {selectedTransaction.gateway_id && (
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-1">ID Gateway</p>
                  <p className="font-mono text-sm text-slate-600">{selectedTransaction.gateway_id}</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setSelectedTransaction(null)}
              className="w-full mt-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-xs hover:bg-slate-800 transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
