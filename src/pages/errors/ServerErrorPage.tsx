import { Link } from 'react-router-dom';
import { RefreshCw, Home } from 'lucide-react';

export default function ServerErrorPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-[10rem] font-black text-red-500 leading-none">500</h1>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Erro interno do servidor
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Algo deu errado. Nossa equipe já foi notificada e está trabalhando na correção.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
          >
            <RefreshCw size={18} />
            Tentar novamente
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Home size={18} />
            Ir para o início
          </Link>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500">
          Se o problema persistir, entre em contato pelo{' '}
          <a href="mailto:suporte@chamafrete.com.br" className="text-orange-500 hover:underline">
            suporte@chamafrete.com.br
          </a>
        </p>
      </div>
    </div>
  );
}
