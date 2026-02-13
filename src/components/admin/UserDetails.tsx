import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import { 
  ArrowLeft, User, Building2, ShieldCheck, Truck, FileText, 
  Wallet, Save, Loader2, Mail, Smartphone, CheckCircle, 
  Trash2, XCircle, Clock, History, MessageSquare, ShieldAlert
} from 'lucide-react';

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // ESTADOS
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('account');
  const [newNote, setNewNote] = useState('');
  const [team, setTeam] = useState<any[]>([]);

  // BUSCAR DADOS COMPLETOS (Dossiê 360º)
  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin-user-details?id=${id}`);
      const data = res.data.data || res.data;
      setUser(data);

    // BUSCA MEMBROS DA MESMA EMPRESA
    if (data.company_id) {
      const teamRes = await api.get(`/admin-company-members?company_id=${data.company_id}`);
      setTeam(teamRes.data.data || []);
      }
    } catch (e) {
      console.error("Erro ao carregar detalhes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUserDetails(); }, [id]);

  // SALVAR ALTERAÇÕES GERAIS
  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.post('/admin-update-user', user);
      if (res.data.success) {
        alert("Dossiê atualizado com sucesso!");
        fetchUserDetails();
      } else {
        alert("Erro ao salvar: " + res.data.message);
      }
    } catch (e) {
      alert("Erro de conexão com o servidor.");
    } finally {
      setSaving(false);
    }
  };

  // APROVAÇÃO RÁPIDA (Action direto no header)
  const handleQuickApprove = async () => {
    if (!window.confirm("Aprovar este usuário e liberar acesso total ao sistema?")) return;
    try {
      setSaving(true);
      await api.post('/admin-manage-user', { id: user.id, action: 'approve-user' });
      fetchUserDetails();
    } catch (e) { 
      alert("Erro ao aprovar."); 
    } finally {
      setSaving(false);
    }
  };

  // ADICIONAR NOTA INTERNA
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await api.post('/admin-add-note', { 
        user_id: user.id, 
        note: newNote,
        // Se o usuário é do tipo 'company', salvamos com contexto de empresa por padrão (ou adicione um checkbox na UI)
        context: user.company_id ? 'COMPANY' : 'USER' 
      });
      setNewNote('');
      fetchUserDetails();
    } catch (e) { 
      alert("Erro ao salvar nota."); 
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">Sincronizando Dossiê...</p>
    </div>
  );

  if (!user) return <div className="p-10 text-center text-red-500 font-bold uppercase">Usuário não encontrado.</div>;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* HEADER - AÇÕES RÁPIDAS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-slate-800 transition-colors font-black text-[10px] uppercase">
          <ArrowLeft size={16} /> Voltar para a Lista
        </button>

        <div className="flex gap-2">
          {user.status === 'pending' && (
            <button onClick={handleQuickApprove} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase italic hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100">
              <CheckCircle size={16} /> Aprovar Agora
            </button>
          )}
          
          <button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase italic shadow-lg shadow-blue-100 hover:scale-105 transition-all flex items-center gap-2">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
            {saving ? 'Processando...' : 'Salvar Dossiê'}
          </button>
        </div>
      </div>

      {/* CARD DE RESUMO (PERFIL) */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-white shadow-2xl relative ${user.role === 'admin' ? 'bg-slate-900' : 'bg-blue-600'}`}>
          {user.role === 'company' ? <Building2 size={32} /> : <User size={32} />}
          {user.is_verified && (
             <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-4 border-white">
                <CheckCircle size={14} fill="currentColor" className="text-white" />
             </div>
          )}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-black uppercase italic text-slate-800 leading-tight">{user.company_name || user.name}</h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400 font-bold text-[10px] uppercase mt-2">
            <span className="flex items-center gap-1.5"><Mail size={12}/> {user.email}</span>
            <span className="flex items-center gap-1.5"><Smartphone size={12}/> {user.whatsapp}</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">{user.role}</span>
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 text-right min-w-[180px]">
          <p className="text-[8px] font-black uppercase text-slate-400 mb-1 tracking-tighter">Saldo Disponível</p>
          <p className="text-2xl font-black text-blue-600 italic">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(user.wallet_balance || 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* MENU LATERAL DE NAVEGAÇÃO INTERNA */}
        <div className="col-span-12 lg:col-span-3 space-y-2">
          <TabBtn id="account" label="Dados Pessoais" icon={User} active={activeTab} onClick={setActiveTab} />
          {user.company_id && (
            <TabBtn id="team" label="Membros da Empresa" icon={ShieldAlert} active={activeTab} onClick={setActiveTab} />
          )}
          {user.role === 'company' && (
            <>
              <TabBtn id="business" label="Perfil do Negócio" icon={Building2} active={activeTab} onClick={setActiveTab} />
              <TabBtn id="logistics" label="Infraestrutura" icon={Truck} active={activeTab} onClick={setActiveTab} />
            </>
          )}
          <TabBtn id="docs" label="Verificação / Docs" icon={FileText} active={activeTab} onClick={setActiveTab} />
          <TabBtn id="notes" label="Notas Internas" icon={MessageSquare} active={activeTab} onClick={setActiveTab} />
          <TabBtn id="logs" label="Logs de Auditoria" icon={History} active={activeTab} onClick={setActiveTab} />
        </div>

        {/* ÁREA DE CONTEÚDO DAS ABAS */}
        <div className="col-span-12 lg:col-span-9 bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm min-h-[550px]">
          
          {/* ABA 1: ACESSO */}
          {activeTab === 'account' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <SectionTitle title="Governança da Conta" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Nome de Exibição" value={user.name} onChange={(v: any) => setUser({...user, name: v})} />
                <InputGroup label="WhatsApp / Telefone" value={user.whatsapp} onChange={(v: any) => setUser({...user, whatsapp: v})} />
                <SelectGroup label="Status do Usuário" value={user.status} options={['active', 'pending', 'suspended']} onChange={(v:any) => setUser({...user, status: v})} />
                <SelectGroup label="Nível de Permissão" value={user.role} options={['admin', 'company', 'driver']} onChange={(v:any) => setUser({...user, role: v})} />
              </div>
            </div>
          )}

          {/* ABA 2: NEGÓCIO */}
          {activeTab === 'business' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <SectionTitle title="Detalhes Corporativos" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Razão Social / Nome Fantasia" value={user.company_name} onChange={(v: any) => setUser({...user, company_name: v})} />
                <InputGroup label="CNPJ" value={user.cnpj} onChange={(v: any) => setUser({...user, cnpj: v})} />
                <div className="col-span-2 space-y-3">
                   <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tipo de Atuação (Múltiplo)</label>
                   <div className="flex flex-wrap gap-2">
                      {['transportadora', 'armazem', 'anunciante', 'operador_logistico'].map(type => (
                        <TypeBadge 
                          key={type} 
                          label={type} 
                          active={user.business_type?.includes(type)} 
                          onClick={() => {
                            const types = user.business_type ? user.business_type.split(',') : [];
                            const newTypes = types.includes(type) ? types.filter((t:any) => t !== type) : [...types, type];
                            setUser({...user, business_type: newTypes.join(',')});
                          }}
                        />
                      ))}
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* ABA 3: INFRAESTRUTURA */}
          {activeTab === 'logistics' && (
             <div className="space-y-6 animate-in slide-in-from-right-4">
                <SectionTitle title="Capacidade Operacional" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InputGroup label="Área de Armazenagem (m²)" value={user.storage_capacity_m2} onChange={(v: any) => setUser({...user, storage_capacity_m2: v})} />
                  <SelectGroup 
                    label="Possui Docas?" 
                    value={user.has_dock} 
                    options={[{v: 1, l: 'SIM'}, {v: 0, l: 'NÃO'}]} 
                    onChange={(v: any) => setUser({...user, has_dock: v})}
                  />
                  <InputGroup label="Região de Cobertura" value={user.coverage_area} onChange={(v: any) => setUser({...user, coverage_area: v})} />
                </div>
             </div>
          )}

          {/* ABA 4: DOCUMENTOS */}
          {activeTab === 'docs' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <SectionTitle title="Centro de Verificação" />
              <div className="grid gap-3">
                {user.documents?.length > 0 ? (
                  user.documents.map((doc: any) => <DocumentCard key={doc.id} doc={doc} />)
                ) : (
                  <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2rem] text-center text-slate-400 font-bold uppercase text-[10px]">
                    Nenhum documento enviado para análise.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ABA 5: NOTAS INTERNAS */}
          {activeTab === 'notes' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <SectionTitle title="Comunicação Interna (Equipe Admin)" />
              <div className="flex gap-2">
                <input 
                  value={newNote} 
                  onChange={(e) => setNewNote(e.target.value)} 
                  placeholder="Adicionar nota técnica sobre este usuário..." 
                  className="flex-1 p-4 bg-slate-50 rounded-2xl border-none text-xs font-bold outline-none ring-blue-500/10 focus:ring-2" 
                />
                <button onClick={handleAddNote} className="bg-slate-900 text-white px-8 rounded-2xl font-black text-[10px] uppercase italic">Postar</button>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {user.internal_notes?.map((n: any) => (
                  <div key={n.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-medium text-slate-700 leading-relaxed">{n.note}</p>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-200/50">
                      <p className="text-[8px] font-black uppercase text-blue-600">{n.admin_name}</p>
                      {/* INSERÇÃO AQUI: Badge de contexto */}
                      {n.context === 'COMPANY' && (
                        <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[7px] font-black uppercase ml-2">
                          Nota da Empresa
                        </span>
                      )}
                      <p className="text-[8px] font-bold text-slate-400">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA 6: LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <SectionTitle title="Auditoria de Atividades" />
              <div className="space-y-4">
                {user.audit_logs?.map((log: any) => (
                  <div key={log.id} className="flex gap-4 items-start border-l-2 border-slate-100 pl-4 relative">
                    <div className="absolute left-[-5px] top-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-800">{log.action_type}</p>
                      <p className="text-[11px] text-slate-500 italic mt-0.5">{log.description}</p>
                      <p className="text-[8px] font-bold text-slate-300 mt-1 flex items-center gap-1">
                        <Clock size={10} /> {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ABA: EQUIPE/TEAM */}
          {activeTab === 'team' && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <SectionTitle title={`Equipe: ${user.company_name}`} />
            <p className="text-[10px] font-bold text-slate-400 uppercase">Estes usuários compartilham o mesmo CNPJ e Saldo:</p>
            
            <div className="grid gap-3">
              {team.map((member: any) => (
                <div key={member.id} className={`flex items-center justify-between p-4 rounded-2xl border ${member.id === user.id ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${member.id === user.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'}`}>
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase">{member.name} {member.id === user.id && "(VOCÊ)"}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">{member.role} • {member.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/admin/users/${member.id}`)}
                    className="text-[9px] font-black uppercase bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-900 hover:text-white transition-all"
                  >
                    Ver Dossiê
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTES AUXILIARES ---

const TabBtn = ({ id, label, icon: Icon, active, onClick }: any) => (
  <button 
    onClick={() => onClick(id)} 
    className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase transition-all border ${
      active === id ? 'bg-slate-900 text-white border-slate-900 shadow-xl translate-x-2' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
    }`}
  >
    <Icon size={18} /> {label}
  </button>
);

const SectionTitle = ({ title }: any) => (
  <h3 className="text-lg font-black uppercase italic text-slate-800 border-b border-slate-100 pb-2 mb-6">{title}</h3>
);

const InputGroup = ({ label, value, onChange }: any) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">{label}</label>
    <input 
      type="text" 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full p-3 bg-slate-50 rounded-xl border-none font-bold text-xs outline-none focus:ring-2 ring-blue-500/10 transition-all" 
    />
  </div>
);

const SelectGroup = ({ label, value, options, onChange }: any) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black uppercase text-slate-400 ml-1 tracking-widest">{label}</label>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full p-3 bg-slate-50 rounded-xl border-none font-bold text-xs outline-none cursor-pointer"
    >
      {options.map((o: any) => (
        <option key={o.v || o} value={o.v !== undefined ? o.v : o}>
          {(o.l || o).toUpperCase()}
        </option>
      ))}
    </select>
  </div>
);

const TypeBadge = ({ label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase border transition-all ${
      active ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-slate-50 text-slate-400 border-slate-100'
    }`}
  >
    {label.replace('_', ' ')}
  </button>
);

const DocumentCard = ({ doc }: any) => (
  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white rounded-lg border border-slate-200">
        <FileText className="text-slate-400" size={20} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase italic">{doc.document_type}</p>
        <p className={`text-[8px] font-bold uppercase ${doc.status === 'APPROVED' ? 'text-emerald-500' : 'text-orange-500'}`}>
          {doc.status}
        </p>
      </div>
    </div>
    <div className="flex gap-2">
       <button className="text-[9px] font-black uppercase bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-900 hover:text-white transition-all">
          Visualizar
       </button>
    </div>
  </div>
);