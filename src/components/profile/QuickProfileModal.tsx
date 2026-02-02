import React, { useState } from 'react';
import { X, ShieldCheck, Truck, Building2, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../api/api';

interface QuickProfileModalProps {
  user: any;
  onClose: () => void;
  onSuccess: (updatedUser: any) => void;
}

export default function QuickProfileModal({ user, onClose, onSuccess }: QuickProfileModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingCNPJ, setFetchingCNPJ] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normalização de Role baseada na sua lista de permissões
  const userRole = user.role?.toLowerCase() || 'driver';
  const isCompany = ['company', 'shipper', 'transportadora'].includes(userRole);
  
  const [formData, setFormData] = useState({
    display_name: user.company_name || user.name || '',
    document: user.document || '',
    whatsapp: user.phone || user.whatsapp || '',
    city: user.city || '',
    state: user.state || '',
  });

  // Consulta automática de CNPJ (Somente se for Empresa e tiver 14 dígitos)
  const handleDocumentBlur = async () => {
    const cleanDoc = formData.document.replace(/\D/g, '');
    
    if (isCompany && cleanDoc.length !== 14) {
        setError("Para empresas, informe o CNPJ completo (14 dígitos).");
        return;
    }

    if (cleanDoc.length === 14) {
      setFetchingCNPJ(true);
      setError(null);
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanDoc}`);
        if (!response.ok) throw new Error('Documento não encontrado na base nacional.');
        
        const data = await response.json();
        
        setFormData(prev => ({
          ...prev,
          display_name: data.nome_fantasia || data.razao_social,
          city: data.municipio,
          state: data.uf
        }));
      } catch (e: any) {
        setError("CNPJ não localizado. Preencha os dados da empresa manualmente.");
      } finally {
        setFetchingCNPJ(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanDoc = formData.document.replace(/\D/g, '');

    // --- VALIDAÇÃO RESTRITA CONFORME SOLICITADO ---
    if (isCompany && cleanDoc.length !== 14) {
      setError("Empresas devem obrigatoriamente informar um CNPJ válido.");
      return;
    }

    if (!isCompany && cleanDoc.length !== 11 && cleanDoc.length !== 14) {
      setError("Informe um CPF ou CNPJ válido.");
      return;
    }

    if (formData.whatsapp.replace(/\D/g, '').length < 10) {
      setError("Número de WhatsApp incompleto.");
      return;
    }

    setLoading(true);
    try {
      /**
       * CORREÇÃO DE ROTA (404):
       * A rota no seu PHP é /api/update-quick-profile.
       * Como o seu axios já deve ter a baseURL terminando em /api,
       * chamamos apenas '/update-quick-profile'.
       */
      const res = await api.post('/update-quick-profile', formData);

      if (res.data.success) {
        onSuccess(res.data.user);
        onClose();
      } else {
        setError(res.data.message || "Erro ao processar ativação.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Servidor offline ou rota inválida (404).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] overflow-hidden border border-slate-100">
        
        {/* Header Dinâmico */}
        <div className={`p-10 text-white relative overflow-hidden ${isCompany ? 'bg-gradient-to-br from-indigo-600 to-blue-700' : 'bg-gradient-to-br from-orange-500 to-red-600'}`}>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="bg-white/20 w-14 h-14 rounded-[1.5rem] flex items-center justify-center mb-6 backdrop-blur-xl border border-white/30 shadow-inner">
                {isCompany ? <Building2 size={28} /> : <Truck size={28} />}
              </div>
              <h2 className="text-3xl font-black uppercase italic leading-none tracking-tighter">Ativação</h2>
              <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mt-2 italic">
                {isCompany ? 'Terminal de Logística Corporativa' : 'Verificação de Operador Autônomo'}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="hover:rotate-90 transition-all duration-300 bg-black/10 hover:bg-black/20 p-2.5 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 lg:p-10 space-y-5">
          
          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-bounce-short">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-[10px] font-black uppercase italic leading-tight">{error}</p>
            </div>
          )}

          {/* Nome / Razão Social */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest block">
              {isCompany ? 'Razão Social da Empresa' : 'Nome do Motorista'}
            </label>
            <div className="relative group">
              <input 
                required
                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
                value={formData.display_name}
                onChange={e => setFormData({...formData, display_name: e.target.value})}
                placeholder={isCompany ? "Nome da sua transportadora" : "Seu nome completo"}
              />
              {fetchingCNPJ && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Loader2 className="animate-spin text-indigo-500" size={18} />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* CPF/CNPJ */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest block">Documento (CNPJ)</label>
              <input 
                required
                className={`w-full border-2 p-4 rounded-2xl outline-none transition-all font-bold text-slate-700 text-sm ${isCompany && formData.document.length > 0 && formData.document.length < 14 ? 'border-amber-400 bg-amber-50' : 'bg-slate-50 border-slate-50 focus:border-indigo-500'}`}
                value={formData.document}
                onBlur={handleDocumentBlur}
                onChange={e => setFormData({...formData, document: e.target.value.replace(/\D/g, '')})}
                placeholder={isCompany ? "CNPJ da Empresa" : "CPF ou CNPJ"}
                maxLength={14}
              />
            </div>
            {/* WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest block">WhatsApp</label>
              <input 
                required
                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm"
                value={formData.whatsapp}
                onChange={e => setFormData({...formData, whatsapp: e.target.value.replace(/\D/g, '')})}
                placeholder="47 99999-9999"
                maxLength={11}
              />
            </div>
          </div>

          {/* Localização */}
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3 space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest block">Cidade Base</label>
              <input 
                required
                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm"
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
                placeholder="Sua cidade"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest block">UF</label>
              <input 
                required
                maxLength={2}
                className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm uppercase text-center"
                value={formData.state}
                onChange={e => setFormData({...formData, state: e.target.value.toUpperCase()})}
                placeholder="UF"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || fetchingCNPJ}
            className={`w-full py-6 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] text-white shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 group ${
              isCompany ? 'bg-indigo-600 hover:bg-slate-900' : 'bg-orange-500 hover:bg-slate-900'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" /> 
                Verificar e Ativar Conta
              </>
            )}
          </button>

          <p className="text-[9px] font-black text-slate-300 uppercase text-center leading-relaxed max-w-[80%] mx-auto italic">
            * Dados protegidos pela criptografia de ponta a ponta do Terminal Chama Frete.
          </p>
        </form>
      </div>
    </div>
  );
}