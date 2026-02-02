import React, { useEffect, useState } from 'react';
import { Package, TrendingUp, Users, PlusCircle, ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../../api/api';
import { useNavigate } from 'react-router-dom';

interface Metrics {
  freightsCount: number;
  interestsCount: number;
  visits: number;
}

interface CompanyCommandCenterProps {
  user: any;
  refreshUser: () => Promise<void>;
}

export default function CompanyCommandCenter({ user, refreshUser }: CompanyCommandCenterProps) {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics>({ freightsCount: 0, interestsCount: 0, visits: user?.visits || 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function loadRealData() {
      try {
        setLoading(true);
        // BUSCANDO FRETES REAIS (sua rota: /api/list-my-freights)
        const freightsRes = await api.get('/list-my-freights');
        const freights = freightsRes.data.freights || freightsRes.data.data || [];

        // BUSCANDO INTERESSADOS REAIS (sua rota: /api/list-interests)
        const interestsRes = await api.get('/list-interests');
        const interests = interestsRes.data.interests || interestsRes.data.data || [];

        setMetrics({
          freightsCount: freights.length,
          interestsCount: interests.length,
          visits: user?.visits || 0
        });
      } catch (err) {
        console.error("Erro ao buscar dados reais das rotas de logística/interesses");
      } finally {
        setLoading(false);
      }
    }

    loadRealData();
  }, [user]);

  const handleAction = () => {
    // Se não tem nome da empresa ou documento, abre o QuickProfile
    if (!user.company_name || !user.document || Number(user.is_verified) !== 1) {
      setShowModal(true);
    } else {
      navigate('/dashboard/logistica');
    }
  };

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center text-orange-500">
      <Loader2 className="animate-spin mb-2" />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cruzando dados da API...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
          Console de <span className="text-orange-500">Operações</span>
        </h1>
      </header>

      {/* MÉTRICAS AGREGADAS DAS ROTAS REAIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard icon={<TrendingUp />} label="Acessos Totais" value={metrics.visits} color="blue" />
        <MetricCard icon={<Package />} label="Cargas no Sistema" value={metrics.freightsCount} color="orange" />
        <MetricCard icon={<Users />} label="Leads Gerados" value={metrics.interestsCount} color="slate" />
      </div>

      <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h3 className="text-2xl font-black text-slate-900 uppercase italic">Gerenciar Cargas</h3>
          <p className="text-slate-400 text-sm font-medium mt-1">Você possui {metrics.freightsCount} fretes cadastrados no banco.</p>
        </div>
        <button 
          onClick={handleAction}
          className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-500 transition-all flex items-center gap-3 shadow-xl active:scale-95"
        >
          Acessar Logística <ArrowRight size={20} />
        </button>
      </div>

      {/* QUICK PROFILE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative">
            <ShieldAlert className="text-orange-500 mb-6" size={48} />
            <h2 className="text-2xl font-black text-slate-900 uppercase italic">Perfil Requerido</h2>
            <p className="text-slate-500 mt-4 text-sm font-medium">
              {!user.company_name ? "Complete seu cadastro para publicar." : "Sua conta aguarda aprovação do administrador."}
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <button onClick={() => navigate('/dashboard/profile')} className="bg-orange-500 text-white py-4 rounded-xl font-black uppercase text-xs">Ir para Perfil</button>
              <button onClick={() => setShowModal(false)} className="text-slate-400 font-black uppercase text-[10px] mt-2">Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value, color }: any) {
  const bg = color === 'orange' ? 'bg-orange-500' : color === 'blue' ? 'bg-blue-600' : 'bg-slate-900';
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className={`${bg} w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-white`}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 italic">{label}</p>
      <h3 className="text-4xl font-black text-slate-900 italic">{value}</h3>
    </div>
  );
}