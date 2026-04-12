import React from 'react';
import { Truck, Building2, ArrowRight, Check, Users, Globe } from 'lucide-react';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header />
      
      <main className="flex-grow pt-32">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-[0.85] mb-8">
              Como <span className="text-orange-500">Funciona</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium italic max-w-2xl mx-auto mb-12">
              Conectamos empresas que precisam de fretes com motoristas disponíveis. 
              Tudo em um só lugar, de forma simples e segura.
            </p>
          </div>
        </section>

        {/* Escolha seu perfil */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter text-center mb-16">
              Escolha seu <span className="text-blue-600">Perfil</span>
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Card Empresa */}
              <Link 
                to="/como-funciona/empresas"
                className="group bg-blue-600 rounded-[3rem] p-10 text-white flex flex-col justify-between h-full min-h-[420px] relative overflow-hidden shadow-2xl hover:translate-y-[-4px] transition-all"
              >
                <Building2 className="absolute -right-8 -bottom-8 text-white/10 group-hover:scale-110 transition-transform duration-700" size={240} />
                <div className="relative z-10">
                  <div className="bg-white/20 w-fit p-4 rounded-2xl mb-6 backdrop-blur-xl border border-white/10">
                    <Building2 size={32} />
                  </div>
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-[0.85] mb-4">
                    Sou <span className="text-blue-200">Empresa</span>
                  </h3>
                  <p className="text-blue-100 text-sm font-medium italic">
                    Transportadora, embarcador ou logística
                  </p>
                </div>
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center gap-3 text-blue-100">
                    <Check size={16} className="text-white" />
                    <span className="text-xs font-bold">Publique fretes rapidamente</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-100">
                    <Check size={16} className="text-white" />
                    <span className="text-xs font-bold">Encontre motoristas verificados</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-100">
                    <Check size={16} className="text-white" />
                    <span className="text-xs font-bold">Gerencie suas cotações</span>
                  </div>
                </div>
                <button className="w-full bg-white text-blue-600 py-5 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 hover:bg-blue-50 transition-all shadow-xl relative z-10 mt-8">
                  Saiba Mais <ArrowRight size={18} />
                </button>
              </Link>

              {/* Card Motorista */}
              <Link 
                to="/como-funciona/motoristas"
                className="group bg-orange-500 rounded-[3rem] p-10 text-white flex flex-col justify-between h-full min-h-[420px] relative overflow-hidden shadow-2xl hover:translate-y-[-4px] transition-all"
              >
                <Truck className="absolute -right-8 -bottom-8 text-white/10 group-hover:scale-110 transition-transform duration-700" size={240} />
                <div className="relative z-10">
                  <div className="bg-white/20 w-fit p-4 rounded-2xl mb-6 backdrop-blur-xl border border-white/10">
                    <Truck size={32} />
                  </div>
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-[0.85] mb-4">
                    Sou <span className="text-orange-100">Motorista</span>
                  </h3>
                  <p className="text-orange-100 text-sm font-medium italic">
                    Autônomo ou frotista
                  </p>
                </div>
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center gap-3 text-orange-100">
                    <Check size={16} className="text-white" />
                    <span className="text-xs font-bold">Receba fretes da sua região</span>
                  </div>
                  <div className="flex items-center gap-3 text-orange-100">
                    <Check size={16} className="text-white" />
                    <span className="text-xs font-bold">Negocie direto com empresas</span>
                  </div>
                  <div className="flex items-center gap-3 text-orange-100">
                    <Check size={16} className="text-white" />
                    <span className="text-xs font-bold">Acompanhe suas ganancias</span>
                  </div>
                </div>
                <button className="w-full bg-white text-orange-600 py-5 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 hover:bg-orange-50 transition-all shadow-xl relative z-10 mt-8">
                  Saiba Mais <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Recursos em comum */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter text-center mb-16">
              Para <span className="text-emerald-600">Todos</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 text-center shadow-xl">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Globe className="text-blue-600" size={32} />
                </div>
                <h3 className="text-xl font-black uppercase italic mb-3">Comunidades</h3>
                <p className="text-slate-500 text-sm">
                  Participe de grupos exclusivos no WhatsApp para fretes em tempo real.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 text-center shadow-xl">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="text-emerald-600" size={32} />
                </div>
                <h3 className="text-xl font-black uppercase italic mb-3">Chat Direto</h3>
                <p className="text-slate-500 text-sm">
                  Communicate diretamente com empresas ou motoristas para negociar fretes.
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 text-center shadow-xl">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Building2 className="text-amber-600" size={32} />
                </div>
                <h3 className="text-xl font-black uppercase italic mb-3">Marketplace</h3>
                <p className="text-slate-500 text-sm">
                  Compra e venda de produtos entre membros da comunidade.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-8">
              Pronto para fazer parte?
            </h2>
            <p className="text-slate-500 text-lg mb-12">
              Junte-se a milhares de empresas e motoristas que já estão conectados.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/register?type=company"
                className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase hover:bg-blue-700 transition-all shadow-xl"
              >
                Sou Empresa
              </Link>
              <Link 
                to="/register?type=driver"
                className="px-10 py-5 bg-orange-500 text-white rounded-2xl font-black text-sm uppercase hover:bg-orange-600 transition-all shadow-xl"
              >
                Sou Motorista
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
