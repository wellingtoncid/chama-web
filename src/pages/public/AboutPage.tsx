import Header from '../../components/shared/Header';
import Footer from '../../components/shared/Footer';
import { Truck, Target, Users, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-[0.85] mb-6">
              Sobre a <span className="text-orange-500">Chama Frete</span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
              A plataforma que conecta o ecossistema logístico brasileiro desde 2017.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic mb-4">Nossa História</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                A Chama Frete nasceu da visão de transformar a logística no Brasil, conectando empresas que precisam
                transportar cargas com motoristas profissionais. Somos uma plataforma logística completa que integra
                fretes, marketplace, conteúdo e comunidade em um só ecossistema.
              </p>
            </section>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: Truck, title: 'Missão', desc: 'Conectar oportunidades logísticas com profissionais qualificados, gerando eficiência e rentabilidade para todo o ecossistema.' },
                { icon: Target, title: 'Visão', desc: 'Ser a maior plataforma de integração logística da América Latina, reconhecida por inovação e impacto social.' },
                { icon: Users, title: 'Para Quem', desc: 'Empresas (shippers), motoristas autônomos (carriers), anunciantes e toda a cadeia logística brasileira.' },
                { icon: Shield, title: 'Compromisso', desc: 'Segurança, transparência e tecnologia a serviço de quem movimenta o Brasil.' },
              ].map((item) => (
                <div key={item.title} className="bg-slate-50 dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-4">
                    <item.icon className="text-orange-600 dark:text-orange-400" size={24} />
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm mb-2">{item.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <section>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic mb-4">O Ecossistema</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                A Chama Frete é mais que um quadro de fretes. Somos um ecossistema completo com marketplace,
                portal de artigos, comunidades WhatsApp, e soluções de publicidade para o setor de transporte.
                Nossa plataforma é movida pela tecnologia Lognetz IT, com sede em Santa Catarina.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
