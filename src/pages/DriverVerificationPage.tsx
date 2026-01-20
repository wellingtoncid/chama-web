import React, { useState } from 'react';
import { CheckBadgeIcon, ShieldCheckIcon, TruckIcon, StarIcon } from '@heroicons/react/24/solid';
import {api} from '../api/api';

const DriverVerificationPage = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFreeActivation = async () => {
    setLoading(true);
    try {
      // Chamamos um endpoint específico para ativação gratuita (Beta)
      await api.post('?endpoint=activate-free-verification');
      setSuccess(true);
    } catch (error) {
      alert("Erro ao ativar verificação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center p-10 bg-white rounded-xl shadow-lg max-w-lg mx-auto mt-20">
        <CheckBadgeIcon className="h-20 w-20 text-blue-600 mx-auto" />
        <h2 className="text-2xl font-bold mt-4">Solicitação Enviada!</h2>
        <p className="text-gray-600 mt-2">Sua conta entrará em análise e o selo aparecerá em breve.</p>
        <button onClick={() => window.location.href = '/perfil'} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-full">Ir para meu Perfil</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900">Seja um Motorista <span className="text-blue-600 text-4xl">Verificado</span></h1>
        <p className="text-lg text-gray-600 mt-2">Destaque-se na multidão e conquiste mais fretes com credibilidade.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <BenefitCard icon={<ShieldCheckIcon className="h-8 w-8 text-blue-600"/>} title="Selo de Confiança" desc="Um selo azul em seu perfil e em todos os seus lances." />
        <BenefitCard icon={<TruckIcon className="h-8 w-8 text-blue-600"/>} title="Prioridade na Lista" desc="Seu perfil aparece antes de motoristas não verificados." />
        <BenefitCard icon={<StarIcon className="h-8 w-8 text-blue-600"/>} title="Mais Cliques" desc="Motoristas verificados recebem até 3x mais contatos." />
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold mb-2">Promoção de Lançamento</h3>
        <p className="text-gray-600 mb-6">A verificação está **GRATUITA** por tempo limitado para os primeiros motoristas.</p>
        <button 
          onClick={handleFreeActivation}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-full text-xl transition-transform hover:scale-105 shadow-xl disabled:bg-gray-400"
        >
          {loading ? 'Processando...' : 'QUERO MEU SELO AGORA'}
        </button>
      </div>
    </div>
  );
};

const BenefitCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
    <div className="flex justify-center mb-4">{icon}</div>
    <h4 className="font-bold text-lg mb-2">{title}</h4>
    <p className="text-sm text-gray-500">{desc}</p>
  </div>
);

export default DriverVerificationPage;