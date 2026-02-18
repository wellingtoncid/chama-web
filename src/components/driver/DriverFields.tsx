import React from 'react';
import { Truck, Hash, Calendar, Box, ShieldCheck, IdCard } from 'lucide-react';

const DriverFields = ({ formData, setFormData }: any) => {
  
  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  // Classe padrão para os inputs para evitar repetição
  const inputClass = "w-full p-5 bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] border-2 border-transparent focus:border-orange-500/20 dark:focus:border-orange-500/40 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Placa e ANTT */}
      <div className="grid grid-cols-2 gap-4">
        <div className="w-full">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block ml-2">
            Placa do Veículo
          </label>
          <div className="relative">
            <input 
              value={formData.plate || ''} 
              onChange={(e) => handleInputChange('plate', e.target.value.toUpperCase())}
              placeholder="AAA-0000"
              maxLength={8}
              className={inputClass} 
            />
            <Hash className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
          </div>
        </div>

        <div className="w-full">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block ml-2">
            RNTRC / ANTT
          </label>
          <div className="relative">
            <input 
              value={formData.antt || ''} 
              onChange={(e) => handleInputChange('antt', e.target.value)}
              placeholder="Nº Registro"
              className={inputClass} 
            />
            <ShieldCheck className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
          </div>
        </div>
      </div>

      {/* Tipo de Veículo e CNH */}
      <div className="grid grid-cols-2 gap-4">
        <div className="w-full">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block ml-2">
            Tipo de Veículo
          </label>
          <div className="relative">
            <select 
              value={formData.vehicle_type || ''} 
              onChange={(e) => handleInputChange('vehicle_type', e.target.value)}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="">Selecione...</option>
              <option value="Fiorino">Fiorino / Van</option>
              <option value="3/4">Caminhão 3/4</option>
              <option value="VLC">VLC</option>
              <option value="Toco">Caminhão Toco</option>
              <option value="Truck">Caminhão Truck</option>
              <option value="Carreta">Carreta</option>
              <option value="Bitrem">Bitrem</option>
              <option value="Rodotrem">Rodotrem</option>
            </select>
            <Truck className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 pointer-events-none" size={18} />
          </div>
        </div>

        <div className="w-full">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block ml-2">
            Categoria CNH
          </label>
          <div className="relative">
            <select 
              value={formData.cnh_category || ''} 
              onChange={(e) => handleInputChange('cnh_category', e.target.value)}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="">Selecione...</option>
              <option value="A">Categoria A</option>
              <option value="B">Categoria B</option>
              <option value="C">Categoria C</option>
              <option value="D">Categoria D</option>
              <option value="E">Categoria E</option>
            </select>
            <IdCard className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 pointer-events-none" size={18} />
          </div>
        </div>
      </div>

      {/* Carroceria e Experiência */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 w-full">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block ml-2">
            Tipo de Carroceria
          </label>
          <div className="relative">
            <input 
              value={formData.body_type || ''} 
              onChange={(e) => handleInputChange('body_type', e.target.value)}
              placeholder="Baú, Sider, Grade Baixa..."
              className={inputClass} 
            />
            <Box className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
          </div>
        </div>

        <div className="w-full">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 block ml-2">
            Anos Exp.
          </label>
          <div className="relative">
            <input 
              type="number"
              value={formData.anos_experiencia || ''} 
              onChange={(e) => handleInputChange('anos_experiencia', e.target.value)}
              placeholder="Ex: 5"
              className={inputClass} 
            />
            <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
          </div>
        </div>
      </div>

      {/* Status de Disponibilidade */}
      <div className="bg-orange-50/50 dark:bg-orange-500/5 p-6 rounded-[2rem] border border-orange-100/50 dark:border-orange-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <h4 className="text-[10px] font-black uppercase text-orange-900 dark:text-orange-400 tracking-widest">Disponibilidade Imediata</h4>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={formData.is_available === 1 || formData.is_available === true}
              onChange={(e) => handleInputChange('is_available', e.target.checked ? 1 : 0)}
            />
            {/* Toggle Switch com cores Dark Mode */}
            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default DriverFields;