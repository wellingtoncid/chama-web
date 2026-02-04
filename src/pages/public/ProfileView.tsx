import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MessageCircle, Globe, Instagram, Truck, 
  Building2, MapPin, CheckCircle2, ShieldCheck, 
  Loader2, ArrowLeft, Package, MapPinned, 
  ChevronRight, AlertCircle, ExternalLink,
  Info, Tag, LayoutGrid
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
      const res = await api.get(`/public-profile`, { params: { slug } });
      
      if (res.data?.success) {
        const data = res.data.data;
        let extraDetails = {};
        if (data.private_data) {
          try {
            extraDetails = typeof data.private_data === 'string' 
              ? JSON.parse(data.private_data) : data.private_data;
          } catch (e) { console.error(e); }
        }
        
        setProfile({ ...data, details: extraDetails });

        // Busca o conteúdo dependendo do tipo de usuário
        const endpoint = data.user_type === 'ADVERTISER' ? '/get-user-ads' : '/get-user-posts';
        const postsRes = await api.get(endpoint, { params: { user_id: data.id } });
        setPosts(Array.isArray(postsRes.data?.data) ? postsRes.data.data : []);
      }
    } catch (e) {
      console.error("Erro ao carregar vitrine:", e);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { if (slug) fetchFullData(); }, [slug, fetchFullData]);

  if (loading) return <LoadingState />;
  if (!profile) return <NotFoundState navigate={navigate} />;

  // --- LÓGICA DE DEFINIÇÃO DE TIPO ---
  const type = profile.user_type; // DRIVER, COMPANY, SHIPPER, ADVERTISER
  const isDriver = type === 'DRIVER';
  const isAdvertiser = type === 'ADVERTISER';
  const isEntity = ['COMPANY', 'SHIPPER'].includes(type);

  // Nome: Prioriza Razão Social para empresas, Nome para motoristas
  const displayTitle = (isEntity && profile.details?.razao_social) 
    ? profile.details.razao_social 
    : profile.name;

  const displaySubtitle = isDriver ? 'Motorista Autônomo' : 
                          isAdvertiser ? 'Anunciante Parceiro' : 
                          'Transportadora / Embarcador';

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* HEADER */}
      <div className="h-64 md:h-[400px] w-full relative bg-slate-900 overflow-hidden">
        {profile.cover_url ? (
          <img src={profile.cover_url} alt="Banner" className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-slate-900 to-slate-950" />
        )}
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 z-20 bg-white/10 backdrop-blur-xl p-4 rounded-2xl text-white hover:bg-orange-500 transition-all">
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* CARD PRINCIPAL */}
        <div className="relative -mt-32 bg-white rounded-[3.5rem] shadow-xl border border-slate-100 z-10 p-8 md:p-16">
          <div className="flex flex-col md:flex-row items-start gap-10">
            {/* AVATAR */}
            <div className="relative mx-auto md:mx-0">
              <div className="w-40 h-40 md:w-52 md:h-52 bg-gradient-to-tr from-orange-500 to-yellow-400 rounded-[3rem] p-1 shadow-2xl">
                <div className="w-full h-full bg-white rounded-[2.8rem] overflow-hidden flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={displayTitle} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-slate-200">
                      {isDriver ? <Truck size={80} /> : <Building2 size={80} />}
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-3 rounded-2xl shadow-lg">
                <ShieldCheck size={24} />
              </div>
            </div>

            {/* INFO */}
            <div className="flex-1 text-center md:text-left space-y-4">
               <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border border-emerald-100 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Verificado
                  </span>
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter">
                    {displaySubtitle}
                  </span>
               </div>

               <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic leading-none tracking-tighter">
                 {displayTitle}
               </h1>

               <div className="flex flex-col md:flex-row items-center gap-4 text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                  <span className="flex items-center gap-2 text-orange-600">
                    <MapPinned size={16} /> {profile.city || 'Atendimento Nacional'} - {profile.state || 'BR'}
                  </span>
               </div>
            </div>

            {/* CTA */}
            <button 
              onClick={() => window.open(`https://wa.me/55${(profile.whatsapp || '').replace(/\D/g, '')}`, '_blank')}
              className="w-full md:w-auto bg-emerald-500 hover:bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-black uppercase italic transition-all flex items-center justify-center gap-4 shadow-lg shadow-emerald-100"
            >
              <MessageCircle size={24} />
              <div className="text-left leading-tight">
                <p className="text-[9px] opacity-70 not-italic uppercase">Falar com</p>
                <p className="text-lg">WhatsApp</p>
              </div>
            </button>
          </div>

          {/* DETALHES TÉCNICOS */}
          <div className="mt-16 pt-16 border-t border-slate-50 grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-slate-900 font-black uppercase italic text-sm tracking-widest flex items-center gap-3">
                <div className="w-8 h-1 bg-orange-500 rounded-full" /> 
                {isDriver ? 'Sobre o Motorista' : isAdvertiser ? 'Sobre o Parceiro' : 'Sobre a Empresa'}
              </h3>
              <p className="text-slate-500 text-xl font-medium leading-relaxed italic">
                "{profile.bio || 'Profissional verificado pela plataforma Chama Frete.'}"
              </p>
            </div>

            <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 space-y-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center mb-4">Ficha Técnica</p>
              
              {isDriver ? (
                <>
                  <InfoItem label="Veículo" value={profile.vehicle_type} />
                  <InfoItem label="Carroceria" value={profile.body_type} />
                  <InfoItem label="Placa" value={profile.details?.veiculo_placa || '***-***'} />
                </>
              ) : (
                <>
                  <InfoItem label="Tipo" value={type === 'COMPANY' ? 'Transportadora' : isAdvertiser ? 'Anunciante' : 'Embarcador'} />
                  <InfoItem label="CNPJ/CPF" value={profile.details?.cnpj || profile.details?.cpf || 'Documentado'} />
                  <InfoItem label="Especialidade" value={profile.details?.especialidade || 'Logística'} />
                </>
              )}
              <InfoItem label="Membro desde" value={profile.created_at ? new Date(profile.created_at).getFullYear() : '---'} />
            </div>
          </div>
        </div>

        {/* SEÇÃO DINÂMICA (POSTS / ANÚNCIOS / VEÍCULOS) */}
        <div className="mt-20 space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black uppercase italic text-slate-900 tracking-tighter">
              {isDriver ? 'Especialidades' : isAdvertiser ? 'Anúncios Ativos' : 'Cargas Publicadas'}
            </h2>
            <div className="bg-white px-4 py-1 rounded-full text-[10px] font-bold text-slate-400 border border-slate-100">
              {posts.length} Itens
            </div>
          </div>

          {posts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post: any) => (
                <PostCard key={post.id} post={post} type={type} navigate={navigate} />
              ))}
            </div>
          ) : (
            <EmptyState message={isDriver ? "Nenhuma especialidade listada" : "Nenhum item ativo no momento"} />
          )}
        </div>
      </div>
    </div>
  );
}

// --- SUBCOMPONENTES ---

function PostCard({ post, type, navigate }: any) {
  const isAd = type === 'ADVERTISER';
  
  return (
    <div 
      onClick={() => navigate(isAd ? `/anuncio/${post.id}` : `/frete/${post.slug || post.id}`)}
      className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="bg-slate-50 p-3 rounded-xl text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
          {isAd ? <Tag size={20}/> : <Package size={20} />}
        </div>
        <span className="text-[10px] font-bold text-slate-300">{new Date(post.created_at).toLocaleDateString()}</span>
      </div>
      
      <h4 className="font-black text-slate-900 uppercase italic text-md mb-4 group-hover:text-orange-600">
        {post.title || post.product || 'Publicação'}
      </h4>

      {!isAd && (
        <div className="space-y-1 mb-6">
          <p className="text-[10px] font-bold text-slate-600 flex items-center gap-2 uppercase">
            <MapPin size={12} className="text-orange-500"/> {post.origin_city}
          </p>
          <div className="ml-1 h-3 w-px bg-slate-100" />
          <p className="text-[10px] font-bold text-slate-600 flex items-center gap-2 uppercase">
            <ChevronRight size={12} className="text-slate-300"/> {post.destination_city}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-50 text-[10px] font-black uppercase text-orange-500">
        Ver detalhes <ExternalLink size={14} />
      </div>
    </div>
  );
}

function InfoItem({ label, value }: any) {
  return (
    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
      <span className="text-[9px] font-black text-slate-300 uppercase">{label}</span>
      <span className="text-[11px] font-black text-slate-800 uppercase italic">{value || '---'}</span>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Carregando Perfil...</p>
    </div>
  );
}

function NotFoundState({ navigate }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center p-10 bg-slate-50">
      <div className="bg-white p-12 rounded-[3rem] text-center shadow-xl">
        <AlertCircle size={60} className="text-orange-200 mx-auto mb-4" />
        <h1 className="text-xl font-black uppercase italic">Perfil não encontrado</h1>
        <button onClick={() => navigate('/')} className="mt-6 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold uppercase text-xs">Voltar</button>
      </div>
    </div>
  );
}

function EmptyState({ message }: any) {
  return (
    <div className="bg-white p-16 rounded-[3rem] text-center border-2 border-dashed border-slate-100">
      <LayoutGrid size={40} className="text-slate-100 mx-auto mb-4" />
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{message}</p>
    </div>
  );
}