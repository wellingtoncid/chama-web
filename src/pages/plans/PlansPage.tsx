import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';
import { 
  Check, Loader2, Crown, Truck, 
  ShoppingBag, Megaphone, FileText,
  AlertCircle, User, Building2, 
  CreditCard, History
} from 'lucide-react';
import Swal from 'sweetalert2';
import RequestModal from '../../components/modals/RequestModal';

// Canonical payment flow will be used via the existing MP checkout from cards
// No extra modals; plan purchases go through the canonical path

// Components
import ModuleCard from './components/ModuleCard';
import FreightModule from './components/FreightModule';
import MarketplaceModule from './components/MarketplaceModule';
import AdvertiserModule from './components/AdvertiserModule';
import QuotesModule from './components/QuotesModule';
import DriverModule from './components/DriverModule';
import { useModuleData } from './hooks/useModuleData';

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

interface UserModule {
  key: string;
  name: string;
  is_active: boolean;
  requires_approval?: boolean;
  approval_status?: string;
}

interface ModuleInfo {
  key: string;
  name: string;
  icon: React.ReactNode;
  requiresApproval: boolean;
  comingSoon?: boolean;
  description?: string;
  showFor: ('company' | 'driver')[];
}

export default function PlansPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [userModules, setUserModules] = useState<UserModule[]>([]);
  const [driverHasContracted, setDriverHasContracted] = useState(false);
  const [driverVerificationStatus, setDriverVerificationStatus] = useState<{
    status: string | null;
    rejection_reason: string | null;
  }>({ status: null, rejection_reason: null });
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [requestModal, setRequestModal] = useState<{isOpen: boolean, moduleKey: string, moduleName: string}>({
    isOpen: false,
    moduleKey: '',
    moduleName: ''
  });
  const [togglingMarketplace, setTogglingMarketplace] = useState(false);
  const [togglingAdvertiser, setTogglingAdvertiser] = useState(false);
  const [companyVerificationStatus, setCompanyVerificationStatus] = useState<{
    is_verified: boolean;
    has_pending: boolean;
    verification: any | null;
  }>({ is_verified: false, has_pending: false, verification: null });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [usageStats, setUsageStats] = useState<{freights: any, marketplace: any}>({
    freights: { used: 0, limit: 0, remaining: 0 },
    marketplace: { used: 0, limit: 0, remaining: 0 }
  });
  // Removed: payment modal flow canônico; base MVP uses existing flow

  const userRole = (() => {
    const userData = localStorage.getItem('@ChamaFrete:user');
    if (!userData) return 'driver';
    const user = JSON.parse(userData);
    return user.role || user.account_type || 'driver';
  })();

  const isDriver = userRole === 'driver';
  const isCompany = userRole === 'company';

  const { getModuleStatus, getModuleRules, getSubscriptionPlans, getActivePlanIdForModule } = useModuleData({
    pricingRules,
    plans,
    userModules,
    isDriver,
    isCompany,
    driverHasContracted,
    companyVerificationStatus,
    transactions,
  });

  const allModules: ModuleInfo[] = [
    { key: 'freights', name: 'Logística', icon: <Truck size={24} />, requiresApproval: false, description: 'Publique fretes e encontre motoristas', showFor: ['company'] },
    { key: 'marketplace', name: 'Marketplace', icon: <ShoppingBag size={24} />, requiresApproval: false, description: 'Venda produtos e peças', showFor: ['company', 'driver'] },
    { key: 'advertiser', name: 'Publicidade', icon: <Megaphone size={24} />, requiresApproval: true, description: 'Destaque sua empresa e anúncios', showFor: ['company'] },
    { key: 'driver', name: 'Driver Pro', icon: <User size={24} />, requiresApproval: false, description: 'Recursos para motoristas', showFor: ['driver'] },
    { key: 'company_pro', name: 'Company Pro', icon: <Building2 size={24} />, requiresApproval: false, description: 'Recursos exclusivos para empresas', showFor: ['company'] },
  ];

  // Cotação removida do MVP
  const modules = allModules.filter(m => m.showFor.includes(userRole as 'company' | 'driver'));

  useEffect(() => { loadData(); }, []);

  // Current user for MVP MercadoPago checkout (if available)
  const currentUserRaw = (() => {
    try {
      const raw = localStorage.getItem('@ChamaFrete:user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const mpUserId = currentUserRaw?.id ?? null;

  const loadData = async () => {
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
      
      const moduleIndex = 3;
      if (isDriver && results[moduleIndex]?.data?.success) {
        const statusData = results[moduleIndex].data.data;
        setDriverHasContracted(statusData.is_verified || false);
        const txStatus = statusData.last_transaction_status;
        if (txStatus === 'awaiting_review') setDriverVerificationStatus({ status: 'pending_docs', rejection_reason: null });
        else if (txStatus === 'approved' || statusData.is_verified) setDriverVerificationStatus({ status: 'approved', rejection_reason: null });
        else if (txStatus === 'rejected') setDriverVerificationStatus({ status: 'rejected', rejection_reason: statusData.rejection_reason || null });
        else setDriverVerificationStatus({ status: txStatus || null, rejection_reason: statusData.rejection_reason || null });
      }

      if (isCompany && results[moduleIndex + (isDriver ? 1 : 0)]?.data?.success) {
        const statusData = results[moduleIndex + (isDriver ? 1 : 0)].data.data;
        setCompanyVerificationStatus({
          is_verified: statusData.is_verified || false,
          has_pending: statusData.has_pending || false,
          verification: statusData.verification || null
        });
      }

      // Carrega transações e saldo da carteira
      try {
        const [txRes, walletRes] = await Promise.all([
          api.get('/my-transactions').catch(() => ({ data: { success: false } })),
          api.get('/wallet/balance').catch(() => ({ data: { success: false } }))
        ]);
        
        if (txRes.data?.success) {
          setTransactions(txRes.data.data || []);
        }
        
        // Carrega saldo da carteira
        if (walletRes.data?.success) {
          setWalletBalance(walletRes.data.data?.balance || 0);
        }

        // Carrega stats de uso
        try {
          const usageRes = await api.get('/user/usage').catch(() => ({ data: { success: false } }));
          if (usageRes.data?.success) {
            setUsageStats(usageRes.data.data || {
              freights: { used: 0, limit: 0, remaining: 0 },
              marketplace: { used: 0, limit: 0, remaining: 0 }
            });
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
  };

  // MVP: render checkout option if user is logged in and plans exist
  const showCheckout = mpUserId && plans && plans.length > 0;

  const handleModuleClick = (mod: ModuleInfo) => {
    const status = getModuleStatus(mod.key);

    // Cotações: SEMPRE abre RequestModal
    if (mod.key === 'quotes') {
      setRequestModal({ isOpen: true, moduleKey: mod.key, moduleName: mod.name });
      return;
    }

    // Publicidade: ativa → detalhes, inativa → RequestModal
    if (mod.key === 'advertiser') {
      if (status.isActive) {
        setSelectedModule(mod.key);
      } else {
        setRequestModal({ isOpen: true, moduleKey: mod.key, moduleName: mod.name });
      }
      return;
    }

    // Company Pro: navega para página dedicada
    if (mod.key === 'company_pro') {
      navigate('/dashboard/company-pro');
      return;
    }

    // Demais módulos: abre detalhes
    setSelectedModule(mod.key);
  };

  const openRequestSwal = (moduleKey: string, moduleName: string) => {
    Swal.fire({
      title: `Solicitar: ${moduleName}`,
      html: `
        <div class="text-left space-y-3">
          <div>
            <label class="text-xs font-bold text-slate-500 uppercase block mb-1">Canal de Contato</label>
            <input id="swal-contact" class="swal2-input" placeholder="WhatsApp ou E-mail" style="width:100%;margin:0">
          </div>
          <div>
            <label class="text-xs font-bold text-slate-500 uppercase block mb-1">Justificativa (opcional)</label>
            <textarea id="swal-justification" class="swal2-textarea" placeholder="Por que precisa?" style="width:100%;margin:0"></textarea>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Enviar',
      confirmButtonColor: '#059669',
      preConfirm: async () => {
        const contact = (document.getElementById('swal-contact') as HTMLInputElement).value;
        const justification = (document.getElementById('swal-justification') as HTMLTextAreaElement).value;
        if (!contact) { Swal.showValidationMessage('Preencha o contato'); return false; }
        try {
          await api.post('/user/modules/request', { module_key: moduleKey, contact_info: contact, justification });
          return true;
        } catch (e: any) {
          Swal.showValidationMessage(e.response?.data?.message || 'Erro ao enviar');
          return false;
        }
      }
    }).then((result) => {
      if (result.isConfirmed) Swal.fire('Enviado!', 'Nossa equipe entrará em contato.', 'success');
    });
  };

  const handlePurchase = async (moduleKey: string, feature: PricingRule, currentBalance?: number) => {
    console.log("handlePurchase chamado:", moduleKey, feature.feature_key);
    try {
      setPurchasing(`${moduleKey}-${feature.feature_key}`);
      const isDriverVerification = moduleKey === 'driver' && feature.feature_key === 'document_verification';
      const isCompanyVerification = moduleKey === 'company_pro' && feature.feature_key === 'identity_verification';
      
      // Para verificações, usa fluxo antigo
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

      // Busca preço do recurso
      const amount = Number(feature.price_per_use) || 0;
      const balance = currentBalance ?? walletBalance;

      // Mostra modal de escolha
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
        // Pagamento parcial - primeiro debita saldo, depois MP
        try {
          // Debita saldo parcial
          const partialRes = await api.post('/module/purchase-partial', {
            module_key: moduleKey,
            feature_key: feature.feature_key,
            wallet_amount: balance
          });
          
          if (partialRes.data?.success) {
            // Agora redireciona para MP com o restante
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

      // Chama API com escolha do usuário
      const res = await api.post('/module/purchase-per-use', {
        module_key: moduleKey,
        feature_key: feature.feature_key,
        payment_method: paymentChoice
      });

      console.log("Resposta purchasePerUse:", res.data);

      if (res.data?.success) {
        if (res.data.payment_method === 'wallet') {
          Swal.fire({ 
            icon: 'success', 
            title: 'Recurso Adquirido!', 
            text: `Saldo restante: R$ ${parseFloat(res.data.new_balance).toFixed(2).replace('.', ',')}`,
            timer: 3000, 
            showConfirmButton: false 
          });
          setWalletBalance(parseFloat(res.data.new_balance));
          loadData();
        } else if (res.data.url) {
          window.location.href = res.data.url;
        }
      } else {
        Swal.fire({ icon: 'error', title: 'Erro', text: res.data?.message || 'Não foi possível processar' });
      }
    } catch (e: any) {
      console.error("Erro no handlePurchase:", e);
      const message = e.response?.data?.message || e.message || 'Erro ao processar';
      if (e.response?.data?.requires_module_activation) {
        setRequestModal({ isOpen: true, moduleKey, moduleName: allModules.find(m => m.key === moduleKey)?.name || moduleKey });
      } else {
        Swal.fire({ icon: 'error', title: 'Erro', text: message });
      }
    } finally {
      setPurchasing(null);
    }
  };

  const handlePlanSelect = async (plan: any) => {
    // Determina o módulo baseado na categoria do plano
    const categoryToModule: Record<string, string> = {
      'freight_subscription': 'freights',
      'marketplace_subscription': 'marketplace',
      'advertising': 'advertiser',
    };
    const moduleKey = categoryToModule[plan.category] || plan.category;

    // Verifica se plano já está ativo
    const currentPlanId = getActivePlanIdForModule(moduleKey);
    if (currentPlanId === plan.id) {
      Swal.fire({ 
        icon: 'info', 
        title: 'Plano Já Ativo', 
        text: 'Este plano já está ativo na sua conta.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#059669'
      });
      return;
    }

    // Plano gratuito → ativa direto sem confirmação
    if (Number(plan.price) === 0) {
      try {
        const res = await api.post('/plans/subscribe', { plan_id: plan.id });
        if (res.data?.success) {
          Swal.fire({ icon: 'success', title: 'Plano Ativado!', timer: 3000, showConfirmButton: false });
          loadData();
        } else {
          Swal.fire({ icon: 'error', title: 'Erro', text: res.data?.message || 'Erro ao ativar plano' });
        }
      } catch (e: any) {
        console.error("Erro ao ativar plano:", e);
        Swal.fire({ icon: 'error', title: 'Erro', text: e.response?.data?.message || e.message || 'Erro ao ativar plano' });
      }
      return;
    }

    // Plano pago → confirmação
    try {
      const result = await Swal.fire({
        title: `Assinar Plano: ${plan.name}`,
        text: `Valor: R$ ${Number(plan.price).toFixed(2).replace('.', ',')}/mês`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ir para Pagamento',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#059669'
      });
      
      if (result.isConfirmed) {
        console.log("Plano selecionado:", plan.id, plan.name);
        
        const res = await api.post('/plans/subscribe', { plan_id: plan.id });
        console.log("Resposta API:", res.data);
        
        if (res.data?.success) {
          if (res.data.url) {
            console.log("Redirecionando para:", res.data.url);
            window.location.href = res.data.url;
          } else {
            Swal.fire({ icon: 'success', title: 'Plano Ativado!', timer: 3000, showConfirmButton: false });
            loadData();
          }
        } else {
          Swal.fire({ icon: 'error', title: 'Erro', text: res.data?.message || 'Não foi possível assinar' });
        }
      }
    } catch (e: any) {
      console.error("Erro ao processar assinatura:", e);
      Swal.fire({ icon: 'error', title: 'Erro', text: e.response?.data?.message || e.message || 'Erro ao processar assinatura' });
    }
  };

  const handleRequestSuccess = () => {
    setRequestModal({ isOpen: false, moduleKey: '', moduleName: '' });
    loadData();
  };

  const toggleMarketplace = async (activate: boolean) => {
    setTogglingMarketplace(true);
    try {
      const res = await api.post('/user/modules', { module_key: 'marketplace', action: activate ? 'activate' : 'deactivate' });
      if (res.data.success) {
        await loadData();
        Swal.fire({ icon: 'success', title: activate ? 'Marketplace ativado!' : 'Marketplace desativado', timer: 3000, showConfirmButton: false });
      }
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: 'Erro', text: e.response?.data?.message || 'Erro' });
    } finally { setTogglingMarketplace(false); }
  };

  const toggleAdvertiser = async (activate: boolean) => {
    setTogglingAdvertiser(true);
    try {
      const res = await api.post('/user/modules', { module_key: 'advertiser', action: activate ? 'activate' : 'deactivate' });
      if (res.data.success) {
        await loadData();
        Swal.fire({ icon: 'success', title: activate ? 'Publicidade ativada!' : 'Publicidade desativada', timer: 3000, showConfirmButton: false });
      }
    } catch (e: any) {
      Swal.fire({ icon: 'error', title: 'Erro', text: e.response?.data?.message || 'Erro' });
    } finally { setTogglingAdvertiser(false); }
  };

  if (loading) return (
    <div className="p-20 flex flex-col items-center justify-center animate-pulse">
      <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Carregando...</span>
    </div>
  );

  // ==========================================
  // HISTÓRICO DE TRANSAÇÕES
  // ==========================================
  const getModuleIcon = (iconKey: string) => {
    switch (iconKey) {
      case 'truck': return <Truck size={16} className="text-orange-500" />;
      case 'shopping-bag': return <ShoppingBag size={16} className="text-purple-500" />;
      case 'megaphone': return <Megaphone size={16} className="text-amber-500" />;
      case 'user': return <User size={16} className="text-blue-500" />;
      case 'file-text': return <FileText size={16} className="text-slate-500" />;
      case 'credit-card': return <CreditCard size={16} className="text-emerald-500" />;
      default: return <CreditCard size={16} className="text-slate-400" />;
    }
  };

  const TransactionHistory = () => {
    if (transactions.length === 0) return null;
    
    return (
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History size={20} className="text-slate-400 dark:text-slate-500" />
            <h3 className="font-black uppercase text-sm text-slate-600 dark:text-slate-300">Histórico de Transações</h3>
          </div>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            {showHistory ? 'Ocultar' : 'Ver Todas'}
          </button>
        </div>
        
        {showHistory && (
          <div className="space-y-2">
            {transactions.slice(0, 10).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${tx.status === 'approved' ? 'bg-emerald-500' : tx.status === 'pending' ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 dark:bg-slate-600 rounded-lg">
                      {getModuleIcon(tx.module_icon || 'credit-card')}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-100">{tx.display_name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-400">{tx.category_label}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm dark:text-slate-100">
                    {parseFloat(tx.amount) === 0 ? 'Grátis' : `R$ ${parseFloat(tx.amount).toFixed(2).replace('.', ',')}`}
                  </p>
                  <p className={`text-xs font-bold uppercase ${
                    tx.status === 'approved' ? 'text-emerald-600 dark:text-emerald-400' : 
                    tx.status === 'pending' ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {tx.status === 'approved' ? 'Aprovado' : tx.status === 'pending' ? 'Pendente' : tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // SELETOR DE MÓDULOS
  // ==========================================
  if (!selectedModule) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[3rem] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500 p-3 rounded-2xl"><Crown size={28} /></div>
              <div>
                <h2 className="text-3xl font-black uppercase italic">Planos & Recursos</h2>
                <p className="text-slate-300 text-sm font-medium">
                  {isDriver ? 'Recursos para destacar seu perfil e vender no marketplace' : 'Selecione um módulo para ver os recursos disponíveis'}
                </p>
              </div>
            </div>
            
            {/* Saldo da Carteira */}
            <button 
              onClick={() => navigate('/dashboard/wallet')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 text-right transition-all"
            >
              <p className="text-[10px] font-black uppercase text-slate-400">Saldo Carteira</p>
              <p className="text-lg font-black text-emerald-400">
                R$ {walletBalance.toFixed(2).replace('.', ',')}
              </p>
            </button>
          </div>
        </div>

        {/* Medidor de Uso */}
        {(usageStats.freights?.limit > 0 || isCompany) && (
          <div className="grid grid-cols-2 gap-4">
            {isCompany && (
              <>
                <div className={`bg-white dark:bg-slate-800 rounded-2xl p-4 ${usageStats.freights?.remaining === 0 ? 'border-2 border-red-300 dark:border-red-600' : 'border border-slate-200 dark:border-slate-700'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Truck size={18} className="text-orange-500" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Fretes</span>
                    </div>
                    <span className={`text-xs font-bold ${usageStats.freights?.remaining === 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {usageStats.freights?.remaining === 0 ? 'Limite atingido' : `${usageStats.freights?.remaining} restantes`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${usageStats.freights?.remaining === 0 ? 'bg-red-500' : 'bg-orange-500'}`}
                      style={{ width: `${usageStats.freights?.limit > 0 ? (usageStats.freights?.used / usageStats.freights?.limit) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 text-center">
                    {usageStats.freights?.used || 0} / {usageStats.freights?.limit || 0} publicados neste mês
                  </p>
                </div>

                <div className={`bg-white dark:bg-slate-800 rounded-2xl p-4 ${usageStats.marketplace?.remaining === 0 ? 'border-2 border-red-300 dark:border-red-600' : 'border border-slate-200 dark:border-slate-700'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={18} className="text-purple-500" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Marketplace</span>
                    </div>
                    <span className={`text-xs font-bold ${usageStats.marketplace?.remaining === 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {usageStats.marketplace?.remaining === 0 ? 'Limite atingido' : `${usageStats.marketplace?.remaining} restantes`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${usageStats.marketplace?.remaining === 0 ? 'bg-red-500' : 'bg-purple-500'}`}
                      style={{ width: `${usageStats.marketplace?.limit > 0 ? (usageStats.marketplace?.used / usageStats.marketplace?.limit) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 text-center">
                    {usageStats.marketplace?.used || 0} / {usageStats.marketplace?.limit || 0} publicados neste mês
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Histórico de Transações */}
        <TransactionHistory />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((mod) => {
            const status = getModuleStatus(mod.key);
            const rules = getModuleRules(mod.key);
            return (
              <ModuleCard
                key={mod.key}
                module={mod}
                status={status}
                rulesCount={rules.length}
                onClick={() => handleModuleClick(mod)}
                disabled={rules.length === 0 && mod.key !== 'quotes'}
              />
            );
          })}
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-start gap-3">
          <CreditCard size={20} className="text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-blue-800 dark:text-blue-300 uppercase italic">Recursos: Carteira ou Mercado Pago</p>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">
              Recursos avulsos usam saldo da carteira. Se não tiver saldo, pode pagar via Mercado Pago. Planos usam Mercado Pago.
            </p>
          </div>
        </div>

        <RequestModal
          isOpen={requestModal.isOpen}
          onClose={() => setRequestModal({ isOpen: false, moduleKey: '', moduleName: '' })}
          moduleName={requestModal.moduleName}
          moduleKey={requestModal.moduleKey}
          onSuccess={handleRequestSuccess}
        />
      </div>
    );
  }

  // ==========================================
  // DETALHES DO MÓDULO SELECIONADO
  // ==========================================
  const currentModule = allModules.find(m => m.key === selectedModule)!;
  const status = getModuleStatus(selectedModule);

  return (
    <>
      
      {selectedModule === 'freights' && (
        <FreightModule
          plans={getSubscriptionPlans('freight_subscription')}
          rules={getModuleRules('freights')}
          isActive={status.isActive}
          onBack={() => setSelectedModule(null)}
          onPlanSelect={handlePlanSelect}
          onPurchase={handlePurchase}
          purchasing={purchasing}
          currentPlanId={getActivePlanIdForModule('freights')}
        />
      )}

      {selectedModule === 'marketplace' && (
        <MarketplaceModule
          plans={getSubscriptionPlans('marketplace_subscription')}
          rules={getModuleRules('marketplace')}
          isActive={status.isActive}
          onBack={() => setSelectedModule(null)}
          onToggle={toggleMarketplace}
          onPlanSelect={handlePlanSelect}
          onPurchase={handlePurchase}
          purchasing={purchasing}
          toggling={togglingMarketplace}
          currentPlanId={getActivePlanIdForModule('marketplace')}
        />
      )}

      {selectedModule === 'advertiser' && (
        <AdvertiserModule
          plans={getSubscriptionPlans('advertising')}
          rules={getModuleRules('advertiser')}
          isActive={status.isActive}
          onBack={() => setSelectedModule(null)}
          onToggle={toggleAdvertiser}
          onPlanSelect={handlePlanSelect}
          onPurchase={handlePurchase}
          purchasing={purchasing}
          toggling={togglingAdvertiser}
          currentPlanId={getActivePlanIdForModule('advertiser')}
        />
      )}

      // Cotações removidas do MVP

      {selectedModule === 'driver' && (
        <DriverModule
          rules={getModuleRules('driver')}
          onBack={() => setSelectedModule(null)}
          verificationStatus={driverVerificationStatus}
          hasContracted={driverHasContracted}
          onPurchase={handlePurchase}
          purchasing={purchasing}
          walletBalance={walletBalance}
        />
      )}

      {/* RequestModal removed as part of canonical flow; cotação module is isolated for future */}
    </>
  );
}
