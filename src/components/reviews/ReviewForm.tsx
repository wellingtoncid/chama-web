import React, { useState } from 'react';
import StarRating from './StarRating';
import { Loader2, Send, AlertCircle } from 'lucide-react';
import { api } from '../../api/api';

interface ReviewFormProps {
  targetId: number;
  targetName: string;
  freightId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  theme?: 'orange' | 'blue';
}

export default function ReviewForm({
  targetId,
  targetName,
  freightId,
  onSuccess,
  onCancel,
  theme = 'orange'
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const themeColors = theme === 'orange'
    ? { button: 'bg-orange-500 hover:bg-orange-600', border: 'border-orange-200' }
    : { button: 'bg-blue-500 hover:bg-blue-600', border: 'border-blue-200' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Selecione uma nota de 1 a 5 estrelas.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('submit-review', {
        target_id: targetId,
        rating,
        comment,
        freight_id: freightId || null
      });

      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      } else {
        setError(res.data?.message || 'Erro ao enviar avaliação.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-500/10 rounded-2xl p-6 border border-green-200 dark:border-green-500/30 text-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send size={24} className="text-white" />
        </div>
        <h4 className="text-lg font-black text-green-700 dark:text-green-400 uppercase italic mb-2">
          Avaliação Enviada!
        </h4>
        <p className="text-sm text-green-600 dark:text-green-500 font-bold">
          Sua avaliação será publicada após análise.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-slate-500 font-bold mb-3">
          Avalie sua experiência com <span className="text-slate-900 dark:text-white">{targetName}</span>
        </p>
        <div className="flex justify-center">
          <StarRating
            rating={rating}
            size={32}
            interactive
            onChange={setRating}
          />
        </div>
        {rating > 0 && (
          <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">
            {rating === 5 ? 'Excelente!' : rating === 4 ? 'Ótimo!' : rating === 3 ? 'Bom' : rating === 2 ? 'Regular' : 'Ruim'}
          </p>
        )}
      </div>

      <div>
        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
          Comentário (opcional)
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Conte sobre sua experiência..."
          rows={4}
          maxLength={500}
          className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-orange-500 outline-none text-slate-900 dark:text-white font-medium placeholder:text-slate-400 transition-all resize-none text-sm"
        />
        <p className="text-[10px] text-slate-400 text-right mt-1">
          {comment.length}/500
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/30">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-600 dark:text-red-400 font-bold">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading || rating === 0}
          className={`flex-1 py-3 ${themeColors.button} text-white rounded-xl font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>Enviar <Send size={14} /></>
          )}
        </button>
      </div>

      <p className="text-[10px] text-slate-400 text-center font-medium">
        Sua avaliação será analisada antes de ser publicada.
      </p>
    </form>
  );
}
