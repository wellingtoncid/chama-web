import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  X, Check, Star, Zap, 
  AlertCircle, Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';

interface CheckoutModalMarketplaceProps {
  listingId: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface PricingOption {
  type: 'featured' | 'bump' | 'sponsored';
  name: string;
  description: string;
  price: number;
  duration: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function CheckoutModalMarketplace({ listingId, onClose, onSuccess }: CheckoutModalMarketplaceProps) {
  const [selectedOption, setSelectedOption] = useState<PricingOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<PricingOption[]>([]);

  useEffect(() => {
    loadPricingOptions();
  }, []);

  const loadPricingOptions = async () => {
    try {
      const res = await api.get('/wallet/pricing', { params: { module: 'marketplace' } });
      if (res.data?.success) {
        const rules = res.data.data || [];
        
        const featured = rules.find((r: any) => r.feature_key === 'featured_listing');
        const bump = rules.find((r: any) => r.feature_key === 'bump');
        const sponsored = rules.find((r: any) => r.feature_key === 'sponsored');
        
        const loadedOptions: PricingOption[] = [];
        
        if (featured) {
          loadedOptions.push({
            type: 'featured',
            name: featured.feature_name || 'Destaque',
            description: 'Seu anúncio aparece em posição destacada nas buscas',
            price: Number(featured.price_per_use),
            duration: featured.duration_days || 7,
            icon: <Star size={20} />,
            color: 'text-amber-500',
            bgColor: 'bg-amber-50 dark:bg-amber-900/30'
          });
        }
        
        if (bump) {
          loadedOptions.push({
            type: 'bump',
            name: bump.feature_name || 'Prorrogar',
            description: 'Adicione mais dias ao seu anúncio',
            price: Number(bump.price_per_use),
            duration: bump.duration_days || 7,
            icon: <Zap size={20} />,
            color: 'text-blue-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/30'
          });
        }

        if (sponsored) {
          loadedOptions.push({
            type: 'sponsored',
            name: sponsored.feature_name || 'Patrocinado',
            description: 'Seu anúncio aparece no topo da primeira linha de resultados',
            price: Number(sponsored.price_per_use),
            duration: sponsored.duration_days || 7,
            icon: <Star size={20} />,
            color: 'text-purple-500',
            bgColor: 'bg-purple-50 dark:bg-purple-900/30'
          });
        }
        
        setOptions(loadedOptions);
      }
    } catch (e) {
      console.error('Erro ao carregar opções:', e);
    }
  };

  const handlePurchase = async () => {
    if (!selectedOption) return;
    
    setLoading(true);
    try {
      const res = await api.post('/listing/boost', {
        listing_id: listingId,
        type: selectedOption.type
      });

      if (res.data?.success && res.data?.checkout_url) {
        window.location.href = res.data.checkout_url;
      } else if (res.data?.success) {
        Swal.fire({
          title: '<span class="font-black italic text-green-600">SUCESSO!</span>',
          text: 'Anúncio impulsionado com sucesso!',
          icon: 'success',
          confirmButtonColor: '#22c55e',
          customClass: {
            popup: 'rounded-[2.5rem] p-8 dark:bg-slate-800',
            confirmButton: 'rounded-xl font-black uppercase text-xs px-6 py-3'
          }
        });
        onSuccess();
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Não foi possível processar.';
      Swal.fire({
        title: '<span class="font-black italic text-red-600">ERRO!</span>',
        text: message,
        icon: 'error',
        confirmButtonColor: '#ef4444',
        customClass: {
          popup: 'rounded-[2.5rem] p-8 dark:bg-slate-800',
          confirmButton: 'rounded-xl font-black uppercase text-xs px-6 py-3'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-gradient-to-r from-amber-600 to-amber-700">
          <div>
            <h3 className="text-xl font-black uppercase italic text-white">Impulsionar Anúncio</h3>
            <p className="text-[10px] font-bold text-amber-200 uppercase">Escolha como impulsionar</p>
          </div>
          <button onClick={onClose} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {options.map((option) => (
              <div 
                key={option.type}
                onClick={() => setSelectedOption(option)}
                className={`p-4 rounded-2xl border-3 cursor-pointer transition-all relative ${
                  selectedOption?.type === option.type 
                    ? `border-amber-500 ${option.bgColor}` 
                    : 'border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
                }`}
              >
                {selectedOption?.type === option.type && (
                  <div className={`absolute top-3 right-3 ${option.color} bg-white dark:bg-slate-800 rounded-full p-1 shadow-lg`}>
                    <Check size={14} />
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <div className={`${option.bgColor} p-3 rounded-xl ${option.color}`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white text-sm">{option.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{option.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900 dark:text-white">R$ {option.price.toFixed(2).replace('.', ',')}</p>
                        <p className="text-[10px] text-slate-400">/{option.duration} dias</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 flex items-start gap-2 border border-blue-100 dark:border-blue-800 mt-4">
            <AlertCircle size={16} className="text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-600 dark:text-blue-300">
              Pagamento via Mercado Pago. Escolha a forma no checkout.
            </p>
          </div>

          <button 
            disabled={!selectedOption || loading}
            onClick={handlePurchase}
            className="w-full mt-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-4 rounded-2xl font-bold uppercase tracking-wide hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>Continuar para Pagamento</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}