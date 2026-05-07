import { useState, useEffect } from 'react';
import { api } from '@/api/api';
import Swal from 'sweetalert2';
import { PageShell } from '@/components/admin';
import { 
  Plus, Edit3, Trash2, ToggleLeft, ToggleRight, 
  GripVertical, Loader2, X, Check
} from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  sort_order: number;
  is_active: number;
}

export default function ListingCategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    description: '',
    is_active: 1,
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/listing-categories?include_inactive=true');
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        icon: category.icon || '',
        description: category.description || '',
        is_active: category.is_active,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        icon: '',
        description: '',
        is_active: 1,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        await api.put(`/listing-category/${editingCategory.id}`, formData);
        Swal.fire({
          title: 'Sucesso!',
          text: 'Categoria atualizada com sucesso.',
          icon: 'success',
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
        });
      } else {
        await api.post('/listing-category', formData);
        Swal.fire({
          title: 'Sucesso!',
          text: 'Categoria criada com sucesso.',
          icon: 'success',
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
        });
      }
      closeModal();
      fetchCategories();
    } catch (error: any) {
      Swal.fire({
        title: 'Erro',
        text: error.response?.data?.message || 'Erro ao salvar categoria.',
        icon: 'error',
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
        color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
      });
    }
  };

  const handleToggle = async (category: Category) => {
    try {
      await api.post(`/listing-category/${category.id}/toggle`);
      fetchCategories();
    } catch {
      Swal.fire({
        title: 'Erro',
        text: 'Erro ao alterar status.',
        icon: 'error',
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
        color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
      });
    }
  };

  const handleDelete = async (category: Category) => {
    const result = await Swal.fire({
      title: 'Excluir Categoria?',
      text: `Deseja excluir "${category.name}"? Esta ação não pode ser desfeita.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#DC2626',
      background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
      color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/listing-category/${category.id}`);
        Swal.fire({
          title: 'Excluído!',
          text: 'Categoria excluída com sucesso.',
          icon: 'success',
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
        });
        fetchCategories();
      } catch {
        Swal.fire({
          title: 'Erro',
          text: 'Erro ao excluir categoria.',
          icon: 'error',
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
        });
      }
    }
  };

  if (loading) {
    return (
      <PageShell title="Categorias do Marketplace">
        <div className="flex items-center justify-center p-20">
          <Loader2 className="animate-spin text-emerald-600" size={40} />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Categorias do Marketplace"
      description="Gerencie as categorias dos anúncios"
      actions={
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus size={20} />
          Nova Categoria
        </button>
      }
    >

      {/* Lista de Categorias */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mt-6">
        <table className="w-full">
          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
            <tr>
              <th className="px-5 py-4 text-left">Ordem</th>
              <th className="px-5 py-4 text-left">Nome</th>
              <th className="px-5 py-4 text-left">Slug</th>
              <th className="px-5 py-4 text-left">Ícone</th>
              <th className="px-5 py-4 text-left">Status</th>
              <th className="px-5 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((cat) => (
              <tr key={cat.id} className={`${!cat.is_active ? 'opacity-50' : ''}`}>
                <td className="px-5 py-4">
                  <GripVertical size={16} className="text-slate-300" />
                </td>
                <td className="px-5 py-4">
                  <span className="font-bold text-slate-800">{cat.name}</span>
                </td>
                <td className="px-5 py-4">
                  <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                    {cat.slug}
                  </code>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs text-slate-500">{cat.icon || '-'}</span>
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => handleToggle(cat)}
                    className={`flex items-center gap-2 text-sm font-bold ${
                      cat.is_active ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {cat.is_active ? (
                      <>
                        <ToggleRight size={24} className="text-emerald-600" />
                        Ativa
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={24} />
                        Inativa
                      </>
                    )}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openModal(cat)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ex: Veículos"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="veiculos"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">
                  Ícone (lucide-react)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="truck"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder="Descrição opcional..."
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, is_active: prev.is_active ? 0 : 1 }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    formData.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    formData.is_active ? 'left-6' : 'left-0.5'
                  }`} />
                </button>
                <span className="text-sm font-bold text-slate-600">
                  {formData.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold uppercase hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  {editingCategory ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
   );
}
