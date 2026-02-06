import React, { useState, useEffect } from 'react';
import { 
  User, Phone, Truck, Building2, ShieldCheck, 
  Save, Loader2, Camera, UploadCloud, AlertCircle,
  Instagram, Globe, MapPin, X, Briefcase, MessageCircle,
  CheckCircle2, Copy, ExternalLink, Image as ImageIcon,
  MapPinned, Star, Tag, LayoutDashboard
} from 'lucide-react';
import { api } from '../../api/api';
import DriverFields from '../../components/driver/DriverFields'; 
import CompanyFields from '../../components/company/CompanyFields';
import AdvertiserFields from '../../components/advertiser/AdvertiserFields'; // Novo componente necessário
import Swal from 'sweetalert2'; 

interface MyProfileProps {
  user: any;
  refreshUser: () => Promise<void>; 
}

const MyProfile = ({ user, refreshUser }: MyProfileProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  
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
    }
  }, [user]);

  // Lógica de Diferenciação Visual
  const role = user.role?.toLowerCase();
  const isDriver = role === 'driver';
  const isAdvertiser = role === 'advertiser';
  const isCompany = ['company', 'shipper', 'transportadora'].includes(role);

  const themeColor = isDriver ? 'orange' : isAdvertiser ? 'purple' : 'blue';
  const themeClasses = {
    orange: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-100', light: 'bg-orange-50', hover: 'hover:bg-orange-600' },
    purple: { bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-100', light: 'bg-purple-50', hover: 'hover:bg-purple-700' },
    blue: { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-100', light: 'bg-blue-50', hover: 'hover:bg-blue-700' }
  }[themeColor];

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
      
      const fields = [
        'name', 'slug', 'whatsapp', 'bio', 'city', 'state',
        'vehicle_type', 'body_type', 'cnpj', 'company_name',
        'plate', 'antt', 'anos_experiencia', 'cidades_atendidas',
        'instagram', 'website', 'phone', 'atendimento_regiao'
      ];

      fields.forEach(field => {
        if (formData[field] !== undefined) dataToSend.append(field, String(formData[field]));
      });

      if (avatarFile) dataToSend.append('avatar_file', avatarFile);
      if (coverFile) dataToSend.append('cover_file', coverFile);

      const response = await api.post('/update-profile', dataToSend);

      if (response.data.success) {
        await refreshUser();
        Swal.fire({ icon: 'success', title: 'Perfil Atualizado!', timer: 2000, showConfirmButton: false });
      }
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Erro ao salvar', text: error.response?.data?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      
      {/* HEADER: GESTÃO DE BANNER E AVATAR */}
      <div className="relative group">
        {/* Banner/Capa */}
        <div className={`h-48 md:h-72 w-full rounded-[3.5rem] overflow-hidden relative ${themeClasses.light} border-2 border-dashed ${themeClasses.border}`}>
          {coverPreview || user.cover_url ? (
            <img src={coverPreview || user.cover_url} className="w-full h-full object-cover" alt="Banner" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
               <ImageIcon size={48} className="mb-2 opacity-20" />
               <p className="text-[10px] font-black uppercase">Upload de Banner (1200x400)</p>
            </div>
          )}
          <label className="absolute top-6 right-6 bg-white/20 backdrop-blur-md p-4 rounded-2xl cursor-pointer hover:bg-white/40 transition-all">
            <UploadCloud size={20} className="text-white" />
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
          </label>
        </div>

        {/* Avatar Sobreposto */}
        <div className="absolute -bottom-16 left-12 flex flex-col md:flex-row items-end gap-6">
          <div className="relative group/avatar">
            <div className={`w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] bg-white p-1 shadow-2xl border-4 border-white`}>
              <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-slate-100">
                <img 
                  src={avatarPreview || user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}`} 
                  className="w-full h-full object-cover"
                  alt="Avatar"
                />
              </div>
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all cursor-pointer rounded-[2.5rem]">
                <Camera size={28} className="text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
              </label>
            </div>
          </div>
          
          <div className="mb-4 hidden md:block">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-800 leading-none">
              {formData.name || 'Seu Nome'}
            </h2>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${themeClasses.text}`}>
               {user.role} Verificado
            </p>
          </div>
        </div>
      </div>

      <div className="h-16" /> {/* Espaçador para o avatar flutuante */}

      {/* LINK PÚBLICO E STATUS */}
      <div className={`${themeClasses.light} border ${themeClasses.border} p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${themeClasses.bg} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
            <Globe size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase opacity-60">Sua vitrine pública:</p>
            <p className="font-bold text-slate-700 italic">chamafrete.com.br/perfil/{formData.slug}</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`https://chamafrete.com.br/perfil/${formData.slug}`);
                Swal.fire({ title: 'Copiado!', timer: 800, showConfirmButton: false });
              }}
              className="flex-1 md:flex-none bg-white p-4 rounded-2xl text-slate-600 hover:text-slate-900 border border-slate-100 flex items-center justify-center gap-2 font-bold text-xs uppercase"
            >
              <Copy size={16} />
            </button>
            <a href={`/perfil/${formData.slug}`} target="_blank" className={`${themeClasses.bg} p-4 px-6 rounded-2xl text-white ${themeClasses.hover} transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase`}>
              <ExternalLink size={16} /> Ver Vitrine
            </a>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* COLUNA ESQUERDA: IDENTIDADE */}
        <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100 space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
            <div className={`w-1.5 h-6 ${themeClasses.bg} rounded-full`} />
            <h3 className="text-xl font-black uppercase italic text-slate-800">Dados Básicos</h3>
          </div>
          <div className="space-y-6">
            <Input 
              label="Nome de Exibição" 
              value={formData.name} 
              onChange={(v: string) => setFormData({...formData, name: v, slug: generateSlug(v)})} 
            />
            <Input 
              label="URL Personalizada (Slug)" 
              value={formData.slug} 
              onChange={(v: string) => setFormData({...formData, slug: generateSlug(v)})} 
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Cidade" value={formData.city} onChange={(v: string) => setFormData({...formData, city: v})} />
              <Input label="Estado (UF)" value={formData.state} onChange={(v: string) => setFormData({...formData, state: v})} />
            </div>
            <Input label="WhatsApp de Contato" value={formData.whatsapp} onChange={(v: string) => setFormData({...formData, whatsapp: v})} />
          </div>
        </div>

        {/* COLUNA DIREITA: CAMPOS ESPECÍFICOS */}
        <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-50 pb-6">
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-6 ${themeClasses.bg} rounded-full`} />
              <h3 className="text-xl font-black uppercase italic text-slate-800">
                {isDriver ? 'Configuração de Frota' : isAdvertiser ? 'Dados do Anunciante' : 'Dados Corporativos'}
              </h3>
            </div>
            {isDriver && <Truck className="text-slate-200" size={32} />}
            {isAdvertiser && <Tag className="text-slate-200" size={32} />}
            {isCompany && <Building2 className="text-slate-200" size={32} />}
          </div>

          {isDriver && <DriverFields formData={formData} setFormData={setFormData} />}
          {isCompany && <CompanyFields formData={formData} setFormData={setFormData} />}
          {isAdvertiser && <AdvertiserFields formData={formData} setFormData={setFormData} />}
        </div>
      </div>

      {/* SEÇÃO DE BIO E REDES SOCIAIS */}
      <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100">
          <h3 className="text-xl font-black uppercase italic mb-8 text-slate-800 flex items-center gap-3">
            <MessageCircle size={24} className={themeClasses.text} /> Bio e Canais Digitais
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-2">Apresentação do Perfil</label>
              <textarea 
                value={formData.bio || ''} 
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full p-6 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-slate-200 outline-none font-bold text-slate-700 min-h-[120px]"
                placeholder="Ex: Motorista com 10 anos de experiência em rotas do Sul..."
              />
            </div>
            <Input label="Instagram" placeholder="@perfil" value={formData.instagram} onChange={(v:string) => setFormData({...formData, instagram: v})} />
            <Input label="Site Oficial" placeholder="www.site.com" value={formData.website} onChange={(v:string) => setFormData({...formData, website: v})} />
            
            <div className="w-full">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-2">Região de Atendimento</label>
              <select 
                value={formData.atendimento_regiao}
                onChange={(e) => setFormData({...formData, atendimento_regiao: e.target.value})}
                className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent outline-none font-bold text-slate-700 appearance-none cursor-pointer"
              >
                <option value="Nacional">Nacional (Todo Brasil)</option>
                <option value="Regional">Regional (Meu Estado)</option>
                <option value="Local">Local (Minha Cidade)</option>
                <option value="Internacional">Internacional (Mercosul)</option>
              </select>
            </div>
          </div>
      </div>

      {/* FOOTER SALVAR */}
      <div className="bg-slate-900 rounded-[3.5rem] p-8 md:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-white/50">
              <ShieldCheck size={32} className="text-emerald-400" />
              <div>
                <p className="text-xs font-black uppercase text-white">Segurança de Dados</p>
                <p className="text-[10px] uppercase tracking-wider">Suas informações são protegidas e usadas para gerar leads.</p>
              </div>
          </div>
          <button 
            onClick={handleSave} 
            disabled={loading} 
            className={`${themeClasses.bg} text-white px-12 py-6 rounded-[2.5rem] font-black uppercase italic text-sm flex items-center gap-4 ${themeClasses.hover} transition-all shadow-xl disabled:opacity-50`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? "Processando..." : "Salvar Todas as Alterações"}
          </button>
      </div>
    </div>
  );
};

// Subcomponente de Input Estilizado
const Input = ({ label, value, onChange, placeholder, disabled }: any) => (
  <div className="w-full">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-2">{label}</label>
    <input 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent focus:border-slate-200 focus:bg-white outline-none font-bold transition-all text-slate-700 ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
    />
  </div>
);

export default MyProfile;