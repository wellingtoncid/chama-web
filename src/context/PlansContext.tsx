/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { api } from '../api/api';
import { useAuth } from './AuthContext';
import { useModuleData } from '../pages/plans/hooks/useModuleData';
import { isCompany as isCompanyRole, isDriver as isDriverRole } from '../constants/roleUtils';

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
  is_public: number;
}

interface UserModule {
  key: string;
  name: string;
  is_active: boolean;
  plan_id?: number | null;
  requires_approval?: boolean;
  approval_status?: string;
}

interface PlansContextData {
  loading: boolean;
  plans: any[];
  pricingRules: PricingRule[];
  userModules: UserModule[];
  transactions: any[];
  walletBalance: number;
  usageStats: any;
  isDriver: boolean;
  isCompany: boolean;
  driverHasContracted: boolean;
  driverVerificationStatus: { status: string | null; rejection_reason: string | null };
  companyVerificationStatus: any;
  togglingAdvertiser: boolean;
  purchasing: string | null;
  getModuleStatus: (key: string) => { isActive: boolean; requiresApproval: boolean; approvalStatus: string | null };
  getModuleRules: (key: string) => PricingRule[];
  getSubscriptionPlans: (type: string) => any[];
  getActivePlanIdForModule: (key: string) => number | null;
  handlePlanSelect: (plan: any) => Promise<void>;
  handlePurchase: (moduleKey: string, feature: PricingRule, currentBalance?: number) => Promise<void>;
  toggleAdvertiser: (activate: boolean) => Promise<void>;
  loadData: () => Promise<void>;
}

const PlansContext = createContext<PlansContextData | null>(null);

export function PlansProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const role = String(authUser?.role || '').toLowerCase();
  const isDriver = isDriverRole(role);
  const isCompany = isCompanyRole(role);

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [userModules, setUserModules] = useState<UserModule[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [usageStats, setUsageStats] = useState<any>({ freights: { used: 0, limit: 0, remaining: 0 }, marketplace: { used: 0, limit: 0, remaining: 0 } });
  const [driverHasContracted, setDriverHasContracted] = useState(false);
  const [driverVerificationStatus, setDriverVerificationStatus] = useState<{ status: string | null; rejection_reason: string | null }>({ status: null, rejection_reason: null });
  const [companyVerificationStatus, setCompanyVerificationStatus] = useState<any>({ is_verified: false, has_pending: false, verification: null });
  const [togglingAdvertiser, setTogglingAdvertiser] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const promises = [
        api.get('/pricing/rules').catch(() => ({ data: { success: false } })),
        api.get('/plans').catch(() => ({ data: { success: false } })),
        api.get('/user/modules').catch(() => ({ data: { success: false } })),
      ];

      if (isDriver) promises.push(api.get('/driver/verification/status').catch(() => ({ data: { success: false } })));
      if (isCompany) promises.push(api.get('/company/verification/status').catch(() => ({ data: { success: false } })));

      const results = await Promise.all(promises);

      if (results[0].data?.success) setPricingRules(results[0].data.data || []);
      if (results[1].data?.success) setPlans(results[1].data.plans || results[1].data.data || []);
      if (results[2].data?.success) setUserModules(results[2].data.data?.modules || []);

      const idx = 3;
      if (isDriver && results[idx]?.data?.success) {
        const statusData = results[idx].data.data;
        setDriverHasContracted(statusData.is_verified || false);
        const txStatus = statusData.last_transaction_status;
        if (txStatus === 'awaiting_review') setDriverVerificationStatus({ status: 'pending_docs', rejection_reason: null });
        else if (txStatus === 'approved' || statusData.is_verified) setDriverVerificationStatus({ status: 'approved', rejection_reason: null });
        else if (txStatus === 'rejected') setDriverVerificationStatus({ status: 'rejected', rejection_reason: statusData.rejection_reason || null });
        else setDriverVerificationStatus({ status: txStatus || null, rejection_reason: statusData.rejection_reason || null });
      }

      if (isCompany && results[idx + (isDriver ? 1 : 0)]?.data?.success) {
        const s = results[idx + (isDriver ? 1 : 0)].data.data;
        setCompanyVerificationStatus({
          is_verified: s.is_verified || false,
          has_pending: s.has_pending || false,
          verification: s.verification || null
        });
      }

      try {
        const [txRes, walletRes] = await Promise.all([
          api.get('/my-transactions').catch(() => ({ data: { success: false } })),
          api.get('/wallet/balance').catch(() => ({ data: { success: false } }))
        ]);

        if (txRes.data?.success) setTransactions(txRes.data.data || []);
        if (walletRes.data?.success) setWalletBalance(walletRes.data.data?.balance || 0);

        try {
          const usageRes = await api.get('/user/usage').catch(() => ({ data: { success: false } }));
          if (usageRes.data?.success) {
            setUsageStats(usageRes.data.data || { freights: { used: 0, limit: 0, remaining: 0 }, marketplace: { used: 0, limit: 0, remaining: 0 } });
          }
        } catch (e) {
          console.error("Erro ao carregar usage:", e);
        }
      } catch (e) {
        console.error("Erro ao carregar transações/saldo:", e);
      }
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
    } finally {
      setLoading(false);
    }
  }, [isDriver, isCompany]);

  useEffect(() => { loadData(); }, [loadData]);

  const { getModuleStatus, getModuleRules, getSubscriptionPlans, getActivePlanIdForModule } = useModuleData({
    pricingRules, plans, userModules, isDriver, isCompany,
    driverHasContracted, companyVerificationStatus, transactions
  });

  const handlePlanSelect = async (plan: any) => {
    const categoryToModule: Record<string, string> = {
      'freight_subscription': 'freights',
      'marketplace_subscription': 'marketplace',
      'advertising': 'advertiser',
    };
    const moduleKey = categoryToModule[plan.category] || plan.category;
    const currentPlanId = getActivePlanIdForModule(moduleKey);
    if (currentPlanId === plan.id) {
      Swal.fire({ icon: 'info', title: 'Já ativo', text: 'Este plano já está ativo na sua conta.', confirmButtonColor: '#059669' });
      return;
    }

    if (Number(plan.price) === 0) {
      try {
        const res = await api.post('/plans/subscribe', { plan_id: plan.id });
        if (res.data?.success) {
          Swal.fire({ icon: 'success', title: 'Plano Ativado!', timer: 2000, showConfirmButton: false });
          loadData();
        } else {
          Swal.fire({ icon: 'error', title: 'Erro', text: res.data?.message || 'Erro ao ativar plano' });
        }
      } catch (e: any) {
        Swal.fire({ icon: 'error', title: 'Erro', text: e.response?.data?.message || e.message || 'Erro ao ativar plano' });
      }
      return;
    }

    const amount = Number(plan.price);
    const balance = walletBalance;
    let paymentChoice = balance >= amount ? 'wallet' : 'mercadopago';

    const result = await Swal.fire({
      title: `Assinar: ${plan.name}`,
      html: `
        <div class="text-left space-y-4">
          <div class="bg-slate-50 rounded-xl p-4">
            <p class="text-sm text-slate-600">Valor do plano:</p>
            <p class="text-2xl font-black text-slate-900">R$ ${amount.toFixed(2).replace('.', ',')}/mês</p>
          </div>
          <div class="space-y-2">
            <label class="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-all payment-option" onclick="selectPayment('wallet')">
              <input type="radio" name="payment" value="wallet" class="w-5 h-5 text-emerald-600" ${balance >= amount ? 'checked' : ''}>
              <div class="flex-1">
                <p class="font-bold text-slate-900">Usar Saldo da Carteira</p>
                <p class="text-xs text-slate-500">Saldo disponível: R$ ${balance.toFixed(2).replace('.', ',')}</p>
              </div>
              ${balance >= amount ? '<span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">✓</span>' : '<span class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">Saldo insuficiente</span>'}
            </label>
            <label class="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-all" onclick="selectPayment('mercadopago')">
              <input type="radio" name="payment" value="mercadopago" class="w-5 h-5 text-blue-600" ${balance < amount ? 'checked' : ''}>
              <div class="flex-1">
                <p class="font-bold text-slate-900">Pagar com Mercado Pago</p>
                <p class="text-xs text-slate-500">Cartão, PIX ou boleto</p>
              </div>
            </label>
            ${balance > 0 ? `
            <label class="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-all" onclick="selectPayment('recharge')">
              <input type="radio" name="payment" value="recharge" class="w-5 h-5 text-amber-600">
              <div class="flex-1">
                <p class="font-bold text-slate-900">Recarregar Carteira</p>
                <p class="text-xs text-slate-500">Adicionar mais saldo</p>
              </div>
            </label>
            ` : ''}
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#059669',
      didOpen: () => {
        (window as any).selectPayment = (value: string) => {
          const radios = document.querySelectorAll('input[name="payment"]') as NodeListOf<HTMLInputElement>;
          radios.forEach(r => r.checked = r.value === value);
        };
      }
    });

    if (!result.isConfirmed) return;

    paymentChoice = (document.querySelector('input[name="payment"]:checked') as HTMLInputElement)?.value || 'mercadopago';

    if (paymentChoice === 'recharge') {
      navigate('/dashboard/wallet');
      return;
    }

    try {
      const res = await api.post('/plans/subscribe', {
        plan_id: plan.id,
        payment_method: paymentChoice,
      });
      if (res.data?.success) {
        if (res.data.payment_method === 'wallet') {
          Swal.fire({ icon: 'success', title: 'Plano Ativado!', text: `Saldo restante: R$ ${parseFloat(res.data.new_balance).toFixed(2).replace('.', ',')}`, timer: 3000, showConfirmButton: false });
          setWalletBalance(parseFloat(res.data.new_balance));
          loadData();
        } else if (res.data.url) {
          window.location.href = res.data.url;
        } else {
          Swal.fire({ icon: 'success', title: 'Plano Ativado!', timer: 2000, showConfirmButton: false });
          loadData();
        }
      } else {
        Swal.fire({ icon: 'error', title: 'Erro', text: res.data?.message || 'Não foi possível assinar' });
      }
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: 'Erro', text: e.response?.data?.message || e.message || 'Erro ao processar assinatura' });
    }
  };

  const handlePurchase = async (moduleKey: string, feature: PricingRule, currentBalance?: number) => {
    try {
      setPurchasing(`${moduleKey}-${feature.feature_key}`);
      const isDriverVerification = moduleKey === 'driver' && feature.feature_key === 'document_verification';
      const isCompanyVerification = moduleKey === 'company_pro' && feature.feature_key === 'identity_verification';

      if (isDriverVerification || isCompanyVerification) {
        let res;
        if (isDriverVerification) res = await api.post('/driver/verification/purchase');
        else res = await api.post('/company/verification/purchase');

        if (res.data?.success) {
          if (res.data.payment_method === 'wallet') {
            Swal.fire({ icon: 'success', title: 'Verificação Adquirida!', text: `Saldo restante: R$ ${parseFloat(res.data.new_balance).toFixed(2).replace('.', ',')}`, timer: 3000, showConfirmButton: false });
            setWalletBalance(parseFloat(res.data.new_balance));
          } else if (res.data.url) {
            window.location.href = res.data.url;
          }
          loadData();
        } else {
          Swal.fire({ icon: 'error', title: 'Erro', text: res.data?.message || 'Erro ao processar' });
        }
        setPurchasing(null);
        return;
      }

      const amount = Number(feature.price_per_use) || 0;
      const balance = currentBalance ?? walletBalance;
      const result = await Swal.fire({
        title: `Adquirir: ${feature.feature_name}`,
        html: `
          <div class="text-left space-y-4">
            <div class="bg-slate-50 rounded-xl p-4">
              <p class="text-sm text-slate-600">Valor do recurso:</p>
              <p class="text-2xl font-black text-slate-900">R$ ${amount.toFixed(2).replace('.', ',')}</p>
            </div>
            <div class="space-y-2">
              <label class="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-all payment-option" onclick="selectPayment('wallet')">
                <input type="radio" name="payment" value="wallet" class="w-5 h-5 text-emerald-600" ${balance >= amount ? 'checked' : ''}>
                <div class="flex-1">
                  <p class="font-bold text-slate-900">Usar Saldo da Carteira</p>
                  <p class="text-xs text-slate-500">Saldo disponível: R$ ${balance.toFixed(2).replace('.', ',')}</p>
                </div>
                ${balance >= amount ? '<span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">✓</span>' : '<span class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">Saldo insuficiente</span>'}
              </label>
              ${balance < amount && balance > 0 ? `
              <label class="flex items-center gap-3 p-3 border-2 border-emerald-200 bg-emerald-50 rounded-xl cursor-pointer hover:bg-emerald-100 transition-all" onclick="selectPayment('partial')">
                <input type="radio" name="payment" value="partial" class="w-5 h-5 text-emerald-600">
                <div class="flex-1">
                  <p class="font-bold text-emerald-800">Usar Saldo + Complementar</p>
                  <p class="text-xs text-emerald-600">Usar R$ ${balance.toFixed(2).replace('.', ',')} do saldo + R$ ${(amount - balance).toFixed(2).replace('.', ',')} via MP</p>
                </div>
                <span class="text-xs bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full font-bold">Recomendado</span>
              </label>
              ` : ''}
              <label class="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-all" onclick="selectPayment('mercadopago')">
                <input type="radio" name="payment" value="mercadopago" class="w-5 h-5 text-blue-600" ${balance < amount ? 'checked' : ''}>
                <div class="flex-1">
                  <p class="font-bold text-slate-900">Pagar com Mercado Pago</p>
                  <p class="text-xs text-slate-500">Cartão, PIX ou boleto</p>
                </div>
              </label>
              ${balance > 0 ? `
              <label class="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-all" onclick="selectPayment('recharge')">
                <input type="radio" name="payment" value="recharge" class="w-5 h-5 text-amber-600">
                <div class="flex-1">
                  <p class="font-bold text-slate-900">Recarregar Carteira</p>
                  <p class="text-xs text-slate-500">Adicionar mais saldo</p>
                </div>
              </label>
              ` : ''}
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#059669',
        didOpen: () => {
          (window as any).selectPayment = (value: string) => {
            const radios = document.querySelectorAll('input[name="payment"]') as NodeListOf<HTMLInputElement>;
            radios.forEach(r => r.checked = r.value === value);
          };
        }
      });

      if (!result.isConfirmed) {
        setPurchasing(null);
        return;
      }

      const paymentChoice = (document.querySelector('input[name="payment"]:checked') as HTMLInputElement)?.value || 'mercadopago';

      if (paymentChoice === 'recharge') {
        navigate('/dashboard/wallet');
        setPurchasing(null);
        return;
      }

      if (paymentChoice === 'partial') {
        try {
          const partialRes = await api.post('/module/purchase-partial', {
            module_key: moduleKey,
            feature_key: feature.feature_key,
            wallet_amount: balance
          });

          if (partialRes.data?.success) {
            const remaining = amount - balance;
            const mpRes = await api.post('/module/purchase-per-use', {
              module_key: moduleKey,
              feature_key: feature.feature_key,
              payment_method: 'mercadopago',
              amount_to_charge: remaining,
              wallet_amount_used: balance
            });

            if (mpRes.data?.success && mpRes.data?.url) {
              setWalletBalance(0);
              window.location.href = mpRes.data.url;
            } else if (mpRes.data?.success && mpRes.data?.payment_method === 'wallet') {
              Swal.fire({ icon: 'success', title: 'Recurso Adquirido!', text: `Saldo restante: R$ ${parseFloat(mpRes.data.new_balance).toFixed(2).replace('.', ',')}`, timer: 3000, showConfirmButton: false });
              setWalletBalance(parseFloat(mpRes.data.new_balance));
              loadData();
            }
          }
        } catch (e: any) {
          Swal.fire({ icon: 'error', title: 'Erro', text: e.response?.data?.message || 'Erro ao processar' });
        }
        setPurchasing(null);
        return;
      }

      const res = await api.post('/module/purchase-per-use', {
        module_key: moduleKey,
        feature_key: feature.feature_key,
        payment_method: paymentChoice
      });

      if (res.data?.success) {
        if (res.data.payment_method === 'wallet') {
          Swal.fire({ icon: 'success', title: 'Recurso Adquirido!', text: `Saldo restante: R$ ${parseFloat(res.data.new_balance).toFixed(2).replace('.', ',')}`, timer: 3000, showConfirmButton: false });
          setWalletBalance(parseFloat(res.data.new_balance));
          loadData();
        } else if (res.data.url) {
          window.location.href = res.data.url;
        }
      } else {
        Swal.fire({ icon: 'error', title: 'Erro', text: res.data?.message || 'Não foi possível processar' });
      }
    } catch (e: any) {
      const message = e.response?.data?.message || e.message || 'Erro ao processar';
      if (!e.response?.data?.requires_module_activation) {
        Swal.fire({ icon: 'error', title: 'Erro', text: message });
      }
    } finally {
      setPurchasing(null);
    }
  };

  const toggleAdvertiser = async (activate: boolean) => {
    setTogglingAdvertiser(true);
    try {
      const res = await api.post('/user/modules', { module_key: 'advertiser', action: activate ? 'activate' : 'deactivate' });
      if (res.data.success) {
        Swal.fire({ icon: 'success', title: activate ? 'Publicidade ativada!' : 'Publicidade desativada', timer: 2000, showConfirmButton: false });
        await loadData();
      } else {
        Swal.fire({ icon: 'error', title: 'Erro', text: res.data?.message || 'Erro' });
      }
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: 'Erro', text: e.response?.data?.message || 'Erro' });
    } finally { setTogglingAdvertiser(false); }
  };

  return (
    <PlansContext.Provider value={{
      loading,
      plans,
      pricingRules,
      userModules,
      transactions,
      walletBalance,
      usageStats,
      isDriver,
      isCompany,
      driverHasContracted,
      driverVerificationStatus,
      companyVerificationStatus,
      togglingAdvertiser,
      purchasing,
      getModuleStatus,
      getModuleRules,
      getSubscriptionPlans,
      getActivePlanIdForModule,
      handlePlanSelect,
      handlePurchase,
      toggleAdvertiser,
      loadData,
    }}>
      {children}
    </PlansContext.Provider>
  );
}

export function usePlans() {
  const ctx = useContext(PlansContext);
  if (!ctx) throw new Error('usePlans must be used within PlansProvider');
  return ctx;
}
