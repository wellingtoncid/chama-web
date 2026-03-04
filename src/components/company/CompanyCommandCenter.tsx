import React, { useEffect, useState } from 'react';
import { 
  Plus, Loader2, ShoppingBag, Truck, 
  FileSearch, Building2, Star, Megaphone, CheckCircle, Lock 
} from 'lucide-react';
import { api } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function CompanyCommandCenter({ user }: any) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  // FUNÇÃO DE CHECAGEM REAL (Baseada na tabela account_features)
  const getModuleStatus = (featureKey: string) => {
    // Admin sempre tem acesso total
    if (user.role === 'ADMIN') return 'active';
    
    // Verifica se a chave existe no array de features que o backend deve injetar no user
    const hasFeature = user.account_features?.includes(featureKey);
    
    if (featureKey === 'b2b') return 'soon';
    return hasFeature ? 'active' : 'locked';
  };

  const handleAction = (featureKey: string, path: string) => {
    const status = getModuleStatus(featureKey);
    
    if (status === 'active') {
      navigate(path);
    } else if (status === 'locked') {
      Swal.fire({
        title: '<span class="italic font-black">MÓDULO NÃO CONTRATADO</span>',
        text: 'Sua conta não possui acesso a este recurso. Deseja ver os planos de ativação?',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'VER PLANOS',
        confirmButtonColor: '#f97316',
        customClass: { popup: 'rounded-[2rem]', confirmButton: 'rounded-xl font-black uppercase' }
      }).then((res) => {
        if (res.isConfirmed) navigate('/dashboard/plans');
      });
    }
  };

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        // Busca métricas globais e logs de atividade
        const res = await api.get('/company/summary');
        if (res.data?.success) setStats(res.data.data);
      } catch (e) {
        console.error("Erro ao carregar sumário:", e);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return (
    <div className="h-96 flex items-center justify-center text-orange-500">
      <Loader2 className="animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER LIMPO */}
      <header className="px-2">
        <div className="flex items-center gap-2 text-orange-500 mb-1">
          <Building2 size={16} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">
            {user.corporate_name || 'Empresa'}
          </span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
          {user.trade_name || user.corporate_name}
        </h1>
        <p className="text-slate-500 font-bold text-sm mt-2 italic">
          Olá, <span className="text-orange-500">{user.name}</span>
        </p>
      </header>

      {/* MÉTRICAS GLOBAIS (Apenas o que importa para a conta) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 italic font-black">
            {user.rating || '5.0'}
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400">Reputação Geral</p>
            <div className="flex text-orange-500"><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /><Star size={10} fill="currentColor" /></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400">Status do Registro</p>
            <p className="text-xs font-black uppercase italic text-slate-900">{user.status === 'active' ? 'Ativo e Verificado' : 'Em Análise'}</p>
          </div>
        </div>
      </div>

      {/* GRID DE MÓDULOS PADRONIZADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ModuleCard 
          title="Marketplace" 
          desc="Gestão de anúncios de produtos e peças."
          icon={<ShoppingBag />}
          status={getModuleStatus('marketplace')}
          onClick={() => handleAction('marketplace', '/dashboard/marketplace')}
        />

        <ModuleCard 
          title="Logística" 
          desc="Gestão de fretes e publicações de carga."
          icon={<Truck />}
          status={getModuleStatus('logistica')}
          onClick={() => handleAction('logistica', '/dashboard/logistica')}
        />

        <ModuleCard 
          title="Publicidade" 
          desc="Destaques, banners e impulsionamento."
          icon={<Megaphone />}
          status={getModuleStatus('ads')}
          onClick={() => handleAction('ads', '/dashboard/ads')}
        />

        <ModuleCard 
          title="B2B Quotes" 
          desc="Solicitações de cotações estruturadas."
          icon={<FileSearch />}
          status={getModuleStatus('b2b')}
          onClick={() => {}} 
        />
      </div>

      {/* ATIVIDADE RECENTE */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-8 italic">Últimos Registros da Conta</h3>
        <div className="space-y-4">
          {stats?.recent_activity?.length > 0 ? (
            stats.recent_activity.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-slate-50 last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                <p className="text-[11px] font-bold text-slate-600">{item.message}</p>
                <span className="text-[9px] font-black text-slate-300 uppercase ml-auto">{item.time}</span>
              </div>
            ))
          ) : (
            <p className="text-center text-[10px] font-black text-slate-300 uppercase italic py-4">Sem atividade recente registrada.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* COMPONENTE DE CARD ÚNICO */
function ModuleCard({ title, desc, icon, status, onClick }: any) {
  const isActive = status === 'active';
  const isSoon = status === 'soon';

  return (
    <div 
      onClick={onClick}
      className={`p-8 rounded-[2.5rem] border-2 flex flex-col justify-between h-64 transition-all relative group ${
        isSoon ? 'bg-slate-50 border-transparent cursor-default opacity-60' :
        isActive ? 'bg-white border-slate-50 hover:border-orange-500 cursor-pointer hover:shadow-xl' :
        'bg-white border-dashed border-slate-200 cursor-pointer hover:bg-slate-50'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
          isSoon ? 'bg-slate-200 text-slate-400' :
          isActive ? 'bg-slate-900 text-white group-hover:bg-orange-500' : 'bg-slate-100 text-slate-400'
        }`}>
          {React.cloneElement(icon, { size: 28 })}
        </div>
        
        <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase italic ${
          isSoon ? 'bg-blue-100 text-blue-600' :
          isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
        }`}>
          {isSoon ? 'Em Breve' : isActive ? 'Habilitado' : 'Bloqueado'}
        </span>
      </div>

      <div>
        <h4 className="text-lg font-black uppercase italic text-slate-900 leading-tight">{title}</h4>
        <p className="text-[10px] font-bold text-slate-400 leading-tight mt-1 uppercase italic">{desc}</p>
      </div>

      {!isSoon && (
        <div className={`flex items-center gap-2 text-[9px] font-black uppercase italic ${isActive ? 'text-orange-500' : 'text-slate-400'}`}>
          {isActive ? 'Acessar Agora' : 'Ativar Módulo'}
          <Plus size={10} className={isActive ? 'rotate-45' : ''} />
        </div>
      )}
      
      {!isActive && !isSoon && (
        <div className="absolute top-4 right-4">
          <Lock size={12} className="text-slate-300" />
        </div>
      )}
    </div>
  );
}