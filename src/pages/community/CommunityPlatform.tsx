import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Star, Users, MessageCircle, Zap, Plus, 
  ShieldCheck, ArrowUpRight, LayoutGrid, Filter
} from 'lucide-react';

interface WhatsAppGroup {
  id: number;
  region_name: string;
  invite_link: string;
  category: string;
  target_role: string;
  display_location: string;
  status: string;
  is_verified: number;
  is_premium: number;
  priority_level: number;
  views_count: number;
  clicks_count: number;
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
  const [categories, setCategories] = useState<string[]>([]);
  
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
      
      // Extrair categorias únicas
      const uniqueCategories = [...new Set(validGroups.map(g => g.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error("Erro ao carregar comunidades:", err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const filterGroups = () => {
    let result = [...groups];

    // Filtrar por categoria
    if (categoryFilter !== 'all') {
      result = result.filter(g => g.category === categoryFilter);
    }

    // Filtrar por termo de busca
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(g => 
        (g.region_name || '').toLowerCase().includes(term) ||
        (g.category || '').toLowerCase().includes(term) ||
        (g.region_name || '').toLowerCase().includes(term.replace('-', ' '))
      );
    }

    // Ordenar por prioridade
    result.sort((a, b) => {
      if (a.is_premium !== b.is_premium) return b.is_premium - a.is_premium;
      return b.priority_level - a.priority_level;
    });

    setFilteredGroups(result);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'logistica': 'Logística',
      'logísticas': 'Logística',
      'motoristas': 'Motoristas',
      'motorista': 'Motoristas',
      'empresas': 'Empresas',
      'empresa': 'Empresas',
      'comerciais': 'Comerciais',
      'comercial': 'Comerciais',
      'regionais': 'Regionais',
      'regional': 'Regionais',
    };
    return labels[category.toLowerCase()] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-4" />
          <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Carregando Comunidades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] p-6 md:p-10">
      {/* Header da Página */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex items-center gap-3 text-blue-600 mb-3">
          <LayoutGrid size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Plataforma</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
          COMUNIDADES
        </h1>
        <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium text-sm max-w-xl">
          Conecte-se com grupos de fretes, logística e parcerias estratégicos disponíveis para sua conta.
        </p>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="BUSCAR POR CIDADE, REGIÃO OU CATEGORIA..."
              className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 focus:border-blue-600 rounded-2xl py-4 pl-14 pr-6 font-bold text-xs transition-all outline-none uppercase tracking-tight dark:text-white"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-black text-xs uppercase transition-all ${
              showFilters ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-800'
            }`}
          >
            <Filter size={18} />
            Filtrar
          </button>
        </div>

        {/* Painel de Filtros - Categorias de Grupos */}
        {showFilters && (
          <div className="mt-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">Filtrar por categoria</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                  categoryFilter === 'all' 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                    categoryFilter === cat 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {getCategoryLabel(cat)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resultados */}
      <div className="max-w-7xl mx-auto">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={32} className="text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-black text-slate-400 uppercase italic">Nenhuma comunidade encontrada</h3>
            <p className="text-slate-500 text-sm mt-2">Tente buscar por outros termos ou remova os filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <GroupCard 
                key={group.id} 
                group={group} 
                onJoin={() => {
                  api.post('log-group-click', { id: group.id });
                  window.open(group.invite_link, '_blank');
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GroupCard({ group, onJoin }: { group: WhatsAppGroup; onJoin: () => void }) {
  const isPremium = group.is_premium === 1;
  const isVerified = group.is_verified === 1;
  const isActive = group.status === 'active';

  return (
    <div className={`group relative rounded-[2.5rem] p-6 border-2 transition-all flex flex-col justify-between ${
      isPremium 
        ? 'bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-blue-900/10 border-blue-200 dark:border-blue-800 shadow-xl shadow-blue-50/10' 
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
    } ${!isActive ? 'opacity-50 grayscale' : 'hover:shadow-2xl hover:border-blue-500 hover:-translate-y-1'}`}>
      
      {isPremium && (
        <div className="absolute -top-3 -right-3 bg-blue-600 text-white p-2 rounded-xl shadow-lg ring-4 ring-white dark:ring-slate-900">
          <Zap size={14} fill="currentColor" />
        </div>
      )}

      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Users size={24} />
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${
              isActive 
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
            }`}>
              {isActive ? 'Ativo' : 'Inativo'}
            </span>
            {isVerified && (
              <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-lg">
                <ShieldCheck size={10} className="fill-current" />
                <span className="text-[8px] font-black uppercase">Verificado</span>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-2">
          {group.region_name}
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-[9px] bg-slate-800 text-white px-2 py-1 rounded font-black uppercase tracking-widest">
            {group.category || 'Geral'}
          </span>
          {group.target_role && group.target_role !== 'ALL' && (
            <span className={`text-[9px] px-2 py-1 rounded font-black uppercase tracking-widest ${
              group.target_role === 'DRIVER' 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              {group.target_role === 'DRIVER' ? 'Motoristas' : 'Empresas'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
          <span>{group.views_count || 0} visualizações</span>
          <span>{group.clicks_count || 0} cliques</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        {isActive ? (
          <button 
            onClick={onJoin}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-lg"
          >
            Entrar no Grupo <MessageCircle size={16} />
          </button>
        ) : (
          <button disabled className="w-full bg-slate-200 dark:bg-slate-800 text-slate-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest cursor-not-allowed">
            Indisponível
          </button>
        )}
      </div>
    </div>
  );
}
