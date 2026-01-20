import React, { useEffect, useState } from 'react';
import { api } from '../../api/api';
import { ShoppingBag, Eye, MousePointer2, Megaphone } from 'lucide-react';

export default function PartnerView() {
  const [myAds, setMyAds] = useState([]);
  const user = JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}');

  useEffect(() => {
    // Busca anúncios filtrados pelo ID do Parceiro
    api.get(`ads?user_id=${user.id}`).then(res => setMyAds(res.data));
  }, []);

  return (
    <div className="space-y-8">
      {/* Resumo de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Anúncios Ativos</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{myAds.length}</p>
          </div>
          <Megaphone className="text-blue-500" size={32} />
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Visualizações</p>
            <p className="text-3xl font-black text-slate-900 mt-1">
              {myAds.reduce((acc, ad) => acc + (ad.views_count || 0), 0)}
            </p>
          </div>
          <Eye className="text-purple-500" size={32} />
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Interessados (Cliques)</p>
            <p className="text-3xl font-black text-green-600 mt-1">
              {myAds.reduce((acc, ad) => acc + (ad.clicks_count || 0), 0)}
            </p>
          </div>
          <MousePointer2 className="text-green-500" size={32} />
        </div>
      </div>

      {/* Lista de Anúncios de Peças/Serviços */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <h3 className="font-black text-slate-800 uppercase text-sm mb-6 tracking-widest">Meus Anúncios Publicitários</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myAds.map((ad: any) => (
            <div key={ad.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-800 uppercase">{ad.title}</p>
                <p className="text-[10px] text-slate-500">{ad.category} • {ad.location_city}</p>
              </div>
              <div className="text-right">
                <span className="text-green-600 font-black text-lg">{ad.clicks_count}</span>
                <p className="text-[8px] text-slate-400 uppercase font-black">Cliques</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}