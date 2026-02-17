import React, { useState } from 'react';
import { 
  Building2, ArrowRight, Loader2, Truck, 
  User, ShieldCheck, MapPin, CheckCircle2, 
  FileText
} from 'lucide-react';
import { api } from '../../api/api';
import Swal from 'sweetalert2';

export default function WelcomeOnboarding({ user, onComplete }: any) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Para futuras expansões de passos
  
  // Detecta o tipo de usuário
  const role = String(user.role || '').toUpperCase();
  const isDriver = ['DRIVER', 'MOTORISTA'].includes(role);
  const isCompany = ['COMPANY', 'TRANSPORTADORA', 'LOGISTICS', 'WAREHOUSE', 'SHIPPER'].includes(role);

  const [formData, setFormData] = useState({
    name: user.name || '',
    document: '', // CNPJ ou CPF
    whatsapp: user.whatsapp || '',
    city: '',
    state: ''
  });

  const handleSave = async () => {
    const cleanDoc = formData.document.replace(/\D/g, '');
    
    // Validações básicas por tipo
    if (isCompany && cleanDoc.length !== 14) return alert("CNPJ Inválido.");
    if (isDriver && cleanDoc.length !== 11) return alert("CPF Inválido.");
    if (!formData.city) return alert("Informe sua cidade.");

    setLoading(true);
    try {
      let companyData = {};

      // 1. Se for Empresa, tenta buscar dados automaticamente
      if (isCompany) {
        try {
          const check = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanDoc}`);
          const data = await check.json();
          if (check.status === 200) {
            companyData = {
              company_name: data.nome_fantasia || data.razao_social,
              city: data.municipio,
              state: data.uf
            };
          }
        } catch (e) { console.log("BrasilAPI falhou, seguindo manual..."); }
      }

      // 2. Envia para o backend (usando sua rota de update-profile)
      const res = await api.post('/update-profile', {
        ...formData,
        ...companyData,
        document: cleanDoc,
        onboarding_completed: true
      });

      if (res.data.success) {
        onComplete({ ...user, ...formData, ...companyData });
        Swal.fire({
          icon: 'success',
          title: 'Bem-vindo ao Ecossistema!',
          text: 'Seu perfil foi configurado com sucesso.',
          showConfirmButton: false,
          timer: 2000
        });
      }
    } catch (e: any) {
      alert(e.response?.data?.message || "Erro ao salvar perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-[999] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white w-full max-w-xl rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Decoração de Fundo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16" />

        <div className="text-center">
          <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg rotate-3">
            {isDriver ? <Truck size={40} /> : <Building2 size={40} />}
          </div>
          
          <h2 className="text-3xl font-black text-slate-900 uppercase italic leading-tight">
            {isDriver ? 'Prepare sua Frota' : 'Identifique sua Empresa'}
          </h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] my-4 px-8">
            {isDriver 
              ? 'Complete os dados para visualizar fretes compatíveis' 
              : 'Validamos seu CNPJ para garantir segurança nas contratações'}
          </p>
        </div>

        <div className="space-y-4 mt-8">
          <div className="grid grid-cols-1 gap-4">
            {/* Campo Documento Dinâmico */}
            <div className="relative">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">
                {isDriver ? 'Seu CPF' : 'CNPJ da Empresa'}
              </label>
              <div className="relative">
                <FileText className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  placeholder={isDriver ? "000.000.000-00" : "00.000.000/0000-00"}
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-orange-500 transition-all text-slate-700"
                  onChange={e => setFormData({...formData, document: e.target.value})}
                />
              </div>
            </div>

            {/* Nome / Nome da Empresa */}
            <div className="relative">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-4 mb-2 block">
                {isDriver ? 'Nome Completo' : 'Nome de Exibição'}
              </label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  placeholder="Como quer ser chamado?"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-orange-500 transition-all text-slate-700"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            {/* Localização Simplificada */}
            <div className="grid grid-cols-2 gap-4">
               <div className="relative">
                 <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                 <input 
                   placeholder="Cidade"
                   className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-orange-500"
                   onChange={e => setFormData({...formData, city: e.target.value})}
                 />
               </div>
               <input 
                 placeholder="UF"
                 maxLength={2}
                 className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-sm outline-none focus:border-orange-500 uppercase"
                 onChange={e => setFormData({...formData, state: e.target.value})}
               />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={loading}
          className="w-full mt-10 bg-slate-900 hover:bg-orange-500 text-white py-6 rounded-2xl font-black uppercase italic flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>Finalizar Configuração <CheckCircle2 size={22} /></>
          )}
        </button>

        <p className="text-center mt-6 text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2">
          <ShieldCheck size={12} /> Seus dados estão criptografados e seguros
        </p>
      </div>
    </div>
  );
}