import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Save, Loader2, Camera, AlertCircle, 
  Globe, MapPin, MessageCircle, Copy, ExternalLink, ImageIcon,
  LayoutDashboard, User, Building2, Briefcase, Lock, Eye, EyeOff
} from 'lucide-react';
import { api } from '../../api/api';
import Swal from 'sweetalert2';

import DriverFields from '../../components/driver/DriverFields';
import CompanyFields from '../../components/company/CompanyFields';

interface MyProfileProps {
  user: any;
  refreshUser: () => Promise<void>; 
}

const MyProfile = ({ user, refreshUser }: MyProfileProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // Estados para mudança de senha
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  const [marketplaceEnabled, setMarketplaceEnabled] = useState(false);
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  
  const [cnpjData, setCnpjData] = useState<any>(null);
  const [cnpjInput, setCnpjInput] = useState('');
  const [verifyingCnpj, setVerifyingCnpj] = useState(false);

  const role = (user?.role || '').toLowerCase();
  const isDriver = role === 'driver';
  const isCompany = role === 'company';

  // Cores dinâmicas baseadas no tipo de usuário
  const themeClasses = isDriver ? {
    bg: 'bg-orange-600', text: 'text-orange-600', border: 'border-orange-100', 
    light: 'bg-orange-50 dark:bg-orange-500/5', hover: 'hover:bg-orange-700', shadow: 'shadow-orange-500/20'
  } : {
    bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-100', 
    light: 'bg-blue-50 dark:bg-blue-500/5', hover: 'hover:bg-blue-700', shadow: 'shadow-blue-500/20'
  };

  useEffect(() => {
    loadModules();
    if (isCompany) {
      loadCnpjData();
    }
  }, [isCompany]);

  const loadModules = async () => {
    try {
      const res = await api.get('/user/modules');
      if (res.data?.success) {
        const modules = res.data.data?.modules || [];
        const marketplace = modules.find((m: any) => m.key === 'marketplace');
        const identity = modules.find((m: any) => m.key === 'identity_verification');
        
        setMarketplaceEnabled(marketplace?.is_active || false);
        setIdentityConfirmed(identity?.is_active || false);
      }
    } catch (e) {
      console.error("Erro ao carregar módulos:", e);
    }
  };

  const loadCnpjData = async () => {
    try {
      const res = await api.get('/get-cnpj-data');
      if (res.data?.success && res.data?.data) {
        setCnpjData(res.data.data);
        setCnpjInput(res.data.data.cnpj || '');
      }
    } catch (e) {
      console.error("Erro ao carregar dados do CNPJ:", e);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('A nova senha e a confirmação não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    try {
      setChangingPassword(true);
      const res = await api.put('/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      if (res.data?.success) {
        setPasswordSuccess('Senha alterada com sucesso!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowPasswordSection(false);
          setPasswordSuccess(null);
        }, 2000);
      } else {
        setPasswordError(res.data?.message || 'Erro ao alterar senha');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setPasswordError(axiosErr.response?.data?.message || 'Erro ao alterar senha');
      } else {
        setPasswordError('Erro ao alterar senha');
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const verifyCnpj = async () => {
    const cleanCnpj = cnpjInput.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) {
      Swal.fire({ icon: 'warning', title: 'CNPJ inválido', text: 'O CNPJ deve ter 14 dígitos.' });
      return;
    }

    setVerifyingCnpj(true);
    try {
      const res = await api.post('/verify-cnpj', { cnpj: cleanCnpj });
      if (res.data.success) {
        setCnpjData(res.data.data);
        Swal.fire({
          icon: 'success',
          title: 'CNPJ verificado!',
          text: res.data.is_active ? 'Sua empresa está ativa.' : 'Atenção: Empresa inativa.'
        });
      }
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: 'Erro', text: e.response?.data?.message || 'Erro ao verificar CNPJ.' });
    } finally {
      setVerifyingCnpj(false);
    }
  };

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
        vehicle_type: user.vehicle_type || extras.vehicle_type || '',
        body_type: user.body_type || extras.body_type || '',
        trade_name: user.trade_name || user.name || '',
        is_available: user.is_available ?? 0
      });
      
      if (user.avatar_url) setAvatarPreview(user.avatar_url);
      if (user.cover_url) setCoverPreview(user.cover_url);
    }
  }, [user]);

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
        if (type === 'avatar') {
          setAvatarPreview(reader.result as string);
          setAvatarFile(file);
        } else {
          setCoverPreview(reader.result as string);
          setCoverFile(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      const extendedKeys = [
        'instagram', 'website', 'website_url', 'business_type', 'commercial_email',
        'special_courses', 'intl_license', 'fleet_size', 'preferred_regions', 
        'specific_regions', 'load_volume'
      ];

      const integerFields = ['is_available'];
      const extras: any = {};
      
      Object.keys(formData).forEach(key => {
        if (extendedKeys.includes(key)) {
          extras[key] = formData[key];
        } else if (integerFields.includes(key)) {
          data.append(key, String(formData[key]));
        } else {
          if (Array.isArray(formData[key])) {
            data.append(key, JSON.stringify(formData[key]));
          } else if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
            data.append(key, formData[key]);
          }
        }
      });

      data.append('extended_attributes', JSON.stringify(extras));
      if (avatarFile) data.append('avatar_file', avatarFile);
      if (coverFile) data.append('cover_file', coverFile);

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

  const score = calculateLiveScore();

  const determineProfileStatus = () => {
    if (user?.is_verified) {
      return { 
        text: 'Verificado', 
        Icon: ShieldCheck,
        className: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20' 
      };
    }
    if (score === 100) return { text: 'Perfil Concluído', Icon: ShieldCheck, className: 'bg-green-50 dark:bg-green-500/10 text-green-600 border border-green-100 dark:border-green-500/20' };
    if (score >= 80) return { text: 'Em Análise', Icon: AlertCircle, className: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border border-amber-100 dark:border-amber-500/20' };
    return { text: isCompany ? 'Dados Incompletos' : 'Perfil Incompleto', Icon: AlertCircle, className: 'bg-red-50 dark:bg-red-500/10 text-red-600 border border-red-100 dark:border-red-500/20' };
  };

  const profileStatus = determineProfileStatus();
  const StatusIcon = profileStatus.Icon;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 px-4 md:px-6">
      
      {/* BARRA DE PROGRESSO */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
              <div className="relative w-16 h-16">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" className="text-slate-100 dark:text-slate-800" strokeWidth="3" fill="none" />
                      <circle cx="18" cy="18" r="16" className={`${themeClasses.text} transition-all duration-1000`} strokeWidth="3" strokeDasharray={`${score}, 100`} strokeLinecap="round" fill="none" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-300">{score}%</div>
              </div>
              <div>
                  <h4 className="font-black uppercase italic text-slate-800 dark:text-white leading-tight">Força do Perfil</h4>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                    {isCompany ? 'Preencha seus dados para habilitar módulos' : 'Complete para ser encontrado no Radar'}
                  </p>
              </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`${profileStatus.className} px-6 py-3 rounded-2xl flex items-center gap-2 font-black uppercase italic text-[10px] border`}>
                <StatusIcon size={16} /> {profileStatus.text}
            </div>
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
          
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-black uppercase italic text-slate-800 dark:text-white mb-10 flex items-center gap-3">
               <Briefcase size={24} className={themeClasses.text} /> Informações Profissionais
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
               <Input label={isCompany ? "Nome Fantasia" : "Nome Completo"} value={formData.trade_name} onChange={(v: string) => setFormData({...formData, trade_name: v, name: v, slug: generateSlug(v)})} />
               <Input label={isCompany ? "CNPJ" : "CPF"} value={formData.document} onChange={(v: string) => setFormData({...formData, document: v})} />
            </div>

            {isDriver ? (
              <DriverFields formData={formData} setFormData={setFormData} />
            ) : (
              <CompanyFields formData={formData} setFormData={setFormData} />
            )}
          </div>

          {/* BIO */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-black uppercase italic mb-8 text-slate-800 dark:text-white flex items-center gap-3"><MessageCircle size={24} className={themeClasses.text} /> Apresentação / Bio</h3>
            <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full p-8 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] border-2 border-transparent focus:border-slate-200 outline-none font-medium text-slate-700 dark:text-slate-300 min-h-[200px]" placeholder="Conte sua experiência..." />
            {(formData.bio?.length ?? 0) <= 20 && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 px-2">
                Para melhor pontuação do perfil, preencha mais de 20 caracteres.
              </p>
            )}
          </div>
        </div>

        {/* COLUNA LATERAL */}
        <div className="space-y-8">
          {/* Alterar Senha */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-black uppercase italic mb-6 text-slate-400 tracking-widest flex items-center gap-2">
              <Lock size={18} /> Segurança
            </h3>
            
            {!showPasswordSection ? (
              <button
                onClick={() => setShowPasswordSection(true)}
                className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-2"
              >
                <Lock size={16} />
                Alterar Senha
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <Input 
                    label="Senha Atual" 
                    type={showPasswords.current ? "text" : "password"}
                    value={currentPassword} 
                    onChange={(v: string) => setCurrentPassword(v)}
                    placeholder="Digite sua senha atual"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(p => ({ ...p, current: !p.current }))}
                    className="text-xs text-slate-500 mt-1"
                  >
                    {showPasswords.current ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div>
                  <Input 
                    label="Nova Senha" 
                    type={showPasswords.new ? "text" : "password"}
                    value={newPassword} 
                    onChange={(v: string) => setNewPassword(v)}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(p => ({ ...p, new: !p.new }))}
                    className="text-xs text-slate-500 mt-1"
                  >
                    {showPasswords.new ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div>
                  <Input 
                    label="Confirmar Nova Senha" 
                    type={showPasswords.confirm ? "text" : "password"}
                    value={confirmPassword} 
                    onChange={(v: string) => setConfirmPassword(v)}
                    placeholder="Repita a nova senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))}
                    className="text-xs text-slate-500 mt-1"
                  >
                    {showPasswords.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {passwordError && (
                  <p className="text-red-500 text-sm font-bold">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-green-600 text-sm font-bold">{passwordSuccess}</p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordSection(false);
                      setPasswordError(null);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="flex-1 py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {changingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                    Salvar
                  </button>
                </div>
              </form>
            )}
          </div>

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

      {!identityConfirmed && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-500/10 border border-amber-200 dark:border-amber-500/20 rounded-[2rem] p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-black uppercase italic text-lg text-slate-900 dark:text-white mb-1">
                Aumente a confiança dos clientes
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                Contrate "Identidade Confirmada" e destaque seu perfil.
              </p>
              <button
                onClick={() => window.location.href = '/dashboard/plans'}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-6 py-3 rounded-xl font-black uppercase text-sm transition-all shadow-lg"
              >
                Ver planos →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER SAVE BAR */}
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

const Input = ({ label, value, onChange, placeholder, disabled, dark, type = "text" }: any) => (
  <div className="w-full">
    <label className={`text-[9px] font-black uppercase tracking-[0.2em] mb-3 block ml-2 ${dark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</label>
    <input 
      type={type}
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