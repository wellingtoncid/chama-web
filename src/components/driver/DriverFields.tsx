import React from 'react';

const DriverFields = ({ formData, setFormData }: any) => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Placa do Veículo</label>
        <input 
          value={formData.plate || ''} 
          onChange={(e) => setFormData({...formData, plate: e.target.value.toUpperCase()})}
          placeholder="AAA-0000"
          className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 border-2 border-transparent focus:border-orange-500/20" 
        />
      </div>
      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">RNTRC (ANTT)</label>
        <input 
          value={formData.antt || ''} 
          onChange={(e) => setFormData({...formData, antt: e.target.value})}
          placeholder="Nº Registro"
          className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 border-2 border-transparent focus:border-orange-500/20" 
        />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Tipo de Veículo</label>
        <select 
          value={formData.vehicle_type || ''} 
          onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
          className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 border-2 border-transparent focus:border-orange-500/20 appearance-none"
        >
          <option value="">Selecione...</option>
          <option value="Fiorino">Fiorino / Van</option>
          <option value="3/4">Caminhão 3/4</option>
          <option value="VLC">VLC</option>
          <option value="Toco">Caminhão Toco</option>
          <option value="Truck">Caminhão Truck</option>
          <option value="Carreta">Carreta</option>
          <option value="Bitrem">Bitrem</option>
        </select>
      </div>
      <div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Experiência (Anos)</label>
        <input 
          type="number"
          value={formData.anos_experiencia || ''} 
          onChange={(e) => setFormData({...formData, anos_experiencia: e.target.value})}
          placeholder="Ex: 5"
          className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 border-2 border-transparent focus:border-orange-500/20" 
        />
      </div>
    </div>
    <div>
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2">Tipo de Carroceria</label>
      <input 
        value={formData.body_type || ''} 
        onChange={(e) => setFormData({...formData, body_type: e.target.value})}
        placeholder="Ex: Baú, Sider, Grade Baixa..."
        className="w-full p-5 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700 border-2 border-transparent focus:border-orange-500/20" 
      />
    </div>
  </div>
);

export default DriverFields;