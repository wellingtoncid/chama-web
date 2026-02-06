import React from 'react';
import { 
  Target, 
  ExternalLink, 
  Tag, 
  Megaphone, 
  MapPin, 
  BarChart3 
} from 'lucide-react';

interface AdvertiserFieldsProps {
  formData: any;
  setFormData: (data: any) => void;
}

const AdvertiserFields = ({ formData, setFormData }: AdvertiserFieldsProps) => {
  
  const categories = [
    'Peças e Acessórios',
    'Seguros e Gerenciamento',
    'Combustível e Postos',
    'Manutenção e Oficinas',
    'Tecnologia Logística',
    'Pneus e Borracharia',
    'Serviços Financeiros',
    'Outros'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Categoria do Anunciante */}
      <div className="w-full">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-2">
          Segmento de Atuação
        </label>
        <div className="relative">
          <select 
            value={formData.advertiser_category || ''}
            onChange={(e) => handleInputChange('advertiser_category', e.target.value)}
            className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent focus:border-purple-500/20 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
          >
            <option value="">Selecione um segmento...</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <Tag className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />
        </div>
      </div>

      {/* Nome Fantasia / Marca */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="w-full">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-2">
            Nome da Marca/Empresa
          </label>
          <div className="relative">
            <input 
              type="text"
              value={formData.company_name || ''}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              placeholder="Ex: Pneus Online"
              className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent focus:border-purple-500/20 outline-none font-bold text-slate-700"
            />
            <Megaphone className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          </div>
        </div>

        <div className="w-full">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-2">
            CNPJ (Opcional)
          </label>
          <input 
            type="text"
            value={formData.cnpj || ''}
            onChange={(e) => handleInputChange('cnpj', e.target.value)}
            placeholder="00.000.000/0000-00"
            className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent focus:border-purple-500/20 outline-none font-bold text-slate-700"
          />
        </div>
      </div>

      {/* Link de Call to Action Principal */}
      <div className="w-full">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-2">
          Link de Redirecionamento (CTA)
        </label>
        <div className="relative">
          <input 
            type="text"
            value={formData.cta_link || ''}
            onChange={(e) => handleInputChange('cta_link', e.target.value)}
            placeholder="https://suapagina.com.br/promo"
            className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-2 border-transparent focus:border-purple-500/20 outline-none font-bold text-slate-700"
          />
          <ExternalLink className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
        </div>
        <p className="text-[9px] font-bold text-slate-400 mt-2 ml-2 uppercase">
          * Este é o link principal para onde seus anúncios apontarão por padrão.
        </p>
      </div>

      {/* Público Alvo */}
      <div className="bg-purple-50/50 p-6 rounded-[2rem] border border-purple-100/50">
        <div className="flex items-center gap-2 mb-4">
          <Target className="text-purple-600" size={18} />
          <h4 className="text-[10px] font-black uppercase text-purple-900 tracking-tighter">Foco de Público</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Motoristas', 'Transportadoras', 'Embarcadores'].map((target) => {
            const isSelected = formData.target_audience?.includes(target);
            return (
              <button
                key={target}
                type="button"
                onClick={() => {
                  const current = formData.target_audience || [];
                  const next = current.includes(target) 
                    ? current.filter((t: string) => t !== target)
                    : [...current, target];
                  setFormData({ ...formData, target_audience: next });
                }}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all ${
                  isSelected 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' 
                  : 'bg-white text-slate-400 border border-slate-100 hover:border-purple-200'
                }`}
              >
                {target}
              </button>
            );
          })}
        </div>
      </div>
      
    </div>
  );
};

export default AdvertiserFields;