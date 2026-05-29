import { useState, useCallback } from 'react';
import { ArrowLeft, Loader2, ShieldCheck, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { api } from '../../../api/api';
import { useAuth } from '../../../context/AuthContext';
import DashboardShell from '../../../components/layout/DashboardShell';
import { Button } from '../../../components/ui/Button';
import DocumentUploader from '../../../components/driver/DocumentUploader';

export default function DriverVerificationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [allUploaded, setAllUploaded] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleComplete = useCallback((uploaded: boolean) => {
    setAllUploaded(uploaded);
  }, []);

  const doPurchase = async (paymentMethod: string) => {
    setProcessing(true);
    try {
      const res = await api.post('/driver/verification/purchase', { payment_method: paymentMethod });
      if (res.data?.success) {
        if (res.data.payment_method === 'mercadopago' && res.data.url) {
          window.location.href = res.data.url;
          return;
        }
        await Swal.fire({
          icon: 'success',
          title: 'Solicitação Enviada!',
          text: 'Sua verificação está aguardando análise da equipe Chama Frete.',
          timer: 3000,
          showConfirmButton: false,
        });
        navigate('/dashboard/planos/driver');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: res.data?.message || 'Erro ao processar solicitação',
        });
      }
    } catch (e: any) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: e.response?.data?.message || e.message || 'Erro ao processar solicitação',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async () => {
    const amount = 19.90;
    let balance = 0;
    try {
      const profileRes = await api.get('get-my-profile');
      balance = Number(profileRes.data?.user?.wallet_balance ?? profileRes.data?.wallet_balance ?? 0);
    } catch { /* assume 0 */ }

    if (balance <= 0) {
      doPurchase('mercadopago');
      return;
    }

    const { isConfirmed, value: method } = await Swal.fire({
      title: 'Forma de Pagamento',
      html: `
        <div class="text-left space-y-3">
          <label class="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-all" style="display:flex">
            <input type="radio" name="payment" value="wallet" class="w-5 h-5 text-emerald-600" checked>
            <div class="flex-1">
              <p class="font-bold text-slate-900 text-sm">Usar Saldo da Carteira</p>
              <p class="text-xs text-slate-500">Saldo disponível: R$ ${balance.toFixed(2).replace('.', ',')}</p>
            </div>
            <span class="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">Saldo suficiente</span>
          </label>
          <label class="flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-all" style="display:flex">
            <input type="radio" name="payment" value="mercadopago" class="w-5 h-5 text-blue-600">
            <div class="flex-1">
              <p class="font-bold text-slate-900 text-sm">Pagar com Mercado Pago</p>
              <p class="text-xs text-slate-500">Cartão, PIX ou boleto</p>
            </div>
          </label>
        </div>
      `,
      preConfirm: () => {
        const selected = document.querySelector('input[name="payment"]:checked') as HTMLInputElement;
        return selected?.value || 'wallet';
      },
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f97316',
    });

    if (!isConfirmed) return;
    doPurchase(method);
  };

  return (
    <DashboardShell
      title="Verificação de Identidade"
      description="Envie seus documentos para ser um motorista verificado"
      actions={
        <Button variant="ghost" onClick={() => navigate('/dashboard/planos/driver')}>
          <ArrowLeft size={16} /> Voltar
        </Button>
      }
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <div className="text-white">
              <h2 className="font-black text-lg">Documentos necessários</h2>
              <p className="text-sm text-white/80">Envie fotos nítidas e legíveis dos documentos abaixo</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {user && (
            <DocumentUploader
              userId={Number(user.id)}
              onComplete={handleComplete}
            />
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-black text-sm text-slate-900 dark:text-slate-100">
              {allUploaded
                ? 'Todos os documentos enviados!'
                : 'Envie todos os documentos obrigatórios'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {allUploaded
                ? 'Clique em Solicitar Verificação para enviar para análise'
                : 'Você precisa enviar os 5 documentos para solicitar a verificação'}
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!allUploaded || processing}
            className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
              allUploaded && !processing
                ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            {processing ? (
              <><Loader2 size={16} className="animate-spin" /> Processando...</>
            ) : (
              <><Check size={16} /> Solicitar Verificação</>
            )}
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
