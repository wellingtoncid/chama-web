import { Truck, Info, MapPin, Wrench, Award } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const DriverFields = ({ formData, setFormData }: any) => {
  const { vehicleTypes, bodyTypes, equipmentTypes, certificationTypes } = useSiteSettings();
  
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: string, value: string) => {
    const current = formData[field] || [];
    const updated = current.includes(value)
      ? current.filter((v: string) => v !== value)
      : [...current, value];
    handleInputChange(field, updated);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <Info size={12} className="text-orange-500" />
        Complete seu perfil para ser encontrado por empresas.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Truck size={12} /> Tipo de Veículo
          </label>
          <select
            value={formData.vehicle_type || ''}
            onChange={(e) => handleInputChange('vehicle_type', e.target.value)}
            className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold outline-none appearance-none focus:ring-2 ring-orange-500/20"
          >
            <option value="">Selecione...</option>
            {vehicleTypes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Carroceria</label>
          <select
            value={formData.body_type || ''}
            onChange={(e) => handleInputChange('body_type', e.target.value)}
            className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold outline-none appearance-none focus:ring-2 ring-orange-500/20"
          >
            <option value="">Selecione...</option>
            {bodyTypes.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Equipamentos */}
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Wrench size={12} /> Equipamentos do Veículo
        </label>
        <div className="flex flex-wrap gap-2">
          {equipmentTypes.map((eq) => (
            <button
              key={eq}
              type="button"
              onClick={() => toggleArrayField('available_equipment', eq)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                (formData.available_equipment || []).includes(eq)
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900'
              }`}
            >
              {eq}
            </button>
          ))}
        </div>
      </div>

      {/* Certificações */}
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Award size={12} /> Certificações
        </label>
        <div className="flex flex-wrap gap-2">
          {certificationTypes.map((cert) => (
            <button
              key={cert}
              type="button"
              onClick={() => toggleArrayField('certifications', cert)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                (formData.certifications || []).includes(cert)
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-purple-100 dark:hover:bg-purple-900'
              }`}
            >
              {cert}
            </button>
          ))}
        </div>
      </div>

      {/* Localização */}
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <MapPin size={12} /> Localização (CEP)
        </label>
        <input
          type="text"
          value={formData.home_cep || ''}
          onChange={(e) => handleInputChange('home_cep', e.target.value)}
          placeholder="00000-000"
          className="w-full md:w-64 p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold outline-none focus:ring-2 ring-orange-500/20"
        />
        <p className="text-[10px] text-slate-400">
          Informe seu CEP para definir sua região de atuação
        </p>
      </div>
    </div>
  );
};

export default DriverFields;
