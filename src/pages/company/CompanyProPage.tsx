import { useState, useEffect } from 'react';
import { api } from '@/api/api';
import { 
  Shield, ArrowLeft, Check, X, Loader2, 
  Building2, Search, AlertCircle, User,
  FileText, Clock, CheckCircle, XCircle
} from 'lucide-react';
import Swal from 'sweetalert2';

interface CnpjData {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  situacao: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  telefone: string;
  email: string;
  data_abertura: string;
}

interface VerificationStatus {
  is_verified: boolean;
  has_pending: boolean;
  has_contracted: boolean;
  verification: {
    id: number;
    cnpj: string;
    razao_social: string;
    nome_fantasia: string;
    situacao: string;
    status: string;
    rejection_reason: string | null;
    created_at: string;
    verified_at: string | null;
  } | null;
}

export default function CompanyProPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchingCnpj, setSearchingCnpj] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [cnpjInput, setCnpjInput] = useState('');
  const [cnpjData, setCnpjData] = useState<CnpjData | null>(null);
  const [cnpjError, setCnpjError] = useState('');
  const [verificationPrice, setVerificationPrice] = useState<number>(0);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      // Buscar status da verificação
      const res = await api.get('/company/verification/status');
      if (res.data?.success) {
        setVerificationStatus(res.data.data);
        if (res.data.data.verification) {
          setCnpjData(res.data.data.verification);
          setCnpjInput(res.data.data.verification.cnpj);
        }
      }
      
      // Buscar preço da verificação de identidade
      const priceRes = await api.get('/pricing/rules');
      if (priceRes.data?.success) {
        const rules = priceRes.data.data || [];
        const idVerification = rules.find((r: any) => 
          r.module_key === 'company_pro' && r.feature_key === 'identity_verification'
        );
        if (idVerification) {
          setVerificationPrice(Number(idVerification.price_per_use) || 0);
        }
      }
    } catch (e) {
      console.error('Erro ao carregar status:', e);
    } finally {
      setLoading(false);
    }
  };

  const formatCnpj = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCnpj(e.target.value);
    setCnpjInput(formatted);
    setCnpjError('');
    setCnpjData(null);
  };

  const searchCnpj = async () => {
    const cnpjDigits = cnpjInput.replace(/\D/g, '');
    
    if (cnpjDigits.length !== 14) {
      setCnpjError('CNPJ deve conter 14 dígitos');
      return;
    }

    try {
      setSearchingCnpj(true);
      setCnpjError('');
      
      const res = await api.post('/company/verification/verify-cnpj', { cnpj: cnpjDigits });
      
      if (res.data?.success) {
        setCnpjData(res.data.data);
      } else {
        setCnpjError(res.data?.message || 'CNPJ não encontrado');
      }
    } catch (e: any) {
      setCnpjError(e.response?.data?.message || 'Erro ao consultar CNPJ');
    } finally {
      setSearchingCnpj(false);
    }
  };

  const handleSubmit = async () => {
    if (!cnpjData) {
      setCnpjError('Consulte um CNPJ primeiro');
      return;
    }

    if (cnpjData.situacao && cnpjData.situacao.toLowerCase() !== 'ativa') {
      Swal.fire({
        icon: 'warning',
        title: 'CNPJ Inativo',
        text: 'Apenas empresas com CNPJ ativo podem ser verificadas.'
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Primeiro, contratar o serviço
      const purchaseRes = await api.post('/company/verification/purchase');
      
      if (!purchaseRes.data?.success) {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: purchaseRes.data?.message || 'Não foi possível contratar o serviço'
        });
        return;
      }

      // Depois, submeter para verificação
      const res = await api.post('/company/verification/submit', {
        cnpj: cnpjData.cnpj,
        razao_social: cnpjData.razao_social,
        nome_fantasia: cnpjData.nome_fantasia || cnpjData.razao_social,
        situacao: cnpjData.situacao
      });

      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Verificação Submetida!',
          text: 'Sua verificação foi enviada para análise. Aguarde a aprovação da equipe Chama Frete.',
          confirmButtonText: 'OK'
        });
        loadStatus();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: res.data?.message || 'Não foi possível submeter verificação'
        });
      }
    } catch (e: any) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: e.response?.data?.message || 'Erro ao submeter verificação'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center animate-pulse">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2rem] p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase italic">Company Pro</h2>
              <p className="text-slate-300 text-sm font-medium">
                Recursos exclusivos para empresas
              </p>
            </div>
          </div>

          {verificationStatus?.is_verified && (
            <span className="ml-auto text-[10px] font-black px-3 py-1.5 rounded-lg uppercase bg-emerald-500/20 text-emerald-300 flex items-center gap-1">
              <CheckCircle size={14} /> Verificado
            </span>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {verificationStatus?.is_verified && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle size={24} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-800 text-lg">Identidade Confirmada!</h3>
              <p className="text-emerald-600 text-sm">
                Sua empresa está verificada. O badge de Identidade Confirmada aparece no seu perfil.
              </p>
            </div>
          </div>
          {verificationStatus.verification && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-emerald-100">
              <p className="text-sm text-slate-600">
                <strong>CNPJ:</strong> {verificationStatus.verification.cnpj}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Razão Social:</strong> {verificationStatus.verification.razao_social}
              </p>
              {verificationStatus.verification.nome_fantasia && (
                <p className="text-sm text-slate-600">
                  <strong>Nome Fantasia:</strong> {verificationStatus.verification.nome_fantasia}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {verificationStatus?.has_pending && !verificationStatus?.is_verified && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-blue-800 text-lg">Verificação em Análise</h3>
              <p className="text-blue-600 text-sm">
                Sua verificação está sendo analisada pela equipe Chama Frete. Aguarde.
              </p>
            </div>
          </div>
          {verificationStatus.verification && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-blue-100">
              <p className="text-sm text-slate-600">
                <strong>CNPJ:</strong> {verificationStatus.verification.cnpj}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Enviado em:</strong> {new Date(verificationStatus.verification.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Verificação Rejeitada */}
      {!verificationStatus?.is_verified && !verificationStatus?.has_pending && verificationStatus?.verification && verificationStatus.verification.status === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle size={24} className="text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-800 text-lg">Verificação Recusada</h3>
              <p className="text-red-600 text-sm">
                Sua verificação foi recusada. Corrija os dados e tente novamente.
              </p>
              {verificationStatus.verification.rejection_reason && (
                <p className="text-red-500 text-xs mt-1">
                  <strong>Motivo:</strong> {verificationStatus.verification.rejection_reason}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verification Form */}
      {!verificationStatus?.is_verified && !verificationStatus?.has_pending && (
        <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-black uppercase italic text-lg">Verificação de Identidade</h3>
                <p className="text-orange-100 text-xs">Confirme a identidade da sua empresa</p>
              </div>
            </div>
          </div>
          
          {/* Preço da Verificação */}
          {verificationPrice > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-800">Valor da Verificação</p>
                <p className="text-[10px] text-emerald-600">Válido por 1 ano</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-600">
                  R$ {verificationPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          )}

          <div className="p-6 space-y-6">
            {/* CNPJ Input */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                CNPJ da Empresa
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={cnpjInput}
                    onChange={handleCnpjChange}
                    placeholder="00.000.000/0000-00"
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-colors ${
                      cnpjError 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-slate-200 focus:border-orange-500'
                    } outline-none text-lg font-mono`}
                    maxLength={18}
                  />
                  <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <button
                  onClick={searchCnpj}
                  disabled={searchingCnpj || cnpjInput.replace(/\D/g, '').length !== 14}
                  className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {searchingCnpj ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    'Consultar'
                  )}
                </button>
              </div>
              {cnpjError && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} /> {cnpjError}
                </p>
              )}
            </div>

            {/* CNPJ Data Preview */}
            {cnpjData && (
              <div className="bg-slate-50 rounded-2xl p-6 space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    cnpjData.situacao?.toLowerCase() === 'ativa' ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    {cnpjData.situacao?.toLowerCase() === 'ativa' ? (
                      <CheckCircle size={20} className="text-emerald-600" />
                    ) : (
                      <XCircle size={20} className="text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{cnpjData.razao_social}</p>
                    <p className="text-sm text-slate-500">
                      {cnpjData.nome_fantasia || 'Nome fantasia não disponível'}
                    </p>
                  </div>
                  <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${
                    cnpjData.situacao?.toLowerCase() === 'ativa' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {cnpjData.situacao || 'Desconhecido'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Endereço</p>
                    <p className="text-sm text-slate-700">
                      {cnpjData.logradouro}{cnpjData.numero && `, ${cnpjData.numero}`}
                      {cnpjData.complemento && ` - ${cnpjData.complemento}`}
                    </p>
                    <p className="text-sm text-slate-700">
                      {cnpjData.bairro}, {cnpjData.cidade} - {cnpjData.estado}
                    </p>
                    <p className="text-sm text-slate-700">{cnpjData.cep}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Contato</p>
                    {cnpjData.telefone && (
                      <p className="text-sm text-slate-700">{cnpjData.telefone}</p>
                    )}
                    {cnpjData.email && (
                      <p className="text-sm text-slate-700">{cnpjData.email}</p>
                    )}
                    {cnpjData.data_abertura && (
                      <p className="text-sm text-slate-700">
                        Abertura: {cnpjData.data_abertura}
                      </p>
                    )}
                  </div>
                </div>

                {cnpjData.situacao?.toLowerCase() !== 'ativa' && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-700">
                      <strong>Importante:</strong> Apenas empresas com CNPJ ativo podem ser verificadas.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting || cnpjData.situacao?.toLowerCase() !== 'ativa'}
                  className="w-full py-4 rounded-xl font-black uppercase text-sm transition-all flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Solicitar Verificação
                    </>
                  )}
                </button>
              </div>
            )}

            {!cnpjData && (
              <div className="text-center py-8 text-slate-500">
                <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-sm">Digite o CNPJ e clique em "Consultar" para buscar os dados da empresa</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-black text-amber-800 uppercase italic">
            Como funciona
          </p>
          <ul className="text-[10px] text-amber-600 mt-1 space-y-1">
            <li>1. Digite o CNPJ da sua empresa</li>
            <li>2. Verifique se os dados estão corretos</li>
            <li>3. Solicite a verificação</li>
            <li>4. Nossa equipe analisa e aprova em até 24h</li>
            <li>5. Após aprovado, seu perfil exibe o badge de Identidade Confirmada</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
