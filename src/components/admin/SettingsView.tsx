import { useState, useEffect } from 'react';
import { api } from '../../api';
import { 
  Settings, Save, Clock, ShieldAlert, CheckCircle2,
  Loader2, Star, Image, Trash2, Plus, X, DollarSign, Edit3
} from 'lucide-react';

interface Plan {
  id: number | null;
  name: string;
  price: string | number;
  duration_days: string | number;
  type: string;
  description?: string;
}

export default function SettingsView() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [config, setConfig] = useState({
    maintenance_mode: false,
    auto_approve_users: true,
    freight_expiration_days: "7"
  });

  const initialPlanState: Plan = { 
    id: null, 
    name: '', 
    price: '', 
    duration_days: '', 
    type: 'featured', 
    description: '' 
  };

  const [planData, setPlanData] = useState<Plan>(initialPlanState);

  const loadAll = async () => {
    try {
      setLoading(true);
      const res = await api.get('', { params: { endpoint: 'get-settings' } });
      if (res.data) {
        // Mapeia os valores vindo como string "1"/"0" para booleanos do Checkbox
        if (res.data.settings) {
          setConfig({
            maintenance_mode: res.data.settings.maintenance_mode === "1",
            auto_approve_users: res.data.settings.auto_approve_users === "1",
            freight_expiration_days: res.data.settings.freight_expiration_days || "7"
          });
        }
        if (res.data.plans) setPlans(res.data.plans);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      // O backend agora trata a conversão de bool para 1/0
      await api.post('', config, { params: { endpoint: 'update-settings' } });
      alert("Configurações globais salvas com sucesso!");
    } catch (e) {
      alert("Erro ao salvar configurações");
    } finally { setSaving(false); }
  };

  const handleOpenModal = (plan: any = null) => {
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
    if (!id || !confirm("Deseja realmente remover este plano? Ele não aparecerá mais para novos usuários.")) return;
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

  if (loading && plans.length === 0) return (
    <div className="flex flex-col items-center p-20">
      <Loader2 className="animate-spin text-orange-500" size={40} />
      <p className="font-black mt-4 italic uppercase text-[10px]">Sincronizando Banco de Dados...</p>
    </div>
  );

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-500 pb-32">
      
      {/* SEÇÃO 1: REGRAS GLOBAIS */}
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
        </div>
      </div>

      {/* SEÇÃO 2: GESTÃO DE PLANOS */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-lg font-black uppercase italic flex items-center gap-2">
            <DollarSign size={20} className="text-blue-500"/> Planos de Cobrança
          </h3>
          <button 
            onClick={() => handleOpenModal()} 
            className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] hover:bg-orange-500 transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus size={14}/> Adicionar Plano
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div key={plan.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative group transition-all hover:border-orange-200">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => handleOpenModal(plan)} className="p-2 bg-white rounded-lg text-blue-500 shadow-sm hover:bg-blue-50" title="Editar"><Edit3 size={14}/></button>
                <button onClick={() => handleDeletePlan(plan.id)} className="p-2 bg-white rounded-lg text-red-500 shadow-sm hover:bg-red-50" title="Excluir"><Trash2 size={14}/></button>
              </div>
              
              <div className="mb-4 text-orange-500">
                {plan.type === 'featured' ? <Star fill="currentColor" size={24}/> : <Image size={24}/>}
              </div>
              <p className="font-black uppercase italic text-sm text-slate-800 leading-none">{plan.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{plan.duration_days} dias de validade</p>
              <p className="text-2xl font-black mt-4 text-slate-900">R$ {plan.price}</p>
              {plan.description && <p className="text-[9px] text-slate-400 mt-2 italic line-clamp-2">{plan.description}</p>}
            </div>
          ))}
          {plans.length === 0 && (
            <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-400 uppercase text-[10px] font-bold">
              Nenhum plano ativo encontrado.
            </div>
          )}
        </div>
      </div>

      {/* SEÇÃO 3: SEGURANÇA / MANUTENÇÃO */}
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

      {/* BOTÃO FLUTUANTE DE SALVAR TUDO */}
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