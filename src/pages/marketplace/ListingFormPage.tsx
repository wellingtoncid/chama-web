import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Camera, Loader2, AlertCircle, X, Plus, MapPin, Star, ExternalLink, Search, Eye, MousePointer } from 'lucide-react';
import { api } from '@/api/api';
import { getStates, getCitiesByState } from '@/services/location';
import { AdImage } from '@/components/AdImage';
import Swal from 'sweetalert2';

const MARKETPLACE_CONFIG = {
  maxImages: 5,
  maxSizeMB: 3,
  acceptedFormats: ['image/jpeg', 'image/png', 'image/webp'],
};

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface UserOption {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AffiliatePreview {
  title: string;
  price: number;
  main_image: string;
  seller_name: string;
  condition: string;
}

export default function ListingFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEditing = Boolean(id);
  const isAffiliateMode = searchParams.get('affiliate') === 'true';

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [states, setStates] = useState<{ sigla: string; nome: string }[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    item_condition: 'usado',
    location_city: '',
    location_state: '',
    description: '',
  });

  const [isAffiliate, setIsAffiliate] = useState(isAffiliateMode);
  const [externalUrl, setExternalUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [affiliatePreview, setAffiliatePreview] = useState<AffiliatePreview | null>(null);
  const [hasAffiliateAccess, setHasAffiliateAccess] = useState(false);
  const [checkingAffiliate, setCheckingAffiliate] = useState(true);

  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const user = JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}');
  const isAdmin = ['admin', 'manager'].includes(user.role?.toLowerCase());

  useEffect(() => {
    loadInitialData();
    checkAffiliateAccess();
  }, []);

  const checkAffiliateAccess = async () => {
    try {
      const res = await api.get('/affiliate/access');
      if (res.data?.success) {
        setHasAffiliateAccess(res.data.data?.has_access ?? res.data.has_access ?? false);
      }
    } catch (error) {
      console.error('Erro ao verificar acesso de afiliado:', error);
    } finally {
      setCheckingAffiliate(false);
    }
  };

  useEffect(() => {
    if (formData.location_state) {
      loadCities(formData.location_state);
    }
  }, [formData.location_state]);

  useEffect(() => {
    if (isEditing && id) {
      loadListing();
    }
  }, [id]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    } else {
      setSelectedUserId(user.id);
    }
  }, [isAdmin]);

  const loadInitialData = async () => {
    try {
      const [statesData, categoriesRes] = await Promise.all([
        getStates(),
        api.get('/listing-categories')
      ]);

      setStates(statesData);

      if (categoriesRes.data?.success && categoriesRes.data.data.length > 0) {
        setCategories(categoriesRes.data.data);
        if (!isEditing) {
          setFormData(prev => ({ ...prev, category: categoriesRes.data.data[0].slug }));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
  };

  const loadCities = async (stateSigla: string) => {
    try {
      const citiesData = await getCitiesByState(stateSigla);
      setCities(citiesData);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
    }
  };

  const loadListing = async () => {
    try {
      const res = await api.get(`/listing/${id}`);
      if (res.data?.success) {
        const listing = res.data.data;

        if (listing.location_state) {
          const citiesData = await getCitiesByState(listing.location_state);
          setCities(citiesData);
        }

        setFormData({
          title: listing.title || '',
          category: listing.category || '',
          price: listing.price || '',
          item_condition: listing.item_condition || 'usado',
          location_city: listing.location_city || '',
          location_state: listing.location_state || '',
          description: listing.description || '',
        });

        if (listing.gallery && listing.gallery.length > 0) {
          setExistingImages(listing.gallery);
        }

        if (listing.is_affiliate) {
          setIsAffiliate(true);
          setExternalUrl(listing.external_url || '');
        }

        setSelectedUserId(listing.user_id);
      }
    } catch (error) {
      Swal.fire({
        title: 'Erro',
        text: 'Não foi possível carregar o anúncio.',
        icon: 'error',
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
        color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
      }).then(() => navigate('/dashboard'));
    } finally {
      setLoadingData(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get('/list-all-users?limit=100');
      if (res.data?.success && res.data.data) {
        const userList = res.data.data.filter((u: any) => u.role !== 'admin' && u.role !== 'manager');
        setUsers(userList);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleScrapeProduct = async () => {
    if (!externalUrl) {
      Swal.fire('Atenção', 'Cole a URL do produto do Mercado Livre primeiro.', 'warning');
      return;
    }

    setScraping(true);
    setAffiliatePreview(null);

    try {
      const res = await api.post('/affiliate/scrape', { url: externalUrl });

      if (res.data?.success && res.data.data) {
        const data = res.data.data;
        setAffiliatePreview({
          title: data.title || '',
          price: data.price || 0,
          main_image: data.main_image || '',
          seller_name: data.seller_name || '',
          condition: data.condition || '',
        });

        if (data.title && !formData.title) {
          setFormData(prev => ({ ...prev, title: data.title }));
        }
        if (data.price && !formData.price) {
          setFormData(prev => ({ ...prev, price: data.price.toString() }));
        }
        if (data.main_image && existingImages.length === 0) {
          setExistingImages([data.main_image]);
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Não foi possível buscar os dados do produto.';
      Swal.fire('Erro', message, 'error');
    } finally {
      setScraping(false);
    }
  };

  const validateImage = (file: File): string | null => {
    if (!MARKETPLACE_CONFIG.acceptedFormats.includes(file.type)) {
      return `Formato não suportado: ${file.name}. Use JPG, PNG ou WebP.`;
    }
    const maxBytes = MARKETPLACE_CONFIG.maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `Arquivo muito grande: ${file.name}. Máximo ${MARKETPLACE_CONFIG.maxSizeMB}MB.`;
    }
    return null;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors([]);
    const files = Array.from(e.target.files || []);
    const totalImages = images.length + files.length + existingImages.length;

    if (totalImages > MARKETPLACE_CONFIG.maxImages) {
      setErrors([`Máximo de ${MARKETPLACE_CONFIG.maxImages} imagens permitidas.`]);
      return;
    }

    const newErrors: string[] = [];
    const validImages: File[] = [];

    files.forEach(file => {
      const error = validateImage(file);
      if (error) {
        newErrors.push(error);
      } else {
        validImages.push(file);
      }
    });

    if (newErrors.length > 0) setErrors(newErrors);
    if (validImages.length > 0) setImages(prev => [...prev, ...validImages]);
  };

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const totalImages = images.length + existingImages.length;
    if (totalImages === 0) {
      setErrors(['Adicione pelo menos 1 imagem.']);
      return;
    }

    if (isAffiliate && !externalUrl) {
      setErrors(['Informe a URL do produto do Mercado Livre.']);
      return;
    }

    if (!selectedUserId) {
      setErrors(['Selecione um usuário para criar o anúncio.']);
      return;
    }

    setLoading(true);
    const data = new FormData(e.currentTarget);
    data.append('user_id', selectedUserId.toString());

    if (isAffiliate) {
      data.append('is_affiliate', '1');
      data.append('external_url', externalUrl);
    }

    images.forEach((img, index) => {
      data.append(`images[${index}]`, img);
    });

    try {
      if (isEditing) {
        data.append('id', id!);
        await api.post('/update-listing', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire({
          title: 'Sucesso!',
          text: 'Anúncio atualizado com sucesso!',
          icon: 'success',
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
        }).then(() => navigate(-1));
      } else {
        await api.post('/create-listing', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        Swal.fire({
          title: 'Sucesso!',
          text: 'Anúncio publicado com sucesso!',
          icon: 'success',
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
        }).then(() => navigate(-1));
      }
    } catch (error: any) {
      const status = error.response?.status;
      const resData = error.response?.data;

      if (status === 402 && resData?.code === 'INSUFFICIENT_BALANCE') {
        const required = resData.required || 9.90;
        const balance = resData.balance || 0;
        const freeLimit = resData.free_limit || 0;
        const usedFree = resData.used_free || 0;

        Swal.fire({
          title: 'Saldo Insuficiente',
          html: `
            <div class="text-left space-y-2">
              <p>Você precisa de <strong>R$ ${required.toFixed(2).replace('.', ',')}</strong> para publicar.</p>
              <p class="text-slate-500">Saldo atual: <strong>R$ ${balance.toFixed(2).replace('.', ',')}</strong></p>
              ${freeLimit > 0 ? `<p class="text-amber-600 mt-2">Você já usou ${usedFree} de ${freeLimit} publicação(ões) grátis este mês.</p>` : ''}
            </div>
          `,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Recarregar Carteira',
          cancelButtonText: 'Pagar com Mercado Pago',
          confirmButtonColor: '#059669',
          cancelButtonColor: '#3B82F6',
          reverseButtons: true,
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/dashboard/financeiro');
          } else if (result.isDismissed) {
            handleMercadoPagoPayment();
          }
        });
      } else if (status === 403) {
        Swal.fire({
          title: 'Sem Acesso',
          text: resData?.message || 'Você não tem acesso ao recurso de afiliados.',
          icon: 'warning',
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
        });
      } else {
        Swal.fire({
          title: 'Erro',
          text: resData?.message || 'Erro ao processar.',
          icon: 'error',
          background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
          color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMercadoPagoPayment = async () => {
    try {
      const res = await api.post('/module/purchase-per-use', {
        module_key: 'marketplace',
        feature_key: 'publish_listing',
        payment_method: 'mercadopago'
      });

      if (res.data?.success && res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (e: any) {
      Swal.fire({
        title: 'Erro',
        text: e.response?.data?.message || 'Erro ao processar pagamento.',
        icon: 'error',
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : undefined,
        color: document.documentElement.classList.contains('dark') ? '#f1f5f9' : undefined,
      });
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    );
  }

  const totalImages = images.length + existingImages.length;

  return (
    <div className="p-5 lg:p-8 max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        >
          <ArrowLeft size={18} className="text-slate-600 dark:text-slate-400" />
        </button>
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white">
            {isEditing ? 'Editar Anúncio' : 'Novo Anúncio'}
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Marketplace Ecossistema
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Admin User Selector */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl">
                <Star size={20} className="text-amber-600 fill-amber-400" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase italic text-sm">
                  Criar em Nome de
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Selecione o usuário para qual o anúncio será criado
                </p>
              </div>
            </div>
            <select
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
              required
              className="w-full p-4 bg-white dark:bg-slate-800 rounded-2xl outline-none font-bold text-sm text-slate-800 dark:text-slate-100 appearance-none border-2 border-amber-200 dark:border-amber-700 focus:border-amber-500"
            >
              <option value="">Selecione um usuário...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) - {u.role}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Affiliate Section */}
        {checkingAffiliate ? (
          <div className="rounded-2xl p-6 border-2 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700">
            <div className="animate-pulse flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
          </div>
        ) : !hasAffiliateAccess ? (
          <div className="rounded-2xl p-6 border-2 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                  <Star size={20} className="text-amber-500" />
                </div>
                <div>
                  <h3 className="font-black text-amber-700 dark:text-amber-400 uppercase italic text-sm">
                    Anúncio de Afiliado
                  </h3>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Libere acesso para criar anúncios do Mercado Livre
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/dashboard/vendas?showAffiliateModal=true')}
                className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-xs uppercase hover:bg-amber-600 transition-all"
              >
                Solicitar Acesso
              </button>
            </div>
          </div>
        ) : (
          <div className={`rounded-2xl p-6 border-2 ${isAffiliate ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-300 dark:border-amber-700' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isAffiliate ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-700'}`}>
                  <Star size={20} className={isAffiliate ? 'text-amber-500 fill-amber-400' : 'text-slate-400'} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase italic text-sm">
                    Anúncio de Afiliado
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Link do Mercado Livre com sua tag de afiliado
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAffiliate}
                  onChange={(e) => {
                    setIsAffiliate(e.target.checked);
                    if (!e.target.checked) {
                      setExternalUrl('');
                      setAffiliatePreview(null);
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
              </label>
            </div>

          {isAffiliate && (
            <div className="space-y-4 mt-4 pt-4 border-t border-amber-200 dark:border-amber-800">
              <div>
                <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 ml-2 mb-2 block">
                  URL do Produto no Mercado Livre
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={externalUrl}
                    onChange={(e) => {
                      setExternalUrl(e.target.value);
                      setAffiliatePreview(null);
                    }}
                    placeholder="https://produto.mercadolivre.com.br/MLB-xxxxx"
                    className="flex-1 p-4 bg-white dark:bg-slate-900 rounded-2xl outline-none font-bold text-sm text-slate-800 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-700 focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleScrapeProduct}
                    disabled={scraping || !externalUrl}
                    className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold text-sm flex items-center gap-2 hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50"
                  >
                    {scraping ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Search size={18} />
                    )}
                    Buscar
                  </button>
                </div>
              </div>

              {affiliatePreview && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <ExternalLink size={16} className="text-amber-500" />
                    <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400">Preview do Produto</span>
                  </div>
                  <div className="flex gap-4">
                    {affiliatePreview.main_image && (
                      <img
                        src={affiliatePreview.main_image}
                        alt={affiliatePreview.title}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">
                        {affiliatePreview.title}
                      </p>
                      {affiliatePreview.price > 0 && (
                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(affiliatePreview.price)}
                        </p>
                      )}
                      {affiliatePreview.seller_name && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Vendido por: {affiliatePreview.seller_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <strong>Como funciona:</strong> Quando alguém clicar no botão "Comprar", será redirecionado para o Mercado Livre com sua tag de afiliado. Você ganhará comissão pelas vendas.
                </p>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Images Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
          <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 ml-2 mb-3 block">
            Fotos ({totalImages}/{MARKETPLACE_CONFIG.maxImages})
          </label>

          {existingImages.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mb-3">
              {existingImages.map((img, index) => (
                <div key={`existing-${index}`} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600">
                  <AdImage url={img} className="w-full h-full object-cover" alt={`Imagem ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-emerald-500 text-white text-[8px] font-black px-1 rounded">Capa</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-5 gap-2 mb-3">
              {images.map((img, index) => (
                <div key={`new-${index}`} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600">
                  <img src={URL.createObjectURL(img)} alt={`Nova imagem ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                  <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-[8px] font-black px-1 rounded">Nova</span>
                </div>
              ))}
            </div>
          )}

          {totalImages < MARKETPLACE_CONFIG.maxImages && (
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl p-6 text-center hover:border-emerald-500 transition-all cursor-pointer relative">
              <input
                type="file"
                accept={MARKETPLACE_CONFIG.acceptedFormats.join(',')}
                multiple
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Camera className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={32} />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Clique para adicionar fotos</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                {MARKETPLACE_CONFIG.maxImages - totalImages} foto(s) disponível(s)
              </p>
            </div>
          )}

          {errors.length > 0 && (
            <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
              {errors.map((error, index) => (
                <div key={index} className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs mb-1 last:mb-0">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 space-y-4">
          <div>
            <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 ml-2 mb-2 block">Título do Anúncio</label>
            <input
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ex: Caminhão Scania R440 ou Pneu Usado"
              className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-2 border-transparent focus:border-emerald-500/20 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 ml-2 mb-2 block">Categoria</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold text-slate-800 dark:text-slate-100 appearance-none"
              >
                <option value="">Selecione...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 ml-2 mb-2 block">Preço (R$)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0,00"
                className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 ml-2 mb-2 block">Condição</label>
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="item_condition"
                  value="novo"
                  checked={formData.item_condition === 'novo'}
                  onChange={handleInputChange}
                  className="hidden peer"
                />
                <div className="p-4 text-center border-2 rounded-2xl font-black uppercase text-xs peer-checked:border-emerald-500 peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-900/30 peer-checked:text-emerald-600 dark:peer-checked:text-emerald-400 text-slate-400 dark:text-slate-500 cursor-pointer transition-all">
                  Novo
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input
                  type="radio"
                  name="item_condition"
                  value="usado"
                  checked={formData.item_condition === 'usado'}
                  onChange={handleInputChange}
                  className="hidden peer"
                />
                <div className="p-4 text-center border-2 rounded-2xl font-black uppercase text-xs peer-checked:border-emerald-500 peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-900/30 peer-checked:text-emerald-600 dark:peer-checked:text-emerald-400 text-slate-400 dark:text-slate-500 cursor-pointer transition-all">
                  Usado
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 ml-2 mb-2 block">Estado</label>
              <div className="relative">
                <select
                  name="location_state"
                  value={formData.location_state}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold text-xs text-slate-800 dark:text-slate-100 appearance-none pr-10"
                >
                  <option value="">Selecione...</option>
                  {states.map((state) => (
                    <option key={state.sigla} value={state.sigla}>
                      {state.nome} ({state.sigla})
                    </option>
                  ))}
                </select>
                <MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 ml-2 mb-2 block">Cidade</label>
              <div className="relative">
                <select
                  name="location_city"
                  value={formData.location_city}
                  onChange={handleInputChange}
                  disabled={!formData.location_state}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold text-xs text-slate-800 dark:text-slate-100 appearance-none pr-10 disabled:opacity-50"
                >
                  <option value="">Selecione...</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <MapPin size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 ml-2 mb-2 block">Descrição</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Descreva seu produto..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase text-xs transition-all hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || totalImages === 0}
            className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs transition-all hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : totalImages === 0 ? (
              'Adicione pelo menos 1 foto'
            ) : isEditing ? (
              <>
                <Plus size={18} /> Salvar Alterações
              </>
            ) : (
              <>
                <Plus size={18} /> Publicar Anúncio
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
