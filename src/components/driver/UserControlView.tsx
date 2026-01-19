import { useState, useEffect } from 'react';
import { api } from '../../api';
import { 
  User, Shield, Mail, Edit2, Check, X, 
  Search, Filter, ArrowUpDown, UserCog 
} from 'lucide-react';
import { Button } from "../../components/ui/button";

export default function UsersControlView() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Lista de cargos disponíveis para seleção
  const availableRoles = [
    'admin', 'manager', 'analyst', 'assistant', 
    'partner', 'company', 'advertiser', 'driver'
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Endpoint que retorna todos os usuários (protegido por admin no back-end)
      const res = await api.get('users-list');
      setUsers(res.data || []);
    } catch (e) {
      console.error("Erro ao carregar utilizadores");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: number, newRole: string) => {
    try {
      await api.put(`update-user-role&id=${userId}`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setEditingId(null);
    } catch (e) {
      alert("Erro ao atualizar cargo.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-20 text-center animate-pulse font-bold">A carregar utilizadores...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER E BUSCA */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
            <UserCog size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 italic uppercase">Gestão de Staff</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Controle de permissões e acessos</p>
          </div>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Procurar por nome ou e-mail..." 
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 rounded-2xl border-none outline-none text-sm font-bold focus:ring-2 ring-blue-500/20 transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABELA DE UTILIZADORES */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <tr>
              <th className="p-6">Utilizador</th>
              <th className="p-6">Cargo Atual</th>
              <th className="p-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-all">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-black text-slate-500">
                      {user.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-black text-slate-800 uppercase text-sm">{user.name}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Mail size={12} /> {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="p-6">
                  {editingId === user.id ? (
                    <select 
                      className="bg-white border border-blue-200 rounded-lg text-xs font-bold p-1 outline-none ring-2 ring-blue-500/10"
                      value={user.role}
                      onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      onBlur={() => setEditingId(null)}
                      autoFocus
                    >
                      {availableRoles.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter
                      ${user.role === 'admin' ? 'bg-red-100 text-red-600' : 
                        user.role === 'manager' ? 'bg-blue-100 text-blue-600' : 
                        'bg-slate-100 text-slate-500'}
                    `}>
                      {user.role}
                    </span>
                  )}
                </td>

                <td className="p-6 text-right">
                  <button 
                    onClick={() => setEditingId(user.id)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="Alterar Cargo"
                  >
                    <Shield size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="p-20 text-center text-slate-400 italic font-bold">Nenhum utilizador encontrado.</div>
        )}
      </div>
    </div>
  );
}