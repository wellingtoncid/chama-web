import { useState, useEffect, useMemo } from 'react';
import { api } from '@/api/api';
import {
  Shield, Plus, Pencil, Trash2, X, Check, Loader2, ChevronLeft, ChevronRight,
  Truck, ShoppingBag, FileText, Megaphone,
  MessageCircle, CreditCard, Tag, HelpCircle
} from 'lucide-react';
import { MODULE_LIST } from '@/constants/modules';
import { PERMISSION_LIST } from '@/constants/permissions';
import { PageShell, StatsGrid, StatCard } from '@/components/admin';

const MODULE_ICONS: Record<string, React.ReactNode> = {
  fretes: <Truck size={14} />,
  marketplace: <ShoppingBag size={14} />,
  cotacoes: <FileText size={14} />,
  publicidade: <Megaphone size={14} />,
  chat: <MessageCircle size={14} />,
  financeiro: <CreditCard size={14} />,
  planos: <Tag size={14} />,
  suporte: <HelpCircle size={14} />,
  grupos: null,
};

const SYSTEM_ROLES = ['admin', 'driver', 'company'];

const groupedPermissions = PERMISSION_LIST.reduce((acc: Record<string, any[]>, perm) => {
  const category = perm.category;
  if (!acc[category]) acc[category] = [];
  acc[category].push(perm);
  return acc;
}, {} as Record<string, any[]>);

const formatSlug = (str: string) => {
  return str.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
};

const getRoleModules = (roleSlug: string, rolePerms: any[], modules: any[]) => {
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
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'internal' | 'external'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'internal' as 'internal' | 'external',
    permission_ids: [] as number[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, pageSize]);

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

  const openCreateModal = () => {
    setEditingRole(null);
    setFormData({ name: '', slug: '', type: 'internal', permission_ids: [] });
    setShowModal(true);
  };

  const openEditModal = (role: any) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      slug: role.slug,
      type: role.type || 'internal',
      permission_ids: rolePermissions[role.id]?.map((p: any) => p.id) || [],
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      return alert('Nome e slug são obrigatórios');
    }

    try {
      setSaving(true);
      const payload = {
        ...(editingRole ? { id: editingRole.id } : {}),
        name: formData.name,
        slug: formData.slug.toLowerCase().replace(/\s+/g, '_'),
        type: formData.type,
        permission_ids: formData.permission_ids,
      };

      const res = editingRole
        ? await api.put('/admin-roles', payload)
        : await api.post('/admin-roles', payload);

      if (res.data?.success) {
        setShowModal(false);
        setEditingRole(null);
        setFormData({ name: '', slug: '', type: 'internal', permission_ids: [] });
        fetchData();
        alert(editingRole ? 'Cargo atualizado com sucesso!' : 'Cargo criado com sucesso!');
      } else {
        alert(res.data?.message || 'Erro ao salvar cargo');
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erro ao salvar cargo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, slug: string) => {
    if (SYSTEM_ROLES.includes(slug)) {
      return alert('Este cargo não pode ser excluído.');
    }
    
    const roleUsers = roles.find(r => r.id === id)?.user_count || 0;
    if (roleUsers > 0) {
      return alert(`Este cargo possui ${roleUsers} usuário(s). Exclua ou mova os usuários primeiro.`);
    }

    if (!confirm('Tem certeza que deseja excluir este cargo?')) return;

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
    setFormData(prev => ({
      ...prev,
      permission_ids: prev.permission_ids.includes(permId)
        ? prev.permission_ids.filter(id => id !== permId)
        : [...prev.permission_ids, permId]
    }));
  };

  const stats = {
    total: roles.length,
    internal: roles.filter(r => r.type === 'internal' || !r.type).length,
    external: roles.filter(r => r.type === 'external').length,
    protected: roles.filter(r => SYSTEM_ROLES.includes(r.slug) || r.is_protected).length,
  };

  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      if (filterType === 'all') return true;
      return role.type === filterType || (filterType === 'internal' && !role.type);
    });
  }, [roles, filterType]);

  const totalPages = Math.ceil(filteredRoles.length / pageSize);
  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  if (error) {
    return (
      <PageShell title="Cargos e Permissões" description="Gerencie cargos e suas permissões no sistema">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mt-6">
          <p className="text-red-600 dark:text-red-400 font-bold text-sm">{error}</p>
          <button onClick={fetchData} className="mt-2 text-sm text-red-600 dark:text-red-400 font-bold hover:underline">
            Tentar novamente
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Cargos e Permissões"
      description="Gerencie cargos e suas permissões no sistema"
      actions={
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Novo Cargo
        </button>
      }
    >
      <div className="mt-6">
        <StatsGrid>
          <StatCard label="Total" value={stats.total} icon={Shield} />
          <StatCard label="Internos" value={stats.internal} variant="purple" icon={Shield} />
          <StatCard label="Externos" value={stats.external} variant="blue" icon={Shield} />
          <StatCard label="Protegidos" value={stats.protected} variant="green" icon={Check} />
        </StatsGrid>
      </div>

      <div className="flex flex-wrap gap-3 mt-4 items-center">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as 'all' | 'internal' | 'external')}
          className="bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os Tipos</option>
          <option value="internal">Internos</option>
          <option value="external">Externos</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mt-4">
        <div className="p-4 lg:p-5 border-b border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-3">
          <h3 className="font-bold text-slate-900 dark:text-white">
            Cargos ({filteredRoles.length})
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Mostrar</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium"
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
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200 dark:border-slate-700">
                <th className="px-5 py-4">Cargo</th>
                <th className="px-5 py-4">Módulos</th>
                <th className="px-5 py-4 text-center">Permissões</th>
                <th className="px-5 py-4 text-center">Usuários</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-slate-300" size={32} /></td></tr>
              ) : paginatedRoles.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center"><Shield size={40} className="mx-auto text-slate-200 dark:text-slate-600 mb-4" /><p className="text-slate-400 font-bold text-sm uppercase">Nenhum cargo encontrado</p></td></tr>
              ) : paginatedRoles.map((role) => {
                const rolePerms = rolePermissions[role.id] || [];
                const roleModules = getRoleModules(role.slug, rolePerms, modules);
                const typeColor = role.type === 'external' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
                const typeLabel = role.type === 'external' ? 'Externo' : 'Interno';

                return (
                  <tr key={role.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${SYSTEM_ROLES.includes(role.slug) ? 'bg-slate-900 border-slate-900 text-white' : 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-500 dark:text-blue-400'}`}>
                          <Shield size={20} />
                        </div>
                        <div className="space-y-1">
                          <p className="font-black text-slate-800 dark:text-white text-sm uppercase italic">{role.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-slate-400">{role.slug}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${typeColor}`}>
                              {typeLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {roleModules.slice(0, 4).map((mod: any) => (
                          <span key={mod.key} className="text-[9px] px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-300 flex items-center gap-1">
                            {MODULE_ICONS[mod.key]} {mod.label}
                          </span>
                        ))}
                        {roleModules.length > 4 && (
                          <span className="text-[9px] px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-400 font-bold">+{roleModules.length - 4}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        {rolePerms.length}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {role.user_count || 0}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(role)}
                          className="py-2 px-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold uppercase hover:bg-blue-100 dark:hover:bg-blue-900/50"
                        >
                          <Pencil size={14} />
                        </button>
                        {!SYSTEM_ROLES.includes(role.slug) && (
                          <button
                            onClick={() => handleDelete(role.id, role.slug)}
                            className="py-2 px-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold uppercase hover:bg-red-100 dark:hover:bg-red-900/50"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredRoles.length)} de {filteredRoles.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-300 my-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {editingRole ? 'Editar' : 'Novo'} Cargo
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-2 block">Nome *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value, slug: formatSlug(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Coordenador de Vendas"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 mb-2 block">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData({...formData, slug: formatSlug(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="coordenador_vendas"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400 mb-2 block">Tipo *</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as 'internal' | 'external'})}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="internal">Interno (equipe Chama Frete)</option>
                  <option value="external">Externo (usuários da plataforma)</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-[10px] font-bold uppercase text-slate-400 mb-3 block">Permissões</label>
              <div className="max-h-80 overflow-y-auto space-y-3">
                {(Object.entries(groupedPermissions) as [string, any[]][]).map(([category, perms]) => (
                  <div key={category} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                    <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-3">{category}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {perms.map((perm: any) => (
                        <label key={perm.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700">
                          <input
                            type="checkbox"
                            checked={formData.permission_ids.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                            className="w-4 h-4 accent-blue-500"
                          />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || !formData.name || !formData.slug}
              className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
              {editingRole ? 'Atualizar' : 'Criar'} Cargo
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
