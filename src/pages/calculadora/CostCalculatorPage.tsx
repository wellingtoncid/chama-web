import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { CostCalculator } from '@/components/shared/CostCalculator';
import AdCard from '@/components/shared/AdCard';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { Button } from '@/components/ui/Button';
import { Calculator, ArrowRight, TrendingUp } from 'lucide-react';

export default function CostCalculatorPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
      <Header />

      <main className="flex-grow pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 space-y-6 lg:space-y-8">
          {/* HERO */}
          <div className="text-center pt-4 lg:pt-8">
            <div className="inline-flex p-3 rounded-2xl bg-orange-50 text-orange-500 mb-4">
              <Calculator size={28} />
            </div>
            <h1 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight text-balance">
              Calculadora de Custo Operacional
            </h1>
            <p className="text-sm lg:text-base text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto text-balance">
              Simule todos os custos da sua viagem e descubra o preço ideal para não perder dinheiro.
            </p>
          </div>

          {/* AD SPACE */}
          <div className="flex justify-center">
            <AdCard position="freight_list" variant="ecommerce" />
          </div>

          {/* CALCULATOR */}
          <CostCalculator />

          {/* CTA LEAD CAPTURE */}
          {!user && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 lg:p-10 text-white text-center shadow-2xl">
              <div className="inline-flex p-3 rounded-2xl bg-white/10 mb-4">
                <TrendingUp size={28} className="text-orange-400" />
              </div>
              <h2 className="text-xl lg:text-2xl font-black mb-2">Quer encontrar fretes que valem a pena?</h2>
              <p className="text-sm text-slate-300 max-w-lg mx-auto mb-6">
                Cadastre-se grátis e comece a receber cargas compatíveis com seu veículo.
              </p>
              <Button
                onClick={() => navigate('/register?type=driver')}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
              >
                Cadastre-se Grátis
                <ArrowRight size={18} />
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
