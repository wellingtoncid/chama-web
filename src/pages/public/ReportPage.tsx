import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '@/api/api';
import { Flag, AlertTriangle, ArrowLeft, Upload, X, Loader2, CheckCircle } from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

const REPORT_REASONS = [
  { value: 'sold', label: 'Produto já foi vendido ou serviço já foi realizado' },
  { value: 'wrong_location', label: 'Localização não corresponde' },
  { value: 'wrong_price', label: 'Preço enganoso ou errado' },
  { value: 'spam', label: 'Propaganda indevida ou brincadeira' },
  { value: 'wrong_category', label: 'Categoria incorreta' },
  { value: 'duplicate', label: 'Anúncio duplicado' },
  { value: 'illegal', label: 'Produto/serviço proibido, ilegal ou ofensivo' },
  { value: 'fraud', label: 'Suspeita de golpe (fraude)' },
];

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function ReportPage() {
  const { type, slug } = useParams<{ type: string; slug: string }>();
  const navigate = useNavigate();

  interface ReportItem { id: number; title?: string; name?: string; origem?: string; [key: string]: unknown; }

  const [item, setItem] = useState<ReportItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
    if (!type || !slug) {
      setError('Link inválido.');
      setLoading(false);
      return;
    }
    fetchItem();
  }, [type, slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchItem = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = type === 'frete' ? `public-freight/${slug}` : `anuncio/${slug}`;
      const res = await api.get(endpoint);
      if (res.data?.success && res.data?.data) {
        setItem(res.data.data);
      } else {
        setError('Item não encontrado.');
      }
    } catch {
      setError('Erro ao carregar dados do anúncio.');
    } finally {
      setLoading(false);
    }
  };

  const itemTitle = item?.title || item?.name || item?.product || item?.origem || slug || 'Item';
  const itemUrl = type === 'frete' ? `/frete/${slug}` : `/anuncio/${slug}`;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_IMAGES - images.length;

    const valid: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files.slice(0, remaining)) {
      if (!ALLOWED_TYPES.includes(file.type)) continue;
      if (file.size > MAX_FILE_SIZE) continue;
      valid.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setImages(prev => [...prev, ...valid]);
    setPreviews(prev => [...prev, ...newPreviews]);

    if (e.target) e.target.value = '';
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    if (!description.trim()) return;
    if (!item?.id) return;

    setSubmitting(true);

    try {
      const uploaded: string[] = [];

      for (const file of images) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await api.post('upload-temp', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (uploadRes.data?.success && uploadRes.data?.url) {
          uploaded.push(uploadRes.data.url);
        }
      }

      const res = await api.post('reports', {
        target_type: type === 'frete' ? 'freight' : 'listing',
        target_id: item.id,
        reason,
        description,
        images: uploaded,
      });

      if (res.data?.success) {
        setSuccess(true);
      } else {
        throw new Error(res.data?.message || 'Erro ao enviar denúncia.');
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Erro ao enviar denúncia.';
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Header />
        <div className="max-w-2xl mx-auto px-4 pt-32 pb-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Denúncia enviada!</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Sua denúncia foi registrada e será analisada pela nossa equipe.
          </p>
          <Link
            to={itemUrl}
            className="inline-flex items-center gap-2 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft size={16} /> Voltar ao anúncio
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <Header />
        <div className="max-w-2xl mx-auto px-4 pt-32 pb-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Ops!</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-10 lg:py-16">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Voltar
        </button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
            <Flag className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Denunciar Anúncio</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sua denúncia é anônima e será analisada pela nossa equipe.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
            <Link
              to={itemUrl}
              className="text-sm font-bold text-slate-900 dark:text-white hover:text-orange-500 transition-colors line-clamp-2"
            >
              {itemTitle}
            </Link>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Tipo de problema <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors appearance-none"
            >
              <option value="">Selecione um motivo...</option>
              {REPORT_REASONS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Descrição <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={1000}
              rows={5}
              required
              placeholder="Descreva o problema com detalhes..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors resize-none"
            />
            <p className="text-xs text-slate-400 mt-1 text-right">{description.length}/1000</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Imagens (opcional, até {MAX_IMAGES})
            </label>

            <div className="flex flex-wrap gap-3">
              {previews.map((src, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden group">
                  <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}

              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-orange-500 hover:border-orange-500 transition-colors"
                >
                  <Upload size={20} />
                  <span className="text-[10px] font-bold">{images.length}/{MAX_IMAGES}</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />

            <p className="text-xs text-slate-400 mt-2">JPG, JPEG, PNG ou WEBP. Máx. 5MB cada.</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !reason || !description.trim()}
            className="w-full h-12 rounded-2xl bg-red-500 hover:bg-red-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Flag size={18} />
            )}
            {submitting ? 'Enviando...' : 'Enviar Denúncia'}
          </button>
        </form>
      </div>

      <Footer />
    </div>
  );
}
