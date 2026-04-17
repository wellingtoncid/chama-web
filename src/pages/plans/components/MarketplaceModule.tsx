// useState removed 'react';
import { ShoppingBag, Check, Star } from 'lucide-react';
import Swal from 'sweetalert2';
import ModuleDetailLayout from './ModuleDetailLayout';

interface PricingRule {
  id: number;
  module_key: string;
  feature_key: string;
  feature_name: string;
  pricing_type: string;
  free_limit: number;
  price_per_use: number;
  price_monthly: number;
  price_daily: number;
  duration_days: number;
  is_active: number;
}

interface MarketplaceModuleProps {
  plans: any[];
  rules: PricingRule[];
  isActive: boolean;
  onBack: () => void;
  onToggle: (activate: boolean) => Promise<void>;
  onPlanSelect: (plan: any) => void;
  onPurchase: (moduleKey: string, feature: PricingRule, walletBalance?: number) => Promise<void>;
  purchasing: string | null;
  toggling: boolean;
  walletBalance?: number;
  currentPlanId?: number | null;
  }

const formatDuration = (days: number) => {
  if (days === 1) return '1 dia';
  if (days === 7) return '7 dias';
  if (days === 30) return '30 dias';
  return `${days} dias`;
};

export default function MarketplaceModule({
  plans,
  rules,
  isActive,
  onBack,
  onToggle,
  onPlanSelect,
  onPurchase,
  purchasing,
  toggling,
  walletBalance = 0,
  currentPlanId = null,
}: MarketplaceModuleProps) {

  const handleToggle = (newStatus: boolean) => {
    const action = newStatus ? 'ativar' : 'desativar';
    Swal.fire({
      title: `Deseja ${action} o marketplace?`,
      text: newStatus
        ? 'Você tem 1 anúncio gratuito por mês incluso.'
        : 'Seus anúncios ficarão ocultos para outros usuários, mas você ainda poderá vê-los.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        onToggle(newStatus);
      }
    });
  };

  return (
    <ModuleDetailLayout
      title="Marketplace"
      icon={<ShoppingBag size={24} />}
      description="Venda produtos e peças"
      isActive={isActive}
      onBack={onBack}
      toggle={{
        isActive,
        onToggle: handleToggle,
        toggling,
        label: 'Marketplace',
        subtitle: '1 anúncio gratuito por mês incluso',
        inactiveText: 'Anúncios desativados ficam ocultos para outros usuários.',
        color: 'from-purple-600 to-purple-500'
      }}
    >
      {/* Planos de Assinatura */}
      {plans.length > 0 && (
        <div className="bg-white rounded-[2rem] border-2 border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-700 to-purple-600 p-4">
            <h3 className="font-black uppercase italic text-white">Planos Mensais</h3>
            <p className="text-purple-200 text-xs">Escolha um plano com benefícios exclusivos</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
            {plans.map((plan) => {
              const isCurrentPlan = currentPlanId === plan.id;
              const isHighlighted = Boolean(plan.is_highlighted);
              const planFeatures = Array.isArray(plan.features) 
                ? plan.features.filter((f: unknown) => f !== null && f !== undefined && f !== '') 
                : [];
              
              return (
                <div
                  key={plan.id}
                  onClick={() => onPlanSelect(plan)}
                  className={`p-4 rounded-xl border-2 relative cursor-pointer transition-all ${
                    isCurrentPlan
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-400 dark:shadow-lg dark:shadow-emerald-900/20'
                      : isHighlighted
                      ? 'border-purple-400 bg-purple-50 dark:bg-purple-950/40 dark:border-purple-500 dark:shadow-purple-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 dark:bg-slate-800/50'
                  }`}
                >
                  {isCurrentPlan && (
                    <div className="absolute -top-2 -left-2 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase flex items-center gap-1 z-10">
                      <Star size={8} fill="white" /> Ativo
                    </div>
                  )}
                  {isHighlighted && !isCurrentPlan && (
                    <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase z-10">
                      Popular
                    </div>
                  )}
                  <h4 className="font-black text-slate-900 dark:text-slate-100">{plan.name}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{plan.description}</p>
                  <div className="mt-3">
                    <span className={`text-xl font-black ${isCurrentPlan ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {Number(plan.price) === 0 ? 'Grátis' : `R$ ${Number(plan.price).toFixed(2).replace('.', ',')}`}
                    </span>
                    {Number(plan.price) > 0 && <span className="text-xs text-slate-500 dark:text-slate-400">/mês</span>}
                  </div>
                  {planFeatures.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {planFeatures.slice(0, 3).map((feat: string, idx: number) => (
                        <li key={idx} className="text-[9px] text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <Check size={10} className="text-emerald-500 shrink-0" /> {String(feat)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Info sobre Recursos Avulsos */}
      {rules.length > 0 && (
        <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800">
          <h4 className="font-bold text-purple-900 dark:text-purple-300 text-sm">Quer destacar seus anúncios?</h4>
          <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
            Na página de cada anúncio, você encontrará opções para destacar, bump ou adicionar mais visibilidade ao seu produto.
          </p>
        </div>
      )}
    </ModuleDetailLayout>
  );
}
