import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { Loader2, Shield, ShieldCheck, X, Check, Clock, FileText, ExternalLink, Eye, User, Building2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { PageShell, StatsGrid, StatCard, FilterBar } from '@/components/admin';

interface DriverDocument {
  document_type: string;
  file_path: string;
  status?: string;
  rejection_reason?: string;
}

interface Verification {
  type: 'driver' | 'company';
  user_id: number;
  user_name: string;
  user_email: string;
  user_type: string;
  user_whatsapp?: string;
  verification_id: number;
  cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string;
  situacao?: string;
  status: string;
  description: string;
  transaction_amount?: number | string;
  amount?: number | string;
  created_at: string;
  requested_at?: string;
  verified_at?: string;
  reviewed_at?: string;
  reviewed_by_name?: string;
  rejection_reason?: string;
  documents?: DriverDocument[];
}

const REJECTION_TEMPLATES = [
  'CNH ilegível',
  'CNH vencida',
  'CRLV ilegível',
  'CRLV vencido',
  'Foto não confere com documento',
  'Documento incompleto',
  'Nome diferente do cadastro',
  'CNPJ inválido ou inativo',
  'Dados divergentes',
  'Outros'
];

const DOCUMENT_LABELS: Record<string, string> = {
  'cnh_front': 'CNH (Frente)',
  'cnh_back': 'CNH (Verso)',
  'crlv': 'CRLV',
  'rg': 'Documento de Identidade',
  'address_proof': 'Comprovante de Endereço'
};

  const STATIC_BASE = import.meta.env.VITE_STATIC_URL || 'http://127.0.0.1:8000';

type TabType = 'pending' | 'approved' | 'rejected';

const TABS: { key: TabType; label: string; color: string; bgColor: string; borderColor: string }[] = [
  { key: 'pending', label: 'Aguardando', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { key: 'approved', label: 'Aprovados', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  { key: 'rejected', label: 'Rejeitados', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' }
];

const TYPE_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'driver', label: 'Motoristas' },
  { key: 'company', label: 'Empresas' }
];

export default function VerificationsManager() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<{ url: string; label: string } | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [typeFilter, setTypeFilter] = useState<'all' | 'driver' | 'company'>('all');
  const [counts, setCounts] = useState<Record<string, number>>({});

  async function loadCounts() {
    try {
      const countsData: Record<string, number> = { pending: 0, approved: 0, rejected: 0 };
        
      for (const tab of TABS) {
        const res = await api.get('/admin/verifications', {
          params: { status: tab.key, type: 'all', limit: 1 }
        });
        if (res.data?.success) {
          countsData[tab.key] = res.data.data?.total || res.data.data?.verifications?.length || 0;
        }
      }
        
      setCounts(countsData);
    } catch (e) {
      console.error("Erro ao carregar contadores:", e);
    }
  }

  async function loadVerifications() {
    try {
      setLoading(true);
      const res = await api.get('/admin/verifications', {
        params: { status: activeTab, type: typeFilter, limit: 100 }
      });
      if (res.data?.success) {
        setVerifications(res.data.data?.verifications || []);
      }
    } catch (e) {
      console.error("Erro ao carregar verificações:", e);
    } finally {
      setLoading(false);
    }
  }
 
  useEffect(() => {
    loadCounts();
    loadVerifications();
  }, [activeTab, typeFilter]);

  const toggleCard = (id: number) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getDocUrl = (path: string) => {
    return `${STATIC_BASE}${path}`;
  };

  const handleApprove = async (verification: Verification) => {
    const result = await Swal.fire({
      title: 'Aprovar Verificação?',
      text: `Deseja aprovar a verificação de ${verification.type === 'driver' ? 'motorista' : 'empresa'} ${verification.user_name}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sim, Aprovar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      setProcessingId(verification.verification_id);
      const res = await api.post('/admin/verification/approve', {
        id: verification.verification_id,
        type: verification.type
      });

      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Aprovado!',
          text: res.data.message || 'Verificação aprovada com sucesso.',
          timer: 3000,
          showConfirmButton: false
        });
        loadCounts();
        loadVerifications();
      }
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } } };
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: error.response?.data?.message || 'Erro ao aprovar verificação'
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (verification: Verification) => {
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
          
          ${Number(verification.transaction_amount) > 0 ? `
          <div class="mt-4 p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
            <strong>Nota:</strong> O valor de R$ ${Number(verification.transaction_amount).toFixed(2).replace('.', ',')} será devolvido para a carteira do usuário.
          </div>
          ` : ''}
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
      setProcessingId(verification.verification_id);
      const res = await api.post('/admin/verification/reject', {
        id: verification.verification_id,
        type: verification.type,
        reason: formValues.template + (formValues.reason ? ': ' + formValues.reason : '')
      });

      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Rejeitado!',
          text: res.data.message || 'Verificação rejeitada.'
        });
        loadCounts();
        loadVerifications();
      }
    } catch (e: unknown) {
      const error = e as { response?: { data?: { message?: string } } };
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: error.response?.data?.message || 'Erro ao rejeitar verificação'
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <PageShell title="Verificações" description="Gerencie verificações de motoristas e empresas">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-orange-500 mb-4" size={40} />
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Carregando...</span>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell 
      title="Verificações" 
      description="Gerencie verificações de motoristas e empresas"
    >
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

      {/* Stats Grid */}
      <StatsGrid>
        <StatCard 
          label="Total" 
          value={(counts.pending || 0) + (counts.approved || 0) + (counts.rejected || 0)} 
          icon={Shield} 
        />
        <StatCard 
          label="Pendentes" 
          value={counts.pending || 0} 
          icon={Clock}
          variant="yellow"
        />
        <StatCard 
          label="Aprovados" 
          value={counts.approved || 0} 
          icon={Check}
          variant="green"
        />
        <StatCard 
          label="Rejeitados" 
          value={counts.rejected || 0} 
          icon={X}
          variant="red"
        />
      </StatsGrid>

      {/* Filter Bar */}
      <FilterBar
        tabs={[
          { key: 'pending', label: 'Aguardando', icon: Clock },
          { key: 'approved', label: 'Aprovados', icon: Check },
          { key: 'rejected', label: 'Rejeitados', icon: X }
        ]}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
        search={{
          placeholder: 'Buscar por nome ou email...',
          value: '',
          onChange: () => {} // TODO: adicionar busca se necessário
        }}
      />

      {/* Filtro de Tipo (sub-tabs) */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-100 w-fit">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTypeFilter(tab.key as 'all' | 'driver' | 'company')}
            className={`
              py-2 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
              ${typeFilter === tab.key 
                ? 'bg-orange-500 text-white' 
                : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}
            `}
          >
            {tab.key === 'all' && <Shield size={16} />}
            {tab.key === 'driver' && <User size={16} />}
            {tab.key === 'company' && <Building2 size={16} />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Lista de Verificações */}
      {verifications.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100">
          <Shield size={48} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-lg font-black uppercase italic text-slate-400 mb-2">
            {activeTab === 'pending' ? 'Nenhuma verificação pendente' : 
             activeTab === 'approved' ? 'Nenhuma verificação aprovada ainda' : 
             'Nenhuma verificação rejeitada'}
          </h3>
          <p className="text-sm text-slate-400">
            {activeTab === 'pending' ? 'Todas as verificações foram processadas.' : 
             'Aprovar as verificações pendentes.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {verifications.map((v) => (
            <div key={`${v.type}-${v.verification_id}`} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
              {/* Header do Card */}
              <div className="bg-slate-50 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    v.type === 'driver' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    {v.type === 'driver' ? (
                      <User size={20} className="text-blue-500" />
                    ) : (
                      <Building2 size={20} className="text-purple-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">{v.user_name}</h3>
                    <p className="text-[10px] text-slate-400">
                      {v.type === 'driver' ? 'Motorista' : 'Empresa'} • ID: {v.user_id}
                    </p>
                  </div>
                </div>
                <span className={`
                  px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1
                  ${activeTab === 'pending' ? 'bg-amber-100 text-amber-600' : ''}
                  ${activeTab === 'approved' ? 'bg-emerald-100 text-emerald-600' : ''}
                  ${activeTab === 'rejected' ? 'bg-red-100 text-red-600' : ''}
                `}>
                  {activeTab === 'pending' && <Clock size={10} />}
                  {activeTab === 'approved' && <Check size={10} />}
                  {activeTab === 'rejected' && <X size={10} />}
                  {activeTab === 'pending' ? 'Pendente' : activeTab === 'approved' ? 'Aprovado' : 'Rejeitado'}
                </span>
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400 w-20">Email:</span>
                  <span className="text-slate-700">{v.user_email}</span>
                </div>
                
                {v.user_whatsapp && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400 w-20">WhatsApp:</span>
                    <span className="text-slate-700">{v.user_whatsapp}</span>
                  </div>
                )}
                
                {v.type === 'company' && v.cnpj && (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400 w-20">CNPJ:</span>
                      <span className="text-slate-700 font-mono">{v.cnpj}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-400 w-20">Empresa:</span>
                      <span className="text-slate-700">{v.razao_social}</span>
                    </div>
                    {v.nome_fantasia && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400 w-20">Fantasia:</span>
                        <span className="text-slate-700">{v.nome_fantasia}</span>
                      </div>
                    )}
                    {v.situacao && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400 w-20">Status:</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          v.situacao.toLowerCase() === 'ativa' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {v.situacao}
                        </span>
                      </div>
                    )}
                  </>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400 w-20">Solicitado:</span>
                  <span className="text-slate-700">
                    {new Date(v.requested_at || v.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>

                {v.reviewed_by_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400 w-20">Revisado por:</span>
                    <span className="text-slate-700">{v.reviewed_by_name}</span>
                  </div>
                )}

                {v.rejection_reason && (
                  <div className="mt-2 p-3 bg-red-50 rounded-xl">
                    <p className="text-xs font-bold text-red-700">Motivo da Rejeição:</p>
                    <p className="text-xs text-red-600">{v.rejection_reason}</p>
                  </div>
                )}

                {/* Documentos para Drivers */}
                {v.type === 'driver' && v.documents && v.documents.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-black uppercase text-slate-400">
                        Documentos ({v.documents.length})
                      </p>
                      <button
                        onClick={() => toggleCard(v.verification_id)}
                        className="text-xs text-orange-500 hover:text-orange-600 font-bold flex items-center gap-1"
                      >
                        <Eye size={12} />
                        {expandedCards.has(v.verification_id) ? 'Ocultar' : 'Ver'}
                      </button>
                    </div>

                    {expandedCards.has(v.verification_id) ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {v.documents.map((doc, idx) => {
                          const isImage = doc.file_path?.match(/\.(jpg|jpeg|png)$/i);
                          const label = DOCUMENT_LABELS[doc.document_type] || doc.document_type;
                          
                          return (
                            <div 
                              key={idx}
                              className="relative group cursor-pointer rounded-xl overflow-hidden border border-slate-200"
                              onClick={() => doc.file_path && setSelectedDoc({ url: getDocUrl(doc.file_path), label })}
                            >
                              {isImage && doc.file_path ? (
                                <img 
                                  src={getDocUrl(doc.file_path)} 
                                  alt={label}
                                  className="w-full h-24 object-cover"
                                />
                              ) : (
                                <div className="w-full h-24 bg-slate-100 flex flex-col items-center justify-center">
                                  <FileText size={24} className="text-slate-400" />
                                  <span className="text-[8px] text-slate-400 mt-1">{label}</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Eye size={20} className="text-white" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {v.documents.map((doc, idx) => (
                          <span key={idx} className="px-2 py-1 rounded text-[9px] bg-slate-100 text-slate-500">
                            {DOCUMENT_LABELS[doc.document_type] || doc.document_type}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Ações - apenas para pendentes */}
              {activeTab === 'pending' && (
                <div className="p-4 bg-slate-50 flex gap-3">
                  <button
                    onClick={() => handleApprove(v)}
                    disabled={processingId === v.verification_id}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {processingId === v.verification_id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Check size={14} /> Aprovar
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(v)}
                    disabled={processingId === v.verification_id}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {processingId === v.verification_id ? (
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
    </PageShell>
   );
}
