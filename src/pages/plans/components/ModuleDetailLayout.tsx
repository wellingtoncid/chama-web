import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModuleDetailLayoutProps {
  title: string;
  icon?: ReactNode;
  description?: string;
  isActive: boolean;
  onBack: () => void;
  children: ReactNode;
}

export default function ModuleDetailLayout({ title, icon, description, isActive, onBack, children }: ModuleDetailLayoutProps) {
  return (
    <div className="space-y-5 lg:space-y-6 animate-in fade-in duration-500 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
              {icon}
            </div>
          )}
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {title}
            </h1>
            {description && (
              <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Voltar
        </button>
      </div>
      {children}
    </div>
  );
}
