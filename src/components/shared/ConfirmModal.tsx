import { AlertTriangle, CheckCircle, X, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'success' | 'warning';
  icon?: React.ReactNode;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning',
  icon,
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const variantStyles = {
    danger: { bg: 'bg-red-500', hover: 'hover:bg-red-600', icon: 'text-red-500' },
    success: { bg: 'bg-emerald-500', hover: 'hover:bg-emerald-600', icon: 'text-emerald-500' },
    warning: { bg: 'bg-orange-500', hover: 'hover:bg-orange-600', icon: 'text-orange-500' },
  };

  const style = variantStyles[variant];

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          <X size={18} />
        </button>

        <div className="text-center">
          <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center ${style.icon} bg-slate-100 dark:bg-slate-800`}>
            {icon || (variant === 'danger' ? <AlertTriangle size={28} /> : variant === 'success' ? <CheckCircle size={28} /> : <AlertTriangle size={28} />)}
          </div>

          <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{title}</h3>
          {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{description}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 rounded-xl text-white font-bold text-sm transition-all ${style.bg} ${style.hover} disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
