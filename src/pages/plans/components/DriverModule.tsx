import { User, Loader2, Check, Clock, AlertTriangle } from 'lucide-react';
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

interface DriverModuleProps {
  rules: PricingRule[];
  onBack: () => void;
  verificationStatus: {
    status: string | null;
    rejection_reason: string | null;
  };
  hasContracted: boolean;
  onPurchase: (moduleKey: string, feature: PricingRule, walletBalance?: number) => Promise<void>;
  purchasing: string | null;
  walletBalance?: number;
}

const formatPrice = (value: any) => {
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

export default function DriverModule({
  rules,
  onBack,
  verificationStatus,
  hasContracted,
  onPurchase,
  purchasing,
  walletBalance = 0,
}: DriverModuleProps) {
  const getStatusBadge = () => {
    if (hasContracted) {
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

    if (verificationStatus.status === 'awaiting_review' || verificationStatus.status === 'pending_docs') {
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

    if (verificationStatus.status === 'rejected' || verificationStatus.status === 'needs_resend') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-red-800 uppercase">Documentos Rejeitados</p>
            {verificationStatus.rejection_reason && (
              <p className="text-[10px] text-red-600 mt-1 whitespace-pre-line">{verificationStatus.rejection_reason}</p>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <ModuleDetailLayout
      title="Driver Pro"
      icon={<User size={24} />}
      description="Recursos exclusivos para motoristas"
      isActive={hasContracted}
      onBack={onBack}
    >
      {/* Status */}
      {getStatusBadge()}

      {/* Recursos */}
      {rules.length > 0 && (
        <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-100 p-4">
            <h3 className="font-black uppercase italic text-slate-900">Recursos Exclusivos</h3>
            <p className="text-[10px] text-slate-500">Destaque seu perfil e ganhe mais visibilidade</p>
          </div>

          <div className="divide-y divide-slate-50">
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
                    <h4 className="font-bold text-slate-900">{feature.feature_name}</h4>
                    {feature.duration_days > 0 && priceInfo.label === '' && (
                      <p className="text-[10px] text-slate-500">Validade: {formatDuration(feature.duration_days)}</p>
                    )}
                    {priceInfo.label === '/mês' && (
                      <p className="text-[10px] text-slate-500">Validade: {formatDuration(feature.duration_days || 30)}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {priceInfo.price > 0 && (
                      <span className="font-black text-emerald-600">
                        {formatPrice(priceInfo.price)}{priceInfo.label}
                      </span>
                    )}

                    <button
                      onClick={() => onPurchase('driver', feature, walletBalance)}
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
    </ModuleDetailLayout>
  );
}
