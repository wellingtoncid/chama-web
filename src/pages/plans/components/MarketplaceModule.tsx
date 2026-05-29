import { ArrowLeft, Check, ShoppingBag, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlans } from '../../../context/PlansContext';
import DashboardShell from '../../../components/layout/DashboardShell';
import { Button } from '../../../components/ui/Button';

export default function MarketplaceModule() {
  const navigate = useNavigate();
  const {
    purchasing, pricingRules,
    getSubscriptionPlans, getActivePlanIdForModule,
    handlePlanSelect,
  } = usePlans();

  const subscriptionPlans = getSubscriptionPlans('marketplace_subscription');
  const rules = pricingRules.filter(r => r.module_key === 'marketplace');
  const currentPlanId = getActivePlanIdForModule('marketplace');
  const hasActivePlan = !!currentPlanId;
  const freePublishRule = pricingRules.find(r => r.module_key === 'marketplace' && r.feature_key === 'publish_listing');
  const freeLimit = freePublishRule ? Number(freePublishRule.free_limit) : 0;

  return (
    <DashboardShell
      title="Marketplace"
      description="Venda produtos e peças"
      actions={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => navigate('/dashboard/planos')}>
            <ArrowLeft size={16} /> Voltar
          </Button>
        </div>
      }
    >
      {hasActivePlan ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ShoppingBag size={24} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-black uppercase italic text-lg text-emerald-800 dark:text-emerald-300">Plano de Marketplace Ativo</h3>
              <Check size={16} className="text-emerald-500" />
            </div>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">Seus anúncios estão sendo publicados com os recursos do seu plano</p>
          </div>
        </div>
      ) : freeLimit > 0 ? (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <ShoppingBag size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-black uppercase italic text-lg text-blue-800 dark:text-blue-300">Plano Gratuito</h3>
            <p className="text-sm text-blue-600 dark:text-blue-400">Você pode publicar até {freeLimit} anúncio{freeLimit > 1 ? 's' : ''} por mês sem custo</p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
            <ShoppingBag size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-black uppercase italic text-lg text-slate-500">Nenhum plano ativo</h3>
            <p className="text-sm text-slate-400">Assine um plano abaixo para anunciar no marketplace</p>
          </div>
        </div>
      )}

      {subscriptionPlans.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-purple-500 rounded-full" />
            <div>
              <h2 className="font-black text-lg text-slate-900 dark:text-slate-100">Planos de Marketplace</h2>
              <p className="text-xs text-slate-500">Escolha o plano ideal para suas vendas</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {subscriptionPlans.map((plan: any) => {
              const isCurrentPlan = currentPlanId === plan.id;
              const isHighlighted = Boolean(plan.is_highlighted) && !isCurrentPlan;
              const planFeatures = Array.isArray(plan.features)
                ? plan.features.filter((f: unknown) => f !== null && f !== undefined && f !== '')
                : [];

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border-2 relative overflow-hidden transition-all hover:shadow-lg bg-white dark:bg-slate-800 ${
                    isCurrentPlan
                      ? 'border-emerald-400 dark:border-emerald-500 shadow-lg shadow-emerald-500/10'
                      : isHighlighted
                      ? 'border-purple-400 shadow-lg shadow-purple-500/10'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isCurrentPlan && (
                    <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase flex items-center gap-1.5 z-10 shadow-sm">
                      <Check size={10} /> Ativo
                    </div>
                  )}
                  {isHighlighted && (
                    <div className="absolute top-3 right-3 bg-purple-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase z-10 shadow-sm">
                      Recomendado
                    </div>
                  )}

                  <div className="p-5">
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

                    {planFeatures.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Recursos incluídos:</p>
                        <ul className="space-y-1.5">
                          {planFeatures.map((feat: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                              <Check size={12} className="text-emerald-500 shrink-0" />
                              {String(feat)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button
                      onClick={() => handlePlanSelect(plan)}
                      disabled={purchasing === `plan-${plan.id}`}
                      className={`mt-5 w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
                        isCurrentPlan
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 cursor-default'
                          : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
                      }`}
                    >
                      {isCurrentPlan ? 'Plano Atual' : purchasing === `plan-${plan.id}` ? 'Processando...' : 'Assinar'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {rules.length > 0 && (
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Sparkles size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="font-black text-sm text-slate-800 dark:text-slate-100">Quer destacar seus anúncios?</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Use boost, bump e outros recursos avulsos</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/dashboard/vendas')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-sm shrink-0"
          >
            Ver Recursos
          </button>
        </div>
      )}
    </DashboardShell>
  );
}
