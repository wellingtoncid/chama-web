import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  Check, Loader2, Crown, Truck, 
  ShoppingBag, Shield, Megaphone, FileText, Package,
  Star, CreditCard
} from 'lucide-react';
import Swal from 'sweetalert2';

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

interface UserUsage {
  [key: string]: number;
}

interface UserModule {
  key: string;
  name: string;
  description: string;
  status: string;
  is_active: boolean;
  activated_at: string | null;
  expires_at: string | null;
  is_allowed: boolean;
}

interface UserInfo {
  user_type: string;
  role: string;
}

interface PurchasedFeature {
  feature_key: string;
  module_key: string;
}

export default function PlansPage() {
  const [loading, setLoading] = useState(true);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [userModules, setUserModules] = useState<UserModule[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo>({ user_type: '', role: '' });
  const [userUsage, setUserUsage] = useState<UserUsage>({});
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'history'>('overview');
  const [purchasedFeatures, setPurchasedFeatures] = useState<PurchasedFeature[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rulesRes, modulesRes, , usageRes, transRes] = await Promise.all([
        api.get('/pricing/rules'),
        api.get('/user/modules'),
        api.get('/plans').catch(() => ({ data: { plans: [] } })),
        api.get('/user/usage').catch(() => ({ data: { data: { usage: {} } } })),
        api.get('/my-transactions').catch(() => ({ data: { data: [] } }))
      ]);

      if (rulesRes.data?.success) {
        setPricingRules(rulesRes.data.data || []);
      }
      if (modulesRes.data?.success) {
        setUserModules(modulesRes.data.data?.modules || []);
        setUserInfo({
          user_type: modulesRes.data.data?.user_type || '',
          role: modulesRes.data.data?.role || ''
        });
      }
      if (usageRes.data?.data?.usage) {
        setUserUsage(usageRes.data.usage);
      }
      if (transRes.data?.data) {
        const approved = (transRes.data.data as any[]).filter((t: any) => t.status === 'approved');
        setPurchasedFeatures(approved.map((t: any) => ({
          feature_key: t.feature_key,
          module_key: t.module_key
        })));
      }
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
    } finally {
      setLoading(false);
    }
  };

  const isDriver = userInfo.role?.toLowerCase() === 'driver';

  const isFeatureActive = (moduleKey: string, featureKey: string): boolean => {
    return purchasedFeatures.some(p => p.module_key === moduleKey && p.feature_key === featureKey);
  };

  const getUsageCount = (moduleKey: string, featureKey: string): number => {
    const key = `${moduleKey}_${featureKey}`;
    return userUsage[key] || 0;
  };

  const isFreeAvailable = (rule: PricingRule): boolean => {
    if (rule.free_limit <= 0) return false;
    const used = getUsageCount(rule.module_key, rule.feature_key);
    return used < rule.free_limit;
  };

  const handleSubscribe = async (moduleKey: string, featureKey: string, price: number) => {
    if (price <= 0) return;
    
    try {
      setPurchasing(`${moduleKey}-${featureKey}`);
      const res = await api.post('/module/subscribe-monthly', {
        module_key: moduleKey,
        feature_key: featureKey
      });

      if (res.data?.success) {
        if (res.data.payment_not_required) {
          Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: res.data.message || 'Módulo ativado com sucesso!',
            timer: 2000,
            showConfirmButton: false
          });
          loadData();
        } else if (res.data.url) {
          window.location.href = res.data.url;
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: res.data?.message || 'Não foi possível processar'
        });
      }
    } catch (e: any) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: e.response?.data?.message || 'Erro ao processar'
      });
    } finally {
      setPurchasing(null);
    }
  };

  const handlePurchasePerUse = async (moduleKey: string, featureKey: string, price: number) => {
    if (price <= 0) return;
    
    try {
      setPurchasing(`${moduleKey}-${featureKey}`);
      const res = await api.post('/module/purchase-per-use', {
        module_key: moduleKey,
        feature_key: featureKey
      });

      if (res.data?.success) {
        if (res.data.payment_not_required) {
          Swal.fire({
            icon: 'success',
            title: 'Sucesso!',
            text: res.data.message || 'Recurso adquirido com sucesso!',
            timer: 2000,
            showConfirmButton: false
          });
          loadData();
        } else if (res.data.url) {
          window.location.href = res.data.url;
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: res.data?.message || 'Não foi possível processar'
        });
      }
    } catch (e: any) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: e.response?.data?.message || 'Erro ao processar'
      });
    } finally {
      setPurchasing(null);
    }
  };

  const getModuleIcon = (key: string) => {
    switch(key) {
      case 'freights': return <Truck size={24} />;
      case 'advertiser': return <Megaphone size={24} />;
      case 'marketplace': return <ShoppingBag size={24} />;
      case 'quotes': return <FileText size={24} />;
      case 'driver': return <Shield size={24} />;
      default: return <Package size={24} />;
    }
  };

  const getModuleColor = (key: string) => {
    switch(key) {
      case 'freights': return 'from-orange-500 to-orange-600';
      case 'advertiser': return 'from-purple-500 to-purple-600';
      case 'marketplace': return 'from-blue-500 to-blue-600';
      case 'quotes': return 'from-emerald-500 to-emerald-600';
      case 'driver': return 'from-amber-500 to-amber-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getModuleLabel = (key: string) => {
    switch(key) {
      case 'freights': return 'Fretes';
      case 'advertiser': return 'Publicidade';
      case 'marketplace': return 'Marketplace';
      case 'quotes': return 'Cotações';
      case 'driver': return 'Driver Pro';
      default: return key;
    }
  };

  const formatPrice = (value: number | string) => {
    const num = parseFloat(String(value));
    return num > 0 ? `R$ ${num.toFixed(2).replace('.', ',')}` : 'Grátis';
  };

  const groupedRules = pricingRules.reduce((acc, rule) => {
    // Filtrar módulos permitidos para este usuário
    const mod = userModules.find(m => m.key === rule.module_key);
    if (!mod?.is_allowed) return acc;
    
    // Para drivers, não mostrar módulo "freights" (radar é gratuito e padrão)
    if (isDriver && rule.module_key === 'freights') return acc;
    
    // Para empresas, não mostrar módulo "driver"
    if (!isDriver && rule.module_key === 'driver') return acc;
    
    if (!acc[rule.module_key]) acc[rule.module_key] = [];
    acc[rule.module_key].push(rule);
    return acc;
  }, {} as Record<string, PricingRule[]>);

  const isModuleActive = (key: string) => {
    // Verificar se há algum feature ativo neste módulo
    return purchasedFeatures.some(p => p.module_key === key);
  };

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center animate-pulse">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Carregando Planos...</span>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[3rem] p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-orange-500 p-3 rounded-2xl">
              <Crown size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black uppercase italic">{isDriver ? 'Driver Pro' : 'Planos & Módulos'}</h2>
              <p className="text-slate-300 text-sm font-medium">{isDriver ? 'Recursos premium para maximizar suas oportunidades' : 'Gerencie suas assinaturas e recursos'}</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mt-6">
            {[
              { id: 'overview', label: 'Visão Geral' },
              { id: 'modules', label: 'Módulos' },
              { id: 'history', label: 'Histórico' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl font-bold text-xs uppercase transition-all ${
                  activeTab === tab.id 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cards de Resumo */}
          {Object.entries(groupedRules).map(([moduleKey, rules]) => {
            const isActive = isModuleActive(moduleKey);
            const cheapestMonthly = rules.reduce((min, r) => {
              const price = parseFloat(String(r.price_monthly));
              return price > 0 && price < min ? price : min;
            }, Infinity);
            
            return (
              <div key={moduleKey} className={`bg-white rounded-[2.5rem] p-6 border-2 transition-all ${
                isActive ? 'border-emerald-200 shadow-lg shadow-emerald-100' : 'border-slate-100'
              }`}>
                <div className={`w-14 h-14 bg-gradient-to-br ${getModuleColor(moduleKey)} rounded-2xl flex items-center justify-center text-white mb-4`}>
                  {getModuleIcon(moduleKey)}
                </div>
                <h3 className="font-black uppercase italic text-lg text-slate-800 mb-2">
                  {getModuleLabel(moduleKey)}
                </h3>
                <p className="text-xs text-slate-400 font-medium mb-4">
                  {rules.length} recursos disponíveis
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    {isActive ? (
                      <span className="text-emerald-600 font-black text-xs uppercase flex items-center gap-1">
                        <Check size={14} /> Ativo
                      </span>
                      ) : (
                        <span className="text-slate-400 font-bold text-xs">
                          {isFinite(cheapestMonthly) ? `De R$ ${cheapestMonthly.toFixed(2)}/mês` : 'Grátis'}
                        </span>
                    )}
                  </div>
                  {!isActive && (
                    <button 
                      onClick={() => setActiveTab('modules')}
                      className="bg-orange-500 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-orange-600 transition-all"
                    >
                      Ativar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'modules' && (
        <div className="space-y-8">
          {Object.entries(groupedRules).map(([moduleKey, rules]) => {
            const isActive = isModuleActive(moduleKey);
            
            return (
              <div key={moduleKey} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
                <div className={`bg-gradient-to-r ${getModuleColor(moduleKey)} p-6 flex items-center justify-between`}>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-2xl text-white">
                      {getModuleIcon(moduleKey)}
                    </div>
                    <div>
                      <h3 className="font-black uppercase italic text-xl text-white">
                        {getModuleLabel(moduleKey)}
                      </h3>
                      <p className="text-white/70 text-xs font-medium">
                        {rules.length} recursos configurados
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <span className="bg-white/20 text-white px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2">
                      <Star size={14} fill="currentColor" /> Ativo
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left pb-4 text-[10px] font-black uppercase text-slate-400">Recurso</th>
                        <th className="text-center pb-4 text-[10px] font-black uppercase text-slate-400">Grátis</th>
                        <th className="text-center pb-4 text-[10px] font-black uppercase text-slate-400">Por Uso</th>
                        <th className="text-center pb-4 text-[10px] font-black uppercase text-slate-400">Mensal</th>
                        <th className="text-right pb-4 text-[10px] font-black uppercase text-slate-400">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rules.map((rule) => {
                        const ruleActive = isFeatureActive(moduleKey, rule.feature_key);
                        const isFree = rule.free_limit > 0 && isFreeAvailable(rule);
                        return (
                        <tr key={rule.id} className="border-b border-slate-50 last:border-0">
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-800">{rule.feature_name}</p>
                              {ruleActive && (
                                <Check size={14} className="text-emerald-500" />
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono">{rule.feature_key}</p>
                          </td>
                          <td className="py-4 text-center">
                            {isFree ? (
                              <div>
                                <span className="text-emerald-600 font-bold">{rule.free_limit}x</span>
                                <p className="text-[9px] text-emerald-500">Disponível</p>
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-4 text-center">
                            <span className="text-emerald-600 font-bold">
                              {rule.price_per_use > 0 ? formatPrice(rule.price_per_use) : '-'}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <span className="text-blue-600 font-bold">
                              {rule.price_monthly > 0 ? formatPrice(rule.price_monthly) : '-'}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex gap-2 justify-end">
                              {ruleActive ? (
                                <span className="px-3 py-2 bg-emerald-100 text-emerald-600 rounded-lg font-bold text-[10px] uppercase flex items-center gap-1">
                                  <Check size={12} /> Assinado
                                </span>
                              ) : isFree ? (
                                <span className="px-3 py-2 bg-emerald-100 text-emerald-600 rounded-lg font-bold text-[10px] uppercase">
                                  Grátis
                                </span>
                              ) : rule.free_limit > 0 && isFreeAvailable(rule) ? (
                                <span className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg font-bold text-[10px] uppercase">
                                  Grátis
                                </span>
                              ) : (
                                <>
                                  {rule.price_per_use > 0 && (
                                    <button
                                      onClick={() => handlePurchasePerUse(moduleKey, rule.feature_key, rule.price_per_use)}
                                      disabled={purchasing === `${moduleKey}-${rule.feature_key}`}
                                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-bold text-[10px] uppercase transition-all"
                                    >
                                      {purchasing === `${moduleKey}-${rule.feature_key}` ? (
                                        <Loader2 className="animate-spin" size={14} />
                                      ) : (
                                        'Comprar'
                                      )}
                                    </button>
                                  )}
                                  {rule.price_monthly > 0 && (
                                    <button
                                      onClick={() => handleSubscribe(moduleKey, rule.feature_key, rule.price_monthly)}
                                      disabled={purchasing === `${moduleKey}-${rule.feature_key}`}
                                      className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-[10px] uppercase flex items-center gap-1 transition-all"
                                    >
                                      {purchasing === `${moduleKey}-${rule.feature_key}` ? (
                                        <Loader2 className="animate-spin" size={14} />
                                      ) : (
                                        <>
                                          <Crown size={12} /> Assinar
                                        </>
                                      )}
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8">
          <h3 className="font-black uppercase italic text-lg text-slate-800 mb-6">Histórico de Assinaturas</h3>
          <div className="text-center py-12 text-slate-400">
            <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-medium">Nenhuma assinatura ativa no momento</p>
            <p className="text-xs mt-2">Assine um plano para desbloquear recursos</p>
          </div>
        </div>
      )}
    </div>
  );
}
