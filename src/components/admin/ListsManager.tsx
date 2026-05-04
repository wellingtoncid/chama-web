import { useState, useEffect } from 'react';
import { api } from '@/api/api';
import { 
  Plus, Edit3, Trash2, Package, Truck, Wrench, Award,
  Loader2, GripVertical, X
} from 'lucide-react';
import { PageShell, StatsGrid, StatCard, DataTable, type TableColumn } from '@/components/admin';
import Swal from 'sweetalert2';

interface ListItem {
  id: number;
  name: string;
  label: string;
  type: 'vehicle' | 'body' | 'equipment' | 'certification';
}

interface ListCategory {
  key: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  type: 'vehicle' | 'body' | 'equipment' | 'certification';
}

const CATEGORIES: ListCategory[] = [
  { key: 'vehicle_types', label: 'Tipos de Veículos', icon: <Truck size={20} />, description: 'Veículos para fretes', type: 'vehicle' },
  { key: 'body_types', label: 'Tipos de Carroceria', icon: <Package size={20} />, description: 'Carrocerias disponíveis', type: 'body' },
  { key: 'equipment_types', label: 'Equipamentos', icon: <Wrench size={20} />, description: 'Equipamentos para carga', type: 'equipment' },
  { key: 'certification_types', label: 'Certificações', icon: <Award size={20} />, description: 'Certificações profissionais', type: 'certification' },
];

export default function ListsManager() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('vehicle_types');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ListItem | null>(null);
  const [formData, setFormData] = useState<{ name: string; label: string; type: ListItem['type'] }>({ name: '', label: '', type: 'vehicle' });
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin-settings');
      if (res.data?.success) {
        const allItems: ListItem[] = [];
        CATEGORIES.forEach(cat => {
          try {
            const parsed = JSON.parse(res.data.byCategory?.lists?.[cat.key] || '[]');
            if (Array.isArray(parsed)) {
              parsed.forEach((item: any) => {
                allItems.push({
                  id: item.id || Date.now(),
                  name: item.id || item.name || '',
                  label: item.label || item.name || '',
                  type: cat.type
                });
              });
            }
          } catch (e: any) { /* ignore parse errors */ }
        });
        setItems(allItems);
      }
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openModal = (item?: ListItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({ name: item.name, label: item.label, type: item.type });
    } else {
      setEditingItem(null);
      const category = CATEGORIES.find(cat => cat.key === activeCategory);
      setFormData({ name: '', label: '', type: category?.type || 'vehicle' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.label) {
      Swal.fire('Erro', 'Nome e rótulo são obrigatórios', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/admin-settings/save-list', {
        category: 'lists',
        key: `${formData.type}_types`,
        item: { id: formData.name, label: formData.label }
      });
      
      if (res.data?.success) {
        Swal.fire('Sucesso!', 'Item salvo com sucesso', 'success');
        closeModal();
        fetchItems();
      }
    } catch (error: any) {
      Swal.fire('Erro', error.response?.data?.message || 'Erro ao salvar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: ListItem) => {
    const result = await Swal.fire({
      title: 'Confirmar exclusão',
      text: `Deseja excluir "${item.label}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Excluir',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post('/admin-settings/delete-list-item', {
          category: 'lists',
          key: `${item.type}_types`,
          item_name: item.name
        });
        
        if (res.data?.success) {
          Swal.fire('Sucesso!', 'Item excluído', 'success');
          fetchItems();
        }
      } catch (error: any) {
        Swal.fire('Erro', error.response?.data?.message || 'Erro ao excluir', 'error');
      }
    }
  };

  const columns: TableColumn<ListItem>[] = [
    { 
      key: 'name', 
      label: 'Nome (ID)',
      render: (value) => <span className="font-mono text-xs">{String(value)}</span>
    },
    { 
      key: 'label', 
      label: 'Rótulo',
      render: (value) => <span className="font-medium">{String(value)}</span>
    },
    { 
      key: 'type', 
      label: 'Tipo',
      render: (value) => {
        const cat = CATEGORIES.find(c => c.type === value);
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs">
            {cat?.icon}
            {cat?.label}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => openModal(row)}
            className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <Edit3 size={14} />
          </button>
          <button 
            onClick={() => handleDelete(row)}
            className="p-1.5 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
          >
            <Trash2 size={14} className="text-red-500" />
          </button>
        </div>
      )
    }
  ];

  const filteredItems = items.filter(item => {
    const cat = CATEGORIES.find(c => c.key.includes(item.type));
    return cat?.key === activeCategory;
  });

  const stats = {
    total: items.length,
    vehicles: items.filter(i => i.type === 'vehicle').length,
    bodies: items.filter(i => i.type === 'body').length,
    equipment: items.filter(i => i.type === 'equipment').length,
    certifications: items.filter(i => i.type === 'certification').length,
  };

  return (
    <PageShell
      title="Gerenciamento de Listas"
      description="Gerencie tipos de veículos, carrocerias, equipamentos e certificações"
      actions={
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} /> Novo Item
        </button>
      }
    >
      {/* StatsGrid */}
      <StatsGrid>
        <StatCard label="Total" value={stats.total} icon={<Package size={16} />} />
        <StatCard label="Veículos" value={stats.vehicles} variant="blue" icon={<Truck size={16} />} />
        <StatCard label="Carrocerias" value={stats.bodies} variant="purple" icon={<Package size={16} />} />
        <StatCard label="Equipamentos" value={stats.equipment} variant="yellow" icon={<Wrench size={16} />} />
      </StatsGrid>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 bg-white rounded-2xl p-2 border border-slate-200">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeCategory === cat.key 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : (
        <DataTable 
          columns={columns}
          data={filteredItems}
          emptyMessage="Nenhum item encontrado nesta categoria"
        />
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="font-black italic uppercase text-slate-800 text-xl leading-none">
                  {editingItem ? 'Editar Item' : 'Novo Item'}
                </h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">
                  {CATEGORIES.find(c => c.key.includes(formData.type))?.description}
                </p>
              </div>
              <button onClick={closeModal} className="bg-slate-100 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Tipo</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.type} value={cat.type}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Nome (ID)</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: plataforma_elevatoria"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none focus:ring-2 ring-blue-500/20" 
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Rótulo</label>
                <input 
                  type="text" 
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Ex: Plataforma Elevatória"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none focus:ring-2 ring-blue-500/20" 
                />
              </div>
            </div>

            <button 
              disabled={saving}
              onClick={handleSave}
              className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs mt-8 hover:bg-blue-500 transition-all shadow-xl flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : (editingItem ? "SALVAR ALTERAÇÕES" : "ADICIONAR ITEM")}
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
