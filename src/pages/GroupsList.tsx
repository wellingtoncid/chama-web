import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, Plus, SlidersHorizontal, X, Users, ArrowRight, Zap } from 'lucide-react';
import { api } from '../api/api';
import { getStates } from '../services/location';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import GroupsModal from '../components/modals/GroupsModal';
import GroupCard from '../components/shared/GroupCard';
import AdCarousel from '../components/shared/AdCarousel';
import AdCard from '../components/shared/AdCard';
import { BusinessModal } from '../components/modals/BusinessModal';
import { useTracker } from '../services/useTracker';

interface WhatsAppGroup {
  id: number;
  region_name: string;
  invite_link?: string;
  image_url?: string;
  description?: string;
  category_name: string;
  category_color?: string;
  category_id: number | null;
  display_location: string;
  status: string;
  is_verified: number;
  is_premium: number;
  is_public: number;
  priority_level: number;
  group_admin_name?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface GridItem {
  type: 'cta-divulgue' | 'cta-anuncie' | 'group' | 'ad';
  group?: WhatsAppGroup;
  key: string;
}

export default function GroupsList() {
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [states, setStates] = useState<{ sigla: string; nome: string }[]>([]);
  
  // Tracking
  const trackedItems = useRef(new Set());
  const { trackEvent } = useTracker();

  useEffect(() => {
    loadStates();
    loadCategories();
    fetchGroups();
  }, []);

  const loadStates = async () => {
    const statesData = await getStates();
    setStates(statesData);
  };

  const loadCategories = async () => {
    try {
      const res = await api.get('/group-categories');
      if (res.data?.success) {
        setCategories(res.data.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await api.get('list-groups');
      const groupsList = res.data.data || res.data || [];
      setGroups(Array.isArray(groupsList) ? groupsList : []);
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.filter(g => {
    if (!g || (g.display_location !== 'site' && g.display_location !== 'both')) return false;

    if (!searchTerm.trim() && !selectedState && selectedCategory === 'todos') return true;

    const term = searchTerm.toLowerCase();
    const matchesSearch = !term ||
      (g.region_name || '').toLowerCase().includes(term) ||
      (g.category_name || '').toLowerCase().includes(term);

    const matchesState = !selectedState || true;

    const matchesCategory = selectedCategory === 'todos' ||
      (g.category_id && String(g.category_id) === String(selectedCategory)) ||
      g.category_name?.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const sortedGroups = [...filteredGroups].sort((a, b) => {
    if (a.is_premium !== b.is_premium) return b.is_premium - a.is_premium;
    return b.priority_level - a.priority_level;
  });

  const hasActiveFilters = searchTerm || selectedState || selectedCategory !== 'todos';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedState('');
    setSelectedCategory('todos');
  };

  // Construir items do grid com CTAs intercalados corretamente
  const gridItems: GridItem[] = [];
  let groupCount = 0;
  let itemCount = 0;

  // CTA Divulgue sempre como primeiro
  gridItems.push({ type: 'cta-divulgue', key: 'cta-divulgue' });
  itemCount++;

  sortedGroups.forEach((group, index) => {
    // Adicionar grupo
    gridItems.push({ type: 'group', group, key: `group-${group.id}` });
    groupCount++;
    itemCount++;

    // CTA Anuncie após 3 grupos
    if (groupCount === 3) {
      gridItems.push({ type: 'cta-anuncie', key: 'cta-anuncie' });
      itemCount++;
    }

    // AdCard infeed a cada 8 items (após os primeiros 3 grupos)
    if (itemCount > 8 && (itemCount - 8) % 8 === 0) {
      gridItems.push({ type: 'ad', key: `ad-${itemCount}` });
    }
  });

  const renderGridItem = (item: GridItem) => {
  switch (item.type) {
    case 'cta-divulgue':
      return (
        <div
          key={item.key}
          onClick={() => setIsModalOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && setIsModalOpen(true)}
          role="button"
          tabIndex={0}
          className="group bg-indigo-600 rounded-[2rem] p-8 text-white flex flex-col justify-between h-[420px] relative overflow-hidden shadow-xl hover:translate-y-[-4px] transition-all cursor-pointer outline-none focus:ring-4 focus:ring-indigo-300"
        >
          {/* Background Icon */}
          <Users 
            className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform duration-700" 
            size={180} 
          />

          <div className="relative z-10">
            <div className="bg-white/20 w-fit p-3 rounded-xl mb-4 backdrop-blur-xl border border-white/10">
              <Plus size={24} />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-[0.9] mb-2">
              Divulgue sua <span className="text-indigo-200">Comunidade</span>
            </h3>
            <p className="text-indigo-100 text-[10px] font-bold italic uppercase tracking-wider">
              Alcance milhares de membros.
            </p>
          </div>

          {/* Visual Button (now a div to avoid nested buttons) */}
          <div className="w-full bg-white text-indigo-600 py-4 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 group-hover:bg-indigo-50 transition-all shadow-lg relative z-10">
            Cadastrar Grupo <ArrowRight size={16} />
          </div>
        </div>
      );

     case 'cta-anuncie':
      return (
        <div
          key={item.key}
          onClick={() => setIsBusinessModalOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && setIsBusinessModalOpen(true)}
          role="button"
          tabIndex={0}
          className="group bg-slate-900 dark:bg-slate-800 rounded-[2rem] p-8 text-white flex flex-col justify-between h-[420px] relative overflow-hidden shadow-xl hover:translate-y-[-4px] transition-all cursor-pointer border border-slate-700 outline-none focus:ring-4 focus:ring-amber-500/50"
        >
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
          
          <div className="relative z-10">
            <div className="bg-amber-500 w-fit p-3 rounded-xl mb-4 shadow-lg shadow-amber-500/20">
              <Zap size={24} className="text-slate-900" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-[0.9] mb-2 text-amber-500">
              Anuncie <br/>
              <span className="text-white">Sua Empresa</span>
            </h3>
            <p className="text-slate-400 text-[10px] font-bold italic uppercase tracking-wider">
              Destaque sua marca no portal.
            </p>
          </div>

          {/* Visual Button (div instead of button) */}
          <div className="w-full bg-amber-500 text-slate-900 py-4 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-3 group-hover:bg-white transition-all shadow-xl relative z-10">
            Quero Anunciar <ArrowRight size={16} />
          </div>
        </div>
      );

      case 'ad':
        return (
          <div key={item.key} className="h-[280px]">
            <AdCard position="infeed_compact" variant="ecommerce" search={searchTerm} />
          </div>
        );

       case 'group':
         return <GroupCard key={item.key} group={item.group!} onView={() => {
           // Track view for group card - use useTracker directly
           if (!trackedItems.current.has(item.group.id)) {
             trackedItems.current.add(item.group.id);
             trackEvent(item.group.id, 'GROUP', 'VIEW');
           }
         }} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300">
      <Header />

      <main className="flex-grow pt-32">
        <div className="max-w-7xl mx-auto px-4">

          {/* HERO */}
          <header className="mb-10">
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-[0.85] mb-4">
              Portal de <span className="text-indigo-600">Comunidades</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl text-lg font-medium mb-8">
              Conecte-se com grupos de fretes, vendas e logística na sua região.
            </p>

            {/* BARRA DE BUSCA */}
            <div className="relative group">
              <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-indigo-600" size={28} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou categoria..."
                className="w-full bg-white dark:bg-slate-900 border-4 border-transparent dark:border-slate-800 shadow-2xl rounded-[3rem] pl-20 pr-32 py-6 text-lg font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-indigo-100 dark:focus:border-indigo-900/30 placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-32 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <X size={24} />
                </button>
              )}
            </div>

            {/* FILTROS */}
            <div className="flex items-center gap-4 mt-6 mb-8">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-3 rounded-xl font-bold text-sm uppercase flex items-center gap-2 transition-all ${
                  showFilters || hasActiveFilters
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <SlidersHorizontal size={18} />
                Filtros
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                )}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <X size={14} /> Limpar filtros
                </button>
              )}
            </div>

            {/* PAINEL DE FILTROS */}
            {showFilters && (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-black uppercase text-sm text-slate-600 dark:text-slate-300">Filtros</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
                    >
                      <X size={14} /> Limpar filtros
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Estado */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Estado</label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl outline-none font-bold text-sm text-slate-800 dark:text-slate-100 appearance-none"
                    >
                      <option value="">Todos os estados</option>
                      {states.map((state) => (
                        <option key={state.sigla} value={state.sigla}>
                          {state.nome} ({state.sigla})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Categoria</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl outline-none font-bold text-sm text-slate-800 dark:text-slate-100 appearance-none"
                    >
                      <option value="todos">Todas as categorias</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm uppercase hover:bg-indigo-700 transition-all"
                >
                  Aplicar Filtros
                </button>
              </div>
            )}
          </header>

          {/* AD CAROUSEL */}
          <section className="mb-10">
            <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-white dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
              <AdCarousel searchTerm={searchTerm} />
            </div>
          </section>

          {/* GRID DE GRUPOS */}
          <section className="pb-24">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-[420px] bg-white dark:bg-slate-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : sortedGroups.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700">
                <Globe size={60} className="text-slate-300 dark:text-slate-600 mx-auto mb-6" />
                <p className="text-slate-400 dark:text-slate-500 font-bold text-lg">
                  Nenhuma comunidade encontrada.
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
                  {hasActiveFilters ? 'Tente ajustar os filtros ou buscar outro termo.' : 'No momento não há comunidades disponíveis.'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm uppercase hover:bg-indigo-700 transition-all"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {gridItems.map((item) => renderGridItem(item))}
              </div>
            )}
          </section>
        </div>
      </main>

      <GroupsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <BusinessModal
        isOpen={isBusinessModalOpen}
        onClose={() => setIsBusinessModalOpen(false)}
        initialSubject="Interesse em anunciar no Portal de Comunidades"
      />

      <Footer />
    </div>
  );
}
