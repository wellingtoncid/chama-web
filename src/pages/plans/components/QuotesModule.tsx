import { FileText, Clock, AlertCircle } from 'lucide-react';
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

interface QuotesModuleProps {
  onBack: () => void;
  onRequestAccess: () => void;
  onPurchase?: (moduleKey: string, feature: PricingRule, walletBalance?: number) => Promise<void>;
  purchasing?: string | null;
  walletBalance?: number;
  rules?: PricingRule[];
}

export default function QuotesModule({ 
  onBack, 
  onRequestAccess,
  onPurchase,
  purchasing,
  walletBalance = 0,
  rules = []
}: QuotesModuleProps) {
  return (
    <ModuleDetailLayout
      title="Cotações"
      icon={<FileText size={24} />}
      description="Solicite e receba cotações de fretes"
      isActive={false}
      onBack={onBack}
    >
      {/* Em Breve */}
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] border-2 border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-700 to-slate-600 p-6 text-white text-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Clock size={32} />
          </div>
          <h3 className="text-xl font-black uppercase italic mb-2">Em Breve</h3>
          <p className="text-slate-200 text-sm max-w-md mx-auto">
            O módulo de Cotações está em desenvolvimento. 
            Em breve você poderá solicitar e receber cotações de fretes de motoristas parceiros.
          </p>
        </div>

        <div className="p-6">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-start gap-3 mb-6">
            <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase italic">
                Interesse Registrado
              </p>
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                Solicite acesso antecipado e nossa equipe entrará em contato quando o módulo estiver disponível.
              </p>
            </div>
          </div>

          <button
            onClick={onRequestAccess}
            className="w-full py-4 rounded-xl font-black uppercase text-sm bg-amber-500 hover:bg-amber-600 text-white transition-all flex items-center justify-center gap-2"
          >
            <FileText size={18} /> Solicitar Acesso Antecipado
          </button>
        </div>
      </div>

      {/* Recursos Preparados (ocultos por enquanto) */}
      {rules.length > 0 && onPurchase && (
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 overflow-hidden mt-6 opacity-50">
          <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 p-4">
            <h3 className="font-black uppercase italic text-slate-900 dark:text-slate-100">Recursos Adicionais</h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Disponível em breve</p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {rules.map((feature) => {
              const isPurchasing = purchasing === `quotes-${feature.feature_key}`;

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
                      onClick={() => onPurchase('quotes', feature, walletBalance)}
                      disabled={isPurchasing}
                      className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all ${
                        isPurchasing
                          ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                    >
                      Adicionar
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
