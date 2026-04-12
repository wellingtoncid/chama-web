import React, { useState } from 'react';

type Props = {
  planId: number;
  userId: number;
  billingCycle?: string;
  onSuccess?: (data: any) => void;
  children?: React.ReactNode;
};

// MVP: simples botao de iniciar checkout com MercadoPago
export default function MercadoPagoCheckout({ planId, userId, billingCycle = 'monthly', onSuccess, children }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const resp = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId, user_id: userId, billing_cycle: billingCycle })
      });
      const data = await resp.json();
      if (data?.success && data.url) {
        // Redireciona para o checkout do MercadoPago
        window.location.href = data.url;
        if (onSuccess) onSuccess(data);
      } else {
        setError(data?.message ?? 'Erro ao iniciar pagamento');
      }
    } catch (e) {
      setError('Erro de rede ao iniciar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={startCheckout} disabled={loading} aria-label="Pagar com MercadoPago" className="px-4 py-2 rounded-md bg-[#1f4ead] text-white font-bold hover:bg-[#163a82] disabled:opacity-50">
        {loading ? 'Preparando pagamento...' : 'Pagar com MercadoPago'}
      </button>
      {error && <div role="alert" className="mt-2 text-red-600 text-sm">{error}</div>}
      {children}
    </div>
  );
}
