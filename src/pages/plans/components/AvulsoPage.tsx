import { ArrowLeft, Loader2, Crown, Star, Heart, Sparkles, Ruler, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlans } from '../../../context/PlansContext';
import DashboardShell from '../../../components/layout/DashboardShell';
import { Button } from '../../../components/ui/Button';
import { AD_POSITION_LABEL, AD_POSITION_DESC, AD_POSITION_SIZE, AD_POSITION_GROUP } from '../../../constants/adPositions';

const formatPrice = (value: any) => {
  const num = Number(value) || 0;
  return num > 0 ? `R$ ${num.toFixed(2).replace('.', ',')}` : 'Grátis';
};

const formatDuration = (days: number) => {
  if (days === 1) return '1 dia';
  if (days === 7) return '7 dias';
  if (days === 30) return '30 dias';
  return `${days} dias`;
};

const TIER_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  sponsor_master: {
    label: 'Oferecimento Master',
    icon: <Crown size={16} />,
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  maintainer_premium: {
    label: 'Mantenedor Premium',
    icon: <Star size={16} />,
    color: 'text-blue-600 dark:text-blue-400',
  },
  supporter_connect: {
    label: 'Apoiador Connect',
    icon: <Heart size={16} />,
    color: 'text-rose-600 dark:text-rose-400',
  },
};

export default function AvulsoPage() {
  const navigate = useNavigate();
  const {
    pricingRules, purchasing, walletBalance,
    getSubscriptionPlans, handlePurchase, getActivePlanIdForModule,
  } = usePlans();

  const rules = pricingRules.filter(r => r.module_key === 'advertiser' && Number(r.is_public));
  const subscriptionPlans = getSubscriptionPlans('advertising');
  const currentPlanId = getActivePlanIdForModule('advertiser');
  const hasActivePlan = !!currentPlanId;
  const activePlan = hasActivePlan ? subscriptionPlans.find((p: any) => p.id === currentPlanId) : null;

  const groupedRules = rules.reduce<Record<string, typeof rules>>((acc, r) => {
    const group = AD_POSITION_GROUP[r.feature_key] || 'Outras';
    if (!acc[group]) acc[group] = [];
    acc[group].push(r);
    return acc;
  }, {});

  const groupOrder = ['Premium', 'Principais', 'Secundárias', 'Outras'];

  return (
    <DashboardShell
      title="Posições Avulsas"
      description="Contrate posições de anúncio individualmente"
      actions={
        <div className="flex gap-2">
          {hasActivePlan && activePlan && (() => {
            const tier = TIER_LABELS[(activePlan as any).advertiser_tier as string];
            return tier ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                {tier.icon}
                <span className={tier.color}>{tier.label}</span>
              </div>
            ) : null;
          })()}
          <Button variant="ghost" onClick={() => navigate('/dashboard/planos/advertiser')}>
            <ArrowLeft size={16} /> Planos
          </Button>
        </div>
      }
    >
      {hasActivePlan && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-start gap-3">
          <Sparkles size={20} className="text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase italic">Você já tem um plano ativo</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
              {activePlan?.name} — as posições do seu plano já estão incluídas. Adquira posições extras avulsas abaixo se precisar.
            </p>
          </div>
        </div>
      )}

      {groupOrder.map(group => {
        const items = groupedRules[group];
        if (!items?.length) return null;
        return (
          <div key={group} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 px-5 py-3">
              <h3 className="font-black text-sm text-slate-700 dark:text-slate-300 uppercase italic">{group}</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {items.map((feature) => {
                const isPurchasing = purchasing === `advertiser-${feature.feature_key}`;
                const positionName = AD_POSITION_LABEL[feature.feature_key] || feature.feature_name;
                const monthlyPrice = Number(feature.price_monthly);
                const perUsePrice = Number(feature.price_per_use);

                return (
                  <div key={feature.id} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{positionName}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{AD_POSITION_DESC[feature.feature_key]}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <Ruler size={11} /> {AD_POSITION_SIZE[feature.feature_key] || 'variável'}
                        </span>
                        {feature.duration_days > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <CheckCircle size={11} /> {formatDuration(feature.duration_days)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {monthlyPrice > 0 && (
                        <div className="text-right">
                          <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                            {formatPrice(monthlyPrice)}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-0.5">/mês</span>
                        </div>
                      )}
                      <button
                        onClick={() => handlePurchase('advertiser', feature, walletBalance)}
                        disabled={isPurchasing}
                        className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all whitespace-nowrap ${
                          isPurchasing
                            ? 'bg-slate-100 text-slate-400 dark:bg-slate-700'
                            : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
                        }`}
                      >
                        {isPurchasing ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          perUsePrice > 0 ? `R$ ${perUsePrice.toFixed(2).replace('.', ',')}` : 'Contratar'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {rules.length === 0 && (
        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-8 text-center">
          <p className="text-sm text-slate-500">Nenhuma posição avulsa disponível no momento.</p>
        </div>
      )}

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles size={20} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase italic">Quer mais vantagens?</p>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
            Os planos de publicidade incluem múltiplas posições por um valor mensal fixo.
          </p>
          <button
            onClick={() => navigate('/dashboard/planos/advertiser')}
            className="mt-2 text-xs font-bold text-amber-700 dark:text-amber-300 underline hover:no-underline"
          >
            Ver planos de publicidade
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
