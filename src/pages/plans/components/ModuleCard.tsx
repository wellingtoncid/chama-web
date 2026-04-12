import { Check, Clock } from 'lucide-react';

interface ModuleStatus {
  isActive: boolean;
  requiresApproval: boolean;
  approvalStatus: string | null;
}

interface ModuleCardProps {
  module: {
    key: string;
    name: string;
    icon: React.ReactNode;
    requiresApproval: boolean;
    comingSoon?: boolean;
    description?: string;
  };
  status: ModuleStatus;
  rulesCount: number;
  onClick: () => void;
  disabled?: boolean;
}

export default function ModuleCard({ module, status, rulesCount, onClick, disabled }: ModuleCardProps) {
  const isComingSoon = module.comingSoon;
  const isRequestingApproval = module.requiresApproval && !status.isActive;
  const isComingSoonWithApproval = isComingSoon && module.requiresApproval;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-6 rounded-[2rem] border-2 text-left transition-all relative ${
        isComingSoonWithApproval
          ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 hover:border-amber-400 cursor-pointer'
          : isRequestingApproval
          ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 hover:border-amber-400 cursor-pointer'
          : isComingSoon
          ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 opacity-70 cursor-not-allowed'
          : status.isActive
          ? 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 hover:shadow-lg cursor-pointer'
          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 hover:shadow-lg cursor-pointer'
      }`}
    >
      {/* Badges */}
      {module.key === 'company_pro' && status.isActive && (
        <span className="absolute top-4 right-4 text-[8px] font-black px-2 py-1 rounded-lg uppercase bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <Check size={8} /> Verificado
        </span>
      )}

      {module.key === 'driver' && status.isActive && (
        <span className="absolute top-4 right-4 text-[8px] font-black px-2 py-1 rounded-lg uppercase bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <Check size={8} /> Verificado
        </span>
      )}

      {status.isActive && !isComingSoon && module.key !== 'company_pro' && module.key !== 'driver' && (
        <span className="absolute top-4 right-4 text-[8px] font-black px-2 py-1 rounded-lg uppercase bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
          Ativo
        </span>
      )}

      {isComingSoon && !module.requiresApproval && (
        <span className="absolute top-4 right-4 text-[8px] font-black px-2 py-1 rounded-lg uppercase bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Clock size={8} /> Em Breve
        </span>
      )}

      {isComingSoonWithApproval && (
        <span className="absolute top-4 right-4 text-[8px] font-black px-2 py-1 rounded-lg uppercase bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <Clock size={8} /> Em Breve
        </span>
      )}

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
        isComingSoon
          ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
          : status.isActive
          ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
      }`}>
        {module.icon}
      </div>

      <h3 className="font-black uppercase italic text-lg text-slate-900 dark:text-slate-100 mb-1">
        {module.name}
      </h3>

      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
        {module.description}
      </p>

      {!isComingSoon && rulesCount === 0 && (
        <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2">Nenhum recurso disponível</p>
      )}
    </button>
  );
}
