import React, { useState, useEffect } from 'react';
import { 
  User, Phone, Truck, Building2, ShieldCheck, 
  Save, Loader2, Camera, UploadCloud, AlertCircle,
  Instagram, Globe, MapPin, X, Briefcase, MessageCircle,
  CheckCircle2, Copy, ExternalLink
} from 'lucide-react';
import { api } from '../../api/api';
import DriverFields from '../../components/driver/DriverFields'; 
import CompanyFields from '../../components/company/CompanyFields';
import Swal from 'sweetalert2'; 

interface MyProfileProps {
  user: any;
  refreshUser: () => Promise<void>; 
}

const MyProfile = ({ user, refreshUser }: MyProfileProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Pegamos os atributos que estão escondidos no JSON
      const extras = user.extended_attributes ? 
        (typeof user.extended_attributes === 'string' ? JSON.parse(user.extended_attributes) : user.extended_attributes) 
        : {};

      setFormData({
        ...user,
        ...extras, // Isso joga 'plate', 'antt', etc, para a raiz do formData
        bio: user.bio || '',
        instagram: extras.instagram || user.instagram || '',
        website: extras.website || user.website || '',
        phone: extras.phone || user.phone || user.whatsapp || '',
        city: user.city || '',
        slug: user.slug || '',
        cnpj: user.document || extras.cnpj || '' // Garante que o CNPJ apareça no campo
      });
    }
  }, [user]);

  const isCompany = ['company', 'shipper', 'transportadora'].includes(user.role?.toLowerCase());

  // Helper para gerar slug amigável
  const generateSlug = (text: string) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").trim();
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const dataToSend = new FormData();
      
      // Lista exata de campos que o UserRepository espera
      const fields = [
        'name', 'slug', 'whatsapp', 'bio', 'city', 'state',
        'vehicle_type', 'body_type', 'cnpj', 'company_name',
        'plate', 'antt', 'anos_experiencia', 'cidades_atendidas',
        'instagram', 'website', 'phone'
      ];

      fields.forEach(field => {
        if (formData[field] !== undefined && formData[field] !== null) {
          dataToSend.append(field, String(formData[field]));
        }
      });

      if (avatarFile instanceof File) { 
        dataToSend.append('avatar_file', avatarFile);
      }
      const response = await api.post('/update-profile', dataToSend);

      if (response.data.success) {
        await refreshUser();
        Swal.fire({ icon: 'success', title: 'Atualizado!', timer: 2000, showConfirmButton: false });
      }
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Erro ao salvar', text: error.response?.data?.message || error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const SaveButton = ({ className = "" }: { className?: string }) => (
    <button 
      onClick={handleSave} 
      disabled={loading} 
      className={`bg-slate-900 text-white px-12 py-6 rounded-[2.5rem] font-black uppercase italic text-xs flex items-center gap-4 hover:bg-orange-600 transition-all shadow-xl disabled:opacity-50 group ${className}`}
    >
      {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
      {loading ? "Salvando..." : "Salvar Alterações"}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 md:px-0">
      
      {/* CARD DO LINK PÚBLICO - CORRIGIDO */}
      <div className="bg-orange-50 border border-orange-100 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
            <Globe size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-orange-400">Sua vitrine está online em:</p>
            {/* Aqui usamos /company/ para empresas e /driver/ para motoristas */}
            <p className="font-bold text-slate-700">
              chamafrete.com.br{isCompany ? '/company/' : '/driver/'}{formData.slug}
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => {
                const prefix = isCompany ? '/company/' : '/driver/';
                navigator.clipboard.writeText(`https://chamafrete.com.br${prefix}${formData.slug}`);
                Swal.fire({ title: 'Link Copiado!', timer: 1000, showConfirmButton: false });
              }}
              className="flex-1 md:flex-none bg-white p-4 rounded-2xl text-slate-600 hover:text-orange-600 transition-colors border border-orange-100 flex items-center justify-center gap-2 font-bold text-xs uppercase"
            >
              <Copy size={16} /> Copiar
            </button>
            <a 
              href={isCompany ? `/company/${formData.slug}` : `/driver/${formData.slug}`} 
              target="_blank" 
              className="flex-1 md:flex-none bg-orange-500 p-4 rounded-2xl text-white hover:bg-orange-600 transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase"
            >
              <ExternalLink size={16} /> Ver Perfil
            </a>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-36 h-36 rounded-[3rem] bg-slate-100 overflow-hidden border-4 border-white shadow-2xl group relative">
            <img 
              src={avatarPreview || user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}`} 
              className="w-full h-full object-cover"
              alt="Avatar"
            />
            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                <Camera size={32} className="text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </label>
          </div>
        </div>
        
        <div className="text-center md:text-left flex-1 z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-1">Configurações de Perfil</p>
          <h2 className="text-4xl font-[1000] uppercase italic tracking-tighter text-slate-800 leading-none mb-4">
            {formData.name || 'Seu Nome'}
          </h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
             <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase flex items-center gap-2">
                <User size={12}/> ID #{user.id}
             </span>
             <span className="px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-black uppercase flex items-center gap-2 border border-orange-100">
                <CheckCircle2 size={12}/> {user.role}
             </span>
          </div>
        </div>
        <SaveButton className="w-full md:w-auto justify-center" />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100 space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
            <h3 className="text-xl font-black uppercase italic text-slate-800">Identidade</h3>
          </div>
          <div className="space-y-6">
            <Input 
              label="Nome na Vitrine" 
              value={formData.name} 
              onChange={(v: string) => setFormData({...formData, name: v, slug: generateSlug(v)})} 
            />
            <Input 
              label="Slug do Perfil (URL)" 
              value={formData.slug} 
              onChange={(v: string) => setFormData({...formData, slug: generateSlug(v)})} 
              placeholder="ex-nome-da-empresa"
            />
            <Input label="WhatsApp Pessoal" value={formData.whatsapp} onChange={(v: string) => setFormData({...formData, whatsapp: v})} />
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100 space-y-8">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
            <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
            <h3 className="text-xl font-black uppercase italic text-slate-800">
              {isCompany ? 'Dados da Empresa' : 'Dados Profissionais'}
            </h3>
          </div>
          {isCompany ? (
            <CompanyFields formData={formData} setFormData={setFormData} />
          ) : (
            <DriverFields formData={formData} setFormData={setFormData} />
          )}
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100">
          <h3 className="text-xl font-black uppercase italic mb-8 text-slate-800 flex items-center gap-3">
            <Globe size={24} className="text-orange-500" /> Bio e Canais Digitais
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-2">Sobre / Descrição do Negócio</label>
              <textarea 
                value={formData.bio || ''} 
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full p-6 bg-slate-50 rounded-[2rem] border-2 border-transparent focus:border-orange-500/20 outline-none font-bold text-slate-700 min-h-[120px]"
                placeholder="Conte um pouco sobre sua experiência, frota ou serviços..."
              />
            </div>
            <Input label="Instagram" placeholder="@seu_perfil" value={formData.instagram} onChange={(v:string) => setFormData({...formData, instagram: v})} />
            <Input label="Site / Portfólio" placeholder="www.site.com.br" value={formData.website} onChange={(v:string) => setFormData({...formData, website: v})} />
            <Input label="WhatsApp Comercial" placeholder="Link ou número" value={formData.phone} onChange={(v:string) => setFormData({...formData, phone: v})} />
          </div>
      </div>

      <div className="bg-white rounded-[3.5rem] p-8 md:p-10 shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-100 pt-10">
            <div className="flex items-center gap-4 text-slate-400">
                <AlertCircle size={20} />
                <p className="text-xs font-bold uppercase tracking-wider">Verifique se o seu slug está correto para não quebrar seus links antigos.</p>
            </div>
            <SaveButton className="w-full md:w-auto" />
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, placeholder, disabled }: any) => (
  <div className="w-full">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-2">{label}</label>
    <input 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent focus:border-orange-500/20 focus:bg-white outline-none font-bold transition-all text-slate-700 ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
    />
  </div>
);

export default MyProfile;