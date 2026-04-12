import { useState } from 'react';
import StarRating from './StarRating';
import { MapPin, Flag, MessageSquare, Loader2, X } from 'lucide-react';
import { api } from '../../api/api';
import Swal from 'sweetalert2';

interface ReviewCardProps {
  review: {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    reviewer_name: string;
    reviewer_avatar?: string;
    reviewer_role?: string;
    origin_city?: string;
    origin_state?: string;
    dest_city?: string;
    dest_state?: string;
    product?: string;
    reply_text?: string;
    replied_at?: string;
  };
  theme?: 'orange' | 'blue';
  showReplyButton?: boolean;
  showReportButton?: boolean;
  targetUserId?: number;
  onReplyDeleted?: () => void;
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffDays === 0) return 'hoje';
  if (diffDays === 1) return 'há 1 dia';
  if (diffDays < 7) return `há ${diffDays} dias`;
  if (diffWeeks === 1) return 'há 1 semana';
  if (diffWeeks < 4) return `há ${diffWeeks} semanas`;
  if (diffMonths === 1) return 'há 1 mês';
  if (diffMonths < 12) return `há ${diffMonths} meses`;
  return date.toLocaleDateString('pt-BR');
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam ou propaganda' },
  { value: 'harassment', label: 'Assédio ou ofensa' },
  { value: 'fake', label: 'Perfil ou avaliação falsa' },
  { value: 'fraud', label: 'Fraude ou golpe' },
  { value: 'inappropriate', label: 'Conteúdo inadequado' },
  { value: 'other', label: 'Outro motivo' },
];

export default function ReviewCard({ 
  review, 
  theme = 'orange',
  showReplyButton = false,
  showReportButton = true,
  targetUserId,
  onReplyDeleted
}: ReviewCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  const themeColors = theme === 'orange' 
    ? { accent: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-100 dark:border-orange-500/20' }
    : { accent: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20' };

  const route = review.origin_city && review.dest_city
    ? `${review.origin_city}${review.origin_state ? ` (${review.origin_state})` : ''} → ${review.dest_city}${review.dest_state ? ` (${review.dest_state})` : ''}`
    : null;

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    
    setSubmitting(true);
    try {
      const res = await api.post('review/reply', {
        review_id: review.id,
        reply_text: replyText.trim()
      });
      
      if (res.data?.success) {
        Swal.fire('Sucesso!', 'Resposta publicada.', 'success');
        setShowReplyForm(false);
        setReplyText('');
        window.location.reload();
      } else {
        Swal.fire('Erro', res.data?.message || 'Erro ao responder.', 'error');
      }
    } catch (err: any) {
      Swal.fire('Erro', err.response?.data?.message || 'Erro ao responder.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReply = async () => {
    const result = await Swal.fire({
      title: 'Excluir resposta?',
      text: 'Esta ação não pode ser desfeita.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sim, excluir'
    });

    if (result.isConfirmed) {
      try {
        const res = await api.post('review/delete-reply', { review_id: review.id });
        if (res.data?.success) {
          Swal.fire('Excluído!', 'Resposta removida.', 'success');
          onReplyDeleted?.();
          window.location.reload();
        }
      } catch (err) {
        Swal.fire('Erro', 'Erro ao excluir resposta.', 'error');
      }
    }
  };

  const handleSubmitReport = async () => {
    if (!reportReason) {
      Swal.fire('Erro', 'Selecione um motivo.', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await api.post('reports', {
        target_type: 'review',
        target_id: review.id,
        reason: reportReason,
        description: reportDescription
      });
      
      if (res.data?.success) {
        Swal.fire('Denunciado!', 'Sua denúncia foi enviada para análise.', 'success');
        setShowReportForm(false);
        setReportReason('');
        setReportDescription('');
      } else {
        Swal.fire('Erro', res.data?.message || 'Erro ao enviar denúncia.', 'error');
      }
    } catch (err: any) {
      Swal.fire('Erro', err.response?.data?.message || 'Erro ao enviar denúncia.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`${themeColors.bg} rounded-2xl p-5 border ${themeColors.border}`}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
          {review.reviewer_avatar ? (
            <img src={review.reviewer_avatar} alt={review.reviewer_name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-slate-500">
              {review.reviewer_name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          )}
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {review.reviewer_name}
              </span>
              {review.reviewer_role && (
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {review.reviewer_role === 'driver' ? 'Motorista' : review.reviewer_role === 'company' ? 'Empresa' : review.reviewer_role}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {showReportButton && (
                <button
                  onClick={() => setShowReportForm(!showReportForm)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  title="Denunciar"
                >
                  <Flag size={14} />
                </button>
              )}
              <span className="text-xs text-slate-400 whitespace-nowrap">
                {formatRelativeDate(review.created_at)}
              </span>
            </div>
          </div>
          
          <div className="mt-1 mb-2">
            <StarRating rating={review.rating} size={14} />
          </div>
          
          {review.comment && (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
              "{review.comment}"
            </p>
          )}
          
          {route && (
            <div className={`mt-3 flex items-center gap-1.5 text-xs font-bold ${themeColors.accent}`}>
              <MapPin size={12} />
              <span>Frete: {route}</span>
            </div>
          )}

          {/* Reply Section */}
          {review.reply_text && (
            <div className="mt-4 ml-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare size={12} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase">Resposta</span>
                <span className="text-xs text-slate-400">
                  {review.replied_at && formatRelativeDate(review.replied_at)}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                "{review.reply_text}"
              </p>
              {showReplyButton && (
                <button
                  onClick={handleDeleteReply}
                  className="mt-2 text-xs text-red-400 hover:text-red-500 font-medium"
                >
                  Excluir resposta
                </button>
              )}
            </div>
          )}

          {/* Reply Form */}
          {showReplyButton && showReplyForm && (
            <div className="mt-4 ml-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escreva sua resposta..."
                maxLength={1000}
                className="w-full p-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => { setShowReplyForm(false); setReplyText(''); }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={submitting || !replyText.trim()}
                  className="px-4 py-2 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg disabled:opacity-50 flex items-center gap-1"
                >
                  {submitting && <Loader2 size={12} className="animate-spin" />}
                  Publicar Resposta
                </button>
              </div>
            </div>
          )}

          {/* Reply Button */}
          {showReplyButton && !showReplyForm && !review.reply_text && (
            <button
              onClick={() => setShowReplyForm(true)}
              className="mt-3 flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <MessageSquare size={12} />
              Responder
            </button>
          )}

          {/* Report Form */}
          {showReportButton && showReportForm && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-100 dark:border-red-500/20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-red-600 dark:text-red-400">Denunciar Avaliação</span>
                <button onClick={() => setShowReportForm(false)} className="text-red-400 hover:text-red-600">
                  <X size={16} />
                </button>
              </div>
              
              <div className="space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <label key={reason.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="report-reason"
                      value={reason.value}
                      checked={reportReason === reason.value}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-4 h-4 text-red-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{reason.label}</span>
                  </label>
                ))}
              </div>

              {reportReason === 'other' && (
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Descreva o motivo..."
                  className="w-full mt-3 p-2 text-sm border border-red-200 dark:border-red-500/30 rounded-lg bg-white dark:bg-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={2}
                />
              )}

              <button
                onClick={handleSubmitReport}
                disabled={submitting || !reportReason}
                className="mt-3 w-full py-2 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {submitting && <Loader2 size={12} className="animate-spin" />}
                Enviar Denúncia
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
