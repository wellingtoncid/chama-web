import { useState, useEffect } from "react";
import { 
  Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Save, X, 
  Loader2, Palette, MessageCircle, Search, CheckSquare, Square,
  ShieldAlert, Tag, MousePointer, Eye as EyeIcon
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { api } from "@/api/api";
import GroupForm from "../../components/groups/GroupForm";
import Swal from "sweetalert2";

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
  
  const user = JSON.parse(localStorage.getItem('@ChamaFrete:user') || 'null');
  const hasAccess = user?.role === 'admin';

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
          <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
            Gestão de Comunidade
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Gerencie grupos e categorias da comunidade
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'groups'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Grupos
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex-1 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'categories'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Tag className="w-4 h-4 inline mr-2" />
            Categorias
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'groups' ? (
            <GroupsTab />
          ) : (
            <CategoriesTab />
          )}
        </div>
      </div>
    </div>
  );
};

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
      Swal.fire({ icon: 'success', title: 'Categoria salva com sucesso!', timer: 2000, showConfirmButton: false });
    } catch (error) {
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
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Erro ao excluir categoria' });
      }
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await api.post(`/admin/group-categories/${id}/toggle`);
      fetchCategories();
      Swal.fire({ icon: 'success', title: 'Status alterado!', timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Erro ao alterar status' });
    }
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

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
    } catch (error) {
      fetchCategories();
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button 
          onClick={() => openModal()}
          className="bg-[#1f4ead] hover:bg-blue-700 rounded-xl font-bold py-3 px-4"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Categoria
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-slate-400 font-medium">
          Nenhuma categoria cadastrada.
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div 
              key={category.id}
              draggable
              onDragStart={(e) => handleDragStart(e, category.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, category.id)}
              className={`flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all ${
                draggedId === category.id ? 'opacity-50' : ''
              }`}
            >
              <GripVertical className="w-5 h-5 text-slate-300 cursor-grab" />
              
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color || '#64748b' }}
              />
              
              <div className="flex-1">
                <p className="font-bold text-slate-800">{category.name}</p>
                {category.description && (
                  <p className="text-xs text-slate-400">{category.description}</p>
                )}
              </div>

              <code className="text-xs font-mono bg-white px-2 py-1 rounded border border-slate-200">
                {category.slug}
              </code>

              <button
                onClick={() => handleToggle(category.id)}
                className={`p-2 rounded-lg transition-colors ${
                  category.is_active 
                    ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' 
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
                title={category.is_active ? 'Ativo' : 'Inativo'}
              >
                {category.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => openModal(category)}
                className="p-2 text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors"
              >
                <Edit className="w-4 h-4"/>
              </button>

              <button
                onClick={() => handleDelete(category.id)}
                className="p-2 text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 rounded-lg border border-slate-200 transition-colors"
              >
                <Trash2 className="w-4 h-4"/>
              </button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-lg font-black text-slate-800 uppercase italic">
                  {editingCategory ? "Editar Categoria" : "Nova Categoria"}
                </h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-xl">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Nome *</label>
                <input
                  className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  value={formData.name}
                  onChange={e => setFormData({ 
                    ...formData, 
                    name: e.target.value,
                    slug: editingCategory ? formData.slug : generateSlug(e.target.value)
                  })}
                  placeholder="Ex: Grãos, Bau/Sider"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Slug</label>
                <input
                  className="w-full mt-1 px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl outline-none font-mono text-sm text-slate-500"
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Descrição</label>
                <input
                  className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5">
                  <Palette className="w-3 h-3" /> Cor
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-8 h-8 rounded-lg transition-all ${
                        formData.color === color.value ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <input
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm"
                    value={formData.color}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex gap-3 bg-slate-50/50">
              <Button onClick={() => setIsModalOpen(false)} variant="ghost" className="flex-1 py-4 rounded-xl font-bold text-xs">
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="flex-[2] py-4 bg-[#1f4ead] hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

  const handleSave = async (formData: any) => {
    try {
      const payload = {
        action: editingGroup ? 'update' : 'create',
        id: editingGroup?.id,
        ...formData
      };
      
      await api.post('/admin-groups', payload);
      setIsSlideOverOpen(false);
      setEditingGroup(null);
      fetchData();
      Swal.fire({ icon: 'success', title: 'Grupo salvo com sucesso!', timer: 2000, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Erro ao salvar o grupo.' });
    }
  };

  const handleDelete = async (ids: number[]) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: ids.length === 1 ? 'Excluir grupo?' : `Excluir ${ids.length} grupos?`,
      text: 'Esta ação não pode ser desfeita.',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444'
    });
      
    if (result.isConfirmed) {
      try {
        for (const id of ids) {
          await api.post('/admin-groups', { action: 'delete', id });
        }
        setSelectedGroups([]);
        fetchData();
        Swal.fire({ icon: 'success', title: 'Grupo(s) excluído(s)!', timer: 2000, showConfirmButton: false });
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Erro ao excluir.' });
      }
    }
  };

  const openEdit = (group: WhatsAppGroup) => {
    setEditingGroup(group);
    setIsSlideOverOpen(true);
  };

  const openCreate = () => {
    setEditingGroup(null);
    setIsSlideOverOpen(true);
  };

  const toggleSelectAll = () => {
    if (selectedGroups.length === filteredGroups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(filteredGroups.map(g => g.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedGroups(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = !searchQuery || 
      group.region_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || 
      String(group.category_id) === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (categoryId: number | null) => {
    if (!categoryId) return '#64748b';
    const cat = categories.find(c => c.id === categoryId);
    return cat?.color || '#64748b';
  };

  const totals = {
    views: groups.reduce((sum, g) => sum + (g.views_count || 0), 0),
    clicks: groups.reduce((sum, g) => sum + (g.clicks_count || 0), 0)
  };

  return (
    <div>
      {/* Header com métricas */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
        <div className="flex items-center gap-2">
          <EyeIcon className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-bold text-slate-600">Total Views:</span>
          <span className="text-sm font-black text-blue-600">{totals.views.toLocaleString('pt-BR')}</span>
        </div>
        <div className="flex items-center gap-2">
          <MousePointer className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-bold text-slate-600">Total Cliques:</span>
          <span className="text-sm font-black text-green-600">{totals.clicks.toLocaleString('pt-BR')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-600">Grupos:</span>
          <span className="text-sm font-black text-slate-800">{groups.length}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <Button 
          onClick={openCreate}
          className="bg-[#1f4ead] hover:bg-blue-700 rounded-xl font-bold py-3 px-4"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Grupo
        </Button>

        {selectedGroups.length > 0 && (
          <Button 
            onClick={() => handleDelete(selectedGroups)}
            variant="ghost"
            className="text-red-600 hover:bg-red-50 rounded-xl font-bold py-3 px-4"
          >
            <Trash2 className="w-4 h-4 mr-2" /> 
            Excluir ({selectedGroups.length})
          </Button>
        )}

        <div className="flex-1" />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar grupo..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium w-64"
          />
        </div>

        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-medium"
        >
          <option value="">Todas as categorias</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-12 text-slate-400 font-medium">
          Nenhum grupo encontrado.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredGroups.map((group) => (
            <div 
              key={group.id}
              className={`flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all ${
                selectedGroups.includes(group.id) ? 'border-blue-400 bg-blue-50/50' : ''
              }`}
            >
              <button
                onClick={() => toggleSelect(group.id)}
                className="text-slate-400 hover:text-blue-600"
              >
                {selectedGroups.includes(group.id) ? (
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>

              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center shrink-0">
                {group.image_url ? (
                  <img src={group.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <MessageCircle className="w-5 h-5 text-slate-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 flex-wrap">
                  <p className="font-bold text-slate-800 truncate">{group.region_name}</p>
                  {group.is_premium === 1 && (
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold uppercase rounded">
                      Premium
                    </span>
                  )}
                  {group.is_verified === 1 && (
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase rounded">
                      ✓
                    </span>
                  )}
                  {group.status === 'inactive' && (
                    <span className="px-1.5 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-bold uppercase rounded">
                      Inativo
                    </span>
                  )}
                  {group.status === 'active' && (
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase rounded">
                      Ativo
                    </span>
                  )}
                </div>
                {group.group_admin_name && (
                  <p className="text-xs text-slate-400">por {group.group_admin_name}</p>
                )}
              </div>

              <div 
                className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase shrink-0"
                style={{ 
                  backgroundColor: `${getCategoryColor(group.category_id)}15`,
                  color: getCategoryColor(group.category_id)
                }}
              >
                {group.category_name || group.category || 'Sem categoria'}
              </div>

              <div className="flex items-center gap-1">
                {group.is_visible_home === 1 && (
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold uppercase rounded">Home</span>
                )}
                {group.is_public === 0 && (
                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-bold uppercase rounded">Login</span>
                )}
                {group.is_public === 1 && (
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase rounded">Livre</span>
                )}
              </div>

              <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400 min-w-[100px]">
                <div className="flex items-center gap-1" title="Visualizações">
                  <EyeIcon className="w-3 h-3" />
                  <span>{group.views_count || 0}</span>
                </div>
                <div className="flex items-center gap-1" title="Cliques">
                  <MousePointer className="w-3 h-3" />
                  <span>{group.clicks_count || 0}</span>
                </div>
              </div>

              <button
                onClick={() => openEdit(group)}
                className="p-2 text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-lg border border-slate-200 transition-colors"
              >
                <Edit className="w-4 h-4"/>
              </button>

              <button
                onClick={() => handleDelete([group.id])}
                className="p-2 text-slate-400 hover:text-red-600 bg-white hover:bg-red-50 rounded-lg border border-slate-200 transition-colors"
              >
                <Trash2 className="w-4 h-4"/>
              </button>
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
