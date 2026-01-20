import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MessageCircle, Globe, Instagram, Truck, 
  Building2, MapPin, CheckCircle2, ShieldCheck, 
  Loader2, ArrowLeft, Package, MapPinned, 
  Calendar, ChevronRight, AlertCircle
} from 'lucide-react';
import { api } from '../../api/api';

export default function ProfileView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFullData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Busca Perfil Público
      const res = await api.get('', { 
        params: { endpoint: 'get-public-profile', slug: slug } 
      });
      
      if (res.data) {
        const data = res.data;
        
        // Parsing dos dados extras salvos pelo editor
        let parsedDetails = {};
        if (data.private_data) {
          try {
            parsedDetails = typeof data.private_data === 'string' 
              ? JSON.parse(data.private_data) 
              : data.private_data;
          } catch (e) {
            console.error("Erro ao processar private_data", e);
          }
        }
        
        const fullProfile = {
          ...data,
          details: parsedDetails
        };

        setProfile(fullProfile);

        // 2. Busca Fretes usando o ID real do banco (user_id ou id)
        // Note: No seu index.php o endpoint é 'get-user-posts'
        const postsRes = await api.get('', { 
          params: { 
            endpoint: 'get-user-posts', 
            user_id: data.user_id || data.id 
          } 
        });
        
        setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
      }
    } catch (e) {
      console.error("Erro ao carregar vitrine:", e);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchFullData();
  }, [fetchFullData]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="font-black uppercase italic text-[10px] tracking-[0.3em] text-slate-400">Carregando Vitrine...</p>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-slate-50 text-center">
      <AlertCircle size={64} className="text-slate-200 mb-6" />
      <h1 className="text-2xl font-black text-slate-900 uppercase italic">Perfil não encontrado</h1>
      <button onClick={() => navigate('/')} className="mt-4 bg-slate-900 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px]">Voltar ao Início</button>
    </div>
  );

  const d = profile.details || {}; 
  const isCompany = profile.role?.toLowerCase() === 'company';

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 overflow-x-hidden">
      
      {/* BANNER */}
      <div className="h-60 md:h-[400px] w-full relative bg-slate-900">
        {d.banner_url ? (
          <img src={d.banner_url} alt="Banner" className="w-full h-full object-cover opacity-50" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900 opacity-80" />
        )}
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 z-20 bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white hover:bg-white/40 transition-all">
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* CARD PRINCIPAL */}
        <div className="relative -mt-24 md:-mt-40 bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden z-10">
          <div className="p-6 md:p-12">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
              
              {/* AVATAR / LOGO */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-[2rem] md:rounded-[3rem] shadow-xl p-1.5 border-4 border-white overflow-hidden">
                  {d.avatar_url ? (
                    <img src={d.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-[1.8rem] md:rounded-[2.8rem]" />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                      {isCompany ? <Building2 size={60} /> : <Truck size={60} />}
                    </div>
                  )}
                </div>
              </div>

              {/* INFO TEXTS */}
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 size={12} /> Verificado
                  </span>
                  {d.anos_experiencia && (
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={12} /> {d.anos_experiencia} ANOS
                    </span>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic leading-none tracking-tighter">
                  {d.razao_social || profile.company_name || profile.name}
                </h1>

                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                  <span className="flex items-center gap-2 text-blue-600"><MapPinned size={14} /> {d.cidades_atendidas || 'Brasil'}</span>
                  <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-slate-300" /> Identidade Validada</span>
                </div>
              </div>

              {/* BOTÃO WHATSAPP - Corrigido para d.whatsapp_comercial */}
              {(d.whatsapp_comercial || profile.whatsapp) && (
                <button 
                  onClick={() => window.open(`https://wa.me/55${(d.whatsapp_comercial || profile.whatsapp).replace(/\D/g, '')}`, '_blank')}
                  className="w-full md:w-auto bg-emerald-500 hover:bg-slate-900 text-white px-8 py-5 rounded-3xl font-black uppercase italic transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-100 active:scale-95"
                >
                  <MessageCircle size={24} />
                  <div className="text-left leading-tight">
                    <p className="text-[9px] opacity-70 not-italic uppercase tracking-widest">Negociar Agora</p>
                    <p className="text-lg">WhatsApp</p>
                  </div>
                </button>
              )}
            </div>

            {/* BIO E DETALHES */}
            <div className="mt-12 pt-12 border-t border-slate-50 grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-slate-900 font-black uppercase italic text-xs tracking-widest flex items-center gap-2">
                  <Package size={16} className="text-blue-600" /> Apresentação
                </h3>
                <p className="text-slate-600 text-lg font-medium leading-relaxed italic whitespace-pre-line">
                  "{d.descricao_negocio || profile.bio || 'Especialista em transporte e logística, focado em segurança e agilidade.'}"
                </p>
              </div>

              <div className="space-y-6 bg-slate-50 p-8 rounded-[2rem]">
                <h3 className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Ficha Técnica</h3>
                <div className="space-y-4">
                  <InfoItem label={isCompany ? "CNPJ" : "Tipo de Veículo"} value={isCompany ? d.cnpj : d.veiculo_modelo} />
                  {d.veiculo_placa && <InfoItem label="Placa / Identificação" value={d.veiculo_placa} />}
                  {profile.role && <InfoItem label="Categoria" value={profile.role} />}
                </div>
                
                <div className="flex gap-2 pt-4">
                  {d.instagram && (
                    <a href={`https://instagram.com/${d.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="flex-1 bg-white p-4 rounded-xl flex justify-center text-pink-500 shadow-sm hover:shadow-md transition-all">
                      <Instagram size={20}/>
                    </a>
                  )}
                  {d.website && (
                    <a href={d.website.startsWith('http') ? d.website : `https://${d.website}`} target="_blank" rel="noreferrer" className="flex-1 bg-white p-4 rounded-xl flex justify-center text-blue-500 shadow-sm hover:shadow-md transition-all">
                      <Globe size={20}/>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LISTAGEM DE FRETES - Colunas ajustadas para 'product', 'origin', 'destination' */}
        <div className="mt-16 space-y-8 px-2">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black uppercase italic text-slate-900 whitespace-nowrap">Cargas Publicadas</h2>
            <div className="h-px w-full bg-slate-200" />
          </div>

          {posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post: any) => (
                <div key={post.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                   <div className="flex items-center justify-between mb-4">
                      <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Truck size={20} />
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase italic tracking-widest">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                   </div>
                   
                   <h4 className="font-black text-slate-800 uppercase italic text-sm mb-3 line-clamp-2">
                     {post.product || 'Frete Disponível'}
                   </h4>
                   
                   <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 mb-6 uppercase">
                      <MapPin size={12} className="text-orange-500" /> 
                      {post.origin} <ChevronRight size={10}/> {post.destination}
                   </div>
                   
                   <button 
                    onClick={() => navigate(`/frete/${post.id}`)} 
                    className="w-full py-3 bg-slate-50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-colors"
                   >
                    Ver Detalhes
                   </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-16 rounded-[3rem] text-center border-2 border-dashed border-slate-100">
               <Package size={40} className="mx-auto text-slate-200 mb-4" />
               <p className="font-black text-slate-300 uppercase text-[10px] tracking-widest">Nenhuma carga ativa no momento</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="group">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="font-black text-slate-800 uppercase italic text-sm">{value || '---'}</p>
    </div>
  );
}