import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import { 
  Mail, Loader2, Search, User, Settings2, ShieldPlus, 
  Trash2, Building2, CheckCircle, Clock, Truck, Store, 
  UserPlus, Star, Calendar, ShieldCheck, Smartphone,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { PageShell, StatsGrid, StatCard } from '@/components/admin';


export default function UsersManager() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterRole, search, pageSize]);

  const filteredUsers = useMemo(() => {
    return users.filter((u: any) => {
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
  }, [users, filterStatus, filterRole, search]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredUsers, currentPage, pageSize]);

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
          onClick={() => navigate('/dashboard/admin/usuarios/novo')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={16} /> Novo Usuário
        </button>
      }
    >
      <div className="mt-6">
        <StatsGrid>
          <StatCard label="Total" value={stats.total} icon={ShieldPlus} />
          <StatCard label="Ativos" value={stats.active} variant="green" icon={CheckCircle} />
          <StatCard label="Pendentes" value={stats.pending} variant="yellow" icon={Clock} />
          <StatCard label="Empresas" value={stats.companies} variant="blue" icon={Building2} />
        </StatsGrid>
      </div>

      <div className="flex flex-wrap gap-3 mt-4 items-center">
        <select 
          value={filterStatus} 
          onChange={e => setFilterStatus(e.target.value)} 
          className="bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativos</option>
          <option value="pending">Pendentes</option>
          <option value="inactive">Inativos</option>
        </select>

        <select 
          value={filterRole} 
          onChange={e => setFilterRole(e.target.value)} 
          className="bg-white dark:bg-slate-800 dark:text-white dark:border-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os Tipos</option>
          <option value="admin">Administrador</option>
          <option value="company">Empresa</option>
          <option value="driver">Motorista</option>
        </select>

        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Buscar usuário..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {/* LISTAGEM */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mt-4">
        <div className="p-4 lg:p-5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3">
          <h3 className="font-bold text-slate-900 dark:text-white">
            Usuários ({filteredUsers.length})
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Mostrar</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-xs text-slate-500 dark:text-slate-400">por página</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-700">
                <th className="px-5 py-4">Identificação / Perfil</th>
                <th className="px-5 py-4">Tipo & Plano</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={4} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-slate-300 dark:text-slate-500" size={32} /></td></tr>
              ) : paginatedUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all
                          ${u.role === 'admin' ? 'bg-slate-900 border-slate-900 text-white' : 
                            u.parent_id ? 'border-dashed border-blue-200 bg-blue-50 text-blue-400' : 
                            'border-slate-100 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-400 dark:text-slate-300'}`}>
                          
                          {u.role === 'admin' && <ShieldCheck size={16} />}
                          {u.role === 'company' && <Building2 size={16} />}
                          {u.role === 'driver' && <Truck size={16} />}
                        </div>
                        
                        {(u.is_verified == 1) && (
                          <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white dark:border-slate-800 shadow-sm">
                            <CheckCircle size={8} fill="currentColor" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-slate-800 dark:text-white text-xs uppercase italic leading-none">
                            {u.user_name || u.name || '⚠️ Sem nome'}
                          </p>
                          {u.role === 'company' && (
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase whitespace-nowrap">
                              {u.company_name || u.company_corporate_name || ''}
                            </span>
                          )}
                          {u.parent_id && u.parent_name && (
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase italic">
                              {u.parent_name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <Mail size={9} /> {u.email}
                          </span>
                          {u.whatsapp && (
                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                              <Smartphone size={9} /> {u.whatsapp}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg border border-blue-100 dark:border-blue-800 whitespace-nowrap">
                          {u.user_type === 'DRIVER' || u.role === 'driver' ? 'Motorista' :
                           u.user_type === 'COMPANY' || u.role === 'company' ? 'Empresa' :
                           u.role === 'admin' ? 'Admin' :
                           u.role === 'manager' ? 'Gerente' :
                           u.role === 'coordinator' ? 'Coordenador' :
                           u.role === 'supervisor' ? 'Supervisor' :
                           u.role === 'analyst' ? 'Analista' :
                           u.role === 'support' ? 'Suporte' :
                           u.role === 'finance' ? 'Financeiro' :
                           u.role === 'marketing' ? 'Marketing' : u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'Usuário'}
                        </span>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${(!u.plan_name || u.plan_id == 1) ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800'}`}>
                          {(!u.plan_name || u.plan_id == 1) && <Star size={10} />}
                          {u.plan_name || (u.plan_id == 1 ? 'Free' : 'Plano')}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Calendar size={10} /> 
                        Desde {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '---'}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      u.status === 'approved' || u.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 
                      u.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 
                      'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}>
                      {u.status === 'pending' && <Clock size={10} />}
                      {u.status === 'approved' || u.status === 'active' ? 'Ativo' : u.status === 'pending' ? 'Pendente' : 'Bloqueado'}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-1">
                      {(u.status === 'pending') && (
                        <button 
                          onClick={() => handleApprove(u.id, u.name)}
                          className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                          title="Aprovar"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                      <button 
                        onClick={() => navigate(`/dashboard/admin/usuarios/${u.id}`)} 
                        title="Editar"
                        className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg"
                      >
                        <Settings2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(u.id, u.display_name || u.name || u.individual_name)}
                        title="Excluir"
                        className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {!loading && paginatedUsers.length === 0 && (
            <div className="py-20 text-center">
              <User size={40} className="mx-auto text-slate-200 dark:text-slate-600 mb-4" />
              <p className="text-slate-400 dark:text-slate-500 font-bold text-sm uppercase">Nenhum usuário encontrado na busca.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredUsers.length)} de {filteredUsers.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} className="text-slate-600 dark:text-slate-300" />
              </button>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} className="text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>
        )}
      </div>

    </PageShell>
   );
}