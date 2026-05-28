import { useState, useEffect } from 'react';
import { api } from '@/api/api';
import { 
  Plus, Edit3, Trash2, Package, Truck, Wrench, Award,
  Loader2, X
} from 'lucide-react';
import { PageShell, StatsGrid, StatCard, DataTable, type TableColumn } from '@/components/admin';
import Swal from 'sweetalert2';

interface LookupItem {
  id: number;
  list_type: string;
  value: string;
  label: string;
  description: string | null;
  sort_order: number;
  is_active: number;
}

interface ListCategory {
  key: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const CATEGORIES: ListCategory[] = [
  { key: 'vehicle_types', label: 'Tipos de Veículos', icon: <Truck size={20} />, description: 'Veículos para fretes' },
  { key: 'body_types', label: 'Tipos de Carroceria', icon: <Package size={20} />, description: 'Carrocerias disponíveis' },
  { key: 'equipment_types', label: 'Equipamentos', icon: <Wrench size={20} />, description: 'Equipamentos para carga' },
  { key: 'certification_types', label: 'Certificações', icon: <Award size={20} />, description: 'Certificações profissionais' },
];

const TYPE_MAP: Record<string, string> = {
  vehicle_types: 'vehicle_types',
  body_types: 'body_types',
  equipment_types: 'equipment_types',
  certification_types: 'certification_types',
};

export default function ListsManager() {
  const [items, setItems] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('vehicle_types');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LookupItem | null>(null);
  const [formData, setFormData] = useState<{ value: string; label: string; description: string }>({ value: '', label: '', description: '' });
  const [saving, setSaving] = useState(false);

  const currentType = TYPE_MAP[activeCategory] || 'vehicle_types';

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/lists/${currentType}`);
      if (res.data?.success) {
        setItems(res.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeCategory]);

  const openModal = (item?: LookupItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({ value: item.value, label: item.label, description: item.description || '' });
    } else {
      setEditingItem(null);
      setFormData({ value: '', label: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSave = async () => {
    if (!formData.value || !formData.label) {
      Swal.fire('Erro', 'Valor e rótulo são obrigatórios', 'error');
      return;
    }

    setSaving(true);
    try {
      let res;
      if (editingItem) {
        res = await api.put(`/admin/lists/${currentType}/${editingItem.id}`, formData);
      } else {
        res = await api.post(`/admin/lists/${currentType}`, formData);
      }

      if (res.data?.success) {
        Swal.fire('Sucesso!', editingItem ? 'Item atualizado' : 'Item criado', 'success');
        closeModal();
        fetchItems();
      }
    } catch (error: any) {
      Swal.fire('Erro', error.response?.data?.message || 'Erro ao salvar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: LookupItem) => {
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
        const res = await api.delete(`/admin/lists/${currentType}/${item.id}`);
        if (res.data?.success) {
          Swal.fire('Sucesso!', 'Item excluído', 'success');
          fetchItems();
        }
      } catch (error: any) {
        Swal.fire('Erro', error.response?.data?.message || 'Erro ao excluir', 'error');
      }
    }
  };

  const columns: TableColumn<LookupItem>[] = [
    {
      key: 'value',
      label: 'Valor (ID)',
      render: (value) => <span className="font-mono text-xs">{String(value)}</span>
    },
    {
      key: 'label',
      label: 'Rótulo',
      render: (value) => <span className="font-medium">{String(value)}</span>
    },
    {
      key: 'description',
      label: 'Descrição',
      render: (value) => value ? <span className="text-xs text-slate-500">{String(value)}</span> : <span className="text-xs text-slate-300">—</span>
    },
    {
      key: 'sort_order',
      label: 'Ordem',
      render: (value) => <span className="font-mono text-xs text-slate-400">{Number(value)}</span>
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

  const stats = {
    total: items.length,
  };

  return (
    <PageShell
      title="Gerenciamento de Listas"
      description="Gerencie tipos de veículos, carrocerias, equipamentos e certificações"
      actions={
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
        >
          <Plus size={20} /> Novo Item
        </button>
      }
    >
      <StatsGrid>
        <StatCard label="Total" value={stats.total} icon={<Package size={16} />} />
      </StatsGrid>

      <div className="flex flex-wrap gap-2 bg-white rounded-2xl p-2 border border-slate-200">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeCategory === cat.key
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-orange-500" size={40} />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          emptyMessage="Nenhum item encontrado nesta categoria"
        />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="font-black italic uppercase text-slate-800 text-xl leading-none">
                  {editingItem ? 'Editar Item' : 'Novo Item'}
                </h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 tracking-widest">
                  {CATEGORIES.find(c => c.key === activeCategory)?.description}
                </p>
              </div>
              <button onClick={closeModal} className="bg-slate-100 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Valor (ID)</label>
                <input
                  type="text"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Ex: plataforma_elevatoria"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none focus:ring-2 ring-orange-500/20"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Rótulo</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Ex: Plataforma Elevatória"
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none focus:ring-2 ring-orange-500/20"
                />
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Descrição (opcional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ex: Equipamento para elevação de cargas pesadas"
                  rows={3}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-xs outline-none focus:ring-2 ring-orange-500/20 resize-none"
                />
              </div>
            </div>

            <button
              disabled={saving}
              onClick={handleSave}
              className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs mt-8 hover:bg-orange-500 transition-all shadow-xl flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : (editingItem ? "SALVAR ALTERAÇÕES" : "ADICIONAR ITEM")}
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}