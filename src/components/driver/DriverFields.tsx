import { Truck, Info } from 'lucide-react';
import { VEHICLE_TYPES, BODY_TYPES } from '../../constants/freightOptions';

const DriverFields = ({ formData, setFormData }: any) => {
  const handleInputChange = (field: string, value: any) => setFormData({ ...formData, [field]: value });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <Info size={12} className="text-orange-500" />
        A descrição completa fica no campo Apresentação abaixo.
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
            {VEHICLE_TYPES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Implemento</label>
          <select
            value={formData.body_type || ''}
            onChange={(e) => handleInputChange('body_type', e.target.value)}
            className="w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold outline-none appearance-none focus:ring-2 ring-orange-500/20"
          >
            <option value="">Selecione...</option>
            {BODY_TYPES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between p-6 bg-emerald-50 dark:bg-emerald-500/5 rounded-[2rem] border border-emerald-100 dark:border-emerald-500/20">
        <span className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-400">
          Disponibilidade
        </span>
        <button
          type="button"
          onClick={() => handleInputChange('is_available', formData.is_available === 1 ? 0 : 1)}
          className={`w-14 h-8 rounded-full p-1 transition-all ${
            formData.is_available === 1 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
          }`}
        >
          <div
            className={`w-6 h-6 bg-white rounded-full shadow transition-transform ${
              formData.is_available === 1 ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default DriverFields;
