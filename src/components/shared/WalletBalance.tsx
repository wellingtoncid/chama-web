import { useState, useEffect } from 'react';
import { Wallet, Plus, ChevronDown, X, Eye, EyeOff } from 'lucide-react';
import { api } from '../../api/api';
import { Button } from '../ui/button';

interface WalletBalanceProps {
  onRecargeClick?: () => void;
  compact?: boolean;
  showHiddenToggle?: boolean;
}

export default function WalletBalance({ onRecargeClick, compact = false, showHiddenToggle = false }: WalletBalanceProps) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const res = await api.get('/wallet/balance');
      if (res.data?.data?.balance !== undefined) {
        setBalance(res.data.data.balance);
      }
    } catch (error) {
      console.error('Erro ao carregar saldo:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
    );
  }

  if (compact) {
    return (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <Wallet size={18} className="text-orange-500" />
        <span className="font-semibold text-sm">
          {isHidden ? '••••••' : formatCurrency(balance)}
        </span>
        {(showHiddenToggle || isHidden) && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setIsHidden(!isHidden);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                setIsHidden(!isHidden);
              }
            }}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded cursor-pointer"
          >
            {isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
      >
        <Wallet size={18} className="text-orange-500" />
        <span className="font-semibold text-sm">
          {isHidden ? '••••••' : formatCurrency(balance)}
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Saldo disponível</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsHidden(!isHidden)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                  title={isHidden ? "Mostrar saldo" : "Ocultar saldo"}
                >
                  {isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {isHidden ? '••••••' : formatCurrency(balance)}
            </div>
          </div>
          
          <div className="p-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setIsOpen(false);
                onRecargeClick?.();
              }}
            >
              <Plus size={14} />
              Recarregar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
