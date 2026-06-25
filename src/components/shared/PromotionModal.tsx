import { useState } from 'react';
import { MessageCircle, Loader2, ExternalLink, X, CheckCircle2, Wallet } from 'lucide-react';
import { api } from '@/api/api';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  referenceType: 'freight' | 'listing';
  referenceId: number;
  price?: number;
}

export function PromotionModal({ isOpen, onClose, referenceType, referenceId, price }: PromotionModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handlePromote = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/promotions', {
        reference_type: referenceType,
        reference_id: referenceId,
      });

      if (res.data?.success) {
        const data = res.data.data;
        if (data.status === 'pending_approval') {
          setResult({ type: 'success', message: 'Divulgação criada! Aguarde aprovação da equipe.' });
        } else if (data.url) {
          setResult({ type: 'payment', url: data.url, message: 'Redirecionando para pagamento...', promotionId: data.id });
          window.open(data.url, '_blank');
        } else if (data.status === 'pending_payment') {
          setResult({ type: 'payment_pending', message: 'Pagamento pendente. Confirme após o pagamento.', promotionId: data.id });
        }
      } else {
        setResult({ type: 'error', message: res.data?.message || 'Erro ao criar promoção' });
      }
    } catch (e: any) {
      setResult({ type: 'error', message: e.response?.data?.message || 'Erro ao criar promoção' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!result?.promotionId) return;
    setLoading(true);
    try {
      const res = await api.post(`/promotions/${result.promotionId}/confirm-payment`);
      if (res.data?.success) {
        setResult({ type: 'success', message: 'Pagamento confirmado! Aguarde aprovação da equipe.' });
      }
    } catch (e: any) {
      setResult({ type: 'error', message: e.response?.data?.message || 'Erro ao confirmar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
              <MessageCircle size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Divulgar nos Grupos</h3>
              <p className="text-xs text-slate-500">Alcance +80 grupos WhatsApp</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {result?.type === 'success' ? (
          <div className="text-center py-6">
            <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{result.message}</p>
            <button onClick={onClose} className="mt-6 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm w-full">
              Fechar
            </button>
          </div>
        ) : result?.type === 'payment' ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">{result.message}</p>
            <a href={result.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm w-full">
              <ExternalLink size={16} /> Pagar com Mercado Pago
            </a>
            <button onClick={handleConfirmPayment} disabled={loading} className="flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold text-sm w-full disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Wallet size={16} />}
              Já paguei! Confirmar
            </button>
          </div>
        ) : result?.type === 'payment_pending' ? (
          <div className="space-y-4">
            <p className="text-sm text-amber-600 font-bold">{result.message}</p>
            <button onClick={handleConfirmPayment} disabled={loading} className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm w-full disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Confirmar Pagamento
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800">
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> Alcance nos {80}+ grupos do Chama Frete</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> Motoristas e empresas ativos</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> Curadoria da equipe Chama Frete</li>
              </ul>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Valor único</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">R$ {price?.toFixed(2) || '14,90'}</span>
            </div>
            {result?.type === 'error' && (
              <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{result.message}</p>
            )}
            <button onClick={handlePromote} disabled={loading} className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-6 py-3.5 rounded-2xl font-black text-sm w-full disabled:opacity-50 shadow-lg shadow-emerald-500/20">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
              {loading ? 'Processando...' : 'Sim, divulgar agora!'}
            </button>
          </div>
        )}

        <button onClick={onClose} className="mt-3 text-xs text-slate-400 hover:text-slate-600 w-full text-center font-bold">
          {result?.type === 'success' ? '' : 'Agora não'}
        </button>
      </div>
    </div>
  );
}
