import { useState } from 'react';
import { 
  ArrowRight, Building2, CheckCircle2, X, Zap, 
  ShoppingBag, BarChart3, Users, ChevronRight, Target
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { api } from '../../api/api';

const CTA = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({ title: '', contact: '', description: '' });

  const handlePortalRequest = async (e: React.FormEvent) => {
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
      alert("Erro ao processar.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="py-24 px-4 bg-white dark:bg-slate-950 transition-colors">
      <div className="container mx-auto max-w-6xl">
        <div className="bg-[#0F172A] rounded-[4rem] p-10 md:p-24 relative overflow-hidden border border-slate-800 shadow-2xl">
          
          {/* Efeito de Profundidade */}
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Badge de Posicionamento */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8">
              <Target size={14} className="text-blue-400" />
              <span className="text-[10px] font-black text-blue-100 uppercase tracking-[0.3em]">Soluções para o Ecossistema Logístico</span>
            </div>

            <h2 className="text-5xl md:text-8xl font-[1000] text-white tracking-tighter italic uppercase leading-[0.8] mb-8">
              Onde o mercado <br />
              <span className="text-blue-500">se movimenta.</span>
            </h2>
            
            <p className="text-slate-400 text-lg md:text-2xl max-w-3xl font-medium italic mb-12">
              Não somos apenas uma plataforma, somos a infraestrutura que conecta sua operação ao motorista, seu produto ao marketplace e sua marca à maior audiência do setor.
            </p>

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl justify-center">
              {/* Botão Cadastrar Empresa - Corrigido para Legibilidade no Dark */}
              <a 
                href="/register?type=company" 
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white h-20 px-8 rounded-[2rem] font-[1000] uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 transition-all hover:scale-105 shadow-xl shadow-blue-600/20"
              >
                Cadastrar Empresa <ArrowRight size={18} />
              </a>

              {/* Botão Consultivo - Venda sem Vender */}
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 bg-white/5 border-2 border-white/10 hover:border-white/20 hover:bg-white/10 text-white h-20 px-8 rounded-[2rem] font-[1000] uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 transition-all"
              >
                Novos Negócios & Mídia <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL EXECUTIVE INTERFACE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 transition-all">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row border border-white/10">
            
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 z-50 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
              <X size={24} />
            </button>

            {/* Sidebar Informativa: Posicionamento Enterprise */}
            <div className="md:w-[40%] bg-[#0F172A] p-12 text-white flex flex-col justify-between relative border-r border-white/5">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-600/20">
                  <BarChart3 size={32} className="text-white" />
                </div>
                <h3 className="text-3xl font-[1000] uppercase italic leading-none tracking-tighter mb-8">
                  Inteligência & <br /> Distribuição.
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Operação em Larga Escala</p>
                    <p className="text-slate-400 text-xs font-medium italic">Gestão e publicação massiva de demandas para transportadoras e indústrias.</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Presença Digital</p>
                    <p className="text-slate-400 text-xs font-medium italic">Sua marca posicionada estrategicamente para o público mais engajado do transporte.</p>
                  </div>
                </div>
              </div>

              <div className="pt-12 border-t border-white/5">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
                  Chama Frete Business <br /> Ecosystem v2.0
                </p>
              </div>
            </div>

            {/* Form de Conversão: Linguagem Consultiva */}
            <div className="md:w-[60%] p-12 flex flex-col justify-center bg-slate-50 dark:bg-slate-900">
              {!showSuccess ? (
                <form onSubmit={handlePortalRequest} className="space-y-6">
                  <div className="mb-4">
                    <h4 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase italic tracking-tight leading-none">Análise de Viabilidade</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-2 italic">Deixe os detalhes da sua demanda e nossa equipe técnica entrará em contato.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="group transition-all">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Organização</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input 
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className="w-full p-4 pl-12 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-600 font-bold uppercase text-sm transition-all text-slate-900 dark:text-white" 
                          placeholder="Ex: Transportadora Logística S.A." 
                        />
                      </div>
                    </div>

                    <div className="group transition-all">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Canal de Contato</label>
                      <div className="relative">
                        <Zap className="absolute left-4 top-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input 
                          required
                          value={formData.contact}
                          onChange={(e) => setFormData({...formData, contact: e.target.value})}
                          className="w-full p-4 pl-12 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-600 font-bold text-sm transition-all text-slate-900 dark:text-white" 
                          placeholder="WhatsApp ou E-mail Corporativo" 
                        />
                      </div>
                    </div>

                    <div className="group transition-all">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Escopo do Projeto</label>
                      <textarea 
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full p-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:border-blue-600 font-medium h-32 resize-none text-sm transition-all text-slate-900 dark:text-white" 
                        placeholder="Quais seus objetivos em nossa plataforma?" 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSending}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-2xl font-[1000] text-[10px] uppercase tracking-[0.4em] shadow-xl shadow-blue-500/20 transition-all disabled:opacity-50 active:scale-[0.98]"
                  >
                    {isSending ? 'Processando Dados...' : 'Iniciar Conversa Estratégica'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-10 animate-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-[1000] text-slate-900 dark:text-white uppercase italic mb-4 leading-none">Solicitação Recebida</h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium italic mb-10 text-sm">Nossa diretoria comercial analisará seu escopo e retornará via canal de contato informado.</p>
                  <Button 
                    onClick={() => { setIsModalOpen(false); setShowSuccess(false); }}
                    className="bg-slate-900 dark:bg-white dark:text-slate-950 text-white px-12 py-6 rounded-2xl font-black uppercase text-xs tracking-widest"
                  >
                    Fechar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CTA;