import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, MapPin, Phone, Package, Truck, Star } from 'lucide-react';
import { api } from '../api/api';

const CompanyProfile = () => {
  const { companyId } = useParams(); // Pega o ID da URL
  const [company, setCompany] = useState<any>(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Busca dados da empresa e seus anúncios ativos
    api.get('', { params: { endpoint: 'public_profile', id: companyId } })
       .then(res => {
         setCompany(res.data.user);
         setItems(res.data.ads);
       });
  }, [companyId]);

  if (!company) return <div className="p-20 text-center font-black uppercase italic">Carregando Perfil...</div>;

  const RatingSystem = ({ targetId }: { targetId: number }) => {
  const user = JSON.parse(localStorage.getItem('@ChamaFrete:user') || 'null');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const submitReview = async () => {
    if (!user) {
      alert("Você precisa estar logado para avaliar!");
      return;
    }
    
    await api.post('', {
      endpoint: 'submit_review',
      reviewer_id: user.id,
      target_id: targetId,
      rating: rating,
      comment: comment
    });
    alert("Avaliação enviada!");
  };

  return (
    <div className="mt-10 bg-white p-8 rounded-[2rem] border border-slate-100">
      <h3 className="text-lg font-black uppercase italic mb-6">Deixe sua <span className="text-blue-600">Avaliação</span></h3>
      
      {!user ? (
        <p className="text-slate-400 text-sm font-bold uppercase">Faça login para avaliar este perfil.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            {[1,2,3,4,5].map(star => (
              <Star 
                key={star} 
                size={24} 
                onClick={() => setRating(star)}
                className={`cursor-pointer ${rating >= star ? 'text-amber-500' : 'text-slate-200'}`}
                fill={rating >= star ? 'currentColor' : 'none'}
              />
            ))}
          </div>
          <textarea 
            className="w-full bg-slate-50 rounded-xl p-4 text-sm font-bold outline-none" 
            placeholder="Como foi sua experiência com esta empresa/motorista?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button onClick={submitReview} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">
            Enviar Avaliação
          </button>
        </div>
      )}
    </div>
  );
};

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER DO PERFIL */}
      <div className="bg-slate-900 text-white pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-white rounded-[2.5rem] p-4 shadow-2xl flex items-center justify-center overflow-hidden">
            {company.logo ? <img src={company.logo} alt="Logo" /> : <Truck size={48} className="text-slate-200" />}
          </div>
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <h1 className="text-4xl font-[900] uppercase italic tracking-tighter">{company.name}</h1>
              {company.is_verified && <CheckCircle2 className="text-blue-500" fill="currentColor" />}
            </div>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest flex items-center justify-center md:justify-start gap-2">
              <Star size={14} className="text-amber-500" fill="currentColor" /> Empresa Parceira Chama Frete
            </p>
          </div>
        </div>
      </div>

      {/* LISTA DE ANÚNCIOS DA EMPRESA */}
      <div className="max-w-5xl mx-auto px-4 -mt-10 pb-20">
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-100">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-8 border-b pb-4">
            Anúncios <span className="text-blue-600">Ativos</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item: any) => (
              <div key={item.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-blue-200 transition-all">
                <p className="text-[10px] font-black text-blue-600 uppercase mb-1">{item.product}</p>
                <h3 className="font-black text-slate-900 uppercase italic">
                   {item.origin} {item.destination && `→ ${item.destination}`}
                </h3>
                <div className="mt-4 flex justify-between items-center">
                   <span className="text-green-600 font-black italic">R$ {item.price}</span>
                   <button className="text-[10px] font-black uppercase bg-slate-900 text-white px-4 py-2 rounded-lg">Ver Detalhes</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;