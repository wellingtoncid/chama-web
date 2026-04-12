import { useState } from 'react';
import { X, Building2, Zap, CheckCircle2, Send, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { api } from '../../api/api';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleName: string;
  moduleKey: string;
  onSuccess?: () => void;
}

const RequestModal = ({ isOpen, onClose, moduleName, moduleKey, onSuccess }: RequestModalProps) => {
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    contact: '',
    justification: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      await api.post('/user/modules/request', {
        module_key: moduleKey,
        contact_info: formData.contact,
        justification: formData.justification
      });
      
      setShowSuccess(true);
      onSuccess?.();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao enviar solicitação';
      alert(message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
        
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-slate-400 hover:text-red-500 z-50 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-8 text-white">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase italic">Quero Acesso Antecipado</h3>
              <p className="text-emerald-100 text-sm font-medium">{moduleName}</p>
            </div>
          </div>
          <p className="text-emerald-100 text-xs font-medium">
            Preencha seus dados e nossa equipe comercial entrará em contato 
            com uma proposta personalizada para sua empresa.
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {!showSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="group transition-all">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Seu WhatsApp ou E-mail
                </label>
                <div className="relative">
                  <Zap className="absolute left-4 top-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  <input 
                    required
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className="w-full p-4 pl-12 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 font-bold text-sm transition-all text-slate-900 dark:text-white" 
                    placeholder="(00) 00000-0000 ou email@empresa.com" 
                  />
                </div>
              </div>

              <div className="group transition-all">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Como podemos ajudar? (Opcional)
                </label>
                <textarea 
                  value={formData.justification}
                  onChange={(e) => setFormData({...formData, justification: e.target.value})}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 font-medium h-32 resize-none text-sm transition-all text-slate-900 dark:text-white" 
                  placeholder="Conte-nos sobre sua necessidade de frete, volume de cargas ou qualquer dúvida..." 
                />
              </div>

              <Button 
                type="submit"
                disabled={isSending || !formData.contact}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {isSending ? (
                  <span className="flex items-center gap-2">
                    <Send size={16} className="animate-pulse" />
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send size={16} />
                    Solicitar Proposta Comercial
                  </span>
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-8 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic mb-4">
                Solicitação Enviada!
              </h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 max-w-sm mx-auto">
                Nossa equipe comercial analisará sua solicitação e entrará em contato pelo canal informado em até 48 horas úteis.
              </p>
              <Button 
                onClick={onClose}
                className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-12 py-4 rounded-xl font-black uppercase text-xs tracking-widest"
              >
                Fechar
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestModal;
