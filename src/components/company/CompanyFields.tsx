  import React from 'react';
  import { 
    Building2, ShieldCheck, Warehouse, Truck, PackageSearch, 
    Globe2, Briefcase, ShieldAlert, ThermometerSnowflake, 
    Container, Layers, Boxes, FileCheck, CheckCircle2,
    Anchor, Plane, HardHat, Zap, MapPinned, Info,
    Navigation, Award, Scale, Microscope, ShoppingCart
  } from 'lucide-react';

  const CompanyFields = ({ formData, setFormData }: any) => {
    
    const handleInputChange = (field: string, value: any) => {
      setFormData({ ...formData, [field]: value });
    };

    const toggleSelection = (field: string, value: string) => {
      const current = formData[field] || [];
      const next = current.includes(value) 
        ? current.filter((item: string) => item !== value)
        : [...current, value];
      handleInputChange(field, next);
    };

    // 1. Tipologias de Negócio - O que a empresa É no ecossistema
    const businessTypes = [
      { id: 'transportadora', label: 'Transportadora', icon: <Truck size={22} />, desc: 'Frotas e Fretes' },
      { id: 'operador_logistico', label: 'Operador Logístico', icon: <PackageSearch size={22} />, desc: 'Gestão 3PL' },
      { id: 'armazem', label: 'Armazém / CD', icon: <Warehouse size={22} />, desc: 'Estocagem' },
      { id: 'agente_cargas', label: 'Agente de Cargas', icon: <Anchor size={22} />, desc: 'Freight Forwarder' },
      { id: 'gerenciadora_risco', label: 'G.R. / Monitoramento', icon: <ShieldAlert size={22} />, desc: 'Segurança' },
      { id: 'cooperativa', label: 'Cooperativa', icon: <Briefcase size={22} />, desc: 'União de Frotas' },
    ];

    // 2. Verticais de Mercado - Onde ela domina
    const verticals = [
      { id: 'geral', label: 'Carga Geral', icon: <Boxes size={14} /> },
      { id: 'frio', label: 'Cadeia do Frio', icon: <ThermometerSnowflake size={14} /> },
      { id: 'quimico', label: 'Químicos (Hazmat)', icon: <HardHat size={14} /> },
      { id: 'farma', label: 'Saúde / Farma', icon: <Microscope size={14} /> },
      { id: 'agro', label: 'Agronegócio', icon: <Navigation size={14} /> },
      { id: 'ecommerce', label: 'E-commerce / Last Mile', icon: <ShoppingCart size={14} /> },
      { id: 'indivisivel', label: 'Excedentes / Projetos', icon: <Scale size={14} /> },
      { id: 'container', label: 'Portuário / Container', icon: <Container size={14} /> },
    ];

    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
        
        {/* HEADER DA SEÇÃO */}
        <div className="flex flex-col gap-2 border-l-4 border-blue-600 pl-6 py-2">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-800">Perfil Corporativo</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Configure sua vitrine para atrair grandes embarcadores</p>
        </div>

        {/* 1. SELEÇÃO DE CATEGORIA MASTER (UX DE ALTO NÍVEL) */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {businessTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleInputChange('business_type', type.id)}
              className={`relative p-6 rounded-[2rem] border-2 text-left transition-all overflow-hidden group ${
                formData.business_type === type.id 
                ? 'border-blue-600 bg-blue-600 text-white shadow-2xl shadow-blue-200' 
                : 'border-slate-100 bg-white text-slate-400 hover:border-blue-200'
              }`}
            >
              <div className={`mb-4 transition-transform group-hover:scale-110 ${formData.business_type === type.id ? 'text-blue-100' : 'text-slate-200'}`}>
                {type.icon}
              </div>
              <div className="relative z-10">
                <p className="text-[11px] font-black uppercase tracking-tighter">{type.label}</p>
                <p className={`text-[9px] font-bold uppercase opacity-60 ${formData.business_type === type.id ? 'text-white' : 'text-slate-400'}`}>
                  {type.desc}
                </p>
              </div>
              {formData.business_type === type.id && (
                <CheckCircle2 className="absolute top-6 right-6 text-blue-200" size={24} />
              )}
            </button>
          ))}
        </div>

        {/* 2. INFOS CADASTRAIS + LOCALIZAÇÃO */}
        <div className="bg-slate-50 p-10 rounded-[3.5rem] border border-slate-100 grid md:grid-cols-2 gap-8">
            <Input label="Nome Fantasia" value={formData.name_fantasy} onChange={(v:any) => handleInputChange('name_fantasy', v)} />
            <Input label="CNPJ" value={formData.cnpj} onChange={(v:any) => handleInputChange('cnpj', v)} />
            
            {/* ADICIONE ESTES PARA BATER COM O BACKEND */}
            <Input label="CEP" value={formData.postal_code} onChange={(v:any) => handleInputChange('postal_code', v)} placeholder="00000-000" />
            <Input label="Logradouro" value={formData.address} onChange={(v:any) => handleInputChange('address', v)} placeholder="Rua, Av..." />
            
            <Input label="Site Institucional" value={formData.website_url} onChange={(v:any) => handleInputChange('website_url', v)} />
            <Input label="E-mail Comercial" value={formData.commercial_email} onChange={(v:any) => handleInputChange('commercial_email', v)} />
        </div>

        {/* 3. VERTICAIS DE EXPERTISE (MULTI-SELECT) */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-200 flex-1" />
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Especialidades de Atendimento</h4>
            <div className="h-px bg-slate-200 flex-1" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {verticals.map((v) => {
              const isSelected = (formData.specialties || []).includes(v.id);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => toggleSelection('specialties', v.id)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    isSelected 
                    ? 'bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200' 
                    : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  <span className={isSelected ? 'text-blue-400' : 'text-slate-300'}>{v.icon}</span>
                  <span className="text-[9px] font-black uppercase">{v.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. COMPLIANCE E CERTIFICAÇÕES (O QUE DÁ O PREÇO) */}
        <div className="bg-emerald-50/40 p-10 rounded-[3.5rem] border border-emerald-100/50">
          <div className="flex items-center gap-3 mb-8">
            <Award className="text-emerald-600" size={24} />
            <h4 className="text-sm font-black uppercase italic text-emerald-900 tracking-tighter">Compliance e Certificações Técnicas</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {['ANVISA (Saúde)', 'ANVISA (Alimentos)', 'SASSMAQ', 'ISO 9001', 'ISO 14001', 'OEA', 'ANTT Regular'].map(cert => (
              <button
                key={cert}
                type="button"
                onClick={() => toggleSelection('certifications', cert)}
                className={`group flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase transition-all ${
                  (formData.certifications || []).includes(cert)
                  ? 'bg-emerald-600 text-white shadow-lg' 
                  : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                <FileCheck size={14} className={ (formData.certifications || []).includes(cert) ? 'text-emerald-200' : 'text-emerald-400' } />
                {cert}
              </button>
            ))}
          </div>
        </div>

        {/* 5. COBERTURA GEOGRÁFICA (VISÃO ESTRATÉGICA) */}
        <div className="bg-slate-900 p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPinned className="text-blue-400" size={24} />
                <h4 className="font-black uppercase italic tracking-tighter">Raio de Operação</h4>
              </div>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest leading-relaxed">
                Defina sua abrangência para que o sistema direcione as cotações corretas para seu time comercial.
              </p>
              <select 
                value={formData.coverage_area || 'nacional'} 
                onChange={(e) => handleInputChange('coverage_area', e.target.value)}
                className="w-full p-5 bg-slate-800 rounded-2xl border border-slate-700 text-white font-black text-xs outline-none focus:ring-2 ring-blue-500/50 appearance-none"
              >
                <option value="nacional">Brasil (Nacional)</option>
                <option value="regional">Regional (Sul/Sudeste/etc)</option>
                <option value="estadual">Foco Estadual</option>
                <option value="internacional">Internacional (Mercosul)</option>
              </select>
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Cidades / Rotas Estratégicas</label>
              <textarea 
                rows={3}
                placeholder="Ex: Saídas diárias de SP para todo o Nordeste..."
                value={formData.specific_regions || ''}
                onChange={(e) => handleInputChange('specific_regions', e.target.value)}
                className="w-full p-5 bg-slate-800 rounded-3xl border border-slate-700 text-white font-bold text-xs outline-none focus:ring-2 ring-blue-500/50 resize-none placeholder:text-slate-600"
              />
            </div>
          </div>
          {/* Elemento Visual de fundo */}
          <Globe2 size={200} className="absolute -right-20 -bottom-20 text-slate-800 opacity-20 pointer-events-none" />
        </div>

      </div>
    );
  };

  // Subcomponente de Input (Consistência Visual)
  const Input = ({ label, value, onChange, placeholder }: any) => (
    <div className="w-full group">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block ml-2 group-focus-within:text-blue-600 transition-colors">{label}</label>
      <input 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-5 bg-white rounded-3xl border-2 border-slate-100 focus:border-blue-600 outline-none font-bold text-slate-700 text-sm transition-all shadow-sm group-hover:border-slate-200" 
      />
    </div>
  );

  export default CompanyFields;