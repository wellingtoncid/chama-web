import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, MessageSquare } from 'lucide-react';
import Header from '../../components/shared/Header';
import Footer from '../../components/shared/Footer';

export default function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason');

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-25"></div>
              <div className="relative bg-red-500 text-white p-6 rounded-full shadow-2xl">
                <XCircle size={48} strokeWidth={2.5} />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-[1000] tracking-tighter uppercase italic text-slate-900 mb-4">
              PAGAMENTO <span className="text-red-500">REJEITADO</span>
            </h1>
            
            <p className="text-lg text-slate-500 mb-4 italic">
              Ops! Não foi possível processar o seu pagamento.
            </p>
            
            {reason && (
              <p className="text-sm text-red-500 mb-8">
                Motivo: {reason}
              </p>
            )}

            <div className="bg-slate-50 rounded-[2rem] p-8 mb-8 text-left">
              <h3 className="font-black uppercase text-sm text-slate-400 mb-4">Possíveis motivos</h3>
              <ul className="space-y-2 text-slate-600 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  Cartão de crédito recusado pelo banco
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  Saldo insuficiente na conta
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  Dados do cartão incorretos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  Limite de compra excedido
                </li>
              </ul>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.history.back()}
                className="px-8 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl"
              >
                <ArrowLeft size={18} /> Tentar Novamente
              </button>
              
              <Link 
                to="/dashboard/plans"
                className="px-8 py-5 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-blue-700 transition-all"
              >
                Voltar aos Planos
              </Link>
            </div>

            <p className="mt-12 text-slate-400 text-sm">
              Precisa de ajuda? Fale com nosso suporte:
            </p>
            <button 
              onClick={() => window.open('https://wa.me/5547992717125', '_blank')}
              className="mt-2 text-blue-600 hover:text-blue-700 font-bold text-sm flex items-center justify-center gap-2 mx-auto"
            >
              <MessageSquare size={16} /> Suporte via WhatsApp
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
