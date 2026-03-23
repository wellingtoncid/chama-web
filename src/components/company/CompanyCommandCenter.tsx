import React, { useEffect, useState } from 'react';
import { 
  Plus, Loader2, ShoppingBag, Truck, 
  FileSearch, Building2, Star, Megaphone, 
  CheckCircle, Lock, AlertCircle, CreditCard
} from 'lucide-react';
import { api } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

interface Module {
  key: string;
  name: string;
  description: string;
  is_active: boolean;
  is_allowed: boolean;
}

interface ModuleCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  moduleKey: string;
  modules: Record<string, Module>;
  userRole: string;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

function ModuleCard({ title, desc, icon, moduleKey, modules, userRole, onActivate, onDeactivate }: ModuleCardProps) {
  const module = modules[moduleKey];
  const isAllowed = module?.is_allowed ?? false;
  const isActive = module?.is_active ?? false;
  const isCompany = userRole === 'company';

  const handleClick = () => {
    if (!isAllowed) {
      Swal.fire({
        title: '<span class="italic font-black">MÓDULO NÃO DISPONÍVEL</span>',
        text: 'Este módulo não está disponível no seu plano atual.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'VER PLANOS',
        confirmButtonColor: '#f97316',
        cancelButtonText: 'FECHAR',
        customClass: { popup: 'rounded-[2rem]', confirmButton: 'rounded-xl font-black uppercase' }
      }).then((res) => {
        if (res.isConfirmed) window.location.href = '/dashboard/planos';
      });
      return;
    }

    if (isActive) {
      if (onDeactivate) {
        Swal.fire({
          title: '<span class="italic font-black">DESATIVAR MÓDULO?</span>',
          text: `Ao desativar "${title}", você perderá acesso a este recurso.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'DESATIVAR',
          confirmButtonColor: '#ef4444',
          cancelButtonText: 'MANTER ATIVO',
          customClass: { popup: 'rounded-[2rem]', confirmButton: 'rounded-xl font-black uppercase' }
        }).then((res) => {
          if (res.isConfirmed) onDeactivate();
        });
      }
    } else {
      if (onActivate) onActivate();
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`p-6 rounded-[2rem] border-2 flex flex-col justify-between h-56 transition-all relative group cursor-pointer ${
        !isAllowed
          ? 'bg-slate-50 border-dashed border-slate-200 opacity-70'
          : isActive 
            ? 'bg-white border-emerald-200 hover:border-emerald-400 hover:shadow-lg' 
            : 'bg-white border-dashed border-slate-200 hover:border-orange-300 hover:bg-orange-50/30'
      }`}
    >
      {!isAllowed && (
        <div className="absolute top-4 right-4">
          <Lock size={16} className="text-slate-300" />
        </div>
      )}

      <div className="flex justify-between items-start">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
          !isAllowed
            ? 'bg-slate-100 text-slate-400'
            : isActive 
              ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' 
              : 'bg-slate-100 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-600'
        }`}>
          {React.cloneElement(icon as React.ReactElement, { size: 24 })}
        </div>
        
        {isAllowed && (
          <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase italic ${
            isActive 
              ? 'bg-emerald-100 text-emerald-600' 
              : 'bg-orange-100 text-orange-600'
          }`}>
            {isActive ? 'Ativo' : 'Inativo'}
          </span>
        )}
      </div>

      <div>
        <h4 className="text-base font-black uppercase italic text-slate-900 leading-tight">{title}</h4>
        <p className="text-[10px] font-bold text-slate-400 leading-tight mt-1 uppercase italic">{desc}</p>
      </div>

      <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase italic ${
        !isAllowed ? 'text-slate-400' : isActive ? 'text-emerald-500' : 'text-orange-500'
      }`}>
        {!isAllowed ? (
          <>
            <CreditCard size={10} />
            <span>Upgrade de Plano</span>
          </>
        ) : isActive ? (
          <>
            <span>Clique para gerenciar</span>
            <Plus size={10} className="rotate-45" />
          </>
        ) : (
          <>
            <span>Ativar</span>
            <Plus size={10} />
          </>
        )}
      </div>
    </div>
  );
}

export default function CompanyCommandCenter({ user }: any) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [modules, setModules] = useState<Record<string, Module>>({});
  const [updating, setUpdating] = useState<string | null>(null);

  const userRole = String(user?.role || '').toLowerCase();
  const isCompany = userRole === 'company';
  const isDriver = userRole === 'driver';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [modulesRes, statsRes] = await Promise.all([
        api.get('/user/modules'),
        api.get('/company/summary').catch(() => ({ data: { success: false } }))
      ]);

      if (modulesRes.data?.success) {
        const modulesMap: Record<string, Module> = {};
        modulesRes.data.data.modules.forEach((m: Module) => {
          modulesMap[m.key] = m;
        });
        setModules(modulesMap);
      }

      if (statsRes.data?.success) {
        setStats(statsRes.data.data);
      }
    } catch (e) {
      console.error('Erro ao carregar dados:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = async (moduleKey: string, activate: boolean) => {
    try {
      setUpdating(moduleKey);
      await api.post('/user/modules', { 
        module_key: moduleKey, 
        action: activate ? 'activate' : 'deactivate' 
      });
      
      setModules(prev => ({
        ...prev,
        [moduleKey]: { ...prev[moduleKey], is_active: activate }
      }));

      Swal.fire({
        title: '<span class="italic font-black">SUCESSO</span>',
        text: `Módulo ${activate ? 'ativado' : 'desativado'} com sucesso!`,
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#22c55e',
        customClass: { popup: 'rounded-[2rem]', confirmButton: 'rounded-xl font-black uppercase' }
      });
    } catch (e) {
      console.error('Erro ao.toggle módulo:', e);
      Swal.fire({
        title: '<span class="italic font-black">ERRO</span>',
        text: 'Não foi possível atualizar o módulo. Tente novamente.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444',
        customClass: { popup: 'rounded-[2rem]', confirmButton: 'rounded-xl font-black uppercase' }
      });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return (
    <div className="h-96 flex items-center justify-center text-orange-500">
      <Loader2 className="animate-spin" />
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* HEADER */}
      <header className="px-2">
        <div className="flex items-center gap-2 text-orange-500 mb-1">
          <Building2 size={16} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">
            {user.corporate_name || (isDriver ? 'Motorista' : 'Empresa')}
          </span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
          {user.trade_name || user.corporate_name || user.name}
        </h1>
        <p className="text-slate-500 font-bold text-sm mt-2 italic">
          Olá, <span className="text-orange-500">{user.name}</span>
        </p>
      </header>

      {/* MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 italic font-black">
            {user.rating || '5.0'}
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400">Reputação Geral</p>
            <div className="flex text-orange-500">
              {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400">Status do Registro</p>
            <p className="text-xs font-black uppercase italic text-slate-900">
              {user.status === 'active' ? 'Ativo e Verificado' : 'Em Análise'}
            </p>
          </div>
        </div>
      </div>

      {/* MÓDULOS DA CONTA */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black uppercase italic text-slate-900">Módulos da Sua Conta</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase italic">
              {isDriver 
                ? 'Gerencie os módulos disponíveis para você'
                : 'Ative ou desative os módulos da sua empresa'}
            </p>
          </div>
          {Object.values(modules).filter(m => m.is_active).length > 0 && (
            <div className="text-[10px] font-black text-emerald-600 uppercase italic">
              {Object.values(modules).filter(m => m.is_active).length} módulo(s) ativo(s)
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* FREIGHTS - Obrigatório para empresas e motoristas */}
          <ModuleCard 
            title="Logística"
            desc={isCompany ? "Publique cargas e encontre motoristas." : "Veja cargas disponíveis e matches."}
            icon={<Truck />}
            moduleKey="freights"
            modules={modules}
            userRole={userRole}
            onDeactivate={undefined}
          />

          {/* MARKETPLACE - Para empresas e motoristas */}
          <ModuleCard 
            title="Marketplace"
            desc={isCompany ? "Venda de produtos e peças." : "Compre produtos e peças."}
            icon={<ShoppingBag />}
            moduleKey="marketplace"
            modules={modules}
            userRole={userRole}
            onActivate={!modules.marketplace?.is_active ? () => toggleModule('marketplace', true) : undefined}
            onDeactivate={isCompany ? () => toggleModule('marketplace', false) : undefined}
          />

          {/* Só para empresas */}
          {isCompany && (
            <>
              {/* QUOTES */}
              <ModuleCard 
                title="Cotações"
                desc="Solicite e receba cotações de fretes."
                icon={<FileSearch />}
                moduleKey="quotes"
                modules={modules}
                userRole={userRole}
                onActivate={!modules.quotes?.is_active ? () => toggleModule('quotes', true) : undefined}
                onDeactivate={() => toggleModule('quotes', false)}
              />

              {/* ADVERTISER */}
              <ModuleCard 
                title="Publicidade"
                desc="Destaque sua empresa e anúncios."
                icon={<Megaphone />}
                moduleKey="advertiser"
                modules={modules}
                userRole={userRole}
                onActivate={!modules.advertiser?.is_active ? () => toggleModule('advertiser', true) : undefined}
                onDeactivate={() => toggleModule('advertiser', false)}
              />
            </>
          )}
        </div>

        {/* AVISO PARA MOTORISTAS */}
        {isDriver && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-amber-800 uppercase italic">
                Módulo Logística
              </p>
              <p className="text-[10px] font-bold text-amber-600 mt-1">
                O módulo de logística está ativo para visualização de cargas e contato com empresas. 
                A publicação de cargas é exclusiva para contas empresariais.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ATIVIDADE RECENTE */}
      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-8 italic">
          Últimos Registros da Conta
        </h3>
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
            <p className="text-center text-[10px] font-black text-slate-300 uppercase italic py-4">
              Sem atividade recente registrada.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
