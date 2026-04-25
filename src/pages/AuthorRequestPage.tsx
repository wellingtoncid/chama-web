import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { BookOpen, Send, Loader2, AlertCircle, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

export default function AuthorRequestPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState<{
    is_author: boolean;
    has_pending_request: boolean;
    request: any | null;
  } | null>(null);
  const [referencesLinks, setReferencesLinks] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/artigos/ser-autor');
    } else if (user) {
      fetchStatus();
    }
  }, [user, authLoading, navigate]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/article-author-status');
      
      if (res.data?.success) {
        setStatus(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setSubmitting(true);
      const res = await api.post('/article-author-request', {
        references_links: referencesLinks.trim() || null
      });

      if (res.data?.success) {
        setSuccess('Solicitação enviada com sucesso! Aguarde a análise da equipe.');
        fetchStatus();
      } else {
        setError(res.data?.message || 'Erro ao enviar solicitação');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Erro ao enviar solicitação');
      } else {
        setError('Erro ao enviar solicitação');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#1f4ead]" size={32} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617]">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24 lg:pt-28">
        <div className="max-w-2xl mx-auto">
          {/* Back Link */}
          <Link 
            to="/artigos" 
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-[#1f4ead] mb-6"
          >
            <ArrowLeft size={20} />
            Voltar para artigos
          </Link>

          {/* Header */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#1f4ead]/10 rounded-full flex items-center justify-center">
                <BookOpen className="text-[#1f4ead]" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  Torne-se Autor
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Compartilhe seu conhecimento com a comunidade
                </p>
              </div>
            </div>
          </div>

          {/* Status Card */}
          {status && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 mb-6 border border-slate-200 dark:border-slate-800">
              {status.is_author ? (
                <div className="flex items-center gap-4 text-green-600">
                  <CheckCircle size={32} />
                  <div>
                    <p className="font-bold text-lg">Você já é um autor aprovado!</p>
                    <p className="text-sm text-slate-500">Pode submeter artigos quando quiser.</p>
                  </div>
                </div>
              ) : status.has_pending_request ? (
                <div className="flex items-center gap-4 text-yellow-600">
                  <Loader2 size={32} className="animate-spin" />
                  <div>
                    <p className="font-bold text-lg">Solicitação pendente</p>
                    <p className="text-sm text-slate-500">Aguarde a análise da equipe.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 text-slate-500">
                  <XCircle size={32} />
                  <div>
                    <p className="font-bold text-lg">Você ainda não é autor</p>
                    <p className="text-sm text-slate-500">Solicite acesso para submeter artigos.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="text-red-500 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-red-700 dark:text-red-400">Erro</p>
                <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 flex items-start gap-3">
              <CheckCircle className="text-green-500 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-green-700 dark:text-green-400">Sucesso</p>
                <p className="text-sm text-green-600 dark:text-green-300">{success}</p>
              </div>
            </div>
          )}

          {/* Request Form - Only show if not author and no pending request */}
          {status && !status.is_author && !status.has_pending_request && (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Solicitar Acesso de Autor
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Links de referências (opcional)
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Cole links de artigos, blogs ou conteúdos que você já escreveu anteriormente.
                </p>
                <textarea
                  value={referencesLinks}
                  onChange={(e) => setReferencesLinks(e.target.value)}
                  placeholder="https://seublog.com/artigo1&#10;https://seusite.com/artigo2"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1f4ead] focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-[#1f4ead] text-white hover:bg-[#1a3d8a] transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Send size={20} />
                    Enviar Solicitação
                  </>
                )}
              </button>
            </form>
          )}

          {/* Info Section */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-3">
              O que faz um autor do Chama Frete?
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
              <li>✓ <strong>Escrever artigos</strong> sobre transporte, logística e mercado</li>
              <li>✓ <strong>Compartilhar conhecimento</strong> com a comunidade</li>
              <li>✓ <strong>Construir autoridade</strong> no setor de fretes</li>
              <li>✓ <strong>Visibilidade</strong> para sua empresa ou perfil profissional</li>
              <li>✓ <strong>Monetização</strong> via publieditorial (opcional)</li>
            </ul>
          </div>

          {/* CTA */}
          {!status?.is_author && (
            <div className="mt-6 text-center">
              <Link
                to="/artigos"
                className="inline-flex items-center gap-2 text-[#1f4ead] hover:underline"
              >
                Ver artigos publicados
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}