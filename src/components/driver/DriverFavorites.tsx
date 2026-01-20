import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { Heart, Truck, MapPin, Calendar, ArrowRight, Ghost } from 'lucide-react';

export default function DriverFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.get('', { params: { endpoint: 'my-favorites' } });
      setFavorites(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id: number) => {
    const formData = new FormData();
    formData.append('freight_id', id.toString());
    await api.post('', formData, { params: { endpoint: 'toggle-favorite' } });
    loadFavorites(); // Recarrega a lista
  };

  useEffect(() => { loadFavorites(); }, []);

  if (loading) return <div className="p-20 text-center animate-pulse font-black uppercase italic text-slate-400">Buscando seus favoritos...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-red-100 text-red-500 p-3 rounded-2xl shadow-sm">
          <Heart size={24} fill="currentColor" />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase italic text-slate-800">Cargas Salvas</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Suas cargas favoritas para contato rápido</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-20 border border-dashed border-slate-200 flex flex-col items-center text-center">
          <Ghost size={48} className="text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold uppercase italic text-xs">Nenhum favorito por aqui ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((f: any) => (
            <div key={f.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <button 
                onClick={() => removeFavorite(f.id)}
                className="absolute top-6 right-6 text-red-500 hover:scale-110 transition-transform"
              >
                <Heart size={20} fill="currentColor" />
              </button>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <Truck size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-orange-500 uppercase tracking-tighter">Disponível em {f.origin}</p>
                  <p className="font-black text-slate-800 uppercase italic text-sm">{f.product}</p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl mb-4">
                <div className="text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Origem</p>
                  <p className="font-black text-slate-700 text-[11px] uppercase">{f.origin}</p>
                </div>
                <ArrowRight size={14} className="text-slate-300" />
                <div className="text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase">Destino</p>
                  <p className="font-black text-slate-700 text-[11px] uppercase">{f.destination}</p>
                </div>
              </div>

              <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-500 transition-all">
                Ver Detalhes e Contato
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}