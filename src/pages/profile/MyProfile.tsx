import { useState, useEffect } from 'react';
import {
  ShieldCheck, Save, Loader2, Camera, AlertCircle,
  Globe, MapPin, MessageCircle, Copy, ExternalLink, ImageIcon,
  LayoutDashboard, User, Building2, Briefcase, Lock, Eye, EyeOff,
  Search, CheckCircle2, XCircle, AtSign, Hash, Smartphone,
  UserCircle, FileText, Instagram, Link2, ChevronRight, Tag, Truck, ShoppingBag, Megaphone, Headphones,
  Users, ArrowRight,
} from 'lucide-react';
import { api } from '../../api/api';
import Swal from 'sweetalert2';

import DriverFields from '../../components/driver/DriverFields';
import CompanyFields from '../../components/company/CompanyFields';
import DashboardShell from '@/components/layout/DashboardShell';

interface MyProfileProps {
  user: any;
  refreshUser: () => Promise<void>;
}

const SECTIONS = [
  { id: 'profile', label: 'Perfil', icon: UserCircle },
  { id: 'bio', label: 'Bio', icon: FileText },
  { id: 'security', label: 'Segurança', icon: Lock },
  { id: 'location', label: 'Localização', icon: MapPin },
  { id: 'social', label: 'Redes', icon: Globe },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

const MyProfile = ({ user, refreshUser }: MyProfileProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [activeSection, setActiveSection] = useState<SectionId>('profile');

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

  const [userModules, setUserModules] = useState<any[]>([]);
  const [identityConfirmed, setIdentityConfirmed] = useState(false);

  const [cepInput, setCepInput] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [cepStatus, setCepStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleCepLookup = async (cep: string) => {
    const cleaned = cep.replace(/\D/g, '');
    if (cleaned.length !== 8) return;
    setCepLoading(true);
    setCepStatus('idle');
    try {
      const res = await api.get('/geocode/cep', { params: { cep: cleaned } });
      if (res.data?.success && res.data.data) {
        const city = res.data.data.city;
        const state = res.data.data.state;
        if (city && state) {
          setFormData({ ...formData, city, state: state.toUpperCase(), home_cep: cleaned });
          setCepStatus('success');
          Swal.fire({ icon: 'success', title: `${city} - ${state} preenchido!`, timer: 1200, showConfirmButton: false, toast: true, position: 'top-end' });
        } else {
          setCepStatus('error');
          Swal.fire({ icon: 'warning', title: 'CEP não contém cidade/UF', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
        }
      } else {
        setCepStatus('error');
        Swal.fire({ icon: 'error', title: 'CEP não encontrado', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
      }
    } catch (err) {
      console.error('Erro ao buscar CEP:', err);
      setCepStatus('error');
      Swal.fire({ icon: 'error', title: 'Erro ao buscar CEP', text: 'Tente novamente', timer: 2000, showConfirmButton: false, toast: true, position: 'top-end' });
    } finally {
      setCepLoading(false);
    }
  };

  const role = (user?.role || '').toLowerCase();
  const isDriver = role === 'driver';
  const isCompany = role === 'company';

  const theme = isDriver ? {
    bg: 'bg-orange-600', text: 'text-orange-600', border: 'border-orange-200',
    light: 'bg-orange-50 dark:bg-orange-500/10', hover: 'hover:bg-orange-700',
    shadow: 'shadow-orange-500/20', ring: 'ring-orange-500/20',
    gradient: 'from-orange-500 to-amber-500',
    subtle: 'text-orange-600 dark:text-orange-400',
    muted: 'text-orange-400 dark:text-orange-500',
  } : {
    bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-200',
    light: 'bg-blue-50 dark:bg-blue-500/10', hover: 'hover:bg-blue-700',
    shadow: 'shadow-blue-500/20', ring: 'ring-blue-500/20',
    gradient: 'from-blue-500 to-indigo-500',
    subtle: 'text-blue-600 dark:text-blue-400',
    muted: 'text-blue-400 dark:text-blue-500',
  };

  useEffect(() => {
    loadModules();
  }, []);

  const MODULE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
    freights: { label: 'Fretes', icon: <Truck size={16} /> },
    marketplace: { label: 'Marketplace', icon: <ShoppingBag size={16} /> },
    advertiser: { label: 'Publicidade', icon: <Megaphone size={16} /> },
  };

  const loadModules = async () => {
    try {
      const res = await api.get('/user/modules');
      if (res.data?.success) {
        const modules = res.data.data?.modules || [];
        setUserModules(modules);
        setIdentityConfirmed(!!modules.find((m: any) => m.key === 'identity_verification')?.is_active);
      }
    } catch (e) { console.error("Erro ao carregar módulos:", e); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    if (newPassword !== confirmPassword) { setPasswordError('As senhas não coincidem'); return; }
    if (newPassword.length < 6) { setPasswordError('Mínimo 6 caracteres'); return; }
    try {
      setChangingPassword(true);
      const res = await api.put('/change-password', { current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword });
      if (res.data?.success) {
        setPasswordSuccess('Senha alterada com sucesso!');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        setTimeout(() => { setShowPasswordSection(false); setPasswordSuccess(null); }, 2000);
      } else setPasswordError(res.data?.message || 'Erro ao alterar senha');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err)
        setPasswordError((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao alterar senha');
      else setPasswordError('Erro ao alterar senha');
    } finally { setChangingPassword(false); }
  };

  useEffect(() => {
    if (user) {
      const extras = user.extended_attributes
        ? (typeof user.extended_attributes === 'string' ? JSON.parse(user.extended_attributes) : user.extended_attributes)
        : {};
      const homeCep = user.home_cep || extras.home_cep || '';
      setFormData({
        ...user, ...extras,
        bio: user.bio || '',
        headline: user.headline || '',
        instagram: extras.instagram || user.instagram || '',
        linkedin: extras.linkedin || user.linkedin || '',
        website: extras.website || user.website || '',
        whatsapp: user.whatsapp || extras.whatsapp || user.phone || '',
        city: user.city || '', state: user.state || '',
        slug: user.slug || '', document: user.document || user.document_number || '',
        vehicle_type: user.vehicle_type || extras.vehicle_type || '',
        body_type: user.body_type || extras.body_type || '',
        trade_name: user.trade_name || user.name || '',
        is_available: user.is_available ?? 0,
        home_cep: homeCep,
      });
      setCepInput(homeCep.replace(/\D/g, '').slice(0, 8));
      if (user.avatar_url) setAvatarPreview(user.avatar_url);
      if (user.cover_url) setCoverPreview(user.cover_url);
    }
  }, [user]);

  const calculateLiveScore = () => {
    let s = 0;
    if (formData.trade_name) s += 20;
    if (formData.whatsapp) s += 20;
    if (avatarPreview) s += 20;
    if (formData.city) s += 20;
    if (formData.bio && formData.bio.length > 10) s += 20;
    return s;
  };

  const generateSlug = (text: string) =>
    text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").trim();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'avatar') { setAvatarPreview(reader.result as string); setAvatarFile(file); }
      else { setCoverPreview(reader.result as string); setCoverFile(file); }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      const extendedKeys = [
        'website_url', 'business_type', 'commercial_email',
        'special_courses', 'intl_license', 'preferred_regions', 'specific_regions', 'load_volume',
      ];
      const integerFields = ['is_available'];
      const directFields = ['instagram', 'linkedin', 'website', 'home_cep'];
      const extras: any = {};
      Object.keys(formData).forEach(key => {
        if (extendedKeys.includes(key)) extras[key] = formData[key];
        else if (directFields.includes(key) && formData[key]) data.append(key, formData[key]);
        else if (integerFields.includes(key)) data.append(key, String(formData[key]));
        else if (Array.isArray(formData[key])) data.append(key, JSON.stringify(formData[key]));
        else if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') data.append(key, formData[key]);
      });
      data.append('extended_attributes', JSON.stringify(extras));
      if (avatarFile) data.append('avatar_file', avatarFile);
      if (coverFile) data.append('cover_file', coverFile);
      const res = await api.post('/update-profile', data);
      if (res.data.success) {
        localStorage.setItem('@ChamaFrete:user', JSON.stringify(res.data.user));
        await refreshUser();
        Swal.fire({ icon: 'success', title: 'Perfil Atualizado!', timer: 2000, showConfirmButton: false });
      }
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Erro ao salvar', text: error.response?.data?.message || 'Erro interno' });
    } finally { setLoading(false); }
  };

  const score = calculateLiveScore();

  const profileStatus = (() => {
    if (user?.is_verified) return { text: 'Verificado', Icon: ShieldCheck, className: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200' };
    if (score === 100) return { text: 'Perfil Concluído', Icon: ShieldCheck, className: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-200' };
    if (score >= 80) return { text: 'Em Análise', Icon: AlertCircle, className: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 border-amber-200' };
    return { text: isCompany ? 'Dados Incompletos' : 'Perfil Incompleto', Icon: AlertCircle, className: 'bg-red-50 dark:bg-red-500/10 text-red-600 border-red-200' };
  })();
  const StatusIcon = profileStatus.Icon;

  const formatCep = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 8);
    return d.length <= 5 ? d : `${d.slice(0, 5)}-${d.slice(5)}`;
  };

  const scrollToSection = (id: SectionId) => {
    setActiveSection(id);
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <DashboardShell
      title="Editar Perfil"
      description={profileStatus.text}
      actions={
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-full border ${profileStatus.className} flex items-center gap-1 hidden sm:flex`}>
            <StatusIcon size={12} /> {profileStatus.text}
          </span>
          <a href={`/perfil/${formData.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <ExternalLink size={14} /> Ver Perfil
          </a>
        </div>
      }
    >
      {/* SECTION TABS */}
      <nav className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="flex gap-1 overflow-x-auto scrollbar-none px-5 lg:px-6">
            {SECTIONS.map(s => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button key={s.id} onClick={() => scrollToSection(s.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-wider whitespace-nowrap border-b-2 transition-all shrink-0 ${
                    isActive
                      ? `${theme.text} border-current`
                      : 'text-slate-400 dark:text-slate-500 border-transparent hover:text-slate-600 dark:hover:text-slate-300'
                  }`}>
                  <Icon size={14} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </nav>

      {/* PROGRESS CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" className="text-slate-100 dark:text-slate-800" strokeWidth="3" fill="none" />
                  <circle cx="18" cy="18" r="16" className={`${theme.text} transition-all duration-1000 ease-out`} strokeWidth="3" strokeDasharray={`${score}, 100`} strokeLinecap="round" fill="none" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-black text-xs text-slate-700 dark:text-slate-300">{score}%</span>
                </div>
              </div>
              <div className="min-w-0">
                <p className="font-black uppercase italic text-slate-800 dark:text-white text-sm leading-tight">Força do Perfil</p>
                <p className="text-[10px] font-bold text-slate-400 truncate">
                  {isCompany ? 'Preencha seus dados para habilitar módulos' : 'Complete para ser encontrado no Radar'}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              {[['trade_name', 'Nome'], ['whatsapp', 'WhatsApp'], ['avatarPreview', 'Foto'], ['city', 'Cidade'], ['bio', 'Bio']].map(([key, label]) => (
                <div key={key} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  key === 'avatarPreview' ? (avatarPreview ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-300')
                  : (formData[key] || (key === 'bio' && formData[key]?.length > 10) ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-300')
                }`} title={label}>
                  <CheckCircle2 size={14} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COVER + AVATAR */}
        <div id="section-profile" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className={`relative h-48 md:h-64 ${theme.light} group/cover`}>
            {coverPreview ? (
              <img src={coverPreview} className="w-full h-full object-cover transition-transform duration-700 group-hover/cover:scale-105" alt="" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-600">
                <ImageIcon size={40} className="opacity-40" />
                <p className="text-[9px] font-black uppercase mt-2 opacity-40">Capa (1200×400)</p>
              </div>
            )}
            <label className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg p-3 rounded-xl cursor-pointer hover:scale-105 transition-all border border-white/20">
              <Camera size={16} className={theme.text} />
              <input type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'cover')} />
            </label>

            <div className="absolute -bottom-12 left-6 md:left-8 flex items-end gap-5">
              <div className="relative group/avatar shrink-0">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white dark:bg-slate-900 p-1 shadow-xl">
                  <div className="w-full h-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {avatarPreview ? (
                      <img src={avatarPreview} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        {isDriver ? <User size={28} /> : <Building2 size={28} />}
                      </div>
                    )}
                  </div>
                  <label className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-all cursor-pointer rounded-2xl">
                    <Camera size={20} className="text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={e => handleFileChange(e, 'avatar')} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-16 pb-6 md:pb-8 px-6 md:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black uppercase italic text-slate-900 dark:text-white leading-tight tracking-tight">
                  {formData.trade_name || 'Nome não definido'}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`${theme.bg} text-white text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider`}>
                    {isDriver ? 'Motorista Autônomo' : 'Empresa'}
                  </span>
                  <span className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
                    <MapPin size={11} /> {formData.city || '---'}, {formData.state || 'UF'}
                  </span>
                </div>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(`https://chamafrete.com.br/perfil/${formData.slug}`); Swal.fire({ title: 'Copiado!', timer: 800, showConfirmButton: false, toast: true, position: 'top-end' }); }}
                className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors shrink-0">
                <Copy size={12} /> Copiar Link
              </button>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-5 gap-5 lg:gap-6">

          {/* LEFT — 3/5 */}
          <div className="lg:col-span-3 space-y-5 lg:space-y-6">

            {/* SECTION: INFOS PROFISSIONAIS */}
            <div id="section-bio" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm scroll-mt-36 lg:scroll-mt-40">
              <div className="flex items-center gap-3 mb-8">
                <div className={`w-1 h-8 ${theme.bg} rounded-full`} />
                <Briefcase size={18} className={theme.subtle} />
                <h3 className="text-base font-black uppercase italic text-slate-900 dark:text-white">Informações Profissionais</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <Field icon={Building2} label={isCompany ? "Nome Fantasia" : "Nome Completo"} value={formData.trade_name} disabled />
                <Field icon={Hash} label={isCompany ? "CNPJ" : "CPF"} value={formData.document} disabled />
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                {isDriver ? <DriverFields formData={formData} setFormData={setFormData} /> : <CompanyFields formData={formData} setFormData={setFormData} />}
              </div>
            </div>

            {/* SECTION: BIO */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm scroll-mt-36 lg:scroll-mt-40">
              <div className="flex items-center gap-3 mb-8">
                <div className={`w-1 h-8 ${theme.bg} rounded-full`} />
                <MessageCircle size={18} className={theme.subtle} />
                <h3 className="text-base font-black uppercase italic text-slate-900 dark:text-white">Apresentação</h3>
              </div>
              <div className="mb-4">
                <label className="text-[10px] font-bold uppercase text-slate-400 mb-1.5 block">Headline (cargo/resumo)</label>
                <input value={formData.headline || ''} onChange={e => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 outline-none font-medium text-sm text-slate-700 dark:text-slate-300 transition-all focus:border-slate-300 dark:focus:border-slate-600 focus:ring-2"
                  placeholder="Ex: Motorista especializado em cargas frigoríficas | Sudeste" maxLength={200} />
              </div>
              <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })}
                className={`w-full p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 outline-none font-medium text-sm text-slate-700 dark:text-slate-300 min-h-[160px] transition-all resize-none focus:border-slate-300 dark:focus:border-slate-600 focus:ring-2 ${theme.ring}`}
                placeholder="Conte sua experiência profissional, áreas de atuação, diferenciais..." />
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] font-bold text-slate-400">{(formData.bio?.length || 0)} caracteres</span>
                {(formData.bio?.length ?? 0) <= 20 && (
                  <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1"><AlertCircle size={10} /> Mínimo 20 caracteres</span>
                )}
              </div>
            </div>

            {/* SECTION: LOCATION */}
            <div id="section-location" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm scroll-mt-36 lg:scroll-mt-40">
              <div className="flex items-center gap-3 mb-8">
                <div className={`w-1 h-8 ${theme.bg} rounded-full`} />
                <MapPin size={18} className="text-slate-400" />
                <h3 className="text-base font-black uppercase italic text-slate-900 dark:text-white">Localização</h3>
              </div>

              <div className="space-y-5">
                <Field icon={AtSign} label="Slug da URL" value={formData.slug} onChange={v => setFormData({ ...formData, slug: generateSlug(v) })} />

                {/* CEP */}
                <div>
                  <div className="flex items-center gap-2 mb-3 ml-1">
                    <MapPin size={12} className="text-slate-400" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">CEP (preenche cidade/UF)</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input type="text" value={formatCep(cepInput)} onChange={e => { const cleaned = e.target.value.replace(/\D/g, '').slice(0, 8); setCepInput(cleaned); setFormData({ ...formData, home_cep: cleaned }); setCepStatus('idle'); }}
                        placeholder="00000-000" maxLength={9}
                        className={`w-full py-4 px-5 rounded-xl border-2 outline-none font-bold text-xs transition-all bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 ${
                          cepStatus === 'success' ? 'border-emerald-300 dark:border-emerald-600 bg-emerald-50/50' :
                          cepStatus === 'error' ? 'border-red-300 dark:border-red-600 bg-red-50/50' :
                          'border-slate-200 dark:border-slate-700 focus:border-slate-300 dark:focus:border-slate-600'
                        } ${theme.ring} pr-12`} />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {cepLoading ? <Loader2 size={16} className="animate-spin text-blue-500" /> :
                         cepStatus === 'success' ? <CheckCircle2 size={16} className="text-emerald-500" /> :
                         cepStatus === 'error' ? <XCircle size={16} className="text-red-500" /> :
                         <Search size={16} className="text-slate-300" />}
                      </div>
                    </div>
                    <button type="button" onClick={() => handleCepLookup(cepInput)} disabled={cepInput.length !== 8 || cepLoading}
                      className={`shrink-0 px-5 rounded-xl font-black uppercase text-[10px] tracking-wider transition-all ${theme.bg} text-white shadow-sm hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2`}>
                      {cepLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                      <span className="hidden sm:inline">Buscar</span>
                    </button>
                  </div>
                  <div className="mt-2 ml-1">
                    {cepStatus === 'success' && <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Cidade e UF preenchidos!</span>}
                    {cepStatus === 'error' && <span className="text-[10px] font-bold text-red-500">CEP não encontrado. Preencha manualmente.</span>}
                    {cepStatus === 'idle' && !cepInput && <span className="text-[10px] text-slate-400">Digite o CEP para buscar automaticamente</span>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field icon={MapPin} label="Cidade" value={formData.city} onChange={v => setFormData({ ...formData, city: v })} />
                  <Field icon={MapPin} label="UF" value={formData.state} onChange={v => setFormData({ ...formData, state: v.toUpperCase() })} />
                </div>

                <Field icon={Smartphone} label="WhatsApp" value={formData.whatsapp} onChange={v => setFormData({ ...formData, whatsapp: v })} />
              </div>
            </div>
          </div>

          {/* RIGHT — 2/5 */}
          <div className="lg:col-span-2 space-y-5 lg:space-y-6">

            {/* SECTION: DIGITAL PRESENCE */}
            <div id="section-social" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm scroll-mt-36 lg:scroll-mt-40">
              <div className="flex items-center gap-3 mb-8">
                <div className={`w-1 h-8 ${theme.bg} rounded-full`} />
                <Globe size={18} className="text-slate-400" />
                <h3 className="text-base font-black uppercase italic text-slate-900 dark:text-white">Presença Digital</h3>
              </div>

              <div className="space-y-5">
                <Field icon={Instagram} label="Instagram" placeholder="@seu_perfil" value={formData.instagram} onChange={v => setFormData({ ...formData, instagram: v })} />
                <Field icon={Link2} label="LinkedIn" placeholder="linkedin.com/in/seu-perfil" value={formData.linkedin} onChange={v => setFormData({ ...formData, linkedin: v })} />
                <Field icon={Globe} label="Site Oficial" placeholder="www.site.com" value={formData.website} onChange={v => setFormData({ ...formData, website: v })} />
              </div>
            </div>

            {/* EQUIPE CARD */}
            {isCompany && (
              <a href="/dashboard/equipe"
                className="block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${theme.light} flex items-center justify-center`}>
                    <Users size={24} className={theme.subtle} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black uppercase italic text-sm text-slate-900 dark:text-white">Equipe</h3>
                    <p className="text-[10px] font-bold text-slate-400 truncate">Gerenciar membros e convites</p>
                  </div>
                  <ArrowRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
                </div>
              </a>
            )}

            {/* SECTION: SECURITY */}
            <div id="section-security" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm scroll-mt-36 lg:scroll-mt-40">
              <div className="flex items-center gap-3 mb-8">
                <div className={`w-1 h-8 ${theme.bg} rounded-full`} />
                <Lock size={18} className="text-slate-400" />
                <h3 className="text-base font-black uppercase italic text-slate-900 dark:text-white">Segurança</h3>
              </div>

              {!showPasswordSection ? (
                <button onClick={() => setShowPasswordSection(true)}
                  className="w-full py-4 px-5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-2">
                  <Lock size={16} /> Alterar Senha
                </button>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div className="flex flex-col gap-4">
                    <PasswordField label="Senha Atual" value={currentPassword} onChange={setCurrentPassword} visible={showPasswords.current} onToggle={() => setShowPasswords(p => ({ ...p, current: !p.current }))} />
                    <PasswordField label="Nova Senha" value={newPassword} onChange={setNewPassword} visible={showPasswords.new} onToggle={() => setShowPasswords(p => ({ ...p, new: !p.new }))} placeholder="Mínimo 6 caracteres" />
                    <PasswordField label="Confirmar" value={confirmPassword} onChange={setConfirmPassword} visible={showPasswords.confirm} onToggle={() => setShowPasswords(p => ({ ...p, confirm: !p.confirm }))} />
                  </div>
                  {passwordError && <p className="text-red-500 text-xs font-bold flex items-center gap-1"><XCircle size={12} /> {passwordError}</p>}
                  {passwordSuccess && <p className="text-green-600 text-xs font-bold flex items-center gap-1"><CheckCircle2 size={12} /> {passwordSuccess}</p>}
                  <div className="flex gap-3">
                    <button type="button" onClick={() => { setShowPasswordSection(false); setPasswordError(null); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}
                      className="flex-1 py-3 border border-slate-300 dark:border-slate-600 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
                    <button type="submit" disabled={changingPassword}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95">
                      {changingPassword ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} Salvar
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* IDENTITY CARD */}
            {!identityConfirmed && (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-500/5 dark:to-yellow-500/5 rounded-2xl border border-amber-200 dark:border-amber-500/20 p-6">
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-md shrink-0">
                    <ShieldCheck size={22} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-black uppercase italic text-sm text-slate-900 dark:text-white mb-1">Identidade Confirmada</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Destaque seu perfil com o selo de verificação e aumente a confiança.</p>
                    <button onClick={() => window.location.href = '/dashboard/planos'}
                      className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-5 py-3 rounded-xl font-black uppercase text-[10px] transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                      Ver planos <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MÓDULOS */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-1 h-8 ${theme.bg} rounded-full`} />
                <LayoutDashboard size={18} className="text-slate-400" />
                <h3 className="text-base font-black uppercase italic text-slate-900 dark:text-white">Módulos</h3>
              </div>
              <div className="space-y-3">
                {userModules
                  .filter(m => m.key !== 'identity_verification' && m.is_active)
                  .map(mod => {
                    const info = MODULE_LABELS[mod.key];
                    if (!info) return null;
                    const isActive = mod.is_active;
                    return (
                      <div key={mod.key} className="flex items-center gap-3 p-3 rounded-xl transition-all bg-emerald-50 dark:bg-emerald-900/10">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-100 dark:bg-emerald-800/30 text-emerald-600">
                          {info.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">
                            {info.label}
                          </p>
                        </div>
                        <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-lg text-emerald-600 bg-emerald-100 dark:bg-emerald-800/30">
                          Ativo
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

      {/* STICKY SAVE BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-4 flex items-center justify-between gap-4">
          <div className="hidden md:flex items-center gap-3 text-slate-400">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500"><ShieldCheck size={18} /></div>
            <div>
              <p className="text-[9px] font-black uppercase text-slate-800 dark:text-white">Dados Criptografados</p>
              <p className="text-[8px] uppercase font-bold text-slate-400">Alinhado com a LGPD</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={loading}
            className={`w-full md:w-auto ${theme.bg} text-white px-10 py-4 rounded-xl font-black uppercase italic text-xs flex items-center justify-center gap-3 ${theme.hover} transition-all shadow-lg disabled:opacity-50 active:scale-95`}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
          </button>
        </div>
      </div>
    </DashboardShell>
  );
};

const Field = ({ icon: Icon, label, value, onChange, placeholder, disabled }: any) => (
  <div>
    <label className="flex items-center gap-1.5 mb-2 ml-1">
      {Icon && <Icon size={11} className="text-slate-400" />}
      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</span>
    </label>
    <input type="text" value={value || ''} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} disabled={disabled}
      className={`w-full py-4 px-5 rounded-xl border-2 outline-none font-semibold text-sm transition-all bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 ${
        disabled
          ? 'border-slate-100 dark:border-slate-800 opacity-60 cursor-not-allowed select-none'
          : 'border-slate-200 dark:border-slate-700 focus:border-slate-300 dark:focus:border-slate-600'
      }`} />
  </div>
);

const PasswordField = ({ label, value, onChange, visible, onToggle, placeholder }: any) => (
  <div>
    <label className="flex items-center gap-1.5 mb-2 ml-1">
      <Lock size={11} className="text-slate-400" />
      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{label}</span>
    </label>
    <div className="relative">
      <input type={visible ? "text" : "password"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full py-4 px-5 rounded-xl border-2 border-slate-200 dark:border-slate-700 outline-none font-semibold text-sm transition-all bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:border-slate-300 dark:focus:border-slate-600 pr-14" />
      <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
        {visible ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  </div>
);

export default MyProfile;
