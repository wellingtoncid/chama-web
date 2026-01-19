import React, { useState, useEffect } from 'react';
import { 
  Link2, Check, AlertCircle, Truck, Building2, 
  Instagram, Globe, MessageCircle, Save, Loader2, 
  ExternalLink, Camera, MapPinned, Calendar, Info
} from 'lucide-react';
import { api } from '../../api';
import confetti from 'canvas-confetti';

interface MyProfileEditorProps {
  user: any;
}

export default function MyProfileEditor({ user }: MyProfileEditorProps) {
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<null | boolean>(null);
  
  const [extraData, setExtraData] = useState<any>({
    cnpj: user.cnpj || '',
    razao_social: user.company_name || '',
    veiculo_modelo: '',
    veiculo_placa: '',
    descricao_negocio: '',
    whatsapp_comercial: '',
    instagram: '',
    website: '',
    avatar_url: '',
    banner_url: '',
    cidades_atendidas: '',
    anos_experiencia: '',
  });

  // CARREGAMENTO DO PERFIL
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // CORREÇÃO: Chamando explicitamente o endpoint como string para evitar redirects do Apache
        // E adicionando o '/' final se necessário
        const res = await api.get('/index.php', { 
          params: { endpoint: 'get-my-profile', user_id: user.id } 
        });
        
        if (res.data) {
          if (res.data.slug) setSlug(res.data.slug);

          if (res.data.private_data) {
            const parsed = typeof res.data.private_data === 'string' 
              ? JSON.parse(res.data.private_data) 
              : res.data.private_data;
            
            setExtraData((prev: any) => ({ 
              ...prev, 
              ...parsed,
              descricao_negocio: parsed.descricao_negocio || res.data.bio || prev.descricao_negocio,
              razao_social: parsed.razao_social || res.data.company_name || prev.razao_social
            }));
          }
        }
      } catch (e) { 
        console.error("Erro ao carregar perfil:", e); 
      }
    };
    if (user?.id) loadProfile();
  }, [user.id]);

  // VALIDAÇÃO DE SLUG
  useEffect(() => {
    if (slug.length < 3) { setSlugAvailable(null); return; }
    const check = setTimeout(async () => {
      try {
        const res = await api.get('/index.php', { 
          params: { endpoint: 'check-slug', slug: slug, user_id: user.id } 
        });
        setSlugAvailable(res.data.available);
      } catch (e) { setSlugAvailable(false); }
    }, 400);
    return () => clearTimeout(check);
  }, [slug, user.id]);

  const handleSave = async () => {
    if (slugAvailable === false) return;
    setLoading(true);
    try {
      // CORREÇÃO: Enviando para o index.php explicitamente
      await api.post('/index.php', {
        user_id: user.id,
        slug: slug,
        bio: extraData.descricao_negocio,
        private_data: JSON.stringify(extraData)
      }, { params: { endpoint: 'save-profile' } });
      
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      
      const updatedUser = { ...user, slug, company_name: extraData.razao_social };
      localStorage.setItem('@ChamaFrete:user', JSON.stringify(updatedUser));
      
      alert("Vitrine Profissional atualizada!");
    } catch (e) { 
      alert("Erro ao salvar perfil."); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER DE STATUS E PREVIEW */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className={`md:col-span-2 p-6 rounded-[2.5rem] flex items-center justify-between gap-4 border shadow-xl transition-all ${slug ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
          <div className="flex items-center gap-4">
            <div className={`${slug ? 'bg-white/20' : 'bg-slate-200'} p-3 rounded-2xl`}>
              <Globe size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Link da sua Vitrine</p>
              <p className="font-bold text-sm leading-tight">
                {slug ? `chamafrete.com/p/${slug}` : 'O endereço da sua vitrine aparecerá aqui'}
              </p>
            </div>
          </div>
          {slug && (
            <a href={`/p/${slug}`} target="_blank" rel="noreferrer" className="bg-white text-blue-600 px-6 py-3 rounded-xl font-black text-xs uppercase hover:bg-orange-500 hover:text-white transition-all flex items-center gap-2">
              Ver Página <ExternalLink size={14} />
            </a>
          )}
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-4 shadow-sm">
           <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
              <Check size={24} />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-slate-400">Status</p>
              <p className="font-black text-slate-800 uppercase italic">Verificado</p>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* IDENTIDADE VISUAL */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
            <h3 className="font-black uppercase italic text-sm text-slate-800 flex items-center gap-2">
              <Camera size={18} className="text-blue-500" /> Identidade Visual
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <InputGroup label="URL da Logo / Avatar" icon={<Camera size={16}/>}>
                <input value={extraData.avatar_url} onChange={e => setExtraData({...extraData, avatar_url: e.target.value})} className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-700" placeholder="https://..." />
              </InputGroup>
              <InputGroup label="URL do Banner" icon={<Camera size={16}/>}>
                <input value={extraData.banner_url} onChange={e => setExtraData({...extraData, banner_url: e.target.value})} className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-700" placeholder="https://..." />
              </InputGroup>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Personalizar URL (Slug)</label>
              <div className={`flex items-center bg-slate-50 p-2 rounded-2xl border-2 transition-all ${slugAvailable === false ? 'border-red-100' : slugAvailable === true ? 'border-emerald-100' : 'border-slate-100'}`}>
                <span className="pl-4 text-slate-400 font-bold text-sm hidden md:block italic">chamafrete.com/p/</span>
                <input 
                  value={slug} 
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} 
                  placeholder="seu-nome-comercial" 
                  className="flex-1 bg-transparent border-none focus:ring-0 font-black text-blue-600 py-3" 
                />
                <div className="pr-4">
                  {slugAvailable === true && <div className="text-emerald-500 flex items-center gap-1 font-black text-[10px] uppercase"><Check size={14}/> Disponível</div>}
                  {slugAvailable === false && <div className="text-red-500 flex items-center gap-1 font-black text-[10px] uppercase"><AlertCircle size={14}/> Indisponível</div>}
                </div>
              </div>
            </div>
          </div>

          {/* DADOS TÉCNICOS */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 space-y-6">
            <h3 className="font-black uppercase italic text-sm text-slate-800 flex items-center gap-2">
              <Info size={18} className="text-orange-500" /> Informações Profissionais
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {user.role === 'company' ? (
                <>
                  <InputGroup label="Razão Social" icon={<Building2 size={16}/>}>
                    <input value={extraData.razao_social} onChange={e => setExtraData({...extraData, razao_social: e.target.value})} className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-700" />
                  </InputGroup>
                  <InputGroup label="CNPJ" icon={<Check size={16}/>}>
                    <input value={extraData.cnpj} onChange={e => setExtraData({...extraData, cnpj: e.target.value})} className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-700" placeholder="00.000.000/0001-00" />
                  </InputGroup>
                </>
              ) : (
                <>
                  <InputGroup label="Modelo do Veículo" icon={<Truck size={16}/>}>
                    <input value={extraData.veiculo_modelo} onChange={e => setExtraData({...extraData, veiculo_modelo: e.target.value})} className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-700" placeholder="Ex: Volvo FH 540" />
                  </InputGroup>
                  <InputGroup label="Placa" icon={<Check size={16}/>}>
                    <input value={extraData.veiculo_placa} onChange={e => setExtraData({...extraData, veiculo_placa: e.target.value})} className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-700" placeholder="ABC1D23" />
                  </InputGroup>
                </>
              )}
              <InputGroup label="Cidades Atendidas" icon={<MapPinned size={16}/>}>
                <input value={extraData.cidades_atendidas} onChange={e => setExtraData({...extraData, cidades_atendidas: e.target.value})} className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-700" placeholder="Ex: Todo Brasil" />
              </InputGroup>
              <InputGroup label="Anos de Experiência" icon={<Calendar size={16}/>}>
                <input value={extraData.anos_experiencia} onChange={e => setExtraData({...extraData, anos_experiencia: e.target.value})} className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-700" />
              </InputGroup>
              
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">Biografia / História</label>
                <textarea 
                  value={extraData.descricao_negocio} 
                  onChange={e => setExtraData({...extraData, descricao_negocio: e.target.value})} 
                  className="w-full p-6 bg-slate-50 rounded-[2rem] border-none font-medium text-slate-600 h-40 focus:ring-2 focus:ring-blue-500/10 transition-all resize-none" 
                  placeholder="Conte seus diferenciais..." 
                />
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
            <h3 className="font-black uppercase italic text-sm text-slate-800 mb-6 flex items-center gap-2">
              <MessageCircle size={18} className="text-emerald-500" /> Contatos
            </h3>
            <div className="space-y-4">
              <SocialInput label="WhatsApp" icon={<MessageCircle size={16}/>} value={extraData.whatsapp_comercial} onChange={(v: any) => setExtraData({...extraData, whatsapp_comercial: v})} />
              <SocialInput label="Instagram" icon={<Instagram size={16}/>} value={extraData.instagram} onChange={(v: any) => setExtraData({...extraData, instagram: v})} />
              <SocialInput label="Site" icon={<Globe size={16}/>} value={extraData.website} onChange={(v: any) => setExtraData({...extraData, website: v})} />
            </div>
          </div>

          <button 
            onClick={handleSave} 
            disabled={loading || !slug || slugAvailable === false} 
            className="w-full bg-slate-900 hover:bg-emerald-600 text-white py-8 rounded-[2.5rem] font-black uppercase italic shadow-2xl transition-all disabled:opacity-30 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save />}
            {loading ? 'Salvando...' : 'Atualizar Vitrine'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, icon, children }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">{label}</label>
      <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus-within:border-blue-100 focus-within:bg-white transition-all">
        <span className="text-slate-300">{icon}</span>
        {children}
      </div>
    </div>
  );
}

function SocialInput({ label, icon, value, onChange }: any) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus-within:border-emerald-100 focus-within:bg-white transition-all">
      <span className="text-slate-300">{icon}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-sm text-slate-700 placeholder:text-slate-300" />
    </div>
  );
}