import { Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function PaymentSuccess() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <CheckCircleIcon className="h-20 w-20 text-green-500 mb-4" />
      <h1 className="text-3xl font-bold">Pagamento Confirmado!</h1>
      <p className="text-gray-600 mt-2">Sua assinatura ou anúncio foi ativado com sucesso.</p>
      <Link to="/dashboard" className="mt-8 bg-blue-600 text-white px-6 py-2 rounded-lg">
        Ir para o Painel
      </Link>
    </div>
  );
}