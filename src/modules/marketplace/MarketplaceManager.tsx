import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, MapPin, Trash2, Edit3, Loader2 } from 'lucide-react';
import { api } from '../../api/api';
import NewListingModal from './NewListingModal';

const MarketplaceManager = ({ user }: { user: any }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Função para carregar itens (isolada para poder ser chamada após criar um novo)
  const fetchMyItems = async () => {
    try {
      setLoading(true);
      const response = await api.get(`?endpoint=get-my-listings&user_id=${user.id}`);
      setItems(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar seus anúncios", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyItems();
  }, [user.id]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header com Ações */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-[1000] text-slate-800 tracking-tighter uppercase italic leading-none">
            Classificados
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            Gerencie seus itens à venda no ecossistema
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 active:scale-95"
        >
          <Plus size={18} /> Vender Novo Item
        </button>
      </div>

      {/* Grid de Itens */}
      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-emerald-600" size={40} />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="text-slate-300" size={32} />
          </div>
          <h3 className="text-xl font-black uppercase italic text-slate-400">Nenhum item anunciado</h3>
          <p className="text-slate-400 text-sm mt-2">Que tal desapegar de algo relacionado a transporte e logística?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item: any) => (
            <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm group hover:shadow-xl transition-all">
              <div className="h-48 bg-slate-200 relative">
                <img 
                  src={item.main_image ? `https://sua-api.com.br/${item.main_image}` : '/placeholder-item.jpg'} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                  alt={item.title} 
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-600 shadow-sm">
                   {item.item_condition}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.category}</span>
                  <span className="text-lg font-[1000] text-emerald-600">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                  </span>
                </div>
                <h4 className="font-black text-slate-800 uppercase italic truncate text-lg">{item.title}</h4>
                
                <div className="flex items-center gap-2 text-slate-400 mt-4 text-[10px] font-bold">
                  <MapPin size={12} className="text-emerald-500" /> {item.location_city}, {item.location_state}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-6">
                  <button className="flex items-center justify-center gap-2 p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all font-bold text-[10px] uppercase">
                    <Edit3 size={14} /> Editar
                  </button>
                  <button className="flex items-center justify-center gap-2 p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all font-bold text-[10px] uppercase">
                    <Trash2 size={14} /> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro */}
      <NewListingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        user={user} 
        onRefresh={fetchMyItems} 
      />
    </div>
  );
};

export default MarketplaceManager;