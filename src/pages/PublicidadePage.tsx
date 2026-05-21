import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, Megaphone } from 'lucide-react';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import { BusinessModal } from '../components/modals/BusinessModal';
import { useAdPositions } from '../hooks/useAdPositions';

export default function PublicidadePage() {
  const navigate = useNavigate();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);

  const { positions, loading, getIcon, getColor } = useAdPositions();

  const user = JSON.parse(localStorage.getItem('@ChamaFrete:user') || '{}');
  const isLoggedIn = !!user?.id;

  const handlePurchase = () => {
    if (!isLoggedIn) {
      navigate('/register?type=advertiser');
      return;
    }
    setIsBusinessModalOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header />
      <main className="flex-grow pt-32">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-[0.85] mb-8">
              Anuncie no <span className="text-orange-500">Chama Frete</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium italic max-w-2xl mx-auto">
              Alcance milhares de transportadores e empresas todos os dias com nossa plataforma de publicidade
            </p>
          </div>
        </section>

        {/* Positions */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter text-center mb-16">
              Posições <span className="text-orange-500">Disponíveis</span>
            </h2>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-orange-500" size={40} />
              </div>
            ) : positions.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                <p>Nenhuma posição de publicidade disponível no momento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {positions
                  .filter(pos => Number(pos.is_public))
                  .map((pos) => {
                  const Icon = getIcon(pos.icon_key);
                  const colorClass = getColor(pos.feature_key);
                  const isPurchasing = purchasing === pos.feature_key;

                  return (
                    <div
                      key={pos.feature_key}
                      className="bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all flex flex-col"
                    >
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

                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                            {pos.description || 'Descrição não disponível'}
                          </p>

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
                          onClick={() => {
                            setPurchasing(pos.feature_key);
                            handlePurchase();
                          }}
                          disabled={isPurchasing}
                          className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold uppercase text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isLoggedIn ? 'Solicitar Proposta' : 'Criar Conta'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Info Box */}
            <div className="mt-12 max-w-4xl mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] p-8 border border-blue-100 dark:border-blue-800">
              <h3 className="font-bold text-blue-800 dark:text-blue-400 text-lg mb-4 flex items-center gap-2">
                <Check size={20} />
                Como funciona a publicidade?
              </h3>
              <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-blue-500 mt-1 shrink-0" />
                  <span>Escolha a posição de anúncio desejada</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-blue-500 mt-1 shrink-0" />
                  <span>Nossa equipe analisa sua solicitação</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-blue-500 mt-1 shrink-0" />
                  <span>Receba uma proposta personalizada</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={16} className="text-blue-500 mt-1 shrink-0" />
                  <span>Acompanhe o desempenho no painel</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <BusinessModal
        isOpen={isBusinessModalOpen}
        onClose={() => { setIsBusinessModalOpen(false); setPurchasing(null); }}
        initialSubject="Publicidade"
      />
    </div>
  );
}
