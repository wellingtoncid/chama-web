import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Lock, Unlock, ShieldAlert } from "lucide-react";
import { Button } from "../../components/ui/button";
import { api } from "../../api/api";
import GroupForm from "../../components/groups/GroupForm"; // Certifique-se de que o caminho está correto

interface WhatsAppGroup {
  id: number;
  region_name: string;
  member_count: number;
  invite_link: string;
  is_public: number;
  is_visible_home: number;
  target_role: string;
  category: string;
  internal_notes?: string;
}

const GroupsManagement = () => {
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<WhatsAppGroup | null>(null);

  // Verificação de Acesso
  const user = JSON.parse(localStorage.getItem('@ChamaFrete:user') || 'null');
  const hasAccess = user?.role === 'admin' || user?.role === 'manager';

  const fetchGroups = async () => {
    try {
      setLoading(true);
      // Usando o helper de api para manter consistência
      const response = await api.get(`?endpoint=groups&user_role=${user?.role}`);
      setGroups(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasAccess) fetchGroups();
  }, []);

  const handleSave = async (formData: any) => {
    try {
      if (editingGroup) {
        // UPDATE
        await api.put(`?endpoint=groups&id=${editingGroup.id}`, formData);
      } else {
        // CREATE
        await api.post(`?endpoint=groups`, formData);
      }
      setIsModalOpen(false);
      fetchGroups();
    } catch (error) {
      alert("Erro ao salvar o grupo. Verifique os dados.");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Deseja realmente excluir este grupo?")) {
      try {
        await api.delete(`?endpoint=groups&id=${id}`);
        fetchGroups();
      } catch (error) {
        alert("Erro ao excluir.");
      }
    }
  };

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6">
        <ShieldAlert size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 uppercase italic">Acesso Restrito</h2>
        <p className="text-slate-500 font-medium">Apenas administradores podem acessar esta área.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Gerenciar Grupos</h1>
          <p className="text-slate-500 font-medium text-sm">Controle de visibilidade e acesso à comunidade.</p>
        </div>
        <Button 
          onClick={() => { setEditingGroup(null); setIsModalOpen(true); }} 
          className="bg-[#1f4ead] hover:bg-blue-700 rounded-2xl font-bold py-6 px-6 shadow-lg shadow-blue-100"
        >
          <Plus className="w-5 h-5 mr-2" /> Novo Grupo
        </Button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Região / Categoria</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Membros</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Público Alvo / Visibilidade</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-bold">Carregando...</td></tr>
            ) : groups.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-bold">Nenhum grupo cadastrado.</td></tr>
            ) : (
              groups.map((group) => (
                <tr key={group.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-black text-slate-800 uppercase text-sm">{group.region_name}</p>
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{group.category}</p>
                  </td>
                  <td className="px-6 py-4 text-center font-black text-slate-600 italic">
                    {group.member_count}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <span className={`flex items-center gap-1 text-[9px] font-black uppercase px-2 py-1 rounded-lg ${group.is_visible_home ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                        {group.is_visible_home ? <Eye size={12}/> : <EyeOff size={12}/>} Home
                      </span>
                      <span className={`flex items-center gap-1 text-[9px] font-black uppercase px-2 py-1 rounded-lg ${group.is_public ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                        {group.is_public ? <Unlock size={12}/> : <Lock size={12}/>} {group.is_public ? 'Livre' : 'Login'}
                      </span>
                      <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">
                        {group.target_role === 'all' ? 'Todos' : group.target_role === 'driver' ? 'Motoristas' : 'Empresas'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => { setEditingGroup(group); setIsModalOpen(true); }} 
                      className="p-3 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <Edit className="w-4 h-4"/>
                    </button>
                    <button 
                      onClick={() => handleDelete(group.id)} 
                      className="p-3 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Cadastro/Edição */}
      {isModalOpen && (
        <GroupForm 
          group={editingGroup} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
};

export default GroupsManagement;