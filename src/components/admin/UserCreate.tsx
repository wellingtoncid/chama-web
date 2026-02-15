import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import Swal from 'sweetalert2';
import { 
  User, MapPin, ShieldCheck, Save, Loader2, 
  Mail, Lock, Smartphone, CheckCircle2, Building2, Truck, 
  Globe, Navigation, LocateFixed, Fingerprint, Briefcase,
  Building, UserCircle, ShieldAlert
} from 'lucide-react';

export default function UserCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ORIGEM');

  const [form, setForm] = useState<any>({
    origin_group: 'MARKETPLACE', // MARKETPLACE ou INTERNAL
    entity_type: 'PJ', 
    name: '',
    company_name: '',
    email: '', 
    password: '', 
    whatsapp: '',
    role: 'company', 
    user_type: 'COMPANY', 
    status: 'active',
    plan_type: 'free',
    cpf_cnpj: '', 
    zip_code: '', 
    address: '', 
    city: '', 
    state: '',
    latitude: '', 
    longitude: '',
    is_shipper: 0, 
    is_advertiser: 0, 
    is_seller: 0,
    permissions: []
  });

  const ACL_OPTIONS = [
    { id: 'freights.view', label: 'Visualizar Fretes', desc: 'Ver cargas e detalhes no marketplace.' },
    { id: 'freights.manage', label: 'Gestão de Cargas', desc: 'Criar, editar e gerenciar fretes e lances.' },
    { id: 'billing.all', label: 'Financeiro Total', desc: 'Acesso a faturas e extratos bancários.' },
    { id: 'users.manage', label: 'Gestão de Usuários', desc: 'Administrar outros membros da equipe.' },
    { id: 'ads.create', label: 'Gestão de Anúncios', desc: 'Criar banners e publicidade no App.' },
  ];

  // --- VALIDAÇÃO DE FLUXO (O CORAÇÃO DA TRAVA) ---
  const canAccessTab = (tabName: string) => {
    // Origem é sempre acessível
    if (tabName === 'ORIGEM') return true;

    // Para acessar Identidade (BASICO), precisa ter definido o grupo de origem
    if (tabName === 'BASICO') return !!form.origin_group;

    // Para acessar Logística ou Privilégios, precisa de Nome, Email, Senha e Doc
    if (tabName === 'GEO' || tabName === 'PODER') {
      const basicInfoOk = form.name && form.email && form.password && form.cpf_cnpj;
      if (form.entity_type === 'PJ' && !form.company_name) return false;
      return basicInfoOk;
    }
    return false;
  };

  const handleTabChange = (target: string) => {
    if (canAccessTab(target)) {
      setActiveTab(target);
    } else {
      Swal.fire({
        title: 'Calma lá!',
        text: 'Preencha os dados obrigatórios da etapa atual antes de prosseguir.',
        icon: 'warning',
        confirmButtonColor: '#2563eb'
      });
    }
  };

  // --- AUTOMATIONS (PRESERVADAS) ---
  const fetchCoords = async (address: string, city: string, state: string) => {
    if (!address || !city) return;
    setGeoLoading(true);
    try {
      const query = encodeURIComponent(`${address}, ${city} - ${state}, Brasil`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`).then(r => r.json());
      if (res && res[0]) setForm((prev: any) => ({ ...prev, latitude: res[0].lat, longitude: res[0].lon }));
    } catch (e) { console.error("Geo Error"); }
    finally { setGeoLoading(false); }
  };

  const handleCEP = async (val: string) => {
    const cep = val.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`).then(r => r.json());
        if (!res.erro) {
          setForm((prev: any) => ({ ...prev, address: res.logradouro, city: res.localidade, state: res.uf, zip_code: val }));
          fetchCoords(res.logradouro, res.localidade, res.uf);
        }
      } catch (e) { console.error("CEP Error"); }
    }
  };

  const handleCNPJ = async (val: string) => {
    const doc = val.replace(/\D/g, '');
    if (doc.length === 14) {
      try {
        const res = await fetch(`https://publica.cnpj.ws/cnpj/${doc}`).then(r => r.json());
        setForm((prev: any) => ({ 
          ...prev, 
          company_name: res.razao_social,
          name: res.estabelecimento.nome_fantasia || res.razao_social,
          address: `${res.estabelecimento.tipo_logradouro} ${res.estabelecimento.logradouro}`,
          city: res.estabelecimento.cidade.nome,
          state: res.estabelecimento.estado.sigla,
          zip_code: res.estabelecimento.cep,
          cpf_cnpj: val
        }));
        fetchCoords(`${res.estabelecimento.tipo_logradouro} ${res.estabelecimento.logradouro}`, res.estabelecimento.cidade.nome, res.estabelecimento.estado.sigla);
      } catch (e) { console.log("CNPJ Error"); }
    }
  };

  const saveUser = async () => {
    if (!canAccessTab('PODER')) return Swal.fire('Erro', 'Complete todas as etapas antes de ativar.', 'error');
    setLoading(true);
    try {
      const res = await api.post('/admin/users/store-complete', form);
      if (res.data.success) {
        Swal.fire({ title: 'Sucesso!', text: 'Player provisionado.', icon: 'success' });
        navigate('/dashboard/admin/usuarios');
      }
    } catch (e: any) {
      Swal.fire('Erro', e.response?.data?.message || 'Falha ao salvar', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-[1400px] mx-auto p-4 lg:p-10 space-y-8 bg-[#f8fafc] min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] shadow-xl border border-white">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">
            Novo <span className="text-blue-600">Player</span>
          </h1>
        </div>
        <button onClick={saveUser} disabled={loading} className="bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase italic shadow-2xl flex items-center gap-3 hover:scale-105 transition-all disabled:opacity-30">
          {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />} Ativar no Sistema
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* NAV LATERAL COM TRAVAS */}
        <aside className="col-span-12 lg:col-span-3 space-y-3">
          <NavCard active={activeTab === 'ORIGEM'} locked={false} onClick={() => handleTabChange('ORIGEM')} icon={ShieldAlert} title="Origem" desc="Definição de Perfil" />
          <NavCard active={activeTab === 'BASICO'} locked={!canAccessTab('BASICO')} onClick={() => handleTabChange('BASICO')} icon={User} title="Identidade" desc="Dados e Login" />
          {form.origin_group === 'MARKETPLACE' && (
            <NavCard active={activeTab === 'GEO'} locked={!canAccessTab('GEO')} onClick={() => handleTabChange('GEO')} icon={MapPin} title="Logística" desc="Endereço e Geo" />
          )}
          <NavCard active={activeTab === 'PODER'} locked={!canAccessTab('PODER')} onClick={() => handleTabChange('PODER')} icon={ShieldCheck} title="Privilégios" desc="ACL Matrix" />
        </aside>

        <main className="col-span-12 lg:col-span-9 bg-white rounded-[3.5rem] p-8 lg:p-12 border border-slate-100 shadow-2xl min-h-[600px]">
          
          {/* PASSO 0: ORIGEM */}
          {activeTab === 'ORIGEM' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <SectionTitle num="00" title="Perfil de Origem" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectionCard 
                  active={form.origin_group === 'INTERNAL'} 
                  onClick={() => setForm({
                    ...form, origin_group: 'INTERNAL', entity_type: 'PF', user_type: 'STAFF', role: 'staff',
                    is_shipper: 0, is_advertiser: 0, is_seller: 0
                  })}
                  icon={ShieldAlert} title="Equipe Interna" desc="Colaboradores e Administração."
                />
                <SelectionCard 
                  active={form.origin_group === 'MARKETPLACE'} 
                  onClick={() => setForm({...form, origin_group: 'MARKETPLACE', entity_type: 'PJ', user_type: 'COMPANY', role: 'company'})}
                  icon={Globe} title="Marketplace" desc="Motoristas e Empresas Externas."
                />
              </div>

              {form.origin_group === 'MARKETPLACE' && (
                <div className="pt-8 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-6 tracking-widest text-center">Habilitar Módulos Comerciais:</p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <RoleToggle label="Embarcador" active={form.is_shipper} onClick={() => setForm({...form, is_shipper: form.is_shipper ? 0 : 1})} icon={Truck} />
                    <RoleToggle label="Anunciante" active={form.is_advertiser} onClick={() => setForm({...form, is_advertiser: form.is_advertiser ? 0 : 1})} icon={Globe} />
                    <RoleToggle label="Vendedor" active={form.is_seller} onClick={() => setForm({...form, is_seller: form.is_seller ? 0 : 1})} icon={Briefcase} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PASSO 1: IDENTIDADE */}
          {activeTab === 'BASICO' && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
              <SectionTitle num="01" title="Identificação" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {form.origin_group === 'MARKETPLACE' ? (
                  <ModernSelect label="Natureza" value={form.entity_type} options={['PJ', 'PF']} onChange={(v:string) => setForm({...form, entity_type: v, user_type: v === 'PJ' ? 'COMPANY' : 'DRIVER', role: v.toLowerCase()})} />
                ) : (
                  <div className="p-4 bg-slate-100 rounded-2xl flex items-center gap-3 border-2 border-slate-200">
                    <UserCircle className="text-slate-400" />
                    <span className="text-[10px] font-black uppercase text-slate-500 italic">Travado em Pessoa Física</span>
                  </div>
                )}

                <ModernSelect 
                  label="Tipo de Acesso" 
                  value={form.user_type} 
                  options={form.origin_group === 'INTERNAL' ? ['STAFF', 'ADMIN'] : ['DRIVER', 'COMPANY']} 
                  onChange={(v:string) => setForm({...form, user_type: v, role: v.toLowerCase()})} 
                />

                {form.entity_type === 'PJ' && (
                  <div className="md:col-span-2">
                    <ModernInput label="Razão Social" icon={Building2} value={form.company_name} onChange={(e:any) => setForm({...form, company_name: e.target.value})} />
                  </div>
                )}

                <ModernInput label="Nome Completo" icon={Fingerprint} value={form.name} onChange={(e:any) => setForm({...form, name: e.target.value})} />
                <ModernInput label="E-mail de Acesso" icon={Mail} value={form.email} onChange={(e:any) => setForm({...form, email: e.target.value})} />
                <ModernInput label="Senha" type="password" icon={Lock} value={form.password} onChange={(e:any) => setForm({...form, password: e.target.value})} />
                <ModernInput 
                  label={form.entity_type === 'PJ' ? "CNPJ" : "CPF"} 
                  value={form.cpf_cnpj} 
                  onBlur={(e:any) => form.entity_type === 'PJ' && handleCNPJ(e.target.value)} 
                  onChange={(e:any) => setForm({...form, cpf_cnpj: e.target.value})} 
                />
              </div>
            </div>
          )}

          {/* PASSO 2: GEO */}
          {activeTab === 'GEO' && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
              <SectionTitle num="02" title="Logística" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ModernInput label="CEP" value={form.zip_code} onBlur={(e:any) => handleCEP(e.target.value)} onChange={(e:any) => setForm({...form, zip_code: e.target.value})} />
                <div className="md:col-span-2"><ModernInput label="Endereço" value={form.address} onChange={(e:any) => setForm({...form, address: e.target.value})} /></div>
                <ModernInput label="Cidade" value={form.city} onChange={(e:any) => setForm({...form, city: e.target.value})} />
                <ModernInput label="Estado" value={form.state} onChange={(e:any) => setForm({...form, state: e.target.value})} />
                <ModernInput label="Latitude" value={form.latitude} readOnly className="opacity-50" />
                <ModernInput label="Longitude" value={form.longitude} readOnly className="opacity-50" />
              </div>
            </div>
          )}

          {/* PASSO 3: ACL */}
          {activeTab === 'PODER' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <SectionTitle num="03" title="Privilégios" />
              <div className="grid grid-cols-1 gap-4">
                {ACL_OPTIONS.map(p => (
                  <button key={p.id} onClick={() => {
                    const next = form.permissions.includes(p.id) ? form.permissions.filter((x:any)=>x!==p.id) : [...form.permissions, p.id];
                    setForm({...form, permissions: next});
                  }} className={`p-6 rounded-[2rem] border-2 text-left flex items-center justify-between transition-all ${form.permissions.includes(p.id) ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-white hover:border-blue-200'}`}>
                    <div className="flex items-center gap-5">
                      <div className={`p-3 rounded-2xl ${form.permissions.includes(p.id) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}><ShieldCheck size={20} /></div>
                      <div><h4 className="font-black text-xs uppercase italic text-slate-800">{p.label}</h4><p className="text-[10px] font-bold text-slate-400 uppercase">{p.desc}</p></div>
                    </div>
                    {form.permissions.includes(p.id) ? <CheckCircle2 className="text-blue-600" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// --- ATOMIC COMPONENTS ---
const NavCard = ({ active, locked, onClick, icon: Icon, title, desc }: any) => (
  <button onClick={onClick} disabled={locked} className={`w-full p-5 rounded-[1.8rem] text-left transition-all flex items-center gap-4 ${active ? 'bg-slate-900 text-white shadow-2xl' : 'bg-white text-slate-400 border border-slate-100'} ${locked ? 'opacity-20 cursor-not-allowed' : 'hover:bg-slate-50'}`}>
    <div className={`p-3 rounded-2xl ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-300'}`}><Icon size={18} /></div>
    <div><p className="font-black text-[11px] uppercase italic leading-none">{title}</p><p className="text-[9px] font-bold mt-1 uppercase opacity-50">{desc}</p></div>
  </button>
);

const SectionTitle = ({ num, title }: any) => (
  <div className="flex items-center gap-4"><span className="text-3xl font-black text-slate-100 italic">{num}</span><h3 className="text-lg font-black text-slate-800 uppercase italic tracking-tighter">{title}</h3><div className="flex-1 h-[1px] bg-slate-100"></div></div>
);

const ModernInput = ({ label, icon: Icon, className, ...props }: any) => (
  <div className="space-y-2 w-full">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">{label}</label>
    <div className="relative">{Icon && <Icon size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />}<input className={`w-full p-4 ${Icon ? 'pl-12' : 'pl-6'} bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-100 focus:bg-white outline-none font-bold text-slate-700 shadow-inner ${className}`} {...props} /></div>
  </div>
);

const ModernSelect = ({ label, options, onChange, value }: any) => (
  <div className="space-y-2 w-full">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">{label}</label>
    <select onChange={e => onChange(e.target.value)} value={value} className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-100 outline-none font-black text-[10px] uppercase text-slate-700 shadow-inner cursor-pointer">{options.map((o: string) => <option key={o} value={o}>{o}</option>)}</select>
  </div>
);

const RoleToggle = ({ label, active, onClick, icon: Icon }: any) => (
  <button onClick={onClick} className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase italic transition-all border-2 ${active ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}><Icon size={14} /> {label}</button>
);

const SelectionCard = ({ active, onClick, icon: Icon, title, desc }: any) => (
  <button onClick={onClick} className={`p-8 rounded-[2.5rem] border-4 text-left transition-all ${active ? 'border-blue-600 bg-blue-50/50 shadow-xl scale-105' : 'border-slate-50 bg-white hover:border-slate-200'}`}><div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}><Icon size={24} /></div><h4 className={`font-black uppercase italic ${active ? 'text-blue-900' : 'text-slate-500'}`}>{title}</h4><p className="text-[10px] font-bold text-slate-400 mt-1 uppercase leading-tight">{desc}</p></button>
);