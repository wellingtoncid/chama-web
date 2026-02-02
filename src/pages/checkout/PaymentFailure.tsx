import { Link } from 'react-router-dom';
import { XCircleIcon } from '@heroicons/react/24/outline';

export default function PaymentFailure() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md">
        <XCircleIcon className="h-20 w-20 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800">Ops! Algo deu errado.</h1>
        <p className="text-gray-600 mt-4">
          Não conseguimos processar o seu pagamento. Pode ter sido um problema com o cartão ou saldo insuficiente.
        </p>
        <div className="mt-8 space-y-3">
          <button 
            onClick={() => window.history.back()} 
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Tentar Novamente
          </button>
          <Link to="/dashboard" className="block text-gray-500 hover:text-gray-800 text-sm">
            Voltar ao painel
          </Link>
        </div>
      </div>
    </div>
  );
}