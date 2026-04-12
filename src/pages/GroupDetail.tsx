import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Share2, Loader2, ShieldCheck, Users,
  MessageCircle, ExternalLink, MousePointer, Calendar, Star, Building2
} from 'lucide-react';
import { api } from '@/api/api';
import { AdImage } from '@/components/AdImage';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import GroupCard from '@/components/shared/GroupCard';
import AdCard from '@/components/shared/AdCard';
import AuthModal from '@/components/modals/AuthModal';
import { useTracker } from '@/services/useTracker';

interface WhatsAppGroup {
  id: number;
  region_name: string;
  invite_link?: string;
  image_url?: string;
  description?: string;
  category_name: string;
  category_color?: string;
  category_slug?: string;
  category_id?: number;
  is_premium: number;
  is_verified: number;
  is_public: number;
  status: string;
  clicks_count: number;
  views_count: number;
  member_count: number;
  group_admin_name?: string;
  other_admins?: string | string[];
  created_at?: string;
  category?: string;
  admin_user_id?: number;
  admin_user_name?: string;
  admin_user_slug?: string;
  admin_user_avatar?: string;
  admin_user_whatsapp?: string;
  admin_user_verified?: number;
  admin_company_name?: string;
  admin_total_groups?: number;
}

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { trackEvent } = useTracker();
  
  const [group, setGroup] = useState<WhatsAppGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedGroups, setRelatedGroups] = useState<WhatsAppGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  const user = JSON.parse(localStorage.getItem("@ChamaFrete:user") || "null");
  const isLogged = !!localStorage.getItem("@ChamaFrete:token");
  const viewLogged = useRef(false);
  
  const isPremium = group?.is_premium === 1;
  const isActive = group?.status === 'active';
  const isPrivate = group?.is_public === 0;
  const hasImage = !!(group?.image_url && group.image_url.trim());

  useEffect(() => {
    const fetchGroup = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const res = await api.get(`group/${id}`);
        if (res.data?.success) {
          setGroup(res.data.data);
          if (!viewLogged.current) {
            trackEvent(parseInt(id), 'GROUP', 'VIEW_DETAILS');
            viewLogged.current = true;
          }
        } else {
          setError('Grupo não encontrado');
        }
      } catch {
        setError('Erro ao carregar grupo');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroup();
  }, [id, trackEvent]);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!group?.category_id) return;
      
      try {
        const res = await api.get('list-groups');
        const allGroups = res.data?.data || [];
        const related = allGroups
          .filter((g: WhatsAppGroup) => g.category_id === group.category_id && g.id !== group.id)
          .slice(0, 4);
        setRelatedGroups(related);
      } catch {
        // silent fail
      }
    };
    
    fetchRelated();
  }, [group]);

  const handleShare = async () => {
    if (!group) return;
    const shareData = {
      title: `Grupo ${group.region_name}`,
      text: `Participe do grupo ${group.region_name} no Chama Frete!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard.writeText(window.location.href);
    } catch {
      // silent fail
    }
  };

  const handleJoinClick = () => {
    if (!group) return;
    
    if (isPrivate && !isLogged) {
      setIsAuthModalOpen(true);
      return;
    }
    
    if (group.invite_link && group.invite_link !== 'locked') {
      trackEvent(group.id, 'GROUP', 'WHATSAPP_CLICK');
      window.open(group.invite_link, '_blank');
    }
  };

  const parseOtherAdmins = (): string[] => {
    if (!group?.other_admins) return [];
    if (Array.isArray(group.other_admins)) return group.other_admins;
    try {
      return JSON.parse(group.other_admins);
    } catch {
      return [];
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  if (error || !group) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <Users size={48} className="text-slate-400 mb-4" />
      <h2 className="text-xl font-black uppercase italic">Grupo não encontrado</h2>
      <button onClick={() => navigate('/comunidade')} className="mt-4 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase">Voltar</button>
    </div>
  );

  const otherAdmins = parseOtherAdmins();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-6xl mx-auto pt-32 pb-20 px-4">
        
        {/* NAVEGAÇÃO */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/comunidade')} className="flex items-center gap-2 text-slate-400 font-bold hover:text-blue-600 transition-all uppercase text-[10px] tracking-widest">
            <ArrowLeft size={16} /> Voltar
          </button>
          <button onClick={handleShare} className="flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-all uppercase text-[10px] tracking-widest">
            Compartilhar <Share2 size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ESQUERDA: CONTEÚDO PRINCIPAL */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100 relative">
              
              {/* Box Grupo */}
              <div className="mb-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-50 pb-10">
                  <div className="flex items-center gap-6">
                    <div className="bg-blue-600 p-5 rounded-3xl text-white shadow-lg shrink-0">
                      <Users size={40} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase italic">
                          {group.category_name || group.category || 'Geral'}
                        </span>
                        {group.is_verified === 1 && (
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase italic">
                            ✓ Verificado
                          </span>
                        )}
                        {isPremium && (
                          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase italic">
                            Premium
                          </span>
                        )}
                        <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-black uppercase italic">
                          #{group.id}
                        </span>
                      </div>
                      <h1 className="text-3xl md:text-4xl font-[1000] uppercase italic text-slate-900 leading-tight break-words">
                        {group.region_name}
                      </h1>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Image */}
              <div className="mb-10">
                <div className="relative aspect-[4/3] bg-slate-100 rounded-[2rem] overflow-hidden">
                  {hasImage ? (
                    <AdImage 
                      url={group.image_url} 
                      className="w-full h-full object-cover"
                      alt={group.region_name}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
                      <span className="text-white/20 text-9xl font-black uppercase italic tracking-tighter">
                        {group.region_name?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>



              {/* Descrição */}
              {group.description && (
                <div>
                  <h4 className="font-black uppercase text-[11px] text-slate-900 mb-4 flex items-center gap-2 italic">
                    <ShieldCheck size={18} className="text-blue-600" /> Descrição do Grupo
                  </h4>
                  <div className="text-slate-600 font-medium bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 whitespace-pre-line text-sm leading-relaxed">
                    {group.description}
                  </div>
                </div>
              )}
            </div>

            {/* Anúncio Horizontal */}
            <AdCard position="details_page" variant="horizontal" />

            {/* Grupos Relacionados */}
            {relatedGroups.length > 0 && (
              <div className="pt-4">
                <h3 className="font-[1000] uppercase italic text-slate-900 text-xl mb-6 flex items-center gap-3">
                  <Users className="text-blue-600" size={24} /> OUTROS GRUPOS QUE PODEM INTERESSAR
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedGroups.slice(0, 2).map((g) => (
                    <GroupCard key={g.id} group={g} />
                  ))}
                </div>
              </div>
            )}

            {/* Dicas de Segurança */}
            <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">
              <h4 className="font-black uppercase text-[11px] text-slate-900 mb-6 flex items-center gap-2 italic">
                <ShieldCheck size={18} className="text-amber-500" /> Dicas de Segurança
              </h4>
              <ul className="space-y-3">
                <li className="flex gap-4 items-start text-xs md:text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold text-[10px]">1</span>
                  Verifique se o grupo é seguro antes de participar.
                </li>
                <li className="flex gap-4 items-start text-xs md:text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold text-[10px]">2</span>
                  Não compartilhe dados pessoais com desconhecidos.
                </li>
                <li className="flex gap-4 items-start text-xs md:text-sm text-slate-600">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 font-bold text-[10px]">3</span>
                  Desconfie de propostas muito vantajosas ou urgentes.
                </li>
              </ul>
            </div>
          </div>

          {/* DIREITA: SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-32 space-y-6">
              
              {/* Box de Contato */}
              <div className="bg-white rounded-[3rem] p-8 md:p-10 shadow-2xl border-2 border-slate-100">
                
                {/* Status Badge */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {isActive ? (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase italic">
                      Ativo
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase italic">
                      Indisponível
                    </span>
                  )}
                  {!isPrivate ? (
                    <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase italic">
                      Acesso Livre
                    </span>
                  ) : (
                    <span className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase italic">
                      Requer Login
                    </span>
                  )}
                </div>

                {/* Botão Entrar */}
                <div className="space-y-3">
                  <button 
                    onClick={handleJoinClick}
                    disabled={!isActive}
                    className={`
                      w-full py-5 rounded-[1.5rem] font-black uppercase italic flex flex-col items-center justify-center gap-1 shadow-xl active:scale-95 transition-all
                      ${!isActive 
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                        : 'bg-[#25D366] text-white hover:bg-[#20bd5a]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      {!isActive ? (
                        <span className="text-sm">Indisponível</span>
                      ) : isLogged || !isPrivate ? (
                        <>
                          <MessageCircle size={20} />
                          <span className="text-sm">WhatsApp</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink size={20} />
                          <span className="text-sm">Entrar no Grupo</span>
                        </>
                      )}
                    </div>
                    <span className="text-[9px] opacity-80 font-bold">
                      {!isActive ? 'Grupo offline' : isLogged || !isPrivate ? 'Entrar no grupo' : 'Faça login para acessar'}
                    </span>
                  </button>
                </div>

                {/* Informações do Grupo */}
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-5 text-center">Informações do Grupo</p>
                  
                  {/* Administradores */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-3">
                    <p className="text-[8px] font-black text-slate-400 uppercase mb-3">Community Managers</p>
                    <div className="space-y-3">
                      
                      {/* Admin Principal */}
                      {group.group_admin_name && (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
                            <Users size={18} />
                          </div>
                          <p className="text-xs font-bold text-slate-700">{group.group_admin_name}</p>
                        </div>
                      )}
                      
                      {/* Admin do Sistema */}
                      {group.admin_user_id && (
                        <Link 
                          to={group.admin_user_slug ? `/perfil/${group.admin_user_slug}` : '#'}
                          className="flex items-center gap-3 hover:bg-slate-100 -m-1 p-1 rounded-lg transition-colors"
                        >
                          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
                            <Users size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-bold text-slate-700">{group.admin_user_name}</p>
                              {group.admin_user_verified === 1 && (
                                <span className="text-emerald-600">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      )}
                      
                      {/* Outros Administradores */}
                      {otherAdmins.map((admin, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
                            <Users size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700">{admin}</p>
                          </div>
                        </div>
                      ))}
                      
                    </div>
                  </div>
                  
                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Grupos</p>
                      <p className="text-[10px] font-bold text-slate-700 uppercase italic">{group.admin_total_groups || 0} ativo{(group.admin_total_groups || 0) !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                      <p className="text-[8px] font-black text-slate-400 uppercase">Desde</p>
                      <p className="text-[10px] font-bold text-slate-700 uppercase italic">{group.created_at ? new Date(group.created_at).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '') : '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Anúncio Vertical */}
              <AdCard position="sidebar" variant="vertical" />

              {/* Grupos Relacionados na Sidebar */}
              {relatedGroups.length > 0 && (
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                  <h4 className="font-black uppercase text-[10px] text-slate-900 mb-4 flex items-center gap-2 italic">
                    <Users size={14} className="text-blue-600" /> Grupos Relacionados
                  </h4>
                  <div className="space-y-2">
                    {relatedGroups.slice(0, 3).map((g) => (
                      <Link
                        key={g.id}
                        to={`/grupo/${g.id}`}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                      >
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm shrink-0 overflow-hidden">
                          {g.image_url ? (
                            <img src={g.image_url} alt={g.region_name} className="w-full h-full object-cover" />
                          ) : (
                            (g.region_name || 'G').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                            {g.region_name}
                          </p>
                          <p className="text-[9px] text-slate-400">
                            {g.category_name || 'Geral'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main> 

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <Footer />
    </div>
  );
}
