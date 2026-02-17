import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import Swal from 'sweetalert2';
import { 
  ShieldCheck, Save, Loader2, Mail, Lock, Smartphone, 
  CheckCircle2, Building2, Truck, Globe, Fingerprint, 
  Briefcase, UserCircle, ShieldAlert, Zap, Search,
  ChevronRight, LayoutGrid, Database, Key
} from 'lucide-react';

export default function AdminUserProvisioning() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [form, setForm] = useState<any>({
    // Identidade Única
    name: '',
    email: '', 
    password: '', 
    whatsapp: '',
    document: '', // CPF/CNPJ
    
    // Configurações de Acesso
    origin: 'MARKETPLACE', // INTERNAL ou MARKETPLACE
    user_type: 'COMPANY',  // DRIVER, COMPANY, OPERATOR, ADMIN
    role: 'manager',       // manager, analyst, assistant, driver, etc
    
    // Dados de Localização
    city: '', 
    state: '',
    zip_code: '',

    // Flags de Negócio
    modules: {
      is_shipper: false,
      is_advertiser: false,
      is_seller: false,
    },

    // Matriz de Permissões
    permissions: []
  });

  // --- BUSCA AUTOMATIZADA DE CNPJ ---
  const handleDocumentLookup = async (doc: string) => {
    const cleanDoc = doc.replace(/\D/g, '');
    
    // Só dispara se tiver 14 dígitos
    if (cleanDoc.length === 14) {
      try {
        const response = await fetch(`https://publica.cnpj.ws/cnpj/${cleanDoc}`);
        
        // Se a API retornar 404 ou erro, tratamos aqui para não quebrar o React
        if (!response.ok) {
          throw new Error("CNPJ não encontrado ou base de dados offline");
        }

        const res = await response.json();

        // USA OPTIONAL CHAINING (?.) PARA NÃO QUEBRAR A TELA
        // E fornece strings vazias como fallback
        setForm((prev: any) => ({
          ...prev,
          // Preenche o nome da empresa ou o nome fantasia
          name: res?.estabelecimento?.nome_fantasia || res?.razao_social || prev.name,
          
          // Localização com proteção absoluta
          city: res?.estabelecimento?.cidade?.nome || '',
          state: res?.estabelecimento?.estado?.sigla || '',
          zip_code: res?.estabelecimento?.cep || '',
          
          // Dados adicionais caso existam no seu formulário
          corporate_name: res?.razao_social || '',
          document: cleanDoc
        }));

        Swal.fire({ 
          toast: true, 
          position: 'top-end', 
          icon: 'success', 
          title: 'Dados importados!', 
          showConfirmButton: false, 
          timer: 2000 
        });

      } catch (e: any) {
        console.error("Erro na busca do CNPJ:", e.message);
        
        // Notifica o usuário sem travar o sistema
        Swal.fire({
          title: 'CNPJ não encontrado',
          text: 'Não conseguimos importar os dados automaticamente. Por favor, preencha manualmente.',
          icon: 'info',
          confirmButtonColor: '#2563eb'
        });
      }
    }
  };

  // --- SUBMISSÃO ---
  const handleFinalize = async () => {
    setLoading(true);
    try {
      // Ajuste para o formato que o seu AdminController espera
      const payload = {
        ...form,
        is_shipper: form.modules.is_shipper ? 1 : 0,
        is_advertiser: form.modules.is_advertiser ? 1 : 0,
        is_seller: form.modules.is_seller ? 1 : 0,
        permissions: JSON.stringify(form.permissions)
      };

      const res = await api.post('/admin/users/admin-create-user', payload);
      if (res.data.success) {
        Swal.fire('Ativado!', 'O novo player já pode acessar o sistema.', 'success');
        navigate('/dashboard/admin/usuarios');
      }
    } catch (e: any) {
      Swal.fire('Erro', e.response?.data?.message || 'Falha no provisionamento', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-6 lg:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER MINIMALISTA */}
        <header className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold uppercase text-[10px] tracking-widest">
              <Zap size={14} /> Sistema de Provisionamento v2
            </div>
            <h1 className="text-5xl font-black text-slate-900 italic uppercase leading-none">
              Novo <span className="text-blue-600 underline decoration-4 underline-offset-8">Player</span>
            </h1>
          </div>
          <div className="flex gap-4">
             {currentStep > 1 && (
               <button onClick={() => setCurrentStep(v => v - 1)} className="px-6 py-4 font-bold text-slate-500 hover:text-slate-800 transition-all">Voltar</button>
             )}
             {currentStep < 3 ? (
               <button 
                 onClick={() => setCurrentStep(v => v + 1)} 
                 className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase italic shadow-lg shadow-blue-500/20 hover:scale-105 transition-all flex items-center gap-3"
               >
                 Próximo Passo <ChevronRight size={20} />
               </button>
             ) : (
               <button 
                 onClick={handleFinalize}
                 disabled={loading}
                 className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase italic shadow-2xl hover:bg-blue-600 transition-all flex items-center gap-3"
               >
                 {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />} Ativar Acesso
               </button>
             )}
          </div>
        </header>

        <div className="grid grid-cols-12 gap-10">
          
          {/* LADO ESQUERDO: INFRAESTRUTURA DE DADOS */}
          <div className="col-span-12 lg:col-span-7 space-y-8">
            
            {/* ETAPA 1: TIPO DE CONTA */}
            {currentStep === 1 && (
              <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-300">
                <StepHeader icon={LayoutGrid} num="01" title="Arquitetura de Conta" desc="Onde este usuário se posiciona no ecossistema?" />
                
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <ChoiceCard 
                    selected={form.origin === 'MARKETPLACE'}
                    onClick={() => setForm({...form, origin: 'MARKETPLACE', user_type: 'COMPANY', role: 'driver'})}
                    title="Marketplace"
                    desc="Clientes externos, Motoristas e Transportadoras"
                    icon={Globe}
                  />
                  <ChoiceCard 
                    selected={form.origin === 'INTERNAL'}
                    onClick={() => setForm({...form, origin: 'INTERNAL', user_type: 'OPERATOR', role: 'analyst'})}
                    title="Backoffice"
                    desc="Equipe interna, Suporte e Administradores"
                    icon={ShieldAlert}
                  />
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-2 gap-6">
                   <ModernSelect 
                    label="Tipo de Entidade"
                    value={form.user_type}
                    options={form.origin === 'MARKETPLACE' ? ['DRIVER', 'COMPANY', 'ADVERTISER'] : ['OPERATOR', 'ADMIN']}
                    onChange={(val: any) => setForm({...form, user_type: val})}
                   />
                   <ModernSelect 
                    label="Cargo Operacional"
                    value={form.role}
                    options={form.origin === 'INTERNAL' ? ['admin', 'manager', 'analyst', 'assistant'] : ['driver', 'company', 'shipper']}
                    onChange={(val: any) => setForm({...form, role: val})}
                   />
                </div>
              </div>
            )}

            {/* ETAPA 2: IDENTIDADE */}
            {currentStep === 2 && (
              <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200 animate-in slide-in-from-right-8 duration-300">
                <StepHeader icon={Fingerprint} num="02" title="Identidade do Player" desc="Dados fundamentais para login e localização" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="md:col-span-2">
                    <ModernInput label="Nome Completo / Razão Social" icon={UserCircle} value={form.name} onChange={(e:any) => setForm({...form, name: e.target.value})} />
                  </div>
                  <ModernInput label="E-mail Principal" icon={Mail} value={form.email} onChange={(e:any) => setForm({...form, email: e.target.value})} />
                  <ModernInput label="Documento (CPF/CNPJ)" icon={Search} value={form.document} onBlur={(e:any) => handleDocumentLookup(e.target.value)} onChange={(e:any) => setForm({...form, document: e.target.value})} />
                  <ModernInput label="WhatsApp" icon={Smartphone} value={form.whatsapp} onChange={(e:any) => setForm({...form, whatsapp: e.target.value})} />
                  <ModernInput label="Senha de Acesso" icon={Lock} type="password" value={form.password} onChange={(e:any) => setForm({...form, password: e.target.value})} />
                  
                  <div className="md:col-span-2 grid grid-cols-3 gap-4 pt-4">
                    <ModernInput label="CEP" value={form.zip_code} onChange={(e:any) => setForm({...form, zip_code: e.target.value})} />
                    <ModernInput label="Cidade" value={form.city} onChange={(e:any) => setForm({...form, city: e.target.value})} />
                    <ModernInput label="UF" value={form.state} onChange={(e:any) => setForm({...form, state: e.target.value})} />
                  </div>
                </div>
              </div>
            )}

            {/* ETAPA 3: PERMISSÕES */}
            {currentStep === 3 && (
              <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200 animate-in slide-in-from-right-8 duration-300">
                <StepHeader icon={Key} num="03" title="Matriz de Poder" desc="O que este usuário pode ver e fazer?" />
                
                <div className="grid grid-cols-1 gap-3 mt-8">
                  {ACL_LIST.map(item => (
                    <PermissionToggle 
                      key={item.id}
                      active={form.permissions.includes(item.id)}
                      onClick={() => {
                        const next = form.permissions.includes(item.id) 
                          ? form.permissions.filter((x:any) => x !== item.id) 
                          : [...form.permissions, item.id];
                        setForm({...form, permissions: next});
                      }}
                      {...item}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* LADO DIREITO: RESUMO EM TEMPO REAL (WIDGET) */}
          <div className="col-span-12 lg:col-span-5">
            <div className="sticky top-10 bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                 <Database size={200} />
               </div>

               <h4 className="text-blue-400 font-black uppercase text-[10px] tracking-widest mb-6">Preview do Registro</h4>
               
               <div className="space-y-6 relative z-10">
                  <div>
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Nome do Player</p>
                    <p className="text-2xl font-black italic uppercase truncate">{form.name || '---'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Grupo</p>
                      <p className="font-bold text-xs bg-slate-800 py-1 px-3 rounded-lg inline-block mt-1">{form.origin}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Acesso</p>
                      <p className="font-bold text-xs bg-blue-600 py-1 px-3 rounded-lg inline-block mt-1">{form.user_type}</p>
                    </div>
                  </div>

                  {form.origin === 'MARKETPLACE' && (
                    <div className="pt-6 border-t border-slate-800">
                      <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-3">Módulos Habilitados</p>
                      <div className="flex gap-2">
                        <Badge label="SHP" active={form.modules.is_shipper} onClick={() => setForm({...form, modules: {...form.modules, is_shipper: !form.modules.is_shipper}})} />
                        <Badge label="ADV" active={form.modules.is_advertiser} onClick={() => setForm({...form, modules: {...form.modules, is_advertiser: !form.modules.is_advertiser}})} />
                        <Badge label="SEL" active={form.modules.is_seller} onClick={() => setForm({...form, modules: {...form.modules, is_seller: !form.modules.is_seller}})} />
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-slate-800">
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-3">Privilégios ({form.permissions.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {form.permissions.map((p:any) => (
                        <span key={p} className="text-[8px] font-black bg-white/5 px-2 py-1 rounded text-slate-400">{p}</span>
                      ))}
                    </div>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

const StepHeader = ({ num, title, desc, icon: Icon }: any) => (
  <div className="flex items-start gap-5">
    <div className="bg-slate-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center font-black italic text-xl shadow-lg">
      <Icon size={24} />
    </div>
    <div>
      <h3 className="text-2xl font-black text-slate-900 italic uppercase leading-none">
        <span className="text-blue-600 mr-2">{num}.</span> {title}
      </h3>
      <p className="text-slate-400 text-xs font-bold uppercase mt-1 tracking-tighter">{desc}</p>
    </div>
  </div>
);

const ChoiceCard = ({ selected, onClick, title, desc, icon: Icon }: any) => (
  <button 
    onClick={onClick}
    className={`p-6 rounded-3xl border-2 text-left transition-all ${selected ? 'border-blue-600 bg-blue-50/50 shadow-xl' : 'border-slate-100 bg-white hover:border-blue-200'}`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${selected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
      <Icon size={20} />
    </div>
    <h4 className={`font-black uppercase italic text-xs ${selected ? 'text-blue-900' : 'text-slate-500'}`}>{title}</h4>
    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase leading-tight">{desc}</p>
  </button>
);

const ModernInput = ({ label, icon: Icon, className, ...props }: any) => (
  <div className="space-y-2 w-full">
    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">{label}</label>
    <div className="relative">
      {Icon && <Icon size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />}
      <input className={`w-full p-4 ${Icon ? 'pl-12' : 'pl-6'} bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-100 focus:bg-white outline-none font-bold text-slate-700 shadow-inner text-sm transition-all ${className}`} {...props} />
    </div>
  </div>
);

const ModernSelect = ({ label, options, onChange, value }: any) => (
  <div className="space-y-2 w-full">
    <label className="text-[9px] font-black text-slate-400 uppercase ml-2 tracking-widest">{label}</label>
    <select 
      onChange={e => onChange(e.target.value)} 
      value={value}
      className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-100 outline-none font-black text-[10px] uppercase text-slate-800 shadow-inner cursor-pointer"
    >
      {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const PermissionToggle = ({ active, onClick, title, label }: any) => (
  <button 
    onClick={onClick}
    className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${active ? 'border-blue-600 bg-blue-50/50' : 'border-slate-50 bg-white hover:border-slate-100'}`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-300'}`}>
        <ShieldCheck size={16} />
      </div>
      <div className="text-left">
        <h5 className="text-[10px] font-black uppercase italic text-slate-800">{label}</h5>
      </div>
    </div>
    {active ? <CheckCircle2 className="text-blue-600" size={18} /> : <div className="w-5 h-5 rounded-full border-2 border-slate-100" />}
  </button>
);

const Badge = ({ label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`px-3 py-1 rounded-md text-[9px] font-black transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'bg-slate-800 text-slate-500 hover:text-white'}`}
  >
    {label}
  </button>
);

const ACL_LIST = [
  { id: 'view_financial', label: 'Dashboard Financeiro' },
  { id: 'manage_users', label: 'Gerenciar Outros Usuários' },
  { id: 'approve_docs', label: 'Aprovação de Documentos' },
  { id: 'create_freight', label: 'Publicação de Cargas' },
  { id: 'edit_ads', label: 'Controle de Anúncios' },
];