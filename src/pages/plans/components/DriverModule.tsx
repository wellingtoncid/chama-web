import { ArrowLeft, Loader2, Check, Clock, AlertTriangle, User, ShieldCheck, Star, Ruler } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlans } from '../../../context/PlansContext';
import DashboardShell from '../../../components/layout/DashboardShell';
import { Button } from '../../../components/ui/Button';

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

const FEATURE_INFO: Record<string, { icon: any, benefits: string[] }> = {
  document_verification: {
    icon: ShieldCheck,
    benefits: [
      'Selo de verificado no seu perfil',
      'Mais confiança das empresas contratantes',
      'Documentos (RG, CNH) analisados pela equipe',
      'Válido por 1 ano',
    ],
  },
  featured_profile: {
    icon: Star,
    benefits: [
      'Aparece no topo das buscas das empresas',
      'Destaque com prioridade máxima',
      'Mais visualizações do seu perfil',
      'Maiores chances de ser contratado',
    ],
  },
  radar_highlight: {
    icon: Star,
    benefits: [
      'Seu perfil destacado no Radar de Cargas',
      'Empresas veem seu nome primeiro',
      'Mais oportunidades de frete',
    ],
  },
};

export default function DriverModule() {
  const navigate = useNavigate();
  const {
    purchasing, walletBalance,
    driverVerificationStatus, driverHasContracted,
    handlePurchase, getModuleRules,
    usageStats,
  } = usePlans();

  const rules = getModuleRules('driver');
  const activeFeatures = usageStats?.features || {};

  const getStatusBadge = () => {
    if (driverHasContracted) {
      return (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Check size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-black uppercase italic text-lg text-emerald-800 dark:text-emerald-300">Verificação Aprovada</h3>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">Seu perfil está verificado</p>
          </div>
        </div>
      );
    }

    if (driverVerificationStatus.status === 'awaiting_review' || driverVerificationStatus.status === 'pending_docs') {
      return (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-black uppercase italic text-lg text-amber-800 dark:text-amber-300">Em Análise</h3>
            <p className="text-sm text-amber-600 dark:text-amber-400">Aguarde a aprovação da equipe</p>
          </div>
        </div>
      );
    }

    if (driverVerificationStatus.status === 'rejected' || driverVerificationStatus.status === 'needs_resend') {
      return (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="font-black uppercase italic text-lg text-red-800 dark:text-red-300">Documentos Rejeitados</h3>
            {driverVerificationStatus.rejection_reason && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1 whitespace-pre-line">{driverVerificationStatus.rejection_reason}</p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
          <User size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-black uppercase italic text-lg text-slate-500">Driver Pro</h3>
          <p className="text-sm text-slate-400">Destaque seu perfil, tenha seu documento verificado e apareça primeiro para as empresas. Escolha um recurso abaixo.</p>
        </div>
      </div>
    );
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
      {getStatusBadge()}

      {rules.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 px-5 py-3">
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
                <div key={feature.id} className="px-5 py-5 flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                    {(() => {
                      const Icon = FEATURE_INFO[feature.feature_key]?.icon;
                      return Icon ? <Icon size={22} className="text-orange-500" /> : <Ruler size={22} className="text-orange-500" />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <h4 className="font-black text-base text-slate-900 dark:text-slate-100">{feature.feature_name}</h4>
                        <ul className="mt-2 space-y-1">
                          {(FEATURE_INFO[feature.feature_key]?.benefits ?? []).map((benefit, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                              <Check size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                        <div className="flex items-center gap-3 mt-2">
                          {feature.duration_days > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                              <Ruler size={11} /> {formatDuration(feature.duration_days)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {priceInfo.price > 0 && (
                          <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm whitespace-nowrap">
                            {formatPrice(priceInfo.price)}{priceInfo.label}
                          </span>
                        )}
                    <button
                      onClick={() => {
                        if (feature.feature_key === 'document_verification') {
                          navigate('/dashboard/planos/driver/verificacao');
                        } else {
                          handlePurchase('driver', feature, walletBalance);
                        }
                      }}
                      disabled={isPurchasing || activeFeatures[feature.feature_key]?.active}
                      className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase transition-all whitespace-nowrap ${
                        isPurchasing
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                          : activeFeatures[feature.feature_key]?.active
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
                      }`}
                    >
                      {isPurchasing ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : activeFeatures[feature.feature_key]?.active ? (
                        'Ativo'
                      ) : feature.feature_key === 'document_verification' ? (
                        driverHasContracted ? 'Ativo' : 'Enviar Documentos'
                      ) : (
                        'Contratar'
                      )}
                    </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {rules.length === 0 && (
        <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-8 text-center">
          <p className="text-sm text-slate-500">Nenhum recurso disponível no momento.</p>
        </div>
      )}
    </DashboardShell>
  );
}
