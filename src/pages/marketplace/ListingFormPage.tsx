import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Camera, Loader2, AlertCircle, X, Plus, MapPin, Star,
  ExternalLink, Search, CheckCircle, CreditCard, Wallet
} from 'lucide-react';
import { api } from '../../api/api';
import { getStates, getCitiesByState } from '../../services/location';
import { AdImage } from '../../components/AdImage';
import { Button } from '../../components/ui/Button';
import DashboardShell from '../../components/layout/DashboardShell';

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
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [states, setStates] = useState<{ sigla: string; nome: string }[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning'>('success');
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceData, setBalanceData] = useState<{ required: number; balance: number; freeLimit: number; usedFree: number } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    subcategory: '',
    price: '',
    item_condition: 'usado',
    location_city: '',
    location_state: '',
    description: '',
    accepting_offers: false,
    contact_preference: 'whatsapp',
    accepting_trade: false,
  });

  const [isAffiliate, setIsAffiliate] = useState(isAffiliateMode);
  const [externalUrl, setExternalUrl] = useState('');
  const [scraping, setScraping] = useState(false);
  const [affiliatePreview, setAffiliatePreview] = useState<AffiliatePreview | null>(null);
  const [hasAffiliateAccess, setHasAffiliateAccess] = useState(false);
  const [requestsEnabled, setRequestsEnabled] = useState(true);
  const [checkingAffiliate, setCheckingAffiliate] = useState(true);

  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const user = JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}');
  const isAdmin = ['admin', 'manager'].includes(user.role?.toLowerCase());

  const showAlert = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setAlertMsg(msg);
    setAlertType(type);
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const AlertToast = () => {
    if (!alertMsg) return null;
    const colors = {
      success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
      error: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
      warning: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
    };
    return (
      <div className={`fixed top-6 right-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-2xl border shadow-lg animate-in slide-in-from-right-4 duration-300 ${colors[alertType]}`}>
        {alertType === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
        <span className="font-bold text-sm">{alertMsg}</span>
      </div>
    );
  };

  useEffect(() => {
    loadInitialData();
    checkAffiliateAccess();
  }, []);

  const checkAffiliateAccess = async () => {
    try {
      const res = await api.get('/affiliate/access');
      if (res.data?.success) {
        setHasAffiliateAccess(res.data.data?.has_access ?? res.data.has_access ?? false);
        setRequestsEnabled(res.data.data?.requests_enabled ?? res.data.requests_enabled ?? true);
      }
    } catch (error) {
      console.error('Erro ao verificar acesso de afiliado:', error);
      setRequestsEnabled(false);
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

  // Carregar subcategorias quando a categoria mudar
  useEffect(() => {
    if (!formData.category) {
      setSubcategories([]);
      return;
    }
    const loadSubcats = async () => {
      try {
        const res = await api.get(`/listing-categories/${formData.category}/subcategories`);
        if (res.data?.success) {
          setSubcategories(res.data.data);
        }
      } catch {
        setSubcategories([]);
      }
    };
    loadSubcats();
  }, [formData.category]);

  const loadInitialData = async () => {
    try {
      const [statesData, categoriesRes] = await Promise.all([
        getStates(),
        api.get('/listing-categories?parents_only=true')
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
          subcategory: listing.subcategory || '',
          price: listing.price ? String(Math.round(Number(listing.price) * 100)) : '',
          item_condition: listing.item_condition || 'usado',
          location_city: listing.location_city || '',
          location_state: listing.location_state || '',
          description: listing.description || '',
          accepting_offers: Number(listing.accepting_offers) === 1,
          contact_preference: listing.contact_preference || 'whatsapp',
          accepting_trade: Number(listing.accepting_trade) === 1,
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
    } catch {
      showAlert('Não foi possível carregar o anúncio.', 'error');
      setTimeout(() => navigate('/dashboard'), 1500);
    } finally {
      setLoadingData(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get('/list-all-users?limit=100');
      if (res.data?.success && res.data.data) {
        const userList = res.data.data.filter((u: any) => u.role !== 'admin' && u.role !== 'manager'); // eslint-disable-line @typescript-eslint/no-explicit-any
        setUsers(userList);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleScrapeProduct = async () => {
    if (!externalUrl) {
      showAlert('Cole a URL do produto do Mercado Livre primeiro.', 'warning');
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
          setFormData(prev => ({ ...prev, price: String(Math.round(Number(data.price) * 100)) }));
        }
        if (data.main_image && existingImages.length === 0) {
          setExistingImages([data.main_image]);
        }
      }
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      const message = error.response?.data?.message || 'Não foi possível buscar os dados do produto.';
      showAlert(message, 'error');
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
    const target = e.target;
    setFormData(prev => ({
      ...prev,
      [target.name]: target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value
    }));
  };

  const formatCurrency = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const num = parseInt(digits, 10) / 100;
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, price: raw }));
  };

  const displayPrice = formData.price ? formatCurrency(formData.price) : '';

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
    data.set('price', String(parseInt(formData.price || '0', 10) / 100));
    data.set('accepting_offers', formData.accepting_offers ? '1' : '0');
    data.set('accepting_trade', formData.accepting_trade ? '1' : '0');
    data.set('contact_preference', formData.contact_preference);
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
        showAlert('Anúncio atualizado com sucesso!', 'success');
        setTimeout(() => navigate(-1), 1200);
      } else {
        await api.post('/create-listing', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showAlert('Anúncio publicado com sucesso!', 'success');
        setTimeout(() => navigate(-1), 1200);
      }
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      const status = error.response?.status;
      const resData = error.response?.data;

      if (status === 402 && resData?.code === 'INSUFFICIENT_BALANCE') {
        setBalanceData({
          required: resData.required || 9.90,
          balance: resData.balance || 0,
          freeLimit: resData.free_limit || 0,
          usedFree: resData.used_free || 0,
        });
        setShowBalanceModal(true);
      } else if (status === 403) {
        showAlert(resData?.message || 'Você não tem acesso ao recurso de afiliados.', 'warning');
      } else {
        showAlert(resData?.message || 'Erro ao processar.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMercadoPagoPayment = async () => {
    setShowBalanceModal(false);
    try {
      const res = await api.post('/module/purchase-per-use', {
        module_key: 'marketplace',
        feature_key: 'publish_listing',
        payment_method: 'mercadopago'
      });

      if (res.data?.success && res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      showAlert(e.response?.data?.message || 'Erro ao processar pagamento.', 'error');
    }
  };

  if (loadingData) {
    return (
      <DashboardShell title="Novo Anúncio" description="Crie um anúncio para o marketplace">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="space-y-2">
              <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
              <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const totalImages = images.length + existingImages.length;

  return (
    <DashboardShell title="Novo Anúncio" description="Crie um anúncio para o marketplace">
      <AlertToast />

      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-slate-400 dark:text-slate-500"
        >
          <ArrowLeft size={16} /> Voltar
        </Button>

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
          ) : !hasAffiliateAccess && requestsEnabled ? (
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
                <Button
                  variant="default"
                  onClick={() => navigate('/dashboard/vendas?showAffiliateModal=true')}
                >
                  Solicitar Acesso
                </Button>
              </div>
            </div>
          ) : hasAffiliateAccess ? (
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
                    <Button
                      type="button"
                      onClick={handleScrapeProduct}
                      disabled={scraping || !externalUrl}
                      variant="default"
                    >
                      {scraping ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Search size={18} />
                      )}
                      Buscar
                    </Button>
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
          ) : null}

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
                <div className="relative">
                  <input
                    name="title"
                    required
                    maxLength={70}
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ex: Caminhão Scania R440 ou Pneu Usado"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border-2 border-transparent focus:border-emerald-500/20 transition-all pr-16"
                  />
                  <span className={`absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold ${
                    formData.title.length > 60 ? 'text-red-500' : formData.title.length > 50 ? 'text-amber-500' : 'text-slate-400'
                  }`}>
                    {formData.title.length}/70
                  </span>
                </div>
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
                  type="text"
                  inputMode="numeric"
                  required
                  value={displayPrice}
                  onChange={handlePriceChange}
                  placeholder="0,00"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold text-slate-800 dark:text-slate-100 tabular-nums"
                />
              </div>
            </div>

            {subcategories.length > 0 && (
              <div>
                <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 ml-2 mb-2 block">Subcategoria</label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold text-slate-800 dark:text-slate-100 appearance-none"
                >
                  <option value="">Todas as subcategorias</option>
                  {subcategories.map((sub) => (
                    <option key={sub.id} value={sub.slug}>{sub.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-2xl cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="accepting_offers"
                  checked={formData.accepting_offers}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded accent-emerald-600"
                />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Aceito ofertas
                </span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-2xl cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="accepting_trade"
                  checked={formData.accepting_trade}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded accent-emerald-600"
                />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Aceito troca
                </span>
              </label>
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
              <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 ml-2 mb-2 block">
                Meio de Contato Preferencial
              </label>
              <div className="flex gap-2">
                {[
                  { value: 'whatsapp', label: 'WhatsApp' },
                  { value: 'chat', label: 'Chat' },
                  { value: 'ambos', label: 'Ambos' },
                ].map((opt) => (
                  <label key={opt.value} className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="contact_preference"
                      value={opt.value}
                      checked={formData.contact_preference === opt.value}
                      onChange={handleInputChange}
                      className="hidden peer"
                    />
                    <div className="p-3 text-center border-2 rounded-2xl font-black uppercase text-xs peer-checked:border-emerald-500 peer-checked:bg-emerald-50 dark:peer-checked:bg-emerald-900/30 peer-checked:text-emerald-600 dark:peer-checked:text-emerald-400 text-slate-400 dark:text-slate-500 cursor-pointer transition-all">
                      {opt.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 ml-2 mb-2 block">Descrição</label>
              <div className="relative">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  maxLength={3000}
                  placeholder="Descreva seu produto com detalhes..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl outline-none font-bold text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                />
                <span className="absolute bottom-3 right-3 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  {formData.description.length}/3000
                </span>
              </div>
            </div>
          </div>

          {/* Preview + Submit Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                const preview = document.getElementById('listing-preview');
                if (preview) preview.classList.toggle('hidden');
              }}
              className="w-full p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-bold text-xs uppercase hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Visualizar Anúncio
            </button>

            <div id="listing-preview" className="hidden max-w-sm mx-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
              <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-300 dark:text-slate-600 text-xs font-bold">
                {existingImages[0] ? (
                  <AdImage url={existingImages[0]} className="w-full h-full object-cover" alt="Preview" />
                ) : images[0] ? (
                  <img src={URL.createObjectURL(images[0])} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-300 dark:text-slate-600">
                    <rect width="18" height="18" x="3" y="3" rx="2"/>
                    <circle cx="9" cy="9" r="2"/>
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                  </svg>
                )}
              </div>
              <div className="p-4">
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">{formData.category || 'categoria'}</span>
                  {formData.accepting_offers && (
                    <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-full">Aceito ofertas</span>
                  )}
                  {formData.accepting_trade && (
                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-full">Aceito troca</span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-2 uppercase">{formData.title || 'Título do anúncio'}</h3>
                <p className="text-[10px] text-slate-400 mb-2 leading-relaxed line-clamp-2">{formData.description || 'Descrição do anúncio...'}</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formData.price ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseInt(formData.price, 10) / 100) : 'R$ 0,00'}
                  </p>
                  <span className="text-[10px] text-slate-400">{formData.item_condition === 'novo' ? 'Novo' : 'Usado'} &middot; {formData.location_state || '—'}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                  <span>Contato: {formData.contact_preference === 'whatsapp' ? 'WhatsApp' : formData.contact_preference === 'chat' ? 'Chat' : 'WhatsApp / Chat'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
                size="lg"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || totalImages === 0}
                className="flex-1"
                size="lg"
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
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Insufficient Balance Modal */}
      {showBalanceModal && balanceData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic text-slate-900 dark:text-white">Saldo Insuficiente</h3>
              <button onClick={() => setShowBalanceModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  Você precisa de <strong className="text-orange-600 dark:text-orange-400">R$ {balanceData.required.toFixed(2).replace('.', ',')}</strong> para publicar.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 flex items-center gap-3">
                <Wallet size={20} className="text-slate-400" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Saldo atual: <strong>R$ {balanceData.balance.toFixed(2).replace('.', ',')}</strong>
                </p>
              </div>
              {balanceData.freeLimit > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Você já usou {balanceData.usedFree} de {balanceData.freeLimit} publicação(ões) grátis este mês.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard/financeiro')}
                className="flex-1"
              >
                <CreditCard size={16} /> Recarregar Carteira
              </Button>
              <Button
                variant="default"
                onClick={handleMercadoPagoPayment}
                className="flex-1"
              >
                Pagar com Mercado Pago
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
