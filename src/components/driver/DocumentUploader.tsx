import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Check, FileText, Image, File, AlertCircle } from 'lucide-react';

interface DocumentType {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface UploadedDocument {
  id?: number;
  document_type: string;
  file_path: string;
  status: string;
  rejection_reason?: string;
}

interface DocumentUploaderProps {
  userId: number;
  onComplete?: (allUploaded: boolean) => void;
  readonly?: boolean;
}

const DOCUMENT_TYPES: DocumentType[] = [
  {
    key: 'cnh_front',
    label: 'CNH (Frente)',
    description: 'Foto da frente da CNH',
    icon: <FileText size={24} />
  },
  {
    key: 'cnh_back',
    label: 'CNH (Verso)',
    description: 'Foto do verso da CNH',
    icon: <FileText size={24} />
  },
  {
    key: 'crlv',
    label: 'CRLV',
    description: 'Certificado de Registro e Licenciamento do Veículo',
    icon: <File size={24} />
  },
  {
    key: 'rg',
    label: 'Documento de Identidade',
    description: 'RG ou CPF',
    icon: <Image size={24} />
  },
  {
    key: 'address_proof',
    label: 'Comprovante de Endereço',
    description: 'Conta de luz, água ou telefone (máximo 3 meses)',
    icon: <FileText size={24} />
  }
];

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const STATIC_BASE = import.meta.env.VITE_STATIC_URL || 'http://127.0.0.1:8000';

export default function DocumentUploader({ userId, onComplete, readonly = false }: DocumentUploaderProps) {
  const [documents, setDocuments] = useState<Record<string, UploadedDocument>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadType, setCurrentUploadType] = useState<string | null>(null);

  const loadDocuments = useCallback(async () => {
    try {
      const token = localStorage.getItem('@ChamaFrete:token');
      const res = await fetch(`${API_BASE}/document/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        const docsMap: Record<string, UploadedDocument> = {};
        data.documents.forEach((doc: UploadedDocument) => {
          docsMap[doc.document_type] = doc;
        });
        setDocuments(docsMap);
        
        if (onComplete) {
          onComplete(data.all_uploaded);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar documentos:', err);
    }
  }, [onComplete]);

  React.useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleFileSelect = (type: string, file: File) => {
    // Validação de tamanho (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo: 2MB');
      return;
    }

    // Validação de tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de arquivo não permitido. Use JPG, PNG ou PDF');
      return;
    }

    // Cria preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }

    setCurrentUploadType(type);
    setError(null);

    // Armazena arquivo para upload
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
      fileInputRef.current.dataset.type = type;
    }
  };

  const uploadDocument = async (type: string, file: File) => {
    setUploading(type);
    setError(null);

    try {
      const token = localStorage.getItem('@ChamaFrete:token');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', type);

      const res = await fetch(`${API_BASE}/document/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        setDocuments(prev => ({
          ...prev,
          [type]: data.document
        }));
        
        // Verifica se todos estão completos
        const allTypes = DOCUMENT_TYPES.map(d => d.key);
        const allUploaded = allTypes.every(t => documents[t] || t === type);
        if (onComplete) onComplete(allUploaded);
      } else {
        setError(data.message || 'Erro ao enviar documento');
      }
    } catch (err) {
      setError('Erro ao enviar documento. Tente novamente.');
      console.error(err);
    } finally {
      setUploading(null);
      setPreviewUrl(null);
      setCurrentUploadType(null);
    }
  };

  const handleDrop = (e: React.DragEvent, type: string) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(type, file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const deleteDocument = async (type: string) => {
    const doc = documents[type];
    if (!doc?.id) return;

    try {
      const token = localStorage.getItem('@ChamaFrete:token');
      const res = await fetch(`${API_BASE}/document/delete`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ document_id: doc.id })
      });

      const data = await res.json();
      if (data.success) {
        setDocuments(prev => {
          const next = { ...prev };
          delete next[type];
          return next;
        });
      }
    } catch (err) {
      setError('Erro ao remover documento');
      console.error(err);
    }
  };

  const getDocumentStatus = (type: string) => {
    const doc = documents[type];
    if (!doc) return 'missing';
    if (doc.status === 'rejected') return 'rejected';
    if (doc.status === 'pending') return 'pending';
    return 'uploaded';
  };

  const getFileUrl = (path: string) => {
    return `${STATIC_BASE}${path}`;
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          const type = e.target.dataset.type || currentUploadType;
          if (file && type) {
            uploadDocument(type, file);
          }
        }}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500 shrink-0" size={20} />
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {DOCUMENT_TYPES.map((docType) => {
          const status = getDocumentStatus(docType.key);
          const doc = documents[docType.key];
          const isUploading = uploading === docType.key;
          const isPending = status === 'pending';
          const isRejected = status === 'rejected';

          return (
            <div
              key={docType.key}
              className={`
                relative rounded-2xl border-2 border-dashed p-6 transition-all
                ${status === 'uploaded' ? 'border-emerald-300 bg-emerald-50/50' : ''}
                ${status === 'pending' ? 'border-amber-300 bg-amber-50/50' : ''}
                ${status === 'rejected' ? 'border-red-300 bg-red-50/50' : ''}
                ${status === 'missing' ? 'border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-orange-50/50' : ''}
                ${readonly ? 'opacity-75' : 'cursor-pointer'}
              `}
              onDrop={(e) => !readonly && handleDrop(e, docType.key)}
              onDragOver={handleDragOver}
              onClick={() => {
                if (!readonly && !doc && !isUploading) {
                  fileInputRef.current!.dataset.type = docType.key;
                  fileInputRef.current!.click();
                }
              }}
            >
              {/* Status Badge */}
              {status !== 'missing' && (
                <div className={`
                  absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center
                  ${status === 'uploaded' ? 'bg-emerald-500' : ''}
                  ${status === 'pending' ? 'bg-amber-500' : ''}
                  ${status === 'rejected' ? 'bg-red-500' : ''}
                `}>
                  {status === 'uploaded' && <Check size={14} className="text-white" />}
                  {status === 'pending' && <Upload size={14} className="text-white" />}
                  {status === 'rejected' && <X size={14} className="text-white" />}
                </div>
              )}

              {/* Preview ou Placeholder */}
              <div className="aspect-video rounded-xl bg-white border border-slate-100 mb-4 overflow-hidden flex items-center justify-center">
                {isUploading ? (
                  <div className="animate-pulse flex flex-col items-center gap-2">
                    <Upload className="text-orange-500 animate-bounce" size={32} />
                    <span className="text-xs text-slate-400">Enviando...</span>
                  </div>
                ) : doc ? (
                  doc.file_path.match(/\.(jpg|jpeg|png)$/i) ? (
                    <img 
                      src={getFileUrl(doc.file_path)} 
                      alt={docType.label}
                      className="w-full h-full object-contain"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(getFileUrl(doc.file_path), '_blank');
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <File size={48} />
                      <span className="text-xs">PDF</span>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-300">
                    {docType.icon}
                    <span className="text-xs">JPG, PNG ou PDF</span>
                    <span className="text-[10px]">Máx. 2MB</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <h4 className="font-bold text-slate-700 text-sm">{docType.label}</h4>
              <p className="text-xs text-slate-400 mt-1">{docType.description}</p>

              {/* Rejection Reason */}
              {isRejected && doc?.rejection_reason && (
                <div className="mt-2 p-2 bg-red-100 rounded-lg">
                  <p className="text-xs text-red-600">
                    <strong>Motivo:</strong> {doc.rejection_reason}
                  </p>
                </div>
              )}

              {/* Actions */}
              {!readonly && status !== 'missing' && (
                <div className="mt-3 flex gap-2">
                  {!isPending && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current!.dataset.type = docType.key;
                          fileInputRef.current!.click();
                        }}
                        className="flex-1 text-xs font-bold text-orange-500 hover:text-orange-600 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
                      >
                        Trocar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDocument(docType.key);
                        }}
                        className="px-3 text-xs font-bold text-red-400 hover:text-red-600 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Resumo */}
      <div className="bg-slate-100 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-600">Documentos enviados</p>
            <p className="text-xs text-slate-400">
              {Object.keys(documents).length} de {DOCUMENT_TYPES.length} obrigatórios
            </p>
          </div>
          <div className="flex gap-2">
            {DOCUMENT_TYPES.map((docType) => {
              const status = getDocumentStatus(docType.key);
              return (
                <div
                  key={docType.key}
                  className={`
                    w-3 h-3 rounded-full
                    ${status === 'uploaded' ? 'bg-emerald-500' : ''}
                    ${status === 'pending' ? 'bg-amber-500' : ''}
                    ${status === 'rejected' ? 'bg-red-500' : ''}
                    ${status === 'missing' ? 'bg-slate-300' : ''}
                  `}
                  title={docType.label}
                />
              );
            })}
          </div>
        </div>
        
        {Object.keys(documents).length === DOCUMENT_TYPES.length && (
          <div className="mt-3 flex items-center gap-2 text-emerald-600">
            <Check size={16} />
            <span className="text-sm font-bold">Todos os documentos foram enviados!</span>
          </div>
        )}
      </div>
    </div>
  );
}
