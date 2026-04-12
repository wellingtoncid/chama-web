import React, { useState, useEffect } from 'react';
import { Heart, X, Lock, ChevronRight, ShieldCheck, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import { AdImage } from '../AdImage';

interface FreightCardProps {
  data: {
    id: number;
    slug?: string;
    product?: string;
    price?: string | number;
    origin_city?: string;
    origin_state?: string;
    dest_city?: string;
    dest_state?: string;
    vehicle_type?: string;
    body_type?: string;
    company_name?: string;
    user_name?: string;
    avatar_url?: string;
    user_is_verified?: number;
    verified_until?: string;
    is_favorite?: boolean | string | number;
    is_featured?: number;
  };
  aba?: string;
  onToggle?: () => void;
  onView?: () => void;
  disabled?: boolean;
}

export default function FreightCard({ data, aba, onToggle, onView, disabled }: FreightCardProps) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Call onView when component mounts (item enters viewport)
  React.useEffect(() => {
    if (onView) {
      onView();
    }
  }, [onView]);

  if (!data) return null;

  const user = JSON.parse(localStorage.getItem('@ChamaFrete:user') || 'null');
  const isDriver = user?.role === 'driver' || !user;
  const isVerified = data.user_is_verified == 1 || (data.verified_until && new Date(data.verified_until) > new Date());

  useEffect(() => {
    const favStatus = String(data.is_favorite) === 'true' || Number(data.is_favorite) === 1;
    setIsFavorite(favStatus);
  }, [data.is_favorite]);

  const formatLocation = (city?: string, state?: string) => {
    if (!city && !state) return "N/I";
    return `${city || 'Cidade'} - ${state || 'UF'}`;
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    const original = isFavorite;
    setIsFavorite(!original);
    try {
      await api.post('/toggle-favorite', { freight_id: data.id });
      if (aba === 'favs' && onToggle) onToggle();
    } catch { 
      setIsFavorite(original); 
    }
  };

  const goToDetails = () => {
    if (disabled) return;
    const identifier = data.slug || data.id;
    if (identifier) {
      navigate(`/frete/${identifier}`);
    }
  };

  const formatCurrency = (val: string | number | undefined) => {
    const num = parseFloat(String(val));
    if (isNaN(num) || num <= 0) return "A COMBINAR";
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const companyDisplayName = data.company_name || data.user_name || 'Anunciante';
  const hasAvatar = !!data.avatar_url;

  return (
    <>
      <div
        onClick={goToDetails}
        className={`bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-all hover:shadow-lg cursor-pointer font-sans flex flex-col h-[420px] ${disabled ? 'opacity-70' : ''}`}
      >
        {/* IMAGEM - EXATAMENTE h-52 */}
        <div className="h-52 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden flex-shrink-0">
          {hasAvatar ? (
            <AdImage 
              url={data.avatar_url!} 
              className="w-full h-full object-cover"
              alt={companyDisplayName}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
              <span className="text-white/30 text-8xl font-black uppercase italic">
                {companyDisplayName.charAt(0)}
              </span>
            </div>
          )}

          <div className="absolute top-3 left-3 z-10">
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold backdrop-blur-sm ${
              disabled ? 'bg-slate-500/90 text-white' : 'bg-green-500/90 text-white'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${disabled ? 'bg-white/50' : 'bg-white animate-pulse'}`}></span>
              {disabled ? 'FINALIZADO' : 'DISPONÍVEL'}
            </span>
          </div>

          {!disabled && isDriver && (
            <button 
              onClick={toggleFavorite}
              className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-sm transition-all z-10 ${
                isFavorite ? 'bg-red-500/90 text-white' : 'bg-white/80 text-slate-600 hover:text-red-500'
              }`}
            >
              <Heart size={14} fill={isFavorite ? "white" : "none"} />
            </button>
          )}

          {data.is_featured === 1 && (
            <div className="absolute top-3 right-14 bg-orange-500/90 text-white text-[9px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm z-10">
              DESTAQUE
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-10">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black uppercase text-white tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {companyDisplayName}
              </span>
              {isVerified && (
                <ShieldCheck size={16} className="text-emerald-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" fill="currentColor" />
              )}
            </div>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-snug mb-1 flex-grow uppercase">
            {data.product || 'CARGA GERAL'}
          </h3>

          {(data.vehicle_type || data.body_type) && (
            <p className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 mb-1">
              {data.vehicle_type && `🚚 ${data.vehicle_type}`}
              {data.vehicle_type && data.body_type && ' / '}
              {data.body_type && data.body_type}
            </p>
          )}

          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mb-3">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate font-bold uppercase">{formatLocation(data.origin_city, data.origin_state)} → {formatLocation(data.dest_city, data.dest_state)}</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700 mt-auto">
            <div>
              <p className="text-[8px] font-bold uppercase text-slate-400 tracking-wide">Pagamento</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrency(data.price)}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl font-bold text-[10px] uppercase transition-all">
              VER <ChevronRight size={14} strokeWidth={2.5} />
            </div>
          </div>
        </div>
      </div>

      {showLoginModal && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center relative shadow-xl border border-slate-200 dark:border-slate-700">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
              <X size={20} />
            </button>
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Lock size={28} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">ACESSO RESTRITO</h2>
            <p className="text-slate-500 text-sm mb-6">
              Faça login para salvar fretes favoritos.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
            >
              ENTRAR AGORA
            </button>
          </div>
        </div>
      )}
    </>
  );
}
