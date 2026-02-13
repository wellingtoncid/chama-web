import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import Swal from 'sweetalert2';
import { 
  ArrowLeft, User, Building2, ShieldCheck, Truck, Save, Loader2, 
  Mail, Lock, Smartphone, MapPin, Star, ShieldAlert, CheckCircle2 
} from 'lucide-react';

export default function UserCreate() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('access');

  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    password: '',
    whatsapp: '',
    role: 'driver', // Padrão da tabela
    user_type: 'DRIVER', 
    status: 'active',
    plan_id: 1,
    plan_type: 'free',
    balance: 0,
    permissions: '',
    // Flags
    is_shipper: 0,
    is_advertiser: 0,
    is_seller: 0
  });

  // Mapeamento de Permissões Padrão por Role
  const roleDefaults: any = {
    admin: { permissions: '["*"]', type: 'OPERATOR' },
    manager: { permissions: '["users.view", "users.edit", "reports.view"]', type: 'OPERATOR' },
    analyst: { permissions: '["users.view", "support.manage"]', type: 'OPERATOR' },
    driver: { permissions: '["freights.view", "freights.accept"]', type: 'DRIVER' },
    company: { permissions: '["fleet.manage", "team.view"]', type: 'COMPANY' }
  };

  const handleRoleSelection = (role: string) => {
    const defaults = roleDefaults[role] || roleDefaults.driver;
    setFormData({
      ...formData,
      role: role,
      user_type: defaults.type,
      permissions: defaults.permissions
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      return Swal.fire({ icon: 'warning', title: 'CAMPOS VAZIOS', text: 'Preencha Nome, Email e Senha.', confirmButtonColor: '#0f172a' });
    }

    try {
      setSaving(true);
      const res = await api.post('/admin-create-user', formData);

      if (res.data.success) {
        await Swal.fire({
          icon: 'success',
          title: 'CONTA CRIADA!',
          text: 'Usuário registrado com sucesso no ecossistema.',
          timer: 2000,
          showConfirmButton: false
        });
        navigate(`/dashboard/admin/usuarios/${res.data.user_id}`);
      }
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: 'ERRO NO CADASTRO', text: e.response?.data?.message || 'Falha ao processar.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* BARRA DE AÇÕES */}
      <div className="flex justify-between items-center bg-white/50 p-4 rounded-3xl backdrop-blur-sm">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase transition-all">
          <ArrowLeft size={16} /> Voltar para Gestão
        </button>

        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase italic shadow-2xl shadow-slate-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
          {saving ? 'Gravando Dados...' : 'Finalizar e Ativar Conta'}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        
        {/* NAVEGAÇÃO LATERAL */}
        <aside className="col-span-12 lg:col-span-3 space-y-3">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 mb-6 text-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-300 border-4 border-white shadow-inner">
                <User size={40} />
             </div>
             <h3 className="font-black italic uppercase text-slate-800 text-sm">Novo Perfil</h3>
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">ID: AUTO_GENERATED</p>
          </div>

          <TabBtn id="access" label="Segurança e Login" icon={Lock} active={activeTab} onClick={setActiveTab} />
          <TabBtn id="profile" label="Localização e Bio" icon={MapPin} active={activeTab} onClick={setActiveTab} />
          <TabBtn id="permissions" label="Nível de Poder" icon={ShieldAlert} active={activeTab} onClick={setActiveTab} />
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="col-span-12 lg:col-span-9 bg-white rounded-[3rem] border border-slate-100 p-12 shadow-sm relative overflow-hidden">
          
          {/* ABA 1: ACESSO */}
          {activeTab === 'access' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <HeaderSection title="Credenciais de Acesso" subtitle="Essas informações serão usadas para login no sistema" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input label="Nome Completo" value={formData.name} onChange={(v:any)=>setFormData({...formData, name:v})} />
                <Input label="E-mail Principal" value={formData.email} onChange={(v:any)=>setFormData({...formData, email:v})} icon={Mail} />
                <Input label="Senha Provisória" value={formData.password} onChange={(v:any)=>setFormData({...formData, password:v})} type="password" />
                <Input label="WhatsApp" value={formData.whatsapp} onChange={(v:any)=>setFormData({...formData, whatsapp:v})} icon={Smartphone} />
                
                <Select label="Nível de Acesso (Role)" value={formData.role} 
                  options={['admin', 'manager', 'analyst', 'assistant', 'driver', 'company', 'shipper']} 
                  onChange={(v:any) => handleRoleSelection(v)} 
                />

                <Select label="Tipo de Usuário (DB)" value={formData.user_type} 
                  options={['DRIVER', 'COMPANY', 'ADVERTISER', 'OPERATOR', 'SHIPPER']} 
                  onChange={(v:any) => setFormData({...formData, user_type: v})} 
                />
              </div>

              <div className="pt-6 border-t border-slate-50">
                 <p className="text-[10px] font-black uppercase text-slate-400 mb-4">Módulos Ativos para este usuário</p>
                 <div className="flex gap-4">
                    <ToggleBadge label="Anunciante" active={formData.is_advertiser} onClick={()=>setFormData({...formData, is_advertiser: formData.is_advertiser ? 0 : 1})} />
                    <ToggleBadge label="Embarcador" active={formData.is_shipper} onClick={()=>setFormData({...formData, is_shipper: formData.is_shipper ? 0 : 1})} />
                    <ToggleBadge label="Vendedor" active={formData.is_seller} onClick={()=>setFormData({...formData, is_seller: formData.is_seller ? 0 : 1})} />
                 </div>
              </div>
            </div>
          )}

          {/* ABA 2: PERFIL */}
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <HeaderSection title="Identificação e Localização" subtitle="Dados para emissão de documentos e geolocalização" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input label="CPF ou CNPJ" value={formData.document} onChange={(v:any)=>setFormData({...formData, document:v})} />
                <Input label="Cidade" value={formData.city} onChange={(v:any)=>setFormData({...formData, city:v})} />
                <Input label="Estado (UF)" value={formData.state} onChange={(v:any)=>setFormData({...formData, state:v.toUpperCase()})} maxLength={2} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Latitude" value={formData.latitude} onChange={(v:any)=>setFormData({...formData, latitude:v})} />
                  <Input label="Longitude" value={formData.longitude} onChange={(v:any)=>setFormData({...formData, longitude:v})} />
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: PERMISSÕES */}
          {activeTab === 'permissions' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <HeaderSection title="Regras de Permissão" subtitle="Controle o que este usuário pode visualizar ou editar" />
              <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 block">Payload JSON de Permissões</label>
                <textarea 
                  value={formData.permissions}
                  onChange={(e)=>setFormData({...formData, permissions: e.target.value})}
                  className="w-full h-40 bg-white border border-slate-100 rounded-2xl p-4 font-mono text-xs outline-none focus:ring-2 ring-slate-200 transition-all"
                  placeholder='["*"]'
                />
                <p className="text-[9px] text-slate-400 font-medium italic">Use ["*"] para acesso total ou liste as chaves específicas separadas por vírgula.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// COMPONENTES AUXILIARES INTERNOS
const TabBtn = ({ id, label, icon: Icon, active, onClick }: any) => (
  <button onClick={() => onClick(id)} className={`w-full flex items-center gap-3 px-6 py-5 rounded-3xl font-black text-[10px] uppercase transition-all ${active === id ? 'bg-slate-900 text-white shadow-2xl shadow-slate-200 -translate-y-1' : 'bg-white text-slate-400 border border-slate-50 hover:bg-slate-50'}`}>
    <Icon size={18} className={active === id ? 'text-blue-400' : ''} /> {label}
  </button>
);

const HeaderSection = ({ title, subtitle }: any) => (
  <div className="border-b border-slate-50 pb-6 mb-8">
    <h2 className="text-2xl font-black uppercase italic text-slate-900 leading-none">{title}</h2>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{subtitle}</p>
  </div>
);

const Input = ({ label, value, onChange, type = "text", icon: Icon, ...props }: any) => (
  <div className="space-y-2 group">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 group-focus-within:text-slate-900 transition-colors">{label}</label>
    <div className="relative">
      {Icon && <Icon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />}
      <input 
        type={type} 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
        className={`w-full p-4 ${Icon ? 'pl-11' : 'pl-4'} bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-slate-100 transition-all`}
        {...props}
      />
    </div>
  </div>
);

const Select = ({ label, value, options, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{label}</label>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-sm outline-none cursor-pointer focus:bg-white focus:border-slate-100 transition-all uppercase"
    >
      {options.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const ToggleBadge = ({ label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-[10px] uppercase italic transition-all border-2 ${active ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-slate-50 border-transparent text-slate-400'}`}
  >
    {active ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-200" />}
    {label}
  </button>
);