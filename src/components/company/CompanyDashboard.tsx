import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, Users, Package, Clock, CheckCircle2, 
  AlertCircle, Loader2, Zap, Trash2, Edit3, 
  Target, DollarSign, UserCircle2, LayoutDashboard 
} from 'lucide-react';
import { api } from '../../api/api';
import CheckoutModal from './CheckoutModal'; 
import MyProfileEditor from '../../pages/bio/MyProfileEditor'; // Certifique-se que o caminho está correto

export default function CompanyDashboard({ user }: any) {
  const navigate = useNavigate();
  
  // --- ESTADO PARA ALTERNAR ENTRE OPERAÇÕES E PERFIL ---
  const [activeTab, setActiveTab] = useState<'ops' | 'profile'>('ops');
  
  const [myFreights, setMyFreights] = useState<any[]>([]);
  const [allPlans, setAllPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedFreightId, setSelectedFreightId] = useState<number | null>(null);

  const fetchMyData = async () => {
    try {
      setLoading(true);
      const [freightsRes, settingsRes] = await Promise.all([
        api.get('', { 
          params: { endpoint: 'list-my-freights', user_id: user.id } 
        }),
        api.get('', { params: { endpoint: 'get-settings' } })
      ]);
      setMyFreights(freightsRes.data || []);
      setAllPlans(settingsRes.data?.plans || []);
    } catch (e) {
      console.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user.status === 'approved') fetchMyData();
  }, [user]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Deseja realmente excluir este anúncio permanentemente?")) return;
    try {
      await api.post('', { id, user_id: user.id }, { params: { endpoint: 'delete-freight' } });
      setMyFreights(prev => prev.filter((f: any) => f.id !== id));
    } catch (e) {
      alert("Erro ao excluir frete.");
    }
  };

  const openCheckout = (id: number) => {
    setSelectedFreightId(id);
    setShowCheckout(true);
  };

  const formatBRL = (val: any) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0);

  // --- VIEW: AGUARDANDO APROVAÇÃO ---
  if (user.status === 'pending') {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-in zoom-in duration-500">
        <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-amber-100 text-center max-w-lg">
          <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Clock size={48} />
          </div>
          <h2 className="text-3xl font-black uppercase italic text-slate-900 leading-tight">Análise de Segurança</h2>
          <p className="text-slate-500 font-bold text-sm uppercase mt-4 leading-relaxed">
            Olá <span className="text-orange-600">{user.company_name || user.name}</span>! 
            Seu perfil está sendo revisado. Em até 24h sua conta será liberada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER COM SELETOR DE ABAS */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-3xl font-black uppercase italic text-slate-900 leading-none">
            {activeTab === 'ops' ? 'Painel de Operações' : 'Configurações de Vitrine'}
          </h1>
          
          <div className="flex items-center gap-4 mt-4">
            <button 
              onClick={() => setActiveTab('ops')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ops' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              <LayoutDashboard size={14} /> Gestão de Cargas
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
            >
              <UserCircle2 size={14} /> Meu Perfil Público
            </button>
          </div>
        </div>
        
        {activeTab === 'ops' && (
          <button 
            onClick={() => navigate('/novo-frete')}
            className="bg-slate-900 hover:bg-orange-500 text-white px-8 py-4 rounded-2xl font-black uppercase italic flex items-center gap-3 shadow-xl transition-all active:scale-95 group"
          >
            <PlusCircle size={20} className="group-hover:rotate-90 transition-transform" /> 
            Publicar Nova Carga
          </button>
        )}
      </header>

      {/* CONTEÚDO DINÂMICO BASEADO NA ABA ATIVA */}
      {activeTab === 'profile' ? (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <MyProfileEditor user={user} />
        </div>
      ) : (
        <>
          {/* STATS RÁPIDOS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="Cargas Ativas" value={myFreights.length} icon={<Package />} color="blue" />
            <StatCard label="Destaques" value={myFreights.filter(f => f.is_featured).length} icon={<Zap />} color="orange" />
            <StatCard 
              label="Total em Fretes" 
              value={formatBRL(myFreights.reduce((acc, curr) => acc + Number(curr.price), 0))} 
              icon={<DollarSign />} 
              color="emerald" 
              isCurrency
            />
            <StatCard label="Interessados" value="24" icon={<Users />} color="purple" />
          </div>

          {/* PAINEL DE GESTÃO (LISTA DE FRETES) */}
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-black uppercase italic text-slate-800 flex items-center gap-2 text-sm">
                <Target size={20} className="text-orange-500" /> Minhas Publicações
              </h3>
            </div>
            
            <div className="p-0">
              {loading ? (
                 <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-slate-200" size={40} /></div>
              ) : myFreights.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                  <AlertCircle size={48} className="mx-auto text-slate-100" />
                  <p className="text-xs font-bold text-slate-400 uppercase italic">Nenhuma carga encontrada.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {myFreights.map((f: any) => (
                    <div key={f.id} className="p-6 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row items-center justify-between gap-6 group">
                      <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${f.is_featured ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          {f.is_featured ? <Zap size={22} fill="currentColor" /> : <Package size={22} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-black text-slate-800 uppercase italic text-sm">{f.origin} <span className="text-orange-500">→</span> {f.destination}</p>
                            {f.is_featured && <span className="bg-orange-100 text-orange-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">Destaque</span>}
                          </div>
                          <div className="flex flex-wrap gap-3 text-[10px] font-bold text-slate-400 uppercase">
                            <span className="text-blue-600 bg-blue-50 px-2 rounded">{f.product}</span>
                            <span>{f.weight} Ton</span>
                            <span className="flex items-center gap-1"><DollarSign size={10}/> {formatBRL(f.price)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                        {!f.is_featured ? (
                          <button onClick={() => openCheckout(f.id)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-orange-500 transition-all">
                            <Zap size={12} fill="currentColor" /> Impulsionar
                          </button>
                        ) : (
                          <div className="px-5 py-2.5 rounded-xl border border-emerald-100 text-emerald-500 bg-emerald-50 font-black text-[10px] uppercase flex items-center gap-2">
                            <CheckCircle2 size={12} /> Ativo
                          </div>
                        )}
                        <button onClick={() => navigate('/novo-frete', { state: { editData: f } })} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-500 transition-all shadow-sm">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDelete(f.id)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-red-500 transition-all shadow-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* MODAL DE CHECKOUT */}
      {showCheckout && selectedFreightId && (
        <CheckoutModal 
          freightId={selectedFreightId} 
          plans={allPlans} 
          onClose={() => { setShowCheckout(false); setSelectedFreightId(null); }} 
          onSuccess={() => { setShowCheckout(false); setSelectedFreightId(null); fetchMyData(); }}
        />
      )}
    </div>
  );
}

// COMPONENTE DE CARD AUXILIAR
function StatCard({ label, value, icon, color, isCurrency }: any) {
  const colors: any = {
    blue: "bg-blue-500 shadow-blue-500/20",
    orange: "bg-orange-500 shadow-orange-500/20",
    emerald: "bg-emerald-500 shadow-emerald-500/20",
    purple: "bg-purple-500 shadow-purple-500/20"
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-6 group hover:border-orange-200 transition-all cursor-default shadow-sm">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${colors[color]} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
        <p className={`${isCurrency ? 'text-xl' : 'text-2xl'} font-black text-slate-900`}>{value}</p>
      </div>
    </div>
  );
}