import React from 'react';
import { 
  Building2, FileText, MapPin, Globe2, Briefcase, 
  ShieldCheck, Warehouse, Truck, PackageSearch, Boxes 
} from 'lucide-react';

const CompanyFields = ({ formData, setFormData }: any) => {
  
  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // Categorias de Empresas (Conforme alinhado)
  const businessTypes = [
    { id: 'transportadora', label: 'Transportadora', icon: <Truck size={14} /> },
    { id: 'operador_logistico', label: 'Operador Logístico', icon: <PackageSearch size={14} /> },
    { id: 'armazem', label: 'Armazém / CD', icon: <Warehouse size={14} /> },
    { id: 'agente_cargas', label: 'Agente de Cargas', icon: <Globe2 size={14} /> },
    { id: 'cooperativa', label: 'Cooperativa', icon: <Briefcase size={14} /> },
  ];

  // Serviços de Transporte Ampliados
  const transportServices = [
    'Lotação', 'Fracionado', 'Expresso', 'Contêiner', 
    'Carga Viva', 'Indivisíveis', 'Granel', 'Frio', 'Cegonha'
  ];

  // Serviços de Logística/Armazenagem
  const logisticsServices = [
    'Armazenagem Seca', 'Climatizada', 'Cross-docking', 
    'Picking/Packing', 'Logística Reversa', 'E-commerce Fulfillment'
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
      
      {/* Categoria do Negócio */}
      <div className="w-full">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-2">
          Categoria da Empresa
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {businessTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleInputChange('business_type', type.id)}
              className={`p-3 rounded-xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${
                formData.business_type === type.id 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
              }`}
            >
              {type.icon}
              <span className="text-[8px] font-black uppercase text-center leading-tight">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dados Básicos */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Nome Fantasia</label>
          <div className="relative">
            <input 
              value={formData.company_name || ''} 
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              placeholder="Ex: TransLog"
              className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500/20 outline-none font-bold text-slate-700" 
            />
            <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">CNPJ</label>
          <div className="relative">
            <input 
              value={formData.cnpj || ''} 
              onChange={(e) => handleInputChange('cnpj', e.target.value)}
              placeholder="00.000.000/0000-00"
              className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500/20 outline-none font-bold text-slate-700" 
            />
            <FileText className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          </div>
        </div>
      </div>

      {/* Checklist de Serviços de Transporte */}
      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-2 flex items-center gap-2">
          <Truck size={12} /> Especialidades em Transporte
        </label>
        <div className="flex flex-wrap gap-2">
          {transportServices.map((service) => {
            const isSelected = formData.transport_services?.includes(service);
            return (
              <button
                key={service}
                type="button"
                onClick={() => {
                  const current = formData.transport_services || [];
                  const next = isSelected ? current.filter((s: any) => s !== service) : [...current, service];
                  handleInputChange('transport_services', next);
                }}
                className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase transition-all ${
                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {service}
              </button>
            );
          })}
        </div>
      </div>

      {/* Checklist de Serviços de Logística */}
      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-2 flex items-center gap-2">
          <Boxes size={12} /> Logística e Armazenagem
        </label>
        <div className="flex flex-wrap gap-2">
          {logisticsServices.map((service) => {
            const isSelected = formData.logistics_services?.includes(service);
            return (
              <button
                key={service}
                type="button"
                onClick={() => {
                  const current = formData.logistics_services || [];
                  const next = isSelected ? current.filter((s: any) => s !== service) : [...current, service];
                  handleInputChange('logistics_services', next);
                }}
                className={`px-3 py-2 rounded-lg text-[9px] font-bold uppercase transition-all ${
                  isSelected ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {service}
              </button>
            );
          })}
        </div>
      </div>

      {/* Localização e Raio */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Cidade Base</label>
          <input 
            value={formData.city || ''} 
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500/20 outline-none font-bold text-slate-700" 
          />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Abrangência</label>
          <select 
            value={formData.coverage || 'nacional'} 
            onChange={(e) => handleInputChange('coverage', e.target.value)}
            className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500/20 outline-none font-bold text-slate-700 appearance-none"
          >
            <option value="nacional">Nacional</option>
            <option value="regional">Regional</option>
            <option value="estadual">Estadual</option>
          </select>
        </div>
      </div>

      {/* Alerta Visual de Notificações */}
      <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
          <ShieldCheck size={20} />
        </div>
        <p className="text-[9px] text-green-700 font-bold uppercase leading-tight">
          Suas cotações serão enviadas para o WhatsApp e Telegram cadastrados.
        </p>
      </div>

    </div>
  );
};

export default CompanyFields;