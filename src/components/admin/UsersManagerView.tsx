import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import { 
  Mail, Loader2, Search, User, Settings2, ShieldPlus, 
  Trash2, Building2, CheckCircle, Clock, Truck, Store, 
  UserPlus, Star, Calendar, ShieldCheck, Smartphone
} from 'lucide-react';
import ProfilePermissionsModal from './ProfilePermissionsModal';


export default function UsersManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Certifique-se que este endpoint no PHP usa o SQL atualizado com LEFT JOINs que passamos
      const res = await api.get('list-all-users');
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

  const filteredUsers = users.filter((u: any) => {
    if (u.status === 'deleted') return false;
    const searchLower = search.toLowerCase();
    return (
      (u.name?.toLowerCase() || "").includes(searchLower) || 
      (u.company_name?.toLowerCase() || "").includes(searchLower) ||
      (u.email?.toLowerCase() || "").includes(searchLower) ||
      (u.document?.includes(searchLower)) || // CPF ou CNPJ
      (u.role?.toLowerCase() || "").includes(searchLower) ||
      (u.business_type?.toLowerCase() || "").includes(searchLower) || // BUSCA POR TIPO
      (u.city?.toLowerCase() || "").includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* HEADER E BUSCA */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
            <ShieldPlus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase italic text-slate-800 leading-tight">Gestão de Usuários</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              {users.length} Contas Registradas
            </p>
          </div>
        </div>

        <div className="flex flex-1 gap-3 w-full md:w-auto md:justify-end">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Nome, Empresa, Email ou Documento..." 
              className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-2xl border-none font-bold text-xs focus:ring-2 ring-blue-500/20 outline-none transition-all"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button 
            onClick={() => navigate('/dashboard/admin/usuarios/novo')} // CAMINHO DA NOVA PÁGINA
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase italic hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-100"
          >
            <UserPlus size={16} /> Novo Usuário
          </button>
        </div>
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
                        <p className="font-black text-slate-800 text-sm uppercase italic leading-none flex items-center gap-2">
                          {u.name}
                          {u.parent_id && <span className="text-[8px] bg-blue-100 text-blue-600 px-1 rounded not-italic">Sub</span>}
                        </p>
                        
                        {/* Se for empresa ou tiver empresa vinculada */}
                        {u.company_name ? (
                          <p className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1">
                            <Store size={10} /> {u.company_name}
                          </p>
                        ) : u.parent_name ? (
                          <p className="text-[10px] font-bold text-slate-500 uppercase italic flex items-center gap-1">
                            <UserPlus size={10} /> Vinculado a: {u.parent_name}
                          </p>
                        ) : (
                          <p className="text-[9px] font-bold text-slate-300 uppercase italic">Perfil Individual</p>
                        )}

                        <div className="flex flex-col gap-0.5">
                           <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5">
                             <Mail size={10} /> {u.email}
                           </span>
                           {u.whatsapp && (
                             <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5">
                               <Smartphone size={10} /> {u.whatsapp}
                             </span>
                           )}
                        </div>
                      </div>
                    </div>
                  </td>

                 <td className="px-8 py-5">
                  <div className="flex flex-col gap-2">
                    {/* Container de Badges com Wrap para suportar múltiplas informações */}
                    <div className="flex flex-wrap items-center gap-2">
                      
                      {/* 1. Badge do Plano (Pro/Free) */}
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${u.plan_id == 1 ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-slate-100 text-slate-400'}`}>
                        <Star size={10} fill={u.plan_id == 1 ? "currentColor" : "none"} />
                        {u.plan_id == 1 ? 'Pro' : 'Free'}
                      </span>

                      {/* 2. Badge do Tipo de Plano (Aparece SEMPRE) */}
                      <span className="text-[9px] font-bold text-slate-500 uppercase bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 whitespace-nowrap">
                        {u.plan_type || 'Geral'}
                      </span>

                      {/* 3. Badges dos Tipos de Empresa (Aparecem ADICIONALMENTE se existirem) */}
                      {u.business_type && u.business_type.split(',').map((type: string, idx: number) => (
                        <span key={idx} className="text-[9px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 whitespace-nowrap">
                          {type.trim().replace('_', ' ')}
                        </span>
                      ))}
                    </div>

                    {/* 4. Data de Criação (O "Desde") */}
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
                        onClick={() => navigate(`/dashboard/admin/usuarios/${u.id}`)}
                        className="h-10 w-10 flex items-center justify-center bg-white text-slate-400 border border-slate-200 hover:border-slate-900 hover:text-slate-900 rounded-xl transition-all shadow-sm"
                      >
                        <Search size={18} />
                      </button>

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
    </div>
  );
}