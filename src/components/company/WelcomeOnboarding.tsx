import React, { useState } from 'react';
import { Building2, FileText, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { api } from '../../api/api';

export default function WelcomeOnboarding({ user, onComplete }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ company_name: '', cnpj: '' });

  const handleSave = async () => {
    const cleanCnpj = formData.cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) return alert("CNPJ Inválido.");

    setLoading(true);
    try {
      // 1. Consulta API Pública (BrasilAPI)
      const check = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      const data = await check.json();

      if (check.status !== 200 || data.situacao !== "ATIVA") {
        throw new Error("CNPJ Inativo ou não encontrado.");
      }

      // 2. Salva no banco com status 'pending' para aprovação do Admin
      const companyName = data.nome_fantasia || data.razao_social;
      const res = await api.post('', {
        id: user.id,
        action: 'complete-profile',
        company_name: companyName,
        cnpj: formData.cnpj,
        status: 'pending' 
      }, { params: { endpoint: 'manage-users-admin' } });

      if (res.data.success) {
        onComplete({ ...user, company_name: companyName, cnpj: formData.cnpj, status: 'pending' });
      }
    } catch (e: any) {
      alert(e.message || "Erro ao validar CNPJ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-[999] flex items-center justify-center p-6 backdrop-blur-xl">
      <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl text-center border border-white/20">
        <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg rotate-3">
          <Building2 size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 uppercase italic">Identifique sua Empresa</h2>
        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] my-4">Para publicar cargas, precisamos validar seu CNPJ</p>
        
        <div className="space-y-4 text-left mt-8">
          <input 
            placeholder="00.000.000/0000-00"
            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-orange-500 transition-all"
            onChange={e => setFormData({...formData, cnpj: e.target.value})}
          />
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full mt-8 bg-slate-900 hover:bg-orange-500 text-white py-5 rounded-2xl font-black uppercase italic flex items-center justify-center gap-3 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <>Validar e Acessar <ArrowRight size={20} /></>}
        </button>
      </div>
    </div>
  );
}