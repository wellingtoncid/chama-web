import { X, Building2, Zap, BarChart3, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { api } from "../../api/api";
import { Button } from "../ui/button";

interface BusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubject?: string; // Ex: "Anúncio", "Marketplace", "Cadastro Empresa"
}

export const BusinessModal = ({ isOpen, onClose, initialSubject }: BusinessModalProps) => {
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({ title: '', contact: '', description: initialSubject || '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await api.post('admin-portal-requests', { 
        type: 'business_ad', 
        title: formData.title,
        contact_info: formData.contact, 
        description: formData.description
      });
      setShowSuccess(true);
    } catch (error) {
      alert("Erro ao processar solicitação.");
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-2xl z-[999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row border border-white/10 italic">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 z-50 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
          <X size={24} />
        </button>

        {/* Lado de Branding (O que você já tem no CTA) */}
        <div className="md:w-[40%] bg-[#0F172A] p-12 text-white flex flex-col justify-between border-r border-white/5">
          <div>
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-600/20">
              <BarChart3 size={32} />
            </div>
            <h3 className="text-3xl font-[1000] uppercase leading-[0.9] tracking-tighter mb-6">Expansão de <br/> Resultados.</h3>
            <p className="text-slate-400 text-xs font-medium mb-6">Conecte sua marca à maior audiência do transporte rodoviário do Brasil.</p>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Chama Frete Business Ecosystem</p>
        </div>

        {/* Lado do Formulário */}
        <div className="md:w-[60%] p-12 bg-slate-50 dark:bg-slate-900">
          {!showSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-5">
               <h4 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight leading-none">Análise de Viabilidade</h4>
               <p className="text-slate-500 dark:text-slate-400 text-xs font-medium italic">Retornaremos em breve via contato corporativo.</p>
               
               <div className="space-y-4">
                  <div className="relative">
                    <Building2 className="absolute left-4 top-4 text-slate-300" size={18} />
                    <input required className="w-full p-4 pl-12 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-600 font-bold uppercase text-sm dark:text-white" 
                      placeholder="NOME DA EMPRESA" 
                      value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <Zap className="absolute left-4 top-4 text-slate-300" size={18} />
                    <input required className="w-full p-4 pl-12 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm dark:text-white" 
                      placeholder="WHATSAPP / E-MAIL" 
                      value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})}
                    />
                  </div>
                  <textarea required className="w-full p-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-600 font-medium h-32 resize-none text-sm dark:text-white" 
                    placeholder="Como podemos escalar seu negócio?" 
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  />
               </div>

               <button disabled={isSending} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-2xl font-[1000] text-[10px] uppercase tracking-[0.4em] shadow-xl transition-all">
                 {isSending ? 'Processando...' : 'Iniciar Conversa Estratégica'}
               </button>
            </form>
          ) : (
            <div className="text-center py-10 animate-in zoom-in">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40}/></div>
              <h3 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase mb-4">Solicitação Enviada</h3>
              <Button onClick={() => { setShowSuccess(false); onClose(); }} className="bg-slate-900 dark:bg-white dark:text-slate-950 px-12 py-6 rounded-2xl font-black uppercase text-xs">Fechar</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};