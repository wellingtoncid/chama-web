import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ArrowLeft, Save, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
}

const ArticleSubmitPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPaid, setIsPaid] = useState(false);
  const [paidPlan, setPaidPlan] = useState<'standard' | 'premium'>('standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [authorStatus, setAuthorStatus] = useState<{is_author: boolean; has_pending_request: boolean} | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/artigos/submeter');
    } else if (user) {
      checkAuthorStatus();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

  const checkAuthorStatus = async () => {
    try {
      const res = await api.get('/article-author-status');
      if (res.data?.success) {
        const status = res.data.data;
        setAuthorStatus(status);
        
        if (!status.is_author && !status.has_pending_request) {
          navigate('/artigos/ser-autor');
        } else if (status.has_pending_request && !status.is_author) {
          setError('Você tem uma solicitação de autor pendente. Aguarde a aprovação da equipe.');
        }
      }
    } catch (err) {
      console.error('Error checking author status:', err);
    } finally {
      setCheckingAuth(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/article-categories');
      if (res.data?.success) {
        setCategories(res.data.data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent, asDraft: boolean = false) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim()) {
      setError('Título é obrigatório');
      return;
    }

    if (!content.trim()) {
      setError('Conteúdo é obrigatório');
      return;
    }

    if (content.length < 2000) {
      setError('Artigo deve ter no mínimo 2.000 caracteres');
      return;
    }

    if (content.length > 50000) {
      setError('Artigo deve ter no máximo 50.000 caracteres');
      return;
    }

    try {
      setLoading(true);

      const payload: Record<string, unknown> = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content,
        category_id: categoryId || null,
        as_draft: asDraft
      };

      if (isPaid) {
        payload.is_paid = true;
        payload.paid_plan = paidPlan;
      }

      const res = await api.post('/articles', payload);

      if (res.data?.success) {
        if (asDraft) {
          setSuccess('Rascunho salvo com sucesso!');
        } else {
          setSuccess('Artigo submetido com sucesso! Aguarde a aprovação da equipe.');
          setTimeout(() => {
            navigate('/dashboard/meus-artigos');
          }, 2000);
        }
      } else {
        setError(res.data?.message || 'Erro ao submeter artigo');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Erro ao submeter artigo');
      } else {
        setError('Erro ao submeter artigo');
      }
    } finally {
      setLoading(false);
    }
  };

  const getCharacterStatus = () => {
    if (charCount < 2000) {
      return { color: 'text-red-500', text: `${charCount.toLocaleString()} / 2.000 min` };
    }
    if (charCount > 50000) {
      return { color: 'text-red-500', text: `${charCount.toLocaleString()} / 50.000 máx` };
    }
    return { color: 'text-green-600', text: `${charCount.toLocaleString()} caracteres` };
  };

  if (authLoading || checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f4ead]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Se não é autor e tem request pendente, mostra mensagem de bloqueio
  if (authorStatus && !authorStatus.is_author && authorStatus.has_pending_request) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617]">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24 lg:pt-28">
          <div className="max-w-4xl mx-auto">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-8 text-center">
              <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-300 mb-4">
                Solicitação Pendente
              </h2>
              <p className="text-yellow-700 dark:text-yellow-400 mb-6">
                Sua solicitação para se tornar autor está sendo analisada pela equipe. 
                Você receberá uma notificação quando for aprovado.
              </p>
              <Link 
                to="/artigos" 
                className="inline-flex items-center gap-2 text-[#1f4ead] hover:underline font-bold"
              >
                <ArrowLeft size={20} />
                Voltar para Artigos
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617]">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24 lg:pt-28">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link 
            to="/artigos" 
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-[#1f4ead] mb-6"
          >
            <ArrowLeft size={20} />
            Voltar para artigos
          </Link>

          {/* Page Header */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 mb-6">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              Submeter Novo Artigo
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Compartilhe seu conhecimento com a comunidade de transporte e logística.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={(e) => handleSubmit(e, false)}>
            <div className="space-y-6">
              {/* Error/Success Messages */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="text-red-500 mt-0.5" size={20} />
                  <div>
                    <p className="font-bold text-red-700 dark:text-red-400">Erro</p>
                    <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-0.5" size={20} />
                  <div>
                    <p className="font-bold text-green-700 dark:text-green-400">Sucesso</p>
                    <p className="text-sm text-green-600 dark:text-green-300">{success}</p>
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite o título do seu artigo"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1f4ead] focus:border-transparent"
                  maxLength={200}
                />
                <p className="text-xs text-slate-500 mt-1">{title.length}/200 caracteres</p>
              </div>

              {/* Excerpt */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Resumo (Excerpt)
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Breve descrição do artigo (opcional)"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1f4ead] focus:border-transparent resize-none"
                  rows={3}
                  maxLength={300}
                />
                <p className="text-xs text-slate-500 mt-1">{excerpt.length}/300 caracteres</p>
              </div>

              {/* Category */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Categoria
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1f4ead] focus:border-transparent"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Content */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Conteúdo *
                  </label>
                  <span className={`text-sm font-bold ${getCharacterStatus().color}`}>
                    {getCharacterStatus().text}
                  </span>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Escreva seu artigo aqui... (mínimo 2.000 caracteres)"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1f4ead] focus:border-transparent resize-y font-sans"
                  rows={20}
                />
                <div className="flex gap-4 mt-2 text-xs">
                  <span className={charCount < 2000 ? 'text-red-500' : 'text-green-600'}>
                    Mínimo: 2.000 caracteres
                  </span>
                  <span className={charCount > 50000 ? 'text-red-500' : 'text-green-600'}>
                    Máximo: 50.000 caracteres
                  </span>
                </div>
              </div>

              {/* Paid Option */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="isPaid"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    className="mt-1 w-5 h-5 text-[#1f4ead] rounded focus:ring-[#1f4ead]"
                  />
                  <div className="flex-1">
                    <label htmlFor="isPaid" className="block text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      Tornar artigo pago (Publieditorial)
                    </label>
                    <p className="text-xs text-slate-500 mt-1">
                      Seu artigo aparecerá com badge de "Patrocinado" e terá maior destaque.
                    </p>
                  </div>
                </div>

                {isPaid && (
                  <div className="mt-4 pl-8">
                    <div className="grid md:grid-cols-2 gap-4">
                      <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paidPlan === 'standard' 
                          ? 'border-[#1f4ead] bg-[#1f4ead]/5' 
                          : 'border-slate-200 dark:border-slate-700'
                      }`}>
                        <input
                          type="radio"
                          name="paidPlan"
                          value="standard"
                          checked={paidPlan === 'standard'}
                          onChange={() => setPaidPlan('standard')}
                          className="sr-only"
                        />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">Standard</p>
                            <p className="text-2xl font-black text-[#1f4ead]">R$ 297</p>
                            <p className="text-xs text-slate-500">30 dias de destaque</p>
                          </div>
                          {paidPlan === 'standard' && (
                            <CheckCircle className="text-[#1f4ead]" size={24} />
                          )}
                        </div>
                      </label>

                      <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paidPlan === 'premium' 
                          ? 'border-purple-600 bg-purple-600/5' 
                          : 'border-slate-200 dark:border-slate-700'
                      }`}>
                        <input
                          type="radio"
                          name="paidPlan"
                          value="premium"
                          checked={paidPlan === 'premium'}
                          onChange={() => setPaidPlan('premium')}
                          className="sr-only"
                        />
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">Premium</p>
                            <p className="text-2xl font-black text-purple-600">R$ 497</p>
                            <p className="text-xs text-slate-500">60 dias de destaque + banner</p>
                          </div>
                          {paidPlan === 'premium' && (
                            <CheckCircle className="text-purple-600" size={24} />
                          )}
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)}
                  disabled={loading || !title.trim()}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  <Save size={20} />
                  Salvar Rascunho
                </button>

                <button
                  type="submit"
                  disabled={loading || charCount < 2000 || charCount > 50000}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-[#1f4ead] text-white hover:bg-[#1a3d8a] transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send size={20} />
                      Submeter Artigo
                    </>
                  )}
                </button>
              </div>

              {/* Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Observação:</strong> Após submissão, seu artigo será analisado pela equipe do Chama Frete. 
                  Você receberá uma notificação quando for aprovado ou rejeitado.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ArticleSubmitPage;