import React from 'react';
import { Truck, ArrowRight, MapPinned, MessageCircle, Star, ShieldCheck, Clock, Target, FileCheck, TrendingUp } from 'lucide-react';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import { Link } from 'react-router-dom';

export default function HowItWorksDrivers() {
  const features = [
    {
      icon: Target,
      title: 'Receba Fretes',
      description: 'Acesse fretes disponíveis na sua região. Filtre por tipo de carga, veículo e valor.'
    },
    {
      icon: MapPinned,
      title: 'Geolocalização',
      description: 'Encontre fretes próximos da sua localização atual. Economize combustível.'
    },
    {
      icon: MessageCircle,
      title: 'Negocie Online',
      description: 'Chat direto com empresas para negociar condições, prazos e valores.'
    },
    {
      icon: TrendingUp,
      title: 'Acompanhe Ganancias',
      description: 'Visualize o histórico de fretes realizados e construa sua reputação na plataforma.'
    },
    {
      icon: Star,
      title: 'Avaliações',
      description: 'Construa sua reputação com avaliações positivas. Perfil bem avaliado gera mais confiança.'
    },
    {
      icon: FileCheck,
      title: 'Documentos Verificados',
      description: 'Verificação de CNH e documentos para aumentar sua credibilidade perante as empresas.'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header />
      
      <main className="flex-grow pt-32">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-b from-orange-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8">
              <Truck size={16} /> Para Motoristas
            </div>
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-[0.85] mb-8">
              Como funciona para <span className="text-orange-500">Motoristas</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium italic max-w-2xl mx-auto mb-12">
              Encontre fretes na sua região, negocie diretamente com empresas 
              e construa sua reputação no Chama Frete.
            </p>
            <Link 
              to="/register?type=driver"
              className="inline-flex items-center gap-3 px-10 py-5 bg-orange-500 text-white rounded-2xl font-black text-sm uppercase hover:bg-orange-600 transition-all shadow-xl"
            >
              Cadastrar como Motorista <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Passo a Passo */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter text-center mb-16">
              Comece em <span className="text-orange-500">4 Passos</span>
            </h2>
            
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: '01', title: 'Cadastre-se', desc: 'Informe seus dados e veículo' },
                { step: '02', title: 'Verifique', desc: 'Valide sua CNH e documentos' },
                { step: '03', title: 'Busque', desc: 'Encontre fretes na sua região' },
                { step: '04', title: 'Negocie', desc: 'Entre em contato e feche negócios' }
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-20 h-20 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white font-black text-2xl">
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
              Tudo que você <span className="text-orange-500"> Precisa</span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-xl border border-slate-100 dark:border-slate-700">
                  <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mb-5">
                    <feature.icon className="text-orange-500" size={28} />
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
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-amber-200 dark:border-amber-800">
                <h4 className="font-black uppercase italic mb-2 text-amber-600">Nossos Serviços</h4>
                <ul className="space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    Conexão com empresas e fretes
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    Chat para negociação
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    Verificação de documentos
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">•</span>
                    Sistema de avaliações
                  </li>
                </ul>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                <h4 className="font-black uppercase italic mb-2 text-slate-600 dark:text-slate-300">Não somos responsáveis por</h4>
                <ul className="space-y-2 text-slate-600 dark:text-slate-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">✗</span>
                    Pagamentos de fretes
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">✗</span>
                    Negociações fechadas fora da plataforma
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">✗</span>
                    Problemas entre contratado e contratante
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400">✗</span>
                    Qualidade de serviços prestados
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-8">
              Pronto para encontrar fretes?
            </h2>
            <p className="text-slate-500 text-lg mb-12 max-w-xl mx-auto">
              Cadastre-se gratuitamente e comece a buscar fretes na sua região.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/register?type=driver"
                className="px-10 py-5 bg-orange-500 text-white rounded-2xl font-black text-sm uppercase hover:bg-orange-600 transition-all shadow-xl"
              >
                Cadastrar como Motorista
              </Link>
              <Link 
                to="/como-funciona/empresas"
                className="px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-black text-sm uppercase hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Sou Empresa
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
