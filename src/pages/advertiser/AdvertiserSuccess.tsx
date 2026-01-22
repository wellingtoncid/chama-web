import React from 'react';
import { CheckCircle, ArrowRight, LayoutDashboard, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/shared/Header';
import Footer from '../../components/shared/Footer';

const AdvertisingSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="pt-40 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Ícone Animado */}
            <div className="relative inline-block mb-12">
              <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-25"></div>
              <div className="relative bg-emerald-500 text-white p-8 rounded-full shadow-2xl">
                <CheckCircle size={64} strokeWidth={3} />
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-[1000] tracking-tighter uppercase italic text-slate-900 mb-6">
              PAGAMENTO <span className="text-emerald-500">CONFIRMADO!</span>
            </h1>
            
            <p className="text-xl md:text-2xl font-bold text-slate-500 mb-12 italic leading-relaxed">
              Parabéns! Sua marca agora faz parte do ecossistema Chama Frete. <br className="hidden md:block"/> 
              O próximo passo é configurar sua campanha.
            </p>

            {/* Timeline de Próximos Passos */}
            <div className="grid md:grid-cols-3 gap-8 text-left mb-16">
                <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 relative">
                    <span className="absolute -top-4 left-8 bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-black">1</span>
                    <ShieldCheck className="text-blue-600 mb-4" size={32} />
                    <h4 className="font-black uppercase italic text-sm mb-2">Acesso ao Painel</h4>
                    <p className="text-xs font-bold text-slate-400">Seu acesso já foi liberado no menu "Anunciante".</p>
                </div>
                <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 relative">
                    <span className="absolute -top-4 left-8 bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-black">2</span>
                    <Zap className="text-orange-500 mb-4" size={32} />
                    <h4 className="font-black uppercase italic text-sm mb-2">Envio da Arte</h4>
                    <p className="text-xs font-bold text-slate-400">Faça o upload do seu banner ou solicite suporte para criação.</p>
                </div>
                <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 relative">
                    <span className="absolute -top-4 left-8 bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center font-black">3</span>
                    <MessageSquare className="text-emerald-500 mb-4" size={32} />
                    <h4 className="font-black uppercase italic text-sm mb-2">Ativação</h4>
                    <p className="text-xs font-bold text-slate-400">Em até 2h sua campanha estará rodando para milhares de pessoas.</p>
                </div>
            </div>

            {/* Ações */}
            <div className="flex flex-col md:flex-row gap-6 justify-center">
                <button 
                  onClick={() => navigate('/dashboard/advertiser')}
                  className="px-10 py-8 bg-blue-600 text-white rounded-[2.5rem] font-[1000] uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-2xl hover:bg-blue-700 transition-all"
                >
                  Ir para Painel de Anúncios <LayoutDashboard size={20} />
                </button>
                
                <button 
                  onClick={() => window.open('https://wa.me/SEUNUMERO', '_blank')}
                  className="px-10 py-8 bg-slate-900 text-white rounded-[2.5rem] font-[1000] uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-slate-800 transition-all"
                >
                  Suporte via WhatsApp <MessageSquare size={20} />
                </button>
            </div>

            <p className="mt-12 text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
              Um e-mail de confirmação com os detalhes da fatura foi enviado para você.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdvertisingSuccessPage;