import React, { useState } from 'react';
import { X, Zap, Plus, ExternalLink, Building2, CheckCircle2, BarChart3 } from 'lucide-react';
import { api } from '../../api/api';

interface PortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalStep = 'select' | 'suggest' | 'advertise' | 'business' | 'success';

export default function GroupsModal({ isOpen, onClose }: PortalModalProps) {
  const [modalStep, setModalStep] = useState<ModalStep>('select');
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    contact: '',
    description: ''
  });

  if (!isOpen) return null;

  const handlePortalRequest = async (type: 'suggestion' | 'external_group' | 'business_ad') => {
    if (!formData.contact || !formData.title) {
      alert("Por favor, preencha as informações básicas.");
      return;
    }

    setIsSending(true);
    try {
      await api.post('admin-portal-requests', {
        type,
        title: formData.title,
        link: formData.link,
        contact_info: formData.contact,
        description: formData.description
      });
      setModalStep('success');
      setFormData({ title: '', link: '', contact: '', description: '' });
    } catch (error) {
      alert("Erro ao processar solicitação.");
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setModalStep('select');
    onClose();
  };

  return (
    <div 
      onClick={handleClose}
      className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl relative border border-white/10 flex flex-col md:flex-row italic"
      >
        
        <button onClick={handleClose} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 z-50 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
          <X size={24} />
        </button>

        {/* Lado de Branding - Estilo BusinessModal */}
        <div className="md:w-[40%] bg-[#0F172A] p-12 text-white flex flex-col justify-between border-r border-white/5">
          <div>
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-600/20">
              {modalStep === 'business' ? <BarChart3 size={32} /> : <Zap size={32} />}
            </div>
            <h3 className="text-3xl font-[1000] uppercase leading-[0.9] tracking-tighter mb-6">
              {modalStep === 'business' ? <>Expansão de <br/> Resultados.</> : <>Conecte sua <br/> Comunidade.</>}
            </h3>
            <p className="text-slate-400 text-xs font-medium mb-6">
              {modalStep === 'business' 
                ? "Conecte sua marca à maior audiência do transporte rodoviário do Brasil."
                : "Aumente o engajamento e a visibilidade do seu grupo ou sugestão de rota."}
            </p>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Chama Frete Business Ecosystem</p>
        </div>

        {/* Lado do Formulário Dinâmico */}
        <div className="md:w-[60%] p-12 bg-slate-50 dark:bg-slate-900 flex flex-col justify-center">
          
          {modalStep === 'select' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <h4 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight mb-2">Como podemos ajudar?</h4>
              <p className="text-slate-500 text-xs mb-6 font-medium">Selecione uma modalidade abaixo:</p>
              
              <button onClick={() => setModalStep('suggest')} className="w-full flex items-center gap-4 p-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl hover:border-blue-600 transition-all text-left group">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors"><Plus size={24} /></div>
                <p className="font-black text-slate-900 dark:text-white uppercase text-xs">Sugerir Nova Região</p>
              </button>

              <button onClick={() => setModalStep('advertise')} className="w-full flex items-center gap-4 p-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl hover:border-emerald-500 transition-all text-left group">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors"><ExternalLink size={24} /></div>
                <p className="font-black text-slate-900 dark:text-white uppercase text-xs">Divulgar meu Grupo</p>
              </button>

              <button onClick={() => setModalStep('business')} className="w-full flex items-center gap-4 p-5 bg-slate-900 dark:bg-black border-2 border-slate-900 dark:border-slate-800 rounded-2xl hover:bg-amber-500 hover:border-amber-500 transition-all text-left group">
                <div className="p-3 bg-white/10 text-amber-400 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors"><Building2 size={24} /></div>
                <p className="font-black text-white uppercase text-xs">Anunciar Empresa / Serviço</p>
              </button>
            </div>
          )}

          {(modalStep === 'business' || modalStep === 'suggest' || modalStep === 'advertise') && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-5">
              <button onClick={() => setModalStep('select')} className="text-[10px] font-black uppercase text-blue-600 mb-2 flex items-center gap-1">← Voltar</button>
              
              <h4 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                {modalStep === 'business' ? 'Análise de Viabilidade' : modalStep === 'suggest' ? 'Sugerir Nova Rota' : 'Dados do Grupo'}
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium italic mb-6">Retornaremos em breve via contato corporativo.</p>

              <div className="space-y-4">
                <div className="relative">
                  <Building2 className="absolute left-4 top-4 text-slate-300" size={18} />
                  <input 
                    required 
                    className="w-full p-4 pl-12 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-600 font-bold uppercase text-sm dark:text-white" 
                    placeholder={modalStep === 'business' ? "NOME DA EMPRESA" : "NOME / TÍTULO"} 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                {modalStep === 'advertise' && (
                  <div className="relative">
                    <ExternalLink className="absolute left-4 top-4 text-slate-300" size={18} />
                    <input 
                      className="w-full p-4 pl-12 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm dark:text-white" 
                      placeholder="LINK DO GRUPO (WHATSAPP)" 
                      value={formData.link} 
                      onChange={e => setFormData({...formData, link: e.target.value})}
                    />
                  </div>
                )}

                <div className="relative">
                  <Zap className="absolute left-4 top-4 text-slate-300" size={18} />
                  <input 
                    required 
                    className="w-full p-4 pl-12 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm dark:text-white" 
                    placeholder="WHATSAPP / CONTATO" 
                    value={formData.contact} 
                    onChange={e => setFormData({...formData, contact: e.target.value})}
                  />
                </div>

                <textarea 
                  required 
                  className="w-full p-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-600 font-medium h-32 resize-none text-sm dark:text-white" 
                  placeholder={modalStep === 'business' ? "Como podemos escalar seu negócio?" : "Descreva detalhes da sua solicitação..."} 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <button 
                disabled={isSending} 
                onClick={() => handlePortalRequest(modalStep === 'business' ? 'business_ad' : modalStep === 'suggest' ? 'suggestion' : 'external_group')}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-2xl font-[1000] text-[10px] uppercase tracking-[0.4em] shadow-xl transition-all"
              >
                {isSending ? 'Processando...' : (modalStep === 'business' ? 'Iniciar Conversa Estratégica' : 'Enviar Solicitação')}
              </button>
            </div>
          )}

          {modalStep === 'success' && (
            <div className="text-center py-10 animate-in zoom-in">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40}/>
              </div>
              <h3 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase mb-4">Solicitação Enviada</h3>
              <p className="text-slate-500 text-xs mb-8">Nossa equipe entrará em contato em breve.</p>
              <button 
                onClick={handleClose} 
                className="bg-slate-900 dark:bg-white dark:text-slate-950 px-12 py-6 rounded-2xl font-black uppercase text-xs"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}