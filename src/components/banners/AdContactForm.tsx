import React, { useState } from 'react';
import { Send, Loader2, CheckCircle, MessageSquare } from 'lucide-react';
import { api } from '../../api/api';

const SpecialProjectLead = () => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', whatsapp: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Envia para o endpoint que salva o lead e avisa no WhatsApp via Backend
      await api.post('?endpoint=save-ad-lead', form);
      setSent(true);
    } catch (error) {
      alert("Erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <div className="bg-emerald-500 rounded-[4rem] p-12 text-center text-white animate-in zoom-in-95">
      <CheckCircle size={64} className="mx-auto mb-6" />
      <h2 className="text-3xl font-black uppercase italic mb-2">Solicitação Enviada!</h2>
      <p className="font-bold opacity-90">Nossa equipe comercial entrará em contato em breve via WhatsApp.</p>
    </div>
  );

  return (
    <div className="bg-slate-900 rounded-[4rem] p-12 text-white border-b-8 border-orange-500 shadow-2xl">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl font-[1000] uppercase italic mb-6 leading-none">
            Precisa de algo <span className="text-orange-500">sob medida?</span>
          </h2>
          <p className="text-slate-400 font-medium mb-10 italic">
            Para redes de postos, seguradoras e transportadoras. Preencha e nosso diretor comercial falará com você.
          </p>
          <div className="flex items-center gap-4 text-slate-500 font-black uppercase italic text-[10px]">
             <MessageSquare className="text-orange-500" /> Atendimento Exclusivo para Empresas
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            required
            placeholder="Seu Nome"
            className="w-full p-5 bg-white/5 rounded-2xl border border-white/10 focus:border-orange-500 outline-none font-bold"
            onChange={e => setForm({...form, name: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <input 
              required
              placeholder="Empresa"
              className="w-full p-5 bg-white/5 rounded-2xl border border-white/10 focus:border-orange-500 outline-none font-bold"
              onChange={e => setForm({...form, company: e.target.value})}
            />
            <input 
              required
              placeholder="WhatsApp"
              className="w-full p-5 bg-white/5 rounded-2xl border border-white/10 focus:border-orange-500 outline-none font-bold"
              onChange={e => setForm({...form, whatsapp: e.target.value})}
            />
          </div>
          <textarea 
            placeholder="Como podemos ajudar seu negócio?"
            className="w-full p-5 bg-white/5 rounded-2xl border border-white/10 focus:border-orange-500 outline-none font-bold h-24 resize-none"
            onChange={e => setForm({...form, message: e.target.value})}
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-orange-500 hover:bg-white hover:text-slate-900 text-white rounded-2xl font-[1000] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Solicitar Contato <Send size={20}/></>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SpecialProjectLead;