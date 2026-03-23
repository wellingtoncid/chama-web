import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  Shield, Plus, Trash2, Edit3, X, Check, Loader2,
  Users, Truck, ShoppingCart, Building2, Users2, Megaphone, MessageSquare, DollarSign, Lock
} from 'lucide-react';

interface Role {
  id: number;
  name: string;
  slug: string;
  user_count: number;
}

interface Permission {
  id: number;
  slug: string;
  label: string;
}

const moduleConfig: Record<string, { icon: React.ReactNode; label: string }> = {
  freight: { icon: <Truck size={16} />, label: 'Fretes' },
  quotes: { icon: <ShoppingCart size={16} />, label: 'Cotações' },
  marketplace: { icon: <Building2 size={16} />, label: 'Marketplace' },
  groups: { icon: <Users2 size={16} />, label: 'Comunidades' },
  ads: { icon: <Megaphone size={16} />, label: 'Anúncios' },
  support: { icon: <MessageSquare size={16} />, label: 'Suporte' },
  wallet: { icon: <DollarSign size={16} />, label: 'Financeiro' },
  users: { icon: <Users size={16} />, label: 'Usuários' },
  roles: { icon: <Lock size={16} />, label: 'Cargos' },
};

export default function RolesManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  const [rolePermissions, setRolePermissions] = useState<Record<number, number[]>>({});
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', permission_ids: [] as number[] });

  const loadRoles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin-roles');
      if (res.data?.success) {
        setRoles(res.data.data);
        setAllPermissions(res.data.permissions || []);
        
        const grouped: Record<string, Permission[]> = {};
        (res.data.permissions || []).forEach((perm: Permission) => {
          const module = perm.slug.split('.')[0];
          if (!grouped[module]) grouped[module] = [];
          grouped[module].push(perm);
        });
        setGroupedPermissions(grouped);
        
        const perms: Record<number, number[]> = {};
        Object.entries(res.data.rolePermissions || {}).forEach(([roleId, permsList]) => {
          perms[Number(roleId)] = (permsList as Permission[]).map(p => p.id);
        });
        setRolePermissions(perms);
      }
    } catch (error) {
      console.error("Erro ao carregar roles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRoles(); }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.slug) return alert("Preencha o nome do cargo");
    try {
      setSaving(true);
      if (editingRole) {
        await api.put('/admin-roles', { id: editingRole.id, ...formData });
      } else {
        await api.post('/admin-roles', formData);
      }
      setShowModal(false);
      setEditingRole(null);
      setFormData({ name: '', slug: '', permission_ids: [] });
      await loadRoles();
    } catch (error) {
      alert("Erro ao salvar cargo");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este cargo?")) return;
    try {
      await api.delete('/admin-roles', { data: { id } });
      await loadRoles();
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao excluir");
    }
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      slug: role.slug,
      permission_ids: rolePermissions[role.id] || []
    });
    setShowModal(true);
  };

  const togglePermission = (permId: number) => {
    setFormData(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permId)
        ? prev.permission_ids.filter(id => id !== permId)
        : [...prev.permission_ids, permId]
    }));
  };

  const toggleAllInModule = (module: string) => {
    const modulePerms = groupedPermissions[module] || [];
    const moduleIds = modulePerms.map(p => p.id);
    const allSelected = moduleIds.every(id => formData.permission_ids.includes(id));
    
    if (allSelected) {
      setFormData(prev => ({
        ...prev,
        permission_ids: prev.permission_ids.filter(id => !moduleIds.includes(id))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permission_ids: [...new Set([...prev.permission_ids, ...moduleIds])]
      }));
    }
  };

  const isModuleAllSelected = (module: string) => {
    const modulePerms = groupedPermissions[module] || [];
    return modulePerms.length > 0 && modulePerms.every(p => formData.permission_ids.includes(p.id));
  };

  if (loading) return (
    <div className="flex flex-col items-center p-20">
      <Loader2 className="animate-spin text-orange-500" size={40} />
      <p className="font-black mt-4 italic uppercase text-[10px]">Carregando Cargos...</p>
    </div>
  );

  const inputClass = "w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2";
  const labelClass = "text-[10px] font-black uppercase text-slate-400 tracking-wider";

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase italic">Cargos</h2>
          <p className="text-slate-500 text-sm font-bold uppercase">Defina cargos e suas permissões de acesso</p>
        </div>
        <button
          onClick={() => { setEditingRole(null); setFormData({ name: '', slug: '', permission_ids: [] }); setShowModal(true); }}
          className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus size={16} /> Novo Cargo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div key={role.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Shield className="text-orange-500" size={24} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => openEdit(role)} className="p-2 bg-slate-100 rounded-lg text-blue-500 hover:bg-blue-50">
                  <Edit3 size={14} />
                </button>
                {!['admin', 'driver', 'company', 'advertiser'].includes(role.slug) && (
                  <button onClick={() => handleDelete(role.id)} className="p-2 bg-slate-100 rounded-lg text-red-500 hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            
            <h3 className="font-black uppercase italic text-lg">{role.name}</h3>
            <p className="text-[10px] text-slate-400 font-mono mb-4">{role.slug}</p>
            
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Users size={14} />
              {role.user_count || 0} usuário(s)
            </div>
            
            <div className="mt-4 flex flex-wrap gap-1">
              {Object.keys(groupedPermissions).slice(0, 4).map(module => {
                const hasPerms = (rolePermissions[role.id] || []).some(id => 
                  groupedPermissions[module].some(p => p.id === id)
                );
                return hasPerms ? (
                  <span key={module} className="text-[9px] px-2 py-1 bg-slate-100 rounded-full text-slate-500 flex items-center gap-1">
                    {moduleConfig[module]?.icon} {moduleConfig[module]?.label || module}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic">
                {editingRole ? 'Editar' : 'Novo'} Cargo
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className={labelClass}>Nome do Cargo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                  className={inputClass}
                  placeholder="Ex: Gerente de Vendas"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Permissões por Módulo</label>
              <div className="mt-2 max-h-80 overflow-y-auto space-y-4">
                {Object.entries(groupedPermissions).map(([module, perms]) => (
                  <div key={module} className="border border-slate-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-500">{moduleConfig[module]?.icon}</span>
                        <span className="font-black uppercase text-sm">{moduleConfig[module]?.label || module}</span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isModuleAllSelected(module)}
                          onChange={() => toggleAllInModule(module)}
                          className="w-4 h-4 accent-orange-500"
                        />
                        <span className="text-[10px] font-bold text-slate-500">Todos</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {perms.map(perm => (
                        <label key={perm.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100">
                          <input
                            type="checkbox"
                            checked={formData.permission_ids.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                            className="w-4 h-4 accent-orange-500"
                          />
                          <span className="text-xs font-bold">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !formData.name}
              className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black uppercase mt-6 hover:bg-orange-600 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
              {editingRole ? 'Atualizar' : 'Criar'} Cargo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
