import { useState, useEffect } from "react";
import { 
  Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Save, X, 
  Loader2, Palette, MessageCircle, Search, CheckSquare, Square,
  ShieldAlert, Tag, MousePointer, Eye as EyeIcon, Users, Globe, Star
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { api } from "@/api/api";
import GroupForm from "../../components/groups/GroupForm";
import Swal from "sweetalert2";

// --- Interfaces ---
interface GroupCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  sort_order: number;
  is_active: number;
}

interface WhatsAppGroup {
  id: number;
  region_name: string;
  invite_link: string;
  is_public: number;
  is_visible_home: number;
  target_role: string;
  category: string;
  category_id: number | null;
  category_name: string;
  category_color: string;
  status: string;
  is_premium: number;
  is_verified: number;
  display_location: string;
  group_admin_name: string;
  internal_notes: string;
  views_count: number;
  clicks_count: number;
  image_url?: string; // Adicionado para evitar erro no render
}

const PRESET_COLORS = [
  { name: 'Azul', value: '#1f4ead' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Amarelo', value: '#f59e0b' },
  { name: 'Roxo', value: '#8b5cf6' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Laranja', value: '#f97316' },
  { name: 'Ciano', value: '#06b6d4' },
  { name: 'Cinza', value: '#64748b' },
  { name: 'Slate', value: '#334155' },
];

const GroupsManagement = () => {
  const [activeTab, setActiveTab] = useState<'groups' | 'categories'>('groups');
  const [groupsData, setGroupsData] = useState<WhatsAppGroup[]>([]);
  
  const user = JSON.parse(localStorage.getItem('@ChamaFrete:user') || 'null');
  const hasAccess = user?.role === 'admin';

  const totalStats = {
    total: groupsData.length,
    ativos: groupsData.filter(g => g.status === 'active').length,
    premium: groupsData.filter(g => g.is_premium === 1).length,
    views: groupsData.reduce((acc, g) => acc + (g.views_count || 0), 0)
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/admin-groups');
        const data = res.data?.data || res.data || [];
        setGroupsData(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar grupos:", err);
      }
    };
    fetchData();
  }, []);

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
    <div className="p-5 lg:p-8 max-w-[1440px] mx-auto space-y-5 lg:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">
            Gestão de Comunidades
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gerencie grupos WhatsApp e categorias da plataforma
          </p>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl">
              <Users size={20} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Total</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{totalStats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
              <Globe size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-blue-700 dark:text-blue-400 font-bold uppercase">Ativos</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{totalStats.ativos}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl">
              <Star size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-bold uppercase">Premium</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{totalStats.premium}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-xl">
              <EyeIcon size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-purple-700 dark:text-purple-400 font-bold uppercase">Views</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{totalStats.views}</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABS CONTAINER */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex border-b border-slate-100 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'groups'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Grupos
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'categories'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Tag className="w-4 h-4 inline mr-2" />
            Categorias
          </button>
        </div>

        <div className="p-5 lg:p-6">
          {activeTab === 'groups' ? <GroupsTab /> : <CategoriesTab />}
        </div>
      </div>
    </div>
  );
};

// --- Sub-componente Categorias ---
function CategoriesTab() {
  const [categories, setCategories] = useState<GroupCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<GroupCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#1f4ead',
  });
  const [saving, setSaving] = useState(false);
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/group-categories');
      setCategories(response.data?.data || []);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const openModal = (category?: GroupCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        color: category.color || '#1f4ead',
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', slug: '', description: '', color: '#1f4ead' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nome é obrigatório', confirmButtonText: 'OK' });
      return;
    }

    try {
      setSaving(true);
      const slug = formData.slug || generateSlug(formData.name);
      
      if (editingCategory) {
        await api.put(`/admin/group-categories/${editingCategory.id}`, { ...formData, slug });
      } else {
        await api.post('/admin/group-categories', { ...formData, slug });
      }
      
      setIsModalOpen(false);
      fetchCategories();
      Swal.fire({ icon: 'success', title: 'Categoria salva!', timer: 2000, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro ao salvar categoria' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Excluir categoria?',
      text: 'Esta ação não pode ser desfeita.',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444'
    });
    
    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/group-categories/${id}`);
        fetchCategories();
        Swal.fire({ icon: 'success', title: 'Categoria excluída!', timer: 2000, showConfirmButton: false });
      } catch {
        Swal.fire({ icon: 'error', title: 'Erro ao excluir categoria' });
      }
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await api.post(`/admin/group-categories/${id}/toggle`);
      fetchCategories();
      Swal.fire({ icon: 'success', title: 'Status alterado!', timer: 1500, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro ao alterar status' });
    }
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = async (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const newOrder = [...categories];
    const draggedIdx = newOrder.findIndex(c => c.id === draggedId);
    const targetIdx = newOrder.findIndex(c => c.id === targetId);
    
    const [removed] = newOrder.splice(draggedIdx, 1);
    newOrder.splice(targetIdx, 0, removed);
    
    setCategories(newOrder);
    setDraggedId(null);

    try {
      await api.post('/admin/group-categories/reorder', { ids: newOrder.map(c => c.id) });
    } catch {
      fetchCategories();
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => openModal()} className="bg-[#1f4ead] hover:bg-blue-700 rounded-xl font-bold">
          <Plus className="w-4 h-4 mr-2" /> Nova Categoria
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-slate-400 font-medium">Nenhuma categoria cadastrada.</div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div 
              key={category.id}
              draggable
              onDragStart={(e) => handleDragStart(e, category.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, category.id)}
              className={`flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all ${draggedId === category.id ? 'opacity-50' : ''}`}
            >
              <GripVertical className="w-5 h-5 text-slate-300 cursor-grab" />
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color || '#64748b' }} />
              <div className="flex-1">
                <p className="font-bold text-slate-800">{category.name}</p>
                {category.description && <p className="text-xs text-slate-400">{category.description}</p>}
              </div>
              <code className="text-xs font-mono bg-white px-2 py-1 rounded border border-slate-200">{category.slug}</code>
              <button onClick={() => handleToggle(category.id)} className={`p-2 rounded-lg ${category.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                {category.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => openModal(category)} className="p-2 text-slate-400 hover:text-blue-600 bg-white rounded-lg border border-slate-200"><Edit className="w-4 h-4"/></button>
              <button onClick={() => handleDelete(category.id)} className="p-2 text-slate-400 hover:text-red-600 bg-white rounded-lg border border-slate-200"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-black text-slate-800 uppercase italic">{editingCategory ? "Editar Categoria" : "Nova Categoria"}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Nome *</label>
                <input className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value, slug: editingCategory ? formData.slug : generateSlug(e.target.value) })} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Slug</label>
                <input className="w-full mt-1 px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl outline-none font-mono text-sm" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Descrição</label>
                <input className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Cor</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PRESET_COLORS.map(c => <button key={c.value} onClick={() => setFormData({ ...formData, color: c.value })} className={`w-8 h-8 rounded-lg ${formData.color === c.value ? 'ring-2 ring-slate-400 scale-110' : ''}`} style={{ backgroundColor: c.value }} />)}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-3 bg-slate-50/50">
              <Button onClick={() => setIsModalOpen(false)} variant="ghost" className="flex-1">Cancelar</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-[2] bg-[#1f4ead] text-white">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Salvar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Sub-componente Grupos ---
function GroupsTab() {
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [categories, setCategories] = useState<GroupCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<WhatsAppGroup | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin-groups');
      const data = response.data?.data || response.data || [];
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/group-categories');
      setCategories(response.data?.data || []);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const filteredGroups = groups.filter(group => {
    const matchesSearch = !searchQuery || group.region_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || String(group.category_id) === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSave = async (formData: any) => {
    try {
      const payload = { action: editingGroup ? 'update' : 'create', id: editingGroup?.id, ...formData };
      await api.post('/admin-groups', payload);
      setIsSlideOverOpen(false);
      setEditingGroup(null);
      fetchData();
      Swal.fire({ icon: 'success', title: 'Sucesso!', timer: 2000, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: 'error', title: 'Erro ao salvar o grupo.' });
    }
  };

  const handleDelete = async (ids: number[]) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: ids.length === 1 ? 'Excluir?' : `Excluir ${ids.length}?`,
      showCancelButton: true,
      confirmButtonColor: '#ef4444'
    });
    if (result.isConfirmed) {
      try {
        for (const id of ids) { await api.post('/admin-groups', { action: 'delete', id }); }
        setSelectedGroups([]);
        fetchData();
        Swal.fire({ icon: 'success', title: 'Excluído!' });
      } catch {
        Swal.fire({ icon: 'error', title: 'Erro ao excluir.' });
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedGroups.length === filteredGroups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(filteredGroups.map(g => g.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedGroups(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const getCategoryColor = (categoryId: number | null) => {
    if (!categoryId) return '#64748b';
    return categories.find(c => c.id === categoryId)?.color || '#64748b';
  };

  const totals = {
    views: groups.reduce((sum, g) => sum + (g.views_count || 0), 0),
    clicks: groups.reduce((sum, g) => sum + (g.clicks_count || 0), 0)
  };

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
        <div className="flex items-center gap-2">
          <EyeIcon className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-bold">Views: {totals.views.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <MousePointer className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-bold">Cliques: {totals.clicks.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <Button onClick={() => { setEditingGroup(null); setIsSlideOverOpen(true); }} className="bg-[#1f4ead] rounded-xl font-bold">
          <Plus className="w-4 h-4 mr-2" /> Novo Grupo
        </Button>
        {selectedGroups.length > 0 && (
          <Button onClick={() => handleDelete(selectedGroups)} variant="ghost" className="text-red-600">
            <Trash2 className="w-4 h-4 mr-2" /> Excluir ({selectedGroups.length})
          </Button>
        )}
        <div className="flex-1" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="pl-10 pr-4 py-3 bg-slate-50 border rounded-xl text-sm w-64" placeholder="Buscar..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-4 py-3 bg-slate-50 border rounded-xl text-sm">
          <option value="">Todas as categorias</option>
          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
        </select>
        <Button onClick={toggleSelectAll} variant="outline" className="rounded-xl">
           {selectedGroups.length === filteredGroups.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : (
        <div className="space-y-2">
          {filteredGroups.map((group) => (
            <div key={group.id} className={`flex items-center gap-4 p-4 bg-slate-50 rounded-xl border ${selectedGroups.includes(group.id) ? 'border-blue-400 bg-blue-50/50' : 'border-slate-100'}`}>
              <button onClick={() => toggleSelect(group.id)}>
                {selectedGroups.includes(group.id) ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-400" />}
              </button>
              <div className="flex-1">
                <p className="font-bold text-slate-800">{group.region_name}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: `${getCategoryColor(group.category_id)}15`, color: getCategoryColor(group.category_id) }}>
                    {group.category_name || 'Sem categoria'}
                  </span>
                  {group.status === 'active' && <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1 rounded font-bold">Ativo</span>}
                </div>
              </div>
              <div className="flex gap-4 text-slate-400 text-xs font-bold">
                <span className="flex items-center gap-1"><EyeIcon className="w-3 h-3"/> {group.views_count || 0}</span>
                <span className="flex items-center gap-1"><MousePointer className="w-3 h-3"/> {group.clicks_count || 0}</span>
              </div>
              <button onClick={() => { setEditingGroup(group); setIsSlideOverOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 bg-white rounded-lg border"><Edit className="w-4 h-4"/></button>
              <button onClick={() => handleDelete([group.id])} className="p-2 text-slate-400 hover:text-red-600 bg-white rounded-lg border"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
        </div>
      )}

      {isSlideOverOpen && (
        <GroupForm
          group={editingGroup}
          categories={categories}
          loadingCategories={loadingCategories}
          onClose={() => { setIsSlideOverOpen(false); setEditingGroup(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default GroupsManagement;