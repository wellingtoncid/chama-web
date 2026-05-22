import { ArrowLeft, Megaphone, Crown, Star, Heart, Check, Zap, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlans } from '../../../context/PlansContext';
import DashboardShell from '../../../components/layout/DashboardShell';
import { Button } from '../../../components/ui/Button';
import { AD_POSITION_LABEL } from '../../../constants/adPositions';

const TIER_CONFIG: Record<string, { icon: React.ReactNode; bgColor: string; borderColor: string; badgeColor: string; label: string }> = {
  sponsor_master: {
    icon: <Crown size={20} className="text-yellow-500" />,
    bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/20',
    borderColor: 'border-yellow-300 dark:border-yellow-600',
    badgeColor: 'bg-yellow-500',
    label: 'Oferecimento Master',
  },
  maintainer_premium: {
    icon: <Star size={20} className="text-blue-500" />,
    bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20',
    borderColor: 'border-blue-300 dark:border-blue-600',
    badgeColor: 'bg-blue-500',
    label: 'Mantenedor Premium',
  },
  supporter_connect: {
    icon: <Heart size={20} className="text-rose-500" />,
    bgColor: 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20',
    borderColor: 'border-rose-300 dark:border-rose-600',
    badgeColor: 'bg-rose-500',
    label: 'Apoiador Connect',
  },
};

const parsePositions = (plan: any): string[] => {
  if (plan.features?.positions && Array.isArray(plan.features.positions)) {
    return plan.features.positions;
  }
  return [];
};

export default function AdvertiserModule() {
  const navigate = useNavigate();
  const {
    purchasing, getSubscriptionPlans, getActivePlanIdForModule,
    handlePlanSelect,
  } = usePlans();

  const subscriptionPlans = getSubscriptionPlans('advertising');
  const currentPlanId = getActivePlanIdForModule('advertiser');
  const hasActivePlan = !!currentPlanId;

  const sortedPlans = [...subscriptionPlans].sort((a: any, b: any) => {
    const order: Record<string, number> = { sponsor_master: 0, maintainer_premium: 1, supporter_connect: 2 };
    return (order[a.advertiser_tier] ?? 99) - (order[b.advertiser_tier] ?? 99);
  });

  return (
    <DashboardShell
      title="Publicidade"
      description="Escolha seu plano e destaque sua empresa"
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/dashboard/planos/advertiser/avulso')}>
            <Zap size={16} /> Posições Avulsas
          </Button>
          <Button variant="ghost" onClick={() => navigate('/dashboard/planos')}>
            <ArrowLeft size={16} /> Voltar
          </Button>
        </div>
      }
    >
      {/* Status do plano ativo */}
      {hasActivePlan && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Megaphone size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-black uppercase italic text-lg text-emerald-800 dark:text-emerald-300">Publicidade Ativa</h3>
              <CheckCircle size={16} className="text-emerald-500" />
            </div>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">Seus anúncios estão sendo exibidos nas posições do seu plano</p>
          </div>
        </div>
      )}

      {!hasActivePlan && (
        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
            <Megaphone size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-black uppercase italic text-lg text-slate-500">Nenhum plano ativo</h3>
            <p className="text-sm text-slate-400">Assine um plano abaixo para começar a anunciar</p>
          </div>
        </div>
      )}

      {/* Planos de Publicidade */}
      {sortedPlans.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-orange-500 rounded-full" />
            <div>
              <h2 className="font-black text-lg text-slate-900 dark:text-slate-100">Planos de Publicidade</h2>
              <p className="text-xs text-slate-500">Assine um plano e anuncie em múltiplas posições</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {sortedPlans.map((plan: any) => {
              const isCurrentPlan = currentPlanId === plan.id;
              const tierKey = plan.advertiser_tier as string;
              const tier = tierKey && TIER_CONFIG[tierKey] ? TIER_CONFIG[tierKey] : null;
              const positions = parsePositions(plan);
              const isHighlighted = Boolean(plan.is_highlighted) && !isCurrentPlan;

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border-2 relative overflow-hidden transition-all hover:shadow-lg ${
                    isCurrentPlan
                      ? 'border-emerald-400 dark:border-emerald-500 shadow-lg shadow-emerald-500/10'
                      : isHighlighted
                      ? `border-orange-400 shadow-lg shadow-orange-500/10 ${tier?.bgColor || 'bg-white dark:bg-slate-800'}`
                      : `border-slate-200 dark:border-slate-700 ${tier?.bgColor || 'bg-white dark:bg-slate-800'}`
                  }`}
                >
                  {/* Badges */}
                  {isCurrentPlan && (
                    <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase flex items-center gap-1.5 z-10 shadow-sm">
                      <Check size={10} /> Ativo
                    </div>
                  )}
                  {isHighlighted && (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase z-10 shadow-sm">
                      Recomendado
                    </div>
                  )}

                  {/* Tier header */}
                  {tier && (
                    <div className={`flex items-center gap-2 px-5 pt-5 pb-2 border-b ${isCurrentPlan ? 'border-emerald-200 dark:border-emerald-800' : 'border-slate-200 dark:border-slate-700'}`}>
                      {tier.icon}
                      <span className={`font-black text-xs uppercase tracking-wider ${
                        tierKey === 'sponsor_master' ? 'text-yellow-700 dark:text-yellow-400' :
                        tierKey === 'maintainer_premium' ? 'text-blue-700 dark:text-blue-400' :
                        'text-rose-700 dark:text-rose-400'
                      }`}>{tier.label}</span>
                    </div>
                  )}

                  <div className="p-5">
                    {/* Plan name + price */}
                    <h4 className="font-black text-lg text-slate-900 dark:text-slate-100">{plan.name}</h4>
                    {plan.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{plan.description}</p>
                    )}
                    <div className="mt-3">
                      <span className={`text-2xl font-black ${isCurrentPlan ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        {Number(plan.price) === 0 ? 'Grátis' : `R$ ${Number(plan.price).toFixed(2).replace('.', ',')}`}
                      </span>
                      {Number(plan.price) > 0 && <span className="text-xs text-slate-500 dark:text-slate-400">/mês</span>}
                    </div>

                    {/* Positions list */}
                    {positions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Posições incluídas:</p>
                        <ul className="space-y-1.5">
                          {positions.map((pos: string) => (
                            <li key={pos} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                              <Check size={12} className="text-emerald-500 shrink-0" />
                              {AD_POSITION_LABEL[pos] || pos}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* CTA */}
                    <button
                      onClick={() => handlePlanSelect(plan)}
                      disabled={purchasing === `plan-${plan.id}`}
                      className={`mt-5 w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                        isCurrentPlan
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 cursor-default'
                          : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
                      }`}
                    >
                      {isCurrentPlan ? 'Plano Atual' : 'Assinar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Link para avulso */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Zap size={20} className="text-orange-500" />
          </div>
          <div>
            <p className="font-black text-sm text-slate-800 dark:text-slate-100">Quer apenas uma posição?</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Contrate posições avulsas sem assinar um plano</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard/planos/advertiser/avulso')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-sm shrink-0"
        >
          Ver Posições
        </button>
      </div>
    </DashboardShell>
  );
}
