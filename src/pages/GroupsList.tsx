  import { useState, useEffect } from 'react';
  import { api } from '../api/api';
  import { 
    Lock, Search, Star, Globe, Users, MessageCircle, X, Zap, Plus, 
    ShieldCheck, ArrowUpRight, BarChart3, ShoppingCart, Truck,
    ExternalLink, CheckCircle2, Building2 // Building2 para ícone de empresa
  } from 'lucide-react';

  import Header from '../components/shared/Header';
  import Footer from '../components/shared/Footer';

  export default function GroupsPortalFinal() {
    const [groups, setGroups] = useState<any[]>([]);
    const [ads, setAds] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalStep, setModalStep] = useState<'select' | 'suggest' | 'advertise' | 'business' | 'success'>('select');
    
    const [formData, setFormData] = useState({
      title: '',
      link: '',
      contact: '',
      description: '' // Adicionado para detalhes do anúncio
    });
    const [isSending, setIsSending] = useState(false);

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
        console.error(e); 
        setGroups([]); // Fallback para não quebrar o render
      }
    };
    fetchData();
  }, []);

    // Lógica de envio para o Backend (O pulo do gato)
    const handlePortalRequest = async (type: 'suggestion' | 'external_group' | 'business_ad') => {
      if (!formData.contact || !formData.title) {
        alert("Por favor, preencha as informações básicas de contato.");
        return;
      }

      setIsSending(true);
      try {
        await api.post('admin-portal-requests', { 
      type,
      title: formData.title,
      link: formData.link,
      contact_info: formData.contact, 
      description: formData.description
  });
        setModalStep('success');
        setFormData({ title: '', link: '', contact: '', description: '' });
      } catch (error) {
        alert("Erro ao processar solicitação.");
      } finally {
        setIsSending(false);
      }
    };

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
      if (ads[adPointer]) items.push({ ...ads[adPointer++], isAd: true });

      sortedGroups.forEach((group, index) => {
        items.push({ ...group, isAd: false });
        if ((index + 1) % 5 === 0 && ads[adPointer]) {
          items.push({ ...ads[adPointer++], isAd: true });
        }
      });

      return items;
    };

    return (
      <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans">
        <Header />
        
        {/* ... (Seção de Header e Busca) ... */}
        <section className="pt-28 pb-12 px-6 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-blue-600 mb-3">
                <Globe size={18} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ecossistema de Negócios & Logística</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic leading-[0.9] tracking-tighter">
                CONECTE-SE ÀS <br />
                <span className="text-blue-600">COMUNIDADES</span>
              </h1>
              <p className="mt-4 text-slate-500 font-medium italic text-sm md:text-base max-w-lg">
                O ponto de encontro entre transporte, indústria, comércio e serviços. Encontre grupos de fretes, vendas, logística e parcerias estratégicas.
              </p>
            </div>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="BUSCAR POR CIDADE, CATEGORIA OU NEGÓCIO..."
                className="w-full bg-slate-100 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl py-6 pl-14 pr-6 font-bold text-xs transition-all outline-none uppercase tracking-tight shadow-sm"
              />
            </div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            
            {renderGrid().map((item, idx) => {
              if (item.isAd) {
                return (
                  <div key={`ad-${idx}`} className="group relative bg-[#0F172A] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col min-h-[420px] border border-slate-800">
                    <div className="absolute inset-0">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          className="w-full h-full object-cover opacity-40 group-hover:scale-110 transition-transform duration-[10s]" 
                          alt={item.title} 
                        />
                      ) : (
                        // Opcional: Um fundo sólido ou placeholder caso não tenha imagem
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
                        <a href={item.link_whatsapp} target="_blank" className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all active:scale-95 shadow-white/10 shadow-xl">
                          Acessar Agora <ArrowUpRight size={18} />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              }

              const isSoon = item.status === 'upcoming';
              const isFull = item.status === 'inactive';
              const loginRequired = item.access_type === 'login_required';
              const isPremium = item.is_premium === 1;
              const isExternal = item.internal_notes?.toLowerCase().includes('externo');

              return (
                <div 
                  key={`group-${idx}`} 
                  className={`group relative rounded-[2.5rem] p-8 border-2 transition-all flex flex-col justify-between 
                  ${isPremium ? 'bg-gradient-to-br from-white to-blue-50/50 border-blue-200 shadow-xl shadow-blue-50' : 'bg-white border-slate-200 shadow-sm'} 
                  ${isFull ? 'opacity-50 grayscale' : 'hover:shadow-2xl hover:border-blue-500 hover:-translate-y-1'}`}
                >
                  {isPremium && (
                    <div className="absolute -top-3 -right-3 bg-blue-600 text-white p-2.5 rounded-2xl shadow-lg ring-4 ring-white">
                      <Zap size={16} fill="currentColor" />
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-start mb-8">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner ${isSoon ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors'}`}>
                        {item.category?.toLowerCase().includes('venda') ? <ShoppingCart size={28} /> : 
                        item.category?.toLowerCase().includes('frete') ? <Truck size={28} /> : 
                        <Users size={28} />}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                          isSoon ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {isSoon ? 'Aguarde' : 'Disponível'}
                        </span>
                        {item.is_verified === 1 && (
                          <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg border border-blue-100">
                              <ShieldCheck size={12} className="fill-blue-100" />
                              <span className="text-[8px] font-black uppercase tracking-tighter">Verificado</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-3">
                      {item.region_name}
                    </h3>
                    
                    <div className="flex flex-wrap gap-2 mb-8">
                      <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                        <BarChart3 size={12} className="text-slate-500" />
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{item.category || 'Geral'}</span>
                      </div>
                      {isExternal && (
                        <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100">
                          <Globe size={12} className="text-purple-500" />
                          <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest">Grupo Externo</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex flex-col">
                        <span className="text-2xl font-black text-slate-900 leading-none">{isSoon ? '---' : item.member_count}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Participantes</span>
                      </div>
                      {loginRequired && (
                          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase bg-slate-50 px-3 py-1.5 rounded-lg">
                            <Lock size={12} /> Privado
                          </div>
                      )}
                    </div>
                    
                    {isSoon ? (
                      <button onClick={() => setIsModalOpen(true)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-lg">
                        Quero Participar
                      </button>
                    ) : (loginRequired && !isLogged) ? (
                      <a href="/login" className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-600 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">
                        <Lock size={16} /> Entrar na Plataforma
                      </a>
                    ) : (
                      <a 
                        href={item.invite_link} 
                        target="_blank"
                        className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl ${
                          isFull ? 'bg-slate-200 text-slate-400 pointer-events-none' : 'bg-[#25D366] text-white hover:bg-blue-600 shadow-emerald-100 active:scale-95'
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

            <button 
              onClick={() => setIsModalOpen(true)}
              className="group border-2 border-dashed border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center hover:border-blue-600 hover:bg-blue-50/50 transition-all bg-slate-50/30"
            >
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-slate-300 group-hover:text-blue-600 mb-6 transition-all rotate-3 group-hover:rotate-0">
                <Plus size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Divulgue sua Comunidade</h3>
              <p className="text-[10px] text-blue-600 font-black uppercase mt-4 tracking-[0.2em] underline">Anunciar grupo externo</p>
            </button>
          </div>
        </main>

        {/* MODAL MULTIUSO COM FLUXO DE EMPRESA */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative border border-white/20">
              
              <button onClick={() => { setIsModalOpen(false); setModalStep('select'); }} className="absolute top-8 right-8 text-slate-400 hover:text-red-500 z-10">
                <X size={28} />
              </button>

              <div className="flex flex-col md:flex-row min-h-[550px]">
                <div className="md:w-1/3 bg-blue-600 p-10 text-white flex flex-col justify-center">
                  <Zap size={40} className="mb-6 fill-white" />
                  <h2 className="text-3xl font-black uppercase italic leading-none tracking-tighter mb-4">Expanda seu Alcance</h2>
                  <p className="text-blue-100 text-sm font-medium italic">Conectamos sua marca ao público certo no setor de transportes e logística.</p>
                </div>

                <div className="md:w-2/3 p-10 flex flex-col justify-center bg-slate-50">
                  
                  {modalStep === 'select' && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-black text-slate-900 uppercase italic mb-6">Como podemos ajudar?</h3>
                      
                      <button onClick={() => setModalStep('suggest')} className="w-full flex items-center gap-4 p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-blue-600 transition-all text-left group">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors"><Plus size={24} /></div>
                        <div>
                          <p className="font-black text-slate-900 uppercase text-xs">Sugerir Nova Região</p>
                          <p className="text-[10px] text-slate-500 font-medium italic">Sente falta de algum lugar? Avise-nos!</p>
                        </div>
                      </button>

                      <button onClick={() => setModalStep('advertise')} className="w-full flex items-center gap-4 p-5 bg-white border-2 border-slate-100 rounded-2xl hover:border-emerald-500 transition-all text-left group">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors"><ExternalLink size={24} /></div>
                        <div>
                          <p className="font-black text-slate-900 uppercase text-xs">Divulgar meu Grupo</p>
                          <p className="text-[10px] text-slate-500 font-medium italic">Promova sua própria comunidade aqui.</p>
                        </div>
                      </button>

                      {/* OPÇÃO DE EMPRESA AGORA ABRE FORMULÁRIO */}
                      <button onClick={() => setModalStep('business')} className="w-full flex items-center gap-4 p-5 bg-slate-900 border-2 border-slate-900 rounded-2xl hover:bg-amber-500 hover:border-amber-500 transition-all text-left group">
                        <div className="p-3 bg-white/10 text-amber-400 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors"><Building2 size={24} /></div>
                        <div>
                          <p className="font-black text-white uppercase text-xs group-hover:text-slate-900">Anunciar Empresa / Serviço</p>
                          <p className="text-[10px] text-blue-200 font-medium italic group-hover:text-slate-800">Destaque sua marca para milhares de usuários.</p>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* FORMULÁRIO DE ANÚNCIO DE EMPRESA */}
                  {modalStep === 'business' && (
                    <div className="animate-in fade-in slide-in-from-right-4">
                      <button onClick={() => setModalStep('select')} className="text-[10px] font-black uppercase text-blue-600 mb-4 flex items-center gap-1">← Voltar</button>
                      <h3 className="text-xl font-black text-slate-900 uppercase italic mb-2">Anunciar minha Marca</h3>
                      <p className="text-[10px] text-slate-500 mb-4 italic">Deixe os dados da sua empresa. Nossa equipe comercial enviará o kit de mídia.</p>
                      
                      <input 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl mb-3 outline-none focus:border-blue-600 text-sm font-bold uppercase" 
                        placeholder="Nome da Empresa / Negócio" 
                      />
                      <input 
                        value={formData.contact}
                        onChange={(e) => setFormData({...formData, contact: e.target.value})}
                        className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl mb-3 outline-none focus:border-blue-600 text-sm font-bold" 
                        placeholder="Seu WhatsApp de Contato" 
                      />
                      <textarea 
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl mb-3 outline-none focus:border-blue-600 text-sm font-medium h-24 resize-none" 
                        placeholder="Fale um pouco sobre o que deseja anunciar..." 
                      />
                      
                      <button 
                        onClick={() => handlePortalRequest('business_ad')}
                        disabled={isSending}
                        className="w-full bg-amber-500 text-slate-900 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-50"
                      >
                        {isSending ? 'Processando...' : 'Solicitar Orçamento'}
                      </button>
                    </div>
                  )}

                  {modalStep === 'suggest' && (
                    <div className="animate-in fade-in slide-in-from-right-4">
                      <button onClick={() => setModalStep('select')} className="text-[10px] font-black uppercase text-blue-600 mb-4 flex items-center gap-1">← Voltar</button>
                      <h3 className="text-xl font-black text-slate-900 uppercase italic mb-4">Sugerir Rota/Cidade</h3>
                      <input 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl mb-3 outline-none focus:border-blue-600 text-sm font-bold uppercase" 
                        placeholder="Qual cidade ou categoria?" 
                      />
                      <input 
                        value={formData.contact}
                        onChange={(e) => setFormData({...formData, contact: e.target.value})}
                        className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl mb-3 outline-none focus:border-blue-600 text-sm font-bold" 
                        placeholder="Seu WhatsApp ou E-mail" 
                      />
                      <button 
                        onClick={() => handlePortalRequest('suggestion')}
                        disabled={isSending}
                        className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-50"
                      >
                        {isSending ? 'Enviando...' : 'Enviar Sugestão'}
                      </button>
                    </div>
                  )}

                  {modalStep === 'advertise' && (
                    <div className="animate-in fade-in slide-in-from-right-4">
                      <button onClick={() => setModalStep('select')} className="text-[10px] font-black uppercase text-blue-600 mb-4 flex items-center gap-1">← Voltar</button>
                      <h3 className="text-xl font-black text-slate-900 uppercase italic mb-4">Seu Grupo no Portal</h3>
                      <input 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl mb-3 outline-none focus:border-blue-600 text-sm font-bold uppercase" 
                        placeholder="Nome do seu Grupo/Região" 
                      />
                      <input 
                        value={formData.link}
                        onChange={(e) => setFormData({...formData, link: e.target.value})}
                        className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl mb-3 outline-none focus:border-blue-600 text-sm font-bold" 
                        placeholder="Link do WhatsApp" 
                      />
                      <input 
                        value={formData.contact}
                        onChange={(e) => setFormData({...formData, contact: e.target.value})}
                        className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl mb-3 outline-none focus:border-blue-600 text-sm font-bold" 
                        placeholder="Seu contato (WhatsApp)" 
                      />
                      <button 
                        onClick={() => handlePortalRequest('external_group')}
                        disabled={isSending}
                        className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-50"
                      >
                        {isSending ? 'Enviando...' : 'Enviar para Análise'}
                      </button>
                    </div>
                  )}

                  {modalStep === 'success' && (
                    <div className="text-center animate-in zoom-in duration-300">
                      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 uppercase italic mb-2 tracking-tighter">Recebido com Sucesso!</h3>
                      <p className="text-sm text-slate-500 font-medium italic mb-8">Nossa equipe analisará sua solicitação e entrará em contato se necessário.</p>
                      <button 
                        onClick={() => { setIsModalOpen(false); setModalStep('select'); }}
                        className="px-8 py-4 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest"
                      >
                        Fechar Janela
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        )}
        <Footer />
      </div>
    );
  }