import { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, QrCode, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/api/api';
import { Button } from '@/components/ui/button';

// Definição de interface para melhorar a estabilidade do código
interface Transaction {
  id: number;
  amount: number;
  transaction_type: string;
  module_key?: string;
  feature_key?: string;
  gateway_payload?: string;
  created_at: string;
}

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [recharging, setRecharging] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/wallet/balance');
      if (res.data?.success) {
        setBalance(Number(res.data.data?.balance) || 0);
        setTransactions(res.data.data?.transactions || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    // Tratamento para aceitar vírgula e ponto
    const normalizedAmount = rechargeAmount.replace('.', '').replace(',', '.');
    const amount = parseFloat(normalizedAmount);
    
    if (isNaN(amount) || amount < 0.01) {
      alert('Informe um valor válido (mínimo R$ 0,01)');
      return;
    }

    setRecharging(true);
    try {
      const res = await api.post('/wallet/recharge', { amount });
      
      if (res.data?.success && res.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert(res.data?.message || 'Erro ao gerar PIX');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao processar recarga');
    } finally {
      setRecharging(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getTransactionIcon = (amount: number) => {
    return amount > 0 
      ? <ArrowDownLeft className="text-emerald-500" size={18} />
      : <ArrowUpRight className="text-rose-500" size={18} />;
  };

  const getTransactionDescription = (tx: Transaction) => {
    try {
      if (tx.gateway_payload) {
        const payload = typeof tx.gateway_payload === 'string' 
          ? JSON.parse(tx.gateway_payload) 
          : tx.gateway_payload;
        if (payload?.description) return payload.description;
      }
    } catch (e) {
      // Falha silenciosa no parse
    }
    
    if (tx.transaction_type === 'wallet_recharge') return 'Recarga via PIX';
    if (tx.transaction_type === 'wallet_debit') {
        return tx.feature_key 
          ? `${tx.module_key} • ${tx.feature_key}` 
          : tx.module_key || 'Débito em conta';
    }
    return tx.feature_key || tx.module_key || 'Transação';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex flex-col items-center justify-center">
         <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
         <p className="text-slate-500 font-medium animate-pulse">Sincronizando carteira...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-orange-100 dark:bg-orange-500/10 rounded-2xl">
            <Wallet className="text-orange-600 dark:text-orange-500" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Minha Carteira</h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hub de Créditos Chama Frete</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 text-white shadow-xl shadow-orange-500/20 border border-orange-400/20">
          <div className="mb-8">
            <p className="text-orange-100 text-xs font-black uppercase tracking-widest mb-1">Saldo disponível</p>
            <p className="text-5xl font-black italic">{formatCurrency(balance)}</p>
          </div>
          
          <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-md border border-white/20">
            <p className="text-orange-50 text-[10px] font-black uppercase mb-3 flex items-center gap-2">
              <QrCode size={14} />
              Recarga Instantânea via PIX
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-200 font-bold text-sm">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-black placeholder:text-orange-200/50 outline-none border border-white/10 focus:border-white/40 transition-all"
                />
              </div>
              <Button
                onClick={handleRecharge}
                disabled={recharging || !rechargeAmount}
                className="bg-white text-orange-600 hover:bg-orange-50 font-black uppercase italic px-6 rounded-xl shadow-lg transition-transform active:scale-95"
              >
                {recharging ? <Loader2 className="animate-spin" size={18} /> : 'Recarregar'}
              </Button>
            </div>
            <p className="text-orange-100/70 text-[9px] mt-3 font-bold uppercase">
              • Mínimo R$ 0,01 • Liberação imediata após o pagamento
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Clock size={16} className="text-orange-500" />
              Histórico de Movimentações
            </h2>
          </div>
          
          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="mx-auto text-slate-200 dark:text-slate-700 mb-3" size={48} />
              <p className="text-slate-400 text-xs font-black uppercase">Nenhuma transação identificada</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.slice(0, 15).map((tx) => (
                <div key={tx.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className={`p-2 rounded-xl ${tx.amount > 0 ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {getTransactionIcon(tx.amount)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate uppercase tracking-tight">
                      {getTransactionDescription(tx)}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {formatDate(tx.created_at)}
                    </p>
                  </div>
                  <div className={`font-black text-sm italic ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}