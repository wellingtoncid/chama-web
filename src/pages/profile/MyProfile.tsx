import React, { useState, useEffect } from 'react';
import { 
  User, Phone, Truck, Building2, ShieldCheck, 
  Save, Loader2, Camera, UploadCloud, AlertCircle,
  Instagram, Globe, MapPin, X, Briefcase, MessageCircle,
  CheckCircle2, Copy, ExternalLink, Image as ImageIcon,
  MapPinned, Star, Tag, LayoutDashboard, ChevronRight
} from 'lucide-react';
import { api } from '../../api/api';
import DriverFields from '../../components/driver/DriverFields'; 
import CompanyFields from '../../components/company/CompanyFields';
import AdvertiserFields from '../../components/advertiser/AdvertiserFields';
import Swal from 'sweetalert2'; 

interface MyProfileProps {
  user: any;
  refreshUser: () => Promise<void>; 
}

const MyProfile = ({ user, refreshUser }: MyProfileProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
  // States para Previews e Arquivos
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const extras = user.extended_attributes ? 
        (typeof user.extended_attributes === 'string' ? JSON.parse(user.extended_attributes) : user.extended_attributes) 
        : {};

      setFormData({
        ...user,
        ...extras,
        bio: user.bio || '',
        instagram: extras.instagram || user.instagram || '',
        website: extras.website || user.website || '',
        phone: extras.phone || user.phone || user.whatsapp || '',
        city: user.city || '',
        state: user.state || '',
        slug: user.slug || '',
        cnpj: user.document || extras.cnpj || '',
        atendimento_regiao: extras.atendimento_regiao || 'Nacional'
      });
      
      if (user.avatar_url) setAvatarPreview(user.avatar_url);
      if (user.cover_url) setCoverPreview(user.cover_url);
    }
  }, [user]);

  const role = user.role?.toLowerCase();
  const isDriver = role === 'driver' || role === 'motorista';
  const isAdvertiser = role === 'advertiser';
  const isCompany = ['company', 'shipper', 'transportadora', 'logistics'].includes(role);

  const themeColor = isDriver ? 'orange' : isAdvertiser ? 'purple' : 'blue';
  const themeClasses = {
    orange: { 
      bg: 'bg-orange-600', 
      text: 'text-orange-600', 
      border: 'border-orange-100 dark:border-orange-900/30', // Borda sutil no dark
      light: 'bg-orange-50 dark:bg-orange-500/5', 
      hover: 'hover:bg-orange-700', 
      ring: 'focus:ring-orange-500/20' 
    },
    purple: { 
      bg: 'bg-purple-600', 
      text: 'text-purple-600', 
      border: 'border-purple-100 dark:border-purple-900/30', 
      light: 'bg-purple-50 dark:bg-purple-500/5', 
      hover: 'hover:bg-purple-700', 
      ring: 'focus:ring-purple-500/20' 
    },
    blue: { 
      bg: 'bg-blue-600', 
      text: 'text-blue-600', 
      border: 'border-blue-100 dark:border-blue-900/30', 
      light: 'bg-blue-50 dark:bg-blue-500/5', 
      hover: 'hover:bg-blue-700', 
      ring: 'focus:ring-blue-500/20' 
    }
  }[themeColor];

  const calculateLiveScore = () => {
      let score = 0;
      if (formData.name) score += 20;
      if (formData.whatsapp || formData.phone) score += 20;
      if (avatarPreview) score += 20;
      if (formData.city) score += 20;
      if (formData.bio && formData.bio.length > 20) score += 20;
      return score;
  };

  const generateSlug = (text: string) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").trim();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'avatar') {
          setAvatarFile(file);
          setAvatarPreview(reader.result as string);
        } else {
          setCoverFile(file);
          setCoverPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const dataToSend = new FormData();
      
      // Lista de campos para extrair do formData (evitando enviar lixo ou estados internos do React)
      const fields = [
        'name', 'slug', 'whatsapp', 'bio', 'city', 'state', 'document',
        'vehicle_type', 'body_type', 'cnpj', 'company_name', 'plate', 'antt', 
        'instagram', 'website', 'phone', 'atendimento_regiao', 'business_type'
      ];

      fields.forEach(field => {
        if (formData[field] !== undefined) {
          dataToSend.append(field, String(formData[field]));
        }
      });

      if (avatarFile) dataToSend.append('avatar_file', avatarFile);
      if (coverFile) dataToSend.append('cover_file', coverFile);

      const response = await api.post('/update-profile', dataToSend);

      if (response.data.success) {
        await refreshUser();
        Swal.fire({ icon: 'success', title: 'Perfil Atualizado!', timer: 2000, showConfirmButton: false });
      }
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Erro ao salvar', text: error.response?.data?.message || 'Erro interno' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 px-4 md:px-6">
      
      {/* 1. CARD DE STATUS E FORÇA (TOP BAR) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" className="text-slate-100 dark:text-slate-800" strokeWidth="3" fill="none" />
                      <circle 
                        cx="18" cy="18" r="16" 
                        className={`${themeClasses.text} transition-all duration-1000`} 
                        strokeWidth="3" 
                        strokeDasharray={`${calculateLiveScore()}, 100`} 
                        strokeLinecap="round" 
                        fill="none" 
                      />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-300">
                      {calculateLiveScore()}%
                  </div>
              </div>
              <div>
                  <h4 className="font-black uppercase italic text-slate-800 dark:text-white leading-tight">Força do Perfil</h4>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Atinja 80% para maior visibilidade</p>
              </div>
          </div>
          
          <div className="flex items-center gap-3">
            {user.is_verified ? (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 px-6 py-3 rounded-2xl flex items-center gap-2 font-black uppercase italic text-[10px] border border-emerald-100 dark:border-emerald-500/20">
                    <ShieldCheck size={16} /> Perfil Verificado
                </div>
            ) : (
                <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 px-6 py-3 rounded-2xl flex items-center gap-2 font-black uppercase italic text-[10px] border border-amber-100 dark:border-amber-500/20">
                    <AlertCircle size={16} /> {calculateLiveScore() >= 80 ? 'Em Análise' : 'Perfil Incompleto'}
                </div>
            )}
          </div>
      </div>
      
      {/* 2. HEADER VISUAL (CAPA E AVATAR) */}
      <div className="relative">
        <div className={`h-56 md:h-80 w-full rounded-[3.5rem] overflow-hidden relative ${themeClasses.light} dark:bg-slate-800 border-2 border-dashed ${themeClasses.border} dark:border-slate-700 shadow-inner`}>
          {coverPreview ? (
            <img src={coverPreview} className="w-full h-full object-cover" alt="Banner" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-600">
               <ImageIcon size={48} className="mb-2 opacity-20" />
               <p className="text-[10px] font-black uppercase tracking-tighter">Clique no ícone para alterar a capa</p>
            </div>
          )}
          <label className="absolute top-6 right-6 bg-white dark:bg-slate-900 shadow-xl p-4 rounded-2xl cursor-pointer hover:scale-105 transition-all">
            <Camera size={20} className={themeClasses.text} />
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
          </label>
        </div>

        {/* Avatar flutuante */}
        <div className="absolute -bottom-16 left-8 md:left-14 flex flex-col md:flex-row items-end gap-6">
          <div className="relative group/avatar">
            <div className="w-36 h-36 md:w-48 md:h-48 rounded-[3rem] bg-white dark:bg-slate-900 p-1.5 shadow-2xl">
              <div className="w-full h-full rounded-[2.6rem] overflow-hidden bg-slate-100 dark:bg-slate-800">
                {avatarPreview ? (
                   <img src={avatarPreview} className="w-full h-full object-cover" alt="Avatar" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-300">
                      {isDriver ? <Truck size={40} /> : <Building2 size={40} />}
                   </div>
                )}
              </div>
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all cursor-pointer rounded-[3rem]">
                <Camera size={28} className="text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
              </label>
            </div>
          </div>
          
          <div className="mb-4 pb-2">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
              {formData.name || 'Seu Nome'}
            </h2>
            <div className="flex items-center gap-2 mt-3">
               <span className={`${themeClasses.bg} text-white text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-widest`}>
                 {user.role}
               </span>
               <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                 <MapPin size={12} /> {formData.city || 'Cidade não informada'}
               </span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-20" />

      {/* 3. VITRINE PÚBLICA LINK */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${themeClasses.bg} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
            <Globe size={24} />
          </div>
          <div className="text-center md:text-left">
            <p className="text-[10px] font-black uppercase text-slate-400">Link da sua vitrine profissional:</p>
            <p className="font-bold text-slate-700 dark:text-slate-300 italic truncate max-w-[250px] md:max-w-none">
              chamafrete.com.br/perfil/{formData.slug}
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`https://chamafrete.com.br/perfil/${formData.slug}`);
                Swal.fire({ title: 'Copiado!', timer: 800, showConfirmButton: false, position: 'top-end', toast: true });
              }}
              className="flex-1 md:flex-none bg-white dark:bg-slate-900 p-4 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 font-black text-[10px] uppercase transition-all"
            >
              <Copy size={16} /> COPIAR
            </button>
            <a href={`/perfil/${formData.slug}`} target="_blank" rel="noreferrer" className={`${themeClasses.bg} p-4 px-8 rounded-2xl text-white ${themeClasses.hover} transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase shadow-lg shadow-blue-500/20`}>
              <ExternalLink size={16} /> ACESSAR VITRINE
            </a>
        </div>
      </div>

      {/* 4. FORMULÁRIO PRINCIPAL */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: DADOS TÉCNICOS (Componente Dinâmico) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-10 border-b border-slate-50 dark:border-slate-800 pb-6">
              <div className={`w-1.5 h-6 ${themeClasses.bg} rounded-full`} />
              <h3 className="text-xl font-black uppercase italic text-slate-800 dark:text-white">Informações Profissionais</h3>
            </div>
            
            {isDriver && <DriverFields formData={formData} setFormData={setFormData} />}
            {isCompany && <CompanyFields formData={formData} setFormData={setFormData} />}
            {isAdvertiser && <AdvertiserFields formData={formData} setFormData={setFormData} />}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-black uppercase italic mb-8 text-slate-800 dark:text-white flex items-center gap-3">
              <MessageCircle size={24} className={themeClasses.text} /> Bio e Apresentação
            </h3>
            <textarea 
              value={formData.bio || ''} 
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border-2 border-transparent focus:border-slate-200 dark:focus:border-slate-700 outline-none font-medium text-slate-700 dark:text-slate-300 min-h-[200px] transition-all"
              placeholder="Descreva sua experiência, diferenciais e o que você oferece ao mercado..."
            />
          </div>
        </div>

        {/* COLUNA DIREITA: IDENTIDADE E CONTATO */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-black uppercase italic mb-8 text-slate-400 tracking-widest">Dados de Identidade</h3>
            <div className="space-y-6">
              <Input label="Nome de Exibição" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v, slug: generateSlug(v)})} />
              <Input label="URL Personalizada" value={formData.slug} onChange={(v: string) => setFormData({...formData, slug: generateSlug(v)})} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Cidade" value={formData.city} onChange={(v: string) => setFormData({...formData, city: v})} />
                <Input label="UF" value={formData.state} onChange={(v: string) => setFormData({...formData, state: v})} />
              </div>
              <Input label="WhatsApp" value={formData.whatsapp} onChange={(v: string) => setFormData({...formData, whatsapp: v})} />
            </div>
          </div>

          <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-white font-black uppercase italic mb-6">Redes e Canais</h3>
               <div className="space-y-4">
                 <Input dark label="Instagram" placeholder="@seu.perfil" value={formData.instagram} onChange={(v:string) => setFormData({...formData, instagram: v})} />
                 <Input dark label="Site / Portfólio" placeholder="www.meusite.com" value={formData.website} onChange={(v:string) => setFormData({...formData, website: v})} />
               </div>
             </div>
             <LayoutDashboard className="absolute -right-10 -bottom-10 text-white/5 w-40 h-40" />
          </div>
        </div>
      </div>

      {/* 5. FLOATING SAVE BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-100 dark:border-slate-800 sticky bottom-6 z-40">
          <div className="flex items-center gap-4 text-slate-400 px-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-800 dark:text-white">Dados Criptografados</p>
                <p className="text-[9px] uppercase font-bold">Seu perfil segue as normas da LGPD.</p>
              </div>
          </div>
          <button 
            onClick={handleSave} 
            disabled={loading} 
            className={`${themeClasses.bg} text-white px-16 py-6 rounded-[2.5rem] font-black uppercase italic text-sm flex items-center gap-4 ${themeClasses.hover} transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 active:scale-95`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? "SALVANDO..." : "ATUALIZAR MEU PERFIL"}
          </button>
      </div>
    </div>
  );
};

// Subcomponente de Input Inteligente (Dark/Light)
const Input = ({ label, value, onChange, placeholder, disabled, dark }: any) => (
  <div className="w-full">
    <label className={`text-[9px] font-black uppercase tracking-[0.2em] mb-3 block ml-2 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
      {label}
    </label>
    <input 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full p-5 rounded-2xl border-2 border-transparent outline-none font-bold text-xs transition-all
        ${dark 
          ? 'bg-white/5 border-white/5 text-white focus:bg-white/10 focus:border-white/10' 
          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-200 dark:focus:border-slate-700'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    />
  </div>
);

export default MyProfile;