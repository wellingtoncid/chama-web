import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import {
  Settings, Save, Clock, ShieldAlert, CheckCircle2,
  Loader2, Star, Image, Trash2, Plus, X, DollarSign, Edit3,
  Building2, Users, Truck, ShoppingCart, Megaphone, MessageSquare,
  CreditCard, Gift, Globe, Eye, EyeOff, Package, Award, Wrench, GripVertical, AlertCircle, ShieldCheck
} from 'lucide-react';

interface Plan {
  id: number | null;
  name: string;
  price: string | number;
  duration_days: string | number;
  type: string;
  description?: string;
}

type TabId = 'general' | 'lists' | 'modules' | 'registration' | 'finance' | 'payments' | 'referral' | 'plans' | 'system' | 'moderation' | 'smtp';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'general', label: 'Geral', icon: <Globe size={16} /> },
  { id: 'lists', label: 'Listas', icon: <Package size={16} /> },
  { id: 'modules', label: 'Módulos', icon: <Settings size={16} /> },
  { id: 'registration', label: 'Cadastro', icon: <Users size={16} /> },
  { id: 'finance', label: 'Financeiro', icon: <DollarSign size={16} /> },
  { id: 'payments', label: 'Pagamentos', icon: <CreditCard size={16} /> },
  { id: 'referral', label: 'Indicações', icon: <Gift size={16} /> },
  { id: 'plans', label: 'Planos', icon: <Star size={16} /> },
  { id: 'system', label: 'Sistema', icon: <ShieldAlert size={16} /> },
  { id: 'moderation', label: 'Moderação', icon: <ShieldCheck size={16} /> },
  { id: 'smtp', label: 'Email SMTP', icon: <MessageSquare size={16} /> },
];

const initialPlanState: Plan = {
  id: null,
  name: '',
  price: '',
  duration_days: '',
  type: 'featured',
  description: ''
};

export default function SettingsView() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showPaymentSecrets, setShowPaymentSecrets] = useState(false);
  
  const [plans, setPlans] = useState<Plan[]>([]);
  
  const [config, setConfig] = useState({
    // Geral
    site_name: 'Chama Frete',
    site_email: '',
    site_phone: '',
    site_whatsapp: '',
    site_logo: '/logo.png',
    site_favicon: '/favicon.ico',
    // Módulos
    module_freights: true,
    module_quotes: true,
    module_marketplace: true,
    module_groups: true,
    module_ads: true,
    // Cadastro
    auto_approve_users: true,
    freight_expiration_days: '7',
    // Financeiro
    commission_percent: '0',
    min_withdraw: '50',
    // Pagamentos
    mp_client_id: '',
    mp_client_secret: '',
    mp_access_token: '',
    // Indicações
    referral_enabled: true,
    referral_commission: '10',
    // Planos
    default_plan: '1',
    freight_free_limit: '3',
    // Sistema
    maintenance_mode: false,
    // Moderação
    review_auto_approve_high_rating: true,
    review_auto_approve_threshold: '4',
    review_auto_reject_bad_words: true,
    report_auto_dismiss_duplicate: true,
    // SMTP
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',
    smtp_from_email: '',
    smtp_from_name: 'Chama Frete',
  });

  const [planData, setPlanData] = useState<Plan>(initialPlanState);
  
  const [listSettings, setListSettings] = useState({
    vehicle_types: [] as string[],
    body_types: [] as string[],
    equipment_types: [] as string[],
    certification_types: [] as string[],
  });
  const [editingList, setEditingList] = useState<string | null>(null);
  const [listInput, setListInput] = useState('');
  const [editingItem, setEditingItem] = useState<{ key: string; index: number; value: string } | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<{ key: string; index: number } | null>(null);

  const loadAll = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin-settings');
      if (res.data?.success && res.data?.data) {
        const settings = res.data.data;
        setConfig(prev => ({
          ...prev,
          site_name: settings.site_name || 'Chama Frete',
          site_email: settings.site_email || '',
          site_phone: settings.site_phone || '',
          site_whatsapp: settings.site_whatsapp || '',
          site_logo: settings.site_logo || '/logo.png',
          site_favicon: settings.site_favicon || '/favicon.ico',
          module_freights: settings.module_freights === '1' || settings.module_freights === true,
          module_quotes: settings.module_quotes === '1' || settings.module_quotes === true,
          module_marketplace: settings.module_marketplace === '1' || settings.module_marketplace === true,
          module_groups: settings.module_groups === '1' || settings.module_groups === true,
          module_ads: settings.module_ads === '1' || settings.module_ads === true,
          auto_approve_users: settings.auto_approve_users === '1' || settings.auto_approve_users === true,
          freight_expiration_days: settings.freight_expiration_days || '7',
          commission_percent: settings.commission_percent || '0',
          min_withdraw: settings.min_withdraw || '50',
          mp_client_id: settings.mp_client_id || '',
          mp_client_secret: settings.mp_client_secret || '',
          mp_access_token: settings.mp_access_token || '',
          referral_enabled: settings.referral_enabled === '1' || settings.referral_enabled === true,
          referral_commission: settings.referral_commission || '10',
          default_plan: settings.default_plan || '1',
          freight_free_limit: settings.freight_free_limit || '3',
          maintenance_mode: settings.maintenance_mode === '1' || settings.maintenance_mode === true,
          // Moderação
          review_auto_approve_high_rating: settings.review_auto_approve_high_rating === 'true' || settings.review_auto_approve_high_rating === '1' || settings.review_auto_approve_high_rating === true,
          review_auto_approve_threshold: settings.review_auto_approve_threshold || '4',
          review_auto_reject_bad_words: settings.review_auto_reject_bad_words === 'true' || settings.review_auto_reject_bad_words === '1' || settings.review_auto_reject_bad_words === true,
          report_auto_dismiss_duplicate: settings.report_auto_dismiss_duplicate === 'true' || settings.report_auto_dismiss_duplicate === '1' || settings.report_auto_dismiss_duplicate === true,
        }));
      }
      if (res.data?.plans) {
        setPlans(res.data.plans);
      }
      if (res.data?.data?.vehicle_types) {
        setListSettings(prev => ({ ...prev, vehicle_types: JSON.parse(res.data.data.vehicle_types) }));
      }
      if (res.data?.data?.body_types) {
        setListSettings(prev => ({ ...prev, body_types: JSON.parse(res.data.data.body_types) }));
      }
      if (res.data?.data?.equipment_types) {
        setListSettings(prev => ({ ...prev, equipment_types: JSON.parse(res.data.data.equipment_types) }));
      }
      if (res.data?.data?.certification_types) {
        setListSettings(prev => ({ ...prev, certification_types: JSON.parse(res.data.data.certification_types) }));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
};
  
  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, key: string, index: number) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ key, index }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, key: string, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex({ key, index });
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetKey: string, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { key, index } = data;

      if (key !== targetKey || index === targetIndex) return;

      const currentList = [...listSettings[key as keyof typeof listSettings]];
      const [removed] = currentList.splice(index, 1);
      currentList.splice(targetIndex, 0, removed);

      setListSettings({ ...listSettings, [key]: currentList });
    } catch (err) {
      console.error('Erro ao mover item:', err);
    }
  };

  const handleDragEnd = () => {
    setDragOverIndex(null);
  };

  useEffect(() => { loadAll(); }, []);

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      const allConfig = {
        ...config,
        vehicle_types: JSON.stringify(listSettings.vehicle_types),
        body_types: JSON.stringify(listSettings.body_types),
        equipment_types: JSON.stringify(listSettings.equipment_types),
        certification_types: JSON.stringify(listSettings.certification_types),
      };
      await api.post('/admin-settings', allConfig);
      alert("Configurações salvas com sucesso!");
    } catch (e) {
      alert("Erro ao salvar configurações");
    } finally { setSaving(false); }
  };

  const handleOpenModal = (plan: Plan | null = null) => {
    if (plan) {
      setPlanData({ ...plan });
    } else {
      setPlanData(initialPlanState);
    }
    setShowPlanModal(true);
  };

  const handleSavePlan = async () => {
    if(!planData.name || !planData.price) return alert("Nome e Preço são obrigatórios");
    try {
      setSaving(true);
      await api.post('', { ...planData, action: 'save' }, { params: { endpoint: 'manage-plans' } });
      setShowPlanModal(false);
      await loadAll();
    } catch (e) { 
      alert("Erro ao processar plano"); 
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (id: number | null) => {
    if (!id || !confirm("Deseja realmente remover este plano?")) return;
    try {
      setLoading(true);
      await api.post('', { id, action: 'delete' }, { params: { endpoint: 'manage-plans' } });
      await loadAll();
    } catch (e) { 
      alert("Erro ao excluir"); 
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nome do Site</label>
                <input
                  type="text"
                  value={config.site_name}
                  onChange={e => setConfig({...config, site_name: e.target.value})}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email de Contato</label>
                <input
                  type="email"
                  value={config.site_email}
                  onChange={e => setConfig({...config, site_email: e.target.value})}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Telefone</label>
                <input
                  type="text"
                  value={config.site_phone}
                  onChange={e => setConfig({...config, site_phone: e.target.value})}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">WhatsApp (com DDI)</label>
                <input
                  type="text"
                  value={config.site_whatsapp}
                  onChange={e => setConfig({...config, site_whatsapp: e.target.value})}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                  placeholder="+5500000000000"
                />
              </div>
            </div>
          </div>
        );

      case 'lists':
        return (
          <div className="space-y-6">
            {[
              { key: 'vehicle_types', label: 'Tipos de Veículos', icon: <Truck size={20} />, list: listSettings.vehicle_types },
              { key: 'body_types', label: 'Tipos de Carroceria', icon: <Package size={20} />, list: listSettings.body_types },
              { key: 'equipment_types', label: 'Equipamentos', icon: <Wrench size={20} />, list: listSettings.equipment_types },
              { key: 'certification_types', label: 'Certificações', icon: <Award size={20} />, list: listSettings.certification_types },
            ].map((category) => (
              <div key={category.key} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">{category.icon}</div>
                  <h3 className="font-black uppercase italic">{category.label}</h3>
                </div>
                
                {editingList === category.key ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={listInput}
                        onChange={(e) => setListInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && listInput.trim()) {
                            const currentList = listSettings[category.key as keyof typeof listSettings];
                            if (!currentList.includes(listInput.trim())) {
                              setListSettings({ ...listSettings, [category.key]: [...currentList, listInput.trim()] });
                            }
                            setListInput('');
                          }
                        }}
                        placeholder="Digite um item e pressione Enter"
                        className="flex-1 p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm"
                      />
                      <button
                        onClick={() => {
                          if (listInput.trim()) {
                            const currentList = listSettings[category.key as keyof typeof listSettings];
                            if (!currentList.includes(listInput.trim())) {
                              setListSettings({ ...listSettings, [category.key]: [...currentList, listInput.trim()] });
                            }
                            setListInput('');
                          }
                        }}
                        className="px-4 py-2 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                      <GripVertical size={12} /> Arraste os itens para reordenar
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {category.list.map((item, idx) => (
                        <span 
                          key={idx} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, category.key, idx)}
                          onDragOver={(e) => handleDragOver(e, category.key, idx)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, category.key, idx)}
                          onDragEnd={handleDragEnd}
                          className={`flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg text-sm cursor-grab active:cursor-grabbing transition-all ${
                            dragOverIndex?.key === category.key && dragOverIndex?.index === idx 
                              ? 'ring-2 ring-orange-400 bg-orange-50' 
                              : 'hover:bg-slate-200'
                          }`}
                        >
                          <GripVertical size={14} className="text-slate-400" />
                          
                          {/* Modo de edição inline */}
                          {editingItem?.key === category.key && editingItem?.index === idx ? (
                            <>
                              <input
                                type="text"
                                value={editingItem.value}
                                onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const newList = [...category.list];
                                    newList[idx] = editingItem.value.trim();
                                    setListSettings({ ...listSettings, [category.key]: newList });
                                    setEditingItem(null);
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingItem(null);
                                  }
                                }}
                                onBlur={() => {
                                  const newList = [...category.list];
                                  newList[idx] = editingItem.value.trim();
                                  setListSettings({ ...listSettings, [category.key]: newList });
                                  setEditingItem(null);
                                }}
                                autoFocus
                                className="px-2 py-1 bg-white rounded border border-orange-300 text-sm font-medium w-32"
                              />
                              <button
                                onClick={() => {
                                  const newList = [...category.list];
                                  newList[idx] = editingItem.value.trim();
                                  setListSettings({ ...listSettings, [category.key]: newList });
                                  setEditingItem(null);
                                }}
                                className="text-green-500 hover:text-green-700"
                              >
                                <CheckCircle2 size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="cursor-pointer hover:text-orange-600" onClick={() => setEditingItem({ key: category.key, index: idx, value: item })}>
                                {item}
                              </span>
                              <button
                                onClick={() => setEditingItem({ key: category.key, index: idx, value: item })}
                                className="text-blue-400 hover:text-blue-600 ml-1"
                                title="Editar"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                onClick={() => {
                                  const newList = category.list.filter((_, i) => i !== idx);
                                  setListSettings({ ...listSettings, [category.key]: newList });
                                }}
                                className="text-red-500 hover:text-red-700 ml-1"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => { setEditingList(null); setListInput(''); }}
                      className="w-full py-2 bg-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-300"
                    >
                      Concluir
                    </button>
                  </div>
                ) : (
                  <div>
                    {category.list.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {category.list.map((item, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm">{item}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 italic mb-4">Nenhum item cadastrado</p>
                    )}
                    <button
                      onClick={() => setEditingList(category.key)}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 flex items-center gap-2"
                    >
                      <Edit3 size={14} /> Editar Lista
                    </button>
                  </div>
                )}
              </div>
            ))}
            {listSettings.vehicle_types.length > 0 && listSettings.body_types.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-bold">As listas estão sincronizadas!</p>
                  <p className="text-blue-600">Motoristas e empresas verão essas opções ao cadastrar fretes ou perfis.</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'modules':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: 'module_freights', label: 'Fretes', desc: 'Sistema de fretes e cargas', icon: <Truck size={20} /> },
              { key: 'module_quotes', label: 'Cotações', desc: 'Solicitações de orçamento', icon: <ShoppingCart size={20} /> },
              { key: 'module_marketplace', label: 'Marketplace', desc: 'Loja virtual de produtos', icon: <Building2 size={20} /> },
              { key: 'module_groups', label: 'Comunidades', desc: 'Grupos e fóruns', icon: <Users size={20} /> },
              { key: 'module_ads', label: 'Publicidade', desc: 'Planos e anúncios', icon: <Megaphone size={20} /> },
            ].map((mod) => (
              <div key={mod.key} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-xl text-orange-500 shadow-sm">{mod.icon}</div>
                  <div>
                    <p className="font-black uppercase italic text-sm">{mod.label}</p>
                    <p className="text-[10px] text-slate-400">{mod.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => setConfig({...config, [mod.key]: !config[mod.key as keyof typeof config]})}
                  className={`w-14 h-8 rounded-full transition-all flex items-center ${config[mod.key as keyof typeof config] ? 'bg-orange-500 justify-end' : 'bg-slate-200 justify-start'}`}
                >
                  <div className="w-6 h-6 bg-white rounded-full shadow mx-1" />
                </button>
              </div>
            ))}
          </div>
        );

      case 'registration':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2">
                <Clock size={20} className="text-orange-500"/> Expiração
              </h3>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dias para remover frete antigo</label>
              <input 
                type="number" 
                value={config.freight_expiration_days}
                onChange={e => setConfig({...config, freight_expiration_days: e.target.value})}
                className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-lg mt-2 focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-500"/> Cadastro
              </h3>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="text-xs font-black uppercase italic">Aprovar Usuários Automaticamente</span>
                <input 
                  type="checkbox" 
                  checked={config.auto_approve_users}
                  onChange={e => setConfig({...config, auto_approve_users: e.target.checked})}
                  className="w-6 h-6 accent-orange-500 cursor-pointer"
                />
              </div>
              <div className="mt-4">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Limite Fretes Grátis/Mês</label>
                <input 
                  type="number" 
                  value={config.freight_free_limit}
                  onChange={e => setConfig({...config, freight_free_limit: e.target.value})}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                />
              </div>
            </div>
          </div>
        );

      case 'finance':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2">
                <DollarSign size={20} className="text-blue-500"/> Comissão
              </h3>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Percentual de Comissão (%)</label>
              <input 
                type="number" 
                value={config.commission_percent}
                onChange={e => setConfig({...config, commission_percent: e.target.value})}
                className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-lg mt-2"
                step="0.1"
              />
              <p className="text-[10px] text-slate-400 mt-2">Comissão sobre cada frete concretizado</p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2">
                <DollarSign size={20} className="text-emerald-500"/> Saque
              </h3>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Valor Mínimo para Saque (R$)</label>
              <input 
                type="number" 
                value={config.min_withdraw}
                onChange={e => setConfig({...config, min_withdraw: e.target.value})}
                className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-lg mt-2"
              />
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2">
              <CreditCard size={20} className="text-blue-500"/> Mercado Pago
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Client ID</label>
                <input 
                  type="text" 
                  value={config.mp_client_id}
                  onChange={e => setConfig({...config, mp_client_id: e.target.value})}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Client Secret</label>
                <div className="relative">
                  <input 
                    type={showPaymentSecrets ? "text" : "password"} 
                    value={config.mp_client_secret}
                    onChange={e => setConfig({...config, mp_client_secret: e.target.value})}
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPaymentSecrets(!showPaymentSecrets)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPaymentSecrets ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Access Token</label>
                <input 
                  type={showPaymentSecrets ? "text" : "password"} 
                  value={config.mp_access_token}
                  onChange={e => setConfig({...config, mp_access_token: e.target.value})}
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                />
              </div>
            </div>
          </div>
        );

      case 'referral':
        return (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2">
              <Gift size={20} className="text-purple-500"/> Programa de Indicações
            </h3>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl mb-6">
              <div>
                <p className="text-xs font-black uppercase italic">Ativar Indicações</p>
                <p className="text-[10px] text-slate-400">Permitir que usuários indiquem novos cadastros</p>
              </div>
              <button
                onClick={() => setConfig({...config, referral_enabled: !config.referral_enabled})}
                className={`w-14 h-8 rounded-full transition-all flex items-center ${config.referral_enabled ? 'bg-orange-500 justify-end' : 'bg-slate-200 justify-start'}`}
              >
                <div className="w-6 h-6 bg-white rounded-full shadow mx-1" />
              </button>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Comissão do Indicação (%)</label>
              <input 
                type="number" 
                value={config.referral_commission}
                onChange={e => setConfig({...config, referral_commission: e.target.value})}
                className="w-full p-4 bg-slate-50 rounded-2xl border-none font-black text-lg mt-2"
                disabled={!config.referral_enabled}
              />
              <p className="text-[10px] text-slate-400 mt-2">Percentual que o indicador recebe</p>
            </div>
          </div>
        );

      case 'plans':
        return (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2">
              <Star size={20} className="text-orange-500"/> Plano Padrão
            </h3>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Selecione o Plano Padrão</label>
              <select 
                value={config.default_plan}
                onChange={e => setConfig({...config, default_plan: e.target.value})}
                className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2 appearance-none cursor-pointer"
              >
                <option value="1">Free - Básico</option>
                <option value="2">Silver - Intermediário</option>
                <option value="3">Gold - Premium</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-2">Plano atribuído automaticamente a novos usuários</p>
            </div>
          </div>
        );

      case 'system':
        return (
          <div className={`p-8 rounded-[2.5rem] transition-all border ${config.maintenance_mode ? 'bg-red-600 border-red-700' : 'bg-red-50 border-red-100'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ShieldAlert size={32} className={config.maintenance_mode ? 'text-white' : 'text-red-600'} />
                <div>
                  <p className={`font-black uppercase italic ${config.maintenance_mode ? 'text-white' : 'text-red-600'}`}>Modo de Manutenção</p>
                  <p className={`text-[10px] font-bold uppercase ${config.maintenance_mode ? 'text-white/70' : 'text-red-400'}`}>Ao ativar, apenas administradores acessam o App.</p>
                </div>
              </div>
              <button 
                onClick={() => setConfig({...config, maintenance_mode: !config.maintenance_mode})}
                className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl transition-all ${config.maintenance_mode ? 'bg-white text-red-600' : 'bg-red-600 text-white'}`}
              >
                {config.maintenance_mode ? 'Desativar Manutenção' : 'Ativar Manutenção'}
              </button>
            </div>
          </div>
        );

      case 'moderation':
        return (
          <div className="space-y-6">
            {/* Reviews Automations */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2">
                <Star size={20} className="text-amber-500"/> Automação de Avaliações
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-slate-900">Auto-aprovar reviews 4+ estrelas</p>
                    <p className="text-xs text-slate-500 mt-1">Reviews com nota 4 ou 5 são publicados automaticamente</p>
                  </div>
                  <button
                    onClick={() => setConfig({...config, review_auto_approve_high_rating: !config.review_auto_approve_high_rating})}
                    className={`relative w-14 h-8 rounded-full transition-colors ${config.review_auto_approve_high_rating ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${config.review_auto_approve_high_rating ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div>
                    <p className="font-bold text-slate-900">Rejeitar conteúdo bloqueado</p>
                    <p className="text-xs text-slate-500 mt-1">Bloquear reviews com palavras ofensivas, spam ou links excessivos</p>
                  </div>
                  <button
                    onClick={() => setConfig({...config, review_auto_reject_bad_words: !config.review_auto_reject_bad_words})}
                    className={`relative w-14 h-8 rounded-full transition-colors ${config.review_auto_reject_bad_words ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${config.review_auto_reject_bad_words ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2">Threshold mínimo para auto-aprovar</label>
                  <select
                    value={config.review_auto_approve_threshold}
                    onChange={e => setConfig({...config, review_auto_approve_threshold: e.target.value})}
                    className="w-full p-4 bg-white rounded-2xl border border-slate-200 font-bold"
                  >
                    <option value="4">4 estrelas ou mais</option>
                    <option value="5">Apenas 5 estrelas</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-2">Define a nota mínima para auto-aprovação quando ativado acima</p>
                </div>
              </div>
            </div>

            {/* Reports Automations */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2">
                <ShieldCheck size={20} className="text-blue-500"/> Automação de Denúncias
              </h3>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p className="font-bold text-slate-900">Auto-descartar denúncias duplicadas</p>
                  <p className="text-xs text-slate-500 mt-1">Ignorar automaticamente se o mesmo usuário denunciar o mesmo conteúdo novamente</p>
                </div>
                <button
                  onClick={() => setConfig({...config, report_auto_dismiss_duplicate: !config.report_auto_dismiss_duplicate})}
                  className={`relative w-14 h-8 rounded-full transition-colors ${config.report_auto_dismiss_duplicate ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${config.report_auto_dismiss_duplicate ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800">Sobre automação</p>
                  <p className="text-xs text-amber-700 mt-1">
                    As automações ajudam a reduzir a carga de moderação manual. Reviews e denúncias ainda podem ser revisados manualmente no painel de administração.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'smtp':
        return (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black uppercase italic mb-6 flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-500"/> Configurações de Email (SMTP)
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Configure o servidor SMTP para envio de emails transacionais (recuperação de senha, notificações, etc.)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Servidor SMTP</label>
                <input 
                  type="text" 
                  value={config.smtp_host}
                  onChange={e => setConfig({...config, smtp_host: e.target.value})}
                  placeholder="smtp.gmail.com"
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Porta</label>
                <input 
                  type="text" 
                  value={config.smtp_port}
                  onChange={e => setConfig({...config, smtp_port: e.target.value})}
                  placeholder="587"
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Usuário (Email)</label>
                <input 
                  type="email" 
                  value={config.smtp_user}
                  onChange={e => setConfig({...config, smtp_user: e.target.value})}
                  placeholder="seu@email.com"
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Senha</label>
                <div className="relative">
                  <input 
                    type={showPaymentSecrets ? "text" : "password"} 
                    value={config.smtp_pass}
                    onChange={e => setConfig({...config, smtp_pass: e.target.value})}
                    placeholder="Senha ou App Password"
                    className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPaymentSecrets(!showPaymentSecrets)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPaymentSecrets ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email Remetente</label>
                <input 
                  type="email" 
                  value={config.smtp_from_email}
                  onChange={e => setConfig({...config, smtp_from_email: e.target.value})}
                  placeholder="noreply@chamafrete.com.br"
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nome do Remetente</label>
                <input 
                  type="text" 
                  value={config.smtp_from_name}
                  onChange={e => setConfig({...config, smtp_from_name: e.target.value})}
                  placeholder="Chama Frete"
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold mt-2"
                />
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-800 font-medium">
                <strong>Dica:</strong> Para Gmail, use uma "App Password" em vez da senha normal. 
                Gere em: Google Account → Security → 2-Step Verification → App Passwords
              </p>
            </div>
          </div>
        );
    }
  };

  if (loading && plans.length === 0) return (
    <div className="flex flex-col items-center p-20">
      <Loader2 className="animate-spin text-orange-500" size={40} />
      <p className="font-black mt-4 italic uppercase text-[10px]">Sincronizando Banco de Dados...</p>
    </div>
  );

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-500 pb-32">
      {/* TABS */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-black uppercase text-[10px] whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
                : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {renderTabContent()}

      {/* BOTÃO FLUTUANTE */}
      <div className="fixed bottom-10 right-10 z-[100]">
        <button 
          onClick={handleSaveConfig} 
          disabled={saving} 
          className="bg-slate-900 text-white px-10 py-6 rounded-full font-black uppercase text-xs tracking-widest shadow-2xl hover:bg-orange-600 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin"/> : <Save/>} 
          {saving ? 'Gravando...' : 'Salvar Alterações'}
        </button>
      </div>

      {/* MODAL DE PLANOS */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black uppercase italic">{planData.id ? 'Editar Plano' : 'Novo Plano'}</h3>
              <button onClick={() => setShowPlanModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase ml-2 text-slate-400">Nome do Plano</label>
                <input 
                  value={planData.name}
                  onChange={e => setPlanData({...planData, name: e.target.value})}
                  className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold mt-1" 
                  placeholder="Ex: Destaque Premium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase ml-2 text-slate-400">Preço (R$)</label>
                  <input 
                    type="number"
                    value={planData.price}
                    onChange={e => setPlanData({...planData, price: e.target.value})}
                    className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold mt-1" 
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase ml-2 text-slate-400">Duração (Dias)</label>
                  <input 
                    type="number"
                    value={planData.duration_days}
                    onChange={e => setPlanData({...planData, duration_days: e.target.value})}
                    className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold mt-1" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase ml-2 text-slate-400">Tipo de Destaque</label>
                <select 
                  className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold mt-1 appearance-none cursor-pointer"
                  value={planData.type}
                  onChange={e => setPlanData({...planData, type: e.target.value})}
                >
                  <option value="featured">Destaque de Carga (Listagem)</option>
                  <option value="banner">Banner Publicitário</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase ml-2 text-slate-400">Breve Descrição</label>
                <textarea 
                  value={planData.description}
                  onChange={e => setPlanData({...planData, description: e.target.value})}
                  className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold mt-1 h-20 resize-none"
                  placeholder="O que este plano oferece?"
                />
              </div>

              <button 
                onClick={handleSavePlan} 
                disabled={saving}
                className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black uppercase mt-4 hover:bg-orange-600 transition-all flex justify-center items-center gap-2 shadow-lg shadow-orange-200"
              >
                {saving ? <Loader2 className="animate-spin" size={18}/> : (planData.id ? 'Atualizar Plano' : 'Criar Plano Agora')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
