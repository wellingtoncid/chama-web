import React, { useState, useEffect } from 'react';
import { Search, Filter, Tag, MapPin, ChevronRight, Info } from 'lucide-react';
import { api } from '../../api/api';

const MarketplaceExplorer = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');

  useEffect(() => {
    const loadMarketplace = async () => {
      try {
        setLoading(true);
        const response = await api.get(`?endpoint=get-all-listings&category=${filter !== 'todos' ? filter : ''}`);
        setListings(response.data || []);
      } catch (error) {
        console.error("Erro ao carregar vitrine", error);
      } finally {
        setLoading(false);
      }
    };
    loadMarketplace();
  }, [filter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Barra de Busca e Filtros */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="O que você está procurando hoje?" 
            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 ring-blue-500/10 font-medium text-sm"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['todos', 'veiculos', 'pecas', 'servicos'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                filter === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.map((item: any) => (
          <div 
            key={item.id} 
            className={`bg-white rounded-[2rem] overflow-hidden border transition-all hover:shadow-2xl group cursor-pointer ${
              item.is_featured ? 'border-orange-200 ring-2 ring-orange-100' : 'border-slate-100'
            }`}
          >
            {/* Imagem com Badge de Destaque */}
            <div className="h-48 bg-slate-100 relative overflow-hidden">
              <img 
                src={item.main_image ? `https://sua-api.com.br/${item.main_image}` : '/placeholder.jpg'} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {item.is_featured && (
                <div className="absolute top-4 right-4 bg-orange-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase italic shadow-lg">
                  Destaque
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-lg font-bold">
                {item.item_condition}
              </div>
            </div>

            {/* Conteúdo */}
            <div className="p-5">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">{item.category}</span>
                <div className="flex items-center gap-1 text-slate-400 text-[9px] font-bold">
                  <MapPin size={10} /> {item.location_state}
                </div>
              </div>
              
              <h3 className="font-black text-slate-800 uppercase italic leading-tight mb-4 line-clamp-2">
                {item.title}
              </h3>

              <div className="flex items-end justify-between border-t border-slate-50 pt-4">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase leading-none">Preço à vista</p>
                  <p className="text-xl font-[1000] text-slate-900 italic tracking-tighter">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                  </p>
                </div>
                <button className="p-3 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketplaceExplorer;