import { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { 
  Plus, Edit3, Trash2, Star, X, Loader2, BadgeDollarSign, 
  CheckCircle2, Zap, Layout, ShieldCheck, Layers, List, LayoutGrid
} from 'lucide-react';

export default function PlansManager() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table'); // Padrão como tabela para facilitar gestão
  
  const [planData, setPlanData] = useState<any>({ 
    id: null, name: '', price: '', duration_days: '', type: 'featured', description: '', active: 1 
  });

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get('/manage-plans'); 
      const data = res.data.success === false ? [] : (res.data.plans || res.data);
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
      await api.post('/manage-plans', { ...planData, action: 'save' });
      setShowModal(false);
      loadPlans();
    } catch (e) { 
      alert("Erro ao salvar no banco."); 
    } finally { setSaving(false); }
  };
  
  const togglePlanStatus = async (plan: any) => {
    const newStatus = Number(plan.active) === 1 ? 0 : 1;
    if (!confirm(newStatus === 0 ? "Desativar este plano?" : "Reativar este plano?")) return;
    try {
      setLoading(true);
      await api.post('/manage-plans', { ...plan, active: newStatus, action: 'save' });
      loadPlans();
    } catch (e) {
      alert("Erro ao alterar status.");
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (type: string, size = 28) => {
    switch(type) {
      case 'sidebar': return <Layout size={size} className="text-slate-600"/>;
      case 'freight_list': return <Layers size={size} className="text-orange-400"/>;
      case 'urgent': return <Zap className="text-red-500" size={size}/>;
      case 'driver_verified': return <ShieldCheck className="text-blue-500" size={size}/>;
      case 'total': return <BadgeDollarSign className="text-emerald-500" size={size}/>;
      default: return <Star className="text-orange-500" size={size}/>;
    }
  };

  if (loading && plans.length === 0) return (
    <div className="p-20 text-center animate-pulse font-black uppercase italic text-slate-400">
      Sincronizando Banco de Dados...
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header com Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
            <BadgeDollarSign size={32} />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase italic leading-none">Gestão de Assinaturas</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase italic mt-1">
              {plans.length} Modelos configurados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
          <button 
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-orange-500' : 'text-slate-400'}`}
          >
            <List size={20}/>
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-orange-500' : 'text-slate-400'}`}
          >
            <LayoutGrid size={20}/>
          </button>
          <div className="w-[1px] h-6 bg-slate-200 mx-1" />
          <button 
            onClick={() => { 
              setPlanData({id: null, name: '', price: '', duration_days: '', type: 'featured', description: '', active: 1}); 
              setShowModal(true); 
            }}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] hover:bg-orange-500 transition-all flex items-center gap-2"
          >
            <Plus size={16}/> Novo Modelo
          </button>
        </div>
      </div>

      {/* Visualização em TABELA */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase italic text-slate-400">Tipo</th>
                <th className="px-4 py-5 text-[10px] font-black uppercase italic text-slate-400">Nome Comercial</th>
                <th className="px-4 py-5 text-[10px] font-black uppercase italic text-slate-400">Valor</th>
                <th className="px-4 py-5 text-[10px] font-black uppercase italic text-slate-400">Ciclo</th>
                <th className="px-4 py-5 text-[10px] font-black uppercase italic text-slate-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase italic text-slate-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {plans.map((plan) => (
                <tr key={plan.id} className={`hover:bg-slate-50/50 transition-colors ${Number(plan.active) !== 1 && 'opacity-60 grayscale'}`}>
                  <td className="px-8 py-4">{getPlanIcon(plan.type, 20)}</td>
                  <td className="px-4 py-4">
                    <div className="font-black uppercase italic text-sm text-slate-800">{plan.name}</div>
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{plan.type}</div>
                  </td>
                  <td className="px-4 py-4 font-black italic text-slate-900 text-lg">R$ {plan.price}</td>
                  <td className="px-4 py-4 text-[10px] font-black text-slate-500 uppercase italic">{plan.duration_days} Dias</td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase italic ${Number(plan.active) === 1 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                      {Number(plan.active) === 1 ? 'Ativo' : 'Pausado'}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setPlanData(plan); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={16}/></button>
                      <button onClick={() => togglePlanStatus(plan)} className={`p-2 rounded-lg transition-all ${Number(plan.active) === 1 ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'}`}>
                        {Number(plan.active) === 1 ? <Trash2 size={16}/> : <CheckCircle2 size={16}/>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Visualização em GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
          {plans.map((plan) => (
            <div key={plan.id} className={`bg-white p-8 rounded-[3rem] border-2 transition-all group relative ${Number(plan.active) === 1 ? 'border-slate-50 hover:border-orange-200' : 'border-dashed border-slate-200 opacity-60 grayscale'}`}>
              <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => { setPlanData(plan); setShowModal(true); }} className="p-2 bg-white shadow-xl rounded-lg text-blue-600 hover:bg-slate-900 hover:text-white transition-colors"><Edit3 size={14}/></button>
                <button onClick={() => togglePlanStatus(plan)} className={`p-2 bg-white shadow-xl rounded-lg transition-colors ${Number(plan.active) === 1 ? 'text-red-600 hover:bg-red-600 hover:text-white' : 'text-emerald-600 hover:bg-emerald-600 hover:text-white'}`}>
                  {Number(plan.active) === 1 ? <Trash2 size={14}/> : <CheckCircle2 size={14}/>}
                </button>
              </div>
              <div className="mb-6">{getPlanIcon(plan.type)}</div>
              <h4 className="font-black uppercase italic text-lg text-slate-800 leading-tight min-h-[3rem] flex items-center">{plan.name}</h4>
              <div className="mt-4 flex items-baseline gap-1">
                 <span className="text-3xl font-black italic tracking-tighter text-slate-900">R$ {plan.price}</span>
                 <span className="text-[10px] font-black text-slate-400 uppercase italic">/ {plan.duration_days} dias</span>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-50">
                 <p className="text-[10px] text-slate-400 font-bold uppercase italic line-clamp-2 mb-4 h-8">{plan.description || 'Sem descrição'}</p>
                 <div className="flex items-center justify-between italic font-black text-[9px] uppercase">
                    <span className={Number(plan.active) === 1 ? 'text-emerald-500' : 'text-slate-400'}>{Number(plan.active) === 1 ? '• Ativo agora' : '• Pausado'}</span>
                    <span className="bg-slate-100 px-2 py-1 rounded text-slate-500">{plan.type}</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal - Igual ao anterior */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black uppercase italic">{planData.id ? 'Editar' : 'Novo'} Plano</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X/></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-black uppercase ml-2 text-slate-400">Título</label>
                <input value={planData.name} onChange={e => setPlanData({...planData, name: e.target.value})} className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold mt-1 outline-none focus:ring-2 ring-orange-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-black uppercase ml-2 text-slate-400">Preço</label>
                  <input type="number" value={planData.price} onChange={e => setPlanData({...planData, price: e.target.value})} className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold mt-1 outline-none" />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase ml-2 text-slate-400">Dias</label>
                  <input type="number" value={planData.duration_days} onChange={e => setPlanData({...planData, duration_days: e.target.value})} className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold mt-1 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase ml-2 text-slate-400">Tipo/Local</label>
                <select value={planData.type} onChange={e => setPlanData({...planData, type: e.target.value})} className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold mt-1 outline-none appearance-none cursor-pointer">
                  <option value="featured">Destaque Simples</option>
                  <option value="urgent">Urgente (Topo)</option>
                  <option value="sidebar">Sidebar (Bronze)</option>
                  <option value="freight_list">Lista de Fretes (Prata)</option>
                  <option value="total">Exposição Total (Ouro)</option>
                  <option value="driver_verified">Selo Motorista</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase ml-2 text-slate-400">Descrição</label>
                <textarea value={planData.description} onChange={e => setPlanData({...planData, description: e.target.value})} className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold mt-1 h-20 resize-none outline-none" />
              </div>
              <button onClick={handleSavePlan} disabled={saving} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase mt-4 hover:bg-orange-500 transition-all flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={18}/> : 'Sincronizar Banco'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}