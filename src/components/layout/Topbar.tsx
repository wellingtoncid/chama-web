import React from 'react';
import { Bell, Search, LogOut, User, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  user: any;
}

const Topbar = ({ user }: TopbarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('@ChamaFrete:token');
    localStorage.removeItem('@ChamaFrete:user');
    // Forçar recarregamento para limpar estados em memória do React
    window.location.href = '/login';
  };

  // Normalização para bater com as Roles do Backend revisado
  const role = user.role?.toUpperCase();
  const isDriver = role === 'DRIVER';
  const isAdmin = role === 'ADMIN';
  
  const roleLabel = isAdmin ? 'Administrador' : (isDriver ? 'Motorista' : 'Parceiro Corporativo');

  return (
    <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
      
      {/* LADO ESQUERDO: STATUS DO SISTEMA */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
              Terminal Ativo
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <h2 className="text-[11px] font-black uppercase text-slate-900 tracking-tighter flex items-center gap-1">
            Eixo <span className="text-orange-500 italic">{roleLabel}</span>
            {(user.is_verified || isAdmin) && (
              <ShieldCheck size={13} className="text-blue-600 ml-0.5" fill="currentColor" fillOpacity={0.1} />
            )}
          </h2>
        </div>
      </div>

      {/* LADO DIREITO: BUSCA, NOTIFICAÇÕES E PERFIL */}
      <div className="flex items-center gap-3 md:gap-6">
        
        {/* BUSCA RÁPIDA (Oculta em Mobile/Tablet pequeno) */}
        <div className="hidden xl:flex items-center bg-slate-100/50 border border-slate-200/60 rounded-xl px-4 py-2 group focus-within:bg-white focus-within:border-orange-500/40 transition-all">
          <Search size={15} className="text-slate-400 group-focus-within:text-orange-500" />
          <input 
            type="text" 
            placeholder="PROCURAR CARGAS..." 
            className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase tracking-widest ml-2 w-40 placeholder:text-slate-400"
          />
        </div>

        {/* AÇÕES */}
        <div className="flex items-center gap-1">
          <button className="relative p-2.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all">
            <Bell size={19} />
            {/* Badge de Notificação (Só aparece se houver unread) */}
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-600 rounded-full border-2 border-white"></span>
          </button>

          <button 
            onClick={handleLogout}
            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all md:flex hidden"
            title="Sair"
          >
            <LogOut size={19} />
          </button>
        </div>

        {/* DIVISOR */}
        <div className="h-8 w-px bg-slate-200/60 hidden md:block"></div>

        {/* PERFIL */}
        <div 
          className="flex items-center gap-3 group cursor-pointer" 
          onClick={() => navigate('/dashboard/profile')}
        >
          <div className="text-right hidden lg:block">
            <p className="text-[11px] font-black uppercase italic leading-tight text-slate-900 group-hover:text-orange-600 transition-colors">
              {user.name?.split(' ')[0]}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
              Conta Ativa
            </p>
          </div>
          
          <div className="relative">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-slate-900 border-2 border-white group-hover:border-orange-500 transition-all overflow-hidden shadow-sm flex items-center justify-center">
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
            {/* Indicador de Status */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;