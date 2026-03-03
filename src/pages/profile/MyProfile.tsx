import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Save, Loader2, Camera, AlertCircle, 
  Globe, MapPin, MessageCircle, Copy, ExternalLink, Image as ImageIcon,
  LayoutDashboard, User, Building2, Briefcase
} from 'lucide-react';
import { api } from '../../api/api';
import Swal from 'sweetalert2'; 

// IMPORTAÇÃO DOS COMPONENTES DE ALINHAMENTO
import DriverFields from '../../components/driver/DriverFields';
import CompanyFields from '../../components/company/CompanyFields';

interface MyProfileProps {
  user: any;
  refreshUser: () => Promise<void>; 
}

const MyProfile = ({ user, refreshUser }: MyProfileProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
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
        whatsapp: user.whatsapp || extras.whatsapp || user.phone || '',
        city: user.city || '',
        state: user.state || '',
        slug: user.slug || '',
        document: user.document || user.document_number || '',
        // Garante que campos de motorista existam para o DriverFields não quebrar
        vehicle_type: user.vehicle_type || extras.vehicle_type || '',
        body_type: user.body_type || extras.body_type || '',
        trade_name: user.trade_name || user.name || ''
      });
      
      if (user.avatar_url) setAvatarPreview(user.avatar_url);
      if (user.cover_url) setCoverPreview(user.cover_url);
    }
  }, [user]);

  const role = user.role?.toLowerCase();
  const isDriver = role === 'driver' || role === 'motorista';
  const isCompany = ['company', 'shipper', 'transportadora', 'logistics', 'advertiser'].includes(role);

  const themeClasses = isDriver ? {
    bg: 'bg-orange-600', text: 'text-orange-600', border: 'border-orange-100', 
    light: 'bg-orange-50 dark:bg-orange-500/5', hover: 'hover:bg-orange-700', shadow: 'shadow-orange-500/20'
  } : {
    bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-100', 
    light: 'bg-blue-50 dark:bg-blue-500/5', hover: 'hover:bg-blue-700', shadow: 'shadow-blue-500/20'
  };

  const calculateLiveScore = () => {
      let score = 0;
      if (formData.trade_name) score += 20;
      if (formData.whatsapp) score += 20;
      if (avatarPreview) score += 20;
      if (formData.city) score += 20;
      if (formData.bio && formData.bio.length > 10) score += 20;
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
        type === 'avatar' ? setAvatarPreview(reader.result as string) : setCoverPreview(reader.result as string);
        type === 'avatar' ? setAvatarFile(file) : setCoverFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      
      // Campos que vão para extended_attributes
      const extendedKeys = [
        'instagram', 'website', 'website_url', 'business_type', 'commercial_email',
        'special_courses', 'intl_license', 'fleet_size', 'preferred_regions', 
        'specific_regions', 'load_volume'
      ];

      const extras: any = {};
      
      Object.keys(formData).forEach(key => {
        if (extendedKeys.includes(key)) {
          extras[key] = formData[key];
        } else {
          // Campos nativos do banco (city, state, vehicle_type, body_type, etc)
          if (Array.isArray(formData[key])) {
            data.append(key, JSON.stringify(formData[key]));
          } else if (formData[key] !== null) {
            data.append(key, formData[key]);
          }
        }
      });

      data.append('extended_attributes', JSON.stringify(extras));

      if (avatarFile) data.append('avatar_file', avatarFile);
      if (coverFile) data.append('cover_file', coverFile);

      // Axios configura automaticamente Content-Type com boundary ao enviar FormData
      const response = await api.post('/update-profile', data);

      if (response.data.success) {
        localStorage.setItem('@ChamaFrete:user', JSON.stringify(response.data.user));
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
      
      {/* BARRA DE PROGRESSO */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" className="text-slate-100 dark:text-slate-800" strokeWidth="3" fill="none" />
                      <circle cx="18" cy="18" r="16" className={`${themeClasses.text} transition-all duration-1000`} strokeWidth="3" strokeDasharray={`${calculateLiveScore()}, 100`} strokeLinecap="round" fill="none" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-300">{calculateLiveScore()}%</div>
              </div>
              <div>
                  <h4 className="font-black uppercase italic text-slate-800 dark:text-white leading-tight">Força do Perfil</h4>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Complete para o Radar Smart te encontrar</p>
              </div>
          </div>
          <div className="flex items-center gap-3">
            {user.is_verified ? (
                <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 px-6 py-3 rounded-2xl flex items-center gap-2 font-black uppercase italic text-[10px] border border-emerald-100 dark:border-emerald-500/20">
                    <ShieldCheck size={16} /> Verificado
                </div>
            ) : (
                <div className="bg-amber-50 dark:bg-amber-500/10 text-amber-600 px-6 py-3 rounded-2xl flex items-center gap-2 font-black uppercase italic text-[10px] border border-amber-100 dark:border-amber-500/20">
                    <AlertCircle size={16} /> {calculateLiveScore() >= 80 ? 'Em Análise' : 'Perfil Incompleto'}
                </div>
            )}
          </div>
      </div>
      
      {/* CAPA E AVATAR */}
      <div className="relative">
        <div className={`h-64 md:h-80 w-full rounded-[3.5rem] overflow-hidden relative ${themeClasses.light} border-2 border-dashed border-slate-200 dark:border-slate-700 shadow-inner`}>
          {coverPreview ? <img src={coverPreview} className="w-full h-full object-cover" alt="Banner" /> : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 opacity-40">
               <ImageIcon size={48} />
               <p className="text-[10px] font-black uppercase mt-2">Capa do Perfil (1200x400)</p>
            </div>
          )}
          <label className="absolute top-6 right-6 bg-white dark:bg-slate-900 shadow-xl p-4 rounded-2xl cursor-pointer hover:scale-105 transition-all">
            <Camera size={20} className={themeClasses.text} />
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
          </label>
        </div>

        <div className="absolute -bottom-16 left-8 md:left-14 flex flex-col md:flex-row items-end gap-6">
          <div className="relative group/avatar">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-[3.5rem] bg-white dark:bg-slate-900 p-2 shadow-2xl">
              <div className="w-full h-full rounded-[2.8rem] overflow-hidden bg-slate-100 dark:bg-slate-800">
                {avatarPreview ? <img src={avatarPreview} className="w-full h-full object-cover" alt="Avatar" /> : (
                   <div className="w-full h-full flex items-center justify-center text-slate-300">
                      {isDriver ? <User size={48} /> : <Building2 size={48} />}
                   </div>
                )}
              </div>
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all cursor-pointer rounded-[3.5rem]">
                <Camera size={28} className="text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
              </label>
            </div>
          </div>
          <div className="mb-4 pb-2">
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
              {formData.trade_name || 'Nome não definido'}
            </h2>
            <div className="flex items-center gap-2 mt-4">
               <span className={`${themeClasses.bg} text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-full tracking-widest`}>
                 {isDriver ? 'Motorista Autônomo' : 'Empresa / Embarcador'}
               </span>
               <span className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1 ml-2">
                 <MapPin size={12} /> {formData.city || 'Cidade...'}, {formData.state || 'UF'}
               </span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-20" />

      {/* LINK DA VITRINE */}
      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${themeClasses.bg} rounded-2xl flex items-center justify-center text-white shadow-lg`}><Globe size={24} /></div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400">Sua vitrine pública:</p>
            <p className="font-bold text-slate-700 dark:text-slate-300 italic">chamafrete.com.br/perfil/{formData.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => { navigator.clipboard.writeText(`https://chamafrete.com.br/perfil/${formData.slug}`); Swal.fire({ title: 'Copiado!', timer: 800, showConfirmButton: false, toast: true, position: 'top-end' }); }} className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl text-slate-600 font-black text-[10px] uppercase border border-slate-200 flex items-center gap-2 transition-all hover:bg-slate-50"><Copy size={16} /> COPIAR</button>
            <a href={`/perfil/${formData.slug}`} target="_blank" rel="noreferrer" className={`${themeClasses.bg} px-6 py-4 rounded-2xl text-white font-black text-[10px] uppercase flex items-center gap-2 shadow-lg ${themeClasses.shadow}`}><ExternalLink size={16} /> VER VITRINE</a>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* DADOS BÁSICOS E PROFISSIONAIS (DRIVER OU COMPANY) */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-black uppercase italic text-slate-800 dark:text-white mb-10 flex items-center gap-3">
               <Briefcase size={24} className={themeClasses.text} /> Informações Profissionais
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
               <Input label={isCompany ? "Nome Fantasia" : "Nome Completo"} value={formData.trade_name} onChange={(v: string) => setFormData({...formData, trade_name: v, name: v, slug: generateSlug(v)})} />
               <Input label={isCompany ? "CNPJ" : "CPF"} value={formData.document} onChange={(v: string) => setFormData({...formData, document: v})} />
            </div>

            {/* AQUI ESTÁ O ALINHAMENTO PERFEITO: INJEÇÃO DOS CAMPOS DE BANCO */}
            {isDriver ? (
              <DriverFields formData={formData} setFormData={setFormData} />
            ) : (
              <CompanyFields formData={formData} setFormData={setFormData} />
            )}
          </div>

          {/* BIO */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-black uppercase italic mb-8 text-slate-800 dark:text-white flex items-center gap-3"><MessageCircle size={24} className={themeClasses.text} /> Apresentação / Bio</h3>
            <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border-2 border-transparent focus:border-slate-200 outline-none font-medium text-slate-700 dark:text-slate-300 min-h-[200px]" placeholder="Conte sua experiência, rotas que atende e diferenciais..." />
          </div>
        </div>

        {/* COLUNA LATERAL: CONTATOS E REDES */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-black uppercase italic mb-8 text-slate-400 tracking-widest">Localização e Contato</h3>
            <div className="space-y-6">
              <Input label="Slug da URL" value={formData.slug} onChange={(v: string) => setFormData({...formData, slug: generateSlug(v)})} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Cidade" value={formData.city} onChange={(v: string) => setFormData({...formData, city: v})} />
                <Input label="UF" value={formData.state} onChange={(v: string) => setFormData({...formData, state: v.toUpperCase()})} />
              </div>
              <div>
                <Input label="WhatsApp" value={formData.whatsapp} onChange={(v: string) => setFormData({...formData, whatsapp: v})} />
                <p className="text-[9px] text-slate-400 mt-1 ml-2">Visível apenas para usuários logados na plataforma.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
             <div className="relative z-10">
               <h3 className="text-white font-black uppercase italic mb-6">Presença Digital</h3>
               <div className="space-y-4">
                 <Input dark label="Instagram" placeholder="@seu_perfil" value={formData.instagram} onChange={(v:string) => setFormData({...formData, instagram: v})} />
                 <Input dark label="Site Oficial" placeholder="www.site.com" value={formData.website} onChange={(v:string) => setFormData({...formData, website: v})} />
               </div>
             </div>
             <LayoutDashboard className="absolute -right-10 -bottom-10 text-white/5 w-40 h-40 group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>
      </div>

      {/* FOOTER SAVE BAR STICKY */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[3rem] p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/20 sticky bottom-6 z-40">
          <div className="flex items-center gap-4 text-slate-400 px-4">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><ShieldCheck size={24} /></div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-800 dark:text-white">Dados Criptografados</p>
                <p className="text-[9px] uppercase font-bold tracking-tighter">Seu perfil está alinhado com a LGPD.</p>
              </div>
          </div>
          <button onClick={handleSave} disabled={loading} className={`${themeClasses.bg} text-white px-16 py-6 rounded-[2.5rem] font-black uppercase italic text-sm flex items-center gap-4 ${themeClasses.hover} transition-all shadow-xl ${themeClasses.shadow} disabled:opacity-50 active:scale-95`}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? "SALVANDO..." : "ATUALIZAR MEU PERFIL"}
          </button>
      </div>
    </div>
  );
};

// COMPONENTE DE INPUT REUTILIZÁVEL E CONSISTENTE
const Input = ({ label, value, onChange, placeholder, disabled, dark }: any) => (
  <div className="w-full">
    <label className={`text-[9px] font-black uppercase tracking-[0.2em] mb-3 block ml-2 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</label>
    <input 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)} 
      placeholder={placeholder} 
      disabled={disabled} 
      className={`w-full p-5 rounded-2xl border-2 border-transparent outline-none font-bold text-xs transition-all ${
        dark 
        ? 'bg-white/5 border-white/5 text-white focus:bg-white/10' 
        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} 
    />
  </div>
);

export default MyProfile;