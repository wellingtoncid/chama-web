import { useState, useEffect } from 'react';
import { api } from '../api/api';
import { 
  Lock, Search, Star, Globe, Users, MessageCircle, X, Zap, Plus, 
  ShieldCheck, ArrowUpRight, BarChart3, ShoppingCart, Truck
} from 'lucide-react';

import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import GroupsModal from '../components/modals/GroupsModal'

export default function GroupsList() {
  const [groups, setGroups] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Verifica se o usuário está logado para grupos que exigem login
  const isLogged = !!localStorage.getItem("@ChamaFrete:token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resG, resA] = await Promise.all([
          api.get('list-groups'),
          api.get('ads').catch(() => ({ data: { data: [] } }))  
        ]);
        const groupsList = resG.data.data || resG.data || [];
        const adsList = resA.data.data || resA.data || [];

        setGroups(Array.isArray(groupsList) ? groupsList : []);
        setAds(Array.isArray(adsList) ? adsList : []);
      } catch (e) { 
        console.error("Erro ao carregar dados do portal:", e); 
        setGroups([]); 
      }
    };
    fetchData();
  }, []);

  const renderGrid = () => {
    const items: any[] = [];
    if (!Array.isArray(groups)) return [];

    const filteredGroups = groups.filter(g => 
      g && (g.display_location === 'site' || g.display_location === 'both') &&
      (g.region_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedGroups = [...filteredGroups].sort((a, b) => {
      if (a.is_visible_home !== b.is_visible_home) return b.is_visible_home - a.is_visible_home;
      return b.priority_level - a.priority_level;
    });
    
    let adPointer = 0;
    // Insere o primeiro anúncio no topo se existir
    if (ads.length > 0 && ads[adPointer]) {
      items.push({ ...ads[adPointer++], isAd: true });
    }

    sortedGroups.forEach((group, index) => {
      items.push({ ...group, isAd: false });
      // Insere um anúncio a cada 5 grupos
      if ((index + 1) % 5 === 0 && ads[adPointer]) {
        items.push({ ...ads[adPointer++], isAd: true });
      }
    });

    return items;
  };

  const HorizontalBanner = ({ item }: { item: any }) => (
    <div className="col-span-1 md:col-span-2 lg:col-span-3 w-full bg-[#0F172A] rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-slate-800 min-h-[200px] flex items-center">
      <div className="absolute inset-0">
        <img src={item.image_url} className="w-full h-full object-cover opacity-30" alt="" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/80 to-transparent" />
      </div>
      <div className="relative p-10 flex flex-col md:flex-row items-center justify-between w-full gap-6">
        <div className="text-center md:text-left">
          <span className="bg-blue-600 text-white px-4 py-1 rounded-full font-black text-[9px] uppercase tracking-[0.2em] mb-4 inline-block">Parceiro Estratégico</span>
          <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{item.title}</h4>
          <p className="text-slate-400 text-sm mt-2 max-w-xl line-clamp-2">{item.description}</p>
        </div>
        <a href={item.link_whatsapp} target="_blank" className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap">
          Conhecer Agora
        </a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300">
      <Header />
      
      {/* Hero & Search Section */}
      <section className="pt-36 pb-12 px-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-blue-600 mb-3">
              <Globe size={18} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ecossistema de Negócios & Logística</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase italic leading-[0.9] tracking-tighter">
              CONECTE-SE ÀS <br />
              <span className="text-blue-600">COMUNIDADES</span>
            </h1>
            <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium italic text-sm md:text-base max-w-lg">
              O ponto de encontro entre transporte, indústria, comércio e serviços. Encontre grupos de fretes, vendas, logística e parcerias estratégicas.
            </p>
          </div>

          <div className="relative w-full max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="BUSCAR POR CIDADE, CATEGORIA OU NEGÓCIO..."
              className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-700 rounded-2xl py-6 pl-14 pr-6 font-bold text-xs transition-all outline-none uppercase tracking-tight shadow-sm dark:text-white"
            />
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          
          {renderGrid().map((item, idx) => {
            // RENDERIZAÇÃO DE CARD DE ANÚNCIO (AD)
            if (item.isAd && (idx === 0 || idx % 6 === 0)) {
              return <HorizontalBanner key={item.id} item={item} />;
            }
            if (item.isAd) {
              return (
                <div key={item.id} className="group relative bg-[#0F172A] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col min-h-[420px] border border-slate-800">
                  <div className="absolute inset-0">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-[10s]" 
                        alt={item.title} 
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 opacity-40" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/20 to-transparent" />
                  </div>
                  <div className="relative p-8 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-auto">
                      <span className="bg-amber-400 text-black px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg">Destaque Parceiro</span>
                      <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10">
                        <Star size={18} className="text-amber-400 fill-current" />
                      </div>
                    </div>
                    <div className="mt-8">
                      <h4 className="text-3xl font-black text-white uppercase italic leading-[1.1] tracking-tighter mb-3">{item.title}</h4>
                      <p className="text-slate-400 text-sm font-medium italic mb-8 line-clamp-3">{item.description}</p>
                      <a href={item.link_whatsapp} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all active:scale-95 shadow-white/10 shadow-xl">
                        Acessar Agora <ArrowUpRight size={18} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            }

            // LÓGICA DE ESTADO DO GRUPO
            const isSoon = item.status === 'upcoming';
            const isFull = item.status === 'inactive';
            const loginRequired = item.access_type === 'login_required';
            const isPremium = item.is_premium === 1;
            const isExternal = item.internal_notes?.toLowerCase().includes('externo');

            // RENDERIZAÇÃO DE CARD DE GRUPO
            return (
              <div 
                key={`group-${idx}`} 
                className={`group relative rounded-[2.5rem] p-8 border-2 transition-all flex flex-col justify-between 
                ${isPremium ? 'bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-blue-900/10 border-blue-200 dark:border-blue-800 shadow-xl shadow-blue-50/10' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'} 
                ${isFull ? 'opacity-50 grayscale' : 'hover:shadow-2xl hover:border-blue-500 hover:-translate-y-1'}`}
              >
                {isPremium && (
                  <div className="absolute -top-3 -right-3 bg-blue-600 text-white p-2.5 rounded-2xl shadow-lg ring-4 ring-white dark:ring-slate-900">
                    <Zap size={16} fill="currentColor" />
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-start mb-8">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${isSoon ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-500' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors'}`}>
                      {item.category?.toLowerCase().includes('venda') ? <ShoppingCart size={28} /> : 
                      item.category?.toLowerCase().includes('frete') ? <Truck size={28} /> : 
                      <Users size={28} />}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                        isSoon ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 border-amber-100 dark:border-amber-800' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 border-emerald-100 dark:border-emerald-800'
                      }`}>
                        {isSoon ? 'Aguarde' : 'Disponível'}
                      </span>
                      {item.is_verified === 1 && (
                        <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-lg border border-blue-100 dark:border-blue-800">
                            <ShieldCheck size={12} className="fill-blue-100 dark:fill-blue-900" />
                            <span className="text-[8px] font-black uppercase tracking-tighter">Verificado</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-3">
                    {item.region_name}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <BarChart3 size={12} className="text-slate-500" />
                      <span className="text-[9px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{item.category || 'Geral'}</span>
                    </div>
                    {isExternal && (
                      <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-lg border border-purple-100 dark:border-purple-800">
                        <Globe size={12} className="text-purple-500" />
                        <span className="text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">Grupo Externo</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">{isSoon ? '---' : item.member_count}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Participantes</span>
                    </div>
                    {loginRequired && (
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                          <Lock size={12} /> Privado
                        </div>
                    )}
                  </div>
                  
                  {isSoon ? (
                    <button onClick={() => { setIsModalOpen(true); }} className="w-full bg-slate-900 dark:bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 dark:hover:bg-blue-500 transition-all active:scale-95 shadow-lg">
                      Quero Participar
                    </button>
                  ) : (loginRequired && !isLogged) ? (
                    <a href="/login" className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                      <Lock size={16} /> Entrar na Plataforma
                    </a>
                  ) : (
                    <a 
                      href={item.invite_link} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${
                        isFull ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 pointer-events-none' : 'bg-[#25D366] text-white hover:bg-blue-600 shadow-emerald-100 active:scale-95'
                      }`}
                      onClick={() => !isFull && api.post('log-group-click', { id: item.id })}
                    >
                      {isFull ? 'Limite Atingido' : 'Entrar no Grupo'} <MessageCircle size={18} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          {/* Card CTA: Adicionar Comunidade */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all bg-slate-50/30 dark:bg-slate-900/30"
          >
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-blue-600 mb-6 transition-all rotate-3 group-hover:rotate-0">
              <Plus size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">Divulgue sua Comunidade</h3>
            <p className="text-[10px] text-blue-600 font-black uppercase mt-4 tracking-[0.2em] underline">Anunciar grupo externo</p>
          </button>
        </div>
      </main>

     {/* CHAMADA DO MODAL COMPONENTIZADO */}
      <GroupsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <Footer />
    </div>
  );
}