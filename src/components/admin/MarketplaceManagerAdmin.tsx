import { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Search, Loader2, MapPin, Trash2, Edit, 
  Eye, Package, Star, ExternalLink, MousePointer, Eye as ViewIcon
} from 'lucide-react';
import { AdImage } from '../AdImage';
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
        }
      } catch (e) {
        Swal.fire({ icon: 'error', title: 'Erro' });
      }
    }
  };

  const formatCurrency = (value: string) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
    return value.toString();
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive': return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'deleted': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'Ativo',
      inactive: 'Inativo',
      pending: 'Pendente',
      deleted: 'Excluído'
    };
    return labels[status] || status;
  };

  const handleViewListing = (listing: Listing, e: React.MouseEvent) => {
    e.stopPropagation();
    if (listing.slug) {
      window.open(`/anuncio/${listing.slug}`, '_blank');
    } else {
      window.open(`/anuncio/${listing.id}`, '_blank');
    }
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

      {/* Stats Cards */}
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
              <Star size={20} className="text-amber-600 fill-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Afiliados</p>
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

      {/* Actions */}
      <div className="flex justify-end">
        <button 
          onClick={() => navigate('/novo-anuncio')}
          className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-sm flex items-center gap-2 hover:bg-purple-700 transition-all"
        >
          <Package size={18} /> Novo Anúncio
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          {statusOptions.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter({...filter, status: f.value})}
              className={`px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all ${
                filter.status === f.value ? 'bg-purple-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={filter.category}
          onChange={(e) => setFilter({...filter, category: e.target.value})}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm"
        >
          {categories.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <select
          value={filter.is_affiliate}
          onChange={(e) => setFilter({...filter, is_affiliate: e.target.value})}
          className="px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl font-bold text-sm text-amber-700 dark:text-amber-400"
        >
          {affiliateOptions.map(c => (
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
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-purple-500"
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
          <div className="col-span-full bg-white dark:bg-slate-800 rounded-[2rem] p-12 text-center border border-slate-200 dark:border-slate-700">
            <ShoppingBag size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum anúncio encontrado</p>
          </div>
        ) : (
          listings.map(listing => (
            <div 
              key={listing.id}
              className={`bg-white dark:bg-slate-800 rounded-[2rem] border overflow-hidden hover:shadow-lg transition-all ${
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
                  <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase italic shadow-lg flex items-center gap-1">
                    <Star size={10} className="fill-white" />
                    ML
                  </div>
                )}
                
                {/* Featured Badge */}
                {listing.is_featured === 1 && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase">
                    Destaque
                  </div>
                )}
                
                {/* Stats */}
                <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                  <div className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                    <ViewIcon size={10} />
                    {formatNumber(listing.views_count || 0)}
                  </div>
                  <div className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                    <MousePointer size={10} />
                    {formatNumber(listing.clicks_count || 0)}
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${getStatusColor(listing.status)}`}>
                    {getStatusLabel(listing.status)}
                  </span>
                  {listing.is_affiliate === 1 && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
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
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[80px]">
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
    </div>
  );
}
