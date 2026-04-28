import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, AlertCircle } from 'lucide-react';
import { api } from '../../api/api';
import Swal from 'sweetalert2';

interface UsageMeterProps {
  moduleKey: 'freights' | 'marketplace';
}

interface UsageData {
  used: number;
  limit: number;
  remaining: number;
  plan_name?: string;
}

export function UsageMeter({ moduleKey }: UsageMeterProps) {
  const navigate = useNavigate();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, [moduleKey]);

  const fetchUsage = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/usage');
      if (res.data?.success) {
        const data = res.data.data?.[moduleKey] || {
          used: res.data.data?.[moduleKey === 'freights' ? 'freights_published' : 'marketplace_listings'] || 0,
          limit: res.data.data?.[moduleKey]?.limit || 0,
          remaining: res.data.data?.[moduleKey]?.remaining ?? 0,
          plan_name: res.data.data?.[moduleKey]?.plan_name
        };
        setUsageData(data);
      }
    } catch (e) {
      console.error('Erro ao buscar usage:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    // Verifica se excedeu limite
    if (usageData && usageData.limit > 0 && usageData.used >= usageData.limit) {
      Swal.fire({
        icon: 'warning',
        title: 'Limite atingido',
        text: `Você já usou ${usageData.used} de ${usageData.limit} publicações neste mês. ${usageData.plan_name ? 'Faça upgrade do seu plano.' : 'Assine um plano para continuar publicando.'}`,
        confirmButtonText: 'Ver Planos',
        confirmButtonColor: '#059669'
      }).then(() => navigate('/dashboard/planos'));
      return;
    }
    
    // Permite criar
    if (moduleKey === 'freights') {
      navigate('/novo-frete');
    } else {
      navigate('/novo-anuncio');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <div className="w-4 h-4 border-2 border-slate-300 border-t-orange-500 rounded-full animate-spin" />
        <span className="text-xs">Carregando...</span>
      </div>
    );
  }

  const isFreight = moduleKey === 'freights';
  const Icon = isFreight ? Package : ShoppingBag;
  const used = usageData?.used || 0;
  const limit = usageData?.limit || 0;
  const isAtLimit = limit > 0 && used >= limit;
  const isWarning = limit > 0 && used >= limit * 0.8;

  return (
    <div className="flex flex-col items-end gap-2">
      {/* Medidor de uso */}
      <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border ${
        isAtLimit 
          ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
          : isWarning
            ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
      }`}>
        <Icon size={18} className={isAtLimit ? 'text-red-500' : isWarning ? 'text-orange-500' : 'text-slate-400'} />
        
        <div className="flex flex-col">
          <span className={`text-xs font-bold ${isAtLimit ? 'text-red-600' : 'text-slate-600 dark:text-slate-300'}`}>
            {used} / {limit} {limit === 0 ? 'publicações' : 'usados'}
          </span>
          {usageData?.plan_name && (
            <span className="text-[10px] text-slate-400">{usageData.plan_name}</span>
          )}
        </div>

        {/* Barra de progresso */}
        {limit > 0 && (
          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${isAtLimit ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min((used / limit) * 100, 100)}%` }}
            />
          </div>
        )}

        {isAtLimit && (
          <AlertCircle size={16} className="text-red-500" />
        )}
      </div>

      {/* Botão criar */}
      {isAtLimit ? (
        <button 
          onClick={handleCreateNew}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase"
        >
          Limite Atingido
        </button>
      ) : (
        <button 
          onClick={handleCreateNew}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black uppercase italic text-xs flex items-center gap-2 shadow-lg"
        >
          {isFreight ? <Package size={16} /> : <ShoppingBag size={16} />}
          Novo {isFreight ? 'Frete' : 'Item'}
          {limit > 0 && (
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">
              {usageData?.remaining || 0}
            </span>
          )}
        </button>
      )}
    </div>
  );
}