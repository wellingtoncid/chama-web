import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, ArrowRight } from 'lucide-react';
import { AdImage } from '../AdImage';

interface GroupCardProps {
  group: {
    id: number;
    region_name: string;
    image_url?: string;
    category_name: string;
    category_color?: string;
    is_premium: number;
    is_verified: number;
    status: string;
    is_public: number;
    members_count?: number;
  };
  onClick?: () => void;
  onView?: () => void;
  className?: string;
}

export default function GroupCard({ group, onClick, onView, className = '' }: GroupCardProps) {
  const navigate = useNavigate();
  const isPremium = group.is_premium === 1;
  const isActive = group.status === 'active';
  const isPublic = group.is_public === 1;

  const handleClick = () => {
    if (!isActive) return;
    if (onClick) {
      onClick();
    } else {
      navigate(`/grupo/${group.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-all hover:shadow-lg cursor-pointer font-sans flex flex-col h-[420px] ${!isActive ? 'opacity-70' : ''} ${className}`}
    >
      {/* Imagem */}
      <div className="h-52 bg-slate-100 dark:bg-slate-700 relative overflow-hidden flex-shrink-0">
        {group.image_url ? (
          <AdImage url={group.image_url} className="w-full h-full object-cover" alt={group.region_name} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-700">
            <Users size={56} className="text-white/20 mb-2" />
            <span className="text-white/30 text-5xl font-black uppercase italic">
              {group.region_name?.charAt(0) || 'G'}
            </span>
          </div>
        )}

        {isPremium && (
          <div className="absolute top-3 left-3 bg-indigo-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <TrendingUp size={10} /> PREMIUM
          </div>
        )}

        {group.is_verified === 1 && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-md">
            ✓ VERIFICADO
          </div>
        )}

        {!isActive && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-amber-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full">
              INDISPONÍVEL
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: group.category_color || '#6366f1' }}
          >
            {group.category_name || 'GERAL'}
          </span>
        </div>

        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-snug mb-2 flex-grow uppercase">
          {group.region_name}
        </h3>

        <div className="mb-2">
          {isPublic ? (
            <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-2 py-1 rounded-full uppercase">
              Acesso Livre
            </span>
          ) : (
            <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-1 rounded-full uppercase">
              Requer Cadastro
            </span>
          )}
        </div>

        {group.members_count && (
          <div className="flex items-center gap-1.5 mb-3">
            <Users size={12} className="text-indigo-500" />
            <span className="text-[10px] text-slate-500">
              {group.members_count.toLocaleString('pt-BR')} membros
            </span>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 dark:border-slate-700 mt-auto">
          <div className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 transition-all">
            ENTRAR NO GRUPO <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}
