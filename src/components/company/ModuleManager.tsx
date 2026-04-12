import React, { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  ShoppingCart, Truck, FileText, MessageCircle, CreditCard,
  Users, Tag, Headphones, CheckCircle, XCircle, Loader2, Settings,
  Package, Zap, Clock
} from 'lucide-react';
import RequestModal from '../../components/modals/RequestModal';

interface Module {
  key: string;
  name: string;
  description: string;
  status: string;
  is_active: boolean;
  activated_at: string | null;
  expires_at: string | null;
  is_allowed: boolean;
  requires_approval?: boolean;
  approval_status?: 'pending' | 'approved' | 'rejected' | null;
  requested_at?: string | null;
}

interface ModuleManagerProps {
  user?: any;
}

export default function ModuleManager({ user }: ModuleManagerProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [requestModal, setRequestModal] = useState<{isOpen: boolean, moduleKey: string, moduleName: string}>({
    isOpen: false,
    moduleKey: '',
    moduleName: ''
  });

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/modules');
      if (res.data?.success) {
        setModules(res.data.data.modules);
      }
    } catch (e) {
      console.error('Erro ao carregar módulos:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = async (moduleKey: string, currentStatus: boolean) => {
    try {
      setUpdating(moduleKey);
      const action = currentStatus ? 'deactivate' : 'activate';
      const res = await api.post('/user/modules', { module_key: moduleKey, action });
      
      if (res.data?.success) {
        setModules(prev => prev.map(m => 
          m.key === moduleKey 
            ? { ...m, is_active: !currentStatus, status: !currentStatus ? 'active' : 'inactive' }
            : m
        ));
      }
    } catch (e) {
      console.error('Erro ao toggle módulo:', e);
    } finally {
      setUpdating(null);
    }
  };

  const handleRequestAccess = (moduleKey: string, moduleName: string) => {
    setRequestModal({ isOpen: true, moduleKey, moduleName });
  };

  const handleRequestSuccess = () => {
    fetchModules();
  };

  const getModuleIcon = (key: string) => {
    switch (key) {
      case 'freights': return <Truck size={24} />;
      case 'marketplace': return <ShoppingCart size={24} />;
      case 'quotes': return <FileText size={24} />;
      case 'advertiser': return <Tag size={24} />;
      case 'chat': return <MessageCircle size={24} />;
      case 'financial': return <CreditCard size={24} />;
      case 'groups': return <Users size={24} />;
      case 'plans': return <Tag size={24} />;
      case 'support': return <Headphones size={24} />;
      default: return <Package size={24} />;
    }
  };

  const getModuleColor = (key: string) => {
    switch (key) {
      case 'freights': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'marketplace': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'quotes': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'advertiser': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'chat': return 'bg-cyan-50 text-cyan-600 border-cyan-100';
      case 'financial': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'groups': return 'bg-pink-50 text-pink-600 border-pink-100';
      case 'plans': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'support': return 'bg-teal-50 text-teal-600 border-teal-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  const isPendingApproval = (module: Module) => {
    return module.requires_approval && module.approval_status === 'pending';
  };

  const isApprovalRequired = (module: Module) => {
    return module.requires_approval && !module.is_active && module.approval_status !== 'pending';
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
          <Settings size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black uppercase italic text-slate-900">Módulos do Sistema</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Ative ou desative funcionalidades
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map((module) => (
          <div 
            key={module.key}
            className={`relative p-5 rounded-2xl border-2 transition-all ${
              module.is_active 
                ? 'border-emerald-200 bg-emerald-50/30' 
              : isPendingApproval(module)
                ? 'border-amber-300 bg-amber-50/50'
                : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getModuleColor(module.key)}`}>
                {getModuleIcon(module.key)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-black text-slate-900 uppercase italic text-sm">{module.name}</h4>
                  {module.is_active && (
                    <CheckCircle size={14} className="text-emerald-500" />
                  )}
                  {isPendingApproval(module) && (
                    <Clock size={14} className="text-amber-500" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-medium">{module.description}</p>
                
                {module.is_active && module.activated_at && (
                  <p className="text-[9px] text-emerald-600 mt-2 font-bold">
                    Ativado em {new Date(module.activated_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
                
                {isPendingApproval(module) && (
                  <p className="text-[9px] text-amber-600 mt-2 font-bold flex items-center gap-1">
                    <Clock size={10} />
                    Aguardando aprovação...
                  </p>
                )}
              </div>
            </div>

            {module.is_allowed ? (
              <>
                {isPendingApproval(module) ? (
                  <div className="mt-4 py-3 px-4 rounded-xl bg-amber-100 text-center">
                    <p className="text-[9px] font-black text-amber-700 uppercase">
                      Aguardando Aprovação
                    </p>
                  </div>
                ) : isApprovalRequired(module) ? (
                  <button
                    onClick={() => handleRequestAccess(module.key, module.name)}
                    disabled={updating === module.key}
                    className="mt-4 w-full py-3 px-4 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 transition-all bg-amber-500 text-white hover:bg-amber-600"
                  >
                    <Clock size={14} /> Solicitar Acesso
                  </button>
                ) : (
                  <button
                    onClick={() => toggleModule(module.key, module.is_active)}
                    disabled={updating === module.key}
                    className={`mt-4 w-full py-3 px-4 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 transition-all ${
                      module.is_active
                        ? 'bg-white border-2 border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600'
                        : 'bg-slate-900 text-white hover:bg-emerald-600'
                    }`}
                  >
                    {updating === module.key ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : module.is_active ? (
                      <>
                        <XCircle size={14} /> Desativar
                      </>
                    ) : (
                      <>
                        <Zap size={14} /> Ativar
                      </>
                    )}
                  </button>
                )}
              </>
            ) : (
              <div className="mt-4 py-3 px-4 rounded-xl bg-slate-100 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase">
                  Módulo não disponível para seu plano
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {modules.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400 font-medium">Nenhum módulo disponível</p>
        </div>
      )}

      {/* MODAL DE SOLICITAÇÃO */}
      <RequestModal
        isOpen={requestModal.isOpen}
        onClose={() => setRequestModal(prev => ({ ...prev, isOpen: false }))}
        moduleName={requestModal.moduleName}
        moduleKey={requestModal.moduleKey}
        onSuccess={handleRequestSuccess}
      />
    </div>
  );
}
