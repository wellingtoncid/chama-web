import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { Loader2, Shield, ShieldCheck, X, Check, Clock, FileText, ExternalLink, Eye } from 'lucide-react';
import Swal from 'sweetalert2';

interface DriverDocument {
  document_type: string;
  file_path: string;
  status?: string;
  rejection_reason?: string;
  created_at?: string;
}

interface DriverVerification {
  transaction_id: number;
  user_id: number;
  status: string;
  amount: number;
  requested_at: string;
  gateway_id: string | null;
  user_name: string;
  user_email: string;
  user_whatsapp: string;
  user_role: string;
  documents: DriverDocument[];
}

interface TabCount {
  awaiting_review: number;
  approved: number;
  rejected: number;
}

const REJECTION_TEMPLATES = [
  'CNH ilegível',
  'CNH vencida',
  'CRLV ilegível',
  'CRLV vencido',
  'Foto não confere com documento',
  'Documento incompleto',
  'Nome diferente do cadastro',
  'Outros'
];

const DOCUMENT_LABELS: Record<string, string> = {
  'cnh_front': 'CNH (Frente)',
  'cnh_back': 'CNH (Verso)',
  'crlv': 'CRLV',
  'rg': 'Documento de Identidade',
  'address_proof': 'Comprovante de Endereço'
};

// API_BASE removed import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const STATIC_BASE = import.meta.env.VITE_STATIC_URL || 'http://127.0.0.1:8000';

type TabType = 'awaiting_review' | 'approved' | 'rejected';

const TABS: { key: TabType; label: string; color: string; bgColor: string; borderColor: string }[] = [
  { key: 'awaiting_review', label: 'Aguardando', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { key: 'approved', label: 'Aprovados', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  { key: 'rejected', label: 'Rejeitados', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
];

export default function DriverVerificationsManager() {
  const [verifications, setVerifications] = useState<DriverVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<{ url: string; label: string } | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<TabType>('awaiting_review');
  const [counts, setCounts] = useState<TabCount>({ awaiting_review: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    loadCounts();
    loadVerifications();
  }, [activeTab]);

  const loadCounts = async () => {
    try {
      const countsData: TabCount = { awaiting_review: 0, approved: 0, rejected: 0 };
      
      for (const tab of TABS) {
        const res = await api.get('/admin/driver-verifications', {
          params: { status: tab.key, limit: 1 }
        });
        if (res.data?.success) {
          countsData[tab.key] = res.data.count || res.data.data?.length || 0;
        }
      }
      
      setCounts(countsData);
    } catch (e) {
      console.error("Erro ao carregar contadores:", e);
    }
  };

  const loadVerifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/driver-verifications', {
        params: { status: activeTab, limit: 50 }
      });
      if (res.data?.success) {
        setVerifications(res.data.data || []);
      }
    } catch (e) {
      console.error("Erro ao carregar verificações:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleCard = (transactionId: number) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(transactionId)) {
        next.delete(transactionId);
      } else {
        next.add(transactionId);
      }
      return next;
    });
  };

  const getDocUrl = (path: string) => {
    return `${STATIC_BASE}${path}`;
  };

  const handleApprove = async (verification: DriverVerification) => {
    const result = await Swal.fire({
      title: 'Aprovar Verificação?',
      text: `Deseja aprovar a verificação do motorista ${verification.user_name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sim, Aprovar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      setProcessingId(verification.transaction_id);
      const res = await api.post('/admin/driver-verification/approve', {
        transaction_id: verification.transaction_id
      });

      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Aprovado!',
          text: `Verificação do motorista ${verification.user_name} foi aprovada. Badge ativado até ${new Date(res.data.expires_at).toLocaleDateString('pt-BR')}`,
          timer: 3000,
          showConfirmButton: false
        });
        loadCounts();
        loadVerifications();
      }
    } catch (e: any) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: e.response?.data?.message || 'Erro ao aprovar verificação'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (verification: DriverVerification) => {
    const { value: formValues } = await Swal.fire({
      title: 'Rejeitar Verificação',
      html: `
        <div class="text-left">
          <p class="mb-3 text-sm text-slate-600">Selecione o motivo da rejeição para <strong>${verification.user_name}</strong>:</p>
          
          <select id="swal-template" class="swal2-select mb-3 w-full p-2 border border-slate-300 rounded-lg">
            <option value="">Selecione um motivo</option>
            ${REJECTION_TEMPLATES.map(t => `<option value="${t}">${t}</option>`).join('')}
          </select>
          
          <textarea id="swal-reason" class="swal2-textarea w-full p-2 border border-slate-300 rounded-lg" placeholder="Detalhes adicionais (opcional)..." rows="3"></textarea>
          
          <div class="mt-4 p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
            <strong>Nota:</strong> O valor de R$ ${Number(verification.amount).toFixed(2).replace('.', ',')} será devolvido para a carteira do motorista.
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Confirmar Rejeição',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const template = (document.getElementById('swal-template') as HTMLSelectElement)?.value;
        const reason = (document.getElementById('swal-reason') as HTMLTextAreaElement)?.value;
        
        if (!template) {
          Swal.showValidationMessage('Por favor, selecione um motivo');
          return false;
        }
        
        return { template, reason };
      }
    });

    if (!formValues || !formValues.template) return;

    try {
      setProcessingId(verification.transaction_id);
      const res = await api.post('/admin/driver-verification/reject', {
        transaction_id: verification.transaction_id,
        reason_template: formValues.template,
        reason: formValues.reason || ''
      });

      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Rejeitado!',
          text: `Valor de R$ ${Number(res.data.amount_refunded).toFixed(2).replace('.', ',')} devolvido para a carteira.`
        });
        loadCounts();
        loadVerifications();
      }
    } catch (e: any) {
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: e.response?.data?.message || 'Erro ao rejeitar verificação'
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modal de Visualização de Documento */}
      {selectedDoc && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/90 flex items-center justify-center p-4"
          onClick={() => setSelectedDoc(null)}
        >
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 bg-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-700">{selectedDoc.label}</h3>
              <div className="flex gap-2">
                <a 
                  href={selectedDoc.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white rounded-lg hover:bg-slate-50 text-slate-600"
                >
                  <ExternalLink size={18} />
                </a>
                <button 
                  onClick={() => setSelectedDoc(null)}
                  className="p-2 bg-white rounded-lg hover:bg-slate-50 text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-100px)]">
              <img 
                src={selectedDoc.url} 
                alt={selectedDoc.label}
                className="max-w-full mx-auto"
              />
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2rem] p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-orange-500 p-3 rounded-xl">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase italic">Verificações de Drivers</h1>
            <p className="text-slate-300 text-sm">Aprovar ou rejeitar verificações de documentos de motoristas</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              flex-1 py-3 px-4 rounded-xl font-bold text-sm uppercase transition-all flex items-center justify-center gap-2
              ${activeTab === tab.key 
                ? `${tab.bgColor} ${tab.color} border-2 ${tab.borderColor}` 
                : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}
            `}
          >
            {tab.key === 'awaiting_review' && <Clock size={16} />}
            {tab.key === 'approved' && <Check size={16} />}
            {tab.key === 'rejected' && <X size={16} />}
            {tab.label}
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-black
              ${activeTab === tab.key ? 'bg-white/50' : 'bg-slate-200 dark:bg-slate-600'}
            `}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Lista de Verificações */}
      {verifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-12 text-center border border-slate-100 dark:border-slate-800">
          <Shield size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-lg font-black uppercase italic text-slate-400 mb-2">
            {activeTab === 'awaiting_review' ? 'Nenhuma verificação pendente' : 
             activeTab === 'approved' ? 'Nenhum driver aprovado ainda' : 
             'Nenhuma verificação rejeitada'}
          </h3>
          <p className="text-sm text-slate-400">
            {activeTab === 'awaiting_review' ? 'Todos os drivers verificados foram processados.' : 
             activeTab === 'approved' ? 'Aprove as verificações pendentes.' : 
             'Não há verificações rejeitadas.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {verifications.map((v) => (
            <div key={v.transaction_id} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 overflow-hidden">
              {/* Header do Card */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                    <ShieldCheck className="text-orange-500" size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-white">{v.user_name}</h3>
                    <p className="text-[10px] text-slate-400">ID: {v.user_id}</p>
                  </div>
                </div>
                <span className={`
                  px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1
                  ${activeTab === 'awaiting_review' ? 'bg-amber-100 text-amber-600' : ''}
                  ${activeTab === 'approved' ? 'bg-emerald-100 text-emerald-600' : ''}
                  ${activeTab === 'rejected' ? 'bg-red-100 text-red-600' : ''}
                `}>
                  {activeTab === 'awaiting_review' && <Clock size={10} />}
                  {activeTab === 'approved' && <Check size={10} />}
                  {activeTab === 'rejected' && <X size={10} />}
                  {activeTab === 'awaiting_review' ? 'Pendente' : activeTab === 'approved' ? 'Aprovado' : 'Rejeitado'}
                </span>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400 w-20">Email:</span>
                  <span className="text-slate-700 dark:text-slate-300">{v.user_email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400 w-20">WhatsApp:</span>
                  <span className="text-slate-700 dark:text-slate-300">{v.user_whatsapp}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400 w-20">Solicitado:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {new Date(v.requested_at).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400 w-20">Valor:</span>
                  <span className="text-emerald-600 font-bold">
                    R$ {Math.abs(Number(v.amount)).toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {/* Documentos Enviados */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Documentos ({v.documents?.length || 0})
                    </p>
                    <button
                      onClick={() => toggleCard(v.transaction_id)}
                      className="text-xs text-orange-500 hover:text-orange-600 font-bold flex items-center gap-1"
                    >
                      <Eye size={12} />
                      {expandedCards.has(v.transaction_id) ? 'Ocultar' : 'Ver documentos'}
                    </button>
                  </div>

                  {expandedCards.has(v.transaction_id) && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {v.documents && v.documents.length > 0 ? (
                        v.documents.map((doc, idx) => {
                          const isImage = doc.file_path.match(/\.(jpg|jpeg|png)$/i);
                          const label = DOCUMENT_LABELS[doc.document_type] || doc.document_type;
                          const isRejected = doc.status === 'rejected';
                          
                          return (
                            <div 
                              key={idx}
                              className={`relative group cursor-pointer rounded-xl overflow-hidden border ${
                                isRejected ? 'border-red-300' : 'border-slate-200'
                              }`}
                              onClick={() => setSelectedDoc({ url: getDocUrl(doc.file_path), label })}
                            >
                              {isImage ? (
                                <img 
                                  src={getDocUrl(doc.file_path)} 
                                  alt={label}
                                  className="w-full h-24 object-cover"
                                />
                              ) : (
                                <div className="w-full h-24 bg-slate-100 flex flex-col items-center justify-center">
                                  <FileText size={24} className="text-slate-400" />
                                  <span className="text-[8px] text-slate-400 mt-1">PDF</span>
                                </div>
                              )}
                              
                              {/* Overlay */}
                              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="text-center">
                                  <Eye size={20} className="text-white mx-auto" />
                                  <span className="text-[8px] text-white mt-1 block">Ver</span>
                                </div>
                              </div>

                              {/* Badge do tipo e status */}
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/80 to-transparent p-1.5">
                                <span className={`text-[8px] text-white font-bold truncate block ${isRejected ? 'text-red-300' : ''}`}>
                                  {isRejected && '❌ '}{label}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-full p-6 bg-slate-50 rounded-xl text-center">
                          <FileText size={24} className="mx-auto text-slate-300 mb-2" />
                          <p className="text-xs text-slate-400">Nenhum documento</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resumo rápido */}
                  {!expandedCards.has(v.transaction_id) && v.documents && v.documents.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {v.documents.map((doc, idx) => {
                        const isRejected = doc.status === 'rejected';
                        return (
                          <span 
                            key={idx}
                            className={`px-2 py-1 rounded text-[9px] flex items-center gap-1 ${
                              isRejected 
                                ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                            }`}
                          >
                            {DOCUMENT_LABELS[doc.document_type] || doc.document_type}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Ações - apenas para aguardando */}
              {activeTab === 'awaiting_review' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 flex gap-3">
                  <button
                    onClick={() => handleApprove(v)}
                    disabled={processingId === v.transaction_id}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {processingId === v.transaction_id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Check size={14} /> Aprovar
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(v)}
                    disabled={processingId === v.transaction_id}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {processingId === v.transaction_id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <X size={14} /> Rejeitar
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
