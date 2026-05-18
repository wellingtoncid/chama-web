import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Users, Filter, X, Plus,
  MessageCircle, AlertCircle, CheckCircle
} from 'lucide-react';
import GroupCard from '../../components/shared/GroupCard';
import { Button } from '../../components/ui/Button';
import DashboardShell from '../../components/layout/DashboardShell';

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
  
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning'>('success');

  const showAlert = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setAlertMsg(msg);
    setAlertType(type);
    setTimeout(() => setAlertMsg(null), 4000);
  };

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
      showAlert('Não foi possível carregar as comunidades.', 'error');
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
  const AlertToast = () => {
    if (!alertMsg) return null;
    const colors = {
      success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
      error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
      warning: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    };
    return (
      <div className={`fixed top-6 right-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-2xl border shadow-lg animate-in slide-in-from-right-4 duration-300 ${colors[alertType]}`}>
        {alertType === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
        <span className="font-bold text-sm">{alertMsg}</span>
      </div>
    );
  };

  return (
      <DashboardShell title="Comunidades" description="Carregando...">
        <div className="space-y-4 animate-pulse">
          <div className="h-14 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700" />
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-11 w-28 bg-slate-200 dark:bg-slate-700 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                <div className="h-5 w-36 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Comunidades"
      description={`${filteredGroups.length} grupo${filteredGroups.length !== 1 ? 's' : ''} disponível${filteredGroups.length !== 1 ? 'is' : ''}`}
      actions={isAdmin ? (
        <Button className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20">
          <Plus size={18} />
          Novo Grupo
        </Button>
      ) : undefined}
    >
      <AlertToast />
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
            <Button 
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setSearchTerm('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
            >
              <X size={18} />
            </Button>
          )}
        </form>

        {/* Filtros */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm ${
              showFilters || hasActiveFilters
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Filter size={18} />
            Filtros
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            )}
          </Button>
          
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="ghost"
              className="text-sm font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
            >
              <X size={14} />
              Limpar filtros
            </Button>
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
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  className="text-xs font-bold text-red-500 hover:text-red-600"
                >
                  Limpar
                </Button>
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
