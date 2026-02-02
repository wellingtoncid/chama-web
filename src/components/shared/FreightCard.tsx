import React, { useState, useEffect } from 'react';
import { 
  Truck, Heart, Building2, Package, X, 
  Lock, ChevronRight, Container 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';

const FreightCard = ({ data, aba, onToggle, disabled }: any) => {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fallback de segurança para evitar crash
  if (!data) return null;

  const user = JSON.parse(localStorage.getItem('@ChamaFrete:user') || 'null');
  // Se não tem user, permitimos ver o botão para induzir o login no clique
  const isDriver = user?.role === 'driver' || !user;

  useEffect(() => {
    const favStatus = String(data.is_favorite) === 'true' || Number(data.is_favorite) === 1;
    setIsFavorite(favStatus);
  }, [data.is_favorite]);

  const formatLocation = (city: string, state: string) => {
    if (!city && !state) return "NÃO INFORMADO";
    return `${city || 'Cidade'} - ${state || 'UF'}`.toUpperCase();
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o clique no coração abra os detalhes da carga
    
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
    
    // Prioriza o slug para rotas amigáveis, usa ID como fallback
    const identifier = data.slug || data.id;
    if (identifier) {
      navigate(`/frete/${identifier}`);
    }
  };

  const formatCurrency = (val: any) => {
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) return "A COMBINAR";
    return num.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  const companyDisplayName = data.company?.name || data.company_name || data.user?.name || 'Anunciante Particular';

  return (
    <>
      <div 
        onClick={goToDetails}
        className={`bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm transition-all relative flex flex-col h-full group ${
          disabled ? 'opacity-80 grayscale-[0.3] cursor-default' : 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
        }`}
      >
        {/* Status e Favorito */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${disabled ? 'bg-slate-300' : 'bg-green-500 animate-pulse'}`}></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {disabled ? 'Finalizado' : 'Disponível agora'}
            </span>
          </div>
            
          {!disabled && isDriver && (
            <button 
              onClick={toggleFavorite}
              className={`p-2.5 rounded-xl transition-all z-20 ${
                isFavorite 
                ? 'bg-red-500 text-white shadow-lg shadow-red-100' 
                : 'bg-slate-50 text-slate-300 hover:text-red-400 hover:bg-red-50'
              }`}
            >
              <Heart size={16} fill={isFavorite ? "white" : "none"} />
            </button>
          )}
        </div>

        {/* Empresa e Produto */}
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex items-center gap-1.5 text-blue-700">
            <Building2 size={14} className="shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-wider truncate">
              {companyDisplayName}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-800">
            <Package size={16} className="shrink-0 text-slate-400" />
            <span className="text-base font-black italic uppercase truncate">
              {data.product || 'Carga Geral'}
            </span>
          </div>
        </div>

        {/* Especificações do Veículo */}
        <div className="bg-slate-50 rounded-2xl p-4 mb-5 border border-slate-100/50 group-hover:bg-blue-50/30 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600 shrink-0 border border-slate-100">
              <Truck size={20} />
            </div>
            <div className="overflow-hidden min-w-0">
              <p className="text-[11px] font-black text-slate-800 uppercase truncate leading-tight mb-1">
                {data.vehicle_type || 'Não informado'}
              </p>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-md">
                 <Container size={10} strokeWidth={3} />
                 <p className="text-[9px] font-extrabold uppercase truncate">
                    {data.body_type || 'Diversos'}
                 </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rota (Origem/Destino) */}
        <div className="flex flex-col gap-4 mb-6 relative px-1">
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 border-l-2 border-dotted border-slate-200" />
          
          <div className="flex items-center gap-4 relative">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-50" />
            <div className="overflow-hidden min-w-0 flex-1">
                <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Origem</p>
                <p className="text-xs font-bold text-slate-700 truncate tracking-tight">
                    {formatLocation(data.origin_city, data.origin_state)}
                </p>
            </div>
          </div>

          <div className="flex items-center gap-4 relative">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-green-50" />
            <div className="overflow-hidden min-w-0 flex-1">
                <p className="text-[8px] font-black text-slate-400 uppercase leading-none mb-1">Destino</p>
                <p className="text-xs font-bold text-slate-700 truncate tracking-tight">
                    {formatLocation(data.dest_city, data.dest_state)}
                </p>
            </div>
          </div>
        </div>

        {/* Rodapé: Valor e CTA */}
        <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
          <div className="min-w-0">
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pagamento</p>
             <p className="text-xl font-[1000] text-green-600 tracking-tighter italic leading-none truncate">
                {formatCurrency(data.price)}
             </p>
          </div>
          <div className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1 shrink-0 ${
            disabled 
            ? 'bg-slate-100 text-slate-400' 
            : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg shadow-blue-200'
          }`}>
            {disabled ? 'Encerrado' : (
                <>Ver Carga <ChevronRight size={14} strokeWidth={3} /></>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Acesso Restrito */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center relative animate-in zoom-in duration-200 shadow-2xl border border-white/20">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Lock size={40} />
            </div>
            <h2 className="text-2xl font-[1000] text-slate-900 uppercase italic mb-3 tracking-tighter leading-tight">Acesso Restrito</h2>
            <p className="text-slate-500 text-sm font-bold leading-relaxed mb-8 px-4">
              Faça login para salvar seus fretes favoritos e negociar com segurança.
            </p>
            <button 
                onClick={() => navigate('/login')}
                className="block w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all active:scale-95"
            >
              Entrar Agora
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FreightCard;