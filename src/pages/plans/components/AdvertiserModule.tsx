import { ArrowLeft, Megaphone, Loader2, Check, Star } from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { usePlans } from '../../../context/PlansContext';
import DashboardShell from '../../../components/layout/DashboardShell';
import { Button } from '../../../components/ui/Button';

const formatPrice = (value: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  const num = Number(value) || 0;
  return num > 0 ? `R$ ${num.toFixed(2).replace('.', ',')}` : 'Grátis';
};

const formatDuration = (days: number) => {
  if (days === 1) return '1 dia';
  if (days === 7) return '7 dias';
  if (days === 30) return '30 dias';
  return `${days} dias`;
};

export default function AdvertiserModule() {
  const navigate = useNavigate();
  const {
    pricingRules, purchasing, walletBalance,
    getSubscriptionPlans, getActivePlanIdForModule,
    handlePlanSelect, handlePurchase, toggleAdvertiser, togglingAdvertiser,
    getModuleStatus,
  } = usePlans();

  const subscriptionPlans = getSubscriptionPlans('advertising');
  const rules = pricingRules.filter(r => r.module_key === 'advertiser');
  const currentPlanId = getActivePlanIdForModule('advertiser');
  const status = getModuleStatus('advertiser');
  const isActive = status.isActive;

  const handleToggle = (newStatus: boolean) => {
    const action = newStatus ? 'ativar' : 'desativar';
    Swal.fire({
      title: `Deseja ${action} a publicidade?`,
      text: newStatus
        ? 'Seus anúncios serão exibidos nas posições contratadas.'
        : 'Seus anúncios ficarão ocultos para outros usuários.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        toggleAdvertiser(newStatus);
      }
    });
  };

  return (
    <DashboardShell
      title="Publicidade"
      description="Destaque sua empresa e anúncios"
      actions={
        <Button variant="ghost" onClick={() => navigate('/dashboard/planos')}>
          <ArrowLeft size={16} /> Voltar
        </Button>
      }
    >
      {/* Toggle Publicidade */}
      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isActive ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
              <Megaphone size={24} />
            </div>
            <div>
              <h3 className="font-black uppercase italic text-lg text-slate-900 dark:text-slate-100">
                {isActive ? 'Publicidade Ativo' : 'Publicidade Inativo'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isActive ? 'Seus anúncios aparecerão nas posições selecionadas' : 'Seus anúncios ficarão ocultos para outros usuários.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleToggle(!isActive)}
            disabled={togglingAdvertiser}
            className={`relative w-16 h-8 rounded-full p-1 transition-all duration-300 ${
              isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
            } disabled:opacity-50`}
          >
            <div className={`absolute top-0.5 w-7 h-7 bg-white rounded-full shadow-lg transition-all duration-300 ${
              isActive ? 'left-8' : 'left-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* Planos de Publicidade */}
      {subscriptionPlans.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 p-4">
            <h3 className="font-black uppercase italic text-slate-900 dark:text-slate-100">Planos de Publicidade</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Escolha um plano com posições exclusivas</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {subscriptionPlans.map((plan: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
              const isCurrentPlan = currentPlanId === plan.id;
              const isHighlighted = Boolean(plan.is_highlighted);
              const planFeatures = Array.isArray(plan.features) 
                ? plan.features.filter((f: unknown) => f !== null && f !== undefined && f !== '') 
                : [];
              
              return (
                <div
                  key={plan.id}
                  onClick={() => handlePlanSelect(plan)}
                  className={`p-4 rounded-xl border-2 relative cursor-pointer transition-all ${
                    isCurrentPlan
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-400 dark:shadow-lg dark:shadow-emerald-900/20'
                      : isHighlighted
                      ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/40 dark:border-orange-500 dark:shadow-orange-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 dark:bg-slate-800/50'
                  }`}
                >
                  {isCurrentPlan && (
                    <div className="absolute -top-2 -left-2 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase flex items-center gap-1 z-10">
                      <Star size={8} fill="white" /> Ativo
                    </div>
                  )}
                  {isHighlighted && !isCurrentPlan && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase z-10">
                      Destaque
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

      {/* Recursos Avulsos */}
      {rules.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 p-4">
            <h3 className="font-black uppercase italic text-slate-900 dark:text-slate-100">Recursos Adicionais</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Contrate posições avulsas</p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {rules.map((feature) => {
              const isPurchasing = purchasing === `advertiser-${feature.feature_key}`;

              const priceInfo = {
                price: Number(feature.price_per_use),
                label: ''
              };

              return (
                <div key={feature.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{feature.feature_name}</h4>
                    {feature.duration_days > 0 && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Validade: {formatDuration(feature.duration_days)}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {priceInfo.price > 0 && (
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        {formatPrice(priceInfo.price)}
                      </span>
                    )}

                    <button
                      onClick={() => handlePurchase('advertiser', feature, walletBalance)}
                      disabled={isPurchasing}
                      className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
                        isPurchasing
                          ? 'bg-slate-100 text-slate-400'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                    >
                      {isPurchasing ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        'Adicionar'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
