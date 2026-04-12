import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/api/api';
import Header from '../../components/shared/Header';
import Footer from '../../components/shared/Footer';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('transaction_id');
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<any>(null);

  useEffect(() => {
    async function fetchTransaction() {
      if (!transactionId) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/my-transactions');
        const tx = res.data?.data?.find((t: any) => t.id === parseInt(transactionId));
        if (tx) {
          setTransaction(tx);
        }
      } catch (error) {
        console.error('Erro ao buscar transação:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTransaction();
  }, [transactionId]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25"></div>
              <div className="relative bg-emerald-500 text-white p-6 rounded-full shadow-2xl">
                {loading ? (
                  <Loader2 size={48} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={48} strokeWidth={2.5} />
                )}
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-[1000] tracking-tighter uppercase italic text-slate-900 mb-4">
              PAGAMENTO <span className="text-emerald-500">APROVADO!</span>
            </h1>
            
            <p className="text-lg text-slate-500 mb-8 italic">
              Sua assinatura foi ativada com sucesso. Aproveite os benefícios do seu novo plano!
            </p>

            {transaction && (
              <div className="bg-slate-50 rounded-[2rem] p-8 mb-8 text-left">
                <h3 className="font-black uppercase text-sm text-slate-400 mb-4">Detalhes da Transação</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ID da Transação</span>
                    <span className="font-bold text-slate-900">#{transaction.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Módulo</span>
                    <span className="font-bold text-slate-900 capitalize">{transaction.module_key || 'Plano'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Valor</span>
                    <span className="font-bold text-emerald-600">R$ {parseFloat(transaction.amount).toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <span className="font-bold text-emerald-600 capitalize">{transaction.status}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link 
                to="/dashboard/plans"
                className="px-8 py-5 bg-emerald-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-xl"
              >
                Gerenciar Planos <ArrowRight size={18} />
              </Link>
              
              <Link 
                to="/dashboard"
                className="px-8 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-slate-800 transition-all"
              >
                Ir para Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
