import React from 'react';

const CompanyFields = ({ formData, setFormData }: any) => (
  <div className="space-y-6">
    <div>
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Razão Social / Nome Fantasia</label>
      <input 
        value={formData.company_name || ''} 
        onChange={(e) => setFormData({...formData, company_name: e.target.value})}
        placeholder="Nome da Empresa"
        className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 border-2 border-transparent focus:border-orange-500/20" 
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">CNPJ</label>
        <input 
          value={formData.cnpj || ''} 
          onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
          placeholder="00.000.000/0000-00"
          className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 border-2 border-transparent focus:border-orange-500/20" 
        />
      </div>
      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Cidade Base / UF</label>
        <input 
          value={formData.city || ''} 
          onChange={(e) => setFormData({...formData, city: e.target.value})}
          placeholder="Ex: Curitiba / PR"
          className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 border-2 border-transparent focus:border-orange-500/20" 
        />
      </div>
    </div>
    <div>
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Regiões de Atendimento</label>
      <input 
        value={formData.cidades_atendidas || ''} 
        onChange={(e) => setFormData({...formData, cidades_atendidas: e.target.value})}
        placeholder="Ex: Todo o Brasil, Região Sul..."
        className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 border-2 border-transparent focus:border-orange-500/20" 
      />
    </div>
  </div>
);

export default CompanyFields;