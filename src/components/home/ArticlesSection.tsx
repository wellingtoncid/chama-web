import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';

export default function ArticlesSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 blur-[150px] rounded-full -translate-y-1/3 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full translate-y-1/3 -translate-x-1/4" />

      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-full mb-8">
            <BookOpen size={16} className="text-orange-500" />
            <span className="text-xs font-black uppercase tracking-widest text-orange-400">Conteúdo</span>
          </div>

          <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.85] mb-6">
            Artigos & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Notícias</span>
          </h2>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 font-medium">
            Dicas, guias e novidades do mundo do transporte e logística. Conteúdo relevante para motoristas e empresas.
          </p>

          <Link
            to="/artigos"
            className="inline-flex items-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40"
          >
            Acessar Artigos
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
