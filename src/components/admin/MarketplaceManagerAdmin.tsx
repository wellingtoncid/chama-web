import { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Search, Loader2, MapPin, Trash2, Edit, 
  Eye, Package, Star, ExternalLink, MousePointer, Eye as ViewIcon,
  LayoutGrid, List
} from 'lucide-react';
import { AdImage } from '../AdImage';
import Swal from 'sweetalert2';
import { AdminLayout, StatsGrid, StatCard, FilterBar } from '@/components/admin';

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
  is_affiliate: number;
  external_url?: string;
  main_image?: string;
  views_count: number;
  clicks_count: number;
  created_at: string;
  seller_name?: string;
  seller_email?: string;
  images?: string[];
  slug?: string;
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
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'pending', label: 'Pendente' },
];

const affiliateOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'yes', label: 'Apenas Afiliados' },
  { value: 'no', label: 'Apenas Normais' },
];

export default function MarketplaceManagerAdmin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [filter, setFilter] = useState({ 
    status: 'all', 
    category: 'all', 
    search: '',
    is_affiliate: 'all'
  });

  useEffect(() => { loadListings(); }, [filter]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (filter.status !== 'all') params.status = filter.status;
      if (filter.category !== 'all') params.category = filter.category;
      if (filter.search) params.search = filter.search;
      if (filter.is_affiliate !== 'all') params.is_affiliate = filter.is_affiliate;
      
      const res = await api.get('/admin/marketplace', { params });
      if (res.data?.success) {
        setListings(res.data.data || []);
      }
    } catch (e) {
      console.error("Erro ao carregar:", e);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = listings.length;
    const affiliates = listings.filter(l => l.is_affiliate === 1).length;
    const totalViews = listings.reduce((sum, l) => sum + (l.views_count || 0), 0);
    const totalClicks = listings.reduce((sum, l) => sum + (l.clicks_count || 0), 0);
    return { total, affiliates, totalViews, totalClicks };
  }, [listings]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await Swal.fire({
      title: 'Excluir anúncio?',
      text: "Esta ação não pode ser desfeita.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar'
    });
    
    if (result.isConfirmed) {
      try {
        await api.post('/admin/marketplace', { id, action: 'delete' });
        loadListings();
        Swal.fire('Excluído!', 'Anúncio removido.', 'success');
      } catch {
        Swal.fire('Erro', 'Não foi possível excluir.', 'error');
      }
    }
  };

  const handleViewListing = (listing: Listing, e: React.MouseEvent) => {
    e.stopPropagation();
    if (listing.external_url) {
      window.open(listing.external_url, '_blank');
    } else {
      window.open(`/anuncio/${listing.id}`, '_blank');
    }
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
    return value.toString();
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value || '0');
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'inactive': return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
      case 'pending': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  return (
    <div className="p-5 lg:p-8 max-w-[1440px] mx-auto space-y-5 lg:space-y-6 animate-in fade-in duration-500 pb-20">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white">
            Gestão de Marketplace
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gerencie todos os anúncios do marketplace
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-purple-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              title="Tabela"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-purple-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
              title="Cards"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <button 
            onClick={() => navigate('/novo-anuncio')}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 active:scale-95"
          >
            <Package size={18} />
            Novo Anúncio
          </button>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-xl">
              <ShoppingBag size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Total</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl">
              <Star size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-bold uppercase">Afiliados</p>
              <p className="text-2xl font-black text-amber-600">{stats.affiliates}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
              <ViewIcon size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Views</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{formatNumber(stats.totalViews)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl">
              <MousePointer size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Cliques</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{formatNumber(stats.totalClicks)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {statusOptions.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter({...filter, status: f.value})}
              className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
                filter.status === f.value ? 'bg-purple-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={filter.category}
          onChange={(e) => setFilter({...filter, category: e.target.value})}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs uppercase text-slate-700 dark:text-slate-300"
        >
          {categories.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <select
          value={filter.is_affiliate}
          onChange={(e) => setFilter({...filter, is_affiliate: e.target.value})}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs uppercase text-slate-700 dark:text-slate-300"
        >
          {affiliateOptions.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar..."
            value={filter.search}
            onChange={(e) => setFilter({...filter, search: e.target.value})}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* CONTENT: Table or Cards */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Imagem</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Título</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Preço</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Views</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Cliques</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Vendedor</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <Loader2 className="animate-spin text-purple-500 mx-auto" size={32} />
                    </td>
                  </tr>
                ) : listings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                      Nenhum anúncio encontrado
                    </td>
                  </tr>
                ) : (
                  listings.map(listing => (
                    <tr key={listing.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-slate-400">#{listing.id}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100">
                          {listing.main_image ? (
                            <AdImage url={listing.main_image} className="w-full h-full object-cover" alt={listing.title} />
                          ) : (
                            <ShoppingBag size={16} className="text-slate-300" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{listing.title}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-sm font-black text-purple-600 dark:text-purple-400">{formatCurrency(listing.price)}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-black uppercase ${getStatusColor(listing.status)}`}>
                          {getStatusLabel(listing.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{formatNumber(listing.views_count || 0)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{formatNumber(listing.clicks_count || 0)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[100px] block">
                          {listing.seller_name || 'Não identificado'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={(e) => handleViewListing(listing, e)} className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100" title="Ver">
                            <Eye size={14} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/editar-anuncio/${listing.id}`); }} className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200" title="Editar">
                            <Edit size={14} className="text-slate-600 dark:text-slate-400" />
                          </button>
                          <button onClick={(e) => handleDelete(listing.id, e)} className="p-1.5 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100" title="Excluir">
                            <Trash2 size={14} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="animate-spin text-purple-500" size={32} />
          </div>
        ) : listings.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
            <ShoppingBag size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum anúncio encontrado</p>
          </div>
        ) : (
          listings.map(listing => (
            <div 
              key={listing.id}
              className={`bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden hover:shadow-lg transition-all ${
                listing.is_affiliate ? 'ring-2 ring-amber-200 dark:ring-amber-800 border-slate-200 dark:border-slate-700' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {/* Image */}
              <div className="h-40 bg-slate-100 dark:bg-slate-700 relative overflow-hidden">
                {(listing.main_image || (listing.images && listing.images.length > 0)) ? (
                  <AdImage 
                    url={listing.main_image || listing.images?.[0]} 
                    className="w-full h-full object-cover"
                    alt={listing.title}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag size={40} className="text-slate-300 dark:text-slate-600" />
                  </div>
                )}
                
                {/* Affiliate Badge */}
                {listing.is_affiliate === 1 && (
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase shadow-lg flex items-center gap-1">
                    <Star size={10} className="fill-white" />
                    ML
                  </div>
                )}
                
                {/* Featured Badge */}
                {listing.is_featured === 1 && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-black px-2 py-1 rounded-full uppercase">
                    Destaque
                  </div>
                )}
                
                {/* Stats */}
                <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                  <div className="bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                    <ViewIcon size={10} />
                    {formatNumber(listing.views_count || 0)}
                  </div>
                  <div className="bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                    <MousePointer size={10} />
                    {formatNumber(listing.clicks_count || 0)}
                  </div>
                </div>
              </div>
               
              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-black uppercase ${getStatusColor(listing.status)}`}>
                    {getStatusLabel(listing.status)}
                  </span>
                  {listing.is_affiliate === 1 && (
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                      <ExternalLink size={10} /> Afiliado
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1 line-clamp-1">{listing.title}</h3>
                <p className="font-black text-purple-600 dark:text-purple-400">{formatCurrency(listing.price)}</p>
                <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mt-2">
                  <MapPin size={12} />
                  {listing.location_city || 'Não informado'}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[80px]">
                    {listing.seller_name || 'Não identificado'}
                  </span>
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => handleViewListing(listing, e)}
                      className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50"
                      title="Ver anúncio"
                    >
                      <Eye size={12} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/editar-anuncio/${listing.id}`); }}
                      className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
                      title="Editar"
                    >
                      <Edit size={12} className="text-slate-600 dark:text-slate-400" />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(listing.id, e)}
                      className="p-1.5 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50"
                      title="Excluir"
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
      )}
    </div>
  );
}