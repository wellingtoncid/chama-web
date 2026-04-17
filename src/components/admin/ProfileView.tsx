import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  User, Mail, Phone, MapPin, Calendar, Shield, Camera,
  Loader2, Save, Edit3
} from 'lucide-react';

interface Profile {
  id: number;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  role: string;
  city: string;
  state: string;
  avatar: string;
  bio: string;
  cpf: string;
  cnpj: string;
  company_name: string;
  birth_date: string;
  gender: string;
  occupation: string;
  website: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  is_verified: number;
  rating_avg: number;
  rating_count: number;
}

export default function ProfileView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({});

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/profile');
      if (res.data?.success) {
        setProfile(res.data.data);
        setFormData(res.data.data);
      }
    } catch {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/profile', formData);
      setEditing(false);
      await loadProfile();
    } catch {
      alert("Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center p-20">
      <Loader2 className="animate-spin text-orange-500" size={40} />
      <p className="font-black mt-4 italic uppercase text-[10px]">Carregando Perfil...</p>
    </div>
  );

  const inputClass = "w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2 focus:ring-2 focus:ring-orange-500";
  const labelClass = "text-[10px] font-black uppercase text-slate-400 tracking-wider";

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 pb-32">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/30">
              {profile?.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-white" />
              )}
            </div>
            {editing && (
              <button className="absolute bottom-0 right-0 bg-white text-orange-500 p-2 rounded-full shadow-lg">
                <Camera size={16} />
              </button>
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black uppercase italic">{profile?.name}</h1>
              {profile?.is_verified === 1 && (
                <Shield className="text-green-400" size={24} fill="currentColor" />
              )}
            </div>
            <p className="text-white/80 font-bold uppercase text-sm">{profile?.role}</p>
            <div className="flex items-center gap-4 mt-2 text-white/70 text-xs">
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {profile?.city} - {profile?.state}
              </span>
              {profile?.rating_count > 0 && (
                <span className="flex items-center gap-1">
                  ⭐ {Number(profile?.rating_avg || 0).toFixed(1)} ({profile?.rating_count} avaliações)
                </span>
              )}
            </div>
          </div>
        </div>
        
        <button
          onClick={() => editing ? handleSave() : setEditing(true)}
          disabled={saving}
          className="absolute bottom-8 right-8 bg-white text-orange-500 px-6 py-3 rounded-2xl font-black uppercase text-xs shadow-lg hover:bg-orange-50 transition-all flex items-center gap-2"
        >
          {saving ? <Loader2 className="animate-spin" size={16} /> : editing ? <Save size={16} /> : <Edit3 size={16} />}
          {saving ? 'Salvando...' : editing ? 'Salvar' : 'Editar'}
        </button>
      </div>

      {/* INFO PESSOAL */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2">
          <User size={20} className="text-orange-500"/> Informações Pessoais
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Nome Completo</label>
            <input 
              type="text"
              value={editing ? formData.name : profile?.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              disabled={!editing}
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>Email</label>
            <input 
              type="email"
              value={profile?.email || ''}
              disabled
              className={`${inputClass} opacity-50`}
            />
          </div>
          
          <div>
            <label className={labelClass}>Telefone</label>
            <input 
              type="text"
              value={editing ? formData.phone : profile?.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              disabled={!editing}
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>WhatsApp</label>
            <input 
              type="text"
              value={editing ? formData.whatsapp : profile?.whatsapp}
              onChange={e => setFormData({...formData, whatsapp: e.target.value})}
              disabled={!editing}
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>CPF</label>
            <input 
              type="text"
              value={editing ? formData.cpf : profile?.cpf}
              onChange={e => setFormData({...formData, cpf: e.target.value})}
              disabled={!editing}
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>Data de Nascimento</label>
            <input 
              type="date"
              value={editing ? formData.birth_date : profile?.birth_date}
              onChange={e => setFormData({...formData, birth_date: e.target.value})}
              disabled={!editing}
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>Gênero</label>
            <select
              value={editing ? formData.gender : profile?.gender}
              onChange={e => setFormData({...formData, gender: e.target.value})}
              disabled={!editing}
              className={inputClass}
            >
              <option value="">Selecione</option>
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
              <option value="other">Outro</option>
            </select>
          </div>
          
          <div>
            <label className={labelClass}>Ocupação</label>
            <input 
              type="text"
              value={editing ? formData.occupation : profile?.occupation}
              onChange={e => setFormData({...formData, occupation: e.target.value})}
              disabled={!editing}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* ENDEREÇO */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2">
          <MapPin size={20} className="text-orange-500"/> Localização
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={labelClass}>Cidade</label>
            <input 
              type="text"
              value={editing ? formData.city : profile?.city}
              onChange={e => setFormData({...formData, city: e.target.value})}
              disabled={!editing}
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>Estado</label>
            <input 
              type="text"
              value={editing ? formData.state : profile?.state}
              onChange={e => setFormData({...formData, state: e.target.value})}
              disabled={!editing}
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>CEP</label>
            <input 
              type="text"
              value={editing ? (formData as any).zip_code : (profile as any)?.zip_code}
              onChange={e => setFormData({...formData, zip_code: e.target.value} as any)}
              disabled={!editing}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* EMPRESA */}
      {profile?.company_name && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2">
            <Shield size={20} className="text-orange-500"/> Dados da Empresa
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Nome da Empresa</label>
              <input 
                type="text"
                value={profile.company_name}
                disabled
                className={`${inputClass} opacity-50`}
              />
            </div>
            
            <div>
              <label className={labelClass}>CNPJ</label>
              <input 
                type="text"
                value={profile.cnpj}
                disabled
                className={`${inputClass} opacity-50`}
              />
            </div>
          </div>
        </div>
      )}

      {/* REDES SOCIAIS */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2">
          <Shield size={20} className="text-orange-500"/> Redes Sociais
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className={labelClass}>Website</label>
            <input 
              type="text"
              value={editing ? formData.website : profile?.website}
              onChange={e => setFormData({...formData, website: e.target.value})}
              disabled={!editing}
              className={inputClass}
              placeholder="https://"
            />
          </div>
          
          <div>
            <label className={labelClass}>Facebook</label>
            <input 
              type="text"
              value={editing ? formData.facebook : profile?.facebook}
              onChange={e => setFormData({...formData, facebook: e.target.value})}
              disabled={!editing}
              className={inputClass}
            />
          </div>
          
          <div>
            <label className={labelClass}>Instagram</label>
            <input 
              type="text"
              value={editing ? formData.instagram : profile?.instagram}
              onChange={e => setFormData({...formData, instagram: e.target.value})}
              disabled={!editing}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* BIO */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2">
          <Edit3 size={20} className="text-orange-500"/> Sobre Você
        </h3>
        
        <textarea
          value={editing ? formData.bio : profile?.bio}
          onChange={e => setFormData({...formData, bio: e.target.value})}
          disabled={!editing}
          className={`${inputClass} h-32 resize-none`}
          placeholder="Conte um pouco sobre você..."
        />
      </div>
    </div>
  );
}
