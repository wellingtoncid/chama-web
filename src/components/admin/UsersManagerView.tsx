import { useState, useEffect } from 'react';
import { api } from '../../api';
import { 
  Mail, Loader2, Search, User, Settings2, ShieldPlus, 
  Trash2, Building2, CheckCircle, Clock, Truck, Store, UserPlus, Star, Calendar
} from 'lucide-react';
import ProfilePermissionsModal from './ProfilePermissionsModal';

export default function UsersManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin-list-users');
      const data = res.data.data || res.data; 

      const sorted = (Array.isArray(data) ? data : []).sort((a: any, b: any) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        return (a.name || "").localeCompare(b.name || "");
      });
      setUsers(sorted);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleApprove = async (id: number, name: string) => {
    if (!window.confirm(`Liberar acesso total para ${name.toUpperCase()}?`)) return;
    try {
      const res = await api.post('/manage-users-admin', { id, action: 'approve-user' });
      if (res.data.success) {
        alert("Usuário aprovado com sucesso!");
        fetchUsers();
      }
    } catch (e) { alert("Erro ao aprovar."); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`⚠️ PERIGO: Excluir permanentemente ${name.toUpperCase()}?`)) return;
    try {
      const res = await api.post('/manage-users-admin', { id, action: 'delete-user' });
      if (res.data.success) setUsers(prev => prev.filter(u => u.id !== id));
    } catch (e) { alert("Erro ao excluir."); }
  };

  const filteredUsers = users.filter((u: any) => {
    if (u.status === 'deleted') return false;
    const searchLower = search.toLowerCase();
    return (
      (u.name?.toLowerCase() || "").includes(searchLower) || 
      (u.company_name?.toLowerCase() || "").includes(searchLower) ||
      (u.email?.toLowerCase() || "").includes(searchLower) ||
      (u.cnpj || "").includes(searchLower) ||
      (u.user_type?.toLowerCase() || "").includes(searchLower)
    );
  });

  const getUserTypeIcon = (type: string) => {
    const t = type?.toLowerCase();
    switch (t) {
      case 'transportadora': return <Truck size={14} className="text-blue-500" />;
      case 'comercio': 
      case 'comércio': return <Store size={14} className="text-emerald-500" />;
      case 'motorista': return <User size={14} className="text-orange-500" />;
      default: return <User size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER E BUSCA */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
            <ShieldPlus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase italic text-slate-800 leading-tight">Gestão de Acessos</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Controle de motoristas e empresas</p>
          </div>
        </div>

        <div className="flex flex-1 gap-3 w-full md:w-auto md:justify-end">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar usuários..." 
              className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-2xl border-none font-bold text-xs focus:ring-2 ring-orange-500/20 outline-none transition-all"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button 
            onClick={() => setSelectedUser({ id: null, role: 'company', status: 'pending', user_type: 'motorista' })}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase italic hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <UserPlus size={16} /> Novo
          </button>
        </div>
      </div>

      {/* TABELA DE USUÁRIOS */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Perfil / Empresa</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Plano & Cadastro</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={4} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={32} /></td></tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      {/* AVATAR COM SELO VERIFICADO DINÂMICO */}
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${u.role === 'admin' ? 'border-red-100 bg-red-50 text-red-500' : 'border-slate-100 bg-white text-slate-400'}`}>
                          {u.role === 'company' ? <Building2 size={20}/> : <User size={20}/>}
                        </div>
                        {/* Verificação numérica ou booleana vinda do banco */}
                        {(u.is_verified == 1 || u.is_verified === true) && (
                          <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white shadow-sm" title="Conta Verificada">
                            <CheckCircle size={10} fill="currentColor" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm uppercase italic leading-none">
                          {u.company_name || u.name}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1.5 flex items-center gap-2">
                          <Mail size={10} /> {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1.5">
                      {/* TIPO E PLANO */}
                      <div className="flex items-center gap-2">
                         <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase ${u.plan_id ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                          <Star size={10} fill={u.plan_id ? "currentColor" : "none"} />
                          {u.plan_id ? 'Pro' : 'Free'}
                        </span>
                        <span className="text-[9px] font-black text-slate-600 uppercase italic">
                          {u.user_type || 'comum'}
                        </span>
                      </div>
                      {/* DATA DE CADASTRO */}
                      <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <Calendar size={10} /> 
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '---'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                        u.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 
                        u.status === 'pending' ? 'bg-orange-100 text-orange-600 animate-pulse' : 'bg-red-100 text-red-600'
                      }`}>
                        {u.status === 'pending' && <Clock size={10} />}
                        {u.status === 'approved' ? 'Ativo' : u.status === 'pending' ? 'Pendente' : u.status}
                      </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {u.status === 'pending' && (
                        <button 
                          onClick={() => handleApprove(u.id, u.company_name || u.name)}
                          className="h-10 px-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-100 flex items-center gap-2 text-[10px] font-black uppercase"
                        >
                          <CheckCircle size={14} /> Liberar
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedUser(u)} 
                        className="h-10 w-10 flex items-center justify-center bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all"
                      >
                        <Settings2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id, u.name)} 
                        className="h-10 w-10 flex items-center justify-center bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <ProfilePermissionsModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
          onSave={fetchUsers}
        />
      )}
    </div>
  );
}