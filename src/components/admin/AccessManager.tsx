import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  Shield, Plus, Trash2, Edit3, X, Check, Loader2,
  Users, Truck, ShoppingCart, Building2, Users2, Megaphone, MessageSquare, 
  DollarSign, Lock, Eye, EyeOff
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

const moduleConfig: Record<string, { icon?: React.ReactNode; label: string; color: string }> = {
  freight: { icon: <Truck size={16} />, label: 'Fretes', color: 'bg-blue-100 text-blue-600' },
  quotes: { icon: <ShoppingCart size={16} />, label: 'Cotações', color: 'bg-purple-100 text-purple-600' },
  marketplace: { icon: <Building2 size={16} />, label: 'Marketplace', color: 'bg-green-100 text-green-600' },
  groups: { icon: <Users2 size={16} />, label: 'Comunidades', color: 'bg-yellow-100 text-yellow-600' },
  ads: { icon: <Megaphone size={16} />, label: 'Anúncios', color: 'bg-pink-100 text-pink-600' },
  support: { icon: <MessageSquare size={16} />, label: 'Suporte', color: 'bg-indigo-100 text-indigo-600' },
  wallet: { icon: <DollarSign size={16} />, label: 'Financeiro', color: 'bg-emerald-100 text-emerald-600' },
  users: { icon: <Users size={16} />, label: 'Usuários', color: 'bg-slate-100 text-slate-600' },
  roles: { icon: <Lock size={16} />, label: 'Cargos', color: 'bg-orange-100 text-orange-600' },
};

type TabType = 'roles' | 'permissions';

export default function AccessManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('roles');
  
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  const [rolePermissions, setRolePermissions] = useState<Record<number, number[]>>({});
  
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingPerm, setEditingPerm] = useState<Permission | null>(null);
  
  const [roleForm, setRoleForm] = useState({ name: '', slug: '', permission_ids: [] as number[] });
  const [permForm, setPermForm] = useState({ slug: '', label: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/admin-roles'),
        api.get('/admin-permissions')
      ]);
      
      if (rolesRes.data?.success) {
        setRoles(rolesRes.data.data);
        setAllPermissions(rolesRes.data.permissions || []);
        
        const grouped: Record<string, Permission[]> = {};
        (rolesRes.data.permissions || []).forEach((perm: Permission) => {
          const module = perm.slug.split('.')[0];
          if (!grouped[module]) grouped[module] = [];
          grouped[module].push(perm);
        });
        setGroupedPermissions(grouped);
        
        const perms: Record<number, number[]> = {};
        Object.entries(rolesRes.data.rolePermissions || {}).forEach(([roleId, permsList]) => {
          perms[Number(roleId)] = (permsList as Permission[]).map(p => p.id);
        });
        setRolePermissions(perms);
      }
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSaveRole = async () => {
    if (!roleForm.name) return alert("Nome do cargo é obrigatório");
    try {
      setSaving(true);
      if (editingRole) {
        await api.put('/admin-roles', { id: editingRole.id, ...roleForm });
      } else {
        await api.post('/admin-roles', roleForm);
      }
      setShowRoleModal(false);
      setEditingRole(null);
      setRoleForm({ name: '', slug: '', permission_ids: [] });
      await loadData();
    } catch (error) {
      alert("Erro ao salvar cargo");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!confirm("Excluir este cargo?")) return;
    try {
      await api.delete('/admin-roles', { data: { id } });
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao excluir");
    }
  };

  const handleSavePerm = async () => {
    if (!permForm.slug || !permForm.label) return alert("Preencha todos os campos");
    try {
      setSaving(true);
      if (editingPerm) {
        await api.put('/admin-permissions', { id: editingPerm.id, ...permForm });
      } else {
        await api.post('/admin-permissions', permForm);
      }
      setShowPermModal(false);
      setEditingPerm(null);
      setPermForm({ slug: '', label: '' });
      await loadData();
    } catch (error) {
      alert("Erro ao salvar permissão");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePerm = async (id: number) => {
    if (!confirm("Excluir esta permissão?")) return;
    try {
      await api.delete('/admin-permissions', { data: { id } });
      await loadData();
    } catch (error) {
      alert("Erro ao excluir");
    }
  };

  const openEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      slug: role.slug,
      permission_ids: rolePermissions[role.id] || []
    });
    setShowRoleModal(true);
  };

  const openNewRole = () => {
    setEditingRole(null);
    setRoleForm({ name: '', slug: '', permission_ids: [] });
    setShowRoleModal(true);
  };

  const openEditPerm = (perm: Permission) => {
    setEditingPerm(perm);
    setPermForm({ slug: perm.slug, label: perm.label });
    setShowPermModal(true);
  };

  const openNewPerm = () => {
    setEditingPerm(null);
    setPermForm({ slug: '', label: '' });
    setShowPermModal(true);
  };

  const togglePermission = (permId: number) => {
    setRoleForm(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permId)
        ? prev.permission_ids.filter(id => id !== permId)
        : [...prev.permission_ids, permId]
    }));
  };

  const toggleAllInModule = (module: string) => {
    const modulePerms = groupedPermissions[module] || [];
    const moduleIds = modulePerms.map(p => p.id);
    const allSelected = moduleIds.every(id => roleForm.permission_ids.includes(id));
    
    if (allSelected) {
      setRoleForm(prev => ({
        ...prev,
        permission_ids: prev.permission_ids.filter(id => !moduleIds.includes(id))
      }));
    } else {
      setRoleForm(prev => ({
        ...prev,
        permission_ids: [...new Set([...prev.permission_ids, ...moduleIds])]
      }));
    }
  };

  const isModuleAllSelected = (module: string) => {
    const modulePerms = groupedPermissions[module] || [];
    return modulePerms.length > 0 && modulePerms.every(p => roleForm.permission_ids.includes(p.id));
  };

  if (loading) return (
    <div className="flex flex-col items-center p-20">
      <Loader2 className="animate-spin text-orange-500" size={40} />
      <p className="font-black mt-4 italic uppercase text-[10px]">Carregando...</p>
    </div>
  );

  return (
    <div className="max-w-6xl space-y-6 animate-in fade-in duration-500 pb-32">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase italic">Acessos</h2>
          <p className="text-slate-500 text-sm font-bold uppercase">Gerencie cargos e permissões do sistema</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-100 w-fit">
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-6 py-3 rounded-xl font-black uppercase text-xs transition-all ${
            activeTab === 'roles' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Shield size={16} className="inline mr-2" />
          Cargos
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-6 py-3 rounded-xl font-black uppercase text-xs transition-all ${
            activeTab === 'permissions' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-50'
          }`}
        >
          <Lock size={16} className="inline mr-2" />
          Permissões
        </button>
      </div>

      {/* TAB CONTENT: ROLES */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black uppercase italic">Cargos do Sistema</h3>
            <button
              onClick={openNewRole}
              className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs hover:bg-orange-600 transition-all flex items-center gap-2"
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
                    <button onClick={() => openEditRole(role)} className="p-2 bg-slate-100 rounded-lg text-blue-500 hover:bg-blue-50">
                      <Edit3 size={14} />
                    </button>
                    {!['admin', 'driver', 'company', 'advertiser'].includes(role.slug) && (
                      <button onClick={() => handleDeleteRole(role.id)} className="p-2 bg-slate-100 rounded-lg text-red-500 hover:bg-red-50">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                
                <h3 className="font-black uppercase italic text-lg">{role.name}</h3>
                <p className="text-[10px] text-slate-400 font-mono mb-4">{role.slug}</p>
                
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-4">
                  <Users size={14} />
                  {role.user_count || 0} usuário(s)
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {Object.keys(groupedPermissions).map(module => {
                    const hasPerms = (rolePermissions[role.id] || []).some(id => 
                      groupedPermissions[module].some(p => p.id === id)
                    );
                    const config = moduleConfig[module] || { label: module, color: 'bg-slate-100 text-slate-600' };
                    return hasPerms ? (
                      <span key={module} className={`text-[9px] px-2 py-1 rounded-full flex items-center gap-1 ${config.color}`}>
                        {config.icon} {config.label}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PERMISSIONS */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black uppercase italic">Permissões do Sistema</h3>
            <button
              onClick={openNewPerm}
              className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs hover:bg-orange-600 transition-all flex items-center gap-2"
            >
              <Plus size={16} /> Nova Permissão
            </button>
          </div>

          {Object.entries(groupedPermissions).map(([module, perms]) => {
            const config = moduleConfig[module] || { label: module, color: 'bg-slate-100 text-slate-600' };
            return (
              <div key={module} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`p-2 rounded-xl ${config.color}`}>{config.icon}</span>
                  <h4 className="font-black uppercase text-lg">{config.label}</h4>
                  <span className="text-xs text-slate-400">({perms.length} permissões)</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {perms.map((perm) => (
                    <div key={perm.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group">
                      <div>
                        <p className="font-bold text-sm text-slate-800">{perm.label}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{perm.slug}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openEditPerm(perm)} className="p-1.5 bg-white rounded-lg text-blue-500 hover:bg-blue-50">
                          <Edit3 size={12} />
                        </button>
                        <button onClick={() => handleDeletePerm(perm.id)} className="p-1.5 bg-white rounded-lg text-red-500 hover:bg-red-50">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ROLE */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic">
                {editingRole ? 'Editar' : 'Novo'} Cargo
              </h3>
              <button onClick={() => setShowRoleModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nome do Cargo</label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={e => setRoleForm({...roleForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '_')})}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                  placeholder="Ex: Gerente de Vendas"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Permissões por Módulo</label>
              <div className="mt-2 max-h-80 overflow-y-auto space-y-4">
                {Object.entries(groupedPermissions).map(([module, perms]) => {
                  const config = moduleConfig[module] || { label: module, color: 'bg-slate-100 text-slate-600' };
                  return (
                    <div key={module} className="border border-slate-100 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`p-1.5 rounded-lg ${config.color}`}>{config.icon}</span>
                          <span className="font-black uppercase text-sm">{config.label}</span>
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
                              checked={roleForm.permission_ids.includes(perm.id)}
                              onChange={() => togglePermission(perm.id)}
                              className="w-4 h-4 accent-orange-500"
                            />
                            <span className="text-xs font-bold">{perm.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSaveRole}
              disabled={saving || !roleForm.name}
              className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black uppercase mt-6 hover:bg-orange-600 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
              {editingRole ? 'Atualizar' : 'Criar'} Cargo
            </button>
          </div>
        </div>
      )}

      {/* MODAL: PERMISSION */}
      {showPermModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic">
                {editingPerm ? 'Editar' : 'Nova'} Permissão
              </h3>
              <button onClick={() => setShowPermModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Slug (identificador)</label>
                <input
                  type="text"
                  value={permForm.slug}
                  onChange={e => setPermForm({...permForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '.')})}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                  placeholder="Ex: freight.create"
                  disabled={!!editingPerm}
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nome da Permissão</label>
                <input
                  type="text"
                  value={permForm.label}
                  onChange={e => setPermForm({...permForm, label: e.target.value})}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                  placeholder="Ex: Criar Fretes"
                />
              </div>

              <button
                onClick={handleSavePerm}
                disabled={saving || !permForm.slug || !permForm.label}
                className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black uppercase mt-4 hover:bg-orange-600 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                {editingPerm ? 'Atualizar' : 'Criar'} Permissão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
