import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Loader2, ArrowRight, Users, Zap, Globe, ChevronRight, ArrowUpDown } from 'lucide-react';
import { api } from '../../api/api';
import { getStates, getCitiesByState } from '../../services/location';
import AdCard from '../../components/shared/AdCard';
import ListingCard from '../../components/shared/ListingCard';
import { useTracker } from '../../services/useTracker';
import { BusinessModal } from '../../components/modals/BusinessModal';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

interface Listing {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  item_condition: string | null;
  main_image: string | null;
  location_city: string | null;
  location_state: string | null;
  is_featured: number;
  created_at: string;
  seller_name: string;
  images: string[];
  accepting_offers?: number;
  accepting_trade?: number;
  contact_preference?: string;
}

export default function MarketplaceExplorer() {
  const navigate = useNavigate();
  const { trackEvent } = useTracker();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [sortBy, setSortBy] = useState('recent');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  
  // Filtros
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('todos');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [radius, setRadius] = useState(50);
  
  // Listas para selects
  const [states, setStates] = useState<{ sigla: string; nome: string }[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  // Tracking refs
  const trackedItems = useRef(new Set<number>());

  useEffect(() => {
    loadStates();
    loadCategories();
  }, []);

  // Carregar subcategorias quando a categoria mudar
  useEffect(() => {
    if (!selectedCategory || selectedCategory === 'todos') {
      setSubcategories([]);
      setSelectedSubcategory('');
      return;
    }
    const loadSubcats = async () => {
      try {
        const res = await api.get(`/listing-categories/${selectedCategory}/subcategories`);
        if (res.data?.success) {
          setSubcategories(res.data.data);
        }
      } catch {
        setSubcategories([]);
      }
    };
    loadSubcats();
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedState) {
      loadCities(selectedState);
    } else {
      setCities([]);
      setSelectedCity('');
    }
  }, [selectedState]);

  // Debounce da busca + carregar listings
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
      loadListings(1, true);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedSubcategory, selectedState, selectedCity, selectedCondition, minPrice, maxPrice, radius, sortBy]);

  // Paginação infinita
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadListings(nextPage, false);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, page, debouncedSearch]);

  const loadStates = async () => {
    const statesData = await getStates();
    setStates(statesData);
  };

  const loadCities = async (stateSigla: string) => {
    const citiesData = await getCitiesByState(stateSigla);
    setCities(citiesData);
  };

  const loadCategories = async () => {
    try {
      const res = await api.get('/listing-categories?parents_only=true');
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const formatPriceFilter = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const num = parseInt(digits, 10) / 100;
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const loadListings = async (pageNum: number = 1, isNewSearch: boolean = true) => {
    try {
      if (isNewSearch) setLoading(true);
      else setLoadingMore(true);

      const params = new URLSearchParams();
      params.append('page', pageNum.toString());
      params.append('per_page', '12');
      params.append('sort', sortBy);
      
      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }
      if (selectedCategory !== 'todos') {
        params.append('category', selectedCategory);
      }
      if (selectedSubcategory) {
        params.append('subcategory', selectedSubcategory);
      }
      if (selectedState) {
        params.append('state', selectedState);
      }
      if (selectedCity) {
        params.append('city', selectedCity);
      }
      if (selectedCondition !== 'todos') {
        params.append('condition', selectedCondition);
      }
      if (minPrice) {
        const val = parseInt(minPrice.replace(/\D/g, ''), 10) / 100;
        params.append('min_price', val.toString());
      }
      if (maxPrice) {
        const val = parseInt(maxPrice.replace(/\D/g, ''), 10) / 100;
        params.append('max_price', val.toString());
      }
      if (radius) {
        params.append('radius', radius.toString());
      }

      const res = await api.get(`/listings?${params.toString()}`);
      if (res.data?.success) {
        const newItems = res.data.data.items || [];
        if (isNewSearch) {
          setListings(newItems);
          setTotalResults(res.data.data.total || 0);
        } else {
          setListings(prev => [...prev, ...newItems]);
        }
        setHasMore(newItems.length >= 12);
      } else {
        if (isNewSearch) setListings([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error('Erro ao carregar listings:', error);
      if (isNewSearch) setListings([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleViewTracking = useCallback((id: number) => {
    if (!trackedItems.current.has(id)) {
      trackedItems.current.add(id);
      trackEvent(id, 'LISTING', 'VIEW');
    }
  }, [trackEvent]);

  const handleCardClick = useCallback((item: Listing) => {
    trackEvent(item.id, 'LISTING', 'CLICK');
    navigate(`/anuncio/${item.slug}`);
  }, [trackEvent, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadListings();
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('todos');
    setSelectedSubcategory('');
    setSelectedState('');
    setSelectedCity('');
    setSelectedCondition('todos');
    setMinPrice('');
    setMaxPrice('');
    setRadius(50);
    setSortBy('recent');
    loadListings();
  };

  const hasActiveFilters = 
    search || 
    selectedCategory !== 'todos' || 
    selectedState || 
    selectedCity || 
    selectedCondition !== 'todos' || 
    minPrice || 
    maxPrice;

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setMinPrice(raw);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setMaxPrice(raw);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        <Link to="/" className="hover:text-emerald-600 transition-colors">Home</Link>
        <ChevronRight size={12} />
        <span className="text-slate-600 dark:text-slate-300">Classificados</span>
      </nav>

      {/* Barra de Busca Proeminente */}
      <form onSubmit={handleSearch} className="relative group">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-emerald-600" size={28} />
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="O que você busca? (ex: Sprinter, São Paulo, Carro...)" 
          className="w-full bg-white dark:bg-slate-900 border-4 border-transparent dark:border-slate-800 shadow-2xl rounded-[3rem] pl-20 pr-32 py-6 text-lg font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-emerald-100 dark:focus:border-emerald-900/30 placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-all" 
        />
        {search && (
          <button 
            type="button" 
            onClick={() => setSearch('')} 
            className="absolute right-32 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-red-500 transition-colors"
          >
            <X size={24} />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase hover:bg-emerald-700 transition-all shadow-xl"
        >
          Buscar
        </button>
      </form>

      {/* Botão de Filtros + Ordenação + Resultados */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-3 rounded-xl font-bold text-sm uppercase flex items-center gap-2 transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <SlidersHorizontal size={18} />
            Filtros
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            )}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 whitespace-nowrap"
            >
              <X size={14} /> Limpar filtros
            </button>
          )}

          {!loading && totalResults > 0 && (
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
              {totalResults} resultado{totalResults !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown size={14} className="text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase px-3 py-2 rounded-xl outline-none appearance-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-all"
          >
            <option value="recent">Mais recentes</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
          </select>
        </div>
      </div>

      {/* Filtros Expandidos */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
          <div className="flex justify-between items-center">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Cidade */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Cidade</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedState}
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl outline-none font-bold text-sm text-slate-800 dark:text-slate-100 appearance-none disabled:opacity-50"
              >
                <option value="">Todas as cidades</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Raio */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">
                Raio: {radius} km
              </label>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Condição */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Condição</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl outline-none font-bold text-sm text-slate-800 dark:text-slate-100 appearance-none"
              >
                <option value="todos">Todos</option>
                <option value="novo">Novo</option>
                <option value="usado">Usado</option>
              </select>
            </div>

            {/* Preço Mín */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Preço Mín.</label>
              <input
                type="text"
                value={minPrice ? formatPriceFilter(minPrice) : ''}
                onChange={handleMinPriceChange}
                placeholder="R$ 0,00"
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl outline-none font-bold text-sm text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Preço Máx */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Preço Máx.</label>
              <input
                type="text"
                value={maxPrice ? formatPriceFilter(maxPrice) : ''}
                onChange={handleMaxPriceChange}
                placeholder="R$ 999.999,00"
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl outline-none font-bold text-sm text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Categorias */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Categorias</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('todos')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                  selectedCategory === 'todos'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                    selectedCategory === cat.slug
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {subcategories.length > 0 && (
              <div className="mt-3">
                <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Subcategorias</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSubcategory('')}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      !selectedSubcategory
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Todas
                  </button>
                  {subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubcategory(sub.slug)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                        selectedSubcategory === sub.slug
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => { loadListings(); setShowFilters(false); }}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm uppercase hover:bg-emerald-700 transition-all"
          >
            Aplicar Filtros
          </button>
        </div>
      )}

      {/* Categorias Rápidas (quando filtros fechados) */}
      {!showFilters && (
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('todos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase whitespace-nowrap transition-all ${
                selectedCategory === 'todos'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase whitespace-nowrap transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Subcategorias */}
          {subcategories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedSubcategory('')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase whitespace-nowrap transition-all ${
                  !selectedSubcategory
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                Todas
              </button>
              {subcategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(sub.slug)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase whitespace-nowrap transition-all ${
                    selectedSubcategory === sub.slug
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="max-w-4xl mx-auto mb-6">
        <AdCard position="marketplace_list" variant="ecommerce" search={debouncedSearch} />
      </div>

      {/* Grid de Produtos */}
      {loading && page === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-[420px] bg-white dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700">
          <p className="text-slate-400 dark:text-slate-500 font-bold">Nenhum anúncio encontrado.</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Tente ajustar os filtros ou buscar outro termo.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listings.map((item, index) => (
              <React.Fragment key={`${item.id}-${index}`}>
                {/* Card Comunidade - Posição 0 (primeiro item) */}
                {index === 0 && (
                  <div onClick={() => navigate('/comunidade')} className="group cursor-pointer bg-emerald-600 rounded-[2rem] p-8 text-white flex flex-col justify-between h-[420px] relative overflow-hidden shadow-xl hover:translate-y-[-4px] transition-all">
                    <Users className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform duration-700" size={180} />
                    <div className="relative z-10">
                      <div className="bg-white/20 w-fit p-3 rounded-xl mb-4 backdrop-blur-xl border border-white/10"><Globe size={24} /></div>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-[0.9] mb-2">Grupos de <br/><span className="text-emerald-200">WhatsApp</span></h3>
                      <p className="text-emerald-100 text-[10px] font-bold italic uppercase tracking-wider">Produtos em tempo real.</p>
                    </div>
                    <button className="w-full bg-white text-emerald-600 py-4 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-emerald-50 transition-all shadow-lg relative z-10">
                      Ver Grupos <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                <ListingCard
                  data={item}
                  onView={() => handleViewTracking(item.id)}
                  onClick={() => handleCardClick(item)}
                />
                
                {/* Card Anuncie - Posição 4 (após 4 listings) */}
                {index === 3 && (
                  <div onClick={() => setIsBusinessModalOpen(true)} className="group cursor-pointer bg-slate-900 dark:bg-slate-800 rounded-[2rem] p-8 text-white flex flex-col justify-between h-[420px] relative overflow-hidden shadow-xl hover:translate-y-[-4px] transition-all border border-slate-700">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
                    <div className="relative z-10">
                      <div className="bg-amber-500 w-fit p-3 rounded-xl mb-4"><Zap size={24} className="text-slate-900" /></div>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-[0.9] mb-2 text-amber-500">
                        Anuncie <br/><span className="text-white">Sua Empresa</span>
                      </h3>
                      <p className="text-slate-400 text-[10px] font-bold italic uppercase tracking-wider">Destaque sua marca no portal.</p>
                    </div>
                    <button className="w-full bg-amber-500 text-slate-900 py-4 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-white transition-all shadow-lg relative z-10">
                      Quero Anunciar <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {index > 0 && index % 8 === 0 && (
                  <AdCard position="marketplace_card" variant="card" search={debouncedSearch} />
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Loading More + Paginação Infinita */}
          {hasMore && (
            <div ref={lastElementRef} className="flex justify-center py-12">
              {loadingMore ? (
                <Loader2 className="animate-spin text-emerald-600" size={40} />
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Anúncio */}
      <div className="max-w-4xl mx-auto mb-10">
        <AdCard position="marketplace_list" variant="ecommerce" search={debouncedSearch} />
      </div>

      <BusinessModal 
        isOpen={isBusinessModalOpen} 
        onClose={() => setIsBusinessModalOpen(false)} 
        initialSubject="Interesse em anunciar no Portal de Classificados"
      />
    </div>
  );
}