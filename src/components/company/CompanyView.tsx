import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, Users, Package, 
  Loader2, Zap, Trash2, Edit3, 
  Target, DollarSign, UserCircle2, LayoutDashboard, Truck,
  MessageCircle, ShieldCheck
} from 'lucide-react';
import { api } from '../../api';

// Componentes integrados
import CheckoutModal from '../company/CheckoutModal'; 
import WelcomeOnboarding from '../company/WelcomeOnboarding';
import MyProfileEditor from '../../pages/bio/MyProfileEditor';

export default function CompanyView() {
  const navigate = useNavigate();
  
  // Estados de Dados
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'ops' | 'profile' | 'leads'>('ops');
  const [myFreights, setMyFreights] = useState<any[]>([]);
  const [interestedDrivers, setInterestedDrivers] = useState<any[]>([]);
  const [allPlans, setAllPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(false);
  
  // Estados de UI
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedFreightId, setSelectedFreightId] = useState<number | null>(null);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const storedUser = JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}');
      
      if (!storedUser.id) {
        navigate('/login');
        return;
      }
      setUser(storedUser);

      if (storedUser.status === 'approved' || storedUser.role === 'ADMIN') {
        // Adicionamos '/' antes da query para evitar redirecionamento 301 (erro de CORS)
        const [freightsRes, settingsRes] = await Promise.all([
          api.get('/', { 
            params: { 
              endpoint: 'get-user-posts',
              user_id: storedUser.id 
            } 
          }),
          api.get('/', { params: { endpoint: 'get-settings' } })
        ]);
        
        const data = Array.isArray(freightsRes.data) ? freightsRes.data : [];
        setMyFreights(data);
        setAllPlans(settingsRes.data?.plans || []);
      }
    } catch (e) {
      console.error("Erro crítico na carga de dados:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadLeadsData = async () => {
    if (!user?.id) return;
    try {
      setLoadingLeads(true);
      // Correção da sintaxe do GET e adição da barra inicial
      const res = await api.get('/', { 
        params: { 
          endpoint: 'get-interested-drivers',
          user_id: user.id 
        } 
      });
      setInterestedDrivers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Erro ao carregar interessados", e);
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'leads') {
      loadLeadsData();
    }
  }, [activeTab]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Deseja excluir permanentemente este frete?")) return;
    try {
      await api.post('/', { id, user_id: user.id }, { params: { endpoint: 'delete-freight' } });
      setMyFreights(prev => prev.filter((f: any) => f.id !== id));
    } catch (e) { 
      alert("Erro ao excluir."); 
    }
  };

  const formatBRL = (val: any) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);

  const totalValue = myFreights.reduce((acc, curr) => acc + Number(curr.price || 0), 0);
  const totalInterested = myFreights.reduce((acc, curr) => acc + Number(curr.interested_count || 0), 0);
  const featuredCount = myFreights.filter(f => f.is_featured).length;

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 text-slate-400">
      <Loader2 className="animate-spin mb-4 text-orange-500" size={32} />
      <p className="font-black uppercase italic text-[10px] tracking-widest">Sincronizando Banco de Dados...</p>
    </div>
  );

  if (user?.role === 'company' && (!user?.company_name || !user?.cnpj)) {
    return <WelcomeOnboarding user={user} onComplete={(u: any) => { setUser(u); loadInitialData(); }} />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* NAVEGAÇÃO POR ABAS */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-[2rem] w-fit">
        <button 
          onClick={() => setActiveTab('ops')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ops' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <LayoutDashboard size={14} /> Minhas Operações
        </button>
        <button 
          onClick={() => setActiveTab('leads')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'leads' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Users size={14} /> Interessados
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <UserCircle2 size={14} /> Perfil Público
        </button>
      </div>

      {/* CONTEÚDO DA ABA: PERFIL */}
      {activeTab === 'profile' && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <MyProfileEditor user={user} />
        </div>
      )}

      {/* CONTEÚDO DA ABA: INTERESSADOS (LEADS) */}
      {activeTab === 'leads' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingLeads ? (
                <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={40} /></div>
              ) : interestedDrivers.length === 0 ? (
                <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                   <Users size={40} className="mx-auto text-slate-100 mb-4" />
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Ainda não há motoristas interessados.</p>
                </div>
              ) : (
                interestedDrivers.map((driver: any) => (
                  <div key={`${driver.id}-${driver.last_clicked_at}`} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-orange-200 transition-all relative overflow-hidden">
                    
                    {/* Badge de Verificado */}
                    {driver.is_verified === 1 && (
                      <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1.5 rounded-bl-2xl flex items-center gap-1 shadow-sm">
                        <ShieldCheck size={12} />
                        <span className="text-[8px] font-black uppercase">Verificado</span>
                      </div>
                    )}

                    {/* Badge de Quantidade de Cliques (Novo!) */}
                    {driver.total_clicks > 1 && (
                      <div className="absolute top-12 right-0 bg-orange-100 text-orange-600 px-2 py-1 rounded-l-lg border-l border-y border-orange-200 flex items-center gap-1">
                        <Zap size={10} fill="currentColor" />
                        <span className="text-[9px] font-black">{driver.total_clicks}x Cliques</span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border-2 border-slate-50">
                        <img 
                          src={driver.photo || `https://ui-avatars.com/api/?name=${driver.name}&background=random`} 
                          className="w-full h-full object-cover" 
                          alt={driver.name}
                        />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 uppercase italic text-sm truncate max-w-[150px]">{driver.name}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          {driver.total_clicks > 3 ? 'Muito Interessado' : 'Motorista Autônomo'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl mb-6">
                      <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Carga de Interesse:</p>
                      <p className="text-[10px] font-black text-slate-700 uppercase italic mb-2">{driver.freight_origin} → {driver.freight_destination}</p>
                      
                      {/* Data do Último Clique */}
                      <div className="flex items-center gap-1 text-slate-400">
                        <Target size={10} />
                        <span className="text-[8px] font-bold uppercase">Último clique: {new Date(driver.last_clicked_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    <a 
                      href={`https://wa.me/55${driver.phone?.replace(/\D/g,'')}?text=Olá ${driver.name}, vi seu interesse no frete de ${driver.freight_origin} para ${driver.freight_destination} no Chama Frete.`}
                      target="_blank" rel="noreferrer"
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 transition-all shadow-lg"
                    >
                      <MessageCircle size={14} /> Chamar no WhatsApp
                    </a>
                  </div>
                ))
              )}
           </div>
        </div>
      )}

      {/* CONTEÚDO DA ABA: MINHAS OPERAÇÕES (CARGAS ATIVAS) */}
      {activeTab === 'ops' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard label="Fretes Ativos" value={myFreights.length} icon={<Package />} color="blue" />
            <StatCard label="Cargas Impulsionadas" value={featuredCount} icon={<Zap />} color="orange" />
            <StatCard label="R$ Fretes em Aberto" value={formatBRL(totalValue)} icon={<DollarSign />} color="emerald" isSmall />
            <StatCard label="Contatos Interessados" value={totalInterested} icon={<Users />} color="purple" />
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/30">
              <h3 className="font-black uppercase italic text-slate-800 flex items-center gap-2 text-sm tracking-tight">
                <Target size={20} className="text-orange-500" /> Fluxo de Cargas Ativas
              </h3>
              <button 
                onClick={() => navigate('/novo-frete')}
                className="bg-slate-900 hover:bg-orange-500 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] flex items-center gap-2 transition-all shadow-lg"
              >
                <PlusCircle size={16} /> Nova Publicação
              </button>
            </div>
            
            <div className="divide-y divide-slate-50">
              {myFreights.length === 0 ? (
                <div className="py-24 text-center">
                  <Truck size={40} className="mx-auto text-slate-100 mb-4" />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Nenhum frete cadastrado no momento.</p>
                </div>
              ) : (
                myFreights.map((f: any) => (
                  <div key={f.id} className="p-6 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${f.is_featured ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-slate-100 text-slate-400'}`}>
                        {f.is_featured ? <Zap size={22} fill="currentColor" /> : <Truck size={22} />}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 uppercase italic text-sm">{f.origin} <span className="text-orange-500 mx-1">→</span> {f.destination}</p>
                        <div className="flex gap-3 mt-1">
                          <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">{f.product}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{f.weight} TON • {formatBRL(f.price)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!f.is_featured && (
                        <button 
                          onClick={() => { setSelectedFreightId(f.id); setShowCheckout(true); }}
                          className="bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase transition-all"
                        >
                          Impulsionar
                        </button>
                      )}
                      <button 
                        onClick={() => navigate('/novo-frete', { state: { editData: f } })}
                        className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(f.id)}
                        className="p-3 bg-slate-50 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showCheckout && selectedFreightId && (
        <CheckoutModal 
          freightId={selectedFreightId} 
          plans={allPlans} 
          onClose={() => setShowCheckout(false)} 
          onSuccess={() => { setShowCheckout(false); loadInitialData(); }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color, isSmall }: any) {
  const themes: any = {
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    emerald: "bg-emerald-500",
    purple: "bg-purple-500"
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-5 shadow-sm group hover:scale-[1.02] transition-transform">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${themes[color]}`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <div>
        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
        <p className={`${isSmall ? 'text-lg' : 'text-2xl'} font-black text-slate-900 leading-none mt-1`}>
          {value}
        </p>
      </div>
    </div>
  );
}