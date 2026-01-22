import React, { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  TrendingUp, Wallet, ArrowUpCircle, 
  CreditCard, Download, Loader2, CheckCircle
} from 'lucide-react';

export default function AdminFinancial() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        // O endpoint calcula soma da tabela 'transactions' onde status = 'completed'
        const res = await api.get('', { params: { endpoint: 'admin-financial-stats' } });
        setStats(res.data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchFinance();
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse font-black italic uppercase text-slate-400">Consolidando Caixa...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100">
          <Wallet size={24} className="mb-4 text-emerald-200" />
          <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Receita Aprovada</p>
          <h2 className="text-3xl font-black italic tracking-tighter">R$ {stats?.total_revenue || '0,00'}</h2>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <ArrowUpCircle className="text-blue-500 mb-4" size={24} />
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Aguardando (Pix)</p>
          <h2 className="text-2xl font-black italic text-slate-900 tracking-tighter">R$ {stats?.pending_revenue || '0,00'}</h2>
        </div>

        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
          <TrendingUp className="text-purple-500 mb-4" size={24} />
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Assinantes Ativos</p>
          <h2 className="text-2xl font-black italic text-slate-900 tracking-tighter">{stats?.subscriber_count || '0'}</h2>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-black uppercase italic text-xs text-slate-800 tracking-widest">Fluxo de Caixa Recente</h3>
          <button className="flex items-center gap-2 text-[9px] font-black uppercase bg-white border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
            <Download size={12} /> Relatório Completo
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50 text-[9px] font-black uppercase text-slate-400 italic">
                <th className="px-8 py-4">ID Transação</th>
                <th className="px-8 py-4">Usuário</th>
                <th className="px-8 py-4">Plano</th>
                <th className="px-8 py-4">Valor</th>
                <th className="px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats?.latest_transactions?.map((t: any) => (
                <tr key={t.id} className="text-xs hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-5 font-bold text-slate-400">#MP-{t.id}</td>
                  <td className="px-8 py-5 font-black uppercase italic">{t.user_name}</td>
                  <td className="px-8 py-5 font-bold text-slate-500">{t.plan_name}</td>
                  <td className="px-8 py-5 font-black text-slate-900">R$ {t.amount}</td>
                  <td className="px-8 py-5">
                    <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${t.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                      {t.status === 'completed' ? 'Aprovado' : 'Pendente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}