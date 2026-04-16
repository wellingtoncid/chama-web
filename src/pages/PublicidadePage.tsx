import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, Loader2, ExternalLink
} from 'lucide-react';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import { api } from '../api/api';
import Swal from 'sweetalert2';
import { useAdPositions, AD_COLOR_MAP } from '../hooks/useAdPositions';

export default function PublicidadePage() {
  const navigate = useNavigate();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const { positions, loading, getIcon, getColor } = useAdPositions();

  const user = JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}');
  const isLoggedIn = !!user?.id;

  const handlePurchase = async (positionKey: string) => {
    if (!isLoggedIn) {
      navigate('/cadastro?redirect=/publicidade');
      return;
    }

    setPurchasing(positionKey);
    try {
      const res = await api.post('/module/subscribe-monthly', {
        module_key: 'advertiser',
        feature_key: positionKey,
        payment_method: 'mercadopago'
      });

      if (res.data?.success && res.data?.url) {
        window.location.href = res.data.url;
      } else {
        Swal.fire({
          title: 'Erro',
          text: res.data?.message || 'Não foi possível processar.',
          icon: 'error'
        });
      }
    } catch (error: any) {
      Swal.fire({
        title: 'Erro',
        text: error.response?.data?.message || 'Erro ao processar pagamento.',
        icon: 'error'
      });
    } finally {
      setPurchasing(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const formatSize = (size: string | null) => {
    return size ? `${size}px` : '';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-black uppercase italic mb-4">
              Anuncie no Chama Frete
            </h1>
            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              Alcance milhares de transportadores e empresas todos os dias com nossa plataforma de publicidade
            </p>
          </div>
        </div>

        {/* Positions Grid */}
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-8 text-center">
            Posições de Publicidade Disponíveis
          </h2>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-emerald-600" size={40} />
            </div>
          ) : positions.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <p>Nenhuma posição de publicidade disponível no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {positions
                .filter(pos => pos.price_monthly > 0)
                .map((pos) => {
                const Icon = getIcon(pos.icon_key);
                const colorClass = getColor(pos.feature_key);
                const isPurchasing = purchasing === pos.feature_key;
                
                return (
                  <div 
                    key={pos.feature_key}
                    className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all flex flex-col"
                  >
                    {/* Header with gradient */}
                    <div className={`bg-gradient-to-r ${colorClass} p-6 text-white`}>
                      <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-3 rounded-xl">
                          <Icon size={24} />
                        </div>
                        <div>
                          <h3 className="font-black uppercase italic text-lg">{pos.feature_name}</h3>
                          <p className="text-xs text-white/80">Posição de anúncio</p>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                          {pos.description || 'Descrição não disponível'}
                        </p>
                        
                        {/* Size and Duration Info */}
                        <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-3 mb-4">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Tamanho</span>
                              <p className="font-bold text-slate-700 dark:text-slate-200">
                                {pos.ad_size ? `${pos.ad_size}px` : 'Variável'}
                              </p>
                            </div>
                            <div>
                              <span className="text-slate-500 dark:text-slate-400">Veiculação</span>
                              <p className="font-bold text-slate-700 dark:text-slate-200">{pos.duration_days} dias</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-end justify-between mb-4">
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Preço mensal</p>
                            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                              {pos.price_monthly > 0 ? formatPrice(pos.price_monthly) : 'Grátis'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handlePurchase(pos.feature_key)}
                        disabled={isPurchasing}
                        className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold uppercase text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isPurchasing ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Processando...
                          </>
                        ) : isLoggedIn ? (
                          'Contratar Agora'
                        ) : (
                          'Entrar para Contratar'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Info Box */}
          <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-8 border border-blue-100 dark:border-blue-800">
            <h3 className="font-bold text-blue-800 dark:text-blue-400 text-lg mb-4 flex items-center gap-2">
              <Check size={20} />
              Como funciona a publicidade?
            </h3>
            <ul className="space-y-3 text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <Check size={16} className="text-blue-500 mt-1" />
                <span>Escolha a posição de anúncio desejada</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-blue-500 mt-1" />
                <span>Faça o pagamento via Mercado Pago</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-blue-500 mt-1" />
                <span>Seu anúncio será ativado automaticamente</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={16} className="text-blue-500 mt-1" />
                <span>Acompanhe o desempenho no painel</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
