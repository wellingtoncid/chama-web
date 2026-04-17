import { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, QrCode, Clock, AlertCircle } from 'lucide-react';
import { api } from '@/api/api';
import { Button } from '@/components/ui/button';

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [recharging, setRecharging] = useState(false);
  const [_pixUrl, _setPixUrl] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/wallet/balance');
      if (res.data?.success) {
        setBalance(res.data.data?.balance || 0);
        setTransactions(res.data.data?.transactions || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    const amount = parseFloat(rechargeAmount.replace(',', '.'));
    
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
    } catch (error: unknown) {
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
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (amount: number) => {
    if (amount > 0) {
      return <ArrowDownLeft className="text-green-500" size={18} />;
    }
    return <ArrowUpRight className="text-red-500" size={18} />;
  };

  const getTransactionDescription = (tx: unknown) => {
    try {
      const payload = tx.gateway_payload ? JSON.parse(tx.gateway_payload) : null;
      if (payload?.description) return payload.description;
    } catch { // empty }
    
    if (tx.transaction_type === 'wallet_recharge') return 'Recarga via PIX';
    if (tx.transaction_type === 'wallet_debit') return `${tx.module_key} - ${tx.feature_key}`;
    return tx.feature_key || tx.module_key || 'Transação';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
            <Wallet className="text-orange-500" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Minha Carteira</h1>
            <p className="text-sm text-slate-500">Gerencie seu saldo e recargas</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="mb-4">
            <p className="text-orange-100 text-sm font-medium">Saldo disponível</p>
            <p className="text-4xl font-bold">{formatCurrency(balance)}</p>
          </div>
          
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-orange-100 text-xs mb-3 flex items-center gap-2">
              <QrCode size={14} />
              Recarga via PIX
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={rechargeAmount}
                onChange={(e) => setRechargeAmount(e.target.value)}
                placeholder="0,00"
                className="flex-1 bg-white/20 rounded-lg px-4 py-3 text-white placeholder:text-orange-200 outline-none border border-white/30 focus:border-white"
              />
              <Button
                variant="hero-outline"
                onClick={handleRecharge}
                disabled={recharging || !rechargeAmount}
                className="bg-white text-orange-600 hover:bg-orange-50"
              >
                {recharging ? 'Gerando...' : 'Recarregar'}
              </Button>
            </div>
            <p className="text-orange-100 text-xs mt-2">
              Mínimo: R$ 0,01 • Receba o código PIX na hora
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-700">
            <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock size={18} />
              Últimas transações
            </h2>
          </div>
          
          {transactions.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={32} />
              <p className="text-slate-500 text-sm">Nenhuma transação ainda</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {transactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    {getTransactionIcon(tx.amount)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white text-sm">
                      {getTransactionDescription(tx)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(tx.created_at)}
                    </p>
                  </div>
                  <div className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-slate-900 dark:text-white'}`}>
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
