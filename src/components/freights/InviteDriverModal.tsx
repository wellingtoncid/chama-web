import { useState } from 'react';
import { X, Send, Loader2, MessageCircle } from 'lucide-react';
import { api } from '@/api/api';
import { Button } from '@/components/ui/Button';

interface InviteDriverModalProps {
  driverId: number;
  driverName: string;
  freightId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteDriverModal({ driverId, driverName, freightId, onClose, onSuccess }: InviteDriverModalProps) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/freight-invitations', {
        freight_id: freightId,
        driver_id: driverId,
        message: message.trim(),
      });
      if (res.data?.success) {
        onSuccess();
        onClose();
      } else {
        setError(res.data?.message || 'Erro ao enviar convite');
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('Este motorista já possui um convite pendente para este frete.');
      } else {
        setError(err.response?.data?.message || 'Erro ao enviar convite');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-black uppercase italic text-slate-900 dark:text-white">
            Convidar Motorista
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Enviar convite para <strong className="text-orange-500">{driverName}</strong>
        </p>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mensagem opcional para o motorista..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none h-24 mb-4"
        />

        {error && (
          <p className="text-sm text-red-500 mb-4">{error}</p>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            variant="default"
            onClick={handleSend}
            disabled={loading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white border-none"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {loading ? 'Enviando...' : 'Convidar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
