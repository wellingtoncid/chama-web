import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  ShoppingBag, Search, Loader2, MapPin, Trash2, Edit, 
  Eye, X, Send, Image, DollarSign, Package
} from 'lucide-react';
import Swal from 'sweetalert2';

interface Listing {
  id: number;
  user_id: number;
  title: string;
  description: string;
  price: string;
  category: string;
  location_city?: string;
  location_state?: string;
  status: string;
  is_featured: number;
  views_count: number;
  clicks_count: number;
  created_at: string;
  seller_name?: string;
  seller_email?: string;
  images?: string[];
}

const categories = [
  { value: 'todos', label: 'Todas' },
  { value: 'pecas', label: 'Peças' },
  { value: 'caminhoes', label: 'Caminhões' },
  { value: 'utilitarios', label: 'Utilitários' },
  { value: 'acessorios', label: 'Acessórios' },
  { value: 'implementos', label: 'Implementos' },
  { value: 'outros', label: 'Outros' },
];

const statusOptions = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'pending', label: 'Pendente' },
  { value: 'deleted', label: 'Excluído' },
];

export default function MarketplaceManagerAdmin() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [filter, setFilter] = useState({ status: 'all', category: 'all', search: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [createData, setCreateData] = useState({ 
    user_id: '', title: '', description: '', price: '', category: 'pecas', 
    location_city: '', location_state: '', images: [] 
  });
  const [companies, setCompanies] = useState<{id: number, name: string}[]>([]);

  useEffect(() => { loadListings(); }, [filter]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/marketplace', { params: filter });
      if (res.data?.success) {
        setListings(res.data.data || []);
      }
    } catch (e) {
      console.error("Erro ao carregar:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const res = await api.get('/api/companies');
      if (res.data?.companies) {
        setCompanies(res.data.companies);
      }
    } catch (e) {
      console.error("Erro ao carregar empresas:", e);
    }
  };

  const handleEdit = (listing: Listing) => {
    setEditData({
      title: listing.title,
      description: listing.description,
      price: listing.price,
      category: listing.category,
      location_city: listing.location_city || '',
      location_state: listing.location_state || '',
      status: listing.status,
      is_featured: listing.is_featured
    });
    setSelectedListing(listing);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedListing) return;
    try {
      setSaving(true);
      const res = await api.put(`/admin/marketplace/${selectedListing.id}`, editData);
      if (res.data?.success) {
        Swal.fire({ icon: 'success', title: 'Atualizado!', timer: 1500 });
        setShowEditModal(false);
        loadListings();
      }
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Erro' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Excluir anúncio?',
      text: 'Esta ação moverá o anúncio para a lixeira',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const res = await api.delete(`/admin/marketplace/${id}`);
        if (res.data?.success) {
          Swal.fire({ icon: 'success', title: 'Excluído!', timer: 1500 });
          loadListings();
          if (selectedListing?.id === id) setSelectedListing(null);
        }
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Erro' });
      }
    }
  };

  const openCreateModal = () => {
    loadCompanies();
    setCreateData({ 
      user_id: '', title: '', description: '', price: '', category: 'pecas', 
      location_city: '', location_state: '', images: [] 
    });
    setShowCreateModal(true);
  };

  const handleCreate = async () => {
    if (!createData.user_id || !createData.title || !createData.price) {
      return Swal.fire({ icon: 'warning', title: 'Preencha os campos obrigatórios' });
    }
    try {
      setSaving(true);
      const res = await api.post('/admin/marketplace', createData);
      if (res.data?.success) {
        Swal.fire({ icon: 'success', title: 'Anúncio criado!', timer: 1500 });
        setShowCreateModal(false);
        loadListings();
      }
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Erro' });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const formatCurrency = (value: string) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-slate-100 text-slate-600';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'deleted': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusLabel = (status: string) => {
    return statusOptions.find(s => s.value === status)?.label || status;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-[3rem] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-2xl">
            <ShoppingBag size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase italic">Gestão de Marketplaces</h2>
            <p className="text-purple-100 text-sm font-medium">Gerencie todos os anúncios do marketplace</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button 
          onClick={openCreateModal}
          className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-sm flex items-center gap-2 hover:bg-purple-700 transition-all"
        >
          <Package size={18} /> Novo Anúncio
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-100">
          {statusOptions.filter(s => s.value !== 'deleted').map(f => (
            <button
              key={f.value}
              onClick={() => setFilter({...filter, status: f.value})}
              className={`px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all ${
                filter.status === f.value ? 'bg-purple-600 text-white' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={filter.category}
          onChange={(e) => setFilter({...filter, category: e.target.value})}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm"
        >
          {categories.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por título, empresa..."
            value={filter.search}
            onChange={(e) => setFilter({...filter, search: e.target.value})}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="animate-spin text-purple-500" size={32} />
          </div>
        ) : listings.length === 0 ? (
          <div className="col-span-full bg-white rounded-[2rem] p-12 text-center border border-slate-100">
            <ShoppingBag size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium">Nenhum anúncio encontrado</p>
          </div>
        ) : (
          listings.map(listing => (
            <div 
              key={listing.id}
              onClick={() => setSelectedListing(listing)}
              className={`bg-white rounded-[2rem] border overflow-hidden hover:shadow-lg transition-all cursor-pointer ${
                selectedListing?.id === listing.id ? 'border-purple-500 ring-2 ring-purple-200' : 'border-slate-100'
              }`}
            >
              <div className="h-40 bg-slate-100 flex items-center justify-center overflow-hidden">
                {listing.images && listing.images.length > 0 ? (
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <Image size={40} className="text-slate-300" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${getStatusColor(listing.status)}`}>
                    {getStatusLabel(listing.status)}
                  </span>
                  {listing.is_featured === 1 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-700">
                      Destaque
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{listing.title}</h3>
                <p className="font-black text-purple-600">{formatCurrency(listing.price)}</p>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                  <MapPin size={12} />
                  {listing.location_city || 'Não informado'}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 truncate max-w-[100px]">
                    {listing.seller_name}
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEdit(listing); }}
                      className="p-1.5 bg-slate-100 rounded-lg hover:bg-slate-200"
                    >
                      <Edit size={12} className="text-slate-600" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(listing.id); }}
                      className="p-1.5 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 size={12} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic text-slate-900">Criar Anúncio</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Criar em nome de *</label>
                <select 
                  value={createData.user_id}
                  onChange={(e) => setCreateData({...createData, user_id: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                >
                  <option value="">Selecione uma empresa</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Título *</label>
                <input 
                  type="text"
                  value={createData.title}
                  onChange={(e) => setCreateData({...createData, title: e.target.value})}
                  placeholder="Título do anúncio"
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Preço (R$) *</label>
                  <input 
                    type="number"
                    value={createData.price}
                    onChange={(e) => setCreateData({...createData, price: e.target.value})}
                    placeholder="0,00"
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Categoria</label>
                  <select 
                    value={createData.category}
                    onChange={(e) => setCreateData({...createData, category: e.target.value})}
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                  >
                    {categories.filter(c => c.value !== 'todos').map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Cidade</label>
                  <input 
                    type="text"
                    value={createData.location_city}
                    onChange={(e) => setCreateData({...createData, location_city: e.target.value})}
                    placeholder="Cidade"
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Estado</label>
                  <input 
                    type="text"
                    value={createData.location_state}
                    onChange={(e) => setCreateData({...createData, location_state: e.target.value})}
                    placeholder="UF"
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Descrição</label>
                <textarea 
                  value={createData.description}
                  onChange={(e) => setCreateData({...createData, description: e.target.value})}
                  placeholder="Descrição do produto..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm resize-none"
                />
              </div>

              <button
                onClick={handleCreate}
                disabled={saving}
                className="w-full py-4 bg-purple-600 text-white rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 hover:bg-purple-700 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Package size={18} />}
                Criar Anúncio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedListing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic text-slate-900">Editar Anúncio</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-xl">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Título</label>
                <input 
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData({...editData, title: e.target.value})}
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Preço (R$)</label>
                  <input 
                    type="number"
                    value={editData.price}
                    onChange={(e) => setEditData({...editData, price: e.target.value})}
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Status</label>
                  <select 
                    value={editData.status}
                    onChange={(e) => setEditData({...editData, status: e.target.value})}
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                  >
                    {statusOptions.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Categoria</label>
                  <select 
                    value={editData.category}
                    onChange={(e) => setEditData({...editData, category: e.target.value})}
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                  >
                    {categories.filter(c => c.value !== 'todos').map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input 
                    type="checkbox"
                    checked={editData.is_featured === 1}
                    onChange={(e) => setEditData({...editData, is_featured: e.target.checked ? 1 : 0})}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-bold text-slate-600">Destaque</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Cidade</label>
                  <input 
                    type="text"
                    value={editData.location_city}
                    onChange={(e) => setEditData({...editData, location_city: e.target.value})}
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Estado</label>
                  <input 
                    type="text"
                    value={editData.location_state}
                    onChange={(e) => setEditData({...editData, location_state: e.target.value})}
                    className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Descrição</label>
                <textarea 
                  value={editData.description}
                  onChange={(e) => setEditData({...editData, description: e.target.value})}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-slate-200 font-bold text-sm resize-none"
                />
              </div>

              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="w-full py-4 bg-purple-600 text-white rounded-xl font-black uppercase text-sm flex items-center justify-center gap-2 hover:bg-purple-700 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Edit size={18} />}
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
