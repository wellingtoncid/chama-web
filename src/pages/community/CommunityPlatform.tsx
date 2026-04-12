import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Users, Filter, Loader2, X, Plus,
  MessageCircle
} from 'lucide-react';
import GroupCard from '../../components/shared/GroupCard';
import Swal from 'sweetalert2';

interface WhatsAppGroup {
  id: number;
  region_name: string;
  invite_link?: string;
  image_url?: string;
  description?: string;
  category: string;
  category_id: number | null;
  category_name: string;
  category_color?: string;
  target_role: string;
  display_location: string;
  status: string;
  is_verified: number;
  is_premium: number;
  is_public: number;
  priority_level: number;
  views_count: number;
  clicks_count: number;
  group_admin_name?: string;
}

interface CommunityPlatformProps {
  user?: any;
}

export default function CommunityPlatform({ user }: CommunityPlatformProps) {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<WhatsAppGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<{id: number; name: string; color: string}[]>([]);
  
  const role = String(user?.role || '').toLowerCase();
  const isAdmin = role === 'admin';

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    filterGroups();
  }, [searchTerm, categoryFilter, groups]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const res = await api.get('platform-groups');
      const groupsList = res.data.data || res.data || [];
      const validGroups = Array.isArray(groupsList) ? groupsList : [];
      setGroups(validGroups);
      
      const uniqueCategories = [...new Map(
        validGroups
          .filter(g => g.category_id && g.category_name)
          .map(g => [g.category_id, { id: g.category_id, name: g.category_name, color: g.category_color }])
      ).values()].sort((a, b) => a.name.localeCompare(b.name));
      
      setCategories(uniqueCategories);
    } catch (err) {
      console.error("Erro ao carregar comunidades:", err);
      setGroups([]);
      Swal.fire({
        icon: 'error',
        title: 'Erro ao carregar',
        text: 'Não foi possível carregar as comunidades.',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterGroups = () => {
    let result = [...groups];

    if (categoryFilter !== 'all') {
      const catId = parseInt(categoryFilter);
      result = result.filter(g => g.category_id === catId);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(g => 
        (g.region_name || '').toLowerCase().includes(term) ||
        (g.category_name || '').toLowerCase().includes(term) ||
        (g.category || '').toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      if (a.is_premium !== b.is_premium) return b.is_premium - a.is_premium;
      return b.priority_level - a.priority_level;
    });

    setFilteredGroups(result);
  };

  const hasActiveFilters = categoryFilter !== 'all' || searchTerm.trim();

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Carregando comunidades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] p-6 md:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <MessageCircle size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white uppercase italic tracking-tight">
              Comunidades
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {filteredGroups.length} grupo{filteredGroups.length !== 1 ? 's' : ''} disponível{filteredGroups.length !== 1 ? 'is' : ''}
            </p>
          </div>
        </div>
        
        {isAdmin && (
          <button className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all">
            <Plus size={18} />
            Novo Grupo
          </button>
        )}
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="space-y-4">
        {/* Busca */}
        <form onSubmit={(e) => e.preventDefault()} className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={22} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por região, categoria ou admin..."
            className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 rounded-2xl py-4 pl-14 pr-6 font-bold text-sm text-slate-700 dark:text-slate-200 outline-none transition-all"
          />
          {searchTerm && (
            <button 
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </form>

        {/* Filtros */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all
              ${showFilters || hasActiveFilters
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }
            `}
          >
            <Filter size={18} />
            Filtros
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            )}
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <X size={14} />
              Limpar filtros
            </button>
          )}
        </div>

        {/* Categorias */}
        {showFilters && (
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold uppercase text-xs text-slate-500 dark:text-slate-400 tracking-wider">
                Filtrar por Categoria
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-red-500 hover:text-red-600"
                >
                  Limpar
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`
                  px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all
                  ${categoryFilter === 'all' 
                    ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-800 shadow-lg' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }
                `}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(String(cat.id))}
                  className={`
                    px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all
                    ${categoryFilter === String(cat.id) 
                      ? 'text-white shadow-lg' 
                      : 'text-slate-600 dark:text-slate-300 hover:opacity-80'
                    }
                  `}
                  style={categoryFilter === String(cat.id) ? { backgroundColor: cat.color } : { backgroundColor: `${cat.color}20`, color: cat.color }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resultados */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users size={32} className="text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-black text-slate-600 dark:text-slate-300 uppercase italic mb-2">
            Nenhuma comunidade encontrada
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            {hasActiveFilters 
              ? 'Tente buscar por outros termos ou remova os filtros.'
              : 'No momento não há comunidades disponíveis.'
            }
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider transition-all"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
            />
          ))}
        </div>
      )}
    </div>
  );
}
