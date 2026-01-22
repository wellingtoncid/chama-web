import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  Plus, Edit3, Trash2, Star, X, Loader2, BadgeDollarSign, 
  CheckCircle2, Zap, Layout, ShieldCheck, Layers
} from 'lucide-react';

export default function PlansManager() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  const [planData, setPlanData] = useState<any>({ 
    id: null, name: '', price: '', duration_days: '', type: 'featured', description: '', active: 1 
  });

  const loadPlans = async () => {
    try {
      setLoading(true);
      // Chamada simplificada para o endpoint que liberamos no index.php
      const res = await api.get('/manage-plans'); 
      
      // O AdminController retorna { success: true, plans: [...] } através do getSettings
      const data = res.data.plans || res.data;
      setPlans(Array.isArray(data) ? data : []);
      
    } catch (e) {
      console.error("Erro ao carregar planos:", e);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadPlans(); }, []);

  const handleSavePlan = async () => {
    if(!planData.name || !planData.price) return alert("Preencha Nome e Preço");
    try {
      setSaving(true);
      // Envia os dados para o endpoint unificado
      await api.post('/manage-plans', { ...planData, action: 'save' });
      setShowModal(false);
      loadPlans();
    } catch (e) { 
      alert("Erro ao salvar"); 
    } finally { setSaving(false); }
  };
  
  const togglePlanStatus = async (plan: any) => {
    const newStatus = plan.active == 1 ? 0 : 1;
    const msg = newStatus === 0 
      ? "Desativar este plano? Ele ficará oculto para novos clientes." 
      : "Reativar este plano?";
    
    if (!confirm(msg)) return;

    try {
      setLoading(true);
      // CORREÇÃO: Agora envia para /manage-plans seguindo o padrão do AdminController
      await api.post('/manage-plans', { 
        ...plan,
        active: newStatus, 
        action: 'save' 
      });
      loadPlans();
    } catch (e) {
      alert("Erro ao alterar status");
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (type: string) => {
    switch(type) {
      case 'sidebar': return <Layout size={28}/>;
      case 'freight_list': return <Layers size={28}/>;
      case 'urgent': return <Zap className="text-red-500" size={28}/>;
      case 'driver_verified': return <ShieldCheck className="text-blue-500" size={28}/>;
      case 'total': return <BadgeDollarSign className="text-emerald-500" size={28}/>;
      default: return <Star className="text-orange-500" size={28}/>;
    }
  };

  if (loading && plans.length === 0) return (
    <div className="p-20 text-center animate-pulse font-black uppercase italic text-slate-400">
      Sincronizando Banco de Dados...
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
            <BadgeDollarSign className="text-orange-500" /> Planos do Sistema
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase italic">
            {plans.length} modelos de negócio configurados
          </p>
        </div>
        <button 
          onClick={() => { 
            setPlanData({id: null, name: '', price: '', duration_days: '', type: 'featured', description: '', active: 1}); 
            setShowModal(true); 
          }}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] hover:bg-orange-500 transition-all flex items-center gap-2 shadow-lg shadow-slate-200"
        >
          <Plus size={16}/> Criar Novo Modelo
        </button>
      </div>

      {/* Grid de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`bg-white p-8 rounded-[3rem] border-2 transition-all group relative ${plan.active == 1 ? 'border-slate-50 hover:border-orange-200' : 'border-dashed border-slate-200 opacity-60 grayscale'}`}>
            
            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={() => { setPlanData(plan); setShowModal(true); }} 
                className="p-2 bg-white shadow-xl rounded-lg text-blue-600 hover:bg-slate-900 hover:text-white transition-colors"
                title="Editar plano"
              >
                <Edit3 size={14}/>
              </button>
              <button 
                onClick={() => togglePlanStatus(plan)}
                className={`p-2 bg-white shadow-xl rounded-lg transition-colors ${plan.active == 1 ? 'text-red-600 hover:bg-red-600 hover:text-white' : 'text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}
                title={plan.active == 1 ? "Desativar" : "Reativar"}
              >
                {plan.active == 1 ? <Trash2 size={14}/> : <CheckCircle2 size={14}/>}
              </button>
            </div>
            
            <div className="mb-6">{getPlanIcon(plan.type)}</div>

            <h4 className="font-black uppercase italic text-lg text-slate-800 leading-none min-h-[2.5rem] flex items-center">
              {plan.name}
            </h4>
            
            <div className="mt-4 flex items-baseline gap-1">
               <span className="text-3xl font-black italic tracking-tighter text-slate-900">R$ {plan.price}</span>
               <span className="text-[10px] font-black text-slate-400 uppercase italic">/ {plan.duration_days} dias</span>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-50">
               <p className="text-[10px] text-slate-400 font-bold uppercase italic line-clamp-2 mb-4 h-8">
                 {plan.description || 'Sem descrição definida'}
               </p>
               <div className="flex items-center justify-between">
                 <div className={`flex items-center gap-2 text-[9px] font-black uppercase ${plan.active == 1 ? 'text-emerald-500' : 'text-slate-400'}`}>
                    <CheckCircle2 size={12}/> {plan.active == 1 ? 'Ativo' : 'Inativo'}
                 </div>
                 <span className="text-[8px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-500 uppercase italic">
                   TIPO: {plan.type}
                 </span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Edição/Criação */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black uppercase italic">{planData.id ? 'Editar' : 'Novo'} Plano</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X/></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase ml-2 text-slate-400">Título Comercial</label>
                <input 
                  value={planData.name} 
                  onChange={e => setPlanData({...planData, name: e.target.value})} 
                  className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold mt-1 focus:ring-2 ring-orange-500 outline-none" 
                  placeholder="Ex: Ouro Trimestral"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase ml-2 text-slate-400">Preço (R$)</label>
                  <input 
                    type="number" 
                    value={planData.price} 
                    onChange={e => setPlanData({...planData, price: e.target.value})} 
                    className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold mt-1 outline-none" 
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase ml-2 text-slate-400">Validade (Dias)</label>
                  <input 
                    type="number" 
                    value={planData.duration_days} 
                    onChange={e => setPlanData({...planData, duration_days: e.target.value})} 
                    className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold mt-1 outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase ml-2 text-slate-400">Tipo de Plano</label>
                <select 
                  value={planData.type} 
                  onChange={e => setPlanData({...planData, type: e.target.value})}
                  className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold mt-1 appearance-none outline-none cursor-pointer"
                >
                  <option value="featured">Destaque Frete (Simples)</option>
                  <option value="urgent">Urgente (Topo + Selo)</option>
                  <option value="sidebar">Barra Lateral (Bronze)</option>
                  <option value="freight_list">Entre Fretes (Prata)</option>
                  <option value="total">Exposição Total (Ouro)</option>
                  <option value="combo">Combo (Urgente+Destaque)</option>
                  <option value="driver_verified">Verificação de Motorista</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase ml-2 text-slate-400">Descrição</label>
                <textarea 
                  value={planData.description} 
                  onChange={e => setPlanData({...planData, description: e.target.value})}
                  className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold mt-1 h-20 resize-none outline-none"
                  placeholder="Vantagens deste plano..."
                />
              </div>

              <button 
                onClick={handleSavePlan} 
                disabled={saving} 
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase mt-4 hover:bg-orange-500 transition-all flex items-center justify-center gap-2 shadow-xl"
              >
                {saving ? <Loader2 className="animate-spin" size={18}/> : 'Gravar no Banco'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}