import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Loader2, Globe, ArrowRight, Users, Zap } from 'lucide-react';
import { api } from '../../api/api';
import { getStates, getCitiesByState } from '../../services/location';
import AdCard from '../../components/shared/AdCard';
import ListingCard from '../../components/shared/ListingCard';
import AdCarousel from '../../components/shared/AdCarousel';
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
}

export default function MarketplaceExplorer() {
  const navigate = useNavigate();
  const { trackEvent } = useTracker();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
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
  }, [search, selectedCategory, selectedState, selectedCity, selectedCondition, minPrice, maxPrice, radius]);

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
      const res = await api.get('/listing-categories');
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const loadListings = async (pageNum: number = 1, isNewSearch: boolean = true) => {
    try {
      if (isNewSearch) setLoading(true);
      else setLoadingMore(true);

      const params = new URLSearchParams();
      params.append('page', pageNum.toString());
      params.append('per_page', '12');
      
      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }
      if (selectedCategory !== 'todos') {
        params.append('category', selectedCategory);
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
        params.append('min_price', minPrice);
      }
      if (maxPrice) {
        params.append('max_price', maxPrice);
      }
      if (radius) {
        params.append('radius', radius.toString());
      }

      const res = await api.get(`/listings?${params.toString()}`);
      if (res.data?.success) {
        const newItems = res.data.data.items || [];
        if (isNewSearch) {
          setListings(newItems);
        } else {
          setListings(prev => [...prev, ...newItems]);
        }
        setHasMore(newItems.length >= 12);
      } else {
        if (isNewSearch) setListings([]);
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
    setSelectedState('');
    setSelectedCity('');
    setSelectedCondition('todos');
    setMinPrice('');
    setMaxPrice('');
    setRadius(50);
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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

      {/* Botão de Filtros */}
      <div className="flex items-center gap-4">
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
            className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <X size={14} /> Limpar filtros
          </button>
        )}
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
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="w-full p-3 bg-slate-50 dark:bg-slate-700 rounded-xl outline-none font-bold text-sm text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Preço Máx */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 mb-2">Preço Máx.</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="999999"
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
          </div>

          <button
            onClick={() => { loadListings(); setShowFilters(false); }}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-sm uppercase hover:bg-emerald-700 transition-all"
          >
            Aplicar Filtros
          </button>
        </div>
      )}

      {/* CAROUSEL DE ANÚNCIOS */}
      <section className="my-6 relative">
        <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-white dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <AdCarousel searchTerm={debouncedSearch} state={selectedState} city={selectedCity} />
        </div>
      </section>

      {/* Categorias Rápidas (quando filtros fechados) */}
      {!showFilters && (
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
      )}

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

                {/* In-Feed Ad a cada 8 items (após primeiros 3) */}
                {index >= 3 && (index + 1) % 8 === 0 && (
                  <div className="col-span-full min-h-[420px]">
                    <AdCard position="in-feed" variant="vertical" state={item.location_state} search={debouncedSearch} />
                  </div>
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

      <BusinessModal 
        isOpen={isBusinessModalOpen} 
        onClose={() => setIsBusinessModalOpen(false)} 
        initialSubject="Interesse em anunciar no Portal de Classificados"
      />
    </div>
  );
}