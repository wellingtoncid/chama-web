import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  TrendingUp, 
  Package, 
  Clock,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Building2,
  User
} from 'lucide-react';
import { api } from '../api/api';

// Sub-componentes
import DriverView from './driver/DriverView';
import CompanyCommandCenter from './company/CompanyCommandCenter';
import QuickProfileModal from './profile/QuickProfileModal'; 

interface DashboardHomeProps {
  user: any;
  refreshUser: (data: any) => void;
}

export default function DashboardHome({ user, refreshUser }: DashboardHomeProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showQuickProfile, setShowQuickProfile] = useState(false);

  // Normalização de flags (Sincronizado com o seu banco SQL)
  const userRole = user?.role?.toLowerCase() || 'driver';
  const isSubscriber = Number(user?.is_subscriber) === 1;
  const isVerified = Number(user?.is_verified) === 1;
  const isCompany = ['company', 'shipper', 'transportadora'].includes(userRole);
  
  const displayName = isCompany 
    ? (user.company_name || 'Configurar Empresa') 
    : `Olá, ${user.name?.split(' ')[0]}`;

  useEffect(() => {
    const initDashboard = async () => {
      try {
        setLoading(true);
        // Usamos o get-my-profile que já está mapeado no seu backend e traz os stats
        const response = await api.get('/get-my-profile');
        if (response.data.success) {
          refreshUser(response.data.user);
        }
      } catch (err) {
        console.error("Erro ao sincronizar terminal:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user?.id) initDashboard();
  }, [user?.id]);

  const handleActionWithValidation = (targetPath: string) => {
    // Critério: Empresa precisa de company_name, Motorista de name. Ambos precisam de document.
    const hasRequiredDocs = !!user.document;
    const hasName = isCompany ? !!user.company_name : !!user.name;
    
    if (!hasRequiredDocs || !hasName) {
      setShowQuickProfile(true);
    } else {
      navigate(targetPath);
    }
  };

  if (loading) {
    return (
      <div className="h-96 w-full flex flex-col items-center justify-center">
        <div className="relative">
          <Loader2 className="animate-spin text-orange-500" size={48} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
          </div>
        </div>
        <p className="mt-6 text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] animate-pulse">
          Sincronizando Terminal...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {showQuickProfile && (
        <QuickProfileModal 
          user={user} 
          onClose={() => setShowQuickProfile(false)} 
          onSuccess={(updatedData) => {
            refreshUser(updatedData);
            setShowQuickProfile(false);
          }} 
        />
      )}

      {/* HEADER DE COMANDO */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-slate-900 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-900/20">
              {isCompany ? <Building2 size={12}/> : <User size={12}/>}
              {isCompany ? 'Eixo Corporativo' : 'Eixo Operacional'}
            </span>
            
            {isVerified ? (
              <span className="bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 border border-blue-200">
                <ShieldCheck size={12} /> Verificado
              </span>
            ) : (
              <button 
                onClick={() => setShowQuickProfile(true)}
                className="bg-amber-100 text-amber-600 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 border border-amber-200 hover:bg-amber-200 transition-colors"
              >
                <AlertCircle size={12} /> Ativação Pendente
              </button>
            )}
          </div>
          
          <div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 uppercase italic leading-tight tracking-tighter">
              {displayName}
            </h1>
            {isCompany && user.name && (
              <p className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1 italic">
                Operador: {user.name}
              </p>
            )}
          </div>
        </div>

        {isCompany && (
          <button 
            onClick={() => handleActionWithValidation('/logistica/novo')} 
            className="w-full lg:w-auto bg-orange-500 text-white px-10 py-6 rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-slate-900 transition-all shadow-xl shadow-orange-500/30 group active:scale-95"
          >
            <PlusCircle size={24} className="group-hover:rotate-90 transition-transform duration-300" /> 
            PUBLICAR FRETE
          </button>
        )}
      </header>

      {/* PAINEL DE MÉTRICAS REAIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          icon={<TrendingUp />} 
          label={isCompany ? "Cliques Recebidos" : "Buscas pelo Perfil"} 
          value={user?.visits || 0}
          color="blue"
        />
        <MetricCard 
          icon={<Package />} 
          label={isCompany ? "Cargas Ativas" : "Minhas Candidaturas"} 
          value={user?.total_freights || user?.total_interests || 0}
          color="orange"
        />
        
        {/* CARD DE STATUS DE ASSINATURA */}
        <div className={`p-8 rounded-[2.5rem] flex flex-col justify-between relative overflow-hidden transition-all group border ${isSubscriber ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white text-slate-900 border-slate-100 shadow-sm'}`}>
          <div className="z-10">
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isSubscriber ? 'text-emerald-200' : 'text-slate-400'}`}>
               Status da Conta
            </p>
            <h3 className="text-2xl font-black uppercase italic leading-none">
              {isSubscriber ? 'Assinante PRO' : 'Membro Lite'}
            </h3>
          </div>
          
          <button 
            onClick={() => navigate('/profile')}
            className={`z-10 mt-6 flex items-center gap-2 text-[10px] font-black uppercase w-fit px-6 py-3 rounded-2xl transition-all ${isSubscriber ? 'bg-emerald-500 hover:bg-white hover:text-emerald-600' : 'bg-slate-900 text-white hover:bg-orange-500 shadow-lg'}`}
          >
            {isSubscriber ? 'Ver Benefícios' : 'Fazer Upgrade'} <ArrowRight size={14} />
          </button>

          <Clock className={`absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700`} />
        </div>
      </div>

      {/* ÁREA DE TRABALHO DINÂMICA */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-4">
          <div className="h-8 w-2 bg-orange-500 rounded-full"></div>
          <h2 className="text-2xl font-black text-slate-900 uppercase italic">
            {isCompany ? 'Monitoramento de Logística' : 'Cargas para Você'}
          </h2>
        </div>

        <div className="bg-slate-50/50 rounded-[3.5rem] p-4 min-h-[500px] border border-slate-100">
          {isCompany ? (
            <CompanyCommandCenter user={user} />
          ) : (
            <DriverView />
          )}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ icon, label, value, color }: any) {
  const colors = {
    blue: "bg-blue-500 text-white",
    orange: "bg-orange-500 text-white"
  };
  
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-orange-200 transition-all duration-500 group">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:rounded-[1.5rem] group-hover:rotate-3 shadow-lg ${colors[color as keyof typeof colors]}`}>
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] mb-1">{label}</p>
      <h3 className="text-5xl font-black text-slate-900 tracking-tighter italic">
        {Number(value).toLocaleString()}
      </h3>
    </div>
  );
}