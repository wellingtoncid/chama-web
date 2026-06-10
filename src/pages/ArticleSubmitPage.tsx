import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { ArrowLeft, Save, Send, AlertCircle, CheckCircle, Loader2, Upload, Trash2 } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import Swal from 'sweetalert2';
import TextEditor from '@/components/shared/TextEditor';

interface Category {
  id: number;
  name: string;
  slug: string;
}

const ArticleSubmitPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState<boolean | null>(null);
  const [paidPlan, setPaidPlan] = useState<'standard' | 'premium'>('standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [authorStatus, setAuthorStatus] = useState<{is_author: boolean; has_pending_request: boolean} | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/artigos/submeter');
    } else if (user) {
      checkAuthorStatus();
      fetchCategories();
      if (editId) loadArticle(editId);
    }
  }, [user, authLoading, navigate, editId]);

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

  const loadArticle = async (id: string) => {
    try {
      setLoadingEdit(true);
      const res = await api.get(`/articles/by-id/${id}`);
      if (res.data?.success) {
        const article = res.data.data.article;
        setTitle(article.title || '');
        setExcerpt(article.excerpt || '');
        setContent(article.content || '');
        setImageUrl(article.image_url || '');
        setCategoryId(article.category_id || '');
        setIsPaid(!!article.is_paid);
        setIsAiGenerated(article.is_ai_generated ? true : false);
        setPaidPlan(article.paid_plan || 'standard');
      } else {
        setError(res.data?.message || 'Erro ao carregar artigo');
      }
    } catch (err) {
      setError('Erro ao carregar dados do artigo');
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Imagem deve ter no máximo 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setImageUploading(true);
      setError(null);
      const res = await api.post('/articles/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        setImageUrl(res.data.data.url);
      } else {
        setError(res.data?.message || 'Erro ao enviar imagem');
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Erro ao enviar imagem');
      } else {
        setError('Erro ao enviar imagem');
      }
    } finally {
      setImageUploading(false);
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

    if (isAiGenerated === null) {
      setError('Informe se o artigo foi gerado com auxílio de inteligência artificial');
      return;
    }

    try {
      setLoading(true);

      const payload: Record<string, unknown> = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content,
        image_url: imageUrl || null,
        category_id: categoryId || null,
        is_ai_generated: isAiGenerated === true,
        as_draft: asDraft
      };

      if (isPaid) {
        payload.is_paid = true;
        payload.paid_plan = paidPlan;
      }

      let res;
      if (isEditing) {
        res = await api.put(`/articles/${editId}`, payload);
      } else {
        res = await api.post('/articles', payload);
      }

      if (res.data?.success) {
        const articleId = res.data.data?.article_id;

        if (isPaid && articleId && !isEditing) {
          setLoading(false);
          const { value: paymentMethod } = await Swal.fire({
            title: 'Pagamento Publieditorial',
            html: `
              <p style="margin-bottom:20px;font-size:14px;color:#666;">
                Plano: <strong>${paidPlan === 'premium' ? 'Premium - R$ 497' : 'Standard - R$ 297'}</strong>
              </p>
              <div style="text-align:left;">
                <label style="display:block;margin-bottom:8px;cursor:pointer;padding:8px 12px;border:1px solid #ddd;border-radius:8px;">
                  <input type="radio" name="payment" value="wallet" style="margin-right:8px;">
                  Saldo da Carteira
                </label>
                <label style="display:block;cursor:pointer;padding:8px 12px;border:1px solid #1f4ead;border-radius:8px;background:#f0f4ff;">
                  <input type="radio" name="payment" value="mercadopago" checked style="margin-right:8px;">
                  Cartão de Crédito (Mercado Pago)
                </label>
              </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Pagar Agora',
            cancelButtonText: 'Pagar Depois',
            confirmButtonColor: '#1f4ead',
            preConfirm: () => {
              const sel = document.querySelector('input[name="payment"]:checked') as HTMLInputElement;
              return sel?.value || 'mercadopago';
            }
          });

          if (paymentMethod) {
            try {
              setLoading(true);
              const payRes = await api.post('/articles/purchase-publieditorial', {
                article_id: articleId,
                plan: paidPlan,
                payment_method: paymentMethod
              });

              if (payRes.data?.success) {
                if (payRes.data.payment_method === 'wallet') {
                  await Swal.fire({
                    icon: 'success',
                    title: 'Publieditorial Ativado!',
                    text: 'Artigo submetido com sucesso. Aguarde aprovação da equipe.',
                    timer: 3000,
                    showConfirmButton: false
                  });
                  setSuccess('Artigo submetido com sucesso! Publieditorial ativado.');
                  setTimeout(() => navigate('/dashboard/meus-artigos'), 1500);
                  return;
                } else if (payRes.data.checkout_url) {
                  window.location.href = payRes.data.checkout_url;
                  return;
                }
              } else {
                Swal.fire({ icon: 'error', title: 'Erro no Pagamento', text: payRes.data?.message || 'Tente novamente' });
              }
            } catch {
              Swal.fire({ icon: 'error', title: 'Erro', text: 'Erro ao processar pagamento' });
            } finally {
              setLoading(false);
            }
          } else {
            setSuccess('Artigo submetido! Finalize o pagamento em Meus Artigos.');
            setTimeout(() => navigate('/dashboard/meus-artigos'), 2000);
          }
          return;
        }

        if (asDraft) {
          setSuccess('Rascunho salvo com sucesso!');
        } else if (isEditing) {
          setSuccess('Artigo atualizado com sucesso! Ele será reanalisado pela equipe.');
          setTimeout(() => {
            navigate('/dashboard/meus-artigos');
          }, 2000);
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
      console.error('Erro ao submeter/editar artigo:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        const msg = axiosErr.response?.data?.message;
        const status = (err as any).response?.status;
        console.error('Status:', status, 'Mensagem:', msg);
        setError(msg || `Erro ${status || 'desconhecido'}`);
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

  if (authLoading || checkingAuth || loadingEdit) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#1f4ead]" size={32} />
          <p className="text-sm text-slate-500">{loadingEdit ? 'Carregando artigo...' : 'Verificando autenticação...'}</p>
        </div>
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
              {isEditing ? 'Editar Artigo' : 'Submeter Novo Artigo'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {isEditing
                ? 'Altere os campos abaixo. O artigo será reanalisado pela equipe após salvar.'
                : 'Compartilhe seu conhecimento com a comunidade de transporte e logística.'}
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

              {/* Image Upload */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Imagem de Destaque
                </label>

                {imageUrl ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-green-600 text-white text-[10px] font-bold rounded-lg">
                      <CheckCircle size={12} />
                      Imagem enviada
                    </div>
                    <img
                      src={getImageUrl(imageUrl)}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      title="Remover imagem"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center h-48 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:border-[#1f4ead] dark:hover:border-[#1f4ead] transition-colors ${imageUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      {imageUploading ? (
                        <>
                          <Loader2 className="animate-spin" size={24} />
                          <span className="text-sm font-bold">Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={24} />
                          <span className="text-sm font-bold">Clique para selecionar imagem</span>
                          <span className="text-xs">JPG, PNG ou WebP • Máx 5MB</span>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={imageUploading}
                    />
                  </label>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  Imagem que aparecerá nos cards e ao compartilhar o artigo
                </p>
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
                <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-200 space-y-2">
                  <p className="font-bold">⚠️ Espaço Exclusivo para Compartilhar Conhecimento</p>
                  <p>Este é um ambiente dedicado à troca de experiências, informações e crescimento da nossa comunidade. Para garantir a qualidade e o foco dos conteúdos, todos os artigos passam por uma curadoria editorial antes de serem publicados.</p>
                  <p><strong>O que é bem-vindo:</strong> Dicas técnicas, análises de mercado, tutorias e conhecimentos práticos que gerem valor para o público.</p>
                  <p><strong>O que não permitimos:</strong> Autopromoção, propagandas, links afiliados ou anúncios de produtos e serviços no corpo do texto.</p>
                  <p>Ajude-nos a manter a comunidade unida e focada no que realmente importa: o conhecimento que move o Brasil!</p>
                </div>
                <TextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Escreva seu artigo aqui... (mínimo 2.000 caracteres)"
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

              {/* AI Generated — Obrigatório */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6">
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-800 dark:text-red-200 space-y-3">
                  <div>
                    <p className="font-bold">⚠️ Importante sobre Inteligência Artificial</p>
                    <p>Conteúdos e artigos gerados exclusivamente por Inteligência Artificial podem enfrentar rejeição tanto por leitores quanto por mecanismos de busca, embora a tecnologia em si não seja o problema principal. O verdadeiro desafio está na <strong>baixa qualidade e na falta de originalidade</strong> que muitas vezes acompanham conteúdos automatizados.</p>
                    <p><strong>Artigos que pareçam genéricos, superficiais ou sem valor real podem ser rejeitados pela curadoria da plataforma.</strong> Independente da ferramenta utilizada, prezamos por conteúdo original e de qualidade para nossa comunidade.</p>
                  </div>
                  <div className="border-t border-red-300 dark:border-red-700 pt-3">
                    <p className="font-bold">⚠️ Plágio é proibido</p>
                    <p>A reprodução de conteúdo de terceiros sem a devida atribuição ou autorização é expressamente proibida. Artigos plagiados serão <strong>rejeitados automaticamente</strong> e o autor poderá ter seu acesso de publicação removido. Todo conteúdo será verificado por ferramentas de detecção de plágio antes da aprovação.</p>
                  </div>
                </div>

                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  Este artigo foi gerado com auxílio de inteligência artificial? *
                </label>
                <div className="space-y-3">
                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isAiGenerated === true
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="isAiGenerated"
                      checked={isAiGenerated === true}
                      onChange={() => setIsAiGenerated(true)}
                      className="mt-0.5 w-5 h-5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Sim, utilizei IA para gerar este conteúdo</p>
                      <p className="text-xs text-slate-500 mt-0.5">Um aviso será exibido no final do artigo informando os leitores</p>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isAiGenerated === false
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}>
                    <input
                      type="radio"
                      name="isAiGenerated"
                      checked={isAiGenerated === false}
                      onChange={() => setIsAiGenerated(false)}
                      className="mt-0.5 w-5 h-5 text-green-600 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Não, este conteúdo foi escrito exclusivamente por humanos</p>
                      <p className="text-xs text-slate-500 mt-0.5">Nenhum aviso adicional será exibido</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Paid Option */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6">
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-800 dark:text-blue-200 space-y-2">
                  <p className="font-bold">📢 Quer divulgar sua marca ou serviço?</p>
                  <p>Se o seu objetivo é comercial, nós temos o espaço ideal para você! Selecione o campo abaixo para tornar seu artigo em um Publieditorial.</p>
                </div>
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
                      {isEditing ? 'Salvar Alterações' : 'Submeter Artigo'}
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