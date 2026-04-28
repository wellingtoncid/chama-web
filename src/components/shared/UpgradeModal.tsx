import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/api';
import { 
  AlertTriangle, X, Loader2, Zap, CheckCircle, 
  CreditCard, ArrowRight, Star
} from 'lucide-react';
import Swal from 'sweetalert2';

interface PricingRule {
  module_key: string;
  feature_key: string;
  feature_name: string;
  pricing_type: string;
  free_limit: number;
  price_per_use: number;
  price_monthly: number;
  price_daily: number;
  duration_days: number;
}

interface UsageData {
  freights_published: number;
  marketplace_listings: number;
  quotes_received: number;
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleKey: string;
  featureKey: string;
  featureName: string;
  currentUsage: number;
  limit: number;
  pricePerUse: number;
  priceMonthly: number;
}

export function UpgradeModal({ 
  isOpen, 
  onClose, 
  moduleKey, 
  featureKey, 
  featureName, 
  currentUsage, 
  limit, 
  pricePerUse,
  priceMonthly 
}: UpgradeModalProps) {
  // Função segura para formatar preço
  const safePrice = (price: any) => {
    const num = typeof price === 'number' ? price : parseFloat(price || '0');
    return isNaN(num) ? 0 : num;
  };
  const displayPricePerUse = safePrice(pricePerUse);
  const displayPriceMonthly = safePrice(priceMonthly);
  
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePayPerUse = async () => {
    setLoading(true);
    try {
      const res = await api.post('/module/purchase-per-use', {
        module_key: moduleKey,
        feature_key: featureKey
      });
      
      if (res.data?.success && res.data.url) {
        // Redireciona para o checkout do MercadoPago
        window.location.href = res.data.url;
      } else {
        alert(res.data?.message || 'Erro ao processar pagamento');
      }
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleMonthlyPlan = async () => {
    setLoading(true);
    try {
      const res = await api.post('/module/subscribe-monthly', {
        module_key: moduleKey,
        feature_key: featureKey
      });
      
      if (res.data?.success && res.data.url) {
        // Redireciona para o checkout do MercadoPago
        window.location.href = res.data.url;
      } else {
        alert(res.data?.message || 'Erro ao processar assinatura');
      }
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || 'Erro ao processar assinatura');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] p-8 max-w-md w-full relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-xl"
        >
          <X size={20} className="text-slate-400" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap size={32} className="text-orange-500" />
          </div>
          <h3 className="text-2xl font-black uppercase italic text-slate-900">
            Limite Atingido!
          </h3>
          <p className="text-slate-500 font-medium mt-2">
            Você atingiu o limite de <span className="text-orange-500 font-black">{limit}</span> {featureName} grátis.
          </p>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-slate-600">Por uso avulso</span>
              <span className="text-lg font-black text-slate-900">R$ {displayPricePerUse.toFixed(2)}</span>
            </div>
            <p className="text-[10px] text-slate-400">Cobrado uma vez por uso adicional</p>
            <button 
              onClick={handlePayPerUse}
              disabled={loading}
              className="w-full mt-3 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-slate-800"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <>Pagar R$ {displayPricePerUse.toFixed(2)} <ArrowRight size={14} /></>}
            </button>
          </div>

          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl border-2 border-orange-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-orange-900 flex items-center gap-2">
                <Star size={12} className="text-orange-500" fill="currentColor" />
                Plano Mensal
              </span>
              <span className="text-lg font-black text-orange-600">R$ {displayPriceMonthly.toFixed(2)}<span className="text-[10px]">/mês</span></span>
            </div>
            <p className="text-[10px] text-orange-700">Uso ilimitado durante 30 dias</p>
            <button 
              onClick={handleMonthlyPlan}
              disabled={loading}
              className="w-full mt-3 py-3 bg-orange-500 text-white rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-orange-600"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <>Assinar Plano <ArrowRight size={14} /></>}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-400 mt-4">
          Pagamento seguro via MercadoPago
        </p>
      </div>
    </div>
  );
}

// Hook para verificar uso e mostrar popup automaticamente
export function useUsageCheck(moduleKey: string, featureKey: string) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [pricing, setPricing] = useState<PricingRule | null>(null);
  const [usage, setUsage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [planLimit, setPlanLimit] = useState<number>(0);

  const checkUsage = useCallback(async () => {
    try {
      setLoading(true);
      
      // Busca regras de preço
      const rulesRes = await api.get('/pricing/rules');
      const rules: PricingRule[] = rulesRes.data?.data || [];
      
      const rule = rules.find(r => r.module_key === moduleKey && r.feature_key === featureKey);
      if (!rule) {
        setLoading(false);
        return;
      }
      
      setPricing(rule);
      
      // Busca uso atual - usa novo formato com limits do plano
      const usageRes = await api.get('/user/usage');
      const usageData: any = usageRes.data?.data || {};
      
      // Usa limite do plano (se disponível) ou do pricing_rules como fallback
      let currentUsage = 0;
      let effectiveLimit = rule?.free_limit ?? 0;
      
      switch (moduleKey) {
        case 'freights':
          currentUsage = usageData.freights_published || usageData.freights?.used || 0;
          // Usa limite do plano se disponível
          if (usageData.freights?.limit > 0) {
            effectiveLimit = usageData.freights.limit;
            setPlanLimit(usageData.freights.limit);
          }
          break;
        case 'marketplace':
          currentUsage = usageData.marketplace_listings || usageData.marketplace?.used || 0;
          if (usageData.marketplace?.limit > 0) {
            effectiveLimit = usageData.marketplace.limit;
            setPlanLimit(usageData.marketplace.limit);
          }
          break;
        case 'quotes':
          currentUsage = usageData.quotes_received || 0;
          break;
      }
      
      setUsage(currentUsage);
      
      // Verifica se atingiu limite (do plano ou pricing_rules)
      if (effectiveLimit > 0 && currentUsage >= effectiveLimit) {
        setShowUpgrade(true);
      }
      
    } catch (e) {
      console.error('Erro ao verificar uso:', e);
    } finally {
      setLoading(false);
    }
  }, [moduleKey, featureKey]);

  useEffect(() => {
    checkUsage();
  }, [checkUsage]);

  // Retorna limites do plano (não do pricing_rules)
  const effectiveLimit = planLimit > 0 ? planLimit : (pricing?.free_limit ?? 0);
  const canUse = !pricing || effectiveLimit === 0 || usage < effectiveLimit;

  return {
    canUse,
    usage,
    limit: effectiveLimit,
    pricing,
    loading,
    showUpgrade,
    setShowUpgrade,
    checkUsage
  };
}

// Componente pronto para usar em qualquer página
export default function UsageCheckWrapper({ 
  children, 
  moduleKey, 
  featureKey,
  featureName,
  onLimitReached 
}: { 
  children: React.ReactNode;
  moduleKey: string;
  featureKey: string;
  featureName: string;
  onLimitReached?: () => void;
}) {
  const { canUse, usage, limit, pricing, loading, showUpgrade, setShowUpgrade, checkUsage } = useUsageCheck(moduleKey, featureKey);

  useEffect(() => {
    if (!canUse && onLimitReached) {
      onLimitReached();
    }
  }, [canUse, onLimitReached]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-orange-500" size={24} />
      </div>
    );
  }

  return (
    <>
      {children}
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        moduleKey={moduleKey}
        featureKey={featureKey}
        featureName={featureName}
        currentUsage={usage}
        limit={limit}
        pricePerUse={pricing?.price_per_use || 0}
        priceMonthly={pricing?.price_monthly || 0}
      />
    </>
  );
}
