import React from 'react';
import { Bell, Search, LogOut, User, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  user: any;
  isDark: boolean;
  toggleTheme: () => void; 
}

// 1. Desestruturamos as props corretamente aqui
const Topbar = ({ user, isDark, toggleTheme }: TopbarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('@ChamaFrete:token');
    localStorage.removeItem('@ChamaFrete:user');
    window.location.href = '/login';
  };

  const role = user.role?.toUpperCase();
  const isAdmin = role === 'ADMIN';
  const isDriver = role === 'DRIVER';
  const roleLabel = isAdmin ? 'Administrador' : (isDriver ? 'Motorista' : 'Parceiro Corporativo');

  return (
    <header className="h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors">
      
      {/* LADO ESQUERDO: STATUS */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
              Terminal Ativo
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h2 className="text-[11px] font-black uppercase text-slate-900 dark:text-white tracking-tighter flex items-center gap-1">
            Eixo <span className="text-orange-500 italic">{roleLabel}</span>
            {(user.is_verified || isAdmin) && (
              <ShieldCheck size={13} className="text-blue-600 dark:text-blue-400 ml-0.5" fill="currentColor" fillOpacity={0.1} />
            )}
          </h2>
        </div>
      </div>

      {/* LADO DIREITO: BUSCA, AÇÕES E PERFIL */}
      <div className="flex items-center gap-3 md:gap-6">
        
        {/* BUSCA RÁPIDA */}
        <div className="hidden xl:flex items-center bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 rounded-xl px-4 py-2 group focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
          <Search size={15} className="text-slate-400 group-focus-within:text-orange-500" />
          <input 
            type="text" 
            placeholder="PROCURAR CARGAS..." 
            className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase tracking-widest ml-2 w-40 placeholder:text-slate-400 text-slate-900 dark:text-white outline-none"
          />
        </div>

        {/* GRUPO DE AÇÕES */}
        <div className="flex items-center gap-1">
          {/* BOTÃO DARK MODE */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 text-slate-500 dark:text-yellow-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center justify-center"
            title={isDark ? "Modo Claro" : "Modo Escuro"}
          >
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* NOTIFICAÇÕES */}
          <button className="relative p-2.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all">
            <Bell size={19} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-600 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>

          {/* SAIR */}
          <button 
            onClick={handleLogout}
            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all md:flex hidden"
            title="Sair"
          >
            <LogOut size={19} />
          </button>
        </div>

        {/* DIVISOR */}
        <div className="h-8 w-px bg-slate-200/60 dark:bg-slate-800 hidden md:block"></div>

        {/* PERFIL */}
        <div 
          className="flex items-center gap-3 group cursor-pointer" 
          onClick={() => navigate('/dashboard/profile')}
        >
          <div className="text-right hidden lg:block">
            <p className="text-[11px] font-black uppercase italic leading-tight text-slate-900 dark:text-white group-hover:text-orange-600 transition-colors">
              {user.name?.split(' ')[0]}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
              Conta Ativa
            </p>
          </div>
          
          <div className="relative">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-slate-900 border-2 border-white dark:border-slate-800 group-hover:border-orange-500 transition-all overflow-hidden shadow-sm flex items-center justify-center">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${user.name}&background=0f172a&color=fff`;
                  }}
                />
              ) : (
                <User size={20} className="text-white/20" />
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;