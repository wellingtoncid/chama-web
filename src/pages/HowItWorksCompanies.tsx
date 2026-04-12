import React from 'react';
import { Building2, ArrowRight, MessageCircle, BarChart3, ShieldCheck, Clock, Target, Users, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import { Link } from 'react-router-dom';

export default function HowItWorksCompanies() {
  const features = [
    {
      icon: Target,
      title: 'Publique Fretes',
      description: 'Crie anúncios de cargas em minutos com detalhes completos: origem, destino, tipo de veículo e valor.'
    },
    {
      icon: Users,
      title: 'Encontre Motoristas',
      description: 'Acesse nossa rede de motoristas. Filtre por região, tipo de veículo e avaliações.'
    },
    {
      icon: MessageCircle,
      title: 'Negocie Direto',
      description: 'Use nosso chat integrado para negociar condições, prazos e valores com total transparência.'
    },
    {
      icon: BarChart3,
      title: 'Acompanhe Resultados',
      description: 'Dashboards com métricas de visualizações e cliques dos seus fretes publicados.'
    },
    {
      icon: ShieldCheck,
      title: 'Motoristas Verificados',
      description: 'Documentos dos motoristas são verificados pela plataforma antes de aparecerem.'
    },
    {
      icon: Clock,
      title: 'Suporte Rápido',
      description: 'Equipe de suporte disponível para ajudar em todas as etapas do processo.'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header />
      
      <main className="flex-grow pt-32">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              <Building2 size={16} /> Para Empresas
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-[0.85] mb-8">
              Como funciona para <span className="text-blue-600">Empresas</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium italic max-w-2xl mx-auto mb-12">
              Conectamos sua empresa com motoristas disponíveis. 
              Publique fretes, receba contatos e feche negócios diretamente.
            </p>
            <Link 
              to="/register?type=company"
              className="inline-flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase hover:bg-blue-700 transition-all shadow-xl"
            >
              Criar Conta Grátis <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Passo a Passo */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter text-center mb-16">
              Comece em <span className="text-blue-600">4 Passos</span>
            </h2>
            
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Cadastre-se', desc: 'Crie sua conta de empresa' },
                { step: '02', title: 'Publique', desc: 'Anuncie seu frete com detalhes' },
                { step: '03', title: 'Receba', desc: 'Motoristas entraráo em contato' },
                { step: '04', title: 'Feche', desc: 'Negocie e finalize o negócio' }
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white font-black text-2xl">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-black uppercase italic mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Funcionalidades */}
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter text-center mb-16">
              Tudo que você <span className="text-blue-600"> Precisa</span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-xl border border-slate-100 dark:border-slate-700">
                  <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-5">
                    <feature.icon className="text-blue-600" size={28} />
                  </div>
                  <h3 className="text-lg font-black uppercase italic mb-3">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Importante - O que não fazemos */}
        <section className="py-20 bg-amber-50 dark:bg-amber-900/10">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter text-center mb-8">
              <span className="text-amber-600">Importante</span> saber
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-center text-lg mb-12">
              O Chama Frete é uma plataforma de conexão. Não intermediamos pagamentos de fretes 
              nem garantimos transações. A negociação e fechamento do negócio são de 
              responsabilidade direta entre as partes.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-black uppercase italic mb-2 text-blue-600">Nossos Serviços</h4>
                <ul className="space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                    Conexão com milhares de motoristas
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                    Chat para negociação direta
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                    Verificação de documentos
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                    Sistema de avaliações
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                    Relatórios de desempenho
                  </li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <h4 className="font-black uppercase italic mb-2 text-slate-600 dark:text-slate-300">Não somos responsáveis por</h4>
                <ul className="space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                  <li className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    Pagamentos de fretes
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    Negociações fora da plataforma
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    Qualidade do serviço prestado
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    Problemas entre as partes
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    Perda ou dano de cargas
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-blue-600 rounded-[4rem] mx-4 mb-12">
          <div className="max-w-4xl mx-auto px-4 text-center text-white">
            <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-8">
              Pronto para começar?
            </h2>
            <p className="text-blue-100 text-lg mb-12 max-w-xl mx-auto">
              Cadastre-se gratuitamente e publique seu primeiro frete em minutos.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/register?type=company"
                className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-black text-sm uppercase hover:bg-blue-50 transition-all shadow-xl"
              >
                Criar Conta Grátis
              </Link>
              <Link 
                to="/como-funciona/motoristas"
                className="px-10 py-5 bg-transparent border-2 border-white text-white rounded-2xl font-black text-sm uppercase hover:bg-white/10 transition-all"
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
