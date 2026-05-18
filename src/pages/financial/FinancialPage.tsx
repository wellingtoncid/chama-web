import { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/api';
import { Button } from '../../components/ui/Button';
import { 
  Eye, X, QrCode, RefreshCw, ArrowUpRight, ArrowDownLeft, Wallet
} from 'lucide-react';
import DashboardShell from '../../components/layout/DashboardShell';

// ----- helpers -----

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtRelative = (dateStr: string) => {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) {
    const h = Math.floor((now - d) / 3600000);
    if (h === 0) {
      const m = Math.floor((now - d) / 60000);
      return m <= 1 ? 'agora' : `${m}min atrás`;
    }
    return `hoje ${new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffDays === 1) return 'ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

const fmtFull = (s: string) =>
  s ? new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

const statusStyle: Record<string, string> = {
  approved:      'bg-emerald-100 text-emerald-700',
  pending:       'bg-yellow-100 text-yellow-700',
  rejected:      'bg-red-100 text-red-700',
  cancelled:     'bg-slate-100 text-slate-600',
  refunded:      'bg-orange-100 text-orange-700',
  in_dispute:    'bg-purple-100 text-purple-700',
  awaiting_review: 'bg-blue-100 text-blue-700',
};

const statusLabel: Record<string, string> = {
  approved:      'Aprovado',
  pending:       'Pendente',
  rejected:      'Rejeitado',
  cancelled:     'Cancelado',
  refunded:      'Estornado',
  in_dispute:    'Em Disputa',
  awaiting_review: 'Em Análise',
};
// ----- ----- -----

export default function FinancialPage() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [rows, setRows] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const [recharge, setRecharge] = useState('');
  const [recharging, setRecharging] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [timeAgo, setTimeAgo] = useState('');

  // ----- load -----

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!updatedAt) return;
    const tick = () => {
      const s = Math.floor((Date.now() - updatedAt.getTime()) / 1000);
      if (s < 60) setTimeAgo('agora');
      else if (s < 3600) setTimeAgo(`${Math.floor(s / 60)}min`);
      else setTimeAgo(`${Math.floor(s / 3600)}h`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [updatedAt]);

  const load = async () => {
    setLoading(true);
    try {
      const [bRes, hRes] = await Promise.all([
        api.get('/wallet/balance'),
        api.get('/payment-history'),
      ]);
      if (bRes.data?.success) setBalance(bRes.data.data.balance ?? 0);
      if (hRes.data?.success) setRows(Array.isArray(hRes.data.data) ? hRes.data.data : []);
    } catch {
      console.error('Erro ao carregar financeiro');
    } finally {
      setLoading(false);
      setUpdatedAt(new Date());
    }
  };

  // ----- recharge -----

  const handleRecharge = async () => {
    const v = parseFloat(recharge.replace(',', '.'));
    if (isNaN(v) || v < 0.01) return alert('Valor mínimo: R$ 0,01');
    setRecharging(true);
    try {
      const res = await api.post('/wallet/recharge', { amount: v });
      if (res.data?.success && res.data?.url) window.location.href = res.data.url;
      else alert(res.data?.message || 'Erro ao gerar PIX');
    } catch {
      alert('Erro ao processar recarga');
    } finally {
      setRecharging(false);
    }
  };

  // ----- descriptions -----

  function describe(tx: any): string {
    const t = tx.transaction_type;

    if (t === 'wallet_recharge')  return 'Recarga via PIX';
    if (t === 'wallet_refund')    return 'Estorno';
    if (t === 'wallet_debit')     return descFromModule(tx);

    if (t === 'subscription')     return tx.plan_name || 'Plano';
    if (t === 'monthly')          return `${descFromModule(tx)} • Mensal`;
    if (t === 'per_use')          return descFromModule(tx);
    if (t === 'daily')            return `${descFromModule(tx)} • Diário`;

    return descFromModule(tx) || 'Pagamento';
  }

  function descFromModule(tx: any): string {
    const moduleNames: Record<string, string> = {
      freights: 'Frete', marketplace: 'Marketplace',
      advertiser: 'Anúncio', driver: 'Motorista',
      quotes: 'Cotação', wallet: 'Carteira',
    };
    const featureNames: Record<string, string> = {
      publish: 'Publicar', boost: 'Destacar', urgent: 'Urgente',
      freight_renew: 'Renovar', publish_listing: 'Anunciar',
      featured_listing: 'Destacar Anúncio', bump: 'Bump',
      document_verification: 'Verificar Documento',
      featured_profile: 'Perfil Destacado',
      recharge: 'Recarga', refund: 'Estorno',
    };
    const mod = moduleNames[tx.module_key] || tx.module_key || '';
    const feat = featureNames[tx.feature_key] || tx.feature_key || '';
    return [mod, feat].filter(Boolean).join(' - ');
  }

  // ----- wallet transactions (recharge / debit / refund) -----

  const isWallet = (t: string) =>
    ['wallet_recharge', 'wallet_debit', 'wallet_refund'].includes(t);

  // ----- filter + search -----

  const filtered = useMemo(() => {
    // Segurança: remove linhas órfãs (sem transaction_type nem module_key)
    let list = rows.filter((r: any) => r.transaction_type || r.module_key);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r: any) =>
        describe(r).toLowerCase().includes(q) ||
        `${r.id}`.includes(q)
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter((r: any) => r.status === statusFilter);
    }
    // Segurança extra: esconde pendentes com mais de 24h (backend já deve ter cancelado)
    if (statusFilter === 'all' || statusFilter === 'pending') {
      const cutoff = Date.now() - 86400000;
      list = list.filter((r: any) =>
        r.status !== 'pending' || new Date(r.created_at).getTime() > cutoff
      );
    }
    return list;
  }, [rows, search, statusFilter]);

  // ----- stats -----

  const monthSpent = useMemo(() => {
    const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    return rows
      .filter((r: any) => {
        if (r.transaction_type === 'wallet_recharge' || r.transaction_type === 'wallet_refund') return false;
        if (r.status !== 'approved') return false;
        return new Date(r.created_at) >= start;
      })
      .reduce((sum: number, r: any) => sum + Math.abs(parseFloat(r.amount) || 0), 0);
  }, [rows]);

  // ----- loading skeleton -----

  if (loading) return (
    <DashboardShell title="Financeiro" description="Saldo e extrato de transações">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-pulse">
        <div className="lg:col-span-2 bg-gradient-to-br from-orange-500/60 to-orange-600/60 rounded-2xl p-6">
          <div className="h-4 w-24 bg-white/30 rounded mb-3" />
          <div className="h-10 w-48 bg-white/30 rounded mb-4" />
          <div className="h-10 w-64 bg-white/20 rounded-lg" />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl border p-6">
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
          <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-2xl border">
        <div className="p-4 border-b"><div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded" /></div>
        {[1,2,3].map(i => (
          <div key={i} className="grid grid-cols-6 gap-4 px-4 py-3.5 border-b">
            {[1,2,3,4,5,6].map(j => <div key={j} className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />)}
          </div>
        ))}
      </div>
    </DashboardShell>
  );

  // ----- render -----

  return (
    <DashboardShell
      title="Financeiro"
      description="Saldo e extrato de transações"
      actions={updatedAt ? (
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <RefreshCw size={12} /> Atualizado {timeAgo}
        </div>
      ) : undefined}
    >
      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 text-orange-100 text-xs font-medium mb-1">
            <Wallet size={14} /> Saldo disponível
          </div>
          <p className="text-4xl font-bold tabular-nums mb-4">{fmt(balance)}</p>
          <div className="flex gap-3 max-w-md">
            <input
              type="text" value={recharge}
              onChange={e => setRecharge(e.target.value)}
              placeholder="Valor da recarga"
              className="flex-1 bg-white/20 rounded-lg px-4 py-2.5 text-white placeholder:text-orange-200 outline-none border border-white/30 focus:border-white text-sm"
            />
            <Button
              onClick={handleRecharge}
              disabled={recharging || !recharge}
              variant="hero-outline"
              className="bg-white text-orange-600 hover:bg-orange-50 shrink-0"
            >
              {recharging ? 'Gerando...' : <><QrCode size={16} /> Recarregar</>}
            </Button>
          </div>
          <p className="text-orange-100/60 text-[10px] mt-2">Pagamento via PIX • Mínimo: R$ 0,01</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Gasto no mês</p>
          <p className="text-2xl font-black tabular-nums text-slate-900 dark:text-white mt-1">{fmt(monthSpent)}</p>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2 text-[10px] text-slate-400">
            <ArrowUpRight size={12} />
            Despesas aprovadas
          </div>
        </div>
      </div>

      {/* Extrato */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Filtros */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mr-1">
            Extrato
          </span>
          <div className="flex items-center gap-1 ml-auto">
            {['all', 'approved', 'pending', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  statusFilter === s
                    ? 'bg-slate-900 text-white dark:bg-emerald-600'
                    : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {s === 'all' ? 'Todas' : statusLabel[s] || s}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Wallet size={32} className="mx-auto mb-3 text-slate-200" />
            <p className="font-medium text-sm text-slate-500">Nenhuma transação</p>
            <p className="text-xs mt-1">As movimentações financeiras aparecerão aqui</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-slate-400">Descrição</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-slate-400 w-28">Data</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase text-slate-400 w-20">Tipo</th>
                  <th className="text-right px-4 py-3 text-[10px] font-black uppercase text-slate-400 w-28">Valor</th>
                  <th className="text-center px-4 py-3 text-[10px] font-black uppercase text-slate-400 w-24">Status</th>
                  <th className="text-right px-4 py-3 text-[10px] font-black uppercase text-slate-400 w-12"> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map((tx: any) => {
                  const walletTx = isWallet(tx.transaction_type);
                  const walletApproved = walletTx && tx.status === 'approved';
                  const amt = parseFloat(tx.amount) || 0;
                  const isCredit = amt > 0;

                  return (
                    <tr key={`tx-${tx.id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate max-w-[300px]">
                          {describe(tx)}
                        </p>
                        {tx.plan_name && (
                          <p className="text-[10px] text-slate-400">{tx.plan_name}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-slate-500 font-medium" title={fmtFull(tx.created_at)}>
                          {fmtRelative(tx.created_at)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg inline-block ${
                          walletTx
                            ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {walletTx ? 'Carteira' : 'Pagamento'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className={`font-black tabular-nums text-sm ${
                          isCredit ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                        }`}>
                          {isCredit ? '+' : ''}{fmt(Math.abs(amt))}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {walletApproved ? (
                          <span className="text-[10px] text-slate-300 dark:text-slate-600 font-medium italic">
                            {isCredit ? 'Entrada' : 'Débito'}
                          </span>
                        ) : (
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            statusStyle[tx.status] || 'bg-slate-100 text-slate-600'
                          }`}>
                            {statusLabel[tx.status] || tx.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => setSelected(tx)} className="text-slate-300 hover:text-slate-600 dark:hover:text-slate-300">
                          <Eye size={14} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalhe */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white">Detalhes</h3>
                <p className="text-xs text-slate-400 mt-0.5">#{selected.id}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelected(null)} className="text-slate-400">
                <X size={18} />
              </Button>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-slate-800 dark:text-slate-200">{describe(selected)}</p>
              {selected.plan_name && (
                <p className="text-xs text-slate-400">{selected.plan_name}</p>
              )}

              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <span className="text-[10px] font-black uppercase text-slate-400">Valor</span>
                <span className={`font-black tabular-nums ${parseFloat(selected.amount) > 0 ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                  {parseFloat(selected.amount) > 0 ? '+' : ''}{fmt(Math.abs(parseFloat(selected.amount) || 0))}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <span className="text-[10px] font-black uppercase text-slate-400">Tipo</span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                  isWallet(selected.transaction_type)
                    ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  {isWallet(selected.transaction_type) ? 'Carteira' : 'Pagamento'}
                </span>
              </div>

              {(!isWallet(selected.transaction_type) || selected.status !== 'approved') && (
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-slate-400">Status</span>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    statusStyle[selected.status] || 'bg-slate-100 text-slate-600'
                  }`}>
                    {statusLabel[selected.status] || selected.status}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                <span className="text-[10px] font-black uppercase text-slate-400">Data</span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{fmtFull(selected.created_at)}</span>
              </div>

              {selected.approved_at && (
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-slate-400">Aprovado em</span>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{fmtFull(selected.approved_at)}</span>
                </div>
              )}

              {selected.gateway_fee > 0 && (
                <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-slate-400">Taxa</span>
                  <span className="text-xs font-medium tabular-nums text-slate-600 dark:text-slate-300">{fmt(parseFloat(selected.gateway_fee))}</span>
                </div>
              )}
            </div>

            <Button onClick={() => setSelected(null)} className="w-full mt-5" variant="secondary">Fechar</Button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
