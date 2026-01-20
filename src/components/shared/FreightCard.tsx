import React, { useState, useEffect } from 'react';
import { 
  Truck, MapPin, Heart, Building2, Package, X, 
  Phone, FileText, Lock, AlertCircle, Scale, ChevronRight
} from 'lucide-react';
import { api } from '../../api/api';

const FreightCard = ({ data, aba, onToggle, disabled }: any) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const user = JSON.parse(localStorage.getItem('@ChamaFrete:user') || 'null');
  const isDriver = user?.role === 'driver' || !user;

  // Sincroniza estado de favorito
  useEffect(() => {
    const favStatus = String(data.is_favorite) === 'true' || Number(data.is_favorite) === 1;
    setIsFavorite(favStatus);
  }, [data.is_favorite]);

  const handleActionWithAuth = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { setShowLoginModal(true); return; }
    action();
  };

  const toggleFavorite = async () => {
    const original = isFavorite;
    setIsFavorite(!original);
    try {
      await api.post('?endpoint=toggle-favorite', { 
        freight_id: data.id, 
        user_id: user.id 
      });
      if (aba === 'favs' && onToggle) onToggle();
    } catch { 
      setIsFavorite(original); 
    }
  };

  const handleContactClick = async () => {
    if (!user) { 
      setIsModalOpen(false); 
      setShowLoginModal(true); 
      return; 
    }
    
    try {
      // REGISTRA O CLIQUE/CONTATO NO BANCO
      await api.post(`?endpoint=register_click`, { 
        freight_id: data.id, 
        user_id: user.id 
      });
      
      const phone = data.whatsapp || data.phone || '';
      const message = encodeURIComponent(`Olá, vi seu anúncio de ${data.product} no Chama Frete!`);
      
      window.open(`https://wa.me/55${phone.replace(/\D/g, '')}?text=${message}`, '_blank');
      
      if (onToggle) onToggle(); 
    } catch (error) { 
      console.error("Erro ao registrar contato:", error); 
    }
  };

  const formatCurrency = (val: any) => {
    const num = parseFloat(val);
    return isNaN(num) || num <= 0 ? "A COMBINAR" : num.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  return (
    <>
      <div 
        onClick={() => !disabled && setIsModalOpen(true)}
        className={`bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm transition-all relative flex flex-col h-full group ${
          disabled ? 'opacity-80 grayscale-[0.3] cursor-default' : 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
        }`}
      >
        {/* HEADER: STATUS E FAVORITO */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Disponível agora
            </span>
          </div>
            
          {disabled ? (
            <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2 py-0.5 rounded-md">
              <AlertCircle size={10} />
              <span className="text-[8px] font-black uppercase tracking-tighter">Finalizada</span>
            </div>
          ) : (
            isDriver && (
              <button 
                onClick={(e) => handleActionWithAuth(e, toggleFavorite)}
                className={`p-2 rounded-xl transition-all ${
                  isFavorite 
                  ? 'bg-red-500 text-white shadow-lg shadow-red-100' 
                  : 'bg-slate-50 text-slate-300 hover:text-red-400 hover:bg-red-50'
                }`}
              >
                <Heart size={14} fill={isFavorite ? "white" : "none"} />
              </button>
            )
          )}
        </div>

        {/* INFO PRINCIPAL */}
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex items-center gap-1.5 text-blue-700">
            <Building2 size={14} className="shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-wider truncate">
              {data.company_name || 'Particular'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Package size={14} className="shrink-0" />
            <span className="text-[11px] font-bold truncate">{data.product || 'Carga Geral'}</span>
          </div>
        </div>

        {/* REQUISITO VEÍCULO */}
        <div className="bg-slate-50 rounded-2xl p-4 mb-5 flex items-center gap-4 border border-slate-100/50">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-orange-500 shrink-0">
            <Truck size={20} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Requisito</p>
            <p className="text-[11px] font-black text-slate-800 uppercase truncate">
              {data.vehicleType || 'Qualquer'}
            </p>
          </div>
        </div>

        {/* ROTA */}
        <div className="flex flex-col gap-3 mb-6 relative px-1">
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 border-l-2 border-dotted border-slate-200" />
          <div className="flex items-center gap-4 relative">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-50" />
            <p className="text-xs font-bold text-slate-700 truncate">{data.origin}</p>
          </div>
          <div className="flex items-center gap-4 relative">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-green-50" />
            <p className="text-xs font-bold text-slate-700 truncate">{data.destination}</p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between">
          <div>
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Valor do Frete</p>
             <p className="text-lg font-[1000] text-green-600 tracking-tighter">{formatCurrency(data.price)}</p>
          </div>
          <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
            disabled 
            ? 'bg-slate-100 text-slate-400' 
            : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg'
          }`}>
            {disabled ? 'Encerrado' : 'Detalhes'}
          </div>
        </div>
      </div>

      {/* MODAL DE DETALHES */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden relative shadow-2xl animate-in zoom-in duration-300">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-8 right-8 p-2 text-slate-300 hover:text-slate-900 transition-colors bg-slate-50 rounded-full"
            >
              <X size={24} />
            </button>
            
            <div className="p-10 md:p-14">
              <div className="flex items-center gap-5 mb-10">
                <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center border border-slate-100 shrink-0">
                  <Truck size={30} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-[1000] text-slate-900 uppercase italic tracking-tighter leading-none">Dados da Carga</h2>
                  <p className="text-blue-600 font-black uppercase text-[10px] tracking-[0.2em] mt-2">{data.company_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Rota de Entrega</p>
                  <p className="font-bold text-slate-800 text-sm uppercase flex items-center gap-3 mb-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> {data.origin}
                  </p>
                  <p className="font-bold text-slate-800 text-sm uppercase flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" /> {data.destination}
                  </p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Veículo Requisitado</p>
                  <p className="font-black text-slate-800 text-sm uppercase italic">{data.vehicleType}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase mt-1">{data.bodyType}</p>
                </div>
              </div>

              {data.description && (
                <div className="bg-blue-50/40 p-6 rounded-3xl mb-10 border border-blue-100/50">
                  <div className="flex items-center gap-2 mb-4 text-blue-600 font-black uppercase text-[10px] tracking-widest">
                    <FileText size={16} /> Observações
                  </div>
                  <p className="text-slate-600 font-bold text-sm leading-relaxed italic">
                    {data.description}
                  </p>
                </div>
              )}

              <div className="flex flex-col items-center">
                <div className="text-center mb-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pagamento Previsto</p>
                  <p className="text-4xl font-[1000] text-green-600 tracking-tighter italic">{formatCurrency(data.price)}</p>
                </div>

                <button 
                  onClick={handleContactClick} 
                  className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black uppercase italic text-xl hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all flex items-center justify-center gap-4 active:scale-95"
                >
                  {user ? <Phone size={24} /> : <Lock size={24} />}
                  {user ? 'Chamar no WhatsApp' : 'Entre para Ver Contato'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE LOGIN */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center relative animate-in zoom-in duration-200 shadow-2xl">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
              <X size={24} />
            </button>
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Lock size={40} />
            </div>
            <h2 className="text-2xl font-[1000] text-slate-900 uppercase italic mb-3 tracking-tighter">Acesso Restrito</h2>
            <p className="text-slate-500 text-sm font-bold leading-relaxed mb-10">
              Crie sua conta de motorista para visualizar dados de contato e salvar fretes favoritos.
            </p>
            <a href="/login" className="block w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-colors">
              Entrar ou Cadastrar
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default FreightCard;