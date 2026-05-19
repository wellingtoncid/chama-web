import { ArrowLeft, Loader2, Check, Clock, AlertTriangle } from 'lucide-react';
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
  if (days === 365) return '1 ano';
  return `${days} dias`;
};

export default function DriverModule() {
  const navigate = useNavigate();
  const {
    purchasing, walletBalance,
    driverVerificationStatus, driverHasContracted,
    handlePurchase, getModuleRules,
  } = usePlans();

  const rules = getModuleRules('driver');

  const getStatusBadge = () => {
    if (driverHasContracted) {
      return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <Check size={20} className="text-emerald-500" />
          <div>
            <p className="text-xs font-black text-emerald-800 uppercase">Verificação Aprovada</p>
            <p className="text-[10px] text-emerald-600">Seu perfil está verificado</p>
          </div>
        </div>
      );
    }

    if (driverVerificationStatus.status === 'awaiting_review' || driverVerificationStatus.status === 'pending_docs') {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <Clock size={20} className="text-amber-500" />
          <div>
            <p className="text-xs font-black text-amber-800 uppercase">Em Análise</p>
            <p className="text-[10px] text-amber-600">Aguarde a aprovação da equipe</p>
          </div>
        </div>
      );
    }

    if (driverVerificationStatus.status === 'rejected' || driverVerificationStatus.status === 'needs_resend') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-red-800 uppercase">Documentos Rejeitados</p>
            {driverVerificationStatus.rejection_reason && (
              <p className="text-[10px] text-red-600 mt-1 whitespace-pre-line">{driverVerificationStatus.rejection_reason}</p>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <DashboardShell
      title="Driver Pro"
      description="Recursos exclusivos para motoristas"
      actions={
        <Button variant="ghost" onClick={() => navigate('/dashboard/planos')}>
          <ArrowLeft size={16} /> Voltar
        </Button>
      }
    >
      {/* Status */}
      {getStatusBadge()}

      {/* Recursos */}
      {rules.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 p-4">
            <h3 className="font-black uppercase italic text-slate-900 dark:text-slate-100">Recursos Exclusivos</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Destaque seu perfil e ganhe mais visibilidade</p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {rules.map((feature) => {
              const isPurchasing = purchasing === `driver-${feature.feature_key}`;

              const getPriceInfo = () => {
                const type = feature.pricing_type;
                if (type === 'monthly' && Number(feature.price_monthly) > 0) {
                  return { price: Number(feature.price_monthly), label: '/mês' };
                }
                if ((type === 'per_use' || type === 'free_limit') && Number(feature.price_per_use) > 0) {
                  return { price: Number(feature.price_per_use), label: '' };
                }
                return { price: 0, label: '' };
              };

              const priceInfo = getPriceInfo();

              return (
                <div key={feature.id} className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{feature.feature_name}</h4>
                    {feature.duration_days > 0 && priceInfo.label === '' && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Validade: {formatDuration(feature.duration_days)}</p>
                    )}
                    {priceInfo.label === '/mês' && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Validade: {formatDuration(feature.duration_days || 30)}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {priceInfo.price > 0 && (
                      <span className="font-black text-emerald-600 dark:text-emerald-400">
                        {formatPrice(priceInfo.price)}{priceInfo.label}
                      </span>
                    )}

                    <button
                      onClick={() => handlePurchase('driver', feature, walletBalance)}
                      disabled={isPurchasing}
                      className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
                        isPurchasing
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                    >
                      {isPurchasing ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        'Contratar'
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
