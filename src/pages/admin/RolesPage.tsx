import { useState, useEffect } from 'react';
import { api } from '@/api/api';
import { 
  Shield, Plus, Pencil, Trash2, 
  Loader2, ChevronDown, ChevronUp,
  Truck, ShoppingBag, FileText, Megaphone,
  MessageCircle, CreditCard, Tag, HelpCircle, Eye, Check
} from 'lucide-react';
import { MODULE_LIST } from '@/constants/modules';
import { PERMISSION_LIST } from '@/constants/permissions';

const MODULE_ICONS: Record<string, React.ReactNode> = {
  fretes: <Truck size={16} />,
  marketplace: <ShoppingBag size={16} />,
  cotacoes: <FileText size={16} />,
  publicidade: <Megaphone size={16} />,
  chat: <MessageCircle size={16} />,
  financeiro: <CreditCard size={16} />,
  planos: <Tag size={16} />,
  suporte: <HelpCircle size={16} />,
  grupos: null,
};

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>(MODULE_LIST.map(m => ({
    key: m.key,
    label: m.label,
    description: m.description,
    required: m.required,
    defaultFor: m.defaultFor || [],
  })));
  const [rolePermissions, setRolePermissions] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRole, setExpandedRole] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [newRole, setNewRole] = useState({
    name: '',
    slug: '',
    description: '',
    type: 'internal' as 'internal' | 'external',
    permission_ids: [] as number[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const rolesRes = await api.get('/admin-roles');
      
      if (rolesRes.data?.success) {
        setRoles(rolesRes.data.data || []);
        setPermissions(rolesRes.data.permissions || []);
        setRolePermissions(rolesRes.data.rolePermissions || {});
      } else {
        setError(rolesRes.data?.message || 'Erro ao carregar dados');
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.name || !newRole.slug) {
      return alert('Nome e slug são obrigatórios');
    }

    try {
      setSaving(true);
      const res = await api.post('/admin-roles', {
        name: newRole.name,
        slug: newRole.slug.toLowerCase().replace(/\s+/g, '_'),
        permission_ids: newRole.permission_ids,
      });

      if (res.data?.success) {
        setShowCreateModal(false);
        setNewRole({ name: '', slug: '', description: '', type: 'internal', permission_ids: [] });
        fetchData();
        alert('Cargo criado com sucesso!');
      } else {
        alert(res.data?.message || 'Erro ao criar cargo');
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erro ao criar cargo');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole || !editingRole.name || !editingRole.slug) {
      return alert('Nome e slug são obrigatórios');
    }

    try {
      setSaving(true);
      const res = await api.put('/admin-roles', {
        id: editingRole.id,
        name: editingRole.name,
        slug: editingRole.slug.toLowerCase().replace(/\s+/g, '_'),
        permission_ids: editingRole.permission_ids || [],
      });

      if (res.data?.success) {
        setEditingRole(null);
        fetchData();
        alert('Cargo atualizado com sucesso!');
      } else {
        alert(res.data?.message || 'Erro ao atualizar cargo');
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erro ao atualizar cargo');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (id: number, slug: string) => {
    if (!confirm('Tem certeza que deseja excluir este cargo?')) return;

    if (['admin', 'driver', 'company'].includes(slug)) {
      return alert('Este cargo não pode ser excluído.');
    }
    
    // Verificar se há usuários com este cargo
    const roleUsers = roles.find(r => r.id === id)?.user_count || 0;
    if (roleUsers > 0) {
      return alert(`Este cargo possui ${roleUsers} usuário(s). Exclua ou mova os usuários primeiro.`);
    }

    try {
      const res = await api.delete('/admin-roles', { data: { id } });
      if (res.data?.success) {
        fetchData();
        alert('Cargo excluído com sucesso!');
      } else {
        alert(res.data?.message || 'Erro ao excluir cargo');
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erro ao excluir cargo');
    }
  };

  const togglePermission = (permId: number) => {
    if (editingRole) {
      const current = editingRole.permission_ids || [];
      const updated = current.includes(permId)
        ? current.filter((id: number) => id !== permId)
        : [...current, permId];
      setEditingRole({ ...editingRole, permission_ids: updated });
    }
  };

  const handleNewPermissionToggle = (permId: number) => {
    const current = newRole.permission_ids;
    const updated = current.includes(permId)
      ? current.filter((id: number) => id !== permId)
      : [...current, permId];
    setNewRole({ ...newRole, permission_ids: updated });
  };

  const getRoleTypeLabel = (type: string) => {
    return type === 'internal' ? 'Interno' : 'Externo';
  };

  const getRoleTypeColor = (type: string) => {
    return type === 'internal' 
      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' 
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  };

  const getRoleModules = (roleSlug: string, rolePerms: any[]) => {
    const permSlugs = rolePerms.map((p: any) => p.slug);
    
    if (roleSlug === 'admin') {
      return modules.map(mod => ({ ...mod, access: 'full' as const }));
    }
    
    return modules.filter((mod: any) => {
      const modPerms = PERMISSION_LIST.filter(p => p.slug.startsWith(mod.key + '.'));
      if (modPerms.length === 0) return false;
      
      const hasView = modPerms.some(p => 
        permSlugs.includes(p.slug) || 
        permSlugs.includes(`${mod.key}.view`)
      );
      const hasFull = modPerms.some(p => 
        permSlugs.includes(p.slug) && !p.slug.includes('.view')
      );
      return hasView || hasFull;
    }).map((mod: any) => {
      const modPerms = PERMISSION_LIST.filter(p => p.slug.startsWith(mod.key + '.'));
      const hasFull = modPerms.some(p => 
        permSlugs.includes(p.slug) && !p.slug.includes('.view')
      );
      return {
        ...mod,
        access: hasFull ? 'full' : 'view'
      };
    });
  };

  const groupedPermissions = PERMISSION_LIST.reduce((acc, perm) => {
    const category = perm.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(perm);
    return acc;
  }, {} as Record<string, any[]>);

  const formatSlug = (str: string) => {
    return str.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button onClick={fetchData} className="mt-2 text-sm text-red-600 hover:underline">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center">
        <Shield className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-400">Nenhum cargo encontrado</h2>
        <p className="text-slate-500 mt-2">Clique em "Novo Cargo" para criar o primeiro cargo.</p>
      </div>
    );
  }

  return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Cargos e Permissões
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Gerencie cargos e suas permissões no sistema
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Novo Cargo
          </button>
        </div>

      <div className="grid gap-4">
        {roles.map((role) => {
          const isExpanded = expandedRole === role.id;
          const isEditing = editingRole?.id === role.id;
          const rolePerms = rolePermissions[role.id] || [];
          const currentPerms = isEditing ? editingRole.permission_ids : rolePerms.map((p: any) => p.id);
          const roleModules = getRoleModules(role.slug, rolePerms);

          return (
            <div
              key={role.id}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                onClick={() => {
                  if (!isEditing) {
                    setExpandedRole(isExpanded ? null : role.id);
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Shield size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {role.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-slate-500">{role.slug}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleTypeColor(role.type || 'internal')}`}>
                        {getRoleTypeLabel(role.type || 'internal')}
                      </span>
                      {role.user_count > 0 && (
                        <span className="text-xs text-slate-500">
                          {role.user_count} usuário{role.user_count > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(role.slug === 'admin' || role.is_protected) ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRole({ ...role, permission_ids: currentPerms });
                        }}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRole({ ...role, permission_ids: currentPerms });
                        }}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRole(role.id, role.slug);
                        }}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={20} className="text-slate-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-900/50">
                  {isEditing ? (
                    <form onSubmit={handleUpdateRole} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Nome
                          </label>
                          <input
                            type="text"
                            value={editingRole.name}
                            onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Slug
                          </label>
                          <input
                            type="text"
                            value={editingRole.slug}
                            onChange={(e) => setEditingRole({ ...editingRole, slug: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white mb-3">Permissões</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {permissions.map((perm: any) => (
                            <label
                              key={perm.id}
                              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                                (editingRole.permission_ids || []).includes(perm.id)
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={(editingRole.permission_ids || []).includes(perm.id)}
                                onChange={() => togglePermission(perm.id)}
                                className="rounded"
                              />
                              <span className="text-sm">{perm.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <button
                          type="button"
                          onClick={() => setEditingRole(null)}
                          className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                          {saving && <Loader2 size={16} className="animate-spin" />}
                          Salvar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                          Módulos Acessíveis
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {roleModules.length > 0 ? (
                            roleModules.map((mod: any) => (
                              <div
                                key={mod.key}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                                  mod.access === 'full'
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600'
                                }`}
                              >
                                <span className="text-slate-600 dark:text-slate-300">
                                  {MODULE_ICONS[mod.key] || <Shield size={16} />}
                                </span>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                  {mod.label}
                                </span>
                                {mod.access === 'full' ? (
                                  <Check size={14} className="text-green-600" />
                                ) : (
                                  <Eye size={14} className="text-slate-400" />
                                )}
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500">Nenhum módulo configurado</span>
                          )}
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Check size={12} className="text-green-600" /> Acesso completo
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye size={12} /> Apenas visualização
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-white mb-2">
                          Permissões ({rolePerms.length})
                        </h4>
                        {rolePerms.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {rolePerms.map((perm: any) => (
                              <span
                                key={perm.id}
                                className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-700 dark:text-slate-300"
                              >
                                {perm.label}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Nenhuma permissão específica configurada
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Novo Cargo
              </h2>
            </div>
            <form onSubmit={handleCreateRole} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value, slug: formatSlug(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                    placeholder="Ex: Coordenador de Vendas"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={newRole.slug}
                    onChange={(e) => setNewRole({ ...newRole, slug: formatSlug(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                    placeholder="coordenador_vendas"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Cargo *
                </label>
                <select
                  value={newRole.type}
                  onChange={(e) => setNewRole({ ...newRole, type: e.target.value as 'internal' | 'external' })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                >
                  <option value="internal">Interno (equipe Chama Frete)</option>
                  <option value="external">Externo (usuários da plataforma)</option>
                </select>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 dark:text-white mb-3">Permissões</h4>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category}>
                      <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase mb-2">
                        {category}
                      </h5>
                      <div className="grid grid-cols-2 gap-2">
                        {(perms as any[]).map((perm) => (
                          <label
                            key={perm.slug}
                            className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                              newRole.permission_ids.includes(perm.id)
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={newRole.permission_ids.includes(perm.id)}
                              onChange={() => handleNewPermissionToggle(perm.id)}
                              className="rounded"
                            />
                            <span className="text-sm">{perm.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewRole({ name: '', slug: '', description: '', type: 'internal', permission_ids: [] });
                  }}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Criar Cargo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
