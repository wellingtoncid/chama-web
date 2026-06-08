import { useState, useEffect } from 'react';
import { X, Loader2, Image as ImageIcon, MapPin, Lock } from 'lucide-react';
import { api } from '@/api/api';
import { getImageUrl } from '@/lib/utils';
import { getStates, getCitiesByState } from '@/services/location';
import { useAdPositions } from '@/hooks/useAdPositions';
import { AD_POSITIONS, AD_POSITION_SIZE } from '@/constants/adPositions';
import { Button } from '@/components/ui/Button';
import Swal from 'sweetalert2';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingAd: any | null;
  includedPositions: string[];
  positionLimits: Record<string, number>;
  periodStart: string | null;
  myAds: any[];
}

export default function AdvertiserFormModal({ isOpen, onClose, onSaved, editingAd, includedPositions, positionLimits, periodStart, myAds }: Props) {
  const { positions } = useAdPositions();
  const [creating, setCreating] = useState(false);
  const [states, setStates] = useState<{ sigla: string; nome: string }[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    destination_url: '',
    position: 'sidebar',
    location_state: '',
    location_city: '',
    image: null as File | null,
  });
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => { getStates().then(setStates); }, []);

  useEffect(() => {
    if (formData.location_state) {
      setLoadingCities(true);
      getCitiesByState(formData.location_state).then(setCities).finally(() => setLoadingCities(false));
    } else {
      setCities([]);
    }
  }, [formData.location_state]);

  useEffect(() => {
    if (editingAd) {
      setFormData({
        title: editingAd.title || '',
        description: editingAd.description || '',
        image_url: editingAd.image_url || '',
        destination_url: editingAd.destination_url || '',
        position: editingAd.position || 'sidebar',
        location_state: editingAd.location_state || '',
        location_city: editingAd.location_city || '',
        image: null,
      });
      setPreview(getImageUrl(editingAd.image_url));
    } else {
      setFormData({ title: '', description: '', image_url: '', destination_url: '', position: 'sidebar', location_city: '', location_state: '', image: null });
      setPreview(null);
    }
  }, [editingAd]);

  const resetForm = () => {
    setFormData({ title: '', description: '', image_url: '', destination_url: '', position: 'sidebar', location_city: '', location_state: '', image: null });
    setPreview(null);
  };

  const formatPrice = (value: number | string) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && num > 0 ? `R$ ${num.toFixed(2).replace('.', ',')}` : 'Grátis';
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.destination_url) {
      return Swal.fire({ icon: 'error', title: 'Erro', text: 'Preencha o título e link de destino' });
    }

    setCreating(true);
    try {
      const data = new FormData();
      if (editingAd) {
        data.append('id', editingAd.id.toString());
        data.append('action', 'update');
      }
      data.append('user_id', (JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}').id || '').toString());
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('destination_url', formData.destination_url);
      data.append('position', formData.position);
      data.append('location_state', formData.location_state);
      data.append('location_city', formData.location_city);
      data.append('status', 'active');
      if (formData.image) data.append('image', formData.image);

      const res = await api.post('/ads/save', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        Swal.fire({ icon: 'success', title: 'Sucesso!', text: editingAd ? 'Anúncio atualizado!' : 'Anúncio criado com sucesso!' });
        resetForm();
        onSaved();
      } else {
        const msg = res.data?.message || 'Erro ao criar anúncio';
        if (res.data?.requires_payment) {
          const price = res.data?.price_monthly || res.data?.price_per_use;
          Swal.fire({
            icon: 'warning',
            title: 'Pagamento Necessário',
            text: `${msg}. Valor: ${formatPrice(price)}`,
            showCancelButton: true,
            confirmButtonText: 'Assinar',
            cancelButtonText: 'Cancelar',
          }).then((result) => {
            if (result.isConfirmed && res.data?.feature_name) {
              api.post('/module/subscribe-monthly', { module_key: 'advertiser', feature_key: formData.position })
                .then(subRes => {
                  if (subRes.data?.success && subRes.data?.url) {
                    window.location.href = subRes.data.url;
                  } else {
                    Swal.fire({ icon: 'error', title: 'Erro', text: subRes.data?.message || 'Erro ao processar pagamento' });
                  }
                });
            }
          });
        } else {
          Swal.fire({ icon: 'error', title: 'Erro', text: msg });
        }
      }
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Erro', text: err.response?.data?.message || 'Erro ao criar anúncio' });
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black uppercase italic">{editingAd ? 'Editar Anúncio' : 'Novo Anúncio'}</h2>
          <button onClick={() => { resetForm(); onClose(); }}>
            <X size={24} className="text-slate-400 hover:text-slate-600 transition-colors" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            <div className={`h-32 rounded-2xl border-2 border-dashed flex items-center justify-center ${preview ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-700'}`}>
              {preview ? (
                <img src={preview} alt="Preview" className="h-full object-contain p-2" />
              ) : (
                <div className="text-center text-slate-400">
                  <ImageIcon className="mx-auto mb-2" size={24} />
                  <p className="text-xs font-bold">Clique para adicionar imagem</p>
                  {(() => {
                    const size = formData.position ? AD_POSITION_SIZE[formData.position] : null;
                    return size ? <p className="text-[9px] text-slate-400 mt-0.5">Tamanho recomendado: {size}</p> : null;
                  })()}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 block mb-2">Espaço Publicitário</label>
            <select
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm dark:text-white"
            >
              {positions.filter(pos => Number(pos.is_public)).map(pos => {
                const isIncluded = includedPositions.includes(pos.feature_key);
                const limit = positionLimits[pos.feature_key] || 1;
                const used = myAds.filter((a: any) =>
                  a.position === pos.feature_key &&
                  (!periodStart || a.created_at?.split(' ')[0] >= periodStart)
                ).length;
                const full = isIncluded && used >= limit;
                return (
                  <option key={pos.feature_key} value={pos.feature_key} disabled={full}>
                    {pos.feature_name} {AD_POSITION_SIZE[pos.feature_key] ? `(${AD_POSITION_SIZE[pos.feature_key]})` : pos.ad_size ? `(${pos.ad_size})` : ''} — {isIncluded ? `INCLUSO (${used}/${limit})` : `${formatPrice(pos.price_monthly)}/mês`}
                  </option>
                );
              })}
            </select>

            {formData.position && (() => {
              const posInfo = AD_POSITIONS.find(p => p.key === formData.position);
              if (!posInfo) return null;
              return (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 rounded-xl space-y-2">
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{posInfo.description}</p>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-blue-400 shrink-0" />
                    <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">{posInfo.pages}</span>
                  </div>
                </div>
              );
            })()}

            {formData.position && includedPositions.includes(formData.position) && (() => {
              const limit = positionLimits[formData.position] || 1;
              const used = myAds.filter((a: any) =>
                a.position === formData.position &&
                (!periodStart || a.created_at?.split(' ')[0] >= periodStart)
              ).length;
              return used >= limit ? (
                <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2">
                  <Lock size={12} className="text-amber-500 shrink-0" />
                  <p className="text-[10px] text-amber-700 dark:text-amber-400">
                    Limite de {limit} anúncio(s) neste período para esta posição. Remova anúncios existentes ou aguarde o próximo ciclo.
                  </p>
                </div>
              ) : null;
            })()}
            {formData.position && !includedPositions.includes(formData.position) && (
              <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2">
                <Lock size={12} className="text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-700 dark:text-amber-400">
                  Esta posição não está incluída no seu plano. Será cobrado valor avulso ao criar o anúncio.
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 block mb-2">Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Promoção de Pneus"
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 block mb-2">Estado (UF)</label>
              <select
                value={formData.location_state}
                onChange={(e) => setFormData(prev => ({ ...prev, location_state: e.target.value, location_city: '' }))}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm dark:text-white"
              >
                <option value="">Brasil (Nacional)</option>
                {states.map(s => (
                  <option key={s.sigla} value={s.sigla}>{s.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 block mb-2">
                Cidade {loadingCities && <Loader2 size={12} className="inline animate-spin" />}
              </label>
              <select
                value={formData.location_city}
                onChange={(e) => setFormData(prev => ({ ...prev, location_city: e.target.value }))}
                disabled={!formData.location_state || loadingCities}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm disabled:opacity-50 dark:text-white"
              >
                <option value="">Todas as cidades</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 block mb-2">Link de Destino (URL ou WhatsApp)</label>
            <input
              type="url"
              value={formData.destination_url}
              onChange={(e) => setFormData(prev => ({ ...prev, destination_url: e.target.value }))}
              placeholder="https://wa.me/..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm dark:text-white"
              required
            />
          </div>

          <div>
            <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 block mb-2">Descrição (opcional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detalhes do anúncio..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm h-20 dark:text-white"
            />
          </div>

          <Button type="submit" disabled={creating} className="w-full" size="xl">
            {creating ? <Loader2 className="animate-spin" size={20} /> : (editingAd ? 'Salvar Alterações' : 'Criar Anúncio')}
          </Button>
        </form>
      </div>
    </div>
  );
}
