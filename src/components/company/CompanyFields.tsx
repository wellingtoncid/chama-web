import React from 'react';
import {
  Building2,
  Truck,
  Warehouse,
  PackageSearch,
  Briefcase,
  Anchor,
  Globe,
  Mail,
  Info,
} from 'lucide-react';

const COMPANY_TYPES = [
  { id: 'transportadora', label: 'Transportadora', desc: 'Frotas e fretes' },
  { id: 'operador_logistico', label: 'Operador Logístico', desc: '3PL, armazenagem' },
  { id: 'armazem', label: 'Armazém / CD', desc: 'Estocagem' },
  { id: 'agente_cargas', label: 'Agente de Cargas', desc: 'Freight forwarder' },
  { id: 'embarcador', label: 'Embarcador', desc: 'Posta cargas' },
  { id: 'outros', label: 'Outros', desc: 'Demais segmentos' },
];

const CompanyFields = ({ formData, setFormData }: any) => {
  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const getIcon = (id: string) => {
    const icons: Record<string, React.ReactNode> = {
      transportadora: <Truck size={20} />,
      operador_logistico: <PackageSearch size={20} />,
      armazem: <Warehouse size={20} />,
      agente_cargas: <Anchor size={20} />,
      embarcador: <Briefcase size={20} />,
      outros: <Building2 size={20} />,
    };
    return icons[id] || <Building2 size={20} />;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <Info size={12} className="text-blue-500" />
        A apresentação completa fica no campo Apresentação abaixo.
      </p>

      {/* Tipo de Empresa */}
      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Tipo de Empresa
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {COMPANY_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleInputChange('business_type', t.id)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                formData.business_type === t.id
                  ? 'border-blue-600 bg-blue-600 text-white shadow-lg'
                  : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-500 hover:border-blue-200 dark:hover:border-blue-900'
              }`}
            >
              <span
                className={
                  formData.business_type === t.id ? 'text-blue-100' : 'text-slate-300 dark:text-slate-600'
                }
              >
                {getIcon(t.id)}
              </span>
              <div>
                <p className="text-[10px] font-black uppercase">{t.label}</p>
                <p
                  className={`text-[9px] font-bold ${
                    formData.business_type === t.id ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {t.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Campos Genéricos */}
      <div className="grid md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Globe size={12} /> Site
          </label>
          <input
            value={formData.website || formData.website_url || ''}
            onChange={(e) => {
              handleInputChange('website', e.target.value);
              handleInputChange('website_url', e.target.value);
            }}
            placeholder="www.empresa.com.br"
            className="w-full p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Mail size={12} /> E-mail Comercial
          </label>
          <input
            value={formData.commercial_email || ''}
            onChange={(e) => handleInputChange('commercial_email', e.target.value)}
            placeholder="comercial@empresa.com"
            className="w-full p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-slate-100 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyFields;
