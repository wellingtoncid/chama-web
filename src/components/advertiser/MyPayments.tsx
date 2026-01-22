import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

const MyPayments = () => {
  const [data, setData] = useState({ transactions: [], ads: [], featured_freights: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/my-services') // Rota que aponta para MembershipController
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status) => {
    const styles = {
      completed: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      rejected: "bg-red-100 text-red-700"
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100'}`}>{status.toUpperCase()}</span>;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <CreditCard className="text-blue-600" /> Meus Serviços e Pagamentos
      </h1>

      {/* 1. Cards de Serviços Ativos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {data.featured_freights.map(f => (
          <div key={f.id} className="bg-white border-l-4 border-blue-500 p-4 shadow-sm rounded-r-lg flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 uppercase font-bold">Destaque de Frete</p>
              <h3 className="font-semibold text-lg">{f.product}</h3>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Clock size={14} /> Expira em {f.days_left} dias
              </p>
            </div>
            {f.days_left <= 3 && (
              <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition flex items-center gap-2">
                <RefreshCw size={16} /> Renovar
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 2. Tabela de Histórico Financeiro */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="font-bold text-gray-700">Histórico de Transações</h2>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm italic">
              <th className="p-4">Data</th>
              <th className="p-4">Plano / Item</th>
              <th className="p-4">Valor</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.transactions.map(t => (
              <tr key={t.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-4 text-sm">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                <td className="p-4 font-medium">{t.plan_name}</td>
                <td className="p-4 font-bold text-blue-600">R$ {t.amount}</td>
                <td className="p-4">{getStatusBadge(t.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyPayments;