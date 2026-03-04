import React from 'react';
import { Info, Building2, Landmark } from 'lucide-react';

const CompanyFields = ({ formData, setFormData }: any) => {
  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl flex items-center gap-3 border border-blue-100 dark:border-blue-900/30">
        <Info size={18} className="text-blue-500" />
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
          Complete os dados da sua organização. Módulos específicos (Fretes, Cotações) podem ser ativados no Painel Principal.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* CNPJ e Razão Social já estão no MyProfile, aqui colocamos apenas extras de PJ se houver */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Landmark size={12} /> Inscrição Estadual (Opcional)
          </label>
          <input
            value={formData.state_registration || ''}
            onChange={(e) => handleInputChange('state_registration', e.target.value)}
            placeholder="000.000.000.000"
            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-transparent font-bold text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-blue-500 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Building2 size={12} /> Setor de Atuação
          </label>
          <select
            value={formData.industry_sector || ''}
            onChange={(e) => handleInputChange('industry_sector', e.target.value)}
            className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-transparent font-bold text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-blue-500 transition-all"
          >
            <option value="">Selecione um setor...</option>
            <option value="logistica">Logística e Transportes</option>
            <option value="industria">Indústria / Fabricação</option>
            <option value="comercio">Comercial / Varejo</option>
            <option value="servicos">Prestação de Serviços</option>
            <option value="outros">Outros</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CompanyFields;