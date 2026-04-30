import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  Mail, Loader2, Search, User, Settings2, ShieldPlus, 
  Trash2, Building2, CheckCircle, Clock, Truck, Store, 
  UserPlus, Star, Calendar, ShieldCheck, Smartphone, X
} from 'lucide-react';
import ProfilePermissionsModal from './ProfilePermissionsModal';
import { PageShell, StatsGrid, StatCard, FilterBar } from '@/components/admin';


export default function UsersManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [userType, setUserType] = useState<'driver' | 'company' | 'system'>('driver');
  const [newUser, setNewUser] = useState({
    name: '', // Razão Social (company) or Nome Completo (driver)
    owner_name: '', // Nome do responsável (company only)
    name_fantasy: '', // Nome fantasia (company only)
    email: '',
    password: '',
    whatsapp: '',
    document: '',
    role: 'company',
    user_type: 'DRIVER'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Certifique-se que este endpoint no PHP usa o SQL atualizado com LEFT JOINs que passamos
      const res = await api.get('list-all-users');
      const data = res.data.data || res.data; 

      const sorted = (Array.isArray(data) ? data : []).sort((a: any, b: any) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        return (a.user_name || a.name || "").localeCompare(b.user_name || b.name || "");
      });
      setUsers(sorted);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!newUser.name || !newUser.email || !newUser.password) {
      return alert("Nome, email e senha são obrigatórios");
    }

    if (userType === 'driver' && newUser.document && newUser.document.replace(/\D/g, '').length !== 11) {
      return alert("CPF deve ter 11 dígitos");
    }

    if (userType === 'company' && newUser.document && newUser.document.replace(/\D/g, '').length !== 14) {
      return alert("CNPJ deve ter 14 dígitos");
    }

    if (userType === 'company' && !newUser.owner_name) {
      return alert("Informe o nome do responsável pela empresa");
    }

    if (userType === 'company' && newUser.document && newUser.document.replace(/\D/g, '').length !== 14) {
      return alert("CNPJ deve ter 14 dígitos");
    }

    if (userType === 'system' && !newUser.role) {
      return alert("Selecione um cargo para usuário do sistema");
    }

    if (userType === 'system' && newUser.document && newUser.document.replace(/\D/g, '').length !== 11) {
      return alert("CPF deve ter 11 dígitos");
    }
    
    try {
      setCreating(true);
      
      const payload: any = {
        name: newUser.name, // Para empresa: Razão Social
        email: newUser.email,
        password: newUser.password,
        whatsapp: newUser.whatsapp,
        document: newUser.document,
        user_type: userType === 'system' ? 'SYSTEM' : (userType === 'company' ? 'COMPANY' : 'DRIVER'),
        role: newUser.role || (userType === 'company' ? 'company' : (userType === 'system' ? 'admin' : 'driver'))
      };

      // Para empresa, adicionar campos específicos
      if (userType === 'company') {
        payload.owner_name = newUser.owner_name; // Nome do responsável
        payload.name_fantasy = newUser.name_fantasy || null; // Nome fantasia
      }

      const res = await api.post('/admin-create-user', payload);
      if (res.data?.success) {
        alert("Usuário criado com sucesso!");
        setShowCreateModal(false);
        setNewUser({ name: '', owner_name: '', name_fantasy: '', email: '', password: '', whatsapp: '', document: '', role: 'company', user_type: 'DRIVER' });
        setUserType('driver');
        fetchUsers();
      } else {
        alert(res.data?.message || "Erro ao criar usuário");
      }
    } catch (e: any) {
      alert(e.response?.data?.message || "Erro ao criar usuário");
    } finally {
      setCreating(false);
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const filteredUsers = users.filter((u: any) => {
    if (u.status === 'deleted') return false;
    if (filterStatus !== 'all' && u.status !== filterStatus) return false;
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    const searchLower = search.toLowerCase();
    return (
      (u.user_name?.toLowerCase() || u.name?.toLowerCase() || "").includes(searchLower) ||  
      (u.company_name?.toLowerCase() || u.company_corporate_name?.toLowerCase() || "").includes(searchLower) ||
      (u.company_document?.toLowerCase() || "").includes(searchLower) ||
      (u.email?.toLowerCase() || "").includes(searchLower) ||
      (u.document?.includes(searchLower)) ||
      (u.role?.toLowerCase() || "").includes(searchLower) ||
      (u.business_type?.toLowerCase() || "").includes(searchLower) ||
      (u.city?.toLowerCase() || "").includes(searchLower)
    );
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active' || u.status === 'approved').length,
    pending: users.filter(u => u.status === 'pending').length,
    companies: users.filter(u => u.role === 'company' || u.user_type === 'COMPANY').length,
  };

  const handleApprove = async (id: number, name: string) => {
    if (!window.confirm(`Liberar acesso total para ${name.toUpperCase()}?`)) return;
    try {
      const res = await api.post('/admin-manage-user', { id, action: 'approve-user' });
      if (res.data.success) {
        alert("Usuário aprovado com sucesso!");
        fetchUsers();
      }
    } catch (e) { alert("Erro ao aprovar."); }
  };

  const handleDelete = async (id: number, name: string) => {
    // Verificação de segurança caso o nome venha nulo
    const safeName = (name || "este usuário").toUpperCase();
    
    if (!window.confirm(`⚠️ SOFT DELETE: Desativar acesso de ${safeName}? O registro continuará no banco como inativo.`)) return;
    
    try {
      const res = await api.post('/manage-users-admin', { id, action: 'delete-user' });
      if (res.data.success) {
        // Remove da lista visualmente
        setUsers(prev => prev.filter(u => u.id !== id));
        alert("Usuário desativado com sucesso.");
      }
    } catch (e) { 
      alert("Erro ao excluir. Verifique os logs."); 
    }
  };

  return (
    <PageShell
      title="Gestão de Usuários"
      description={`${users.length} contas registradas`}
      actions={
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase italic hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-100"
        >
          <UserPlus size={16} /> Novo Usuário
        </button>
      }
    >
      <StatsGrid>
        <StatCard label="Total" value={stats.total} icon={ShieldPlus} />
        <StatCard label="Ativos" value={stats.active} variant="green" icon={CheckCircle} />
        <StatCard label="Pendentes" value={stats.pending} variant="yellow" icon={Clock} />
        <StatCard label="Empresas" value={stats.companies} variant="blue" icon={Building2} />
      </StatsGrid>

      <FilterBar
        search={{
          placeholder: 'Buscar por nome, email, documento...',
          value: search,
          onChange: setSearch
        }}
        tabs={[
          { key: 'all', label: 'Todos' },
          { key: 'active', label: 'Ativos' },
          { key: 'pending', label: 'Pendentes' },
          { key: 'inactive', label: 'Inativos' },
        ]}
        activeTab={filterStatus}
        onTabChange={setFilterStatus}
      />

      {/* Filtro adicional por tipo de usuário */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase">Tipo:</span>
        <select 
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 bg-white rounded-xl border border-slate-200 font-bold text-xs focus:ring-2 ring-blue-500/20 outline-none"
        >
          <option value="all">Todos</option>
          <option value="admin">Administrador</option>
          <option value="company">Empresa</option>
          <option value="driver">Motorista</option>
        </select>
      </div>

      {/* LISTAGEM */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Identificação / Perfil</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Tipo & Plano</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={32} /></td></tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      {/* Avatar e Ícone de Role */}
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 transition-all
                          ${u.role === 'admin' ? 'bg-slate-900 border-slate-900 text-white' : 
                            u.parent_id ? 'border-dashed border-blue-200 bg-blue-50 text-blue-400' : 
                            'border-slate-100 bg-white text-slate-400'}`}>
                          
                          {u.role === 'admin' && <ShieldCheck size={20} />}
                          {u.role === 'company' && <Building2 size={20} />}
                          {u.role === 'driver' && <Truck size={20} />}
                          
                          <span className="text-[7px] font-black uppercase mt-1">{u.role}</span>
                        </div>
                        
                        {/* Selo de Verificado */}
                        {(u.is_verified == 1) && (
                          <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm">
                            <CheckCircle size={10} fill="currentColor" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        {/* Nome do usuário ou responsável */}
                        <p className="font-black text-slate-800 text-sm uppercase italic leading-none flex items-center gap-2">
                          {u.user_name || u.name || '⚠️ Sem nome'}
                        </p>
                        
                        {/* Mostrar empresa para COMPANY ou vínculo para team members */}
                        {(u.user_type === 'COMPANY' || u.role === 'company') ? (
                          <p className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1">
                            <Store size={10} /> {u.company_name || u.company_corporate_name || '⚠️ Cadastre nome da empresa'}
                          </p>
                        ) : u.parent_id && u.parent_name ? (
                          <p className="text-[10px] font-bold text-slate-500 uppercase italic flex items-center gap-1">
                            <UserPlus size={10} /> {u.parent_name} • {u.access_level || 'Usuário'}
                          </p>
                        ) : (u.user_type === 'DRIVER' || u.role === 'driver') ? (
                          <p className="text-[9px] font-bold text-slate-300 uppercase italic">Motorista</p>
                        ) : (u.user_type === 'OPERATOR' || u.user_type === 'ADMIN' || u.role === 'admin' || u.role === 'manager' || u.role === 'coordinator') ? (
                          <p className="text-[9px] font-bold text-slate-300 uppercase italic">Equipe Chama Frete</p>
                        ) : (
                          <p className="text-[9px] font-bold text-slate-300 uppercase italic">Perfil Individual</p>
                        )}

                        {/* Email e WhatsApp lado a lado */}
                        <div className="flex gap-3">
                          <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                            <Mail size={10} /> {u.email}
                          </span>
                          {u.whatsapp && (
                            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                              <Smartphone size={10} /> {u.whatsapp}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-5">
                  <div className="flex flex-col gap-2">
                    {/* Helper function to get user type label */}
                    {(() => {
                      const getUserTypeLabel = () => {
                        const ut = u.user_type?.toUpperCase();
                        const al = u.access_level?.toLowerCase();
                        const r = u.role?.toLowerCase();
                        
                        // Use user_type if available, otherwise fall back to role
                        if (ut === 'DRIVER' || r === 'driver') return 'Motorista';
                        
                        if (ut === 'COMPANY' || r === 'company') {
                          if (al === 'owner') return 'Empresa • Owner';
                          if (al === 'manager') return 'Empresa • Gerente';
                          if (al === 'user') return 'Empresa • Usuário';
                          return 'Empresa';
                        }
                        
                        if (ut === 'OPERATOR' || ut === 'ADMIN' || r === 'admin' || r === 'manager' || r === 'coordinator' || r === 'supervisor') {
                          if (r === 'admin') return 'Admin';
                          if (r === 'manager') return 'Gerente';
                          if (r === 'coordinator') return 'Coordenador';
                          if (r === 'supervisor') return 'Supervisor';
                          if (r === 'analyst') return 'Analista';
                          if (r === 'assistant') return 'Assistente';
                          if (r === 'support') return 'Suporte';
                          if (r === 'finance') return 'Financeiro';
                          if (r === 'marketing') return 'Marketing';
                          return r ? r.charAt(0).toUpperCase() + r.slice(1) : 'Equipe Chama Frete';
                        }
                        
                        return 'Usuário';
                      };

                      const getPlanLabel = () => {
                        // Use plan_name from SQL if available
                        if (u.plan_name) return u.plan_name;
                        // Fall back to Free for plan_id = 1
                        if (u.plan_id == 1) return 'Free';
                        return 'Plano';
                      };

                      const isFree = u.plan_id == 1;

                      return (
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Badge do Tipo de Usuário */}
                          <span className="text-[9px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 whitespace-nowrap">
                            {getUserTypeLabel()}
                          </span>

                          {/* Badge do Plano */}
                          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${isFree ? 'bg-slate-100 text-slate-400' : 'bg-orange-100 text-orange-600 border border-orange-200'}`}>
                            <Star size={10} fill={!isFree ? "currentColor" : "none"} />
                            {getPlanLabel()}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Data de Criação */}
                    <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1 ml-1">
                      <Calendar size={10} /> 
                      Desde {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '---'}
                    </span>
                  </div>
                </td>

                  <td className="px-8 py-5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                      u.status === 'approved' || u.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      u.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100 animate-pulse' : 
                      'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {u.status === 'pending' && <Clock size={10} />}
                      {u.status === 'approved' || u.status === 'active' ? 'Ativo' : u.status === 'pending' ? 'Pendente' : 'Bloqueado'}
                    </span>
                  </td>

                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {(u.status === 'pending') && (
                        <button 
                          onClick={() => handleApprove(u.id, u.name)}
                          className="h-10 px-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100 flex items-center gap-2 text-[10px] font-black uppercase"
                        >
                          <CheckCircle size={14} /> Aprovar
                        </button>
                      )}
                      
                      <button 
                        onClick={() => setSelectedUser(u)} 
                        title="Editar Usuário"
                        className="h-10 w-10 flex items-center justify-center bg-white text-slate-400 border border-slate-200 hover:border-slate-900 hover:text-slate-900 rounded-xl transition-all shadow-sm"
                      >
                        <Settings2 size={18} />
                      </button>

                      <button 
                        onClick={() => handleDelete(u.id, u.display_name || u.name || u.individual_name)}
                        title="Excluir"
                        className="h-10 w-10 flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {!loading && filteredUsers.length === 0 && (
            <div className="py-20 text-center">
              <User size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold text-sm uppercase">Nenhum usuário encontrado na busca.</p>
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <ProfilePermissionsModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onSave={fetchUsers}
        />
      )}

      {/* MODAL DE CRIAÇÃO DE USUÁRIO */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-200 flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic">Novo Usuário</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            {/* TIPO DE USUÁRIO */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => { setUserType('driver'); setNewUser({...newUser, user_type: 'DRIVER', role: 'driver'}); }}
                className={`flex-1 py-3 px-4 rounded-xl font-black uppercase text-xs transition-all ${
                  userType === 'driver' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Truck size={16} className="inline mr-2" />
                Motorista
              </button>
              <button
                type="button"
                onClick={() => { setUserType('company'); setNewUser({...newUser, user_type: 'COMPANY', role: 'company'}); }}
                className={`flex-1 py-3 px-4 rounded-xl font-black uppercase text-xs transition-all ${
                  userType === 'company' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Building2 size={16} className="inline mr-2" />
                Empresa
              </button>
              <button
                type="button"
                onClick={() => { setUserType('system'); setNewUser({...newUser, user_type: 'SYSTEM', role: 'admin'}); }}
                className={`flex-1 py-3 px-4 rounded-xl font-black uppercase text-xs transition-all ${
                  userType === 'system' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <ShieldCheck size={16} className="inline mr-2" />
                Sistema
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }} className="space-y-4">
              {/* CAMPOS MOTORISTA */}
              {userType === 'driver' && (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nome Completo *</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={e => setNewUser({...newUser, name: e.target.value})}
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                      placeholder="João Silva"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">CPF *</label>
                      <input
                        type="text"
                        value={newUser.document}
                        onChange={e => setNewUser({...newUser, document: e.target.value})}
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                        placeholder="000.000.000-00"
                        maxLength={14}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">WhatsApp</label>
                      <input
                        type="text"
                        value={newUser.whatsapp}
                        onChange={e => setNewUser({...newUser, whatsapp: e.target.value})}
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email *</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={e => setNewUser({...newUser, email: e.target.value})}
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                      placeholder="joao@exemplo.com"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Senha *</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={e => setNewUser({...newUser, password: e.target.value})}
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                      placeholder="••••••••"
                    />
                  </div>
                </>
              )}

              {/* CAMPOS EMPRESA */}
              {userType === 'company' && (
                <>
                  {/* Dados da Empresa */}
                  <div className="bg-blue-50 p-4 rounded-2xl space-y-3">
                    <p className="text-[10px] font-black uppercase text-blue-600 tracking-wider">Dados da Empresa</p>
                    
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Razão Social *</label>
                      <input
                        type="text"
                        value={newUser.name}
                        onChange={e => setNewUser({...newUser, name: e.target.value})}
                        className="w-full p-4 bg-white rounded-2xl border-none font-bold mt-2"
                        placeholder="Transportes ABC Ltda"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nome Fantasia</label>
                      <input
                        type="text"
                        value={newUser.name_fantasy}
                        onChange={e => setNewUser({...newUser, name_fantasy: e.target.value})}
                        className="w-full p-4 bg-white rounded-2xl border-none font-bold mt-2"
                        placeholder="ABC Transport"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">CNPJ *</label>
                      <input
                        type="text"
                        value={newUser.document}
                        onChange={e => setNewUser({...newUser, document: e.target.value})}
                        className="w-full p-4 bg-white rounded-2xl border-none font-bold mt-2"
                        placeholder="00.000.000/0001-00"
                        maxLength={18}
                      />
                    </div>
                  </div>

                  {/* Dados do Responsável */}
                  <div className="bg-green-50 p-4 rounded-2xl space-y-3">
                    <p className="text-[10px] font-black uppercase text-green-600 tracking-wider">Dados do Responsável</p>
                    
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nome Completo *</label>
                      <input
                        type="text"
                        value={newUser.owner_name}
                        onChange={e => setNewUser({...newUser, owner_name: e.target.value})}
                        className="w-full p-4 bg-white rounded-2xl border-none font-bold mt-2"
                        placeholder="João Silva"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">WhatsApp</label>
                        <input
                          type="text"
                          value={newUser.whatsapp}
                          onChange={e => setNewUser({...newUser, whatsapp: e.target.value})}
                          className="w-full p-4 bg-white rounded-2xl border-none font-bold mt-2"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email *</label>
                        <input
                          type="email"
                          value={newUser.email}
                          onChange={e => setNewUser({...newUser, email: e.target.value})}
                          className="w-full p-4 bg-white rounded-2xl border-none font-bold mt-2"
                          placeholder="joao@empresa.com.br"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Senha *</label>
                      <input
                        type="password"
                        value={newUser.password}
                        onChange={e => setNewUser({...newUser, password: e.target.value})}
                        className="w-full p-4 bg-white rounded-2xl border-none font-bold mt-2"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* CAMPOS SISTEMA */}
              {userType === 'system' && (
                <>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nome Completo *</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={e => setNewUser({...newUser, name: e.target.value})}
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                      placeholder="João Silva"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">CPF *</label>
                      <input
                        type="text"
                        value={newUser.document}
                        onChange={e => setNewUser({...newUser, document: e.target.value})}
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                        placeholder="000.000.000-00"
                        maxLength={14}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email *</label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={e => setNewUser({...newUser, email: e.target.value})}
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                        placeholder="joao@chamafrete.com.br"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Senha *</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={e => setNewUser({...newUser, password: e.target.value})}
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Cargo *</label>
                    <select
                      value={newUser.role}
                      onChange={e => setNewUser({...newUser, role: e.target.value})}
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                    >
                      <option value="">Selecione o cargo</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Gerente</option>
                      <option value="coordinator">Coordenador</option>
                      <option value="supervisor">Supervisor</option>
                      <option value="analyst">Analista</option>
                      <option value="assistant">Assistente</option>
                      <option value="support">Suporte</option>
                      <option value="finance">Financeiro</option>
                      <option value="marketing">Marketing</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={creating || !newUser.name || !newUser.email || !newUser.password || (userType === 'system' && !newUser.role)}
                className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black uppercase mt-4 hover:bg-orange-600 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {creating ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
                Criar {userType === 'driver' ? 'Motorista' : userType === 'company' ? 'Empresa' : 'Usuário'}
              </button>
            </form>
          </div>
        </div>
      )}
    </PageShell>
   );
}