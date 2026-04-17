import { useState } from 'react';
import { Star, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { api } from '@/api/api';
import Swal from 'sweetalert2';

interface AffiliateInterestModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AffiliateInterestModal({ onClose, onSuccess }: AffiliateInterestModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    intended_use: '',
    willing_to_pay: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/affiliate/interest', formData);

      if (res.data?.success) {
        setSubmitted(true);
        Swal.fire({
          title: 'Solicitação Enviada!',
          text: 'Nossa equipe entrará em contato em breve.',
          icon: 'success',
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
        });
        onSuccess();
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || 'Erro ao enviar solicitação.';
      Swal.fire({
        title: 'Erro',
        text: message,
        icon: 'error',
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
        color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const paymentOptions = [
    { value: 0, label: 'Não quero pagar', sublabel: 'Só quero testar' },
    { value: 29.9, label: 'R$ 29,90/mês', sublabel: 'Básico' },
    { value: 49.9, label: 'R$ 49,90/mês', sublabel: 'Recomendado' },
    { value: 99.9, label: 'R$ 99,90/mês', sublabel: 'Profissional' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Star size={24} className="fill-white" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase italic">Anúncios de Afiliado</h3>
                <p className="text-xs opacity-80">Mercado Livre</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <XCircle size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">Solicitação Enviada!</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nossa equipe analisará sua solicitação e entrará em contato em breve.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold"
              >
                Fechar
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Info Box */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-6">
                <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-2">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  O que é o Anúncio de Afiliado?
                </h4>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• Anuncie produtos do Mercado Livre no Chama Frete</li>
                  <li>• Ganhe comissões pelas vendas realizadas</li>
                  <li>• Suas vendas são rastreadas automaticamente</li>
                  <li>• Máximo 5 anúncios por vez</li>
                </ul>
              </div>

              {/* Intended Use */}
              <div className="mb-4">
                <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 mb-2">
                  Como você pretende usar este recurso?
                </label>
                <textarea
                  value={formData.intended_use}
                  onChange={(e) => setFormData({ ...formData, intended_use: e.target.value })}
                  placeholder="Ex: Quero divulgar produtos de beleza que já compro..."
                  className="w-full p-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={3}
                />
              </div>

              {/* Payment Options */}
              <div className="mb-6">
                <label className="block text-xs font-black uppercase text-slate-500 dark:text-slate-400 mb-3">
                  Quanto estaria disposto a pagar mensalmente?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, willing_to_pay: option.value })}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        formData.willing_to_pay === option.value
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <p className="font-bold text-slate-900 dark:text-white">{option.label}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{option.sublabel}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Clock size={16} />
                      Solicitar Acesso
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
