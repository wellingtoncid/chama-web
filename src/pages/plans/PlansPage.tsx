import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, ShoppingBag, Megaphone, User, Building2,
  CreditCard, History, FileText
} from 'lucide-react';
import RequestModal from '../../components/modals/RequestModal';
import DashboardShell from '../../components/layout/DashboardShell';
import { Button } from '../../components/ui/Button';
import ModuleCard from './components/ModuleCard';
import { usePlans } from '../../context/PlansContext';

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
  const {
    loading, plans, transactions,
    walletBalance, usageStats, isDriver, isCompany,
    getModuleStatus, getModuleRules, getActivePlanIdForModule,
  } = usePlans();

  const [requestModal, setRequestModal] = useState<{ isOpen: boolean; moduleKey: string; moduleName: string }>({
    isOpen: false, moduleKey: '', moduleName: ''
  });
  const [showHistory, setShowHistory] = useState(false);

  const userRole = isDriver ? 'driver' : 'company';

  const allModules: ModuleInfo[] = [
    { key: 'freights', name: 'Logística', icon: <Truck size={24} />, requiresApproval: false, description: 'Publique fretes e encontre motoristas', showFor: ['company'] },
    { key: 'marketplace', name: 'Marketplace', icon: <ShoppingBag size={24} />, requiresApproval: false, description: 'Venda produtos e peças', showFor: ['company', 'driver'] },
    { key: 'advertiser', name: 'Publicidade', icon: <Megaphone size={24} />, requiresApproval: true, description: 'Destaque sua empresa e anúncios', showFor: ['company'] },
    { key: 'driver', name: 'Driver Pro', icon: <User size={24} />, requiresApproval: false, description: 'Recursos para motoristas', showFor: ['driver'] },
    { key: 'company_pro', name: 'Company Pro', icon: <Building2 size={24} />, requiresApproval: false, description: 'Recursos exclusivos para empresas', showFor: ['company'] },
  ];

  const modules = allModules.filter(m => m.showFor.includes(userRole as 'company' | 'driver'));

  const handleModuleClick = (mod: ModuleInfo) => {
    const status = getModuleStatus(mod.key);

    if (mod.key === 'quotes') {
      setRequestModal({ isOpen: true, moduleKey: mod.key, moduleName: mod.name });
      return;
    }

    if (mod.key === 'advertiser') {
      if (!status.isActive) {
        setRequestModal({ isOpen: true, moduleKey: mod.key, moduleName: mod.name });
        return;
      }
    }

    if (mod.key === 'company_pro') {
      navigate('/dashboard/company-pro');
      return;
    }

    navigate(`/dashboard/planos/${mod.key}`);
  };

  const handleRequestSuccess = () => {
    setRequestModal({ isOpen: false, moduleKey: '', moduleName: '' });
    window.location.reload();
  };

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

  if (loading) {
    return (
      <DashboardShell title="Planos & Recursos" description="Carregando...">
        <div className="space-y-6 animate-pulse">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8">
            <div className="h-8 w-48 bg-slate-700 rounded mb-3" />
            <div className="h-4 w-64 bg-slate-700 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-2xl mb-4" />
                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <>
      <DashboardShell
        title="Planos & Recursos"
        description={isDriver ? 'Recursos para destacar seu perfil e vender no marketplace' : 'Selecione um módulo para ver os recursos disponíveis'}
        actions={
          <Button
            onClick={() => navigate('/dashboard/wallet')}
            variant="outline"
          >
            <CreditCard size={16} />
            R$ {walletBalance.toFixed(2).replace('.', ',')}
          </Button>
        }
      >
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
                    />
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
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 text-center">
                    {usageStats.marketplace?.used || 0} / {usageStats.marketplace?.limit || 0} publicados neste mês
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((mod) => {
            const status = getModuleStatus(mod.key);
            const rules = getModuleRules(mod.key);
            const activePlanId = getActivePlanIdForModule(mod.key);
            const activePlan = activePlanId ? plans.find((p: any) => p.id === activePlanId) : null; // eslint-disable-line @typescript-eslint/no-explicit-any
            return (
              <ModuleCard
                key={mod.key}
                module={mod}
                status={status}
                rulesCount={rules.length}
                onClick={() => handleModuleClick(mod)}
                disabled={rules.length === 0 && mod.key !== 'quotes'}
                activePlanName={activePlan?.name}
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

        {/* Histórico de Transações */}
        {transactions.length > 0 && (
          <TransactionHistoryBlock transactions={transactions} showHistory={showHistory} setShowHistory={setShowHistory} getModuleIcon={getModuleIcon} />
        )}

        <RequestModal
          isOpen={requestModal.isOpen}
          onClose={() => setRequestModal({ isOpen: false, moduleKey: '', moduleName: '' })}
          moduleName={requestModal.moduleName}
          moduleKey={requestModal.moduleKey}
          onSuccess={handleRequestSuccess}
        />
      </DashboardShell>
    </>
  );
}

function TransactionHistoryBlock({ transactions, showHistory, setShowHistory, getModuleIcon }: {
  transactions: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  showHistory: boolean;
  setShowHistory: (v: boolean) => void;
  getModuleIcon: (key: string) => React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 mb-6">
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
          {transactions.slice(0, 10).map((tx: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
            <div key={tx.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${tx.status === 'approved' ? 'bg-emerald-500' : tx.status === 'pending' ? 'bg-amber-500' : 'bg-slate-300'}`} />
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
}
